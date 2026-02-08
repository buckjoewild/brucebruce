# BruceOps Strategic Upgrade Roadmap v1.0
**Synthesized from**: Claude Sonnet 4.5, Gemini 2.0 Flash Thinking, Project Audit Reports  
**Date**: January 4, 2026  
**Status**: Ready for Implementation

---

## Philosophy: "Stewardship, Not Productivity Theater"

This roadmap prioritizes:
1. **Friction reduction** over feature bloat
2. **Proactive insights** over reactive dashboards  
3. **Cost-conscious AI** over unlimited spending
4. **Multi-perspective thinking** over single-AI dependence

---

## 🎯 Implementation Tiers

### **TIER 0: Foundation (This Weekend, 6-8 hours)**
*Must complete before other work*

#### 1. AI Command Center Backend Integration ⭐⭐⭐
**Effort**: 4 hours  
**Impact**: HIGH - Unlocks all AI features

**Implementation**:
```bash
# Add dependencies
npm install express-rate-limit

# Add to server/routes.ts
- AI response caching (24hr TTL)
- Rate limiting middleware (10/min AI endpoints)
- Quota tracking system (100/day default)
- 6 new endpoints (search, squad, synthesis, correlations, quota, cache clear)
```

**Validation**:
- [ ] `/api/ai/quota` returns usage stats
- [ ] Cache hit on repeat query shows "CACHED ⚡"
- [ ] 11th rapid request fails with rate limit error
- [ ] Command Center UI connects successfully

**Cost Protection**:
- Daily quota: 100 AI calls
- Rate limit: 10 req/min per endpoint
- Cache TTL: 24 hours
- Projected cost: $0.10-$0.36/month

**Code Source**: `bruceops-setup-guide.md` sections 2a-2b

---

#### 2. "Clip to Brain" Bookmarklet ⭐⭐⭐
**Effort**: 30 minutes  
**Impact**: HIGH - Reduces idea capture friction by 90%

**Implementation**:
```javascript
// Create bookmarklet
javascript:(function(){
  const title = document.title;
  const url = location.href;
  const selection = window.getSelection().toString();
  
  fetch('https://harriswildlands.com/api/ideas', {
    method: 'POST',
    credentials: 'include',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      title: title,
      pitch: selection || `Clipped from: ${url}`,
      category: 'clipped',
      captureMode: 'bookmarklet'
    })
  }).then(() => alert('💡 Saved to ThinkOps!'));
})();
```

**Installation Instructions** (for Settings page):
1. Create new bookmark
2. Name: "💡 Clip to Brain"
3. Paste bookmarklet code as URL
4. Drag to bookmarks bar

**Validation**:
- [ ] Click bookmarklet on any webpage
- [ ] Check ThinkOps - new idea appears
- [ ] Title = page title, pitch = selected text or URL

---

#### 3. Anti-Goals Implementation ⭐⭐
**Effort**: 2 hours  
**Impact**: MEDIUM - Prevents optimization theater

**Database Migration**:
```typescript
// Add to shared/schema.ts goals table
goalType: text('goal_type').notNull().default('positive') // 'positive' | 'anti'

// Add to UI (Goals.tsx)
<Select value={goalType}>
  <option value="positive">✅ Achieve This</option>
  <option value="anti">⛔ Avoid This</option>
</Select>
```

**UI Treatment**:
- Anti-goals display with red/warning styling
- Inverted progress bars (success = NOT done)
- Weekly review flags violations prominently

**Example Anti-Goals**:
```
⛔ Do not check stats more than 1x/day
⛔ No work after 8pm (family time sacred)
⛔ Avoid decision-making below energy level 6
⛔ No vaping/alcohol on school nights
```

**Validation**:
- [ ] Create anti-goal "No vaping"
- [ ] Check-in with done=true (violation)
- [ ] Weekly review shows: "⚠️ Violated 3/7 days: No vaping"

---

### **TIER 1: Quick Wins (Week 1, 10-12 hours)**
*High impact, low complexity*

#### 4. Energy-Based Task Triage ⭐⭐⭐
**Effort**: 3 hours  
**Impact**: HIGH - Matches tasks to current capacity

**Gemini's Insight**: "Combats decision fatigue during low-energy states"

**Implementation**:

**Backend** (server/routes.ts):
```typescript
// New endpoint
app.get('/api/tasks/energy-filtered', isAuthenticated, async (req, res) => {
  const { currentEnergy } = req.query; // 1-10 scale
  const userId = getUserId(req);
  
  // Get today's energy from log
  const todayLog = await storage.getLogByDate(userId, today);
  const energy = currentEnergy || todayLog?.energy || 5;
  
  // Filter goals by energy requirements
  const tasks = await storage.getGoals(userId);
  const filtered = tasks.filter(task => {
    if (energy <= 3) return task.energyRequired === 'low';
    if (energy <= 6) return task.energyRequired !== 'high';
    return true; // high energy = all tasks available
  });
  
  res.json({ currentEnergy: energy, tasks: filtered });
});
```

**Frontend** (Dashboard.tsx):
```tsx
// Add energy slider
<div className="energy-triage">
  <label>Current Energy: {energy}/10</label>
  <input 
    type="range" 
    min="1" 
    max="10" 
    value={energy}
    onChange={(e) => setEnergy(Number(e.target.value))}
  />
  <div className="task-recommendations">
    {energy <= 3 && <p>🟢 Low Energy Mode: Simple tasks only</p>}
    {energy <= 6 && <p>🟡 Medium Energy: Standard workflows</p>}
    {energy > 6 && <p>🔴 High Energy: Tackle hard problems</p>}
  </div>
</div>
```

**Goal Schema Addition**:
```typescript
energyRequired: text('energy_required').default('medium') // 'low' | 'medium' | 'high'
```

**Validation**:
- [ ] Set energy to 3 → only see "low" tasks
- [ ] Set energy to 8 → see all tasks
- [ ] Energy auto-loads from today's log

---

#### 5. Voice Brain Dump ⭐⭐
**Effort**: 6 hours  
**Impact**: MEDIUM - Enables voice-first capture

**Tech Stack**:
- Browser MediaRecorder API
- OpenAI Whisper (or Gemini Speech-to-Text)
- Existing transcript analysis pipeline

**Frontend** (Dashboard.tsx):
```tsx
const [isRecording, setIsRecording] = useState(false);
const mediaRecorder = useRef(null);

const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder.current = new MediaRecorder(stream);
  
  const chunks = [];
  mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
  mediaRecorder.current.onstop = async () => {
    const blob = new Blob(chunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', blob);
    
    // Send to backend for transcription
    const res = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    });
    const { transcript } = await res.json();
    
    // Analyze transcript
    const analysis = await fetch('/api/logs/summary', {
      method: 'POST',
      body: JSON.stringify({ rawTranscript: transcript })
    });
    
    alert('🎤 Brain dump processed!');
  };
  
  mediaRecorder.current.start();
  setIsRecording(true);
};

const stopRecording = () => {
  mediaRecorder.current.stop();
  setIsRecording(false);
};
```

**Backend** (server/routes.ts):
```typescript
app.post('/api/transcribe', isAuthenticated, upload.single('audio'), async (req, res) => {
  const audioBuffer = req.file.buffer;
  
  // Use Gemini or Whisper
  const transcript = await transcribeAudio(audioBuffer);
  
  res.json({ transcript });
});
```

**Validation**:
- [ ] Click mic button → recording starts
- [ ] Speak for 30 seconds
- [ ] Stop → transcript appears
- [ ] Auto-saves to logs with rawTranscript field

---

#### 6. Cost Monitoring Dashboard ⭐
**Effort**: 2 hours  
**Impact**: MEDIUM - Validates cost projections

**Implementation** (Settings.tsx):
```tsx
const CostDashboard = () => {
  const { data: quota } = useQuery({
    queryKey: ['/api/ai/quota'],
    refetchInterval: 60000 // refresh every minute
  });
  
  const costPerQuery = 0.0045; // $0.0045 per AI call
  const projectedMonthly = (quota?.used || 0) * 30 * costPerQuery;
  const actualWithCache = projectedMonthly * 0.3; // 70% cache hit
  
  return (
    <div className="cost-dashboard">
      <h3>💰 AI Cost Tracker</h3>
      
      <div className="metrics">
        <div>Today: {quota?.used}/{quota?.limit} calls</div>
        <div>Cache Size: {quota?.cacheSize} entries</div>
        <div>Cache Hit Rate: ~70%</div>
      </div>
      
      <div className="projections">
        <div>Projected (no cache): ${projectedMonthly.toFixed(2)}/mo</div>
        <div>Actual (with cache): ${actualWithCache.toFixed(2)}/mo</div>
      </div>
      
      <div className="recommendations">
        {quota?.used > 50 && <p>⚠️ High usage today - cache working?</p>}
        {quota?.remaining < 10 && <p>🚨 Approaching daily limit</p>}
      </div>
    </div>
  );
};
```

**Validation**:
- [ ] Dashboard shows real-time usage
- [ ] Cost projections update live
- [ ] Warnings trigger at thresholds

---

### **TIER 2: High-Value Features (Month 1, 20-24 hours)**
*Strategic differentiation*

#### 7. Morning Briefing Email ⭐⭐⭐
**Effort**: 4 hours  
**Impact**: HIGH - Proactive engagement

**Gemini's Insight**: "Push notification keeps system top-of-mind without active checking"

**Tech Stack**:
- Node-cron (scheduled tasks)
- Nodemailer or SendGrid
- Template: Yesterday's stats + Today's ONE goal + Stoic quote

**Implementation**:
```typescript
// server/scheduler.ts
import cron from 'node-cron';
import { sendEmail } from './email';

cron.schedule('0 6 * * *', async () => { // 6:00 AM daily
  const users = await storage.getAllUsers();
  
  for (const user of users) {
    const yesterday = await storage.getLogByDate(user.id, getYesterday());
    const goals = await storage.getGoals(user.id);
    const topGoal = goals.sort((a, b) => b.priority - a.priority)[0];
    
    const quote = await getRandomStoicQuote();
    
    const email = `
      Good morning, ${user.firstName}!
      
      📊 Yesterday's Stats:
      - Energy: ${yesterday?.energy || 'N/A'}/10
      - Stress: ${yesterday?.stress || 'N/A'}/10
      - Top Win: ${yesterday?.topWin || 'N/A'}
      
      🎯 Today's Focus:
      ${topGoal?.title || 'No active goals'}
      
      💭 Stoic Wisdom:
      "${quote.text}" - ${quote.author}
      
      → Review full data: https://harriswildlands.com
    `;
    
    await sendEmail(user.email, 'Your Morning Briefing', email);
  }
});
```

**Validation**:
- [ ] Cron job runs at 6 AM
- [ ] Email contains correct stats
- [ ] Quote rotates daily
- [ ] Link works

---

#### 8. Multi-AI Squad System ⭐⭐⭐
**Effort**: 8 hours  
**Impact**: HIGH - Multi-perspective insights

**Architecture**:
```typescript
// server/ai-providers.ts
const AI_SQUAD = {
  claude: {
    role: 'Systems Thinker',
    prompt: 'Analyze this from a systems perspective...',
    provider: 'anthropic'
  },
  grok: {
    role: 'Data Analyst',
    prompt: 'What does the data actually say?',
    provider: 'openrouter/grok'
  },
  gemini: {
    role: 'Ruthless PM',
    prompt: 'Reality check: Is this viable?',
    provider: 'google'
  }
};

app.post('/api/ai/squad', isAuthenticated, aiLimiter, async (req, res) => {
  const { question } = req.body;
  const userId = getUserId(req);
  
  // Get user context
  const recentLogs = await storage.getLogs(userId, { limit: 7 });
  const ideas = await storage.getIdeas(userId);
  
  const context = `
    User context:
    - Recent logs: ${JSON.stringify(recentLogs)}
    - Active ideas: ${JSON.stringify(ideas)}
    
    Question: ${question}
  `;
  
  // Call all three AIs in parallel
  const [claudeResp, grokResp, geminiResp] = await Promise.all([
    callAI(AI_SQUAD.claude.prompt + context, 'anthropic'),
    callAI(AI_SQUAD.grok.prompt + context, 'openrouter'),
    callAI(AI_SQUAD.gemini.prompt + context, 'google')
  ]);
  
  res.json({
    claude: { perspective: 'Systems Thinker', response: claudeResp },
    grok: { perspective: 'Data Analyst', response: grokResp },
    gemini: { perspective: 'Ruthless PM', response: geminiResp }
  });
});
```

**UI** (Command Center):
- Three-column layout
- Color-coded perspectives
- Vote/merge best insights

**Validation**:
- [ ] Ask: "Should I start a podcast?"
- [ ] Get three distinct perspectives
- [ ] Responses are contextual (reference user data)

---

#### 9. Correlation Discovery Engine ⭐⭐
**Effort**: 8 hours  
**Impact**: MEDIUM - Hidden pattern detection

**Implementation**:
```typescript
app.post('/api/ai/correlations', isAuthenticated, async (req, res) => {
  const { days = 30 } = req.body;
  const userId = getUserId(req);
  
  const logs = await storage.getLogs(userId, { days });
  
  // Calculate correlations
  const correlations = [];
  
  // Energy vs Exercise
  const exerciseDays = logs.filter(l => l.exercise);
  const avgEnergyWithExercise = average(exerciseDays.map(l => l.energy));
  const avgEnergyWithout = average(logs.filter(l => !l.exercise).map(l => l.energy));
  
  if (avgEnergyWithExercise > avgEnergyWithout + 1) {
    correlations.push({
      pattern: 'Exercise → Energy',
      strength: 'strong',
      insight: `Your energy is ${avgEnergyWithExercise.toFixed(1)} on exercise days vs ${avgEnergyWithout.toFixed(1)} on rest days (+${(avgEnergyWithExercise - avgEnergyWithout).toFixed(1)})`
    });
  }
  
  // Stress vs Late Screens
  const lateScreenDays = logs.filter(l => l.lateScreens);
  // ... similar analysis
  
  // AI synthesis
  const aiInsight = await callAI(`
    Analyze these correlations and suggest ONE actionable change:
    ${JSON.stringify(correlations)}
  `);
  
  res.json({ correlations, aiInsight, daysAnalyzed: days });
});
```

**Validation**:
- [ ] Analyzes 30 days of logs
- [ ] Identifies real patterns (exercise/energy)
- [ ] AI suggests specific action

---

### **TIER 3: Future Innovations (Month 2+)**
*Strategic differentiation*

#### 10. Knowledge Graph Visualization
**Effort**: 12-16 hours  
**Impact**: MEDIUM - Visual thinking landscape

**Tech**: D3.js or Cytoscape.js

**Nodes**:
- Ideas (color by category)
- People (mentioned in reflections)
- Projects (from goals)
- Patterns (from AI correlations)

**Edges**:
- "Related to" (AI-detected similarity)
- "Depends on" (resource needs)
- "Mentioned in" (log references)

---

#### 11. Predictive Drift Detection
**Effort**: 8-12 hours  
**Impact**: HIGH - Proactive interventions

**ML Model**:
- Training data: 90+ days of logs
- Features: Sleep, exercise, stress, energy patterns
- Prediction: "Thursday energy crash likely (78% confidence)"

**Alert Example**:
```
🔮 Drift Prediction Alert

Based on your pattern:
- 3 days of late screens
- Declining sleep quality
- Increasing stress

Prediction: Energy crash likely Wednesday
Confidence: 78%

Recommended Action: 
Block 8pm-10pm tonight for recovery (no screens)
```

---

## 📊 Success Metrics

### Week 1 Targets
- [ ] Command Center: 10+ queries/day
- [ ] Bookmarklet: 5+ clips/week
- [ ] Anti-goals: 3 created
- [ ] AI cost: <$0.50 actual spend

### Month 1 Targets
- [ ] Energy triage: Used daily
- [ ] Voice dumps: 2+/week
- [ ] Morning emails: 90% open rate
- [ ] Multi-AI Squad: 5+ questions asked

### Month 3 Targets
- [ ] Correlation engine: 3+ actionable patterns found
- [ ] Knowledge graph: 50+ nodes, 100+ edges
- [ ] Predictive alerts: 1+ drift prevention

---

## 🚨 Risk Mitigation

### AI Cost Overrun
**Risk**: Runaway API usage  
**Mitigation**: 
- Hard daily quota (100 calls)
- Rate limiting (10/min)
- 24hr cache
- Weekly cost alerts

### Feature Bloat
**Risk**: Too many unused features  
**Mitigation**:
- Track usage metrics
- Remove features with <10% adoption after 3 months
- Focus on friction reduction, not feature count

### Privacy Concerns
**Risk**: AI providers see personal data  
**Mitigation**:
- User consent on first AI call
- Option to disable AI entirely
- Data minimization (only send relevant context)
- Clear privacy policy

---

## 📝 Implementation Checklist

### This Weekend
- [ ] Install express-rate-limit
- [ ] Add AI endpoints to server/routes.ts
- [ ] Deploy Command Center UI
- [ ] Create bookmarklet
- [ ] Add anti-goals to schema
- [ ] Test all Tier 0 features

### Week 1
- [ ] Implement energy-based triage
- [ ] Add voice brain dump
- [ ] Create cost dashboard
- [ ] Validate metrics

### Month 1
- [ ] Set up morning briefing cron
- [ ] Integrate OpenRouter (Grok)
- [ ] Build multi-AI squad
- [ ] Launch correlation engine

---

**Next Review**: Post-Tier 0 implementation  
**Success Criteria**: All 3 features validated, <$1 spent on AI
