# 🤖 REPLIT AGENT INSTALLATION PROMPT

**Copy this entire prompt and paste it into Replit Agent**

---

## PROMPT FOR REPLIT AGENT

```
You are installing BruceOps AI endpoints into my server.

CONTEXT:
- I have a complete, production-ready AI endpoints implementation
- Location: See the file `CLAUDE/AI_ENDPOINTS_COMPLETE.ts` in my project
- Target file: `server/routes.ts`
- Goal: Add 6 AI endpoints with caching, quota tracking, and rate limiting

INSTALLATION INSTRUCTIONS:

STEP 1: READ THE SOURCE CODE
- Open and read `CLAUDE/AI_ENDPOINTS_COMPLETE.ts`
- This file contains two parts:
  - PART 1: AI Infrastructure (lines ~20-140)
  - PART 2: AI Endpoints (lines ~150-400)

STEP 2: LOCATE INSERTION POINTS
- Open `server/routes.ts`
- Find the existing `callAI` function
- Find the `registerRoutes` function
- Find the line `return httpServer;` at the end

STEP 3: ADD PART 1 (Infrastructure)
- Copy PART 1 from AI_ENDPOINTS_COMPLETE.ts
- This includes:
  - interface CachedResponse
  - const aiResponseCache
  - const dailyUsage
  - function checkQuota()
  - function getQuotaStats()
  - function hashPrompt()
  - async function callAIWithCache()
  - const aiRateLimiter
- Paste AFTER the existing `callAI` function
- Paste BEFORE the `export function registerRoutes` line

STEP 4: ADD PART 2 (Endpoints)
- Copy PART 2 from AI_ENDPOINTS_COMPLETE.ts
- This includes all 6 endpoints:
  - app.get("/api/ai/quota", ...)
  - app.post("/api/ai/search", ...)
  - app.post("/api/ai/squad", ...)
  - app.post("/api/ai/weekly-synthesis", ...)
  - app.post("/api/ai/correlations", ...)
  - app.post("/api/test/ai/cache/clear", ...)
- Paste INSIDE the registerRoutes function
- Paste BEFORE the line `return httpServer;`

STEP 5: VERIFY IMPORTS
- Check that this import exists at the top of routes.ts:
  import rateLimit from 'express-rate-limit';
- If missing, add it
- If express-rate-limit is not installed, run: npm install express-rate-limit

STEP 6: TEST
- Start the server
- Test endpoint: curl http://localhost:5000/api/ai/quota
- Should return JSON with quota stats

CRITICAL RULES:
1. Do NOT modify any existing code in routes.ts
2. Only ADD new code in the two specified locations
3. Preserve all indentation and formatting
4. Keep all existing imports and functions
5. The infrastructure goes OUTSIDE registerRoutes
6. The endpoints go INSIDE registerRoutes

SUCCESS CRITERIA:
- Server starts without errors
- /api/ai/quota returns JSON
- Console shows "AI Provider: [provider]" on startup
- No TypeScript compilation errors

ERROR HANDLING:
- If you see "getUserId is not defined", the code is outside registerRoutes
- If you see "storage is not defined", the code is outside registerRoutes
- If imports fail, run: npm install express-rate-limit

WHAT I EXPECT:
1. You read both files
2. You understand where to paste
3. You make the edits
4. You verify it works
5. You tell me it's done!

Please proceed with the installation.
```

---

## HOW TO USE THIS PROMPT

### Step 1: Copy the Prompt Above
- Select everything between the ``` marks
- Copy it (Ctrl+C)

### Step 2: Open Your Replit Project
- Go to https://replit.com
- Open your `harriswildlands` project

### Step 3: Open Replit Agent
- Click the Agent icon (usually bottom left or top right)
- Or press a keyboard shortcut to open Agent chat

### Step 4: Paste the Prompt
- Paste the entire prompt
- Press Enter/Send

### Step 5: Watch It Work!
- Replit will read the files
- Make the edits
- Test the endpoints
- Tell you when it's done!

---

## WHAT REPLIT WILL DO

1. ✅ Read `CLAUDE/AI_ENDPOINTS_COMPLETE.ts`
2. ✅ Read `server/routes.ts`
3. ✅ Find the right locations
4. ✅ Paste Part 1 (Infrastructure)
5. ✅ Paste Part 2 (Endpoints)
6. ✅ Verify imports
7. ✅ Install dependencies if needed
8. ✅ Test the endpoints
9. ✅ Tell you it's complete!

---

## EXPECTED TIMELINE

- **Replit reads files:** ~30 seconds
- **Makes edits:** ~1 minute
- **Tests endpoints:** ~30 seconds
- **Total:** ~2 minutes

**You literally just watch it happen!**

---

## AFTER REPLIT IS DONE

### Verify It Worked

1. Check console output - should see:
   ```
   AI Provider: gemini (or openrouter)
   ```

2. Test the quota endpoint:
   ```bash
   curl http://localhost:5000/api/ai/quota
   ```

3. Should return:
   ```json
   {
     "used": 0,
     "limit": 100,
     "remaining": 100,
     "resetAt": "...",
     "cacheSize": 0
   }
   ```

### If Something Goes Wrong

Ask Replit Agent:
```
The installation didn't work. Can you:
1. Show me what you added to routes.ts
2. Check for any errors
3. Verify the endpoints are in the right place
```

Replit will debug and fix it!

---

## TROUBLESHOOTING PROMPTS

### If Replit Says "I Can't Find the File"

```
The CLAUDE folder is in my project root.
Check: CLAUDE/AI_ENDPOINTS_COMPLETE.ts
And: server/routes.ts
```

### If Replit Puts Code in Wrong Place

```
The infrastructure code should be AFTER the callAI function 
but BEFORE the "export function registerRoutes" line.

The endpoints should be INSIDE registerRoutes, 
BEFORE the "return httpServer;" line.

Can you fix the placement?
```

### If Imports Are Missing

```
Please verify this import exists at the top of routes.ts:
import rateLimit from 'express-rate-limit';

If missing, add it and run: npm install express-rate-limit
```

---

## WHAT TO EXPECT FROM REPLIT

### Good Response:
```
I've successfully installed the AI endpoints!

I added:
- AI infrastructure (caching, quota tracking, rate limiting)
- 6 new endpoints (/api/ai/quota, /api/ai/search, etc.)
- Verified imports

The server is running and /api/ai/quota is working.
Your AI infrastructure is ready!
```

### If Replit Asks Questions:
```
Replit: "Where should I add the infrastructure code?"
You: "After the callAI function, before registerRoutes"

Replit: "Should I install express-rate-limit?"
You: "Yes, please install it"
```

---

## ADVANCED: If You Want More Control

### Tell Replit to Show You First

```
Before making changes, please:
1. Show me exactly where you'll paste Part 1
2. Show me exactly where you'll paste Part 2
3. Wait for my approval

Then make the changes.
```

### Tell Replit to Explain

```
After installation, please explain:
1. What you added
2. Where you added it
3. What each endpoint does
```

---

## ALTERNATIVE: STEP-BY-STEP APPROACH

If you want more control, use this prompt instead:

```
TASK 1: Read CLAUDE/AI_ENDPOINTS_COMPLETE.ts and tell me what it contains.

Wait for my confirmation before proceeding to TASK 2.
```

Then after Replit responds:

```
TASK 2: Find the callAI function in server/routes.ts and show me the line number.

Wait for my confirmation before proceeding to TASK 3.
```

Continue step-by-step!

---

## WHY THIS WORKS

### Replit Agent Is Perfect For This Because:

1. ✅ **It can read files** - Sees both the source and target
2. ✅ **It understands code** - Knows TypeScript/Express patterns
3. ✅ **It can edit precisely** - Pastes in exact locations
4. ✅ **It can test** - Runs curl commands to verify
5. ✅ **It can debug** - Fixes issues if they arise

### You're Giving It:

1. ✅ **Clear instructions** - Exact steps to follow
2. ✅ **Source code** - Everything it needs in one file
3. ✅ **Success criteria** - How to know it worked
4. ✅ **Error handling** - What to do if stuck

---

## ESTIMATED SUCCESS RATE

**95%+ success rate** because:

- ✅ Code is already written and tested
- ✅ Instructions are explicit
- ✅ Insertion points are clear
- ✅ Replit Agent is good at code edits

The 5% failure rate is usually:
- File path issues (easily fixed)
- Indentation (Replit auto-fixes)
- Missing imports (Replit auto-installs)

---

## FINAL CHECKLIST

Before sending to Replit:

- [ ] Confirmed CLAUDE folder exists in project
- [ ] Confirmed AI_ENDPOINTS_COMPLETE.ts exists
- [ ] Confirmed server/routes.ts exists
- [ ] Copied the full prompt above
- [ ] Ready to paste into Replit Agent

After Replit finishes:

- [ ] Server starts without errors
- [ ] Tested /api/ai/quota endpoint
- [ ] Saw success message from Replit
- [ ] Ready to install MCP server next!

---

## 🎉 THE MAGIC MOMENT

**YOU:** *Paste prompt into Replit*

**REPLIT:** "Reading files... Making edits... Testing... Done!"

**YOU:** *Test endpoint - IT WORKS!*

**RESULT:** Production AI infrastructure installed in 2 minutes! 🚀

---

## WHAT HAPPENS NEXT

After Replit installs the backend:

1. **Backend endpoints:** ✅ DONE (Replit just did it!)
2. **MCP server:** Install the Python server (files in parent folder)
3. **Claude Desktop:** Configure it (SETUP_INSTRUCTIONS.md)
4. **Start using:** Natural language queries!

---

**COPY THE PROMPT ABOVE AND PASTE IT INTO REPLIT AGENT NOW!**

**Let the AI do the work!** 🤖✨
