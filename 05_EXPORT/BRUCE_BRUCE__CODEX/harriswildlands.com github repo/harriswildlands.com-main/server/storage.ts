import { db } from "./db";
import {
  logs, ideas, teachingRequests, harrisContent, settings, goals, checkins, driftFlags, transcripts, apiTokens,
  type InsertLog, type InsertIdea, type InsertTeachingRequest, type InsertHarrisContent,
  type InsertGoal, type InsertCheckin, type InsertTranscript,
  type Log, type Idea, type TeachingRequest, type HarrisContent, type Setting,
  type Goal, type Checkin, type DriftFlag, type Transcript, type TranscriptPatterns, type TranscriptScorecard,
  type ApiToken,
  featureRequests, type InsertFeatureRequest, type FeatureRequest
} from "@shared/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  // Logs (user-scoped)
  getLogs(userId: string): Promise<Log[]>;
  createLog(userId: string, log: InsertLog): Promise<Log>;
  getLogByDate(userId: string, date: string): Promise<Log | undefined>;
  updateLog(userId: string, id: number, updates: InsertLog): Promise<Log | undefined>;
  updateLogSummary(userId: string, id: number, summary: string): Promise<Log>;

  // Ideas (user-scoped)
  getIdeas(userId: string): Promise<Idea[]>;
  getIdea(userId: string, id: number): Promise<Idea | undefined>;
  createIdea(userId: string, idea: InsertIdea): Promise<Idea>;
  updateIdea(userId: string, id: number, updates: Partial<Idea>): Promise<Idea>;

  // Teaching (user-scoped)
  getTeachingRequests(userId: string): Promise<TeachingRequest[]>;
  getTeachingRequest(userId: string, id: number): Promise<TeachingRequest | undefined>;
  createTeachingRequest(userId: string, req: InsertTeachingRequest, output: any): Promise<TeachingRequest>;

  // Harris (user-scoped)
  getHarrisContent(userId: string): Promise<HarrisContent[]>;
  createHarrisContent(userId: string, content: InsertHarrisContent, generatedCopy: any): Promise<HarrisContent>;

  // Settings (global for now)
  getSettings(): Promise<Setting[]>;
  updateSetting(key: string, value: string): Promise<Setting>;

  // Dashboard (user-scoped)
  getDashboardStats(userId: string): Promise<{ logsToday: number; openLoops: number }>;

  // Goals (user-scoped)
  getGoals(userId: string): Promise<Goal[]>;
  getGoal(userId: string, id: number): Promise<Goal | undefined>;
  createGoal(userId: string, goal: InsertGoal): Promise<Goal>;
  updateGoal(userId: string, id: number, updates: Partial<Goal>): Promise<Goal>;

  // Checkins (user-scoped)
  getCheckins(userId: string, startDate?: string, endDate?: string): Promise<Checkin[]>;
  getCheckinsByGoal(userId: string, goalId: number): Promise<Checkin[]>;
  createCheckin(userId: string, checkin: InsertCheckin): Promise<Checkin>;
  upsertCheckin(userId: string, goalId: number, date: string, done: boolean, score?: number, note?: string): Promise<Checkin>;

  // Weekly review
  getWeeklyReview(userId: string): Promise<{ goals: Goal[]; checkins: Checkin[]; stats: any; driftFlags: string[] }>;

  // Transcripts (user-scoped)
  getTranscripts(userId: string): Promise<Transcript[]>;
  getTranscript(userId: string, id: number): Promise<Transcript | undefined>;
  createTranscript(userId: string, transcript: InsertTranscript): Promise<Transcript>;
  updateTranscript(userId: string, id: number, updates: Partial<Transcript>): Promise<Transcript>;
  deleteTranscript(userId: string, id: number): Promise<boolean>;
  getTranscriptStats(userId: string): Promise<{ total: number; analyzed: number; totalWords: number; topThemes: any[] }>;

  // API Tokens (for MCP / Claude Desktop)
  createApiToken(userId: string, name?: string): Promise<string>;
  getApiTokens(userId: string): Promise<ApiToken[]>;
  validateApiToken(token: string): Promise<string | null>;
  revokeApiToken(userId: string, tokenId: number): Promise<boolean>;

  // Feature Factory (Content-to-Code)
  createFeatureRequest(userId: string, request: InsertFeatureRequest): Promise<FeatureRequest>;
  getFeatureRequests(userId: string): Promise<FeatureRequest[]>;
  updateFeatureRequest(userId: string, id: number, updates: Partial<FeatureRequest>): Promise<FeatureRequest>;
}

export class DatabaseStorage implements IStorage {
  // -------------------- LOGS (USER-SCOPED) --------------------

  async getLogs(userId: string): Promise<Log[]> {
    return await db.select().from(logs)
      .where(eq(logs.userId, userId))
      .orderBy(desc(logs.date));
  }

  async createLog(userId: string, log: InsertLog): Promise<Log> {
    const [newLog] = await db.insert(logs).values({ ...log, userId }).returning();
    return newLog;
  }

  async getLogByDate(userId: string, date: string): Promise<Log | undefined> {
    const [log] = await db.select().from(logs)
      .where(and(eq(logs.userId, userId), eq(logs.date, date)));
    return log;
  }

  async updateLog(userId: string, id: number, updates: InsertLog): Promise<Log | undefined> {
    const [updated] = await db.update(logs)
      .set(updates)
      .where(and(eq(logs.id, id), eq(logs.userId, userId)))
      .returning();
    return updated;
  }

  async updateLogSummary(userId: string, id: number, summary: string): Promise<Log> {
    const [updated] = await db.update(logs)
      .set({ aiSummary: summary })
      .where(and(eq(logs.id, id), eq(logs.userId, userId)))
      .returning();
    return updated;
  }

  // -------------------- IDEAS (USER-SCOPED) --------------------

  async getIdeas(userId: string): Promise<Idea[]> {
    return await db.select().from(ideas)
      .where(eq(ideas.userId, userId))
      .orderBy(desc(ideas.createdAt));
  }

  async getIdea(userId: string, id: number): Promise<Idea | undefined> {
    const [idea] = await db.select().from(ideas)
      .where(and(eq(ideas.id, id), eq(ideas.userId, userId)));
    return idea;
  }

  async createIdea(userId: string, idea: InsertIdea): Promise<Idea> {
    const [newIdea] = await db.insert(ideas).values({ ...idea, userId }).returning();
    return newIdea;
  }

  async updateIdea(userId: string, id: number, updates: Partial<Idea>): Promise<Idea> {
    // Defensive: strip userId from updates to prevent ownership change
    const { userId: _, ...safeUpdates } = updates as any;
    const [updated] = await db.update(ideas)
      .set(safeUpdates)
      .where(and(eq(ideas.id, id), eq(ideas.userId, userId)))
      .returning();
    return updated;
  }

  // -------------------- TEACHING (USER-SCOPED) --------------------

  async getTeachingRequests(userId: string): Promise<TeachingRequest[]> {
    return await db.select().from(teachingRequests)
      .where(eq(teachingRequests.userId, userId))
      .orderBy(desc(teachingRequests.createdAt));
  }

  async getTeachingRequest(userId: string, id: number): Promise<TeachingRequest | undefined> {
    const [req] = await db.select().from(teachingRequests)
      .where(and(eq(teachingRequests.id, id), eq(teachingRequests.userId, userId)));
    return req;
  }

  async createTeachingRequest(userId: string, req: InsertTeachingRequest, output: any): Promise<TeachingRequest> {
    const [newReq] = await db.insert(teachingRequests)
      .values({ ...req, userId, output })
      .returning();
    return newReq;
  }

  // -------------------- HARRIS (USER-SCOPED) --------------------

  async getHarrisContent(userId: string): Promise<HarrisContent[]> {
    return await db.select().from(harrisContent)
      .where(eq(harrisContent.userId, userId))
      .orderBy(desc(harrisContent.createdAt));
  }

  async createHarrisContent(userId: string, content: InsertHarrisContent, generatedCopy: any): Promise<HarrisContent> {
    const [newContent] = await db.insert(harrisContent)
      .values({ ...content, userId, generatedCopy })
      .returning();
    return newContent;
  }

  // -------------------- SETTINGS --------------------

  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  async updateSetting(key: string, value: string): Promise<Setting> {
    const [updated] = await db.insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value }
      })
      .returning();
    return updated;
  }

  // -------------------- DASHBOARD (USER-SCOPED) --------------------

  async getDashboardStats(userId: string): Promise<{ logsToday: number; openLoops: number }> {
    const today = new Date().toISOString().split('T')[0];

    const logsToday = await db.select({ count: sql<number>`count(*)` })
      .from(logs)
      .where(and(eq(logs.userId, userId), eq(logs.date, today)));

    const loops = await db.select({ count: sql<number>`count(*)` })
      .from(ideas)
      .where(and(eq(ideas.userId, userId), eq(ideas.status, 'draft')));

    return {
      logsToday: Number(logsToday[0]?.count || 0),
      openLoops: Number(loops[0]?.count || 0),
    };
  }

  // -------------------- GOALS (USER-SCOPED) --------------------

  async getGoals(userId: string): Promise<Goal[]> {
    return await db.select().from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }

  async getGoal(userId: string, id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)));
    return goal;
  }

  async createGoal(userId: string, goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values({ ...goal, userId }).returning();
    return newGoal;
  }

  async updateGoal(userId: string, id: number, updates: Partial<Goal>): Promise<Goal> {
    const { userId: _, ...safeUpdates } = updates as any;
    const [updated] = await db.update(goals)
      .set(safeUpdates)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();
    return updated;
  }

  // -------------------- CHECKINS (USER-SCOPED) --------------------

  async getCheckins(userId: string, startDate?: string, endDate?: string): Promise<Checkin[]> {
    let query = db.select().from(checkins).where(eq(checkins.userId, userId));
    if (startDate && endDate) {
      query = db.select().from(checkins)
        .where(and(
          eq(checkins.userId, userId),
          gte(checkins.date, startDate),
          lte(checkins.date, endDate)
        ));
    }
    return await query.orderBy(desc(checkins.date));
  }

  async getCheckinsByGoal(userId: string, goalId: number): Promise<Checkin[]> {
    return await db.select().from(checkins)
      .where(and(eq(checkins.userId, userId), eq(checkins.goalId, goalId)))
      .orderBy(desc(checkins.date));
  }

  async createCheckin(userId: string, checkin: InsertCheckin): Promise<Checkin> {
    const [newCheckin] = await db.insert(checkins).values({ ...checkin, userId }).returning();
    return newCheckin;
  }

  async upsertCheckin(userId: string, goalId: number, date: string, done: boolean, score?: number, note?: string): Promise<Checkin> {
    const existing = await db.select().from(checkins)
      .where(and(eq(checkins.userId, userId), eq(checkins.goalId, goalId), eq(checkins.date, date)));

    if (existing.length > 0) {
      const [updated] = await db.update(checkins)
        .set({ done, score, note })
        .where(and(eq(checkins.userId, userId), eq(checkins.goalId, goalId), eq(checkins.date, date)))
        .returning();
      return updated;
    } else {
      const [newCheckin] = await db.insert(checkins)
        .values({ goalId, userId, date, done, score, note })
        .returning();
      return newCheckin;
    }
  }

  // -------------------- WEEKLY REVIEW --------------------

  async getWeeklyReview(userId: string): Promise<{ goals: Goal[]; checkins: Checkin[]; stats: any; driftFlags: string[] }> {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const startDate = weekAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const userGoals = await this.getGoals(userId);
    const activeGoals = userGoals.filter(g => g.status === 'active');

    const weekCheckins = await this.getCheckins(userId, startDate, endDate);

    const completedCheckins = weekCheckins.filter(c => c.done);
    const totalPossible = activeGoals.length * 7;
    const completionRate = totalPossible > 0 ? (completedCheckins.length / totalPossible) * 100 : 0;

    const checkinDays = new Set(weekCheckins.map(c => c.date));
    const missedDays = 7 - checkinDays.size;

    const domainStats: Record<string, { goals: number; checkins: number }> = {};
    activeGoals.forEach(g => {
      if (!domainStats[g.domain]) domainStats[g.domain] = { goals: 0, checkins: 0 };
      domainStats[g.domain].goals++;
    });
    weekCheckins.forEach(c => {
      const goal = userGoals.find(g => g.id === c.goalId);
      if (goal && c.done) {
        if (!domainStats[goal.domain]) domainStats[goal.domain] = { goals: 0, checkins: 0 };
        domainStats[goal.domain].checkins++;
      }
    });

    const flags: string[] = [];

    if (missedDays >= 4) {
      flags.push(`Goal check-ins were missed on ${missedDays} days over the past week.`);
    }

    if (completionRate < 40 && activeGoals.length > 0) {
      flags.push(`Completion rate was below 40% over the past week.`);
    }

    if (activeGoals.length > 7 && completionRate < 60) {
      flags.push(`More than 7 active goals with reduced completion over the past week.`);
    }

    Object.entries(domainStats).forEach(([domain, stats]) => {
      if (stats.goals > 0 && stats.checkins === 0) {
        flags.push(`No goal check-ins occurred for the ${domain} domain over the past week.`);
      }
    });

    return {
      goals: activeGoals,
      checkins: weekCheckins,
      stats: {
        completionRate: Math.round(completionRate),
        totalCheckins: weekCheckins.length,
        completedCheckins: completedCheckins.length,
        missedDays,
        domainStats,
        startDate,
        endDate
      },
      driftFlags: flags
    };
  }

  // -------------------- TRANSCRIPTS (USER-SCOPED) --------------------

  async getTranscripts(userId: string): Promise<Transcript[]> {
    return await db.select().from(transcripts)
      .where(eq(transcripts.userId, userId))
      .orderBy(desc(transcripts.createdAt));
  }

  async getTranscript(userId: string, id: number): Promise<Transcript | undefined> {
    const [transcript] = await db.select().from(transcripts)
      .where(and(eq(transcripts.id, id), eq(transcripts.userId, userId)));
    return transcript;
  }

  async createTranscript(userId: string, transcript: InsertTranscript): Promise<Transcript> {
    const wordCount = transcript.content.split(/\s+/).filter(w => w.length > 0).length;
    const [newTranscript] = await db.insert(transcripts).values({
      ...transcript,
      userId,
      wordCount
    }).returning();
    return newTranscript;
  }

  async updateTranscript(userId: string, id: number, updates: Partial<Transcript>): Promise<Transcript> {
    const { userId: _, ...safeUpdates } = updates as any;
    const [updated] = await db.update(transcripts)
      .set(safeUpdates)
      .where(and(eq(transcripts.id, id), eq(transcripts.userId, userId)))
      .returning();
    return updated;
  }

  async deleteTranscript(userId: string, id: number): Promise<boolean> {
    const result = await db.delete(transcripts)
      .where(and(eq(transcripts.id, id), eq(transcripts.userId, userId)));
    return true;
  }

  async getTranscriptStats(userId: string): Promise<{ total: number; analyzed: number; totalWords: number; topThemes: any[] }> {
    const userTranscripts = await this.getTranscripts(userId);
    const analyzed = userTranscripts.filter(t => t.analyzed);
    const totalWords = userTranscripts.reduce((sum, t) => sum + (t.wordCount || 0), 0);

    const themeMap: Record<string, number> = {};
    analyzed.forEach(t => {
      const themes = (t.topThemes as any[]) || [];
      themes.forEach((theme: any) => {
        themeMap[theme.theme] = (themeMap[theme.theme] || 0) + (theme.count || 1);
      });
    });

    const topThemes = Object.entries(themeMap)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: userTranscripts.length,
      analyzed: analyzed.length,
      totalWords,
      topThemes
    };
  }

  // -------------------- API TOKENS (for MCP / Claude Desktop) --------------------

  async createApiToken(userId: string, name?: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');

    await db.insert(apiTokens).values({
      userId,
      token,
      name: name || 'Unnamed Token',
      lastUsed: null,
      expiresAt: null
    });

    return token; // Return plain token ONLY on creation
  }

  async getApiTokens(userId: string): Promise<ApiToken[]> {
    return await db.select()
      .from(apiTokens)
      .where(eq(apiTokens.userId, userId))
      .orderBy(desc(apiTokens.createdAt));
  }

  async validateApiToken(token: string): Promise<string | null> {
    const results = await db.select()
      .from(apiTokens)
      .where(eq(apiTokens.token, token))
      .limit(1);

    if (results.length === 0) return null;

    const tokenData = results[0];

    // Check expiration
    if (tokenData.expiresAt && new Date() > tokenData.expiresAt) {
      return null;
    }

    // Update last used
    await db.update(apiTokens)
      .set({ lastUsed: new Date() })
      .where(eq(apiTokens.id, tokenData.id));

    return tokenData.userId;
  }

  async revokeApiToken(userId: string, tokenId: number): Promise<boolean> {
    await db.delete(apiTokens)
      .where(
        and(
          eq(apiTokens.id, tokenId),
          eq(apiTokens.userId, userId)
        )
      );
    return true;
  }

  // -------------------- FEATURE FACTORY --------------------

  async createFeatureRequest(userId: string, request: InsertFeatureRequest): Promise<FeatureRequest> {
    const [newRequest] = await db.insert(featureRequests)
      .values({ ...request, userId })
      .returning();
    return newRequest;
  }

  async getFeatureRequests(userId: string): Promise<FeatureRequest[]> {
    return await db.select().from(featureRequests)
      .where(eq(featureRequests.userId, userId))
      .orderBy(desc(featureRequests.createdAt));
  }

  async updateFeatureRequest(userId: string, id: number, updates: Partial<FeatureRequest>): Promise<FeatureRequest> {
    const { userId: _, ...safeUpdates } = updates as any;
    const [updated] = await db.update(featureRequests)
      .set(safeUpdates)
      .where(and(eq(featureRequests.id, id), eq(featureRequests.userId, userId)))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
