# 📍 EXACT PLACEMENT GUIDE - Visual Reference

This document shows you EXACTLY where to paste the code in your routes.ts file.

---

## Current Structure of routes.ts

```typescript
// ┌─────────────────────────────────────────────────────────────┐
// │ SECTION 1: IMPORTS (Lines 1-10)                            │
// └─────────────────────────────────────────────────────────────┘

import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import rateLimit from 'express-rate-limit';  // ← Should be here!
import { createHash } from 'crypto';

// ┌─────────────────────────────────────────────────────────────┐
// │ SECTION 2: AI PROVIDER CONFIG (Lines 12-40)                │
// └─────────────────────────────────────────────────────────────┘

const AI_PROVIDER = process.env.AI_PROVIDER || "off";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

function getActiveAIProvider() { ... }

const BRUCE_CONTEXT = `You are speaking directly to Bruce Harris...`;

function getUserId(req: Request): string { ... }

// ┌─────────────────────────────────────────────────────────────┐
// │ SECTION 3: EXISTING AI FUNCTIONS (Lines 42-120)            │
// └─────────────────────────────────────────────────────────────┘

async function callGemini(prompt: string, systemPrompt: string) {
  // ... existing code ...
}

async function callOpenRouterAPI(prompt: string, systemPrompt: string) {
  // ... existing code ...
}

async function callAI(prompt: string, lanePrompt: string = "") {
  // ... existing code ...
}

// ╔═════════════════════════════════════════════════════════════╗
// ║ 👇 PASTE "PART 1: AI INFRASTRUCTURE" HERE                  ║
// ║ (After callAI function, before registerRoutes)             ║
// ╚═════════════════════════════════════════════════════════════╝

// AI Response Cache (24-hour TTL)
interface CachedResponse {
  response: any;
  timestamp: number;
  cached: boolean;
}

const aiResponseCache = new Map<string, CachedResponse>();
const AI_CACHE_TTL = 24 * 60 * 60 * 1000;

// ... paste ALL of PART 1 here ...

const aiRateLimiter = rateLimit({
  // ... etc
});

// ┌─────────────────────────────────────────────────────────────┐
// │ SECTION 4: MAIN ROUTE REGISTRATION FUNCTION                │
// └─────────────────────────────────────────────────────────────┘

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);
  
  // ... existing setup code ...
  
  // ┌───────────────────────────────────────────────────────────┐
  // │ EXISTING ROUTES                                           │
  // └───────────────────────────────────────────────────────────┘
  
  // Health Check
  app.get("/api/health", async (req, res) => {
    // ... existing code ...
  });
  
  // Logs
  app.get(api.logs.list.path, isAuthenticated, async (req, res) => {
    // ... existing code ...
  });
  
  // Ideas  
  app.get(api.ideas.list.path, isAuthenticated, async (req, res) => {
    // ... existing code ...
  });
  
  // ... many more existing routes ...
  
  // Export
  app.get("/api/export/data", isAuthenticated, async (req, res) => {
    // ... existing code ...
  });
  
  // Google Drive
  app.get("/api/drive/files", isAuthenticated, async (req, res) => {
    // ... existing code ...
  });
  
  // ╔═══════════════════════════════════════════════════════════╗
  // ║ 👇 PASTE "PART 2: AI ENDPOINTS" HERE                     ║
  // ║ (After all existing routes, before return httpServer)    ║
  // ╚═══════════════════════════════════════════════════════════╝
  
  // AI QUOTA
  app.get("/api/ai/quota", isAuthenticated, (req, res) => {
    const userId = getUserId(req);
    const stats = getQuotaStats(userId);
    res.json(stats);
  });
  
  // SMART SEARCH
  app.post("/api/ai/search", isAuthenticated, aiRateLimiter, async (req, res) => {
    // ... paste all the code ...
  });
  
  // ... paste all 6 endpoints here ...
  
  // ┌───────────────────────────────────────────────────────────┐
  // │ DON'T CHANGE ANYTHING BELOW THIS LINE                    │
  // └───────────────────────────────────────────────────────────┘
  
  return httpServer;
}
```

---

## Step-by-Step Visual Guide

### STEP 1: Find Your File

```
📁 C:\Users\wilds\brucebruce codex\
   📁 harriswildlands.com github repo\
      📁 harriswildlands.com-main\
         📁 server\
            📄 routes.ts  ← THIS FILE
```

### STEP 2: Open AI_ENDPOINTS_COMPLETE.ts

```
📁 C:\Users\wilds\brucebruce codex\
   📁 CLAUDE\
      📄 AI_ENDPOINTS_COMPLETE.ts  ← THIS FILE
```

Have both files open side-by-side!

### STEP 3: Copy PART 1 (Infrastructure)

**FROM AI_ENDPOINTS_COMPLETE.ts:**

```typescript
// Copy from line ~20
// ============================================================================
// PART 1: AI INFRASTRUCTURE
// ============================================================================

// AI Response Cache (24-hour TTL)
interface CachedResponse {
  response: any;
  timestamp: number;
  cached: boolean;
}

// ... everything through ...

const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'AI rate limit exceeded. Maximum 10 requests per minute.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return getUserId(req) || req.ip || 'anonymous';
  }
});

// ← COPY UP TO HERE (but NOT the "PART 2" comment)
```

**PASTE IN routes.ts:**

```typescript
async function callAI(prompt: string, lanePrompt: string = "") {
  // ... your existing callAI code ...
}

// 👇 PASTE PART 1 HERE 👇

// AI Response Cache (24-hour TTL)
interface CachedResponse {
  // ... the code you just copied ...
}

// 👆 END PASTE 👆

export function registerRoutes(app: Express): Server {
  // ... rest of file ...
```

### STEP 4: Copy PART 2 (Endpoints)

**FROM AI_ENDPOINTS_COMPLETE.ts:**

```typescript
// Copy from line ~150
// ============================================================================
// PART 2: AI ENDPOINTS
// ============================================================================

/**
 * GET /api/ai/quota
 * Returns current AI usage statistics for the user
 */
app.get("/api/ai/quota", isAuthenticated, (req, res) => {
  const userId = getUserId(req);
  const stats = getQuotaStats(userId);
  res.json(stats);
});

// ... everything through ...

app.post("/api/test/ai/cache/clear", isAuthenticated, (req, res) => {
  const sizeBefore = aiResponseCache.size;
  aiResponseCache.clear();
  
  console.log(`🗑️  Cache cleared by user ${getUserId(req)}: ${sizeBefore} entries removed`);
  
  res.json({
    message: `Cache cleared successfully. Removed ${sizeBefore} cached responses.`,
    before: sizeBefore,
    after: aiResponseCache.size
  });
});

// ← COPY UP TO HERE (but NOT the "INSTALLATION INSTRUCTIONS" section)
```

**PASTE IN routes.ts:**

```typescript
export function registerRoutes(app: Express): Server {
  // ... lots of existing routes ...
  
  // Google Drive
  app.post("/api/drive/folder", isAuthenticated, async (req, res) => {
    // ... existing code ...
  });
  
  // 👇 PASTE PART 2 HERE 👇
  
  // AI QUOTA
  app.get("/api/ai/quota", isAuthenticated, (req, res) => {
    // ... the code you just copied ...
  });
  
  // ... all 6 endpoints ...
  
  // 👆 END PASTE 👆
  
  return httpServer;
}
```

---

## ✅ Verification Checklist

After pasting, your file should look like this:

```
routes.ts structure:
├── Imports (with express-rate-limit)
├── AI Provider Config
├── Existing AI Functions (callGemini, callAI, etc.)
├── 👉 NEW: AI Infrastructure (cache, quota, rate limiting)
├── registerRoutes function START
│   ├── Existing routes (health, logs, ideas, etc.)
│   ├── 👉 NEW: AI Endpoints (6 new routes)
│   └── return httpServer
└── END
```

**Count your `app.get` and `app.post` lines:**

Before: ~20-25 routes  
After: ~26-31 routes (+6 new AI routes)

---

## 🎯 Quick Self-Test

1. **Search for** `app.get("/api/ai/quota"` 
   - **Found?** ✅ Endpoints are in!
   - **Not found?** ❌ Need to paste PART 2

2. **Search for** `const aiResponseCache`
   - **Found?** ✅ Infrastructure is in!
   - **Not found?** ❌ Need to paste PART 1

3. **Search for** `import rateLimit`
   - **Found?** ✅ Import is correct!
   - **Not found?** ❌ Add this import at the top

4. **Count curly braces:**
   - Every `{` should have a matching `}`
   - Use your editor's brace matching feature

---

## 🐛 Common Mistakes

### ❌ WRONG: Pasting outside the function

```typescript
export function registerRoutes(app: Express): Server {
  // ... routes ...
  return httpServer;
}

// ❌ DON'T PASTE HERE - this is OUTSIDE the function!
app.get("/api/ai/quota", ...)
```

### ✅ RIGHT: Pasting inside the function

```typescript
export function registerRoutes(app: Express): Server {
  // ... routes ...
  
  // ✅ PASTE HERE - this is INSIDE the function!
  app.get("/api/ai/quota", ...)
  
  return httpServer;
}
```

### ❌ WRONG: Pasting at the very end

```typescript
export function registerRoutes(app: Express): Server {
  // ... routes ...
  return httpServer;  // ← The return MUST be AFTER the new routes!
}

app.get("/api/ai/quota", ...)  // ❌ Too late!
```

### ✅ RIGHT: Pasting before the return

```typescript
export function registerRoutes(app: Express): Server {
  // ... routes ...
  
  app.get("/api/ai/quota", ...)  // ✅ Before the return!
  
  return httpServer;  // ← This stays at the end
}
```

---

## 🎨 Color-Coded Map

```typescript
🟦 BLUE = Don't touch (existing code)
🟩 GREEN = Paste PART 1 here
🟨 YELLOW = Paste PART 2 here

🟦 import statements...
🟦 AI_PROVIDER config...
🟦 function callAI() { ... }

🟩 // PASTE PART 1 (Infrastructure) HERE

🟦 export function registerRoutes(app: Express) {
🟦   app.get("/api/health", ...)
🟦   app.get(api.logs.list.path, ...)
🟦   app.get("/api/export/data", ...)
🟦   app.get("/api/drive/files", ...)
   
🟨   // PASTE PART 2 (Endpoints) HERE
   
🟦   return httpServer;
🟦 }
```

---

**VISUAL GUIDE COMPLETE!**

Use this alongside the INSTALLATION_GUIDE.md for step-by-step instructions.

When in doubt, look at the color codes above! 🎨
