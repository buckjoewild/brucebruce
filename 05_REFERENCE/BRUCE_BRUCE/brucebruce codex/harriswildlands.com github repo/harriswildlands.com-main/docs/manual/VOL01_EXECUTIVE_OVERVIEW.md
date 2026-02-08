# VOLUME 1: EXECUTIVE OVERVIEW & PROJECT IDENTITY

**HarrisWildlands.com Technical Project Manual**  
**Version:** 1.0.0  
**Generated:** December 28, 2025

---

## 1.1 Project Manifest

| Attribute | Value |
|-----------|-------|
| **Project Name** | HarrisWildlands.com |
| **Internal Codename** | Thought Weaver |
| **Alternate Name** | BruceOps |
| **Version** | 1.0.0 (from package.json) |
| **Repository URL** | https://github.com/buckjoewild/harriswildlands.com |
| **Live URL** | harriswildlands.com |
| **Hosting Platform** | Replit (primary), Docker (portable) |
| **Primary Language** | TypeScript (100% of custom code) |
| **License** | MIT |
| **Package Name** | rest-express |
| **Module System** | ESM (type: "module") |

---

## 1.2 Vision Statement

BruceOps is a **Personal Operating System** designed for Bruce Harris - a dad, 5th/6th grade teacher, creator, and builder.

The system manages four core operational "lanes" of life:

### Lane 1: LifeOps
**Purpose:** Daily calibration and life metrics tracking

- Vice tracking (8 boolean habits)
- Life metrics (8 scales from 1-10)
- Quick context selectors (day type, emotion, wins, time drains)
- Reflection prompts (top win, friction, tomorrow's priority)
- Optional deep dives (family, faith, drift check)
- AI-generated summaries

### Lane 2: ThinkOps
**Purpose:** Idea pipeline with AI-powered reality checking

- Idea capture (quick and deep modes)
- Pipeline status workflow: `draft → parked → promoted → shipped/discarded`
- AI Reality Check with Known/Likely/Speculation classification
- Self-deception pattern detection
- Milestone tracking
- Priority scoring (0-5 stars)

### Lane 3: Teaching Assistant
**Purpose:** AI-powered lesson planning for 5th-6th grade

- Standards-aligned lesson generation
- Hands-on activities
- Exit tickets with answer keys
- Differentiation suggestions
- 10-minute prep lists

### Lane 4: HarrisWildlands
**Purpose:** Website copy and content generation

- Website, social, email, blog, video content types
- Core message framework
- Site map goal alignment
- Lead magnet design
- Tone selection (inspirational, educational, personal, professional)

---

## 1.3 Core Philosophy

> **"Faith over fear & systems over skills"**

### Non-Negotiables

1. **LifeOps outputs are factual/pattern-based** - no invented context
2. **ThinkOps separates Known / Likely / Speculation** - with self-deception filters
3. **Teaching outputs are standards-aligned, printable-ready, minimal prep**
4. **Red-zone privacy** - support "summaries only" sharing; never assume raw logs should be shared

---

## 1.4 Target User Profile

| Attribute | Value |
|-----------|-------|
| **User Type** | Single-user personal system |
| **Primary User** | Bruce Harris |
| **Roles** | Dad, 5th/6th grade teacher, creator, builder |
| **Builder Type** | Non-traditional (product decisions + AI-assisted coding) |
| **Privacy Model** | Private by default, user-scoped data |

---

## 1.5 Project History & Evolution

### Key Milestones

| Date | Milestone |
|------|-----------|
| 2025-12-27 | v1.0 Keystone Release |
| 2025-12-27 | Complete documentation (30 files, 6 sections) |
| 2025-12-27 | M1 Verification complete (smoke test 6/6) |
| 2025-12-27 | Docker standalone mode verified |
| 2025-12 | AI integration with Gemini/OpenRouter ladder |
| 2025-12 | Weekly Review with charts and AI insights |
| 2025-12 | Reality Check with K/L/S classification |

### Architectural Decisions

1. **Shared Schema Pattern** - Single source of truth in `shared/schema.ts`
2. **User-Scoped Data** - All entities include userId for isolation
3. **AI Provider Ladder** - Gemini → OpenRouter → Off with automatic fallback
4. **Standalone-First Design** - Works locally without cloud dependencies
5. **Replit Auth Integration** - OIDC with PostgreSQL sessions

---

## 1.6 System Metrics

### Codebase Statistics

| Metric | Value |
|--------|-------|
| **Pages** | 12 |
| **UI Components** | 48 (shadcn/ui) + 8 custom |
| **API Endpoints** | 24+ |
| **Database Tables** | 10 |
| **Documentation Files** | 30+ structured files |

### Database Tables

1. `users` - User authentication records
2. `sessions` - Session management
3. `logs` - LifeOps daily calibration
4. `ideas` - ThinkOps pipeline
5. `goals` - Domain-based goal tracking
6. `checkins` - Goal progress check-ins
7. `teaching_requests` - Lesson plan requests
8. `harris_content` - Brand content generation
9. `user_settings` - Per-user preferences
10. `drift_flags` - Pattern detection flags

### Pages

| Route | Component | Lane |
|-------|-----------|------|
| `/` | Dashboard | Core |
| `/life-ops` | LifeOps | Lane 1 |
| `/goals` | Goals | Lane 1 |
| `/think-ops` | ThinkOps | Lane 2 |
| `/reality-check` | RealityCheck | Lane 2 |
| `/teaching` | TeachingAssistant | Lane 3 |
| `/harris` | HarrisWildlands | Lane 4 |
| `/weekly-review` | WeeklyReview | Analytics |
| `/chat` | Chat | AI |
| `/settings` | Settings | Config |

---

## 1.7 Quick Reference

### Key Files

| File | Purpose |
|------|---------|
| `shared/schema.ts` | All database tables, Zod schemas, types |
| `server/routes.ts` | All API endpoints |
| `server/storage.ts` | All database methods |
| `client/src/App.tsx` | All routes |
| `shared/routes.ts` | API contract definitions |

### Key Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run db:push` | Sync schema to database |
| `docker compose up` | Standalone deployment |

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection |
| `SESSION_SECRET` | Yes | Session encryption |
| `AI_PROVIDER` | No | `gemini`, `openrouter`, or `off` |
| `GOOGLE_GEMINI_API_KEY` | No | Gemini API key |
| `OPENROUTER_API_KEY` | No | OpenRouter API key |
| `STANDALONE_MODE` | No | Enable auto-login |

---

**Next Volume:** [VOL02 - Technology Stack Deep Dive](./VOL02_TECH_STACK.md)
