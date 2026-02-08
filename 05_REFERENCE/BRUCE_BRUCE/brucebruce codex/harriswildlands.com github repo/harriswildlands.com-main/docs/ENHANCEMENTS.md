# BruceOps Enhancement Roadmap

**Comprehensive future development plan based on requirements documents**

---

## Table of Contents

1. [Priority Matrix](#priority-matrix)
2. [Phase 1: Core Improvements](#phase-1-core-improvements-weeks-1-4)
3. [Phase 2: Advanced Features](#phase-2-advanced-features-weeks-5-8)
4. [Phase 3: Integration & Scale](#phase-3-integration--scale-weeks-9-12)
5. [Technical Debt & Improvements](#technical-debt--improvements)
6. [Implementation Details](#implementation-details)

---

## Priority Matrix

| Priority | Feature | Lane | Complexity | Impact |
|----------|---------|------|------------|--------|
| P0 | Real Drift Detection | LifeOps | High | Critical |
| P0 | Voice Transcription | All | Medium | High |
| P1 | AI Response Caching | All | Medium | High |
| P1 | Settings Persistence | All | Low | Medium |
| P1 | PDF Export | Teaching | Medium | High |
| P2 | Authentication | All | Medium | High |
| P2 | Weekly Summary Reports | LifeOps | Medium | Medium |
| P2 | Kanban Board UI | ThinkOps | Medium | Medium |
| P3 | WordPress Integration | Harris | High | Medium |
| P3 | Multi-user Support | All | High | Medium |
| P3 | Mobile App (PWA) | All | High | High |

---

## Phase 1: Core Improvements (Weeks 1-4)

### 1.1 Real Drift Detection Algorithm

**Current State:** Mock drift flags returned from API  
**Target State:** Algorithmic detection based on log patterns

**Requirements (from Drift Detection doc):**
- Analyze last 7-14 days of logs
- Detect patterns: sleep inconsistency, stress spikes, missed habits
- Only show flags when sufficient data exists (≥7 entries)
- Flags are observational, not prescriptive

**Implementation:**

```typescript
// server/drift-detection.ts

interface DriftRule {
  name: string;
  check: (logs: Log[]) => string | null;
}

const driftRules: DriftRule[] = [
  {
    name: "Sleep Inconsistency",
    check: (logs) => {
      const sleepHours = logs.map(l => l.sleepHours).filter(Boolean);
      if (sleepHours.length < 7) return null;
      
      const avg = sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length;
      const variance = sleepHours.reduce((sum, h) => sum + Math.pow(h - avg, 2), 0) / sleepHours.length;
      
      if (variance > 2) {
        return `Sleep inconsistency detected (±${Math.sqrt(variance).toFixed(1)} hours variance)`;
      }
      return null;
    }
  },
  {
    name: "High Stress Pattern",
    check: (logs) => {
      const recent = logs.slice(0, 5);
      const highStressDays = recent.filter(l => l.stress >= 7).length;
      
      if (highStressDays >= 3) {
        return `High stress pattern: ${highStressDays}/5 days above threshold`;
      }
      return null;
    }
  },
  {
    name: "Exercise Dropout",
    check: (logs) => {
      const recent = logs.slice(0, 7);
      const exerciseDays = recent.filter(l => l.exercise).length;
      
      if (exerciseDays <= 2) {
        return `Exercise pattern declining: only ${exerciseDays}/7 days`;
      }
      return null;
    }
  },
  {
    name: "Vaping Relapse",
    check: (logs) => {
      const recent = logs.slice(0, 7);
      const vapingDays = recent.filter(l => l.vaping).length;
      
      if (vapingDays >= 3) {
        return `Vaping pattern detected: ${vapingDays}/7 days`;
      }
      return null;
    }
  },
  {
    name: "Money Pressure Spike",
    check: (logs) => {
      const recent = logs.slice(0, 5);
      const avgPressure = recent.reduce((sum, l) => sum + (l.moneyPressure || 0), 0) / recent.length;
      
      if (avgPressure >= 7) {
        return `Money pressure elevated: avg ${avgPressure.toFixed(1)}/10`;
      }
      return null;
    }
  }
];

export function detectDrift(logs: Log[]): string[] {
  if (logs.length < 7) {
    return []; // Not enough data
  }
  
  return driftRules
    .map(rule => rule.check(logs))
    .filter((flag): flag is string => flag !== null);
}
```

**Database Changes:** None required  
**API Changes:** Update `/api/dashboard` to call `detectDrift()`

---

### 1.2 Voice Log Transcription

**Current State:** `rawTranscript` field exists but unused  
**Target State:** Voice input → transcription → auto-parse into log fields

**Implementation Options:**

**Option A: Browser Web Speech API (Free, Local)**
```typescript
// client/src/components/VoiceRecorder.tsx

function VoiceRecorder({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false);
  
  const startListening = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      onTranscript(transcript);
    };
    
    recognition.start();
    setIsListening(true);
  };
  
  return (
    <Button onClick={startListening} variant={isListening ? "destructive" : "default"}>
      <Mic className="w-4 h-4 mr-2" />
      {isListening ? "Stop" : "Voice Log"}
    </Button>
  );
}
```

**Option B: OpenAI Whisper via OpenRouter (Higher Quality)**
```typescript
// server/transcription.ts

async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  // OpenRouter doesn't support Whisper directly
  // Would need direct OpenAI API or alternative
  
  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData, // multipart with audio file
  });
  
  return (await response.json()).text;
}
```

**AI Parsing of Transcript:**
```typescript
async function parseVoiceLog(transcript: string): Promise<Partial<InsertLog>> {
  const prompt = `Parse this voice log into structured fields.
    Transcript: "${transcript}"
    
    Extract JSON with fields:
    - energy (1-10)
    - stress (1-10)
    - mood (1-10)
    - topWin
    - topFriction
    - tomorrowPriority
    - familyConnection
    
    If a field isn't mentioned, omit it.`;
  
  const response = await callOpenRouter(prompt, "Extract structured data from voice input. JSON only.");
  return JSON.parse(response);
}
```

---

### 1.3 AI Response Caching

**Current State:** Every AI call hits OpenRouter  
**Target State:** Cache responses, re-run only when inputs change

**Implementation:**

```typescript
// shared/schema.ts - Add cache table

export const aiCache = pgTable("ai_cache", {
  id: serial("id").primaryKey(),
  inputHash: text("input_hash").unique().notNull(), // SHA256 of input
  inputType: text("input_type").notNull(), // "reality_check", "summary", etc.
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Optional TTL
});

// server/ai.ts

import crypto from 'crypto';

async function cachedAICall(
  type: string,
  input: string,
  systemPrompt: string
): Promise<string> {
  const inputHash = crypto.createHash('sha256').update(input).digest('hex');
  
  // Check cache
  const cached = await db.select().from(aiCache)
    .where(eq(aiCache.inputHash, inputHash))
    .limit(1);
  
  if (cached.length > 0) {
    return cached[0].response;
  }
  
  // Generate new response
  const response = await callOpenRouter(input, systemPrompt);
  
  // Cache it
  await db.insert(aiCache).values({
    inputHash,
    inputType: type,
    response,
  });
  
  return response;
}
```

**Benefits:**
- Reduces API costs significantly
- Faster response for repeated queries
- Enables offline viewing of previous results

---

### 1.4 Settings Persistence

**Current State:** Settings UI exists but doesn't persist  
**Target State:** Settings saved to database and used by AI calls

**Implementation:**

```typescript
// server/routes.ts - Update AI calls to use settings

app.post(api.teaching.create.path, async (req, res) => {
  // Get user's preferred model
  const modelSetting = await storage.getSettingByKey('model');
  const toneSetting = await storage.getSettingByKey('tone');
  
  const model = modelSetting?.value || 'openai/gpt-4o-mini';
  const tone = toneSetting?.value || 'direct';
  
  // Use in AI call
  const response = await callOpenRouter(
    prompt,
    `You are a ${tone} teaching assistant...`,
    model  // Pass model to callOpenRouter
  );
});
```

**UI Update:**
```typescript
// client/src/pages/Settings.tsx

const { data: settings } = useSettings();
const { mutate: updateSetting } = useUpdateSetting();

const handleSave = () => {
  updateSetting({ key: 'model', value: selectedModel });
  updateSetting({ key: 'tone', value: selectedTone });
  updateSetting({ key: 'advice_mode', value: adviceMode });
};
```

---

## Phase 2: Advanced Features (Weeks 5-8)

### 2.1 PDF Export for Teaching Materials

**Implementation:**
```typescript
// Install: npm install @react-pdf/renderer

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const LessonPlanPDF = ({ request }: { request: TeachingRequest }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{request.topic}</Text>
        <Text style={styles.subtitle}>{request.grade} | {request.standard}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lesson Outline</Text>
        <Text>{request.output?.lessonOutline}</Text>
      </View>
      
      {/* Additional sections... */}
    </Page>
  </Document>
);

const exportToPDF = async (request: TeachingRequest) => {
  const blob = await pdf(<LessonPlanPDF request={request} />).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url);
};
```

---

### 2.2 Weekly Summary Reports

**From LifeOps Master Sheet:**
- Weekly output package with recurring issues
- One habit focus recommendation
- Review scheduled for Sunday 7:30pm

**Implementation:**

```typescript
// server/weekly-summary.ts

async function generateWeeklySummary(userId?: string): Promise<string> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const logs = await db.select().from(logs)
    .where(gte(logs.date, weekAgo.toISOString().split('T')[0]))
    .orderBy(desc(logs.date));
  
  const prompt = `Generate a weekly summary for these 7 days of logs.
    Include:
    - Overall patterns (energy, stress, mood trends)
    - Recurring wins
    - Recurring friction points
    - One habit to focus on next week
    - Key observations (factual, no advice unless requested)
    
    Logs: ${JSON.stringify(logs)}`;
  
  return await callOpenRouter(prompt, "You are a Life Operations Steward...");
}

// Schedule with cron or call manually
// Could use node-cron for Sunday 7:30pm trigger
```

---

### 2.3 ThinkOps Kanban Board

**Current State:** List view for promoted ideas  
**Target State:** Visual Kanban with Spec → Build → Verify → Ship columns

**Implementation:**
```typescript
// Use @hello-pangea/dnd (React DnD successor)

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const columns = ['spec', 'build', 'verify', 'ship'];

function KanbanBoard({ ideas }: { ideas: Idea[] }) {
  const { mutate: updateIdea } = useUpdateIdea();
  
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const ideaId = Number(result.draggableId);
    const newStage = result.destination.droppableId;
    
    updateIdea({ 
      id: ideaId, 
      promotedSpec: { 
        ...ideas.find(i => i.id === ideaId)?.promotedSpec,
        stage: newStage 
      }
    });
  };
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-4">
        {columns.map(column => (
          <Droppable droppableId={column} key={column}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <h3>{column.toUpperCase()}</h3>
                {ideas
                  .filter(idea => idea.promotedSpec?.stage === column)
                  .map((idea, index) => (
                    <Draggable key={idea.id} draggableId={String(idea.id)} index={index}>
                      {(provided) => (
                        <Card ref={provided.innerRef} {...provided.draggableProps}>
                          {idea.title}
                        </Card>
                      )}
                    </Draggable>
                  ))}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
```

---

### 2.4 Authentication System

**Recommended:** Replit Auth (simplest integration)

```typescript
// Search for integration
search_integrations("authentication")

// Use Replit Auth blueprint
use_integration("blueprint:javascript_log_in_with_replit", "add")
```

**Alternative:** Passport.js with local strategy (already in dependencies)

---

## Phase 3: Integration & Scale (Weeks 9-12)

### 3.1 WordPress Integration for HarrisWildlands

**Goal:** Push generated copy directly to WordPress

**Implementation:**
```typescript
// server/wordpress.ts

import { createClient } from '@wordpress/api-fetch';

async function publishToWordPress(content: HarrisContent) {
  const wpClient = createClient({
    url: process.env.WORDPRESS_URL,
    auth: {
      username: process.env.WP_USERNAME,
      password: process.env.WP_APP_PASSWORD,
    }
  });
  
  // Create/update pages
  await wpClient.pages().create({
    title: 'Home',
    content: content.generatedCopy.home,
    status: 'draft', // Review before publish
  });
}
```

---

### 3.2 Brother Collaboration Protocol

**From Requirements:** Support collaboration with trusted person

**Implementation:**
- Add `collaborators` table
- Implement "summaries only" sharing mode
- Red-zone filter for shared views
- Notification system for shared updates

```typescript
export const collaborators = pgTable("collaborators", {
  id: serial("id").primaryKey(),
  ownerUserId: text("owner_user_id").notNull(),
  collaboratorEmail: text("collaborator_email").notNull(),
  accessLevel: text("access_level").default("summaries_only"), // summaries_only | full
  lanes: text("lanes").array(), // Which lanes they can see
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

### 3.3 Mobile PWA

**Implementation:**
1. Add `manifest.json` for installability
2. Service worker for offline support
3. Push notifications for reminders

```json
// public/manifest.json
{
  "name": "BruceOps",
  "short_name": "BruceOps",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#6366f1",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## Technical Debt & Improvements

### Code Quality

| Item | Priority | Description |
|------|----------|-------------|
| Error Boundaries | High | Add React error boundaries to prevent crashes |
| Loading States | Medium | Consistent skeleton loaders across all pages |
| Input Validation | Medium | Client-side validation before API calls |
| TypeScript Strict | Low | Enable strict mode, fix all type errors |
| Test Coverage | Medium | Add Jest/Vitest tests for critical paths |

### Performance

| Item | Priority | Description |
|------|----------|-------------|
| Query Optimization | Medium | Add database indexes on frequently queried fields |
| Lazy Loading | Low | Code-split pages for faster initial load |
| Image Optimization | Low | Compress/resize any uploaded images |
| API Response Compression | Low | Enable gzip compression |

### Security

| Item | Priority | Description |
|------|----------|-------------|
| Rate Limiting | High | Prevent API abuse, especially AI endpoints |
| Input Sanitization | High | Prevent XSS in user-generated content |
| HTTPS Enforcement | High | Ensure all traffic is encrypted |
| API Key Rotation | Medium | Mechanism to rotate OpenRouter key |

---

## Implementation Details

### Database Indexes

```sql
-- Add for performance
CREATE INDEX idx_logs_date ON logs(date);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_teaching_created ON teaching_requests(created_at);
```

### Environment Variables (Full List)

```bash
# Required
DATABASE_URL=postgresql://...
OPENROUTER_API_KEY=sk-or-...

# Optional (for enhancements)
OPENAI_API_KEY=sk-...          # For Whisper transcription
WORDPRESS_URL=https://...       # WordPress integration
WP_USERNAME=...                 # WordPress auth
WP_APP_PASSWORD=...             # WordPress app password
SESSION_SECRET=...              # For authentication
```

### API Rate Limits (Recommended)

```typescript
// server/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';

export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute
  message: { error: "Too many AI requests, please slow down" }
});

// Apply to AI endpoints
app.post('/api/ideas/:id/reality-check', aiRateLimit, ...);
app.post('/api/teaching', aiRateLimit, ...);
app.post('/api/harris', aiRateLimit, ...);
```

---

## Metrics & Success Criteria

### LifeOps Success (from Master Sheet)
- Planned week done by Sunday night
- Bedtime within 30 min target 5 nights/week
- Log completion rate > 90%

### ThinkOps Success
- Ideas processed within 48 hours
- Reality check completion rate > 80%
- Promoted ideas shipped within 2 weeks

### Teaching Success
- Materials generated in < 30 seconds
- Quality checklist pass rate > 95%
- Teacher prep time reduced by 50%

### HarrisWildlands Success
- Content generated that passes human review
- Time to first draft reduced by 80%

---

*This roadmap is prioritized based on user value and technical feasibility. Adjust as needs evolve.*
