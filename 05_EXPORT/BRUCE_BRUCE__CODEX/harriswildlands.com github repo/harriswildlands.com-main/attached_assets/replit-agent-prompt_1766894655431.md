# Replit Agent Prompt: BruceOps AI Command Center

**OBJECTIVE:** Implement a bulletproof AI-powered Command Center for BruceOps with cost protection, caching, and rate limiting.

---

## CONTEXT

BruceOps is a personal operating system running on localhost:5000. We need to add AI-powered features that:
1. Call the Anthropic API safely from the server (never from browser)
2. Implement response caching (24hr TTL) to reduce costs
3. Enforce daily quotas (100 AI calls/day per user)
4. Add rate limiting (10 AI requests/minute)
5. Enable CORS for claude.ai to access the API

**IMPORTANT:** All AI calls must go through the SERVER, not directly from artifacts/frontend.

---

## TASK 1: Install Dependencies

Add this package:
```bash
npm install express-rate-limit
```

---

## TASK 2: Add CORS & Rate Limiting Middleware

In `server/routes.ts`, add this import at the TOP:

```typescript
import rateLimit from 'express-rate-limit';
```

Then in the `registerRoutes` function, RIGHT AFTER `await setupAuth(app);` and `registerAuthRoutes(app);`, add:

```typescript
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
  keyGenerator: (req) => {
    return getUserId(req) || req.ip;
  }
});

app.use('/api/', generalLimiter);
app.use('/api/ai/', aiLimiter);

console.log('✅ Rate limiting enabled:');
console.log('   - General: 100 req/15min');
console.log('   - AI: 10 req/min per user');
```

---

## TASK 3: Add AI Endpoints with Caching & Quotas

At the END of `server/routes.ts`, BEFORE the final `return httpServer;`, add:

```typescript
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
  const cacheKey = `${userId}:${Buffer.from(prompt).toString('base64').slice(0, 50)}`;
  
  const cached = aiCache.get(cacheKey);
  if (cached && cached.userId === userId && Date.now() - cached.timestamp < AI_CACHE_TTL) {
    console.log('AI Cache HIT:', cacheKey);
    return { response: cached.response, cached: true };
  }
  
  checkQuota(userId);
  
  console.log('AI Cache MISS - calling API:', cacheKey);
  const response = await callAI(prompt, systemPrompt);
  
  aiCache.set(cacheKey, { response, timestamp: Date.now(), userId });
  
  return { response, cached: false };
}

// ==================== AI ENDPOINTS ====================

// 1. Smart Search
app.post("/api/ai/search", isAuthenticated, async (req, res) => {
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
    
    res.json({
      count: filtered.length,
      samples: filtered,
      insight,
      cached,
      quotaRemaining: DAILY_QUOTA_LIMIT - (dailyQuotas.get(`${userId}-${new Date().toISOString().split('T')[0]}`)?.count || 0)
    });
    
  } catch (err: any) {
    console.error('AI Search error:', err);
    res.status(500).json({ error: err.message || 'Search failed' });
  }
});

// 2. AI Squad Panel
app.post("/api/ai/squad", isAuthenticated, async (req, res) => {
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
      quotaRemaining: DAILY_QUOTA_LIMIT - (dailyQuotas.get(`${userId}-${new Date().toISOString().split('T')[0]}`)?.count || 0)
    });
    
  } catch (err: any) {
    console.error('AI Squad error:', err);
    res.status(500).json({ error: err.message || 'Squad query failed' });
  }
});

// 3. Weekly Synthesis
app.post("/api/ai/weekly-synthesis", isAuthenticated, async (req, res) => {
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
    
    res.json({
      stats: review.stats,
      goals: review.goals,
      checkins: review.checkins,
      driftFlags: review.driftFlags,
      narrative,
      cached,
      generatedAt: new Date().toISOString(),
      quotaRemaining: DAILY_QUOTA_LIMIT - (dailyQuotas.get(`${userId}-${new Date().toISOString().split('T')[0]}`)?.count || 0)
    });
    
  } catch (err: any) {
    console.error('Weekly synthesis error:', err);
    res.status(500).json({ error: err.message || 'Synthesis failed' });
  }
});

// 4. Find Correlations
app.post("/api/ai/correlations", isAuthenticated, async (req, res) => {
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
    
    res.json({
      daysAnalyzed: recentLogs.length,
      correlations,
      cached,
      quotaRemaining: DAILY_QUOTA_LIMIT - (dailyQuotas.get(`${userId}-${new Date().toISOString().split('T')[0]}`)?.count || 0)
    });
    
  } catch (err: any) {
    console.error('Correlation analysis error:', err);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

// 5. AI Quota Status
app.get("/api/ai/quota", isAuthenticated, async (req, res) => {
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

// 6. Clear Cache
app.post("/api/ai/cache/clear", isAuthenticated, async (req, res) => {
  const userId = getUserId(req);
  
  let cleared = 0;
  for (const [key, value] of aiCache.entries()) {
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
```

---

## TASK 4: Verify Implementation

After implementing, test these endpoints:

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```
Expected: `{"status": "ok", ...}`

### Test 2: AI Quota
```bash
curl http://localhost:5000/api/ai/quota
```
Expected: `{"used": 0, "limit": 100, "remaining": 100, ...}`

### Test 3: Smart Search
```bash
curl -X POST http://localhost:5000/api/ai/search \
  -H "Content-Type: application/json" \
  -d '{"query": "energy", "limit": 5}'
```
Expected: JSON with `count`, `samples`, `insight`, `cached: false`

### Test 4: Cache Verification
Run the same search again immediately:
```bash
curl -X POST http://localhost:5000/api/ai/search \
  -H "Content-Type: application/json" \
  -d '{"query": "energy", "limit": 5}'
```
Expected: Same result but `cached: true`

---

## TASK 5: Update Console Logging

When the server starts, you should see:
```
===========================================
STANDALONE MODE ACTIVE
...
===========================================
✅ CORS enabled for: [array of origins]
✅ Rate limiting enabled:
   - General: 100 req/15min
   - AI: 10 req/min per user
serving on port 5000
```

---

## SUCCESS CRITERIA

✅ Server starts without errors
✅ CORS middleware logs show allowed origins
✅ Rate limiting logs appear
✅ `/api/health` returns 200
✅ `/api/ai/quota` returns quota info
✅ `/api/ai/search` returns AI analysis
✅ Second identical search shows `cached: true`
✅ Making 11 rapid AI requests triggers rate limit error
✅ Console shows "AI Cache HIT" on repeated queries
✅ Console shows "AI Cache MISS - calling API" on new queries

---

## COST PROTECTION VERIFICATION

After implementation, verify:

1. **Quota Enforcement:** Make 101 AI requests in one day → 101st should fail with quota exceeded
2. **Rate Limiting:** Make 11 AI requests in 60 seconds → 11th should fail with rate limit
3. **Caching:** Same query twice → second should be instant and show `cached: true`
4. **Daily Reset:** Check quota at 11:59 PM and 12:01 AM → should reset to 0/100

---

## NOTES FOR REPLIT AGENT

- Do NOT modify existing endpoints
- Add code EXACTLY as specified (don't "improve" the logic)
- Place CORS/rate limiting AFTER auth setup but BEFORE existing routes
- Place AI endpoints BEFORE the final `return httpServer;`
- Keep all existing functionality intact
- Test each endpoint after implementation
- If standalone mode is not active, set `STANDALONE_MODE=true` in secrets

---

## EXPECTED OUTCOME

A bulletproof AI Command Center with:
- ✅ Cost protection (daily quotas, caching, rate limiting)
- ✅ Security (CORS, server-side AI calls only)
- ✅ Monitoring (quota tracking, cache stats)
- ✅ Performance (24hr cache, efficient queries)
- ✅ Estimated cost: <$1/month for normal usage

---

**IMPORTANT:** After implementation, the Command Center artifact (running on claude.ai) will be able to call these endpoints and display results without exposing API keys or making unprotected API calls.
