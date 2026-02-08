# Priority 1: Core Architecture Reference

**Generated:** December 27, 2025  
**Project:** BruceOps / HarrisWildlands

---

## Table of Contents
1. [Server Entry Point](#server-entry-point)
2. [API Routes](#api-routes)
3. [Storage Layer](#storage-layer)
4. [Database Connection](#database-connection)
5. [Authentication](#authentication)
6. [Shared Schema](#shared-schema)
7. [API Contracts](#api-contracts)
8. [Client App Entry](#client-app-entry)
9. [Package Dependencies](#package-dependencies)

---

## Server Entry Point

**File:** `server/index.ts`

```typescript
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
```

---

## API Routes

**File:** `server/routes.ts`

```typescript
import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";

// AI Provider Configuration
const AI_PROVIDER = process.env.AI_PROVIDER || "off";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

// Determine active AI provider based on configuration and available keys
function getActiveAIProvider(): "gemini" | "openrouter" | "off" {
  if (AI_PROVIDER === "off") return "off";
  if (AI_PROVIDER === "gemini" && GOOGLE_GEMINI_API_KEY) return "gemini";
  if (AI_PROVIDER === "openrouter" && OPENROUTER_API_KEY) return "openrouter";
  // Fallback ladder: try gemini first, then openrouter
  if (GOOGLE_GEMINI_API_KEY) return "gemini";
  if (OPENROUTER_API_KEY) return "openrouter";
  return "off";
}

const activeProvider = getActiveAIProvider();
console.log(`AI Provider: ${activeProvider} (configured: ${AI_PROVIDER})`);

// Global developer prompt that addresses Bruce directly
const BRUCE_CONTEXT = `You are speaking directly to Bruce Harris - a dad, 5th/6th grade teacher, creator, and builder.
Bruce is building his personal operating system called BruceOps to manage his life, ideas, teaching, and creative work.
Always address him as "Bruce" and speak with the directness of a trusted advisor who knows his goals.
Be practical, honest, and help him stay aligned with his values: faith, family, building things that matter.`;

// Helper to get userId from authenticated request
function getUserId(req: Request): string {
  return (req.user as any)?.claims?.sub;
}

// Gemini API call
async function callGemini(prompt: string, systemPrompt: string): Promise<string> {
  if (!GOOGLE_GEMINI_API_KEY) throw new Error("Gemini API key not available");
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
      })
    }
  );
  
  const data = await response.json();
  if (!response.ok) throw new Error(`Gemini API error: ${JSON.stringify(data)}`);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// OpenRouter API call
async function callOpenRouterAPI(prompt: string, systemPrompt: string): Promise<string> {
  if (!OPENROUTER_API_KEY) throw new Error("OpenRouter API key not available");
  
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`OpenRouter API error: ${JSON.stringify(data)}`);
  return data.choices[0].message.content;
}

// AI Provider Ladder: Gemini -> OpenRouter -> Off
async function callAI(prompt: string, lanePrompt: string = ""): Promise<string> {
  const systemPrompt = `${BRUCE_CONTEXT}\n\n${lanePrompt}`.trim();
  const provider = getActiveAIProvider();
  
  if (provider === "off") {
    return "AI features are currently disabled. Daily logging works normally.";
  }
  
  // Try primary provider
  try {
    if (provider === "gemini") {
      return await callGemini(prompt, systemPrompt);
    } else if (provider === "openrouter") {
      return await callOpenRouterAPI(prompt, systemPrompt);
    }
  } catch (primaryError) {
    console.error(`Primary AI provider (${provider}) failed:`, primaryError);
    
    // Fallback to secondary provider
    try {
      if (provider === "gemini" && OPENROUTER_API_KEY) {
        console.log("Falling back to OpenRouter...");
        return await callOpenRouterAPI(prompt, systemPrompt);
      } else if (provider === "openrouter" && GOOGLE_GEMINI_API_KEY) {
        console.log("Falling back to Gemini...");
        return await callGemini(prompt, systemPrompt);
      }
    } catch (fallbackError) {
      console.error("Fallback AI provider also failed:", fallbackError);
    }
  }
  
  return "AI insights unavailable. Daily logging completed successfully.";
}

// Check database connectivity
async function checkDatabaseConnection(): Promise<"connected" | "error"> {
  try {
    await db.execute(sql`SELECT 1`);
    return "connected";
  } catch (error) {
    console.error("Database connection check failed:", error);
    return "error";
  }
}

// Get AI status
function getAIStatus(): "active" | "degraded" | "offline" {
  const provider = getActiveAIProvider();
  if (provider === "off") return "offline";
  if (provider === "gemini" && GOOGLE_GEMINI_API_KEY) return "active";
  if (provider === "openrouter" && OPENROUTER_API_KEY) return "active";
  return "degraded";
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ==================== HEALTH CHECK (NO AUTH) ====================
  const isStandalone = process.env.STANDALONE_MODE === "true" || 
    (!process.env.REPL_ID && !process.env.ISSUER_URL);
  
  app.get("/api/health", async (_req, res) => {
    const dbStatus = await checkDatabaseConnection();
    res.json({ 
      status: dbStatus === "connected" ? "ok" : "degraded", 
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      standalone_mode: isStandalone,
      database: dbStatus,
      ai_provider: getActiveAIProvider(),
      ai_status: getAIStatus()
    });
  });

  // Setup Replit Auth BEFORE all other routes
  await setupAuth(app);
  registerAuthRoutes(app);

  // /api/me endpoint for frontend to get current user info
  app.get("/api/me", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    res.json({ id: userId, claims: (req.user as any)?.claims });
  });

  // ==================== ALL ROUTES BELOW REQUIRE AUTH ====================

  // Dashboard
  app.get(api.dashboard.get.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const stats = await storage.getDashboardStats(userId);
    const driftFlags = ["Sleep consistency < 70%", "High stress pattern detected"]; 
    res.json({ ...stats, driftFlags });
  });

  // Logs
  app.get(api.logs.list.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const logs = await storage.getLogs(userId);
    res.json(logs);
  });

  app.get("/api/logs/:date", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const { date } = req.params;
    const log = await storage.getLogByDate(userId, date);
    if (!log) {
      return res.status(404).json({ message: "No log found for this date" });
    }
    res.json(log);
  });

  app.post(api.logs.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.logs.create.input.parse(req.body);
      const log = await storage.createLog(userId, input);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put("/api/logs/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const id = Number(req.params.id);
      const input = api.logs.create.input.parse(req.body);
      const log = await storage.updateLog(userId, id, input);
      if (!log) {
        return res.status(404).json({ message: "Log not found" });
      }
      res.json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.logs.generateSummary.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const { date } = req.body;
    const log = await storage.getLogByDate(userId, date);
    if (!log) return res.status(404).json({ message: "Log not found" });

    const prompt = `Generate a factual summary for this daily log. Avoid advice. Identify pattern signals.
    Log Data: ${JSON.stringify(log)}`;
    
    const summary = await callAI(prompt, "You are a Life Operations Steward. Output factual/pattern-based summaries only.");
    
    const updated = await storage.updateLogSummary(userId, log.id, summary);
    res.json({ summary: updated.aiSummary });
  });

  // Ideas
  app.get(api.ideas.list.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const ideas = await storage.getIdeas(userId);
    res.json(ideas);
  });

  app.post(api.ideas.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.ideas.create.input.parse(req.body);
      const idea = await storage.createIdea(userId, input);
      res.status(201).json(idea);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.ideas.update.path, isAuthenticated, async (req, res) => {
     const userId = getUserId(req);
     const id = Number(req.params.id);
     const { userId: _, ...updates } = req.body;
     const updated = await storage.updateIdea(userId, id, updates);
     res.json(updated);
  });

  app.post(api.ideas.runRealityCheck.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    const idea = await storage.getIdea(userId, id);
    if (!idea) return res.status(404).json({ message: "Idea not found" });

    // Step 1: Basic web search context using AI (simulated research)
    const searchPrompt = `Research this idea topic: "${idea.title} ${idea.painItSolves || ''}". 
    Are there existing solutions in the market? Is this problem validated? 
    Provide 3-5 brief findings about market reality, competitors, and user demand.`;
    
    let searchContext = "";
    try {
      searchContext = await callAI(searchPrompt, "You are a market research assistant. Be factual and concise.");
    } catch (err) {
      console.log("Search context failed, continuing without it");
    }

    // Step 2: Reality check with comprehensive context
    const prompt = `Perform a Reality Check on this idea. 

IDEA:
Title: ${idea.title}
Pitch: ${idea.pitch || 'N/A'}
Who It Helps: ${idea.whoItHelps || 'N/A'}
Pain It Solves: ${idea.painItSolves || 'N/A'}
Excitement: ${idea.excitement || 'N/A'}/10
Feasibility: ${idea.feasibility || 'N/A'}/10
Time Estimate: ${idea.timeEstimate || 'N/A'}

MARKET RESEARCH:
${searchContext || 'No research available'}

INSTRUCTIONS:
1. Separate claims into Known (verified facts), Likely (reasonable assumptions), Speculation (hopes/guesses).
2. Flag self-deception patterns: Overbuilding, Perfectionism, Solution-in-Search-of-Problem, Time Optimism, Feature Creep.
3. Suggest ONE decision bin: Discard (kill it), Park (revisit later), Salvage (pivot the core), Promote (worth building).
4. Provide specific reasoning for the decision.

Return ONLY pure JSON format (no markdown, no preamble):
{
  "known": ["verified fact 1", "verified fact 2"],
  "likely": ["reasonable assumption 1", "reasonable assumption 2"],
  "speculation": ["hope or guess 1"],
  "flags": ["self-deception pattern 1"],
  "decision": "Park",
  "reasoning": "One sentence explaining why this decision"
}`;

    try {
      const response = await callAI(prompt, "You are a ruthless but helpful product manager. JSON output only. No markdown.");
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const realityCheck = jsonMatch ? JSON.parse(jsonMatch[0]) : { 
        error: "Failed to parse AI response", 
        raw: response,
        known: [], 
        likely: [], 
        speculation: [], 
        flags: ["Parse error - manual review needed"], 
        decision: "Park", 
        reasoning: "AI response couldn't be parsed. Try again." 
      };

      const updated = await storage.updateIdea(userId, id, { realityCheck, status: "reality_checked" });
      res.json(updated);
    } catch (err) {
      console.error("Reality check failed:", err);
      res.status(500).json({ message: "Reality check failed", error: (err as Error).message });
    }
  });

  // Teaching
  app.get(api.teaching.list.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const reqs = await storage.getTeachingRequests(userId);
    res.json(reqs);
  });

  app.post(api.teaching.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.teaching.create.input.parse(req.body);
      
      const prompt = `You are Bruce, a 5th-6th grade teaching assistant.
      Input: ${JSON.stringify(input)}
      Build: (1) lesson outline, (2) hands-on activity, (3) exit ticket + key, (4) differentiation, (5) 10-min prep list.
      Return JSON format.`;
      
      const response = await callAI(prompt, "You are a strict standards-aligned teaching assistant. JSON output only.");
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const output = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: response };

      const newReq = await storage.createTeachingRequest(userId, input, output);
      res.status(201).json(newReq);
    } catch (err) {
      console.log(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Harris
  app.post(api.harris.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.harris.create.input.parse(req.body);
      
      const prompt = `Write conversion-focused website copy for HarrisWildlands.com.
      Core Message: ${JSON.stringify(input.coreMessage)}
      Site Map: ${JSON.stringify(input.siteMap)}
      Lead Magnet: ${JSON.stringify(input.leadMagnet)}
      
      Output JSON with keys: home, startHere, resources. Keep it simple and honest.`;
      
      const response = await callAI(prompt, "You are a copywriter for a dad/teacher audience. No hype. JSON output only.");
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const generatedCopy = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: response };

      const content = await storage.createHarrisContent(userId, input, generatedCopy);
      res.status(201).json(content);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Settings
  app.get(api.settings.list.path, isAuthenticated, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.put(api.settings.update.path, isAuthenticated, async (req, res) => {
    const key = req.params.key;
    const { value } = req.body;
    const updated = await storage.updateSetting(key, value);
    res.json(updated);
  });

  // ==================== GOALS ====================
  
  app.get(api.goals.list.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const goals = await storage.getGoals(userId);
    res.json(goals);
  });

  app.post(api.goals.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.goals.create.input.parse(req.body);
      const goal = await storage.createGoal(userId, input);
      res.status(201).json(goal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.goals.update.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    const { userId: _, ...updates } = req.body;
    const updated = await storage.updateGoal(userId, id, updates);
    if (!updated) return res.status(404).json({ message: "Goal not found" });
    res.json(updated);
  });

  // ==================== CHECKINS ====================
  
  app.get(api.checkins.list.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const checkins = await storage.getCheckins(userId, startDate, endDate);
    res.json(checkins);
  });

  app.post(api.checkins.upsert.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.checkins.upsert.input.parse(req.body);
      const checkin = await storage.upsertCheckin(userId, input.goalId, input.date, input.done, input.score, input.note);
      res.json(checkin);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.checkins.batch.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const inputs = api.checkins.batch.input.parse(req.body);
      const results = await Promise.all(
        inputs.map(input => 
          storage.upsertCheckin(userId, input.goalId, input.date, input.done, input.score, input.note)
        )
      );
      res.json(results);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // ==================== WEEKLY REVIEW ====================
  
  app.get(api.weeklyReview.get.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const review = await storage.getWeeklyReview(userId);
    res.json(review);
  });

  app.get(api.weeklyReview.exportPdf.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const review = await storage.getWeeklyReview(userId);
    
    const pdfContent = `
WEEKLY GOAL REVIEW
==================
Period: ${review.stats.startDate} to ${review.stats.endDate}

SUMMARY
-------
Completion Rate: ${review.stats.completionRate}%
Total Check-ins: ${review.stats.totalCheckins}
Completed: ${review.stats.completedCheckins}

GOALS
-----
${review.goals.map(g => `- [${g.domain.toUpperCase()}] ${g.title} (Priority: ${g.priority})`).join('\n')}

DOMAIN COVERAGE
---------------
${Object.entries(review.stats.domainStats || {}).map(([domain, stats]: [string, any]) => 
  `${domain}: ${stats.checkins}/${stats.goals * 7} check-ins`
).join('\n')}

DRIFT FLAGS
-----------
${review.driftFlags.length > 0 ? review.driftFlags.map(f => `- ${f}`).join('\n') : 'No drift flags this week.'}
`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="weekly-review.txt"');
    res.send(pdfContent);
  });

  // AI-powered weekly insight generation (rate-limited to once per day)
  app.post("/api/review/weekly/insight", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    
    // Check if already generated today (using settings as cache)
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `weekly-insight-${userId}-${today}`;
    
    try {
      const allSettings = await storage.getSettings();
      const cachedInsight = allSettings.find(s => s.key === cacheKey);
      
      if (cachedInsight) {
        return res.json({ insight: cachedInsight.value, cached: true });
      }
    } catch (err) {
      console.log("Cache check failed, generating fresh insight");
    }

    // Generate new insight using the AI stack
    try {
      const review = await storage.getWeeklyReview(userId);
      
      const prompt = `Bruce, here's your week at a glance:

Completion Rate: ${review.stats.completionRate}%
Total Check-ins: ${review.stats.totalCheckins}
Completed: ${review.stats.completedCheckins}
Missed Days: ${7 - (review.stats.activeDays || 0)}
Drift Flags: ${review.driftFlags.length > 0 ? review.driftFlags.join('; ') : 'None'}

Domain Performance:
${Object.entries(review.stats.domainStats || {}).map(([domain, stats]: [string, any]) => 
  `- ${domain}: ${stats.checkins}/${stats.goals * 7} check-ins (${stats.goals} goals)`
).join('\n') || 'No domain data available'}

Goals:
${review.goals.slice(0, 5).map(g => `- [${g.domain}] ${g.title} (Priority: ${g.priority})`).join('\n') || 'No active goals'}

Give me ONE specific action to adjust this week. Be direct. No fluff. 
Format: "This week, [action]." Then one sentence explaining why.`;

      const insight = await callAI(prompt, "You are Bruce's operations steward. Be practical and direct. Max 2 sentences.");
      
      // Cache the insight for the day
      await storage.updateSetting(cacheKey, insight);
      
      res.json({ insight, cached: false });
    } catch (err) {
      console.error("Insight generation failed:", err);
      res.status(500).json({ message: "Failed to generate insight", error: (err as Error).message });
    }
  });

  // ==================== AI CHAT ====================
  
  // Chat endpoint - proxies to AI with conversation context
  app.post("/api/chat", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const { messages, context } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "Messages array is required" });
    }
    
    // Build system prompt with Bruce context
    let systemPrompt = `You are Bruce Steward, a personal operations assistant for the BruceOps system.
You help Bruce with:
- LifeOps: Daily logging, routine tracking, energy management
- ThinkOps: Idea capture, brainstorming analysis, project planning  
- Goals: Weekly reviews, habit tracking, accountability
- Teaching: 5th-6th grade lesson planning and classroom prep

IMPORTANT RULES:
- Be direct and concise. Bruce values brevity.
- Reference actual data when provided in context.
- Give actionable, practical advice.
- Keep responses under 150 words unless asked for detail.
- Never invent data - only reference what's provided.`;

    if (context) {
      systemPrompt += `\n\nCURRENT USER CONTEXT:\n${context}`;
    }

    // Get the last user message as the prompt
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    const prompt = lastUserMessage?.content || "";

    try {
      const response = await callAI(prompt, systemPrompt);
      res.json({ 
        response,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Chat failed:", err);
      res.status(500).json({ message: "Chat failed", error: (err as Error).message });
    }
  });

  return httpServer;
}
```

---

## Storage Layer

**File:** `server/storage.ts`

```typescript
import { db } from "./db";
import {
  logs, ideas, teachingRequests, harrisContent, settings, goals, checkins, driftFlags, transcripts,
  type InsertLog, type InsertIdea, type InsertTeachingRequest, type InsertHarrisContent,
  type InsertGoal, type InsertCheckin, type InsertTranscript,
  type Log, type Idea, type TeachingRequest, type HarrisContent, type Setting,
  type Goal, type Checkin, type DriftFlag, type Transcript, type TranscriptPatterns, type TranscriptScorecard
} from "@shared/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";

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
}

export class DatabaseStorage implements IStorage {
  // Implementation details...
  // See full file in repository
}

export const storage = new DatabaseStorage();
```

---

## Database Connection

**File:** `server/db.ts`

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

---

## Authentication

**File:** `server/replit_integrations/auth/replitAuth.ts`

```typescript
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";
import { authStorage } from "./storage";

const isReplitEnvironment = () => {
  return !!process.env.REPL_ID && !!process.env.ISSUER_URL;
};

const isStandaloneMode = () => {
  return process.env.STANDALONE_MODE === "true" || !isReplitEnvironment();
};

const STANDALONE_USER = {
  claims: {
    sub: "standalone-user",
    email: "user@localhost",
    first_name: "Local",
    last_name: "User",
    profile_image_url: null,
  },
  access_token: "standalone-token",
  expires_at: Math.floor(Date.now() / 1000) + 86400 * 365,
};

// ... Full implementation in repository
```

---

## Shared Schema

**File:** `shared/schema.ts`

See full schema in repository. Key tables:
- `logs` - LifeOps daily tracking
- `ideas` - ThinkOps idea pipeline
- `teachingRequests` - Teaching Assistant
- `harrisContent` - HarrisWildlands content
- `goals` - Goal tracking
- `checkins` - Daily goal check-ins
- `transcripts` - Braindump transcripts

---

## API Contracts

**File:** `shared/routes.ts`

```typescript
import { z } from 'zod';
import { insertLogSchema, insertIdeaSchema, /* ... */ } from './schema';

export const api = {
  dashboard: { get: { method: 'GET', path: '/api/dashboard', responses: { 200: z.object({...}) } } },
  logs: { list: {...}, create: {...}, generateSummary: {...} },
  ideas: { list: {...}, create: {...}, update: {...}, runRealityCheck: {...} },
  teaching: { list: {...}, create: {...} },
  harris: { create: {...} },
  settings: { list: {...}, update: {...} },
  goals: { list: {...}, create: {...}, update: {...} },
  checkins: { list: {...}, upsert: {...}, batch: {...} },
  weeklyReview: { get: {...}, exportPdf: {...} },
};
```

---

## Client App Entry

**File:** `client/src/App.tsx`

```typescript
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { ThemeProvider } from "@/components/ThemeProvider";

import Core from "@/pages/Dashboard";
import LifeOps from "@/pages/LifeOps";
import Goals from "@/pages/Goals";
import ThinkOps from "@/pages/ThinkOps";
import TeachingAssistant from "@/pages/TeachingAssistant";
import HarrisWildlands from "@/pages/HarrisWildlands";
import Settings from "@/pages/Settings";
import RealityCheck from "@/pages/RealityCheck";
import WeeklyReview from "@/pages/WeeklyReview";
import Chat from "@/pages/Chat";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Core} />
        <Route path="/life-ops" component={LifeOps} />
        <Route path="/goals" component={Goals} />
        <Route path="/think-ops" component={ThinkOps} />
        <Route path="/teaching" component={TeachingAssistant} />
        <Route path="/harris" component={HarrisWildlands} />
        <Route path="/settings" component={Settings} />
        <Route path="/reality-check" component={RealityCheck} />
        <Route path="/weekly-review" component={WeeklyReview} />
        <Route path="/chat" component={Chat} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
```

**File:** `client/src/main.tsx`

```typescript
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

---

## Package Dependencies

**File:** `package.json`

```json
{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "tsx script/build.ts",
    "start": "NODE_ENV=production node dist/index.cjs",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-*": "(various)",
    "@tanstack/react-query": "^5.60.5",
    "connect-pg-simple": "^10.0.0",
    "date-fns": "^3.6.0",
    "drizzle-orm": "^0.39.3",
    "drizzle-zod": "^0.7.0",
    "express": "^4.21.2",
    "express-session": "^1.18.2",
    "framer-motion": "^11.18.2",
    "googleapis": "^148.0.0",
    "lucide-react": "^0.453.0",
    "openid-client": "^6.8.1",
    "passport": "^0.7.0",
    "pg": "^8.16.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.69.0",
    "recharts": "^2.15.4",
    "tailwind-merge": "^2.6.0",
    "wouter": "^3.3.5",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.7.0",
    "drizzle-kit": "^0.31.8",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.20.5",
    "typescript": "5.6.3",
    "vite": "^7.3.0"
  }
}
```

---

## Environment Variables

Required environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Session encryption key |
| `ISSUER_URL` | For Replit Auth | OIDC issuer URL |
| `REPL_ID` | For Replit Auth | Replit project ID |
| `AI_PROVIDER` | No | `gemini`, `openrouter`, or `off` |
| `GOOGLE_GEMINI_API_KEY` | For AI | Gemini API key |
| `OPENROUTER_API_KEY` | For AI | OpenRouter API key |
| `STANDALONE_MODE` | No | Set to `true` for self-hosted |
