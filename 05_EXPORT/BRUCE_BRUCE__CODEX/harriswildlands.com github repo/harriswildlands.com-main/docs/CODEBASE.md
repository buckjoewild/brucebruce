# BruceOps Codebase Reference

**Complete annotated code documentation with inline explanations**

---

## Table of Contents

1. [Shared Layer](#shared-layer)
   - [schema.ts](#schemats---data-models)
   - [routes.ts](#routests---api-contract)
2. [Backend Layer](#backend-layer)
   - [db.ts](#dbts---database-connection)
   - [storage.ts](#storagets---data-access-layer)
   - [routes.ts](#server-routests---api-handlers)
3. [Frontend Layer](#frontend-layer)
   - [App.tsx](#apptsx---application-root)
   - [Layout.tsx](#layouttsx---navigation-shell)
   - [use-bruce-ops.ts](#use-bruce-optsts---api-hooks)
   - [Page Components](#page-components)
4. [Configuration Files](#configuration-files)

---

## Shared Layer

The shared layer contains code used by both frontend and backend, ensuring type safety across the stack.

### schema.ts - Data Models

**Location:** `shared/schema.ts`

```typescript
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================
// TABLE DEFINITIONS
// Each table corresponds to one of the four lanes + settings
// ============================================================

// Lane 1: LifeOps - Daily logging and pattern tracking
export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  
  // Date in YYYY-MM-DD format for easy querying
  date: text("date").notNull(),
  
  // Quantitative metrics - all on 1-10 scale for consistency
  sleepHours: integer("sleep_hours"),      // Actual hours, not a scale
  energy: integer("energy"),                // 1=exhausted, 10=peak
  stress: integer("stress"),                // 1=calm, 10=overwhelmed
  mood: integer("mood"),                    // 1=low, 10=excellent
  moneyPressure: integer("money_pressure"), // 1=no worry, 10=critical
  
  // Binary habits - quick yes/no tracking
  vaping: boolean("vaping").default(false),
  exercise: boolean("exercise").default(false),
  
  // Qualitative notes - short bullet-style entries
  familyConnection: text("family_connection"),
  topWin: text("top_win"),
  topFriction: text("top_friction"),
  tomorrowPriority: text("tomorrow_priority"),
  faithAlignment: text("faith_alignment"),
  
  // Drift detection - self-awareness prompt
  driftCheck: text("drift_check"),
  
  // Future: voice log transcription
  rawTranscript: text("raw_transcript"),
  
  // AI-generated summary - stored after generation
  aiSummary: text("ai_summary"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Lane 2: ThinkOps - Idea capture and validation pipeline
export const ideas = pgTable("ideas", {
  id: serial("id").primaryKey(),
  
  // Core idea definition (required)
  title: text("title").notNull(),
  
  // The pitch - one sentence explaining the concept
  pitch: text("pitch"),
  
  // Validation questions from ThinkOps Master Sheet
  whoItHelps: text("who_it_helps"),
  painItSolves: text("pain_it_solves"),
  whyICare: text("why_i_care"),
  
  // Time-boxed validation - must be ≤7 days
  tinyTest: text("tiny_test"),
  
  // Workflow status: draft → reality_checked → promoted/discarded/parked
  status: text("status").default("draft"),
  
  // AI Reality Check output - structured JSON
  // { known: [], likely: [], speculation: [], flags: [], decision: "" }
  realityCheck: jsonb("reality_check"),
  
  // Build specs for promoted ideas
  // { spec: "", build: "", verify: "", ship: "" }
  promotedSpec: jsonb("promoted_spec"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Lane 3: Bruce Teaching Assistant - Lesson generation
export const teachingRequests = pgTable("teaching_requests", {
  id: serial("id").primaryKey(),
  
  // Input form fields matching Lane 3 Master Sheet
  grade: text("grade"),              // e.g., "5th", "6th"
  standard: text("standard"),        // e.g., "NGSS 5-LS1-1"
  topic: text("topic"),              // The subject matter
  timeBlock: text("time_block"),     // e.g., "45 minutes"
  materials: text("materials"),      // Available supplies
  studentProfile: text("student_profile"), // ELL/SPED notes
  constraints: text("constraints"),  // Low prep, hands-on, etc.
  assessmentType: text("assessment_type"), // Quiz, exit ticket, etc.
  format: text("format"),            // Printable, slides, etc.
  
  // AI-generated lesson package - full output as JSON
  output: jsonb("output"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Lane 4: HarrisWildlands - Website content generation
export const harrisContent = pgTable("harris_content", {
  id: serial("id").primaryKey(),
  
  // Strategic inputs - structured as JSON objects
  coreMessage: jsonb("core_message"),  // { definition, audience, pain, promise }
  siteMap: jsonb("site_map"),          // { homeGoal, startHereGoal, resourcesGoal, cta }
  leadMagnet: jsonb("lead_magnet"),    // { title, problem, timeToValue, delivery }
  
  // AI-generated website copy
  generatedCopy: jsonb("generated_copy"), // { home, startHere, resources }
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Settings - key-value store for app configuration
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(), // model, tone, advice_mode
  value: text("value").notNull(),
});

// ============================================================
// ZOD SCHEMAS
// Auto-generated from Drizzle tables, with auto-fields omitted
// ============================================================

// Insert schemas - what clients send when creating records
export const insertLogSchema = createInsertSchema(logs)
  .omit({ id: true, createdAt: true, aiSummary: true });
// ^ aiSummary is generated by AI, not provided by user

export const insertIdeaSchema = createInsertSchema(ideas)
  .omit({ id: true, createdAt: true, realityCheck: true, promotedSpec: true });
// ^ realityCheck and promotedSpec are set later in the workflow

export const insertTeachingRequestSchema = createInsertSchema(teachingRequests)
  .omit({ id: true, createdAt: true, output: true });
// ^ output is generated by AI

export const insertHarrisContentSchema = createInsertSchema(harrisContent)
  .omit({ id: true, createdAt: true, generatedCopy: true });
// ^ generatedCopy is AI output

export const insertSettingsSchema = createInsertSchema(settings)
  .omit({ id: true });

// ============================================================
// TYPE EXPORTS
// These types are used throughout frontend and backend
// ============================================================

// Database record types (what you get from SELECT)
export type Log = typeof logs.$inferSelect;
export type Idea = typeof ideas.$inferSelect;
export type TeachingRequest = typeof teachingRequests.$inferSelect;
export type HarrisContent = typeof harrisContent.$inferSelect;
export type Setting = typeof settings.$inferSelect;

// Insert types (what you send to INSERT)
export type InsertLog = z.infer<typeof insertLogSchema>;
export type InsertIdea = z.infer<typeof insertIdeaSchema>;
export type InsertTeachingRequest = z.infer<typeof insertTeachingRequestSchema>;
export type InsertHarrisContent = z.infer<typeof insertHarrisContentSchema>;
export type InsertSetting = z.infer<typeof insertSettingsSchema>;

// API request types - aliases for clarity
export type CreateLogRequest = InsertLog;
export type CreateIdeaRequest = InsertIdea;
export type CreateTeachingRequest = InsertTeachingRequest;
export type CreateHarrisContentRequest = InsertHarrisContent;

// Update types with JSONB fields
export type UpdateIdeaRequest = Partial<InsertIdea> & {
  realityCheck?: any;
  promotedSpec?: any;
  status?: string;
};

// Dashboard response type
export type DashboardStats = {
  logsToday: number;
  openLoops: number;
  driftFlags: string[];
};
```

**Key Design Decisions:**
1. **JSONB for complex data:** `realityCheck`, `promotedSpec`, and AI outputs use JSONB for flexibility
2. **Separate insert schemas:** Omit auto-generated fields to prevent client errors
3. **Status workflow:** Ideas flow through `draft → reality_checked → promoted/parked/discarded`

---

### routes.ts - API Contract

**Location:** `shared/routes.ts`

```typescript
import { z } from 'zod';
import { 
  insertLogSchema, 
  insertIdeaSchema, 
  insertTeachingRequestSchema, 
  insertHarrisContentSchema,
  logs, ideas, teachingRequests, harrisContent, settings
} from './schema';

// ============================================================
// SHARED ERROR SCHEMAS
// Consistent error responses across all endpoints
// ============================================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(), // Which field failed validation
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================================
// API CONTRACT
// Single source of truth for all endpoints
// Both frontend hooks and backend routes import this
// ============================================================
export const api = {
  
  // Dashboard endpoint - aggregates stats from all lanes
  dashboard: {
    get: {
      method: 'GET' as const,
      path: '/api/dashboard',
      responses: {
        200: z.object({
          logsToday: z.number(),
          openLoops: z.number(),
          driftFlags: z.array(z.string()),
        }),
      },
    },
  },
  
  // LifeOps endpoints
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/logs',
      responses: {
        200: z.array(z.custom<typeof logs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/logs',
      input: insertLogSchema,
      responses: {
        201: z.custom<typeof logs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    generateSummary: {
      method: 'POST' as const,
      path: '/api/logs/summary',
      input: z.object({ date: z.string() }), // YYYY-MM-DD format
      responses: {
        200: z.object({ summary: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
  
  // ThinkOps endpoints
  ideas: {
    list: {
      method: 'GET' as const,
      path: '/api/ideas',
      responses: {
        200: z.array(z.custom<typeof ideas.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/ideas',
      input: insertIdeaSchema,
      responses: {
        201: z.custom<typeof ideas.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/ideas/:id',  // :id is replaced via buildUrl()
      input: z.object({
        status: z.string().optional(),
        promotedSpec: z.any().optional(),
        title: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof ideas.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    runRealityCheck: {
      method: 'POST' as const,
      path: '/api/ideas/:id/reality-check',
      responses: {
        200: z.custom<typeof ideas.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  
  // Teaching Assistant endpoints
  teaching: {
    list: {
      method: 'GET' as const,
      path: '/api/teaching',
      responses: {
        200: z.array(z.custom<typeof teachingRequests.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/teaching',
      input: insertTeachingRequestSchema,
      responses: {
        201: z.custom<typeof teachingRequests.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  
  // HarrisWildlands endpoints
  harris: {
    create: {
      method: 'POST' as const,
      path: '/api/harris',
      input: insertHarrisContentSchema,
      responses: {
        201: z.custom<typeof harrisContent.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  
  // Settings endpoints
  settings: {
    list: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.array(z.custom<typeof settings.$inferSelect>()),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/settings/:key',
      input: z.object({ value: z.string() }),
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
  },
};

// ============================================================
// URL BUILDER
// Replaces :param placeholders with actual values
// Used by frontend hooks for dynamic routes
// ============================================================
export function buildUrl(
  path: string, 
  params?: Record<string, string | number>
): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// Usage example:
// buildUrl('/api/ideas/:id', { id: 42 }) → '/api/ideas/42'
```

**Key Benefits:**
1. **Single source of truth:** Both frontend and backend reference the same contract
2. **Runtime validation:** Zod schemas validate requests and responses
3. **Type inference:** TypeScript infers types from Zod schemas
4. **URL generation:** `buildUrl()` handles parameterized routes

---

## Backend Layer

### db.ts - Database Connection

**Location:** `server/db.ts`

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Environment variable check - fail fast if not configured
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// PostgreSQL connection pool for efficient connection reuse
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Drizzle ORM instance with schema for type-safe queries
export const db = drizzle(pool, { schema });
```

**Notes:**
- Uses connection pooling for performance
- Schema import enables type-safe query building
- Fails immediately if DATABASE_URL is missing

---

### storage.ts - Data Access Layer

**Location:** `server/storage.ts`

```typescript
import { db } from "./db";
import {
  logs, ideas, teachingRequests, harrisContent, settings,
  type InsertLog, type InsertIdea, type InsertTeachingRequest, 
  type InsertHarrisContent,
  type Log, type Idea, type TeachingRequest, type HarrisContent, type Setting
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

// ============================================================
// STORAGE INTERFACE
// Defines all CRUD operations for the application
// Enables easy mocking for tests
// ============================================================
export interface IStorage {
  // Logs (LifeOps)
  getLogs(): Promise<Log[]>;
  createLog(log: InsertLog): Promise<Log>;
  getLogByDate(date: string): Promise<Log | undefined>;
  updateLogSummary(id: number, summary: string): Promise<Log>;
  
  // Ideas (ThinkOps)
  getIdeas(): Promise<Idea[]>;
  getIdea(id: number): Promise<Idea | undefined>;
  createIdea(idea: InsertIdea): Promise<Idea>;
  updateIdea(id: number, updates: Partial<Idea>): Promise<Idea>;
  
  // Teaching
  getTeachingRequests(): Promise<TeachingRequest[]>;
  createTeachingRequest(req: InsertTeachingRequest, output: any): Promise<TeachingRequest>;
  
  // Harris
  getHarrisContent(): Promise<HarrisContent[]>;
  createHarrisContent(content: InsertHarrisContent, generatedCopy: any): Promise<HarrisContent>;
  
  // Settings
  getSettings(): Promise<Setting[]>;
  updateSetting(key: string, value: string): Promise<Setting>;
  
  // Dashboard aggregation
  getDashboardStats(): Promise<{ logsToday: number; openLoops: number }>;
}

// ============================================================
// DATABASE IMPLEMENTATION
// Uses Drizzle ORM for type-safe queries
// ============================================================
export class DatabaseStorage implements IStorage {
  
  // -------------------- LOGS --------------------
  
  async getLogs(): Promise<Log[]> {
    // Most recent logs first
    return await db.select().from(logs).orderBy(desc(logs.date));
  }

  async createLog(log: InsertLog): Promise<Log> {
    // Insert and return the created record
    const [newLog] = await db.insert(logs).values(log).returning();
    return newLog;
  }

  async getLogByDate(date: string): Promise<Log | undefined> {
    // Find log for specific date (for summary generation)
    const [log] = await db.select().from(logs).where(eq(logs.date, date));
    return log;
  }

  async updateLogSummary(id: number, summary: string): Promise<Log> {
    // Update only the AI summary field
    const [updated] = await db.update(logs)
      .set({ aiSummary: summary })
      .where(eq(logs.id, id))
      .returning();
    return updated;
  }

  // -------------------- IDEAS --------------------
  
  async getIdeas(): Promise<Idea[]> {
    return await db.select().from(ideas).orderBy(desc(ideas.createdAt));
  }

  async getIdea(id: number): Promise<Idea | undefined> {
    const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
    return idea;
  }

  async createIdea(idea: InsertIdea): Promise<Idea> {
    const [newIdea] = await db.insert(ideas).values(idea).returning();
    return newIdea;
  }

  async updateIdea(id: number, updates: Partial<Idea>): Promise<Idea> {
    // Partial update - only provided fields are changed
    const [updated] = await db.update(ideas)
      .set(updates)
      .where(eq(ideas.id, id))
      .returning();
    return updated;
  }

  // -------------------- TEACHING --------------------
  
  async getTeachingRequests(): Promise<TeachingRequest[]> {
    return await db.select()
      .from(teachingRequests)
      .orderBy(desc(teachingRequests.createdAt));
  }

  async createTeachingRequest(
    req: InsertTeachingRequest, 
    output: any  // AI-generated content
  ): Promise<TeachingRequest> {
    // Combine user input with AI output
    const [newReq] = await db.insert(teachingRequests)
      .values({ ...req, output })
      .returning();
    return newReq;
  }

  // -------------------- HARRIS --------------------
  
  async getHarrisContent(): Promise<HarrisContent[]> {
    return await db.select()
      .from(harrisContent)
      .orderBy(desc(harrisContent.createdAt));
  }

  async createHarrisContent(
    content: InsertHarrisContent, 
    generatedCopy: any  // AI-generated website copy
  ): Promise<HarrisContent> {
    const [newContent] = await db.insert(harrisContent)
      .values({ ...content, generatedCopy })
      .returning();
    return newContent;
  }

  // -------------------- SETTINGS --------------------
  
  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  async updateSetting(key: string, value: string): Promise<Setting> {
    // Upsert pattern - insert or update on conflict
    const [updated] = await db.insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value }
      })
      .returning();
    return updated;
  }

  // -------------------- DASHBOARD --------------------
  
  async getDashboardStats(): Promise<{ logsToday: number; openLoops: number }> {
    const today = new Date().toISOString().split('T')[0];
    
    // Count logs for today
    const logsToday = await db.select({ count: sql<number>`count(*)` })
      .from(logs)
      .where(eq(logs.date, today));
    
    // Count ideas in 'draft' status (open loops needing attention)
    const loops = await db.select({ count: sql<number>`count(*)` })
      .from(ideas)
      .where(eq(ideas.status, 'draft'));

    return {
      logsToday: Number(logsToday[0]?.count || 0),
      openLoops: Number(loops[0]?.count || 0),
    };
  }
}

// Singleton instance - use this throughout the app
export const storage = new DatabaseStorage();
```

**Pattern Highlights:**
1. **Interface-first:** `IStorage` enables dependency injection and testing
2. **Single responsibility:** Each method does one thing
3. **Upsert for settings:** `onConflictDoUpdate` prevents duplicate keys
4. **AI output separation:** Teaching/Harris methods accept pre-generated AI content

---

### server/routes.ts - API Handlers

**Location:** `server/routes.ts`

```typescript
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

// Get API key from environment
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// ============================================================
// OPENROUTER AI INTEGRATION
// Centralized function for all AI calls
// ============================================================
async function callOpenRouter(
  prompt: string, 
  systemPrompt: string = "You are a helpful assistant."
) {
  // Graceful degradation if key not set
  if (!OPENROUTER_API_KEY) {
    console.warn("OPENROUTER_API_KEY not set, returning mock response");
    return "AI generation unavailable. Please set OPENROUTER_API_KEY.";
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // Cost-effective, fast
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
      })
    });

    const data = await response.json();
    if (!response.ok) {
       console.error("OpenRouter API error:", data);
       throw new Error(`OpenRouter API error: ${JSON.stringify(data)}`);
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI Call failed:", error);
    return "Error generating AI response.";
  }
}

// ============================================================
// ROUTE REGISTRATION
// Uses the shared API contract for paths
// ============================================================
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // -------------------- DASHBOARD --------------------
  
  app.get(api.dashboard.get.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    
    // TODO: Implement real drift detection algorithm
    // Currently mocked based on requirements
    const driftFlags = [
      "Sleep consistency < 70%", 
      "High stress pattern detected"
    ]; 
    
    res.json({ ...stats, driftFlags });
  });

  // -------------------- LIFEOPS (LOGS) --------------------
  
  app.get(api.logs.list.path, async (req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  app.post(api.logs.create.path, async (req, res) => {
    try {
      // Validate input against Zod schema
      const input = api.logs.create.input.parse(req.body);
      const log = await storage.createLog(input);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.logs.generateSummary.path, async (req, res) => {
    const { date } = req.body;
    const log = await storage.getLogByDate(date);
    
    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    // LifeOps-specific AI prompt
    // Key: "factual summaries only, no advice"
    const prompt = `Generate a factual summary for this daily log. 
      Avoid advice. Identify pattern signals.
      Log Data: ${JSON.stringify(log)}`;
    
    const summary = await callOpenRouter(
      prompt, 
      "You are a Life Operations Steward. Output factual/pattern-based summaries only."
    );
    
    const updated = await storage.updateLogSummary(log.id, summary);
    res.json({ summary: updated.aiSummary });
  });

  // -------------------- THINKOPS (IDEAS) --------------------
  
  app.get(api.ideas.list.path, async (req, res) => {
    const ideas = await storage.getIdeas();
    res.json(ideas);
  });

  app.post(api.ideas.create.path, async (req, res) => {
    try {
      const input = api.ideas.create.input.parse(req.body);
      const idea = await storage.createIdea(input);
      res.status(201).json(idea);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.ideas.update.path, async (req, res) => {
     // NOTE: This route does NOT validate req.body with Zod
     // Future enhancement: Add validation like other POST routes
     const id = Number(req.params.id);
     const updated = await storage.updateIdea(id, req.body);
     res.json(updated);
  });

  app.post(api.ideas.runRealityCheck.path, async (req, res) => {
    const id = Number(req.params.id);
    const idea = await storage.getIdea(id);
    
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    // ThinkOps Reality Check prompt
    // Structured JSON output for parsing
    const prompt = `Perform a Reality Check on this idea. 
      Separate into Known, Likely, Speculation. 
      Flag self-deception (Overbuilding, Perfectionism, etc).
      Suggest a decision bin (Discard, Park, Salvage, Promote).
      
      Idea: ${JSON.stringify(idea)}
      
      Return pure JSON format: 
      { "known": [], "likely": [], "speculation": [], "flags": [], "decision": "" }`;

    const response = await callOpenRouter(
      prompt, 
      "You are a ruthless but helpful product manager. JSON output only."
    );
    
    // Extract JSON from response (AI sometimes adds text around it)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const realityCheck = jsonMatch 
      ? JSON.parse(jsonMatch[0]) 
      : { error: "Failed to parse AI response", raw: response };

    const updated = await storage.updateIdea(id, { 
      realityCheck, 
      status: "reality_checked" 
    });
    
    res.json(updated);
  });

  // -------------------- TEACHING ASSISTANT --------------------
  
  app.get(api.teaching.list.path, async (req, res) => {
    const reqs = await storage.getTeachingRequests();
    res.json(reqs);
  });

  app.post(api.teaching.create.path, async (req, res) => {
    try {
      const input = api.teaching.create.input.parse(req.body);
      
      // Bruce Teaching Assistant prompt
      const prompt = `You are Bruce, a 5th-6th grade teaching assistant.
        Input: ${JSON.stringify(input)}
        Build: 
        (1) lesson outline, 
        (2) hands-on activity, 
        (3) exit ticket + key, 
        (4) differentiation, 
        (5) 10-min prep list.
        Return JSON format.`;
      
      const response = await callOpenRouter(
        prompt, 
        "You are a strict standards-aligned teaching assistant. JSON output only."
      );
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const output = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: response };

      const newReq = await storage.createTeachingRequest(input, output);
      res.status(201).json(newReq);
    } catch (err) {
      console.log(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // -------------------- HARRIS WILDLANDS --------------------
  
  app.post(api.harris.create.path, async (req, res) => {
    try {
      const input = api.harris.create.input.parse(req.body);
      
      // Website copy generation prompt
      const prompt = `Write conversion-focused website copy for HarrisWildlands.com.
        Core Message: ${JSON.stringify(input.coreMessage)}
        Site Map: ${JSON.stringify(input.siteMap)}
        Lead Magnet: ${JSON.stringify(input.leadMagnet)}
        
        Output JSON with keys: home, startHere, resources. 
        Keep it simple and honest.`;
      
      const response = await callOpenRouter(
        prompt, 
        "You are a copywriter for a dad/teacher audience. No hype. JSON output only."
      );
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const generatedCopy = jsonMatch 
        ? JSON.parse(jsonMatch[0]) 
        : { raw: response };

      const content = await storage.createHarrisContent(input, generatedCopy);
      res.status(201).json(content);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // -------------------- SETTINGS --------------------
  
  app.get(api.settings.list.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.put(api.settings.update.path, async (req, res) => {
    const key = req.params.key;
    const { value } = req.body;
    const updated = await storage.updateSetting(key, value);
    res.json(updated);
  });

  return httpServer;
}
```

---

## Frontend Layer

### App.tsx - Application Root

**Location:** `client/src/App.tsx`

```typescript
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";

// Page imports
import Dashboard from "@/pages/Dashboard";
import LifeOps from "@/pages/LifeOps";
import ThinkOps from "@/pages/ThinkOps";
import TeachingAssistant from "@/pages/TeachingAssistant";
import HarrisWildlands from "@/pages/HarrisWildlands";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

// Router component - defines all application routes
function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/life-ops" component={LifeOps} />
        <Route path="/think-ops" component={ThinkOps} />
        <Route path="/teaching" component={TeachingAssistant} />
        <Route path="/harris" component={HarrisWildlands} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

// Root App component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
```

**Structure:**
- `QueryClientProvider` - Enables TanStack Query throughout the app
- `TooltipProvider` - Enables tooltips from Shadcn
- `Layout` - Wraps all pages with sidebar navigation
- `Toaster` - Toast notifications

---

### Layout.tsx - Navigation Shell

**Location:** `client/src/components/Layout.tsx`

Key features:
- Responsive sidebar (desktop) / hamburger menu (mobile)
- Active route highlighting
- Animated navigation transitions
- BruceOps branding

---

### use-bruce-ops.ts - API Hooks

**Location:** `client/src/hooks/use-bruce-ops.ts`

This file contains all TanStack Query hooks for data fetching and mutations:

| Hook | Purpose |
|------|---------|
| `useDashboardStats()` | Fetch dashboard data |
| `useLogs()` | Fetch all logs |
| `useCreateLog()` | Create new log |
| `useIdeas()` | Fetch all ideas |
| `useCreateIdea()` | Create new idea |
| `useUpdateIdea()` | Update idea status |
| `useRealityCheck()` | Trigger AI reality check |
| `useTeachingRequests()` | Fetch teaching requests |
| `useCreateTeachingRequest()` | Generate lesson plan |
| `useCreateHarrisContent()` | Generate website copy |

Each mutation hook:
1. Invalidates relevant query caches on success
2. Shows toast notification
3. Handles errors gracefully

---

## Page Components

### Dashboard.tsx
- Displays today's status cards
- Shows drift flags if detected
- Uses Framer Motion for staggered animations

### LifeOps.tsx
- Tab 1: Daily log form with sliders and toggles
- Tab 2: History view with AI summaries
- Uses react-hook-form with Zod validation

### ThinkOps.tsx
- Tab 1: Inbox (draft ideas)
- Tab 2: Reality Check (process ideas)
- Tab 3: Build & Ship (promoted ideas)
- Modal for new idea capture

### TeachingAssistant.tsx
- Split view: request list + form/output
- Generated content displayed as formatted JSON
- Print/export functionality

### HarrisWildlands.tsx
- Strategic input form
- Generated content display area
- Green-themed branding

### Settings.tsx
- Model selection dropdown
- Tone preference settings
- Save preferences button

---

## Configuration Files

### Key Files
| File | Purpose |
|------|---------|
| `vite.config.ts` | Build configuration, path aliases |
| `tailwind.config.ts` | Theme, colors, fonts |
| `drizzle.config.ts` | Database migration settings |
| `tsconfig.json` | TypeScript configuration |
| `package.json` | Dependencies and scripts |

### Important Scripts
```json
{
  "dev": "tsx server/index.ts",
  "build": "vite build && esbuild ...",
  "db:push": "drizzle-kit push"
}
```

---

## Enhancement Notes

See `docs/ENHANCEMENTS.md` for the complete roadmap including:
- Voice transcription integration
- Real drift detection algorithms
- AI response caching
- Authentication system
- Export/print functionality
- WordPress integration for HarrisWildlands
