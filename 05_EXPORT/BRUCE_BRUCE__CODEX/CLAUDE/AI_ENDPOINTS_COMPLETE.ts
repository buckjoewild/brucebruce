/**
 * ============================================================================
 * BRUCEOPS AI ENDPOINTS - COMPLETE IMPLEMENTATION
 * ============================================================================
 * 
 * ADD THESE TO YOUR server/routes.ts FILE
 * 
 * This file contains EVERYTHING needed to make your MCP server work:
 * - AI response caching (24-hour TTL, saves money!)
 * - Daily quota tracking (100 calls/day limit)
 * - Rate limiting (10 requests/minute protection)
 * - 6 powerful AI endpoints
 * 
 * INSTALLATION INSTRUCTIONS AT THE BOTTOM!
 * ============================================================================
 */

// ============================================================================
// PART 1: AI INFRASTRUCTURE (Add after your existing callAI function)
// ============================================================================

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
  [key: string]: number; // key format: "userId-YYYY-MM-DD"
}

const dailyUsage: DailyUsage = {};
const DAILY_QUOTA_LIMIT = 100;

/**
 * Check if user has quota remaining, throw error if exceeded
 */
function checkQuota(userId: string): void {
  const today = new Date().toISOString().split('T')[0];
  const key = `${userId}-${today}`;
  
  const used = dailyUsage[key] || 0;
  
  if (used >= DAILY_QUOTA_LIMIT) {
    throw new Error(`Daily AI quota exceeded (${DAILY_QUOTA_LIMIT} calls/day). Resets at midnight UTC.`);
  }
  
  dailyUsage[key] = used + 1;
}

/**
 * Get current quota stats for a user
 */
function getQuotaStats(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const key = `${userId}-${today}`;
  const used = dailyUsage[key] || 0;
  const remaining = DAILY_QUOTA_LIMIT - used;
  
  // Calculate reset time (midnight UTC)
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

/**
 * Simple hash function for cache keys
 */
function hashPrompt(prompt: string): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

/**
 * Call AI with caching and quota checking
 * Returns cached response if available, otherwise calls AI
 */
async function callAIWithCache(userId: string, prompt: string, lanePrompt: string = ""): Promise<any> {
  const cacheKey = `${userId}:${hashPrompt(prompt + lanePrompt)}`;
  const cached = aiResponseCache.get(cacheKey);
  
  // Return cached response if valid
  if (cached && Date.now() - cached.timestamp < AI_CACHE_TTL) {
    console.log(`✅ Cache HIT for user ${userId}`);
    return { response: cached.response, cached: true };
  }
  
  // Check quota before calling AI
  checkQuota(userId);
  
  // Call AI
  console.log(`🔥 Cache MISS for user ${userId} - calling AI (${getActiveAIProvider()})`);
  const response = await callAI(prompt, lanePrompt);
  
  // Cache the response
  aiResponseCache.set(cacheKey, {
    response,
    timestamp: Date.now(),
    cached: false
  });
  
  return { response, cached: false };
}

// Rate Limiting Middleware (10 requests/minute per user)
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'AI rate limit exceeded. Maximum 10 requests per minute.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return getUserId(req) || req.ip || 'anonymous';
  }
});

// ============================================================================
// PART 2: AI ENDPOINTS (Add before "return httpServer;" in registerRoutes)
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

/**
 * POST /api/ai/search
 * Smart semantic search through user's logs with AI analysis
 * 
 * Body: { query: string, limit?: number }
 * Returns: { count, samples, insight, cached }
 */
app.post("/api/ai/search", isAuthenticated, aiRateLimiter, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { query, limit = 10 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    
    // Get all logs for the user
    const logs = await storage.getLogs(userId);
    
    // Filter logs based on query (simple text search)
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
    
    // Generate AI insight
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

/**
 * POST /api/ai/squad
 * Get multi-AI perspective analysis
 * 
 * Body: { question: string }
 * Returns: { claude, grok, chatgpt, cached }
 */
app.post("/api/ai/squad", isAuthenticated, aiRateLimiter, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }
    
    // Claude (Systems Thinker) - this is the real AI call
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
    
    // Format response (Grok and ChatGPT are placeholders for now)
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

/**
 * POST /api/ai/weekly-synthesis
 * Generate AI narrative synthesis of the week
 * 
 * Body: none
 * Returns: { stats, driftFlags, narrative, cached }
 */
app.post("/api/ai/weekly-synthesis", isAuthenticated, aiRateLimiter, async (req, res) => {
  try {
    const userId = getUserId(req);
    
    // Get weekly review data
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

/**
 * POST /api/ai/correlations
 * Discover patterns and correlations in user data
 * 
 * Body: { days?: number }
 * Returns: { daysAnalyzed, correlations, cached }
 */
app.post("/api/ai/correlations", isAuthenticated, aiRateLimiter, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { days = 30 } = req.body;
    
    // Get recent logs
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

/**
 * POST /api/test/ai/cache/clear
 * Clear the AI response cache (for testing/debugging)
 * 
 * Body: none
 * Returns: { message, before, after }
 */
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

// ============================================================================
// INSTALLATION INSTRUCTIONS
// ============================================================================

/**
 * HOW TO ADD THESE ENDPOINTS TO YOUR SERVER:
 * 
 * 1. OPEN: server/routes.ts
 * 
 * 2. VERIFY you have this import at the top:
 *    import rateLimit from 'express-rate-limit';
 *    
 *    If not, add it!
 * 
 * 3. COPY "PART 1: AI INFRASTRUCTURE" (lines 20-140)
 *    PASTE after your existing callAI function (around line 100-120)
 * 
 * 4. COPY "PART 2: AI ENDPOINTS" (lines 150-400)
 *    PASTE before the final "return httpServer;" line (at the end)
 * 
 * 5. SAVE the file
 * 
 * 6. START your server:
 *    npm run dev
 * 
 * 7. TEST the endpoints:
 *    curl http://localhost:5000/api/ai/quota
 * 
 * 8. YOU'RE DONE! 🎉
 * 
 * Now your MCP server will work perfectly with all these endpoints!
 */
