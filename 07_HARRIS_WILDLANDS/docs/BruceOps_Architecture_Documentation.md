\# BruceOps Architecture Documentation

\*\*Version:\*\* 1.0.0    
\*\*Last Updated:\*\* December 2025    
\*\*Status:\*\* MVP Complete (Drift Detection pending implementation)

\---

\#\# Table of Contents

1\. \[System Overview\](\#system-overview)  
2\. \[The Four Lanes\](\#the-four-lanes)  
3\. \[Architecture Diagram\](\#architecture-diagram)  
4\. \[Technology Stack\](\#technology-stack)  
5\. \[Data Model\](\#data-model)  
6\. \[API Reference\](\#api-reference)  
7\. \[AI Integration\](\#ai-integration)  
8\. \[User Flows\](\#user-flows)  
9\. \[Security & Privacy\](\#security--privacy)  
10\. \[Operating Rules\](\#operating-rules)

\---

\#\# System Overview

BruceOps is a modular personal operating system that consolidates four distinct operational "lanes" into a unified application:

| Lane | Purpose | Core Function |  
|------|---------|---------------|  
| \*\*LifeOps\*\* | Daily calibration | Track metrics, identify patterns, detect drift |  
| \*\*ThinkOps\*\* | Idea management | Capture → Reality Check → Build → Ship |  
| \*\*Teaching Assistant\*\* | Classroom automation | Standards-aligned lesson generation |  
| \*\*HarrisWildlands\*\* | Brand content | Website copy generation |

\#\#\# Mission Statement  
Turn the 4 lanes into a single modular app with strict guardrails and simple UX.

\#\#\# Non-Negotiables (from Requirements)  
\- LifeOps outputs must be \*\*factual/pattern-based\*\* — no invented context  
\- ThinkOps must separate \*\*Known / Likely / Speculation\*\* with self-deception filters  
\- Teaching outputs must be \*\*standards-aligned, printable-ready, minimal prep\*\*  
\- Red-zone privacy: support "summaries only" sharing; never assume raw logs should be shared

\---

\#\# The Four Lanes

\#\#\# Lane 1: LifeOps  
\*\*Purpose:\*\* Daily logs → clarity → stable routines

\*\*Core Features:\*\*  
\- Daily log form (Yes/No toggles, 1-10 scales, bullet notes)  
\- AI-generated factual summaries  
\- Drift detection flags  
\- Pattern signal identification

\*\*Key Fields Tracked:\*\*  
\- Sleep hours, Energy (1-10), Stress (1-10), Mood (1-10)  
\- Vaping (Y/N), Exercise (Y/N)  
\- Family connection, Top win, Top friction  
\- Tomorrow's priority, Faith alignment, Money pressure  
\- Drift check ("What is pulling me off course?")

\*\*Output Philosophy:\*\*  
\> "Patterns only, no advice unless asked"

\---

\#\#\# Lane 2: ThinkOps  
\*\*Purpose:\*\* Ideas Lane (capture → reality check → decide → ship)

\*\*Workflow Stages:\*\*  
\`\`\`  
CAPTURE → REALITY CHECK → DECIDE → BUILD → SHIP  
   ↓            ↓            ↓  
 Draft    Known/Likely/   Discard  
         Speculation      Park  
                         Promote  
\`\`\`

\*\*Reality Check Filter:\*\*  
The anti-delusion gate. Separates:  
\- \*\*Known:\*\* Facts that can be defended now  
\- \*\*Likely:\*\* Probable assumptions (labeled)  
\- \*\*Speculation:\*\* Cool guesses (labeled)

\*\*Self-Deception Patterns Flagged:\*\*  
\- Overbuilding before validation  
\- Assuming distribution will happen  
\- Confusing cool with useful  
\- Perfection paralysis  
\- Too many lanes at once  
\- Avoiding hard conversations/selling

\*\*Decision Bins:\*\*  
| Bin | Action |  
|-----|--------|  
| Discard | Delete permanently |  
| Park | Store for future review |  
| Salvage | Extract useful parts |  
| Promote | Create deliverable (task/doc/prototype) |

\---

\#\#\# Lane 3: Bruce Teaching Assistant  
\*\*Purpose:\*\* Turn standards \+ constraints into ready-to-teach materials

\*\*Input Form Fields:\*\*  
\- Grade level (5th/6th)  
\- Standard code \+ text  
\- Topic/phenomenon  
\- Time block (20/45/60/90 minutes)  
\- Materials available  
\- Student profile (ELL/SPED notes)  
\- Teaching constraints  
\- Assessment type  
\- Format preference

\*\*Output Package:\*\*  
1\. Lesson outline (I Do / We Do / You Do) with timing  
2\. Hands-on activity with steps \+ safety notes  
3\. Vocabulary list with student-friendly definitions  
4\. Common misconceptions \+ teacher moves  
5\. Differentiation: support \+ extension  
6\. Exit ticket (5 questions) \+ answer key  
7\. Prep checklist (10 minutes)

\*\*Quality Checklist (Pass/Fail):\*\*  
\- \[ \] Aligned explicitly to the listed standard(s)  
\- \[ \] Doable with listed materials (no hidden supplies)  
\- \[ \] Includes timing breakdown  
\- \[ \] Includes differentiation  
\- \[ \] Uses clear, student-friendly language  
\- \[ \] Assessment matches the objective

\---

\#\#\# Lane 4: HarrisWildlands  
\*\*Purpose:\*\* Website content generation for HarrisWildlands.com

\*\*Strategic Inputs:\*\*  
1\. \*\*Core Message\*\*  
   \- One-sentence definition  
   \- Primary audience  
   \- Primary pain  
   \- Primary promise (7-30 days)

2\. \*\*Site Map\*\* (3 pages minimum)  
   \- Home page goal  
   \- Start Here page goal  
   \- Resources/Store goal  
   \- Primary CTA

3\. \*\*Lead Magnet\*\*  
   \- Title  
   \- Problem it solves  
   \- Time-to-value  
   \- Delivery method

\*\*Output:\*\*  
\- Home page copy  
\- Start Here copy  
\- Resources/Store copy

\---

\#\# Architecture Diagram

\`\`\`  
┌─────────────────────────────────────────────────────────────────┐  
│                        FRONTEND (React)                          │  
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│  
│  │Dashboard │ │ LifeOps  │ │ ThinkOps │ │ Teaching │ │ Harris ││  
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘│  
│       │            │            │            │           │      │  
│       └────────────┴────────────┴────────────┴───────────┘      │  
│                              │                                   │  
│                    React Query \+ Custom Hooks                    │  
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
│  │                    OpenRouter API                            ││  
│  │         (AI Generation: Summaries, Reality Checks, etc.)    ││  
│  └─────────────────────────────────────────────────────────────┘│  
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐  
│                         SHARED LAYER                             │  
│                                                                  │  
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │  
│  │  shared/schema.ts   │    │      shared/routes.ts           │ │  
│  │  (Drizzle Tables)   │    │      (API Contract \+ Zod)       │ │  
│  └─────────────────────┘    └─────────────────────────────────┘ │  
└──────────────────────────────────────────────────────────────────┘  
\`\`\`

\---

\#\# Technology Stack

\#\#\# Frontend  
| Technology | Purpose |  
|------------|---------|  
| React 18 | UI Framework |  
| Wouter | Client-side routing |  
| TanStack Query v5 | Server state management |  
| React Hook Form | Form handling |  
| Zod | Schema validation |  
| Tailwind CSS | Styling |  
| Shadcn/ui | Component library |  
| Framer Motion | Animations |  
| Lucide React | Icons |  
| date-fns | Date formatting |

\#\#\# Backend  
| Technology | Purpose |  
|------------|---------|  
| Node.js | Runtime |  
| Express | HTTP server |  
| Drizzle ORM | Database ORM |  
| PostgreSQL (Neon) | Database |  
| Zod | Request validation |

\#\#\# AI Integration  
| Service | Purpose |  
|---------|---------|  
| OpenRouter API | LLM gateway |  
| Default Model | \`openai/gpt-4o-mini\` |

\#\#\# Development  
| Tool | Purpose |  
|------|---------|  
| Vite | Build tool \+ dev server |  
| TypeScript | Type safety |  
| ESBuild | Fast compilation |

\---

\#\# Data Model

\#\#\# Tables Overview

\`\`\`  
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐  
│      logs        │     │      ideas       │     │ teaching\_requests│  
├──────────────────┤     ├──────────────────┤     ├──────────────────┤  
│ id (PK)          │     │ id (PK)          │     │ id (PK)          │  
│ date             │     │ title            │     │ grade            │  
│ sleepHours       │     │ pitch            │     │ standard         │  
│ energy           │     │ whoItHelps       │     │ topic            │  
│ stress           │     │ painItSolves     │     │ timeBlock        │  
│ mood             │     │ whyICare         │     │ materials        │  
│ vaping           │     │ tinyTest         │     │ studentProfile   │  
│ exercise         │     │ status           │     │ constraints      │  
│ familyConnection │     │ realityCheck     │     │ assessmentType   │  
│ topWin           │     │ promotedSpec     │     │ format           │  
│ topFriction      │     │ createdAt        │     │ output (JSONB)   │  
│ tomorrowPriority │     └──────────────────┘     │ createdAt        │  
│ faithAlignment   │                              └──────────────────┘  
│ moneyPressure    │       
│ driftCheck       │     ┌──────────────────┐     ┌──────────────────┐  
│ rawTranscript    │     │  harris\_content  │     │     settings     │  
│ aiSummary        │     ├──────────────────┤     ├──────────────────┤  
│ createdAt        │     │ id (PK)          │     │ id (PK)          │  
└──────────────────┘     │ coreMessage      │     │ key (UNIQUE)     │  
                         │ siteMap          │     │ value            │  
                         │ leadMagnet       │     └──────────────────┘  
                         │ generatedCopy    │  
                         │ createdAt        │  
                         └──────────────────┘  
\`\`\`

\#\#\# Field Details

\#\#\#\# \`logs\` Table (LifeOps)  
| Field | Type | Description |  
|-------|------|-------------|  
| id | serial | Primary key |  
| date | text | Format: YYYY-MM-DD |  
| sleepHours | integer | Hours of sleep |  
| energy | integer | Scale 1-10 |  
| stress | integer | Scale 1-10 |  
| mood | integer | Scale 1-10 |  
| vaping | boolean | Did vape today? |  
| exercise | boolean | Did exercise today? |  
| familyConnection | text | Notes about family time |  
| topWin | text | Best thing that happened |  
| topFriction | text | Biggest challenge |  
| tomorrowPriority | text | \#1 priority for tomorrow |  
| faithAlignment | text | Spiritual notes |  
| moneyPressure | integer | Scale 1-10 |  
| driftCheck | text | What's pulling off course |  
| rawTranscript | text | Voice transcript (future) |  
| aiSummary | text | AI-generated summary |  
| createdAt | timestamp | Auto-generated |

\#\#\#\# \`ideas\` Table (ThinkOps)  
| Field | Type | Description |  
|-------|------|-------------|  
| id | serial | Primary key |  
| title | text | Idea name (required) |  
| pitch | text | One-sentence description |  
| whoItHelps | text | Target audience |  
| painItSolves | text | Problem addressed |  
| whyICare | text | Personal motivation |  
| tinyTest | text | Validation test (≤7 days) |  
| status | text | draft/parked/promoted/discarded |  
| realityCheck | jsonb | AI analysis results |  
| promotedSpec | jsonb | Build specs for promoted ideas |  
| createdAt | timestamp | Auto-generated |

\#\#\#\# \`realityCheck\` JSONB Structure  
\`\`\`json  
{  
  "known": \["Fact 1", "Fact 2"\],  
  "likely": \["Assumption 1"\],  
  "speculation": \["Guess 1"\],  
  "flags": \["Self-deception pattern 1"\],  
  "decision": "Promote" | "Park" | "Discard" | "Salvage"  
}  
\`\`\`

\---

\#\# API Reference

\#\#\# Base URL  
All API endpoints are prefixed with \`/api\`

\#\#\# Dashboard  
| Method | Endpoint | Description |  
|--------|----------|-------------|  
| GET | \`/api/dashboard\` | Get today's status |

\*\*Response:\*\*  
\`\`\`json  
{  
  "logsToday": 1,  
  "openLoops": 3,  
  "driftFlags": \["Sleep consistency \< 70%"\]  
}  
\`\`\`

\> \*\*Note:\*\* Drift flags are currently mocked with static values. See \`docs/ENHANCEMENTS.md\` for the real drift detection algorithm implementation plan.

\---

\#\#\# LifeOps (Logs)  
| Method | Endpoint | Description |  
|--------|----------|-------------|  
| GET | \`/api/logs\` | List all logs |  
| POST | \`/api/logs\` | Create new log |  
| POST | \`/api/logs/summary\` | Generate AI summary |

\*\*Create Log Request:\*\*  
\`\`\`json  
{  
  "date": "2025-12-25",  
  "sleepHours": 7,  
  "energy": 8,  
  "stress": 4,  
  "mood": 8,  
  "vaping": false,  
  "exercise": true,  
  "familyConnection": "Played games with kids",  
  "topWin": "Shipped the feature",  
  "topFriction": "Too many meetings",  
  "tomorrowPriority": "Finish documentation",  
  "faithAlignment": "Morning prayer",  
  "moneyPressure": 3,  
  "driftCheck": "None"  
}  
\`\`\`

\---

\#\#\# ThinkOps (Ideas)  
| Method | Endpoint | Description |  
|--------|----------|-------------|  
| GET | \`/api/ideas\` | List all ideas |  
| POST | \`/api/ideas\` | Create new idea |  
| PUT | \`/api/ideas/:id\` | Update idea |  
| POST | \`/api/ideas/:id/reality-check\` | Run AI reality check |

\*\*Create Idea Request:\*\*  
\`\`\`json  
{  
  "title": "Family Dashboard",  
  "pitch": "A command center for family logistics",  
  "whoItHelps": "Parents with 2+ kids",  
  "painItSolves": "Mental load of scheduling",  
  "whyICare": "I live this pain daily",  
  "tinyTest": "Paper prototype for 3 days"  
}  
\`\`\`

\---

\#\#\# Teaching Assistant  
| Method | Endpoint | Description |  
|--------|----------|-------------|  
| GET | \`/api/teaching\` | List all requests |  
| POST | \`/api/teaching\` | Create new request |

\*\*Create Teaching Request:\*\*  
\`\`\`json  
{  
  "grade": "5th",  
  "standard": "NGSS 5-LS1-1",  
  "topic": "Photosynthesis",  
  "timeBlock": "45 minutes",  
  "materials": "Beans, water, bags",  
  "studentProfile": "Mixed ability, 3 ELL",  
  "constraints": "Low prep, hands-on",  
  "assessmentType": "Exit ticket",  
  "format": "Printable"  
}  
\`\`\`

\---

\#\#\# HarrisWildlands  
| Method | Endpoint | Description |  
|--------|----------|-------------|  
| POST | \`/api/harris\` | Generate site copy |

\*\*Create Content Request:\*\*  
\`\`\`json  
{  
  "coreMessage": {  
    "definition": "Resource hub for teachers/parents",  
    "audience": "Parents and teachers",  
    "pain": "Chaos and lack of time",  
    "promise": "Clarity in 7 days"  
  },  
  "siteMap": {  
    "homeGoal": "Understand value in 10 seconds",  
    "startHereGoal": "Learn the system",  
    "resourcesGoal": "Download/buy/signup",  
    "cta": "Join free"  
  },  
  "leadMagnet": {  
    "title": "The 5-Minute Family Reset",  
    "problem": "Morning chaos",  
    "timeToValue": "15 minutes",  
    "delivery": "PDF download"  
  }  
}  
\`\`\`

\---

\#\#\# Settings  
| Method | Endpoint | Description |  
|--------|----------|-------------|  
| GET | \`/api/settings\` | List all settings |  
| PUT | \`/api/settings/:key\` | Update setting |

\---

\#\# AI Integration

\#\#\# OpenRouter Configuration  
\- \*\*API Endpoint:\*\* \`https://openrouter.ai/api/v1/chat/completions\`  
\- \*\*Default Model:\*\* \`openai/gpt-4o-mini\` (cost-effective)  
\- \*\*Authentication:\*\* Bearer token via \`OPENROUTER\_API\_KEY\`

\#\#\# AI-Powered Features

\#\#\#\# 1\. LifeOps Summary Generation  
\`\`\`  
System Prompt: "You are a Life Operations Steward.   
Output factual/pattern-based summaries only."

User Prompt: "Generate a factual summary for this daily log.   
Avoid advice. Identify pattern signals.  
Log Data: {log\_json}"  
\`\`\`

\#\#\#\# 2\. ThinkOps Reality Check  
\`\`\`  
System Prompt: "You are a ruthless but helpful product manager.   
JSON output only."

User Prompt: "Perform a Reality Check on this idea.  
Separate into Known, Likely, Speculation.  
Flag self-deception patterns.  
Suggest a decision bin (Discard/Park/Salvage/Promote).  
Return JSON: { known: \[\], likely: \[\], speculation: \[\], flags: \[\], decision: '' }"  
\`\`\`

\#\#\#\# 3\. Teaching Assistant Generation  
\`\`\`  
System Prompt: "You are a strict standards-aligned teaching assistant.   
JSON output only."

User Prompt: "You are Bruce, a 5th-6th grade teaching assistant.  
Build: (1) lesson outline, (2) hands-on activity,   
(3) exit ticket \+ key, (4) differentiation, (5) 10-min prep list."  
\`\`\`

\#\#\#\# 4\. HarrisWildlands Copy Generation  
\`\`\`  
System Prompt: "You are a copywriter for a dad/teacher audience.   
No hype. JSON output only."

User Prompt: "Write conversion-focused website copy for HarrisWildlands.com.  
Output JSON with keys: home, startHere, resources.   
Keep it simple and honest."  
\`\`\`

\#\#\# Token Optimization Strategies  
1\. Use \`gpt-4o-mini\` for cost efficiency  
2\. Request structured JSON output (smaller responses)  
3\. Cache AI outputs in database  
4\. Only re-run when inputs change

\---

\#\# User Flows

\#\#\# Flow 1: Daily Calibration (LifeOps)  
\`\`\`  
1\. User opens LifeOps page  
2\. Adjusts sliders for Energy/Stress/Mood/Money  
3\. Toggles Yes/No for Vaping/Exercise  
4\. Fills in bullet notes (Win, Friction, Priority)  
5\. Clicks "Save Log"  
6\. System stores log with timestamp  
7\. \[Optional\] User requests AI summary  
8\. AI generates factual pattern summary  
9\. Summary stored and displayed  
\`\`\`

\#\#\# Flow 2: Idea Processing (ThinkOps)  
\`\`\`  
1\. User captures new idea via form  
2\. Idea added to "Inbox" (status: draft)  
3\. User clicks "Run Reality Check"  
4\. AI analyzes and returns Known/Likely/Speculation  
5\. AI flags self-deception patterns  
6\. AI suggests decision bin  
7\. User reviews and decides: Promote/Park/Discard  
8\. If Promoted → moves to "Build & Ship" stage  
9\. User fills in Spec/Build/Verify/Ship details  
\`\`\`

\#\#\# Flow 3: Lesson Generation (Teaching)  
\`\`\`  
1\. User fills input form (grade, standard, topic, etc.)  
2\. Clicks "Generate with Bruce"  
3\. AI creates full lesson package  
4\. Package stored in database  
5\. User views/prints output  
6\. \[Future\] Export to PDF  
\`\`\`

\#\#\# Flow 4: Content Generation (Harris)  
\`\`\`  
1\. User fills strategic inputs  
2\. Clicks "Generate Site Copy"  
3\. AI creates Home/StartHere/Resources copy  
4\. Content displayed for review  
5\. \[Future\] Export/integrate with WordPress  
\`\`\`

\---

\#\# Security & Privacy

\#\#\# Red-Zone Privacy Rules  
From requirements documents:  
\- Support "summaries only" sharing  
\- Never assume raw logs should be shared  
\- Never log/share items on the red-zone privacy list

\#\#\# Data Handling  
\- All data stored in PostgreSQL (Neon-backed)  
\- Environment variables for sensitive keys  
\- No client-side storage of sensitive data  
\- AI outputs are "source locked" to provided inputs

\#\#\# Source Lock Policy  
Every generated output includes implicit guarantee:  
\> "Based only on provided inputs. No invented facts."

\---

\#\# Operating Rules

\#\#\# Advice Mode Default  
\- \*\*Patterns only\*\* — no advice unless explicitly asked  
\- AI summaries are observational, not prescriptive

\#\#\# Stop-and-Reset Rule  
When stress reaches critical levels:  
1\. Pause current task  
2\. 2-minute reset  
3\. Reframe before continuing

\#\#\# Escalation Triggers  
When to step away and seek support:  
\- High stress patterns detected  
\- Multiple drift flags  
\- Repeated friction in same area

\---

\#\# File Structure

\`\`\`  
├── client/  
│   ├── src/  
│   │   ├── App.tsx                 \# Main app with routing  
│   │   ├── components/  
│   │   │   ├── Layout.tsx          \# Sidebar \+ main layout  
│   │   │   └── ui/                 \# Shadcn components  
│   │   ├── hooks/  
│   │   │   └── use-bruce-ops.ts    \# API hooks for all lanes  
│   │   ├── pages/  
│   │   │   ├── Dashboard.tsx  
│   │   │   ├── LifeOps.tsx  
│   │   │   ├── ThinkOps.tsx  
│   │   │   ├── TeachingAssistant.tsx  
│   │   │   ├── HarrisWildlands.tsx  
│   │   │   └── Settings.tsx  
│   │   └── lib/  
│   │       └── queryClient.ts      \# TanStack Query setup  
│   └── index.html  
├── server/  
│   ├── index.ts                    \# Express server entry  
│   ├── routes.ts                   \# All API route handlers  
│   ├── storage.ts                  \# Database access layer  
│   ├── db.ts                       \# PostgreSQL connection  
│   └── vite.ts                     \# Vite dev server integration  
├── shared/  
│   ├── schema.ts                   \# Drizzle tables \+ Zod schemas  
│   └── routes.ts                   \# API contract definitions  
├── docs/  
│   ├── ARCHITECTURE.md             \# This file  
│   ├── CODEBASE.md                 \# Annotated code reference  
│   └── ENHANCEMENTS.md             \# Future roadmap  
└── attached\_assets/  
    └── Lane\*.docx                  \# Original requirements  
\`\`\`

\---

\#\# Quick Reference

\#\#\# Environment Variables Required  
| Variable | Purpose |  
|----------|---------|  
| \`DATABASE\_URL\` | PostgreSQL connection string |  
| \`OPENROUTER\_API\_KEY\` | AI model access |  
| \`SESSION\_SECRET\` | Session encryption (if auth added) |

\#\#\# Key Commands  
\`\`\`bash  
npm run dev          \# Start development server  
npm run db:push      \# Push schema to database  
npm run build        \# Build for production  
\`\`\`

\#\#\# Ports  
\- Frontend \+ Backend: \`5000\` (single port)  
\- Database: Provided by Neon (cloud PostgreSQL)

\---

\*This document is the source of truth for BruceOps architecture. Update it when making significant changes.\*

