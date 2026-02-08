# VOLUME 5: DATABASE SCHEMA COMPLETE REFERENCE

**HarrisWildlands.com Technical Project Manual**  
**Version:** 1.0.0  
**Generated:** December 28, 2025

---

## 5.1 Schema Overview

| Aspect | Detail |
|--------|--------|
| **Database** | PostgreSQL 16 |
| **ORM** | Drizzle ORM 0.39.3 |
| **Schema Location** | `shared/schema.ts` |
| **Sync Strategy** | `drizzle-kit push` (schema-first) |
| **User Isolation** | All entities scoped by userId |

---

## 5.2 Table: logs (Lane 1: LifeOps)

**Purpose:** Captures daily life metrics for pattern detection

### Schema Definition

```typescript
export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  
  // VICES (Yes/No toggles)
  vaping: boolean("vaping").default(false),
  alcohol: boolean("alcohol").default(false),
  junkFood: boolean("junk_food").default(false),
  doomScrolling: boolean("doom_scrolling").default(false),
  lateScreens: boolean("late_screens").default(false),
  skippedMeals: boolean("skipped_meals").default(false),
  excessCaffeine: boolean("excess_caffeine").default(false),
  exercise: boolean("exercise").default(false),
  
  // LIFE METRICS (1-10 scales)
  energy: integer("energy"),
  stress: integer("stress"),
  mood: integer("mood"),
  focus: integer("focus"),
  sleepQuality: integer("sleep_quality"),
  sleepHours: integer("sleep_hours"),
  moneyPressure: integer("money_pressure"),
  connection: integer("connection"),
  
  // QUICK CONTEXT (selects)
  dayType: text("day_type"),
  primaryEmotion: text("primary_emotion"),
  winCategory: text("win_category"),
  timeDrain: text("time_drain"),
  
  // REFLECTION PROMPTS
  topWin: text("top_win"),
  topFriction: text("top_friction"),
  tomorrowPriority: text("tomorrow_priority"),
  
  // OPTIONAL DEEP DIVES
  familyConnection: text("family_connection"),
  faithAlignment: text("faith_alignment"),
  driftCheck: text("drift_check"),
  
  // SYSTEM
  rawTranscript: text("raw_transcript"),
  aiSummary: text("ai_summary"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Field Reference

#### Vice Tracking (Boolean)

| Field | Column | Purpose | Default |
|-------|--------|---------|---------|
| vaping | vaping | Nicotine use | false |
| alcohol | alcohol | Alcohol consumption | false |
| junkFood | junk_food | Unhealthy eating | false |
| doomScrolling | doom_scrolling | Mindless scrolling | false |
| lateScreens | late_screens | Late night screen time | false |
| skippedMeals | skipped_meals | Missed meals | false |
| excessCaffeine | excess_caffeine | Too much caffeine | false |
| exercise | exercise | Physical activity | false |

#### Life Metrics (1-10 Scale)

| Field | Column | Scale Description |
|-------|--------|-------------------|
| energy | energy | 1=crashed, 10=unstoppable |
| stress | stress | 1=zen, 10=maxed out |
| mood | mood | 1=dark, 10=grateful |
| focus | focus | 1=scattered, 10=locked in |
| sleepQuality | sleep_quality | 1=terrible, 10=restorative |
| sleepHours | sleep_hours | Hours slept (integer) |
| moneyPressure | money_pressure | 1=stable, 10=crushing |
| connection | connection | 1=isolated, 10=deeply connected |

#### Quick Context (Enums)

| Field | Options |
|-------|---------|
| dayType | work, rest, family, mixed, chaos |
| primaryEmotion | grateful, anxious, hopeful, frustrated, peaceful, overwhelmed |
| winCategory | family, work, health, faith, creative, none |
| timeDrain | meetings, distractions, emergencies, low-energy, interruptions, none |

---

## 5.3 Table: ideas (Lane 2: ThinkOps)

**Purpose:** Manages idea lifecycle from capture through reality-checking

### Schema Definition

```typescript
export const ideas = pgTable("ideas", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  
  // BASIC CAPTURE
  title: text("title").notNull(),
  pitch: text("pitch"),
  category: text("category"),
  captureMode: text("capture_mode").default("quick"),
  
  // DEEP CAPTURE FIELDS
  whoItHelps: text("who_it_helps"),
  painItSolves: text("pain_it_solves"),
  whyICare: text("why_i_care"),
  tinyTest: text("tiny_test"),
  resourcesNeeded: text("resources_needed"),
  timeEstimate: text("time_estimate"),
  excitement: integer("excitement"),
  feasibility: integer("feasibility"),
  
  // PIPELINE STATUS
  status: text("status").default("draft"),
  priority: integer("priority").default(0),
  
  // AI ANALYSIS
  realityCheck: jsonb("reality_check"),
  promotedSpec: jsonb("promoted_spec"),
  
  // PROGRESS TRACKING
  milestones: jsonb("milestones"),
  nextAction: text("next_action"),
  
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Status Workflow

```
draft → parked → promoted → shipped/discarded
```

| Status | Description |
|--------|-------------|
| draft | Initial capture, not yet validated |
| parked | Validated but not prioritized |
| promoted | Active development |
| shipped | Completed and launched |
| discarded | Abandoned |

### Reality Check JSONB Structure

```json
{
  "known": ["verified fact 1", "verified fact 2"],
  "likely": ["reasonable assumption 1"],
  "speculation": ["hope or guess 1"],
  "flags": ["Overbuilding", "Perfectionism", "Time Optimism"],
  "decision": "Promote",
  "reasoning": "Why this decision was made"
}
```

### Self-Deception Flags

| Flag | Description |
|------|-------------|
| Overbuilding | Building more than needed |
| Perfectionism | Delaying for perfect solution |
| Solution-in-Search-of-Problem | No real user need |
| Time Optimism | Underestimating effort |
| Feature Creep | Scope expansion |

---

## 5.4 Table: goals

**Purpose:** Tracks goals organized by life domain

### Schema Definition

```typescript
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  domain: text("domain").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetType: text("target_type").default("binary"),
  weeklyMinimum: integer("weekly_minimum").default(1),
  startDate: text("start_date"),
  dueDate: text("due_date"),
  status: text("status").default("active"),
  priority: integer("priority").default(2),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Domains (8 total)

| Domain | Examples |
|--------|----------|
| faith | Prayer, scripture reading |
| family | Quality time, date nights |
| work | Projects, meetings |
| health | Exercise, nutrition |
| logistics | Errands, admin tasks |
| property | Home maintenance |
| ideas | Side projects, learning |
| discipline | Habits, routines |

### Target Types

| Type | Description | Example |
|------|-------------|---------|
| binary | Done or not done | "Did I exercise?" |
| count | Numeric count | "3 workouts/week" |
| duration | Time-based | "30 min reading" |

---

## 5.5 Table: checkins

**Purpose:** Daily goal completion tracking for weekly reviews

### Schema Definition

```typescript
export const checkins = pgTable("checkins", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  done: boolean("done").default(false),
  score: integer("score"), // 1-10 optional
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Upsert Pattern

The system uses upsert logic for check-ins:

```typescript
// Check for existing record
const existing = await db.select().from(checkins)
  .where(and(
    eq(checkins.userId, userId),
    eq(checkins.goalId, goalId),
    eq(checkins.date, date)
  ));

// Update or create
if (existing.length > 0) {
  await db.update(checkins).set({ done, score, note })...
} else {
  await db.insert(checkins).values({ goalId, userId, date, done, score, note })...
}
```

---

## 5.6 Table: teachingRequests (Lane 3)

**Purpose:** Stores lesson plan generation requests

### Schema Definition

```typescript
export const teachingRequests = pgTable("teaching_requests", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  grade: text("grade"),
  standard: text("standard"),
  topic: text("topic"),
  timeBlock: text("time_block"),
  materials: text("materials"),
  studentProfile: text("student_profile"),
  constraints: text("constraints"),
  assessmentType: text("assessment_type"),
  format: text("format"),
  output: jsonb("output"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Output JSONB Structure

```json
{
  "lessonOutline": "...",
  "handsOnActivity": "...",
  "exitTicket": "...",
  "answerKey": "...",
  "differentiation": "...",
  "prepList": ["item1", "item2"]
}
```

---

## 5.7 Table: harrisContent (Lane 4)

**Purpose:** Stores brand content generation results

### Schema Definition

```typescript
export const harrisContent = pgTable("harris_content", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  
  contentType: text("content_type").default("website"),
  tone: text("tone").default("inspirational"),
  template: text("template"),
  
  coreMessage: jsonb("core_message"),
  siteMap: jsonb("site_map"),
  leadMagnet: jsonb("lead_magnet"),
  
  generatedCopy: jsonb("generated_copy"),
  
  title: text("title"),
  status: text("status").default("draft"),
  
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Content Types

| Type | Description |
|------|-------------|
| website | Landing page copy |
| social | Social media posts |
| email | Newsletter content |
| blog | Blog articles |
| video | Video scripts |

### Tones

| Tone | Description |
|------|-------------|
| inspirational | Motivating, uplifting |
| educational | Informative, teaching |
| personal | Authentic, vulnerable |
| professional | Business-focused |

---

## 5.8 Table: userSettings

**Purpose:** Per-user preferences and configuration

### Schema Definition

```typescript
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  
  aiModel: text("ai_model").default("openai/gpt-4o-mini"),
  aiTone: text("ai_tone").default("balanced"),
  
  theme: text("theme").default("lab"),
  
  dailyReminder: boolean("daily_reminder").default(true),
  reminderTime: text("reminder_time").default("07:00"),
  
  protocols: jsonb("protocols"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### Themes

| Theme | Description |
|-------|-------------|
| field | Outdoor, natural |
| lab | Technical, clean |
| sanctuary | Calm, peaceful |

### AI Tones

| Tone | Description |
|------|-------------|
| gentle | Supportive, encouraging |
| balanced | Neutral, factual |
| direct | Blunt, no-nonsense |

---

## 5.9 Table: driftFlags

**Purpose:** Pattern detection and drift signals

### Schema Definition

```typescript
export const driftFlags = pgTable("drift_flags", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  timeframeStart: text("timeframe_start").notNull(),
  timeframeEnd: text("timeframe_end").notNull(),
  sentence: text("sentence").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Flag Types

| Type | Description |
|------|-------------|
| checkin_dropoff | Missed check-in streak |
| consistency_drift | Pattern breaking |
| overload | Too many active goals |
| domain_neglect | Ignored life domain |

---

## 5.10 Table: transcripts

**Purpose:** Voice braindump transcripts with AI analysis

### Schema Definition

```typescript
export const transcripts = pgTable("transcripts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  
  title: text("title").notNull(),
  fileName: text("file_name"),
  content: text("content").notNull(),
  wordCount: integer("word_count").default(0),
  
  sessionDate: text("session_date"),
  participants: text("participants"),
  
  patterns: jsonb("patterns"),
  topThemes: jsonb("top_themes"),
  scorecard: jsonb("scorecard"),
  
  analyzed: boolean("analyzed").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Pattern Categories

| Category | Description |
|----------|-------------|
| topics | Main subjects discussed |
| actions | Action items identified |
| questions | Open questions raised |
| energy | Energy/emotion detected |
| connections | Ideas linked together |

---

## 5.11 Schema Relationships

```
┌─────────────┐       ┌─────────────┐
│    users    │───────│   session   │
└─────────────┘       └─────────────┘
       │
       │ userId (1:many)
       │
       ├─────────────────────────────────────────┐
       │                │               │        │
       ▼                ▼               ▼        ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│    logs     │  │    ideas    │  │    goals    │  │ transcripts │
└─────────────┘  └─────────────┘  └──────┬──────┘  └─────────────┘
                                         │
                                         │ goalId (1:many)
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │  checkins   │
                                  └─────────────┘
```

---

## 5.12 Insert Schemas

```typescript
export const insertLogSchema = createInsertSchema(logs)
  .omit({ id: true, userId: true, createdAt: true, aiSummary: true });

export const insertIdeaSchema = createInsertSchema(ideas)
  .omit({ id: true, userId: true, createdAt: true, realityCheck: true, promotedSpec: true, milestones: true });

export const insertGoalSchema = createInsertSchema(goals)
  .omit({ id: true, userId: true, createdAt: true });

export const insertCheckinSchema = createInsertSchema(checkins)
  .omit({ id: true, userId: true, createdAt: true });

export const insertTeachingRequestSchema = createInsertSchema(teachingRequests)
  .omit({ id: true, userId: true, createdAt: true, output: true });

export const insertHarrisContentSchema = createInsertSchema(harrisContent)
  .omit({ id: true, userId: true, createdAt: true, generatedCopy: true });
```

---

**Next Volume:** [VOL06 - API Endpoint Catalog](./VOL06_API_CATALOG.md)
