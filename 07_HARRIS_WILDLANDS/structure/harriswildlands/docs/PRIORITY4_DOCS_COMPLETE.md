# Priority 4: Complete Documentation Reference

**Generated:** December 27, 2025  
**Project:** BruceOps / HarrisWildlands

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Summary](#architecture-summary)
3. [The Four Lanes](#the-four-lanes)
4. [AI Integration](#ai-integration)
5. [Data Model](#data-model)
6. [API Reference](#api-reference)
7. [Security & Privacy](#security--privacy)
8. [Standalone Deployment](#standalone-deployment)
9. [User Flows](#user-flows)
10. [Operating Rules](#operating-rules)

---

## Project Overview

BruceOps is a modular personal operating system for a faith-centered father/teacher/creator. It consolidates four operational "lanes" into a unified web application.

### Core Philosophy
> "Faith over fear & systems over skills"

### Non-Negotiables
- LifeOps outputs must be **factual/pattern-based** — no invented context
- ThinkOps must separate **Known / Likely / Speculation** with self-deception filters
- Teaching outputs must be **standards-aligned, printable-ready, minimal prep**
- Red-zone privacy: support "summaries only" sharing; never assume raw logs should be shared

### Visual Identity
- Theme: "Botanical sci-fi terminal" (MS-DOS meets forest intelligence)
- Three modes: Field (green), Lab (teal), Sanctuary (amber)
- Glass-morphism effects with backdrop blur
- Energy line animations and circuit patterns

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│  │Dashboard │ │ LifeOps  │ │ ThinkOps │ │ Teaching │ │ Harris ││
│  │          │ │          │ │          │ │          │ │        ││
│  │ Goals    │ │ Reality  │ │ Weekly   │ │   Chat   │ │        ││
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘│
│       │            │            │            │           │      │
│       └────────────┴────────────┴────────────┴───────────┘      │
│                              │                                   │
│                    React Query + Custom Hooks                    │
│                    (client/src/hooks/use-bruce-ops.ts)          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                          HTTP/REST
                               │
┌──────────────────────────────┴──────────────────────────────────┐
│                        BACKEND (Express)                         │
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐│
│  │  server/routes  │───▶│ server/storage  │───▶│  server/db   ││
│  │   (API Layer)   │    │  (Data Access)  │    │ (PostgreSQL) ││
│  └────────┬────────┘    └─────────────────┘    └──────────────┘│
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                       AI Provider Ladder                     ││
│  │         Gemini (free) → OpenRouter (paid) → Off             ││
│  └─────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

---

## The Four Lanes

### Lane 1: LifeOps
**Purpose:** Daily logs → clarity → stable routines

**Core Features:**
- Daily log form (Yes/No toggles, 1-10 scales, bullet notes)
- AI-generated factual summaries
- Drift detection flags
- Pattern signal identification

**Key Fields Tracked:**
- Sleep hours, Energy (1-10), Stress (1-10), Mood (1-10)
- Vaping (Y/N), Exercise (Y/N)
- Family connection, Top win, Top friction
- Tomorrow's priority, Faith alignment, Money pressure
- Drift check ("What is pulling me off course?")

### Lane 2: ThinkOps
**Purpose:** Ideas Lane (capture → reality check → decide → ship)

**Workflow Stages:**
```
CAPTURE → REALITY CHECK → DECIDE → BUILD → SHIP
   ↓            ↓            ↓
 Draft    Known/Likely/   Discard
         Speculation      Park
                         Promote
```

**Reality Check Filter:**
- **Known:** Facts that can be defended now
- **Likely:** Probable assumptions (labeled)
- **Speculation:** Cool guesses (labeled)

**Self-Deception Patterns Flagged:**
- Overbuilding before validation
- Assuming distribution will happen
- Confusing cool with useful
- Perfection paralysis
- Too many lanes at once

### Lane 3: Teaching Assistant
**Purpose:** Turn standards + constraints into ready-to-teach materials

**Input Fields:**
- Grade level (5th/6th)
- Standard code + text
- Topic/phenomenon
- Time block (20/45/60/90 minutes)
- Materials available
- Student profile (ELL/SPED notes)

**Output Package:**
1. Lesson outline (I Do / We Do / You Do) with timing
2. Hands-on activity with steps + safety notes
3. Vocabulary list with student-friendly definitions
4. Common misconceptions + teacher moves
5. Differentiation: support + extension
6. Exit ticket (5 questions) + answer key
7. Prep checklist (10 minutes)

### Lane 4: HarrisWildlands
**Purpose:** Website content generation for HarrisWildlands.com

**Strategic Inputs:**
- Core Message (definition, audience, pain, promise)
- Site Map (home, start here, resources goals)
- Lead Magnet (title, problem, time-to-value, delivery)

---

## AI Integration

### Provider Ladder

AI providers are tried in order with automatic fallback:

1. **Gemini** (Google AI Studio free tier) - `GOOGLE_GEMINI_API_KEY`
2. **OpenRouter** (paid, multiple models) - `OPENROUTER_API_KEY`
3. **Off** - graceful degradation, app works without AI

### callAI Function

```typescript
async function callAI(prompt: string, lanePrompt: string = ""): Promise<string> {
  const systemPrompt = `${BRUCE_CONTEXT}\n\n${lanePrompt}`.trim();
  const provider = getActiveAIProvider();
  
  if (provider === "off") {
    return "AI features are currently disabled.";
  }
  
  // Try primary, fallback to secondary
  try {
    if (provider === "gemini") return await callGemini(prompt, systemPrompt);
    if (provider === "openrouter") return await callOpenRouterAPI(prompt, systemPrompt);
  } catch (primaryError) {
    // Fallback logic...
  }
  
  return "AI insights unavailable.";
}
```

### AI-Powered Features

| Feature | Endpoint | Purpose |
|---------|----------|---------|
| Reality Check | `POST /api/ideas/:id/reality-check` | Validate ideas with Known/Likely/Speculation |
| Weekly Insight | `POST /api/review/weekly/insight` | Generate weekly action recommendation |
| Chat | `POST /api/chat` | Conversational AI with user context |
| Log Summary | `POST /api/logs/summary` | Factual pattern summary for daily logs |
| Teaching | `POST /api/teaching` | Generate lesson plans |
| Harris Content | `POST /api/harris` | Generate website copy |

---

## Data Model

### Tables

| Table | Purpose | User-Scoped |
|-------|---------|-------------|
| `logs` | Daily LifeOps entries | Yes |
| `ideas` | ThinkOps idea pipeline | Yes |
| `goals` | Goal tracking | Yes |
| `checkins` | Daily goal check-ins | Yes |
| `teaching_requests` | Lesson plan requests | Yes |
| `harris_content` | Generated site content | Yes |
| `transcripts` | Braindump transcripts | Yes |
| `drift_flags` | Detected drift patterns | Yes |
| `settings` | Global/user settings | Mixed |
| `users` | User accounts (auth) | - |
| `sessions` | Session storage | - |

### Key Schema Types

```typescript
// Ideas with Reality Check
export const ideas = pgTable("ideas", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  pitch: text("pitch"),
  whoItHelps: text("who_it_helps"),
  painItSolves: text("pain_it_solves"),
  whyICare: text("why_i_care"),
  tinyTest: text("tiny_test"),
  excitement: integer("excitement"),
  feasibility: integer("feasibility"),
  timeEstimate: text("time_estimate"),
  status: text("status").default("draft"),
  realityCheck: jsonb("reality_check"),
  promotedSpec: jsonb("promoted_spec"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reality Check JSONB Structure
interface RealityCheck {
  known: string[];
  likely: string[];
  speculation: string[];
  flags: string[];
  decision: "Discard" | "Park" | "Salvage" | "Promote";
  reasoning: string;
}
```

---

## API Reference

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (no auth) |
| GET | `/api/me` | Current user info |
| GET | `/api/dashboard` | Dashboard stats |

### LifeOps

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/logs` | List all logs |
| GET | `/api/logs/:date` | Get log by date |
| POST | `/api/logs` | Create log |
| PUT | `/api/logs/:id` | Update log |
| POST | `/api/logs/summary` | Generate AI summary |

### ThinkOps

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ideas` | List all ideas |
| POST | `/api/ideas` | Create idea |
| PUT | `/api/ideas/:id` | Update idea |
| POST | `/api/ideas/:id/reality-check` | Run AI reality check |

### Goals & Checkins

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals` | List goals |
| POST | `/api/goals` | Create goal |
| PUT | `/api/goals/:id` | Update goal |
| GET | `/api/checkins` | List check-ins |
| POST | `/api/checkins` | Upsert check-in |
| POST | `/api/checkins/batch` | Batch upsert |

### Weekly Review

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/review/weekly` | Get weekly stats |
| GET | `/api/review/weekly/export` | Export as text |
| POST | `/api/review/weekly/insight` | Generate AI insight |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message to AI |

---

## Security & Privacy

### Red-Zone Privacy Rules
- Support "summaries only" sharing
- Never assume raw logs should be shared
- Never log/share items on the red-zone privacy list

### Data Handling
- All data stored in PostgreSQL (Neon-backed)
- Environment variables for sensitive keys
- No client-side storage of sensitive data
- AI outputs are "source locked" to provided inputs

### Source Lock Policy
Every generated output includes implicit guarantee:
> "Based only on provided inputs. No invented facts."

---

## Standalone Deployment

### Quick Start (Docker)

```bash
git clone https://github.com/buckjoewild/harriswildlands.com.git
cd harriswildlands.com
docker-compose up --build
open http://localhost:5000
```

### What Works in Standalone Mode

| Feature | Status |
|---------|--------|
| LifeOps Daily Logs | Full |
| Goals & Check-ins | Full |
| Weekly Review | Full |
| Data Export | Full |
| ThinkOps Ideas | Partial (AI optional) |
| Teaching Assistant | Requires AI |
| HarrisWildlands Copy | Requires AI |

### Enable AI (Optional)

```bash
# Create .env file
AI_PROVIDER=gemini
GOOGLE_GEMINI_API_KEY=your-key-here

# Or use OpenRouter
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-your-key
```

---

## User Flows

### Daily Calibration (LifeOps)
1. Open LifeOps page
2. Adjust sliders for Energy/Stress/Mood/Money
3. Toggle Yes/No for Vaping/Exercise
4. Fill in bullet notes (Win, Friction, Priority)
5. Click "Save Log"
6. [Optional] Request AI summary

### Idea Processing (ThinkOps)
1. Capture new idea via form
2. Idea added to "Inbox" (status: draft)
3. Click "Run Reality Check"
4. AI returns Known/Likely/Speculation
5. AI flags self-deception patterns
6. AI suggests decision bin
7. Review and decide: Promote/Park/Discard

### Weekly Review Flow
1. Open Weekly Review page
2. View completion stats and charts
3. Review domain breakdown
4. Click "Generate Insight" for AI recommendation
5. Check drift flags
6. [Optional] Export review

---

## Operating Rules

### Advice Mode Default
- **Patterns only** — no advice unless explicitly asked
- AI summaries are observational, not prescriptive

### Stop-and-Reset Rule
When stress reaches critical levels:
1. Pause current task
2. 2-minute reset
3. Reframe before continuing

### Escalation Triggers
When to step away and seek support:
- High stress patterns detected
- Multiple drift flags
- Repeated friction in same area

---

## File Structure

```
├── client/
│   ├── src/
│   │   ├── App.tsx                 # Main app with routing
│   │   ├── components/
│   │   │   ├── Layout.tsx          # Sidebar + main layout
│   │   │   ├── ThemeProvider.tsx   # Theme context
│   │   │   └── ui/                 # Shadcn components
│   │   ├── hooks/
│   │   │   ├── use-auth.ts         # Authentication hook
│   │   │   ├── use-bruce-ops.ts    # API hooks for all lanes
│   │   │   └── use-demo.ts         # Demo mode data
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── LifeOps.tsx
│   │   │   ├── Goals.tsx
│   │   │   ├── ThinkOps.tsx
│   │   │   ├── RealityCheck.tsx    # New AI feature
│   │   │   ├── WeeklyReview.tsx    # New AI feature
│   │   │   ├── Chat.tsx            # New AI feature
│   │   │   ├── TeachingAssistant.tsx
│   │   │   ├── HarrisWildlands.tsx
│   │   │   └── Settings.tsx
│   │   └── lib/
│   │       └── queryClient.ts      # TanStack Query setup
│   └── index.html
├── server/
│   ├── index.ts                    # Express server entry
│   ├── routes.ts                   # All API route handlers
│   ├── storage.ts                  # Database access layer
│   ├── db.ts                       # PostgreSQL connection
│   ├── google-drive.ts             # Drive API client
│   └── replit_integrations/
│       └── auth/                   # Replit OIDC auth
├── shared/
│   ├── schema.ts                   # Drizzle tables + Zod
│   └── routes.ts                   # API contract definitions
├── docs/
│   ├── ARCHITECTURE.md
│   ├── STANDALONE.md
│   ├── PRIORITY1_CORE_ARCHITECTURE.md
│   ├── PRIORITY2_FRONTEND.md
│   ├── PRIORITY3_CONFIG_DEPLOY.md
│   └── PRIORITY4_DOCS_COMPLETE.md
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## Contact & Support

- **Production URL:** https://harriswildlands.com
- **GitHub:** https://github.com/buckjoewild/harriswildlands.com
- **Hosting:** Replit Autoscale (with Docker portability)
- **Last Updated:** December 27, 2025
