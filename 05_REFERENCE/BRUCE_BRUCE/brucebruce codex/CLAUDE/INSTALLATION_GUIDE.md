# 🚀 BRUCEOPS AI ENDPOINTS - INSTALLATION GUIDE

**Date:** January 4, 2025  
**Status:** Ready to Install  
**Time Required:** 5 minutes

---

## ✅ What This Adds to Your Server

These 6 new endpoints make your MCP server fully functional:

1. **`/api/ai/quota`** - Check your AI usage (how many calls today)
2. **`/api/ai/search`** - Smart search through your logs with AI analysis
3. **`/api/ai/squad`** - Get multi-AI perspectives on questions
4. **`/api/ai/weekly-synthesis`** - Generate weekly narrative report
5. **`/api/ai/correlations`** - Discover patterns in your data
6. **`/api/test/ai/cache/clear`** - Clear cached responses

Plus all the infrastructure:
- ✅ 24-hour response caching (saves money!)
- ✅ Daily quota limits (100 calls/day)
- ✅ Rate limiting (10 requests/minute)
- ✅ Cost tracking

---

## 📋 Prerequisites

Before you start, make sure:

- [ ] You have the `harriswildlands.com-main` folder
- [ ] `server/routes.ts` exists
- [ ] `npm install` has been run
- [ ] You have the file: `AI_ENDPOINTS_COMPLETE.ts` (in this CLAUDE folder)

---

## 🎯 Installation Steps

### Step 1: Open Your Server Routes File

```
📁 C:\Users\wilds\brucebruce codex\
   📁 harriswildlands.com github repo\
      📁 harriswildlands.com-main\
         📁 server\
            📄 routes.ts  ← OPEN THIS FILE
```

**Open it in your code editor (VS Code, Notepad++, etc.)**

### Step 2: Find the Right Location

**Look for your existing `callAI` function.** It should be around line 100-120 and look like this:

```typescript
async function callAI(prompt: string, lanePrompt: string = ""): Promise<string> {
  // ... existing code ...
}
```

**SCROLL DOWN** past this function until you see the `export function registerRoutes` function.

### Step 3: Add the AI Infrastructure

**COPY** everything from `AI_ENDPOINTS_COMPLETE.ts` starting from:

```typescript
// AI Response Cache (24-hour TTL)
interface CachedResponse {
```

**ALL THE WAY TO** (but NOT including):

```typescript
// ============================================================================
// PART 2: AI ENDPOINTS
```

**PASTE** it right after your `callAI` function.

### Step 4: Add the AI Endpoints

**SCROLL DOWN** in `routes.ts` to find the **VERY END** where you see:

```typescript
  return httpServer;
}
```

**GO UP** a few lines until you see the last app.post or app.get route.

**COPY** everything from `AI_ENDPOINTS_COMPLETE.ts` starting from:

```typescript
app.get("/api/ai/quota", isAuthenticated, (req, res) => {
```

**ALL THE WAY TO** (but NOT including):

```typescript
// ============================================================================
// INSTALLATION INSTRUCTIONS
```

**PASTE** it right before `return httpServer;`

### Step 5: Save and Test

1. **Save** the `routes.ts` file

2. **Start your server:**
   ```bash
   cd "C:\Users\wilds\brucebruce codex\harriswildlands.com github repo\harriswildlands.com-main"
   npm run dev
   ```

3. **Test the quota endpoint:**
   Open a new terminal and run:
   ```bash
   curl http://localhost:5000/api/ai/quota
   ```

   You should see something like:
   ```json
   {
     "used": 0,
     "limit": 100,
     "remaining": 100,
     "resetAt": "2025-01-05T00:00:00.000Z",
     "cacheSize": 0
   }
   ```

4. **If it works:** ✅ **YOU'RE DONE!**

5. **If it doesn't work:** See troubleshooting below

---

## 🧪 Testing Each Endpoint

Once your server is running, test each endpoint:

### Test 1: Quota Status
```bash
curl http://localhost:5000/api/ai/quota
```

### Test 2: Smart Search
```bash
curl -X POST http://localhost:5000/api/ai/search \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"energy\", \"limit\": 5}"
```

### Test 3: Weekly Synthesis
```bash
curl -X POST http://localhost:5000/api/ai/weekly-synthesis \
  -H "Content-Type: application/json"
```

### Test 4: Correlations
```bash
curl -X POST http://localhost:5000/api/ai/correlations \
  -H "Content-Type: application/json" \
  -d "{\"days\": 30}"
```

### Test 5: AI Squad
```bash
curl -X POST http://localhost:5000/api/ai/squad \
  -H "Content-Type: application/json" \
  -d "{\"question\": \"What should I focus on today?\"}"
```

---

## 🐛 Troubleshooting

### Error: "Module not found: express-rate-limit"

**Solution:**
```bash
npm install express-rate-limit
```

### Error: "getUserId is not defined"

**Problem:** You pasted the code in the wrong location.

**Solution:** Make sure you pasted INSIDE the `registerRoutes` function, not outside it.

### Error: "storage is not defined"

**Problem:** Same as above - wrong location.

**Solution:** The code must be inside `registerRoutes` where `storage` is accessible.

### Server won't start - TypeScript errors

**Common issues:**

1. **Missing import:**
   Make sure this is at the top of `routes.ts`:
   ```typescript
   import rateLimit from 'express-rate-limit';
   ```

2. **Duplicate declarations:**
   If you see "Cannot redeclare block-scoped variable", you might have pasted the code twice.

3. **Missing braces:**
   Make sure all your `{` and `}` match up.

### Endpoints return 401 Unauthorized

**This is normal if you're not authenticated!**

**Solutions:**

1. **Use standalone mode:**
   ```bash
   export STANDALONE_MODE=true
   npm run dev
   ```

2. **Or test via the UI:**
   - Start server with `npm run dev`
   - Open http://localhost:5000
   - Use the UI to trigger the endpoints

---

## 📊 What You Get

### Cost Protection

With these endpoints installed:

- ✅ **Daily Quota:** Max 100 AI calls per day per user
- ✅ **Rate Limiting:** Max 10 requests per minute per user
- ✅ **Caching:** Identical queries cached for 24 hours (FREE!)
- ✅ **Usage Tracking:** Check `/api/ai/quota` anytime

### Real Cost Example

```
WITHOUT caching:
- 50 searches/week = 50 AI calls = $0.225/week = $0.90/month

WITH caching (70% hit rate):
- 50 searches/week = 15 actual AI calls = $0.068/week = $0.27/month

SAVINGS: ~$0.63/month (70% reduction!)
```

---

## 🎯 Next Steps

### After Installation

1. **Test each endpoint** using the curl commands above
2. **Verify quota tracking** - make a few calls, check `/api/ai/quota`
3. **Test caching** - call the same search twice, second should show "cached: true"

### Connect Your MCP Server

Once the endpoints are working:

1. **Install the MCP server** (from the other files in this folder)
2. **Configure Claude Desktop** (see SETUP_INSTRUCTIONS.md)
3. **Start using it!** Just ask Claude: "Show me my recent logs"

### Monitor Usage

Check your usage regularly:
```bash
curl http://localhost:5000/api/ai/quota
```

Or ask Claude (once MCP is set up):
```
What's my AI quota today?
```

---

## 📁 File Structure

After installation, your `server/routes.ts` will have:

```typescript
// Existing imports
import rateLimit from 'express-rate-limit';

// Existing AI provider code
function getActiveAIProvider() { ... }
function callGemini() { ... }
function callAI() { ... }

// NEW: AI Infrastructure
interface CachedResponse { ... }
const aiResponseCache = ...
function checkQuota() { ... }
function getQuotaStats() { ... }
function callAIWithCache() { ... }
const aiRateLimiter = ...

// Existing routes
export function registerRoutes(app: Express) {
  // ... existing routes ...
  
  // NEW: AI Endpoints
  app.get("/api/ai/quota", ...)
  app.post("/api/ai/search", ...)
  app.post("/api/ai/squad", ...)
  app.post("/api/ai/weekly-synthesis", ...)
  app.post("/api/ai/correlations", ...)
  app.post("/api/test/ai/cache/clear", ...)
  
  return httpServer;
}
```

---

## ✅ Completion Checklist

Installation complete when:

- [ ] Code pasted into `routes.ts`
- [ ] File saved without errors
- [ ] Server starts successfully (`npm run dev`)
- [ ] `/api/ai/quota` returns JSON
- [ ] At least one test endpoint works
- [ ] No TypeScript compilation errors

---

## 🆘 Still Stuck?

If you're having trouble:

1. **Check the console output** when you run `npm run dev`
2. **Look for error messages** - they usually tell you exactly what's wrong
3. **Compare your file** to the original routes.ts
4. **Start fresh** - you can always re-download the repo and try again

---

**YOU'RE BUILDING PRODUCTION INFRASTRUCTURE, BRUCE!** 🎯

Once these endpoints are installed, your entire MCP server will just work. No more manual coding - just natural conversation with your data.

---

*Installation time: ~5 minutes*  
*Complexity: Copy & paste*  
*Result: Bulletproof AI infrastructure*
