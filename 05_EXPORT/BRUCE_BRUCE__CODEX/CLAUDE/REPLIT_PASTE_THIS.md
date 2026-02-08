# 🎯 REPLIT AGENT - READY-TO-PASTE PROMPT

**This is the EXACT prompt to paste into Replit Agent**

---

## ⚡ THE PROMPT (COPY EVERYTHING BELOW)

```
TASK: Install BruceOps AI Endpoints

SOURCE FILE: CLAUDE/AI_ENDPOINTS_COMPLETE.ts
TARGET FILE: server/routes.ts

WHAT TO DO:

1. READ SOURCE
   - Open CLAUDE/AI_ENDPOINTS_COMPLETE.ts
   - Identify PART 1: AI Infrastructure (lines 20-140)
   - Identify PART 2: AI Endpoints (lines 150-400)

2. FIND INSERTION POINTS IN server/routes.ts
   - Insertion Point A: After the "async function callAI" function, before "export function registerRoutes"
   - Insertion Point B: Inside registerRoutes function, before "return httpServer;"

3. INSERT PART 1 (Infrastructure)
   - Copy everything from PART 1
   - Paste at Insertion Point A
   - This includes: CachedResponse interface, aiResponseCache, checkQuota, getQuotaStats, hashPrompt, callAIWithCache, aiRateLimiter

4. INSERT PART 2 (Endpoints)
   - Copy everything from PART 2  
   - Paste at Insertion Point B
   - This includes: 6 app.get/app.post routes (/api/ai/quota, /api/ai/search, /api/ai/squad, /api/ai/weekly-synthesis, /api/ai/correlations, /api/test/ai/cache/clear)

5. VERIFY IMPORTS
   - Check that "import rateLimit from 'express-rate-limit';" exists at top
   - If missing, add it
   - If package missing, run: npm install express-rate-limit

6. TEST
   - Start server
   - Verify /api/ai/quota endpoint works

CRITICAL RULES:
- Don't modify existing code
- Preserve all formatting
- Infrastructure goes OUTSIDE registerRoutes
- Endpoints go INSIDE registerRoutes
- Keep all indentation consistent

DO IT NOW.
After completion, tell me:
1. What you added
2. Where you added it
3. That the server is running
4. That /api/ai/quota works
```

---

## 🚀 HOW TO USE

### Copy-Paste Instructions

1. **Select** everything between the ``` marks above
2. **Copy** (Ctrl+C or Cmd+C)
3. **Open** Replit Agent in your project
4. **Paste** (Ctrl+V or Cmd+V)
5. **Send** (Enter)
6. **Watch** it work!

---

## ✅ WHAT REPLIT WILL DO

```
[Replit Agent]: Reading CLAUDE/AI_ENDPOINTS_COMPLETE.ts...
[Replit Agent]: Opening server/routes.ts...
[Replit Agent]: Found callAI function at line 87
[Replit Agent]: Found registerRoutes at line 145
[Replit Agent]: Inserting AI infrastructure...
[Replit Agent]: Inserting AI endpoints...
[Replit Agent]: Verifying imports...
[Replit Agent]: Starting server...
[Replit Agent]: Testing /api/ai/quota...
[Replit Agent]: ✅ Installation complete!
```

---

## 📋 EXPECTED RESPONSE FROM REPLIT

### Success Response:

```
I've successfully installed the BruceOps AI endpoints!

What I added:
1. AI Infrastructure (after callAI function):
   - Response caching system
   - Daily quota tracking (100 calls/day)
   - Rate limiting (10 req/min)
   - Helper functions

2. Six AI Endpoints (inside registerRoutes):
   - GET /api/ai/quota - Usage statistics
   - POST /api/ai/search - Smart search with AI
   - POST /api/ai/squad - Multi-AI perspectives
   - POST /api/ai/weekly-synthesis - Weekly reports
   - POST /api/ai/correlations - Pattern discovery
   - POST /api/test/ai/cache/clear - Cache management

Where I added it:
- Infrastructure: Lines 122-245 (after callAI, before registerRoutes)
- Endpoints: Lines 567-789 (inside registerRoutes, before return)

Server status:
✅ Running on port 5000
✅ /api/ai/quota responds with JSON
✅ No TypeScript errors

Your AI infrastructure is ready to use!
```

---

## 🐛 IF REPLIT GETS CONFUSED

### Replit Says "I can't find the file"

**Your response:**
```
The CLAUDE folder is in the project root.
File path: CLAUDE/AI_ENDPOINTS_COMPLETE.ts
Please look again.
```

### Replit Says "Where exactly should I paste?"

**Your response:**
```
PART 1: After line with "async function callAI(...)" 
        Before line with "export function registerRoutes"

PART 2: Inside registerRoutes function
        After all existing app.get/app.post routes
        Before "return httpServer;"
```

### Replit Asks "Should I install dependencies?"

**Your response:**
```
Yes, install express-rate-limit if not present.
Run: npm install express-rate-limit
```

---

## 🎯 VERIFICATION COMMANDS

After Replit says it's done, run these:

### Test 1: Quota Endpoint
```bash
curl http://localhost:5000/api/ai/quota
```

**Expected:**
```json
{
  "used": 0,
  "limit": 100,
  "remaining": 100,
  "resetAt": "2025-01-05T00:00:00.000Z",
  "cacheSize": 0
}
```

### Test 2: Search Endpoint
```bash
curl -X POST http://localhost:5000/api/ai/search \
  -H "Content-Type: application/json" \
  -d '{"query": "energy", "limit": 5}'
```

**Expected:**
```json
{
  "count": 3,
  "samples": [...],
  "insight": "...",
  "cached": false
}
```

---

## 📊 SUCCESS CHECKLIST

After running the prompt:

- [ ] Replit Agent responded (not stuck)
- [ ] Server starts without errors
- [ ] `/api/ai/quota` returns JSON
- [ ] Console shows "AI Provider: gemini" (or openrouter)
- [ ] No TypeScript compilation errors
- [ ] Can run curl tests successfully

If ALL boxes checked: ✅ **INSTALLATION COMPLETE!**

---

## 🔄 IF YOU NEED TO START OVER

Tell Replit Agent:

```
Please undo the changes to server/routes.ts.
Then I'll give you the installation prompt again.
```

Or manually:
1. Git reset: `git checkout server/routes.ts`
2. Re-run the prompt above

---

## 💡 PRO TIPS

### Get More Detail

Add this to the end of the prompt:
```
Please explain each endpoint after installation.
```

### See Before/After

Add this before "DO IT NOW":
```
Before making changes, show me exactly where you'll insert the code.
Wait for my approval.
```

### Debug Mode

If it fails, ask:
```
Show me the error messages and what went wrong.
Let's fix it together.
```

---

## 🎁 BONUS: ENHANCED PROMPT

For even more control, use this version:

```
INSTALLATION TASK: BruceOps AI Endpoints

STEP 1: ANALYSIS
Read CLAUDE/AI_ENDPOINTS_COMPLETE.ts
Tell me what you found in PART 1 and PART 2

STEP 2: LOCATE
Open server/routes.ts
Show me the line numbers for:
- Where callAI function ends
- Where registerRoutes begins  
- Where "return httpServer" appears

STEP 3: PREVIEW
Show me a preview of the changes you'll make
Wait for my approval

STEP 4: INSTALL
Make the changes

STEP 5: VERIFY
Start server and test /api/ai/quota
Report results

Execute steps in order. Wait for confirmation between steps.
```

This gives you checkpoints!

---

## 🚀 WHAT HAPPENS AFTER SUCCESS

### Immediate Next Steps

1. ✅ **Backend installed** (you just did this!)
2. ⏭️ **Install MCP server** (Python files in parent folder)
3. ⏭️ **Configure Claude Desktop** (see parent SETUP_INSTRUCTIONS.md)
4. ⏭️ **Start using it!** Natural language queries

### Your New Capabilities

```
You: "Show me my recent logs"
Claude: [Uses /api/ai/search]

You: "What patterns do you see?"
Claude: [Uses /api/ai/correlations]

You: "Generate weekly synthesis"
Claude: [Uses /api/ai/weekly-synthesis]
```

---

## 🎯 THE MOMENT OF TRUTH

**Ready?**

1. Copy the prompt at the top
2. Paste into Replit Agent
3. Press Enter
4. Watch the magic happen! ✨

**Estimated time: 2 minutes**

**Complexity: Zero (Replit does it all)**

**Result: Production AI infrastructure!** 🚀

---

*Save this file for reference*  
*You can always re-run the prompt if needed*
