import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models (required for Replit Auth)
export * from "./models/auth";

// === TABLE DEFINITIONS ===

// Lane 1: LifeOps - Enhanced Daily Calibration
export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD

  // === VICES (Yes/No toggles) ===
  vaping: boolean("vaping").default(false),
  alcohol: boolean("alcohol").default(false),
  junkFood: boolean("junk_food").default(false),
  doomScrolling: boolean("doom_scrolling").default(false),
  lateScreens: boolean("late_screens").default(false),
  skippedMeals: boolean("skipped_meals").default(false),
  excessCaffeine: boolean("excess_caffeine").default(false),
  exercise: boolean("exercise").default(false),

  // === LIFE METRICS (1-10 scales) ===
  energy: integer("energy"), // 1=crashed, 10=unstoppable
  stress: integer("stress"), // 1=zen, 10=maxed out
  mood: integer("mood"), // 1=dark, 10=grateful
  focus: integer("focus"), // 1=scattered, 10=locked in
  sleepQuality: integer("sleep_quality"), // 1=terrible, 10=restorative
  sleepHours: integer("sleep_hours"),
  moneyPressure: integer("money_pressure"), // 1=stable, 10=crushing
  connection: integer("connection"), // 1=isolated, 10=deeply connected

  // === QUICK CONTEXT (selects) ===
  dayType: text("day_type"), // work, rest, family, mixed, chaos
  primaryEmotion: text("primary_emotion"), // grateful, anxious, hopeful, frustrated, peaceful, overwhelmed
  winCategory: text("win_category"), // family, work, health, faith, creative, none
  timeDrain: text("time_drain"), // meetings, distractions, emergencies, low-energy, interruptions, none

  // === REFLECTION PROMPTS ===
  topWin: text("top_win"),
  topFriction: text("top_friction"),
  tomorrowPriority: text("tomorrow_priority"),

  // === OPTIONAL DEEP DIVES ===
  familyConnection: text("family_connection"),
  faithAlignment: text("faith_alignment"),
  driftCheck: text("drift_check"),

  // === SYSTEM ===
  rawTranscript: text("raw_transcript"),
  aiSummary: text("ai_summary"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Lane 2: ThinkOps - Enhanced Idea Pipeline
export const ideas = pgTable("ideas", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),

  // === BASIC CAPTURE ===
  title: text("title").notNull(),
  pitch: text("pitch"),
  category: text("category"), // tech, business, creative, family, faith, learning
  captureMode: text("capture_mode").default("quick"), // quick, deep

  // === DEEP CAPTURE FIELDS ===
  whoItHelps: text("who_it_helps"),
  painItSolves: text("pain_it_solves"),
  whyICare: text("why_i_care"),
  tinyTest: text("tiny_test"),
  resourcesNeeded: text("resources_needed"),
  timeEstimate: text("time_estimate"), // hours, days, weeks, months
  excitement: integer("excitement"), // 1-10
  feasibility: integer("feasibility"), // 1-10

  // === PIPELINE STATUS ===
  status: text("status").default("draft"), // draft, parked, promoted, shipped, discarded
  priority: integer("priority").default(0), // 0-5 stars

  // === AI ANALYSIS ===
  realityCheck: jsonb("reality_check"),
  promotedSpec: jsonb("promoted_spec"),

  // === PROGRESS TRACKING ===
  milestones: jsonb("milestones"), // [{ title, completed, date }]
  nextAction: text("next_action"),

  createdAt: timestamp("created_at").defaultNow(),
});

// Lane 3: Bruce Teaching Assistant
export const teachingRequests = pgTable("teaching_requests", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  grade: text("grade"),
  standard: text("standard"),
  topic: text("topic"),
  timeBlock: text("time_block"),
  materials: text("materials"),
  studentProfile: text("student_profile"),
  constraints: text("constraints"),
  assessmentType: text("assessment_type"),
  format: text("format"),
  output: jsonb("output"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Lane 4: HarrisWildlands - Enhanced Content Generator
export const harrisContent = pgTable("harris_content", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),

  // === CONTENT TYPE ===
  contentType: text("content_type").default("website"), // website, social, email, blog, video
  tone: text("tone").default("inspirational"), // inspirational, educational, personal, professional
  template: text("template"), // specific template name

  // === STRATEGY INPUTS ===
  coreMessage: jsonb("core_message"), // { definition, audience, pain, promise }
  siteMap: jsonb("site_map"), // { homeGoal, startHereGoal, resourcesGoal, cta }
  leadMagnet: jsonb("lead_magnet"), // { title, problem, timeToValue, delivery }

  // === GENERATED OUTPUT ===
  generatedCopy: jsonb("generated_copy"), // varies by content type

  // === METADATA ===
  title: text("title"),
  status: text("status").default("draft"), // draft, published, archived

  createdAt: timestamp("created_at").defaultNow(),
});

// User Settings (per-user preferences)
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),

  // AI preferences
  aiModel: text("ai_model").default("openai/gpt-4o-mini"),
  aiTone: text("ai_tone").default("balanced"), // gentle, balanced, direct

  // Theme preferences
  theme: text("theme").default("lab"), // field, lab, sanctuary

  // Notification preferences
  dailyReminder: boolean("daily_reminder").default(true),
  reminderTime: text("reminder_time").default("07:00"),

  // Personal protocols (custom routines)
  protocols: jsonb("protocols"), // [{ name, lane, frequency, enabled }]

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Legacy Settings table (keeping for compatibility)
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
});

// === GOAL TRACKING ===

// Domains for goal categorization
export const GOAL_DOMAINS = ["faith", "family", "work", "health", "logistics", "property", "ideas", "discipline"] as const;

// Goals table
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  domain: text("domain").notNull(), // faith, family, work, health, logistics, property, ideas, discipline
  title: text("title").notNull(),
  description: text("description"),
  targetType: text("target_type").default("binary"), // binary, count, duration
  weeklyMinimum: integer("weekly_minimum").default(1), // e.g., 3 workouts/week
  startDate: text("start_date"), // YYYY-MM-DD
  dueDate: text("due_date"), // YYYY-MM-DD
  status: text("status").default("active"), // active, paused, archived
  priority: integer("priority").default(2), // 1=high, 2=medium, 3=low
  createdAt: timestamp("created_at").defaultNow(),
});

// Goal check-ins table
export const checkins = pgTable("checkins", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  done: boolean("done").default(false),
  score: integer("score"), // 1-10 optional rating
  note: text("note"), // optional short note
  createdAt: timestamp("created_at").defaultNow(),
});

// Drift flags table
export const driftFlags = pgTable("drift_flags", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // checkin_dropoff, consistency_drift, overload, domain_neglect
  timeframeStart: text("timeframe_start").notNull(), // YYYY-MM-DD
  timeframeEnd: text("timeframe_end").notNull(), // YYYY-MM-DD
  sentence: text("sentence").notNull(), // single factual observation
  createdAt: timestamp("created_at").defaultNow(),
});

// === API TOKENS (for MCP / Claude Desktop dual-access) ===

export const apiTokens = pgTable("api_tokens", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  token: text("token").notNull().unique(),
  name: text("name"), // e.g., "Claude Desktop - Main Computer"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsed: timestamp("last_used"),
  expiresAt: timestamp("expires_at"), // null = never expires
});

// === THINKOPS: BRAINDUMP TRANSCRIPTS ===

// Pattern categories for analysis
export const PATTERN_CATEGORIES = ["topics", "actions", "questions", "energy", "connections"] as const;

// Transcripts table for voice braindumps
export const transcripts = pgTable("transcripts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),

  // Source info
  title: text("title").notNull(),
  fileName: text("file_name"),
  content: text("content").notNull(), // Full transcript text
  wordCount: integer("word_count").default(0),

  // Session metadata
  sessionDate: text("session_date"), // YYYY-MM-DD when recorded
  participants: text("participants"), // e.g., "Trey, Joe"

  // AI-extracted patterns (stored as JSONB)
  patterns: jsonb("patterns"), // { topics: [], actions: [], questions: [], energy: [], connections: [] }

  // Summary stats
  topThemes: jsonb("top_themes"), // [{ theme, count, quotes: [] }]
  scorecard: jsonb("scorecard"), // { totalWords, uniqueTopics, actionItems, questions, energyLevel }

  // Processing status
  analyzed: boolean("analyzed").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});

// === FEATURE FACTORY (Ouroboros) ===
export const featureRequests = pgTable("feature_requests", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),

  title: text("title").notNull(),
  spec: text("spec").notNull(), // The user's description

  // AI Generated Artifacts
  generatedSchema: text("generated_schema"),
  generatedApi: text("generated_api"),
  generatedUi: text("generated_ui"),

  status: text("status").default("draft"), // draft, generating, completed, error

  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertLogSchema = createInsertSchema(logs).omit({ id: true, userId: true, createdAt: true, aiSummary: true });
export const insertIdeaSchema = createInsertSchema(ideas).omit({ id: true, userId: true, createdAt: true, realityCheck: true, promotedSpec: true, milestones: true });
export const insertTeachingRequestSchema = createInsertSchema(teachingRequests).omit({ id: true, userId: true, createdAt: true, output: true });
export const insertHarrisContentSchema = createInsertSchema(harrisContent).omit({ id: true, userId: true, createdAt: true, generatedCopy: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({ id: true, userId: true, createdAt: true, updatedAt: true });
export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, userId: true, createdAt: true });
export const insertCheckinSchema = createInsertSchema(checkins).omit({ id: true, userId: true, createdAt: true });
export const insertDriftFlagSchema = createInsertSchema(driftFlags).omit({ id: true, userId: true, createdAt: true });
export const insertTranscriptSchema = createInsertSchema(transcripts).omit({ id: true, userId: true, createdAt: true, patterns: true, topThemes: true, scorecard: true, analyzed: true, wordCount: true });
export const insertApiTokenSchema = createInsertSchema(apiTokens).omit({ id: true, createdAt: true, lastUsed: true });
export const insertFeatureRequestSchema = createInsertSchema(featureRequests).omit({ id: true, userId: true, createdAt: true, generatedSchema: true, generatedApi: true, generatedUi: true });

// === TYPES ===

export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;

export type Idea = typeof ideas.$inferSelect;
export type InsertIdea = z.infer<typeof insertIdeaSchema>;

export type TeachingRequest = typeof teachingRequests.$inferSelect;
export type InsertTeachingRequest = z.infer<typeof insertTeachingRequestSchema>;

export type HarrisContent = typeof harrisContent.$inferSelect;
export type InsertHarrisContent = z.infer<typeof insertHarrisContentSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingsSchema>;

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;

export type Checkin = typeof checkins.$inferSelect;
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;

export type DriftFlag = typeof driftFlags.$inferSelect;
export type InsertDriftFlag = z.infer<typeof insertDriftFlagSchema>;

export type Transcript = typeof transcripts.$inferSelect;
export type InsertTranscript = z.infer<typeof insertTranscriptSchema>;

export type ApiToken = typeof apiTokens.$inferSelect;
export type InsertApiToken = z.infer<typeof insertApiTokenSchema>;

export type FeatureRequest = typeof featureRequests.$inferSelect;
export type InsertFeatureRequest = z.infer<typeof insertFeatureRequestSchema>;

// Pattern analysis types
export type PatternItem = {
  text: string;
  quotes: string[];
  count: number;
};

export type TranscriptPatterns = {
  topics: PatternItem[];
  actions: PatternItem[];
  questions: PatternItem[];
  energy: PatternItem[];
  connections: PatternItem[];
};

export type TranscriptScorecard = {
  totalWords: number;
  uniqueTopics: number;
  actionItems: number;
  questions: number;
  energyLevel: string; // "high" | "medium" | "low"
  topTheme: string;
};

// === API REQUEST TYPES ===

export type CreateLogRequest = InsertLog;
export type CreateIdeaRequest = InsertIdea;
export type CreateTeachingRequest = InsertTeachingRequest;
export type CreateHarrisContentRequest = InsertHarrisContent;
export type UpdateIdeaRequest = Partial<InsertIdea> & {
  realityCheck?: any;
  promotedSpec?: any;
  status?: string;
  milestones?: any;
  nextAction?: string;
  priority?: number;
};
export type UpdateUserSettingsRequest = Partial<InsertUserSettings>;

// === RESPONSE TYPES ===
export type DashboardStats = {
  logsToday: number;
  openLoops: number;
  driftFlags: string[];
};

// === CONSTANTS FOR UI ===
export const DAY_TYPES = ["work", "rest", "family", "mixed", "chaos"] as const;
export const PRIMARY_EMOTIONS = ["grateful", "anxious", "hopeful", "frustrated", "peaceful", "overwhelmed"] as const;
export const WIN_CATEGORIES = ["family", "work", "health", "faith", "creative", "none"] as const;
export const TIME_DRAINS = ["meetings", "distractions", "emergencies", "low-energy", "interruptions", "none"] as const;
export const IDEA_CATEGORIES = ["tech", "business", "creative", "family", "faith", "learning"] as const;
export const TIME_ESTIMATES = ["hours", "days", "weeks", "months"] as const;
export const CONTENT_TYPES = ["website", "social", "email", "blog", "video"] as const;
export const CONTENT_TONES = ["inspirational", "educational", "personal", "professional"] as const;
