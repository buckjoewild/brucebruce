import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import rateLimit from 'express-rate-limit';
import { createHash } from 'crypto';

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
  return callAIWithFullPrompt(prompt, systemPrompt);
}

// AI call with custom system prompt (for Lab personas - bypasses Bruce context)
async function callAIWithFullPrompt(prompt: string, systemPrompt: string): Promise<string> {
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

// Generate Feature (Content-to-Code)
async function generateFeature(spec: string): Promise<{ schema: string, server: string, client: string }> {
  const prompt = `You are a Senior Full-Stack Architect (TypeScript/React/Node).
  
  FEATURE REQUEST:
  ${spec}
  
  TASK:
  Generate the code to implement this feature in our existing Drizzle/Express/React stack.
  
  OUTPUT JSON ONLY:
  {
    "schema": "The typescript code for shared/schema.ts (table definitions and types)",
    "server": "The typescript code for server/routes.ts (API endpoints)",
    "client": "The typescript code for the new React page component"
  }
  
  RULES:
  1. Use 'drizzle-orm/pg-core' imports.
  2. Use 'zod' for validation.
  3. Assume 'authenticationDual' middleware is available.
  4. Client component should use 'shadcn/ui' components (Button, Card, Input).
  5. Do NOT include markdown formatting, just the raw code strings in the JSON fields.
  `;

  const response = await callAIWithFullPrompt(prompt, "You are a code generator. Output raw JSON only.");

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("Failed to parse generated feature:", e);
    return { schema: "// Failed to generate", server: "// Failed to generate", client: "// Failed to generate" };
  }
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

  // ==================== CORS CONFIGURATION ====================
  const allowedOrigins = [
    'https://claude.ai',
    'https://www.claude.ai',
    'http://localhost:3000',
    'http://localhost:5000',
  ];

  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (!origin || allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-token');
      res.header('Access-Control-Allow-Credentials', 'true');
    }

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });

  console.log('✅ CORS enabled for:', allowedOrigins);

  // ==================== RATE LIMITING ====================
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: {
      error: 'AI rate limit exceeded. Maximum 10 requests per minute.',
      tip: 'Responses are cached for 24 hours - repeated queries are free!'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/', generalLimiter);
  app.use('/api/ai/', aiLimiter);

  console.log('✅ Rate limiting enabled:');
  console.log('   - General: 100 req/15min');
  console.log('   - AI: 10 req/min per user');

  // ==================== DUAL AUTH MIDDLEWARE ====================
  // Token authentication middleware (for MCP / Claude Desktop)
  async function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const userId = await storage.validateApiToken(token);

    if (!userId) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach userId to request (compatible with session auth)
    (req as any).userId = userId;
    (req as any).user = { claims: { sub: userId } };
    next();
  }

  // Dual-auth middleware (accepts EITHER session OR token)
  async function authenticateDual(req: Request, res: Response, next: NextFunction) {
    // Check for session first (web UI)
    if ((req as any).isAuthenticated && (req as any).isAuthenticated()) {
      return next();
    }

    // Fall back to token auth (MCP server)
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authenticateToken(req, res, next);
    }

    // No valid auth found
    return res.status(401).json({ error: 'Authentication required' });
  }

  console.log('✅ Dual-auth middleware enabled (session + token)');

  // /api/me endpoint for frontend to get current user info
  app.get("/api/me", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    res.json({ id: userId, claims: (req.user as any)?.claims });
  });

  // ==================== API TOKEN MANAGEMENT (Session auth only) ====================

  // Generate new token
  app.post('/api/settings/tokens', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { name } = req.body;

      const token = await storage.createApiToken(userId, name);

      res.json({
        token,
        message: 'Token generated. Copy now - you will not see it again!',
        warning: 'Store this token securely. It grants full access to your data.'
      });

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // List user's tokens (without revealing actual token values)
  app.get('/api/settings/tokens', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const tokens = await storage.getApiTokens(userId);

      // Don't return actual token values
      const safeTokens = tokens.map(t => ({
        id: t.id,
        name: t.name,
        createdAt: t.createdAt,
        lastUsed: t.lastUsed,
        expiresAt: t.expiresAt,
        preview: t.token.substring(0, 8) + '...' // First 8 chars only
      }));

      res.json(safeTokens);

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Revoke token
  app.delete('/api/settings/tokens/:tokenId', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const tokenId = parseInt(req.params.tokenId);

      await storage.revokeApiToken(userId, tokenId);

      res.json({ message: 'Token revoked successfully' });

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  console.log('✅ Token management endpoints registered');

  // ==================== ALL ROUTES BELOW SUPPORT DUAL AUTH ====================

  // Dashboard
  app.get(api.dashboard.get.path, authenticateDual, async (req, res) => {
    const userId = getUserId(req);
    const stats = await storage.getDashboardStats(userId);
    const driftFlags = ["Sleep consistency < 70%", "High stress pattern detected"];
    res.json({ ...stats, driftFlags });
  });

  // Logs - returns user's logs only (client handles empty state with examples)
  app.get(api.logs.list.path, authenticateDual, async (req, res) => {
    const userId = getUserId(req);
    const logs = await storage.getLogs(userId);
    res.json(logs);
  });

  // Get log by date (for duplicate detection)
  app.get("/api/logs/:date", authenticateDual, async (req, res) => {
    const userId = getUserId(req);
    const { date } = req.params;
    const log = await storage.getLogByDate(userId, date);
    if (!log) {
      return res.status(404).json({ message: "No log found for this date" });
    }
    res.json(log);
  });

  app.post(api.logs.create.path, authenticateDual, async (req, res) => {
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

  // Update existing log
  app.put("/api/logs/:id", authenticateDual, async (req, res) => {
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

  app.post(api.logs.generateSummary.path, authenticateDual, async (req, res) => {
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
  app.get(api.ideas.list.path, authenticateDual, async (req, res) => {
    const userId = getUserId(req);
    const ideas = await storage.getIdeas(userId);
    res.json(ideas);
  });

  app.post(api.ideas.create.path, authenticateDual, async (req, res) => {
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

  app.put(api.ideas.update.path, authenticateDual, async (req, res) => {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    // Strip userId from payload to prevent authorization bypass
    const { userId: _, ...updates } = req.body;
    const updated = await storage.updateIdea(userId, id, updates);
    res.json(updated);
  });

  app.post(api.ideas.runRealityCheck.path, authenticateDual, async (req, res) => {
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
  app.get(api.teaching.list.path, authenticateDual, async (req, res) => {
    const userId = getUserId(req);
    const reqs = await storage.getTeachingRequests(userId);
    res.json(reqs);
  });

  app.post(api.teaching.create.path, authenticateDual, async (req, res) => {
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
  app.post(api.harris.create.path, authenticateDual, async (req, res) => {
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
  app.get(api.settings.list.path, authenticateDual, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.put(api.settings.update.path, authenticateDual, async (req, res) => {
    const key = req.params.key;
    const { value } = req.body;
    const updated = await storage.updateSetting(key, value);
    res.json(updated);
  });

  // ==================== GOALS ====================

  app.get(api.goals.list.path, authenticateDual, async (req, res) => {
    const userId = getUserId(req);
    const goals = await storage.getGoals(userId);
    res.json(goals);
  });

  app.post(api.goals.create.path, authenticateDual, async (req, res) => {
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

  app.put(api.goals.update.path, authenticateDual, async (req, res) => {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    const { userId: _, ...updates } = req.body;
    const updated = await storage.updateGoal(userId, id, updates);
    if (!updated) return res.status(404).json({ message: "Goal not found" });
    res.json(updated);
  });

  // ==================== CHECKINS ====================

  app.get(api.checkins.list.path, authenticateDual, async (req, res) => {
    const userId = getUserId(req);
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const checkins = await storage.getCheckins(userId, startDate, endDate);
    res.json(checkins);
  });

  app.post(api.checkins.upsert.path, authenticateDual, async (req, res) => {
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

  // ==================== FEATURE FACTORY ====================

  app.post("/api/features/generate", authenticateDual, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { title, spec } = req.body;

      // 1. Create the request record
      const request = await storage.createFeatureRequest(userId, {
        title,
        spec,
        status: "generating"
      });

      // 2. Generate the code (async)
      // Note: In production, this should be a background job. For now we await.
      const generated = await generateFeature(spec);

      // 3. Update the record
      const updated = await storage.updateFeatureRequest(userId, request.id!, {
        generatedSchema: generated.schema,
        generatedApi: generated.server,
        generatedUi: generated.client,
        status: "completed"
      });

      res.json(updated);

    } catch (err) {
      console.error("Feature generation failed:", err);
      res.status(500).json({ message: "Failed to generate feature" });
    }
  });

  app.get("/api/features", authenticateDual, async (req, res) => {
    const userId = getUserId(req);
    const requests = await storage.getFeatureRequests(userId);
    res.json(requests);
  });

  app.post(api.checkins.batch.path, authenticateDual, async (req, res) => {
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

  app.get(api.weeklyReview.get.path, authenticateDual, async (req, res) => {
    const userId = getUserId(req);
    const review = await storage.getWeeklyReview(userId);
    res.json(review);
  });

  app.get(api.weeklyReview.exportPdf.path, authenticateDual, async (req, res) => {
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
  app.post("/api/review/weekly/insight", authenticateDual, async (req, res) => {
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
  app.post("/api/chat", authenticateDual, async (req, res) => {
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
- Keep responses under 3 sentences unless asked for more detail
- Be direct and practical, not prescriptive or preachy
- Focus on structure and systems, not motivation
- Never touch family data or personal relationships
- Reference Bruce's actual data when relevant`;

    if (context) {
      systemPrompt += `\n\nBRUCE'S CURRENT DATA:\n${context}`;
    }

    // Get the last user message for the prompt
    const lastMessage = messages[messages.length - 1];

    // Build conversation history for context (last 5 messages)
    const recentHistory = messages.slice(-6, -1).map((m: any) =>
      `${m.role === 'user' ? 'Bruce' : 'Steward'}: ${m.content}`
    ).join('\n');

    const fullPrompt = recentHistory
      ? `Previous conversation:\n${recentHistory}\n\nBruce: ${lastMessage.content}`
      : lastMessage.content;

    try {
      const response = await callAI(fullPrompt, systemPrompt);
      res.json({ response, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error("Chat failed:", err);
      res.status(500).json({ message: "Chat failed", error: (err as Error).message });
    }
  });

  // ==================== LAB (AI PLAYGROUND) ====================

  // Lab prompt endpoint - sends prompt to AI with custom persona system prompt
  // Uses callAIWithFullPrompt to bypass Bruce context for pure persona behavior
  app.post("/api/lab/prompt", authenticateDual, async (req, res) => {
    const { prompt, systemPrompt } = req.body;

    if (!prompt || !systemPrompt) {
      return res.status(400).json({ message: "Prompt and systemPrompt are required" });
    }

    try {
      const response = await callAIWithFullPrompt(prompt, systemPrompt);
      res.json({ response, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error("Lab prompt failed:", err);
      res.status(500).json({ message: "Lab prompt failed", error: (err as Error).message });
    }
  });

  // ==================== TRANSCRIPTS (THINKOPS BRAINDUMPS) ====================

  app.get("/api/transcripts", authenticateDual, async (req, res) => {
    const userId = getUserId(req);
    const transcripts = await storage.getTranscripts(userId);
    res.json(transcripts);
  });

  app.get("/api/transcripts/stats", authenticateDual, async (req, res) => {
    const userId = getUserId(req);
    const stats = await storage.getTranscriptStats(userId);
    res.json(stats);
  });

  app.get("/api/transcripts/:id", authenticateDual, async (req, res) => {
    const userId = getUserId(req);
    const transcript = await storage.getTranscript(userId, parseInt(req.params.id));
    if (!transcript) return res.status(404).json({ error: "Transcript not found" });
    res.json(transcript);
  });

  app.post("/api/transcripts", authenticateDual, async (req, res) => {
    const userId = getUserId(req);
    const { title, content, fileName, sessionDate, participants } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    const transcript = await storage.createTranscript(userId, {
      title, content, fileName, sessionDate, participants
    });
    res.json(transcript);
  });

  app.post("/api/transcripts/:id/analyze", authenticateDual, async (req, res) => {
    const userId = getUserId(req);
    const transcript = await storage.getTranscript(userId, parseInt(req.params.id));
    if (!transcript) return res.status(404).json({ error: "Transcript not found" });

    // Truncate very long transcripts to avoid token limits (keep first ~8000 chars)
    const MAX_CONTENT_LENGTH = 8000;
    let contentToAnalyze = transcript.content;
    let truncated = false;
    if (contentToAnalyze.length > MAX_CONTENT_LENGTH) {
      contentToAnalyze = contentToAnalyze.slice(0, MAX_CONTENT_LENGTH) + "\n\n[... transcript truncated for analysis ...]";
      truncated = true;
      console.log(`Transcript ${transcript.id} truncated from ${transcript.content.length} to ${MAX_CONTENT_LENGTH} chars`);
    }

    const analysisPrompt = `Analyze this brainstorming transcript and extract patterns. Return ONLY a valid JSON object (no markdown, no explanation) with exactly these fields:
{
  "patterns": {
    "topics": [{"text": "theme name", "count": 1, "quotes": ["quote"]}],
    "actions": [{"text": "action item", "count": 1, "quotes": ["context"]}],
    "questions": [{"text": "question", "count": 1, "quotes": ["full question"]}],
    "energy": [{"text": "high", "count": 1, "quotes": ["indicator"]}],
    "connections": [{"text": "related idea", "count": 1, "quotes": ["reference"]}]
  },
  "topThemes": [{"theme": "name", "count": 1, "quotes": ["quote"]}],
  "scorecard": {
    "totalWords": ${transcript.wordCount},
    "uniqueTopics": 3,
    "actionItems": 2,
    "questions": 2,
    "energyLevel": "high",
    "topTheme": "main topic"
  }
}

TRANSCRIPT:
${contentToAnalyze}`;

    const lanePrompt = `You are analyzing brainstorming transcripts for ThinkOps pattern detection.
Return ONLY valid JSON - no markdown code blocks, no explanation text.
Focus on identifying recurring themes, actionable ideas, open questions, and connections.
Limit each category to top 5 items maximum.`;

    try {
      console.log(`Analyzing transcript ${transcript.id} (${transcript.wordCount} words, ${truncated ? 'truncated' : 'full'})`);
      const aiResponse = await callAI(analysisPrompt, lanePrompt);
      console.log(`AI response received (${aiResponse.length} chars)`);

      let analysisData;
      try {
        // Try to extract JSON from response (handles markdown code blocks too)
        let jsonStr = aiResponse;

        // Remove markdown code blocks if present
        const codeBlockMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1].trim();
        }

        // Find JSON object
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError: any) {
        console.error("JSON parse error:", parseError.message);
        console.error("Raw AI response:", aiResponse.slice(0, 500));
        return res.status(500).json({
          error: "Failed to parse AI analysis",
          parseError: parseError.message,
          raw: aiResponse.slice(0, 1000)
        });
      }

      const updated = await storage.updateTranscript(userId, transcript.id, {
        patterns: analysisData.patterns,
        topThemes: analysisData.topThemes,
        scorecard: analysisData.scorecard,
        analyzed: true
      });

      res.json({ ...updated, truncated });
    } catch (error: any) {
      console.error("Transcript analysis error:", error);
      res.status(500).json({ error: error.message || "Analysis failed" });
    }
  });

  app.delete("/api/transcripts/:id", authenticateDual, async (req, res) => {
    const userId = getUserId(req);
    await storage.deleteTranscript(userId, parseInt(req.params.id));
    res.json({ success: true });
  });

  // ==================== DATA EXPORT ====================

  app.get("/api/export/data", authenticateDual, async (req, res) => {
    const userId = getUserId(req);

    const [logs, ideas, goals, checkins, teaching, harris, settings, transcripts] = await Promise.all([
      storage.getLogs(userId),
      storage.getIdeas(userId),
      storage.getGoals(userId),
      storage.getCheckins(userId),
      storage.getTeachingRequests(userId),
      storage.getHarrisContent(userId),
      storage.getSettings(),
      storage.getTranscripts(userId),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      version: "1.0.0",
      data: {
        logs,
        ideas,
        goals,
        checkins,
        teachingRequests: teaching,
        harrisContent: harris,
        transcripts,
        settings
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="bruceops-export.json"');
    res.json(exportData);
  });

  // ==================== GOOGLE DRIVE ====================
  // Disabled in standalone mode (requires Replit connector)

  const driveDisabledResponse = {
    error: "Google Drive sync is not available in standalone mode",
    standalone_mode: true,
    suggestion: "Use the data export feature (/api/export/data) for backups"
  };

  // List files from Google Drive
  app.get("/api/drive/files", authenticateDual, async (req, res) => {
    if (isStandalone) {
      return res.status(503).json(driveDisabledResponse);
    }
    try {
      const { listDriveFiles } = await import("./google-drive");
      const query = req.query.q as string | undefined;
      const files = await listDriveFiles(query);
      res.json({ files });
    } catch (error: any) {
      console.error("Google Drive list error:", error);
      res.status(500).json({ error: error.message || "Failed to list files" });
    }
  });

  // Upload file to Google Drive
  app.post("/api/drive/upload", authenticateDual, async (req, res) => {
    if (isStandalone) {
      return res.status(503).json(driveDisabledResponse);
    }
    try {
      const { uploadToDrive } = await import("./google-drive");
      const { name, content, mimeType } = req.body;
      if (!name || !content) {
        return res.status(400).json({ error: "Name and content are required" });
      }
      const file = await uploadToDrive(name, content, mimeType);
      res.json({ file });
    } catch (error: any) {
      console.error("Google Drive upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload file" });
    }
  });

  // Download file from Google Drive
  app.get("/api/drive/download/:fileId", authenticateDual, async (req, res) => {
    if (isStandalone) {
      return res.status(503).json(driveDisabledResponse);
    }
    try {
      const { downloadFromDrive } = await import("./google-drive");
      const content = await downloadFromDrive(req.params.fileId);
      res.json({ content });
    } catch (error: any) {
      console.error("Google Drive download error:", error);
      res.status(500).json({ error: error.message || "Failed to download file" });
    }
  });

  // Create folder in Google Drive
  app.post("/api/drive/folder", authenticateDual, async (req, res) => {
    if (isStandalone) {
      return res.status(503).json(driveDisabledResponse);
    }
    try {
      const { createDriveFolder } = await import("./google-drive");
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Folder name is required" });
      }
      const folder = await createDriveFolder(name);
      res.json({ folder });
    } catch (error: any) {
      console.error("Google Drive folder error:", error);
      res.status(500).json({ error: error.message || "Failed to create folder" });
    }
  });

  // ==================== AI CACHE & QUOTA SYSTEM ====================
  const aiCache = new Map<string, { response: string; timestamp: number; userId: string }>();
  const AI_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  const dailyQuotas = new Map<string, { date: string; count: number }>();
  const DAILY_QUOTA_LIMIT = 100;

  function checkQuota(userId: string): void {
    const today = new Date().toISOString().split('T')[0];
    const quotaKey = `${userId}-${today}`;

    let quota = dailyQuotas.get(quotaKey);
    if (!quota || quota.date !== today) {
      quota = { date: today, count: 0 };
      dailyQuotas.set(quotaKey, quota);
    }

    if (quota.count >= DAILY_QUOTA_LIMIT) {
      throw new Error(`Daily AI quota exceeded (${DAILY_QUOTA_LIMIT} calls/day). Resets at midnight.`);
    }

    quota.count++;
  }

  async function callAIWithCache(userId: string, prompt: string, systemPrompt: string): Promise<{ response: string; cached: boolean }> {
    // Use SHA-256 hash of full prompt + system prompt for unique cache key
    const contentHash = createHash('sha256').update(systemPrompt + prompt).digest('hex');
    const cacheKey = `${userId}:${contentHash}`;

    const cached = aiCache.get(cacheKey);
    if (cached && cached.userId === userId && Date.now() - cached.timestamp < AI_CACHE_TTL) {
      console.log('AI Cache HIT:', cacheKey.slice(0, 50));
      return { response: cached.response, cached: true };
    }

    checkQuota(userId);

    console.log('AI Cache MISS - calling API:', cacheKey.slice(0, 50));
    const response = await callAI(prompt, systemPrompt);

    aiCache.set(cacheKey, { response, timestamp: Date.now(), userId });

    return { response, cached: false };
  }

  // ==================== AI COMMAND CENTER ENDPOINTS ====================

  // ==================== DEV-ONLY TEST ENDPOINT (NO AUTH) ====================
  // WARNING: Development only - bypasses authentication for testing
  if (process.env.NODE_ENV !== 'production') {
    const TEST_USER_ID = 'test-user-dev';

    app.get("/api/test/ai/status", async (req, res) => {
      const today = new Date().toISOString().split('T')[0];
      const quotaKey = `${TEST_USER_ID}-${today}`;
      const quota = dailyQuotas.get(quotaKey) || { count: 0, date: today };

      res.json({
        message: 'AI Command Center Test Endpoint',
        testUserId: TEST_USER_ID,
        environment: process.env.NODE_ENV,
        aiProvider: AI_PROVIDER,
        quota: {
          used: quota.count,
          limit: DAILY_QUOTA_LIMIT,
          remaining: DAILY_QUOTA_LIMIT - quota.count
        },
        cache: {
          size: aiCache.size,
          ttlHours: AI_CACHE_TTL / (1000 * 60 * 60)
        }
      });
    });

    app.post("/api/test/ai/search", async (req, res) => {
      try {
        const { query, limit = 10 } = req.body;

        if (!query || typeof query !== 'string') {
          return res.status(400).json({ error: 'Query string required' });
        }

        const allLogs = await storage.getLogs(TEST_USER_ID);
        const searchTerm = query.toLowerCase();
        const filtered = allLogs.filter(log => {
          return JSON.stringify(log).toLowerCase().includes(searchTerm);
        }).slice(0, Number(limit));

        if (filtered.length === 0) {
          return res.json({
            count: 0,
            samples: [],
            insight: 'No logs found matching your search (test user has no data).',
            cached: false,
            testMode: true
          });
        }

        const prompt = `Analyze these ${filtered.length} log entries that match the search "${query}".
        
Logs: ${JSON.stringify(filtered.map(l => ({
          date: l.date,
          energy: l.energy,
          stress: l.stress,
          mood: l.mood,
          topWin: l.topWin,
          topFriction: l.topFriction
        })))}

Provide a 2-3 sentence insight about patterns you notice.`;

        const { response: insight, cached } = await callAIWithCache(
          TEST_USER_ID,
          prompt,
          "You are a Life Operations analyst. Identify patterns and provide factual observations."
        );

        const today = new Date().toISOString().split('T')[0];
        res.json({
          count: filtered.length,
          samples: filtered,
          insight,
          cached,
          testMode: true,
          quotaRemaining: DAILY_QUOTA_LIMIT - (dailyQuotas.get(`${TEST_USER_ID}-${today}`)?.count || 0)
        });

      } catch (err: any) {
        console.error('Test AI Search error:', err);
        const isQuotaError = err.message?.includes('quota exceeded');
        res.status(isQuotaError ? 429 : 500).json({ error: err.message || 'Search failed', testMode: true });
      }
    });

    app.post("/api/test/ai/squad", async (req, res) => {
      try {
        const { question } = req.body;

        if (!question || typeof question !== 'string') {
          return res.status(400).json({ error: 'Question string required' });
        }

        const prompt = `${question}

Provide a systems-thinking perspective in 2-3 sentences. Focus on interconnections and patterns.`;

        const { response, cached } = await callAIWithCache(
          TEST_USER_ID,
          prompt,
          "You are an AI advisor providing multi-perspective analysis."
        );

        const today = new Date().toISOString().split('T')[0];
        res.json({
          perspectives: { systems: response },
          cached,
          testMode: true,
          quotaRemaining: DAILY_QUOTA_LIMIT - (dailyQuotas.get(`${TEST_USER_ID}-${today}`)?.count || 0)
        });

      } catch (err: any) {
        console.error('Test AI Squad error:', err);
        const isQuotaError = err.message?.includes('quota exceeded');
        res.status(isQuotaError ? 429 : 500).json({ error: err.message || 'Squad query failed', testMode: true });
      }
    });

    app.post("/api/test/ai/cache/clear", async (req, res) => {
      const sizeBefore = aiCache.size;
      aiCache.clear();
      res.json({
        message: 'Cache cleared',
        entriesCleared: sizeBefore,
        testMode: true
      });
    });

    console.log('⚠️  DEV MODE: Test endpoints enabled at /api/test/ai/*');
  }
  // ==================== END DEV-ONLY TEST ENDPOINTS ====================

  // 1. Smart Search - AI-powered search with analysis
  app.post("/api/ai/search", authenticateDual, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { query, limit = 10 } = req.body;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query string required' });
      }

      const allLogs = await storage.getLogs(userId);
      const searchTerm = query.toLowerCase();
      const filtered = allLogs.filter(log => {
        return JSON.stringify(log).toLowerCase().includes(searchTerm);
      }).slice(0, Number(limit));

      if (filtered.length === 0) {
        return res.json({
          count: 0,
          samples: [],
          insight: 'No logs found matching your search.',
          cached: false
        });
      }

      const prompt = `Analyze these ${filtered.length} log entries that match the search "${query}".
      
Logs: ${JSON.stringify(filtered.map(l => ({
        date: l.date,
        energy: l.energy,
        stress: l.stress,
        mood: l.mood,
        topWin: l.topWin,
        topFriction: l.topFriction
      })))}

Provide a 2-3 sentence insight about patterns you notice. Be specific and actionable.`;

      const { response: insight, cached } = await callAIWithCache(
        userId,
        prompt,
        "You are a Life Operations analyst. Identify patterns and provide factual observations."
      );

      const today = new Date().toISOString().split('T')[0];
      res.json({
        count: filtered.length,
        samples: filtered,
        insight,
        cached,
        quotaRemaining: DAILY_QUOTA_LIMIT - (dailyQuotas.get(`${userId}-${today}`)?.count || 0)
      });

    } catch (err: any) {
      console.error('AI Search error:', err);
      const isQuotaError = err.message?.includes('quota exceeded');
      res.status(isQuotaError ? 429 : 500).json({ error: err.message || 'Search failed' });
    }
  });

  // 2. AI Squad Panel - Multi-perspective analysis
  app.post("/api/ai/squad", authenticateDual, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { question } = req.body;

      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: 'Question string required' });
      }

      const claudePrompt = `${question}

Provide a systems-thinking perspective in 2-3 sentences. Focus on interconnections and patterns.`;

      const { response: claudeResponse, cached: claudeCached } = await callAIWithCache(
        userId,
        claudePrompt,
        "You are a systems thinker helping Bruce Harris analyze his personal operating system."
      );

      const today = new Date().toISOString().split('T')[0];
      res.json({
        claude: {
          response: claudeResponse,
          cached: claudeCached,
          perspective: 'Systems Thinking'
        },
        grok: {
          response: "Grok integration pending - add GROK_API_KEY to enable",
          cached: false,
          perspective: 'Data Analysis'
        },
        chatgpt: {
          response: "ChatGPT integration pending - add OPENAI_API_KEY to enable",
          cached: false,
          perspective: 'Action Planning'
        },
        quotaRemaining: DAILY_QUOTA_LIMIT - (dailyQuotas.get(`${userId}-${today}`)?.count || 0)
      });

    } catch (err: any) {
      console.error('AI Squad error:', err);
      const isQuotaError = err.message?.includes('quota exceeded');
      res.status(isQuotaError ? 429 : 500).json({ error: err.message || 'Squad query failed' });
    }
  });

  // 3. Weekly Synthesis - Enhanced narrative report
  app.post("/api/ai/weekly-synthesis", authenticateDual, async (req, res) => {
    try {
      const userId = getUserId(req);
      const review = await storage.getWeeklyReview(userId);

      const prompt = `Generate a narrative weekly summary for Bruce Harris.

STATS:
- Completion Rate: ${review.stats.completionRate}%
- Total Check-ins: ${review.stats.totalCheckins}
- Completed: ${review.stats.completedCheckins}
- Missed Days: ${review.stats.missedDays}

DOMAIN BREAKDOWN:
${Object.entries(review.stats.domainStats || {}).map(([domain, stats]: [string, any]) =>
        `- ${domain}: ${stats.checkins}/${stats.goals * 7} check-ins (${stats.goals} goals)`
      ).join('\n')}

DRIFT FLAGS:
${review.driftFlags.length > 0 ? review.driftFlags.join('\n') : 'None this week'}

ACTIVE GOALS:
${review.goals.slice(0, 5).map(g => `- [${g.domain}] ${g.title} (Priority: ${g.priority})`).join('\n')}

INSTRUCTIONS:
1. Write 3-4 sentences summarizing this week's performance
2. Identify the most significant pattern or trend
3. Suggest ONE specific, actionable adjustment for next week
4. Keep it direct and practical

Format:
[Summary paragraph]

Key Pattern: [One sentence]

This week, [specific action recommendation].`;

      const { response: narrative, cached } = await callAIWithCache(
        userId,
        prompt,
        "You are Bruce's operations steward. Be direct, practical, and focused on actionable insights."
      );

      const today = new Date().toISOString().split('T')[0];
      res.json({
        stats: review.stats,
        goals: review.goals,
        checkins: review.checkins,
        driftFlags: review.driftFlags,
        narrative,
        cached,
        generatedAt: new Date().toISOString(),
        quotaRemaining: DAILY_QUOTA_LIMIT - (dailyQuotas.get(`${userId}-${today}`)?.count || 0)
      });

    } catch (err: any) {
      console.error('Weekly synthesis error:', err);
      const isQuotaError = err.message?.includes('quota exceeded');
      res.status(isQuotaError ? 429 : 500).json({ error: err.message || 'Synthesis failed' });
    }
  });

  // 4. Find Correlations - Pattern detection across metrics
  app.post("/api/ai/correlations", authenticateDual, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { days = 30 } = req.body;

      const allLogs = await storage.getLogs(userId);
      const recentLogs = allLogs.slice(0, Number(days));

      if (recentLogs.length < 7) {
        return res.json({
          error: 'Not enough data',
          message: 'Need at least 7 days of logs to detect correlations'
        });
      }

      const analysisData = recentLogs.map(l => ({
        date: l.date,
        energy: l.energy,
        stress: l.stress,
        mood: l.mood,
        exercise: l.exercise,
        lateScreens: l.lateScreens,
        sleepQuality: l.sleepQuality,
        sleepHours: l.sleepHours
      }));

      const prompt = `Analyze these ${recentLogs.length} days of life metrics and identify correlations.

Data: ${JSON.stringify(analysisData)}

Find 2-3 interesting correlations between variables. For example:
- "Energy is 2 points higher on days following exercise"
- "Stress spikes correlate with late screen usage the night before"

Be specific with numbers. Only report correlations that appear in at least 5 data points.`;

      const { response: correlations, cached } = await callAIWithCache(
        userId,
        prompt,
        "You are a data analyst. Report only statistically significant patterns."
      );

      const today = new Date().toISOString().split('T')[0];
      res.json({
        daysAnalyzed: recentLogs.length,
        correlations,
        cached,
        quotaRemaining: DAILY_QUOTA_LIMIT - (dailyQuotas.get(`${userId}-${today}`)?.count || 0)
      });

    } catch (err: any) {
      console.error('Correlation analysis error:', err);
      const isQuotaError = err.message?.includes('quota exceeded');
      res.status(isQuotaError ? 429 : 500).json({ error: err.message || 'Analysis failed' });
    }
  });

  // 5. AI Quota Status
  app.get("/api/ai/quota", authenticateDual, async (req, res) => {
    const userId = getUserId(req);
    const today = new Date().toISOString().split('T')[0];
    const quotaKey = `${userId}-${today}`;
    const quota = dailyQuotas.get(quotaKey);

    res.json({
      used: quota?.count || 0,
      limit: DAILY_QUOTA_LIMIT,
      remaining: DAILY_QUOTA_LIMIT - (quota?.count || 0),
      resetsAt: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
      cacheSize: aiCache.size
    });
  });

  // 6. Clear Cache - Manual cache invalidation
  app.post("/api/ai/cache/clear", authenticateDual, async (req, res) => {
    const userId = getUserId(req);

    let cleared = 0;
    const entries = Array.from(aiCache.entries());
    for (const [key, value] of entries) {
      if (value.userId === userId) {
        aiCache.delete(key);
        cleared++;
      }
    }

    res.json({
      message: 'Cache cleared',
      entriesCleared: cleared
    });
  });

  return httpServer;
}
