# This Weekend: AI Command Center Implementation Guide

**Goal**: Get all Tier 0 features working (6-8 hours total)  
**Expected Outcome**: Functional AI Command Center with cost protection

---

## Pre-Flight Checklist

- [ ] Backup current database (`pg_dump`)
- [ ] Commit current code to git
- [ ] Verify harriswildlands.com is accessible
- [ ] Confirm you have API keys for:
  - [ ] Google Gemini (`GOOGLE_GEMINI_API_KEY`)
  - [ ] OpenRouter (`OPENROUTER_API_KEY`) - optional
  - [ ] Anthropic (`ANTHROPIC_API_KEY`) - optional

---

## Part 1: Backend Setup (2-3 hours)

### Step 1.1: Install Dependencies (5 min)

```bash
cd harriswildlands.com
npm install express-rate-limit
npm install # ensure all deps current
```

**Verify**:
```bash
npm list express-rate-limit
# Should show: express-rate-limit@x.x.x
```

---

### Step 1.2: Add AI Cache & Quota System (30 min)

**File**: `server/routes.ts`

Add this RIGHT AFTER your imports, BEFORE `registerRoutes`:

```typescript
// ============================================================================
// AI CACHE & QUOTA SYSTEM
// ============================================================================

interface CachedResponse {
  response: any;
  timestamp: number;
  provider: string;
}

interface UserQuota {
  used: number;
  resetAt: Date;
}

const AI_CACHE = new Map<string, CachedResponse>();
const AI_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const DAILY_QUOTA_LIMIT = 100;
const USER_QUOTAS = new Map<string, UserQuota>();

// Cache key generator
function getCacheKey(userId: string, prompt: string): string {
  const hash = require('crypto')
    .createHash('sha256')
    .update(`${userId}:${prompt}`)
    .digest('hex');
  return hash;
}

// Quota management
function checkQuota(userId: string): { allowed: boolean; remaining: number } {
  const today = new Date().toISOString().split('T')[0];
  const quotaKey = `${userId}:${today}`;
  
  let quota = USER_QUOTAS.get(quotaKey);
  
  if (!quota || new Date() > quota.resetAt) {
    // Reset quota
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    quota = {
      used: 0,
      resetAt: tomorrow
    };
    USER_QUOTAS.set(quotaKey, quota);
  }
  
  const remaining = DAILY_QUOTA_LIMIT - quota.used;
  return { allowed: remaining > 0, remaining };
}

function incrementQuota(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const quotaKey = `${userId}:${today}`;
  const quota = USER_QUOTAS.get(quotaKey);
  if (quota) quota.used++;
}

// Smart AI call with cache
async function callAIWithCache(
  userId: string, 
  prompt: string, 
  provider = 'gemini'
): Promise<{ response: string; cached: boolean; provider: string }> {
  
  const cacheKey = getCacheKey(userId, prompt);
  const cached = AI_CACHE.get(cacheKey);
  
  // Check cache first
  if (cached && Date.now() - cached.timestamp < AI_CACHE_TTL) {
    return {
      response: cached.response,
      cached: true,
      provider: cached.provider
    };
  }
  
  // Check quota
  const quotaCheck = checkQuota(userId);
  if (!quotaCheck.allowed) {
    throw new Error(`Daily AI quota exceeded (${DAILY_QUOTA_LIMIT} calls/day). Resets at midnight.`);
  }
  
  // Make fresh AI call (use your existing callAI function)
  const response = await callAI(prompt, provider);
  
  // Increment quota
  incrementQuota(userId);
  
  // Cache response
  AI_CACHE.set(cacheKey, {
    response,
    timestamp: Date.now(),
    provider
  });
  
  return {
    response,
    cached: false,
    provider
  };
}
```

---

### Step 1.3: Add Rate Limiting Middleware (15 min)

**File**: `server/routes.ts`

Add this AFTER the cache system, BEFORE `registerRoutes`:

```typescript
// ============================================================================
// RATE LIMITING
// ============================================================================

import rateLimit from 'express-rate-limit';

// General API rate limit: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this user. Try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// AI-specific rate limit: 10 requests per minute (more expensive)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'AI rate limit exceeded. Maximum 10 requests per minute.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

---

### Step 1.4: Add AI Endpoints (60 min)

**File**: `server/routes.ts`

Add these endpoints INSIDE your `registerRoutes` function, AFTER your existing routes:

```typescript
// ============================================================================
// AI COMMAND CENTER ENDPOINTS
// ============================================================================

// 1. Smart Search
app.post('/api/ai/search', isAuthenticated, aiLimiter, async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    const userId = getUserId(req);
    
    // Fetch relevant logs/ideas based on query
    const logs = await storage.getLogs(userId);
    const ideas = await storage.getIdeas(userId);
    
    // Simple text search (you can enhance this)
    const filtered = logs.filter(log => 
      JSON.stringify(log).toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);
    
    // AI analysis
    const prompt = `Analyze these data points matching the query "${query}":
    
${JSON.stringify(filtered, null, 2)}

Provide 2-3 sentence insight about patterns or trends.`;

    const { response: insight, cached, provider } = await callAIWithCache(
      userId, 
      prompt
    );
    
    res.json({
      count: filtered.length,
      samples: filtered,
      insight,
      cached,
      provider
    });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. AI Squad (Multi-perspective)
app.post('/api/ai/squad', isAuthenticated, aiLimiter, async (req, res) => {
  try {
    const { question } = req.body;
    const userId = getUserId(req);
    
    // Get user context
    const recentLogs = await storage.getLogs(userId, { limit: 7 });
    const context = `Recent logs: ${JSON.stringify(recentLogs.slice(0, 3))}`;
    
    // Claude perspective: Systems thinking
    const claudePrompt = `You are a systems thinker. Given this question: "${question}"
    
Context: ${context}

Provide systems-level analysis in 3-4 sentences.`;

    const { response: claudeResp, cached } = await callAIWithCache(
      userId,
      claudePrompt
    );
    
    // Grok perspective: Data-driven (placeholder - use same AI for now)
    const grokPrompt = `You are a data analyst. Given this question: "${question}"
    
Context: ${context}

What does the data actually say? Be specific. 3-4 sentences.`;

    const grokResp = "Grok integration coming soon. Install OpenRouter API key.";
    
    // ChatGPT perspective: Human-centric (placeholder)
    const chatgptResp = "ChatGPT integration coming soon.";
    
    res.json({
      claude: {
        perspective: 'Systems Thinker',
        response: claudeResp,
        cached
      },
      grok: {
        perspective: 'Data Analyst',
        response: grokResp
      },
      chatgpt: {
        perspective: 'Human Perspective',
        response: chatgptResp
      }
    });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Weekly Synthesis
app.post('/api/ai/weekly-synthesis', isAuthenticated, aiLimiter, async (req, res) => {
  try {
    const userId = getUserId(req);
    
    // Get weekly review data (use your existing function)
    const review = await storage.getWeeklyReview(userId);
    
    // AI narrative generation
    const prompt = `Generate a concise weekly summary narrative (4-5 sentences) from this data:

Completion Rate: ${review.stats.completionRate}%
Completed Check-ins: ${review.stats.completedCheckins}
Total Check-ins: ${review.stats.totalCheckins}
Missed Days: ${review.stats.missedDays}

Focus on: What went well, what needs attention, ONE specific action for next week.`;

    const { response: narrative, cached, provider } = await callAIWithCache(
      userId,
      prompt
    );
    
    res.json({
      ...review,
      narrative,
      cached,
      provider
    });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Correlation Discovery
app.post('/api/ai/correlations', isAuthenticated, aiLimiter, async (req, res) => {
  try {
    const { days = 30 } = req.body;
    const userId = getUserId(req);
    
    const logs = await storage.getLogs(userId);
    const recentLogs = logs.slice(0, days);
    
    // Calculate simple correlations
    const exerciseDays = recentLogs.filter(l => l.exercise);
    const avgEnergyWithExercise = exerciseDays.reduce((sum, l) => sum + (l.energy || 0), 0) / exerciseDays.length;
    
    const noExerciseDays = recentLogs.filter(l => !l.exercise);
    const avgEnergyWithout = noExerciseDays.reduce((sum, l) => sum + (l.energy || 0), 0) / noExerciseDays.length;
    
    const correlationData = {
      exerciseVsEnergy: {
        withExercise: avgEnergyWithExercise.toFixed(1),
        withoutExercise: avgEnergyWithout.toFixed(1),
        difference: (avgEnergyWithExercise - avgEnergyWithout).toFixed(1)
      }
    };
    
    // AI synthesis
    const prompt = `Analyze these correlations and suggest ONE actionable change:

${JSON.stringify(correlationData, null, 2)}

Be specific and actionable.`;

    const { response: correlations, cached } = await callAIWithCache(
      userId,
      prompt
    );
    
    res.json({
      daysAnalyzed: recentLogs.length,
      rawData: correlationData,
      correlations,
      cached
    });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. AI Quota Status
app.get('/api/ai/quota', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const quotaCheck = checkQuota(userId);
    
    const today = new Date().toISOString().split('T')[0];
    const quotaKey = `${userId}:${today}`;
    const quota = USER_QUOTAS.get(quotaKey);
    
    res.json({
      used: quota?.used || 0,
      limit: DAILY_QUOTA_LIMIT,
      remaining: quotaCheck.remaining,
      resetAt: quota?.resetAt,
      cacheSize: AI_CACHE.size
    });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Clear Cache (for testing)
app.post('/api/test/ai/cache/clear', isAuthenticated, async (req, res) => {
  AI_CACHE.clear();
  res.json({ message: 'Cache cleared', previousSize: AI_CACHE.size });
});
```

---

### Step 1.5: Enable CORS (if needed) (10 min)

**File**: `server/index.ts`

If your Command Center will be accessed from claude.ai artifacts, add CORS:

```typescript
// Add after your imports
import cors from 'cors';

// In your app setup (after const app = express())
app.use(cors({
  origin: ['https://claude.ai', 'http://localhost:5000'],
  credentials: true
}));
```

---

### Step 1.6: Test Backend (15 min)

```bash
# Start server
npm run dev

# Test health
curl http://localhost:5000/api/health

# Test quota (requires auth - use Replit or standalone mode)
curl http://localhost:5000/api/ai/quota
```

**Expected**:
- Health: 200 OK with status info
- Quota: JSON with usage stats

---

## Part 2: Command Center UI (2 hours)

### Option A: Use React Component (Recommended)

Copy `bruceops-command-center.tsx` into your client:

```bash
cp bruceops-command-center.tsx client/src/pages/AICommandCenter.tsx
```

Add route in `App.tsx`:
```tsx
import AICommandCenter from './pages/AICommandCenter';

// In your routes
<Route path="/ai" component={AICommandCenter} />
```

### Option B: Use HTML Version (Faster Testing)

1. Copy `bruceops-command-center.html` to `client/public/ai.html`
2. Visit: `http://localhost:5000/ai.html`

---

## Part 3: Bookmarklet (30 min)

### Step 3.1: Create Bookmarklet Code

**File**: Create `client/public/bookmarklet.js`

```javascript
javascript:(function(){
  const title = document.title;
  const url = location.href;
  const selection = window.getSelection().toString();
  
  fetch('https://harriswildlands.com/api/ideas', {
    method: 'POST',
    credentials: 'include',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      title: title || 'Untitled',
      pitch: selection || `Clipped from: ${url}`,
      category: 'clipped',
      captureMode: 'bookmarklet',
      status: 'inbox'
    })
  })
  .then(res => res.json())
  .then(() => {
    // Show success notification
    const notification = document.createElement('div');
    notification.innerHTML = '💡 Saved to ThinkOps!';
    notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:16px 24px;border-radius:8px;font-family:system-ui;font-size:14px;font-weight:600;z-index:999999;box-shadow:0 4px 6px rgba(0,0,0,0.1);';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  })
  .catch(err => {
    alert('Error saving to ThinkOps: ' + err.message);
  });
})();
```

### Step 3.2: Add Installation Instructions

**File**: `client/src/pages/Settings.tsx`

Add a new section:

```tsx
<div className="bookmarklet-section">
  <h3>🔖 Clip to Brain Bookmarklet</h3>
  <p>Drag this button to your bookmarks bar:</p>
  
  <a 
    href="javascript:(function(){const title=document.title;const url=location.href;const selection=window.getSelection().toString();fetch('https://harriswildlands.com/api/ideas',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:title||'Untitled',pitch:selection||`Clipped from: ${url}`,category:'clipped',captureMode:'bookmarklet',status:'inbox'})}).then(res=>res.json()).then(()=>{const notification=document.createElement('div');notification.innerHTML='💡 Saved to ThinkOps!';notification.style.cssText='position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:16px 24px;border-radius:8px;font-family:system-ui;font-size:14px;font-weight:600;z-index:999999;box-shadow:0 4px 6px rgba(0,0,0,0.1);';document.body.appendChild(notification);setTimeout(()=>notification.remove(),3000);}).catch(err=>{alert('Error: '+err.message);});})();"
    className="bookmarklet-button"
  >
    💡 Clip to Brain
  </a>
  
  <div className="instructions">
    <h4>How to use:</h4>
    <ol>
      <li>Drag the button above to your bookmarks bar</li>
      <li>Visit any webpage</li>
      <li>Select text (optional)</li>
      <li>Click the bookmarklet</li>
      <li>Idea saved to ThinkOps! ✅</li>
    </ol>
  </div>
</div>
```

---

## Part 4: Anti-Goals (2 hours)

### Step 4.1: Update Database Schema

**File**: `shared/schema.ts`

Add to the `goals` table:

```typescript
export const goals = pgTable('goals', {
  // ... existing fields ...
  
  goalType: text('goal_type').notNull().default('positive'), // NEW
});
```

### Step 4.2: Push Schema

```bash
npm run db:push
```

### Step 4.3: Update Goals UI

**File**: `client/src/pages/Goals.tsx`

Add goal type selector:

```tsx
const [goalType, setGoalType] = useState<'positive' | 'anti'>('positive');

// In your form
<div className="form-group">
  <label>Goal Type</label>
  <select 
    value={goalType}
    onChange={(e) => setGoalType(e.target.value as 'positive' | 'anti')}
  >
    <option value="positive">✅ Achieve This</option>
    <option value="anti">⛔ Avoid This</option>
  </select>
</div>

// Style anti-goals differently
<div className={`goal-card ${goal.goalType === 'anti' ? 'anti-goal' : ''}`}>
  {goal.goalType === 'anti' && <span className="anti-badge">⛔ ANTI-GOAL</span>}
  {/* ... rest of card */}
</div>
```

**CSS**:
```css
.anti-goal {
  border: 2px solid #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.anti-badge {
  background: #ef4444;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}
```

---

## Part 5: Testing & Validation (1 hour)

### Test Checklist

**Backend**:
- [ ] `/api/ai/quota` returns usage stats
- [ ] `/api/ai/search` with query "energy" returns results
- [ ] Second identical search shows `cached: true`
- [ ] 11th rapid request fails with rate limit error

**Command Center**:
- [ ] UI loads without errors
- [ ] Search bar works
- [ ] Results display correctly
- [ ] Cache indicator shows correctly

**Bookmarklet**:
- [ ] Drag to bookmarks bar works
- [ ] Click on any webpage saves to ThinkOps
- [ ] Success notification appears
- [ ] Idea appears in ThinkOps inbox

**Anti-Goals**:
- [ ] Create anti-goal "No vaping"
- [ ] Goal displays with red styling
- [ ] Check-in works correctly
- [ ] Weekly review shows violations

---

## Deployment

```bash
# Commit changes
git add .
git commit -m "Add AI Command Center + bookmarklet + anti-goals"

# Push to Replit (auto-deploys)
git push origin main

# Or deploy manually
npm run build
npm run start
```

---

## Success Criteria

At the end of this weekend, you should have:

1. ✅ Functional AI Command Center with 6 endpoints
2. ✅ Cost protection (quota + rate limiting + caching)
3. ✅ Working bookmarklet
4. ✅ Anti-goals feature
5. ✅ <$1 spent on AI calls

---

## Troubleshooting

### "AI quota exceeded"
**Solution**: Clear cache or increase `DAILY_QUOTA_LIMIT`

### "Rate limit exceeded"
**Solution**: Wait 60 seconds or increase `aiLimiter.max`

### Bookmarklet doesn't work
**Solution**: 
1. Check browser console for errors
2. Verify `/api/ideas` endpoint works
3. Ensure CORS is enabled

### Cache not working
**Solution**: Check `AI_CACHE.size` via `/api/ai/quota`

---

## Next Steps (Week 1)

After validating Tier 0:
1. Add energy-based task triage
2. Implement voice brain dump
3. Create cost monitoring dashboard

---

**Good luck! You're building something genuinely innovative.** 🚀
