// ==================== AI ENDPOINTS (Add to server/routes.ts) ====================
// Add these AFTER your existing routes, BEFORE export

// AI Response Cache (24 hour TTL)
const aiCache = new Map<string, { response: string; timestamp: number; userId: string }>();
const AI_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Daily quota tracking
const dailyQuotas = new Map<string, { date: string; count: number }>();
const DAILY_QUOTA_LIMIT = 100; // 100 AI calls per user per day

// Helper: Check and enforce quota
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

// Helper: Get from cache or call AI
async function callAIWithCache(userId: string, prompt: string, systemPrompt: string): Promise<{ response: string; cached: boolean }> {
  // Create cache key from prompt
  const cacheKey = `${userId}:${Buffer.from(prompt).toString('base64').slice(0, 50)}`;
  
  // Check cache
  const cached = aiCache.get(cacheKey);
  if (cached && cached.userId === userId && Date.now() - cached.timestamp < AI_CACHE_TTL) {
    console.log('AI Cache HIT:', cacheKey);
    return { response: cached.response, cached: true };
  }
  
  // Check quota before calling API
  checkQuota(userId);
  
  // Call AI (uses existing callAI function with ladder)
  console.log('AI Cache MISS - calling API:', cacheKey);
  const response = await callAI(prompt, systemPrompt);
  
  // Cache the response
  aiCache.set(cacheKey, { response, timestamp: Date.now(), userId });
  
  return { response, cached: false };
}

// ==================== ENDPOINT 1: AI-Powered Smart Search ====================
app.post("/api/ai/search", isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { query, limit = 10 } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query string required' });
    }
    
    // Fetch user's logs
    const allLogs = await storage.getLogs(userId);
    
    // Client-side filtering (simple version - you can enhance with SQL LIKE later)
    const searchTerm = query.toLowerCase();
    const filtered = allLogs.filter(log => {
      const logText = JSON.stringify(log).toLowerCase();
      return logText.includes(searchTerm);
    }).slice(0, Number(limit));
    
    // If no results, return early
    if (filtered.length === 0) {
      return res.json({ 
        count: 0, 
        samples: [], 
        insight: 'No logs found matching your search.',
        cached: false 
      });
    }
    
    // Call AI for analysis
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

// ==================== ENDPOINT 2: AI Squad Panel (Multi-Perspective) ====================
app.post("/api/ai/squad", isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { question } = req.body;
    
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question string required' });
    }
    
    // Get Claude response (systems thinking)
    const claudePrompt = `${question}

Provide a systems-thinking perspective in 2-3 sentences. Focus on interconnections and patterns.`;

    const { response: claudeResponse, cached: claudeCached } = await callAIWithCache(
      userId,
      claudePrompt,
      "You are a systems thinker helping Bruce Harris analyze his personal operating system."
    );
    
    // Placeholder for other AIs (you'll add these later)
    const grokResponse = "Grok integration pending - add GROK_API_KEY to enable";
    const chatgptResponse = "ChatGPT integration pending - add OPENAI_API_KEY to enable";
    
    res.json({
      claude: {
        response: claudeResponse,
        cached: claudeCached,
        perspective: 'Systems Thinking'
      },
      grok: {
        response: grokResponse,
        cached: false,
        perspective: 'Data Analysis'
      },
      chatgpt: {
        response: chatgptResponse,
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

// ==================== ENDPOINT 3: Weekly Synthesis (Enhanced) ====================
app.post("/api/ai/weekly-synthesis", isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    
    // Get weekly review data
    const review = await storage.getWeeklyReview(userId);
    
    // Build comprehensive prompt
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
4. Keep it direct and practical - this is for Bruce, not an audience

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

// ==================== ENDPOINT 4: Quick Action - Find Correlations ====================
app.post("/api/ai/correlations", isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { days = 30 } = req.body;
    
    // Fetch recent logs
    const allLogs = await storage.getLogs(userId);
    const recentLogs = allLogs.slice(0, Number(days));
    
    if (recentLogs.length < 7) {
      return res.json({
        error: 'Not enough data',
        message: 'Need at least 7 days of logs to detect correlations'
      });
    }
    
    // Prepare data for analysis
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
- "Mood improves when sleep quality > 7"

Be specific with numbers and patterns. Only report correlations that appear in at least 5 data points.`;

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

// ==================== ENDPOINT 5: AI Quota Status ====================
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
    cacheSize: aiCache.size,
    cacheHitRate: '(tracking not implemented - coming soon)'
  });
});

// ==================== ENDPOINT 6: Clear AI Cache (Manual) ====================
app.post("/api/ai/cache/clear", isAuthenticated, async (req, res) => {
  const userId = getUserId(req);
  
  // Clear only this user's cache entries
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
