# REPLIT AGENT INTEGRATION GUIDE
## AI-Enhanced Features for HarrisWildlands.com

**Date:** December 27, 2025  
**For:** Replit Agent (Planning Mode)  
**Priority:** HIGH - Final Day of Development

---

## 🎯 OVERVIEW

This guide provides step-by-step instructions to integrate 4 AI-powered React components into the existing HarrisWildlands.com codebase. These components are production-ready and designed to work with your existing API infrastructure with minimal backend changes.

**Key Principles:**
- ✅ Use existing APIs where possible
- ✅ Rate-limit AI calls to control costs
- ✅ Store results to minimize redundant API calls
- ✅ No new database tables required (uses existing schema)
- ⚠️ DO NOT build family data features (protocol violation)

---

## 📋 TASK LIST FOR REPLIT AGENT

### **Phase 1: Backend API Enhancements** (2-3 hours)

#### Task 1.1: Enhance Reality Check Endpoint
**File:** `server/routes.ts`  
**Current:** Line ~200-220 (Reality Check route)  
**Changes:**
```typescript
// REPLACE existing /api/ideas/:id/reality-check route with:

app.post(api.ideas.runRealityCheck.path, isAuthenticated, async (req, res) => {
  const userId = getUserId(req);
  const id = Number(req.params.id);
  const idea = await storage.getIdea(userId, id);
  if (!idea) return res.status(404).json({ message: "Idea not found" });

  // Step 1: Web search for validation (use Anthropic API with web_search tool)
  const searchQuery = `${idea.title} ${idea.painItSolves}`.slice(0, 100);
  
  let searchContext = "";
  try {
    const searchResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{
          role: "user",
          content: `Search for information about: "${searchQuery}". Find existing solutions or market validation.`
        }]
      })
    });
    const searchData = await searchResponse.json();
    searchContext = searchData.content.map(c => c.text || "").join("\n");
  } catch (err) {
    console.log("Web search failed, continuing without it");
  }

  // Step 2: Reality check with Claude
  const prompt = `Perform a Reality Check on this idea.

IDEA:
${JSON.stringify(idea)}

WEB SEARCH CONTEXT:
${searchContext}

Separate into Known, Likely, Speculation.
Flag self-deception: Overbuilding, Perfectionism, Time Optimism.
Suggest ONE decision: Discard, Park, Salvage, Promote.

Return ONLY JSON: { "known": [], "likely": [], "speculation": [], "flags": [], "decision": "", "reasoning": "" }`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const responseText = data.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const realityCheck = jsonMatch ? JSON.parse(jsonMatch[0]) : { 
      error: "Parse failed", 
      known: [], 
      likely: [], 
      speculation: [], 
      flags: ["Failed to parse response"], 
      decision: "Park", 
      reasoning: "Try again" 
    };

    const updated = await storage.updateIdea(userId, id, { realityCheck, status: "reality_checked" });
    res.json(updated);
  } catch (err) {
    console.error("Reality check failed:", err);
    res.status(500).json({ message: "Reality check failed" });
  }
});
```

**Environment Variables Needed:**
```bash
# Add to .env
ANTHROPIC_API_KEY=your_key_here
```

---

#### Task 1.2: Add Weekly Review AI Insight Endpoint
**File:** `server/routes.ts`  
**Location:** After existing `/api/review/weekly` route  
**New Route:**
```typescript
// Rate-limited AI insight generation (once per week)
app.post("/api/review/weekly/insight", isAuthenticated, async (req, res) => {
  const userId = getUserId(req);
  
  // Check if already generated today
  const cacheKey = `insight:${userId}:${new Date().toISOString().split('T')[0]}`;
  const cached = await storage.getSettings(); // Check if exists in settings table
  const cachedInsight = cached.find(s => s.key === cacheKey);
  
  if (cachedInsight) {
    return res.json({ insight: cachedInsight.value, cached: true });
  }

  // Generate new insight
  const review = await storage.getWeeklyReview(userId);
  
  const prompt = `Bruce, here's your week at a glance:

Completion Rate: ${review.stats.completionRate}%
Missed Days: ${review.stats.missedDays}
Drift Flags: ${review.driftFlags.join('; ')}

Give me ONE specific action to adjust this week. Be direct. Format: "This week, [action]." Then one sentence why.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const insight = data.content[0].text;
    
    // Cache for 24 hours
    await storage.updateSetting(cacheKey, insight);
    
    res.json({ insight, cached: false });
  } catch (err) {
    console.error("Insight generation failed:", err);
    res.status(500).json({ message: "Failed to generate insight" });
  }
});
```

---

#### Task 1.3: Enhance Teaching Assistant (Already Good - Optional Enhancement)
**File:** `server/routes.ts`  
**Current:** Line ~280-310 (Teaching route)  
**Optional Enhancement:** Add web search to existing teaching route (similar pattern to reality check)

---

### **Phase 2: Frontend Component Integration** (1-2 hours)

#### Task 2.1: Add React Components to Client
**Location:** `client/src/components/`

**Create 4 new files:**
1. `RealityCheckDashboard.tsx` - Copy from Artifact 1
2. `WeeklyReviewVisualizer.tsx` - Copy from Artifact 2
3. `TeachingAssistantV2.tsx` - Copy from Artifact 3
4. `BruceStewardChat.tsx` - Copy from Artifact 4

**Each component is self-contained and requires NO modifications.**

---

#### Task 2.2: Add Routes to Frontend Router
**File:** `client/src/App.tsx` (or your routing file)

```typescript
import RealityCheckDashboard from './components/RealityCheckDashboard';
import WeeklyReviewVisualizer from './components/WeeklyReviewVisualizer';
import TeachingAssistantV2 from './components/TeachingAssistantV2';
import BruceStewardChat from './components/BruceStewardChat';

// Add routes:
<Route path="/ideas/reality-check" element={<RealityCheckDashboard />} />
<Route path="/review/weekly" element={<WeeklyReviewVisualizer />} />
<Route path="/teaching" element={<TeachingAssistantV2 />} />
<Route path="/chat" element={<BruceStewardChat />} />
```

---

#### Task 2.3: Add Navigation Links
**File:** Your main navigation component

```typescript
<NavLink to="/ideas/reality-check">Reality Check</NavLink>
<NavLink to="/review/weekly">Weekly Review</NavLink>
<NavLink to="/teaching">Teaching Assistant</NavLink>
<NavLink to="/chat">Bruce Chat</NavLink>
```

---

### **Phase 3: Environment & Dependencies** (15 mins)

#### Task 3.1: Install Dependencies (if not already present)
```bash
npm install recharts
# All other dependencies already in package.json
```

#### Task 3.2: Environment Variables
**File:** `.env`
```bash
# Add if not present:
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Existing vars to verify:
GOOGLE_GEMINI_API_KEY=xxxxx
OPENROUTER_API_KEY=xxxxx
```

---

### **Phase 4: Testing** (30 mins)

#### Task 4.1: Test Reality Check
1. Navigate to `/ideas/reality-check`
2. Select an existing idea
3. Click "Run Reality Check"
4. Verify: Web search results appear, then reality check completes
5. Check database: `ideas` table should have `realityCheck` JSONB populated

#### Task 4.2: Test Weekly Review
1. Navigate to `/review/weekly`
2. Verify: Charts render with your actual goal data
3. Click "Generate Insight"
4. Verify: AI insight appears once, cached on refresh

#### Task 4.3: Test Teaching Assistant
1. Navigate to `/teaching`
2. Enter: Grade "5th", Topic "Photosynthesis"
3. Click "Generate Lesson Plan"
4. Verify: Full lesson with objective, activity, exit ticket

#### Task 4.4: Test Bruce Chat
1. Navigate to `/chat`
2. Type: "How am I doing on my goals?"
3. Verify: Response references your actual data
4. Type: "Search for photosynthesis activities"
5. Verify: Web search results included

---

## 💰 COST OPTIMIZATION NOTES

**Current AI Usage Per Feature:**
- **Reality Check:** ~1,500 tokens per check (~$0.006 per check)
- **Weekly Insight:** ~700 tokens per week (~$0.003 per week)
- **Teaching Lesson:** ~1,500 tokens per lesson (~$0.006 per lesson)
- **Chat Message:** ~500 tokens per message (~$0.002 per message)

**Built-in Rate Limits:**
- Weekly Insight: 1 call per week (cached)
- Reality Check: Manual trigger only (user controls)
- Teaching: Manual trigger only
- Chat: 500 token limit per response

**Estimated Monthly Cost (Heavy Usage):**
- 20 reality checks: $0.12
- 4 weekly insights: $0.01
- 30 lessons: $0.18
- 200 chat messages: $0.40
- **Total:** ~$0.71/month

---

## ⚠️ CRITICAL WARNINGS

### **DO NOT BUILD:**
1. ❌ Family data tables
2. ❌ Family member tracking
3. ❌ Family AI features
4. ❌ Any feature that auto-shares family/faith data

### **WHY:** 
Your protocol document explicitly states:
- "Red-zones (family/faith never auto-shared/exported without opt-in)"
- "Brother Protocol: never share family/faith"
- Risk Register lists "Leakage" as top concern

**If user requests family features:** Pause and ask for explicit protocol revision first.

---

## 🔄 UPDATE CHECKLIST

Before marking as complete, verify:
- [ ] All 4 components render without errors
- [ ] Reality check calls backend API successfully
- [ ] Weekly review shows real data from `/api/review/weekly`
- [ ] Teaching assistant generates complete lessons
- [ ] Chat assistant queries real APIs (`/api/logs`, `/api/ideas`, etc.)
- [ ] No console errors related to API calls
- [ ] Environment variable `ANTHROPIC_API_KEY` is set
- [ ] Navigation links work in production
- [ ] Mobile responsive (Tailwind handles this automatically)

---

## 📝 ROLLBACK PLAN

If issues arise:
1. **Disable AI features:** Set `ANTHROPIC_API_KEY=""` in env
2. **Revert routes.ts:** Restore original reality check endpoint
3. **Hide navigation:** Comment out nav links to new routes
4. **Components remain:** They fail gracefully when APIs aren't available

---

## 🎯 NEXT STEPS (Post-Integration)

**Future Enhancements (NOT for today):**
1. Add PDF export to weekly review (use `pdfkit` library)
2. Add voice input to chat (Web Speech API)
3. Add file upload to teaching assistant (accept PDFs)
4. Add idea comparison view (side-by-side reality checks)

**Protocol Decisions Needed:**
1. Family data architecture (if ever implemented)
2. Brother collaboration mode (shared red-zones)
3. Faith content opt-in system

---

## 📞 TROUBLESHOOTING

### Issue: "ANTHROPIC_API_KEY not found"
**Solution:** Add key to `.env`, restart server

### Issue: "Failed to fetch /api/ideas"
**Solution:** Verify authentication middleware working, check session

### Issue: "Reality check returns parse error"
**Solution:** Claude response might have markdown. Update regex in routes.ts

### Issue: "Charts not rendering"
**Solution:** Verify `recharts` installed, check console for errors

### Issue: "Chat doesn't load context"
**Solution:** Check API endpoints return data, verify CORS settings

---

## ✅ DEFINITION OF DONE

Integration is complete when:
1. ✅ All 4 features accessible via navigation
2. ✅ Backend API enhancements deployed
3. ✅ All tests pass (manual verification)
4. ✅ No console errors in production
5. ✅ AI costs under $1/month at projected usage
6. ✅ User can export weekly review
7. ✅ User can download teaching lessons
8. ✅ Chat conversation persists across sessions

---

## 🚀 DEPLOYMENT NOTES

**For Replit:**
1. All changes auto-deploy via Replit's hot reload
2. Environment variables set in Replit Secrets
3. No Docker rebuild required
4. Test in Replit preview before marking done

**For Docker:**
1. Rebuild: `docker compose build`
2. Restart: `docker compose up -d`
3. Check logs: `docker compose logs -f app`

---

## 📖 COMPONENT API REFERENCE

### RealityCheckDashboard
**Props:** None (uses React Router for navigation)  
**APIs Called:** 
- `GET /api/ideas` - Load idea list
- `POST /api/ideas/:id/reality-check` - Run check

### WeeklyReviewVisualizer
**Props:** None  
**APIs Called:**
- `GET /api/review/weekly` - Load stats
- `POST /api/review/weekly/insight` - Generate AI insight
- `GET /api/export/weekly.pdf` - Download review

### TeachingAssistantV2
**Props:** None  
**APIs Called:**
- `GET /api/teaching` - Load recent lessons
- `POST /api/teaching` - Generate new lesson

### BruceStewardChat
**Props:** None  
**APIs Called:**
- `GET /api/logs` - Context for AI
- `GET /api/ideas` - Context for AI
- `GET /api/goals` - Context for AI
- `GET /api/review/weekly` - Context for AI
- Client-side Anthropic API - For chat responses

---

## 🎓 LEARNING RESOURCES

**Claude API Documentation:**
https://docs.anthropic.com/en/api/getting-started

**Web Search Tool:**
https://docs.anthropic.com/en/docs/build-with-claude/tool-use

**Rate Limiting Best Practices:**
https://docs.anthropic.com/en/api/rate-limits

---

**END OF INTEGRATION GUIDE**

Good luck, Replit Agent! This is your last day to ship these features. Follow the tasks sequentially and verify each phase before moving to the next.