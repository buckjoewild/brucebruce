# 🚀 MASTER REPLIT PROMPT - COMPLETE BRUCEOPS INSTALLATION

**Copy this ENTIRE prompt and paste it into Replit Agent**

---

```
TASK: Install BruceOps AI Endpoints - Complete Implementation

I'm providing you with the COMPLETE SOURCE CODE below. You need to integrate it into server/routes.ts.

=== SOURCE CODE START ===

[PART 1: AI INFRASTRUCTURE - Add after callAI function]

// AI Response Cache (24-hour TTL)
interface CachedResponse {
  response: any;
  timestamp: number;
  cached: boolean;
}

const aiResponseCache = new Map<string, CachedResponse>();
const AI_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Daily Quota Tracking
interface DailyUsage {
  [key: string]: number;
}

const dailyUsage: DailyUsage = {};
const DAILY_QUOTA_LIMIT = 100;

function checkQuota(userId: string): void {
  const today = new Date().toISOString().split('T')[0];
  const key = `${userId}-${today}`;
  const used = dailyUsage[key] || 0;
  
  if (used >= DAILY_QUOTA_LIMIT) {
    throw new Error(`Daily AI quota exceeded (${DAILY_QUOTA_LIMIT} calls/day). Resets at midnight UTC.`);
  }
  
  dailyUsage[key] = used + 1;
}

function getQuotaStats(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const key = `${userId}-${today}`;
  const used = dailyUsage[key] || 0;
  const remaining = DAILY_QUOTA_LIMIT - used;
  
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  
  return {
    used,
    limit: DAILY_QUOTA_LIMIT,
    remaining: Math.max(0, remaining),
    resetAt: tomorrow.toISOString(),
    cacheSize: aiResponseCache.size
  };
}

function hashPrompt(prompt: string): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

async function callAIWithCache(userId: string, prompt: string, lanePrompt: string = ""): Promise<any> {
  const cacheKey = `${userId}:${hashPrompt(prompt + lanePrompt)}`;
  const cached = aiResponseCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < AI_CACHE_TTL) {
    console.log(`✅ Cache HIT for user ${userId}`);
    return { response: cached.response, cached: true };
  }
  
  checkQuota(userId);
  
  console.log(`🔥 Cache MISS for user ${userId} - calling AI`);
  const response = await callAI(prompt, lanePrompt);
  
  aiResponseCache.set(cacheKey, {
    response,
    timestamp: Date.now(),
    cached: false
  });
  
  return { response, cached: false };
}

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

[END PART 1]

[PART 2: AI ENDPOINTS - Add inside registerRoutes, before return httpServer]

app.get("/api/ai/quota", isAuthenticated, (req, res) => {
  const userId = getUserId(req);
  const stats = getQuotaStats(userId);
  res.json(stats);
});

app.post("/api/ai/search", isAuthenticated, aiRateLimiter, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { query, limit = 10 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    
    const logs = await storage.getLogs(userId);
    
    const filtered = logs.filter(log => {
      const searchText = JSON.stringify(log).toLowerCase();
      return searchText.includes(query.toLowerCase());
    }).slice(0, limit);
    
    if (filtered.length === 0) {
      return res.json({
        count: 0,
        samples: [],
        insight: `No logs found matching "${query}". Try different keywords like: energy, stress, exercise, family, wins, etc.`,
        cached: false
      });
    }
    
    const prompt = `Bruce searched his life logs for: "${query}"

Here are the ${filtered.length} matching entries:
${JSON.stringify(filtered.slice(0, 5), null, 2)}

Provide a concise, actionable analysis:
1. What patterns do you see?
2. What insights emerge?
3. What should Bruce do with this information?

Keep it practical and specific to Bruce's search.`;
    
    const lanePrompt = "You are analyzing Bruce's daily life data. Be insightful, direct, and actionable.";
    
    const aiResult = await callAIWithCache(userId, prompt, lanePrompt);
    
    res.json({
      count: filtered.length,
      samples: filtered,
      insight: aiResult.response,
      cached: aiResult.cached
    });
    
  } catch (err: any) {
    console.error("❌ AI Search error:", err);
    res.status(500).json({ error: err.message || "Search failed" });
  }
});

app.post("/api/ai/squad", isAuthenticated, aiRateLimiter, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }
    
    const claudePrompt = `Bruce asks: "${question}"

Respond as a systems thinking advisor who helps Bruce see:
- The bigger picture and connections
- Second-order effects
- How different parts of his life interact
- Strategic vs tactical considerations

Be direct, practical, and specific to Bruce's situation.`;
    
    const claudeResult = await callAIWithCache(
      userId,
      claudePrompt,
      "You are a systems thinking advisor for Bruce Harris."
    );
    
    const response = {
      claude: {
        perspective: "Systems Thinker",
        response: claudeResult.response,
        cached: claudeResult.cached
      },
      grok: {
        perspective: "Data Analyst",
        response: "Grok integration coming soon! For now, use Claude's systems thinking perspective above."
      },
      chatgpt: {
        perspective: "Human Advocate",
        response: "ChatGPT integration coming soon! For now, use Claude's systems thinking perspective above."
      },
      cached: claudeResult.cached
    };
    
    res.json(response);
    
  } catch (err: any) {
    console.error("❌ AI Squad error:", err);
    res.status(500).json({ error: err.message || "AI Squad failed" });
  }
});

app.post("/api/ai/weekly-synthesis", isAuthenticated, aiRateLimiter, async (req, res) => {
  try {
    const userId = getUserId(req);
    
    const review = await storage.getWeeklyReview(userId);
    
    const prompt = `Generate a personal weekly synthesis for Bruce:

COMPLETION STATS:
- Rate: ${review.stats.completionRate}%
- Completed: ${review.stats.completedCheckins}/${review.stats.totalCheckins} check-ins
- Missed Days: ${review.stats.missedDays}

ACTIVE GOALS:
${review.goals.map(g => `- [${g.domain}] ${g.title} (Priority ${g.priority})`).join('\n')}

${review.driftFlags.length > 0 ? `DRIFT WARNINGS:\n${review.driftFlags.map(f => `- ${f}`).join('\n')}` : 'No drift flags - staying on track!'}

Write a narrative that:
1. Acknowledges what Bruce accomplished this week
2. Identifies meaningful patterns or trends
3. Calls out any drift with specific evidence
4. Provides 2-3 actionable recommendations for next week
5. Keeps his core values (faith, family, building) in focus

Be encouraging but honest. Bruce values directness.`;
    
    const aiResult = await callAIWithCache(userId, prompt, "You are Bruce's personal weekly advisor.");
    
    res.json({
      stats: review.stats,
      driftFlags: review.driftFlags,
      narrative: aiResult.response,
      cached: aiResult.cached
    });
    
  } catch (err: any) {
    console.error("❌ Weekly synthesis error:", err);
    res.status(500).json({ error: err.message || "Weekly synthesis failed" });
  }
});

app.post("/api/ai/correlations", isAuthenticated, aiRateLimiter, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { days = 30 } = req.body;
    
    const allLogs = await storage.getLogs(userId);
    const recentLogs = allLogs.slice(-days);
    
    if (recentLogs.length === 0) {
      return res.json({
        daysAnalyzed: 0,
        correlations: "No logs found to analyze. Start logging daily to discover patterns!",
        cached: false
      });
    }
    
    const prompt = `Analyze ${recentLogs.length} days of Bruce's life data and discover correlations:

DATA SUMMARY:
${JSON.stringify(recentLogs, null, 2)}

Find and explain (with specific numbers):
1. What factors correlate with HIGH energy? (exercise, sleep, habits)
2. What factors correlate with HIGH stress? 
3. What patterns exist in wins vs frictions?
4. How do sleep quality and hours affect next-day performance?
5. Any day-of-week patterns?
6. What drift factors (vaping, late screens, etc.) correlate with negative outcomes?

Be specific: "Exercise days show X% higher energy" not "exercise helps energy"
Only report correlations you can actually see in the data.`;
    
    const aiResult = await callAIWithCache(
      userId,
      prompt,
      "You are a data analyst helping Bruce discover actionable patterns in his life."
    );
    
    res.json({
      daysAnalyzed: recentLogs.length,
      correlations: aiResult.response,
      cached: aiResult.cached
    });
    
  } catch (err: any) {
    console.error("❌ Correlations error:", err);
    res.status(500).json({ error: err.message || "Correlation analysis failed" });
  }
});

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

[END PART 2]

=== SOURCE CODE END ===

INSTALLATION INSTRUCTIONS:

1. Open server/routes.ts

2. Check if this import exists at the top:
   import rateLimit from 'express-rate-limit';
   If missing, add it and run: npm install express-rate-limit

3. Find the existing "async function callAI" function

4. PASTE PART 1 (Infrastructure) AFTER the callAI function, BEFORE "export function registerRoutes"

5. Find the "export function registerRoutes" function

6. Inside that function, find "return httpServer;" at the END

7. PASTE PART 2 (Endpoints) BEFORE "return httpServer;" line

8. Start the server and test:
   curl http://localhost:5000/api/ai/quota

SUCCESS CRITERIA:
- Server starts without errors
- /api/ai/quota returns JSON with quota stats
- Console shows "AI Provider: [provider]" on startup
- All 6 endpoints are functional

EXECUTE NOW. After completion, report:
1. What you added (show line numbers)
2. Server status
3. Test result from /api/ai/quota endpoint
```

---

## HOW TO USE THIS PROMPT

1. **Copy everything** between the outer ``` marks
2. **Paste** into Replit Agent
3. **Send**
4. **Watch** it work!

Replit will:
- Read the code
- Add import if needed
- Install dependencies
- Find insertion points
- Paste Part 1 (Infrastructure)
- Paste Part 2 (Endpoints)
- Start server
- Test endpoints
- Report success!

**Estimated time: 2-3 minutes**
