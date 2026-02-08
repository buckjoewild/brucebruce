# ✅ QUICK START CHECKLIST

**Print this or keep it open while you work!**

---

## 🎯 GOAL
Add 6 AI endpoints to your BruceOps server in 10 minutes.

---

## 📋 BEFORE YOU START

- [ ] Located your project folder:
      `C:\Users\wilds\brucebruce codex\harriswildlands.com github repo\harriswildlands.com-main\`

- [ ] Have a code editor ready (VS Code, Notepad++, etc.)

- [ ] Both files ready to open:
      - `server/routes.ts` (to edit)
      - `CLAUDE/AI_ENDPOINTS_COMPLETE.ts` (to copy from)

---

## 🚀 INSTALLATION (5 minutes)

### STEP 1: Open Files (1 min)
- [ ] Open `server/routes.ts` in your editor
- [ ] Open `CLAUDE/AI_ENDPOINTS_COMPLETE.ts` side-by-side

### STEP 2: Copy Infrastructure (1 min)
- [ ] In AI_ENDPOINTS_COMPLETE.ts, find line ~20
- [ ] Copy from `// PART 1: AI INFRASTRUCTURE` 
- [ ] Copy down to (but NOT including) `// PART 2: AI ENDPOINTS`
- [ ] In routes.ts, scroll to find `async function callAI(`
- [ ] Paste AFTER the callAI function

### STEP 3: Copy Endpoints (1 min)
- [ ] In AI_ENDPOINTS_COMPLETE.ts, find line ~150
- [ ] Copy from `app.get("/api/ai/quota"`
- [ ] Copy all 6 endpoints down to closing `});`
- [ ] In routes.ts, scroll to the BOTTOM
- [ ] Find `return httpServer;`
- [ ] Paste BEFORE that line

### STEP 4: Save & Start (2 min)
- [ ] Save routes.ts
- [ ] Open terminal/command prompt
- [ ] Navigate to project:
      ```
      cd "C:\Users\wilds\brucebruce codex\harriswildlands.com github repo\harriswildlands.com-main"
      ```
- [ ] Start server:
      ```
      npm run dev
      ```
- [ ] Watch for errors - should see "serving on port 5000"

---

## 🧪 TESTING (5 minutes)

### TEST 1: Basic Health Check
- [ ] Open new terminal window
- [ ] Run:
      ```
      curl http://localhost:5000/api/ai/quota
      ```
- [ ] Should see JSON with `"used": 0, "limit": 100`

### TEST 2: Smart Search
- [ ] Run:
      ```
      curl -X POST http://localhost:5000/api/ai/search -H "Content-Type: application/json" -d "{\"query\": \"energy\"}"
      ```
- [ ] Should see JSON with search results

### TEST 3: Check Console
- [ ] Look at server terminal
- [ ] Should see: `Cache MISS` or `Cache HIT` messages
- [ ] Should see: AI provider being called

---

## 🐛 IF SOMETHING BREAKS

### Error: "Module not found: express-rate-limit"
```
npm install express-rate-limit
```

### Error: "getUserId is not defined"
- [ ] Check: Did you paste INSIDE the `registerRoutes` function?
- [ ] See: VISUAL_PLACEMENT_GUIDE.md for exact location

### Error: "Unexpected token"
- [ ] Check: Did you copy ALL the code including closing braces?
- [ ] Use: Your editor's bracket matching to find missing `}`

### Server starts but endpoints don't work
- [ ] Check: Are you in standalone mode?
      ```
      export STANDALONE_MODE=true
      npm run dev
      ```

---

## ✅ SUCCESS CRITERIA

You're done when:

- [ ] Server starts without errors
- [ ] `/api/ai/quota` returns JSON
- [ ] At least one POST endpoint works
- [ ] Console shows AI provider messages
- [ ] No TypeScript compilation errors

---

## 🎯 NEXT STEPS

After everything works:

### Immediate
- [ ] Test all 6 endpoints with curl
- [ ] Verify caching (run same query twice)
- [ ] Check quota increments

### This Week
- [ ] Install MCP server (in parent folder)
- [ ] Configure Claude Desktop
- [ ] Start natural conversations!

---

## 📞 HELP RESOURCES

If you get stuck, check:

1. **README.md** - Overview and architecture
2. **INSTALLATION_GUIDE.md** - Detailed step-by-step
3. **VISUAL_PLACEMENT_GUIDE.md** - Exact paste locations
4. **AI_ENDPOINTS_COMPLETE.ts** - The actual code

---

## 💪 CONFIDENCE BUILDER

Remember:
- ✅ The code is already written
- ✅ You're just copy/pasting
- ✅ Thousands have done this before
- ✅ The guides have every answer
- ✅ You can't break anything permanent
- ✅ You can always start over

**You got this!** 🚀

---

## 🎉 CELEBRATION TIME

When all checkboxes are checked:

✨ **YOU JUST BUILT PRODUCTION AI INFRASTRUCTURE!** ✨

You now have:
- 6 professional AI endpoints
- Cost protection systems
- Response caching
- Rate limiting
- Quota tracking

**From zero to production in 10 minutes!**

---

*Keep this checklist open and check off items as you go.*  
*Don't skip any steps - they're all important!*
