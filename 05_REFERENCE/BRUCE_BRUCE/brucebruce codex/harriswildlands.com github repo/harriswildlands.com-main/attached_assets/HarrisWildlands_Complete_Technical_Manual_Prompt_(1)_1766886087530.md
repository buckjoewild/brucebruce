# HARRISWILDLANDS.COM COMPREHENSIVE TECHNICAL PROJECT MANUAL
## Master Prompt for Complete System Documentation

---

# CONTEXT FOR AI

You are creating the **definitive technical project manual** for HarrisWildlands.com (internal name: Thought Weaver / BruceOps). This document will serve as the **single source of truth** - the keystone document that any developer, maintainer, or AI agent can reference to understand, operate, extend, or troubleshoot the entire system.

**Repository:** https://github.com/buckjoewild/harriswildlands.com  
**Live Deployment:** harriswildlands.com (Replit)  
**Replit Project:** @brosephharris/Thought-Weaver

---

# DOCUMENT REQUIREMENTS

## Output Format
- Generate a comprehensive technical manual (target: 300-500+ pages equivalent in detail)
- Structure with numbered sections for easy reference
- Include code examples, diagrams (text-based), tables, and decision trees
- Every claim must be verifiable against the actual codebase
- Use version numbers and file paths for all references

## Critical Mandate
- **EXHAUSTIVE**: Document EVERY file, function, endpoint, component, table, and configuration
- **FORWARD-COMPATIBLE**: Include extension patterns and future enhancement roadmaps
- **BACKWARD-COMPATIBLE**: Document all legacy decisions and migration paths
- **OPERATIONALLY COMPLETE**: A developer with zero context should be able to fully operate the system

---

# DOCUMENT STRUCTURE

## VOLUME 1: EXECUTIVE OVERVIEW & PROJECT IDENTITY

### 1.1 Project Manifest
| Attribute | Value |
|-----------|-------|
| Project Name | HarrisWildlands.com |
| Internal Codename | Thought Weaver |
| Alternate Name | BruceOps |
| Version | Document current version from package.json |
| Repository URL | https://github.com/buckjoewild/harriswildlands.com |
| Live URL | harriswildlands.com |
| Hosting Platform | Replit (primary), Docker (portable) |
| Primary Language | TypeScript (document exact percentage) |
| License | Document from package.json |

### 1.2 Vision Statement
Document the complete purpose: A Personal Operating System for Bruce Harris managing four core "lanes" of life:
- **Lane 1: LifeOps** - Daily calibration and life metrics tracking
- **Lane 2: ThinkOps** - Idea pipeline with AI-powered reality checking
- **Lane 3: Teaching Assistant** - AI-powered lesson planning for 5th/6th grade
- **Lane 4: HarrisWildlands** - Website copy and content generation

### 1.3 Target User Profile
- Single-user personal system
- Bruce Harris: Dad, 5th/6th grade teacher, creator, builder
- Non-traditional builder (product decisions + AI-assisted coding)

### 1.4 Project History & Evolution
- Document creation timeline
- Key milestones and decisions
- Replit Agent involvement
- Architectural pivots

---

## VOLUME 2: TECHNOLOGY STACK DEEP DIVE

### 2.1 Frontend Stack
For each technology, document:
- Exact version from package.json
- Why chosen (decision rationale)
- How used in this project
- Key configuration files
- Common patterns employed

**Required coverage:**
- React 18 + TypeScript
- Vite (build system)
- Tailwind CSS 3.4
- shadcn/ui components
- TanStack Query 5 (state management)
- Wouter 3.3 (routing)
- Recharts (visualizations)
- Lucide React (icons)

### 2.2 Backend Stack
- Express.js 4.21
- TypeScript (ESM modules)
- Node.js 20.x
- Session management strategy
- Middleware chain documentation

### 2.3 Database Stack
- PostgreSQL 16
- Drizzle ORM 0.39
- Schema synchronization (drizzle-kit push vs migrations)
- Connection pooling (pg Pool)
- JSONB usage patterns

### 2.4 Authentication Stack
- Replit OIDC (Passport.js integration)
- Demo mode bypass mechanism
- Session storage
- Authorization patterns
- Guards for non-Replit environments

### 2.5 AI Provider Stack
Document the AI provider ladder:
1. **Primary:** Google Gemini 1.5 Flash (free tier)
2. **Fallback:** OpenRouter (GPT-4o-mini)
3. **Graceful degradation:** Off mode

For each:
- API configuration
- Rate limits
- Cost per call
- Error handling
- Fallback triggers

### 2.6 DevOps Stack
- Replit deployment configuration
- Docker/Docker Compose setup
- Environment variables (complete list with defaults)
- Build scripts (all npm scripts documented)
- Health check endpoints

---

## VOLUME 3: ARCHITECTURE DOCUMENTATION

### 3.1 System Architecture Diagram
Create text-based architecture diagram showing:
```
[Browser] → [Vite Dev Server / Static Build]
                    ↓
            [Express.js API]
                    ↓
    ┌───────────────┼───────────────┐
    ↓               ↓               ↓
[PostgreSQL]  [AI Providers]  [Google Drive]
```

### 3.2 Request Flow Documentation
Document complete request lifecycle:
1. User action in browser
2. React component event handler
3. TanStack Query mutation/query
4. Fetch to API endpoint
5. Express middleware chain
6. Route handler
7. Zod validation
8. Storage layer (Drizzle)
9. Database operation
10. Response chain back to UI

### 3.3 Data Flow Patterns
- Client-side state (TanStack Query cache)
- Server-side state (PostgreSQL)
- Session state (express-session)
- AI context construction
- Export/import flows

### 3.4 Authentication Flow
Document complete auth flow:
1. Replit OIDC initiation
2. Callback handling
3. Session creation
4. User record creation/lookup
5. Demo mode bypass path
6. Session validation on each request

### 3.5 Error Handling Architecture
- Frontend error boundaries
- API error responses
- AI failure graceful degradation
- Database connection failures
- Validation error handling

---

## VOLUME 4: COMPLETE FILE STRUCTURE

### 4.1 Repository Root
Document EVERY file at root level with:
- Purpose
- Key contents
- Dependencies
- Configuration options

```
harriswildlands.com/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── drizzle.config.ts
├── Dockerfile
├── docker-compose.yml
├── .replit
├── replit.nix
├── .env.example
└── README.md
```

### 4.2 Client Directory (/client)
Document EVERY file:
```
client/
├── index.html
├── src/
│   ├── main.tsx          [Document: App entry point, providers setup]
│   ├── App.tsx           [Document: Router configuration, all routes]
│   ├── index.css         [Document: Global styles, Tailwind imports]
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── ui/           [Document EVERY shadcn component]
│   │   ├── Layout.tsx    [Document: Navigation, theme, structure]
│   │   ├── ThemeProvider.tsx
│   │   └── [ALL OTHER COMPONENTS]
│   ├── hooks/
│   │   └── [EVERY CUSTOM HOOK with full API]
│   ├── lib/
│   │   ├── queryClient.ts
│   │   ├── utils.ts
│   │   └── [ALL UTILITIES]
│   └── pages/
│       ├── Dashboard.tsx     [Route: /]
│       ├── LifeOps.tsx       [Route: /life-ops]
│       ├── Goals.tsx         [Route: /goals]
│       ├── ThinkOps.tsx      [Route: /think-ops]
│       ├── TeachingAssistant.tsx [Route: /teaching]
│       ├── HarrisWildlands.tsx   [Route: /harris]
│       ├── BruceOps.tsx      [Route: /bruce-ops]
│       ├── Settings.tsx      [Route: /settings]
│       └── not-found.tsx     [Route: 404]
```

### 4.3 Server Directory (/server)
Document EVERY file:
```
server/
├── index.ts              [Document: Server entry, middleware setup]
├── routes.ts             [Document: ALL 24+ API endpoints]
├── storage.ts            [Document: ALL database methods]
├── db.ts                 [Document: Database connection, pool config]
├── ai.ts or ai-service.ts [Document: AI provider ladder, callAI function]
├── google-drive.ts       [Document: Drive integration if present]
├── replit_integrations/
│   └── auth.ts           [Document: Complete OIDC setup]
└── vite.ts               [Document: Dev server integration]
```

### 4.4 Shared Directory (/shared)
```
shared/
├── schema.ts             [Document: ALL Drizzle tables, Zod schemas, types]
├── routes.ts             [Document: API contract definitions]
└── models/
    └── auth.ts           [Document: Auth model exports]
```

### 4.5 Documentation Directory (/docs)
List and describe ALL documentation files

### 4.6 Release Directory (/release)
Document the portable release structure if present

---

## VOLUME 5: DATABASE SCHEMA COMPLETE REFERENCE

### 5.1 Schema Overview
- PostgreSQL version
- Drizzle ORM patterns
- Schema sync strategy (push vs migrations)
- User data isolation (userId scoping)

### 5.2 Table: users
Document ALL fields with:
- Field name
- Type
- Constraints
- Default value
- Purpose
- Example values

### 5.3 Table: logs (Daily Calibration)
**Purpose:** Captures daily life metrics for pattern detection

**Vice Tracking (Boolean Fields):**
- vaping, alcohol, junkFood, doomScrolling, lateScreens, skippedMeals, excessCaffeine, exercise

**Life Metrics (1-10 Scales):**
- energy, stress, mood, focus, sleepQuality, sleepHours, moneyPressure, connection

**Context Fields:**
- dayType: work | rest | family | mixed | chaos
- primaryEmotion: grateful | anxious | hopeful | frustrated | peaceful | overwhelmed
- winCategory: family | work | health | faith | creative | none
- timeDrain: meetings | distractions | emergencies | low-energy | interruptions | none

**Reflection Prompts:**
- topWin, topFriction, tomorrowPriority
- familyConnection, faithAlignment, driftCheck

[Document EVERY field completely]

### 5.4 Table: ideas (ThinkOps Pipeline)
**Purpose:** Manages idea lifecycle from capture through reality-checking

**Status Workflow:**
```
draft → parked → promoted → shipped/discarded
```

**Reality Check JSONB Structure:**
```json
{
  "known": ["facts confirmed by research"],
  "likely": ["reasonable assumptions"],
  "speculation": ["unvalidated beliefs"],
  "flags": ["Overbuilding", "Perfectionism", "Time Optimism", etc.],
  "decision": "Promote" | "Park" | "Salvage" | "Discard"
}
```

**Categories:** tech | business | creative | family | faith | learning

[Document EVERY field completely]

### 5.5 Table: goals (Domain-Based Tracking)
**Purpose:** Tracks goals organized by life domain

**Domains (8 total):**
1. faith
2. family
3. work
4. health
5. logistics
6. property
7. ideas
8. discipline

**Target Types:**
- binary (done/not done)
- count (e.g., 3 workouts/week)
- duration (time-based)

[Document EVERY field completely]

### 5.6 Table: checkins (Goal Progress)
**Purpose:** Daily goal completion tracking for weekly reviews

**Key Fields:**
- goalId, date (YYYY-MM-DD), done (boolean), score (1-10), note

**Upsert Pattern:**
Checks for existing record by (userId, goalId, date) then updates or creates

[Document EVERY field completely]

### 5.7 Table: teachingRequests
[Complete documentation]

### 5.8 Table: harrisContent
[Complete documentation]

### 5.9 Table: settings / userSettings
[Complete documentation]

### 5.10 Table: driftFlags
[Complete documentation]

### 5.11 Schema Relationships Diagram
Create text-based ERD showing all relationships

### 5.12 Common Query Patterns
Document the most common queries for each table

---

## VOLUME 6: API ENDPOINT CATALOG

### 6.1 API Design Patterns
- RESTful conventions used
- Authentication requirements
- Request/response formats
- Error response structure
- Zod validation patterns

### 6.2 Health & System Endpoints
| Method | Path | Auth | Request | Response | Purpose |
|--------|------|------|---------|----------|---------|
| GET | /api/health | No | - | `{status, database, demo_mode, ai_provider, ai_status}` | System health check |
| GET | /api/me | Yes | - | User object | Current authenticated user |

### 6.3 Logs Endpoints (LifeOps)
| Method | Path | Auth | Request | Response | Purpose |
|--------|------|------|---------|----------|---------|
| GET | /api/logs | Yes | query params | Log[] | List all logs |
| GET | /api/logs/:date | Yes | date param | Log | Get log by date |
| POST | /api/logs | Yes | Log body | Log | Create new log |
| PUT | /api/logs/:id | Yes | Log body | Log | Update existing log |
| DELETE | /api/logs/:id | Yes | - | - | Delete log |

[Document EVERY endpoint with complete request/response schemas]

### 6.4 Ideas Endpoints (ThinkOps)
[Complete documentation including /api/ideas/:id/reality-check]

### 6.5 Goals Endpoints
[Complete documentation]

### 6.6 Checkins Endpoints
[Complete documentation]

### 6.7 Teaching Endpoints
[Complete documentation]

### 6.8 Harris Content Endpoints
[Complete documentation]

### 6.9 Weekly Review & Export Endpoints
- /api/weekly-review
- /api/weekly-review/pdf
- /api/export/data
- /api/weekly-insight (AI-powered)

### 6.10 Chat Endpoint
- /api/chat (BruceOps conversational AI)

### 6.11 Google Drive Endpoints (if present)
[Complete documentation]

### 6.12 Settings Endpoints
[Complete documentation]

---

## VOLUME 7: AI INTEGRATION COMPLETE GUIDE

### 7.1 AI Provider Architecture
Document the callAI() function completely:
```typescript
// Document the complete function signature
// Document error handling
// Document retry logic
// Document fallback cascade
```

### 7.2 Bruce Context Prompt
Document the complete system prompt that provides context about Bruce:
- Who Bruce is
- His priorities
- Communication style preferences
- What to include/exclude

### 7.3 AI Feature: Reality Check
**Endpoint:** POST /api/ideas/:id/reality-check

**Input:** Idea object

**AI Prompt Structure:**
[Document the complete prompt template]

**Output Structure:**
```json
{
  "known": [],
  "likely": [],
  "speculation": [],
  "flags": [],
  "decision": ""
}
```

**Self-Deception Flags Detected:**
- Overbuilding
- Perfectionism Spiral
- Time Optimism
- Scope Creep
- Validation Seeking
- Shiny Object Syndrome
[Document all possible flags]

### 7.4 AI Feature: Log Summary
**When triggered:** After log creation
**Purpose:** Generate daily insight
**Fallback:** "Daily logging completed successfully."

### 7.5 AI Feature: Weekly Insight
**Endpoint:** GET /api/weekly-insight
**Input:** Last 7 days of logs + goals + checkins
**Output:** Pattern analysis, one thing to adjust

### 7.6 AI Feature: Teaching Assistant
**Endpoint:** POST /api/teaching
**Input:** Topic, grade level, standards
**Output:** Complete lesson plan with:
- Hook
- Activity
- Exit ticket
- Differentiation strategies
- Real-world examples (via web search if available)

### 7.7 AI Feature: Harris Content Generator
**Endpoint:** POST /api/harris
**Input:** Content type, topic
**Output:** Website copy

### 7.8 AI Feature: BruceOps Chat
**Endpoint:** POST /api/chat
**Input:** Message + conversation history
**Output:** Contextual response with data access

### 7.9 Cost Analysis
| Feature | Tokens/Call | Calls/Month (Est) | Monthly Cost |
|---------|-------------|-------------------|--------------|
| Reality Check | ~1000 | 20 | $0.XX |
| Log Summary | ~500 | 30 | $0.XX |
| Weekly Insight | ~2000 | 4 | $0.XX |
| Teaching | ~1500 | 10 | $0.XX |
| Harris Content | ~800 | 5 | $0.XX |
| Chat | ~600 | 50 | $0.XX |
| **TOTAL** | - | - | **~$0.XX/month** |

### 7.10 Error Handling & Graceful Degradation
Document what happens when:
- Primary provider fails (429, 500, timeout)
- Secondary provider fails
- All providers fail
- API keys missing
- Rate limits exceeded

---

## VOLUME 8: USER WORKFLOWS

### 8.1 Daily Logging Workflow (Core)
Step-by-step with screenshots/descriptions:
1. User opens harriswildlands.com
2. Navigates to LifeOps (or Dashboard redirects)
3. Fills daily log form
   - Vice tracking checkboxes
   - Life metrics sliders (1-10)
   - Context dropdowns
   - Reflection text areas
4. Submits form
5. Backend processing:
   - Zod validation
   - Database insert
   - AI summary generation (if enabled)
6. UI feedback
7. Entry appears in history

### 8.2 Idea Reality Check Workflow
1. Create idea in ThinkOps
2. Click "Reality Check"
3. AI analyzes idea
4. Results displayed in Known/Likely/Speculation format
5. Flags highlighted
6. Decision recommendation shown
7. User can accept recommendation or override

### 8.3 Goal Setting & Tracking Workflow
1. Create goal with domain assignment
2. Set target type and weekly minimum
3. Daily check-ins
4. Weekly review aggregation

### 8.4 Weekly Review Workflow
1. Navigate to weekly review
2. View completion charts by domain
3. Review drift flags
4. AI generates "one thing to adjust"
5. Optional export to PDF/JSON

### 8.5 Teaching Assistant Workflow
1. Enter topic and grade level
2. Select standards alignment
3. Click generate
4. AI creates lesson plan
5. Download or copy

### 8.6 Demo Mode Workflow
1. Add ?demo=true to URL
2. localStorage flag set
3. All API calls return demo data
4. Full app experience without auth
5. Clear with Settings or remove param

### 8.7 Data Export Workflow
1. Settings → Export Data
2. Select format (JSON)
3. All tables exported with timestamp
4. Download file

---

## VOLUME 9: COMPONENT REFERENCE

### 9.1 Page Components
For EACH page component, document:
- File path
- Route
- Props
- State management (TanStack Query keys)
- API calls made
- Sub-components used
- Key features
- Styling approach

**Pages:**
- Dashboard.tsx
- LifeOps.tsx
- Goals.tsx
- ThinkOps.tsx
- TeachingAssistant.tsx
- HarrisWildlands.tsx
- BruceOps.tsx
- Settings.tsx
- not-found.tsx

### 9.2 Layout Components
- Layout.tsx (navigation, theme switcher, structure)
- ThemeProvider.tsx (lab/field/sanctuary themes)

### 9.3 UI Components (shadcn)
Document ALL shadcn components used with customizations

### 9.4 Custom Hooks
For EACH hook, document:
- File path
- Purpose
- Parameters
- Return value
- TanStack Query configuration
- Example usage

**Hooks:**
- useRealityCheck
- useLogs
- useGoals
- useCheckins
- useIdeas
- useTeaching
- useHarris
- useWeeklyReview
- useChat
- [ALL OTHERS]

### 9.5 Utility Functions
Document ALL utilities in /lib with:
- Function signature
- Purpose
- Parameters
- Return value
- Usage examples

---

## VOLUME 10: CONFIGURATION REFERENCE

### 10.1 Environment Variables
| Variable | Required | Default | Description | Where Used |
|----------|----------|---------|-------------|------------|
| DATABASE_URL | Yes | - | PostgreSQL connection string | server/db.ts |
| PORT | No | 5000 | Server port | server/index.ts |
| GOOGLE_GEMINI_API_KEY | No | - | Primary AI provider | server/ai.ts |
| OPENROUTER_API_KEY | No | - | Fallback AI provider | server/ai.ts |
| AI_PROVIDER | No | gemini | gemini\|openrouter\|off | server/ai.ts |
| REPLIT_DB_URL | No | - | Replit-specific | - |
| SESSION_SECRET | No | auto | Session encryption | server/index.ts |

### 10.2 TypeScript Configuration
Document tsconfig.json completely

### 10.3 Vite Configuration
Document vite.config.ts completely

### 10.4 Tailwind Configuration
Document tailwind.config.ts completely
- Theme colors (lab/field/sanctuary)
- Custom utilities
- Plugins

### 10.5 Drizzle Configuration
Document drizzle.config.ts completely

### 10.6 Docker Configuration
Document Dockerfile and docker-compose.yml completely

### 10.7 Replit Configuration
Document .replit and replit.nix

---

## VOLUME 11: DEPLOYMENT GUIDE

### 11.1 Replit Deployment (Primary)
Step-by-step for deploying on Replit:
1. Fork repository
2. Configure Secrets (environment variables)
3. Run `npm install`
4. Run `npm run db:push`
5. Run `npm run dev` (development) or `npm run build && npm start` (production)
6. Verify with /api/health

### 11.2 Docker Deployment (Portable)
Step-by-step for self-hosted Docker:
1. Clone repository
2. Copy .env.example to .env
3. Configure environment variables
4. Run `docker compose up -d`
5. Wait for database initialization
6. Access at configured PORT
7. Verify with /api/health

### 11.3 Local Development
Step-by-step for local development:
1. Clone repository
2. Install dependencies: `npm install`
3. Start PostgreSQL (local or Docker)
4. Configure .env
5. Push schema: `npm run db:push`
6. Start dev server: `npm run dev`
7. Access at http://localhost:5000

### 11.4 Production Considerations
- Database backups
- Log rotation
- Monitoring
- SSL/TLS
- Rate limiting
- Security headers

### 11.5 Database Management
- Schema updates (drizzle-kit push)
- Backups (pg_dump)
- Restores (pg_restore)
- Volume persistence in Docker

---

## VOLUME 12: SECURITY AUDIT

### 12.1 Authentication Security
- Replit OIDC implementation review
- Session security
- Demo mode isolation

### 12.2 Data Security
- User data isolation (userId scoping)
- Input validation (Zod)
- SQL injection prevention (Drizzle ORM)
- XSS prevention

### 12.3 API Security
- Authentication middleware
- CORS configuration
- Rate limiting status
- Error message safety

### 12.4 Secret Management
- Environment variables
- Replit Secrets
- Docker secrets

### 12.5 Known Risks
| Risk | Severity | Mitigation |
|------|----------|------------|
| API Key Exposure | High | Use Replit Secrets / Docker secrets |
| Demo Mode Bypass | Medium | Session-based, not route-based |
| No Rate Limiting | Medium | Implement express-rate-limit |
| CORS Too Permissive | Low | Restrict to known origins |

### 12.6 Security Recommendations
Prioritized list of security improvements

---

## VOLUME 13: EXTENSION GUIDE

### 13.1 Adding a New Page
Step-by-step:
1. Create `client/src/pages/NewPage.tsx`
2. Add route in `client/src/App.tsx`
3. Add navigation link in `client/src/components/Layout.tsx`
4. Create API endpoints if needed
5. Create custom hooks if needed

### 13.2 Adding a New Database Table
1. Define table in `shared/schema.ts`
2. Add Zod schemas
3. Export types
4. Run `npm run db:push`
5. Add storage methods in `server/storage.ts`
6. Add API endpoints in `server/routes.ts`

### 13.3 Adding a New API Endpoint
1. Define route in `server/routes.ts`
2. Add Zod validation in `shared/routes.ts`
3. Implement storage method in `server/storage.ts`
4. Add authentication if required
5. Create client hook in `client/src/hooks/`

### 13.4 Adding a New AI Feature
1. Define prompt template
2. Add endpoint in `server/routes.ts`
3. Call `callAI()` with appropriate context
4. Handle response parsing
5. Implement graceful degradation
6. Create client hook and UI

### 13.5 Adding a New Goal Domain
1. Add to `GOAL_DOMAINS` array in `shared/schema.ts`
2. No database changes needed (uses enum)
3. UI automatically picks up new domain

### 13.6 Adding a New Log Field
1. Add column to logs table in `shared/schema.ts`
2. Add to Zod schema
3. Run `npm run db:push`
4. Update LifeOps form component
5. Update storage methods

### 13.7 Adding a New AI Provider
1. Add provider check in `server/ai.ts`
2. Implement API call wrapper
3. Add to provider ladder
4. Add environment variable
5. Update health check

### 13.8 Theming & Styling
- How to modify lab/field/sanctuary themes
- Adding new theme
- Custom color palette

---

## VOLUME 14: TROUBLESHOOTING GUIDE

### 14.1 Common Issues

**Issue: "DATABASE_URL must be set"**
- Cause: Missing environment variable
- Solution: Add DATABASE_URL to .env or Replit Secrets

**Issue: App loads but API returns 401**
- Cause: Authentication not configured
- Solution: Use demo mode (?demo=true) or configure Replit OIDC

**Issue: AI features return "unavailable"**
- Cause: Missing API keys or provider failures
- Solution: Check GOOGLE_GEMINI_API_KEY, check /api/health

**Issue: Database connection failed**
- Cause: PostgreSQL not running or wrong connection string
- Solution: Verify DATABASE_URL, check PostgreSQL status

**Issue: Build fails with TypeScript errors**
- Cause: Type mismatches or missing dependencies
- Solution: Run `npm install`, check tsconfig.json

**Issue: Docker containers won't start**
- Cause: Port conflicts or missing volumes
- Solution: Check docker-compose.yml, verify ports available

**Issue: Styles not applying**
- Cause: Tailwind not processing or class names wrong
- Solution: Check tailwind.config.ts, verify class names

**Issue: Forms not submitting**
- Cause: Validation errors or network issues
- Solution: Check browser console, verify API endpoint

**Issue: Reality check JSON parse error**
- Cause: AI response not in expected format
- Solution: Check AI prompt, add response parsing

**Issue: Charts not rendering**
- Cause: Missing recharts or data format issues
- Solution: Verify recharts installed, check data structure

### 14.2 Debug Procedures
Step-by-step debugging for each major subsystem

### 14.3 Log Analysis
- Where logs are written
- How to access logs
- What to look for

### 14.4 Health Check Interpretation
Document each field in /api/health response

---

## VOLUME 15: TESTING GUIDE

### 15.1 Manual Testing Checklist
| Test | Steps | Expected Result |
|------|-------|-----------------|
| Local dev works | `npm run dev` | Server starts, UI loads |
| Production build | `npm run build && npm start` | Build completes, app serves |
| Docker cold start | `docker compose up` | Both containers healthy |
| Database persists | Create log → restart → verify | Log survives restart |
| Demo mode | Visit /?demo=true | Demo data shown |
| Missing AI keys | Start without keys | App loads, AI shows unavailable |
| Health endpoint | GET /api/health | JSON with all status fields |
| Data export | Settings → Export | JSON file with all tables |

### 15.2 API Testing
Example curl commands for each endpoint

### 15.3 Integration Testing
Key integration points to verify

### 15.4 Performance Testing
- Page load benchmarks
- API response time expectations
- Database query optimization

---

## VOLUME 16: MAINTENANCE PROCEDURES

### 16.1 Daily Operations
- Health check monitoring
- Log review

### 16.2 Weekly Operations
- Database backup verification
- Storage usage check

### 16.3 Monthly Operations
- Dependency updates
- Security review
- Performance analysis

### 16.4 Upgrade Procedures
- Dependency upgrades
- Node.js upgrades
- PostgreSQL upgrades

### 16.5 Backup & Recovery
- Database backup procedure
- Data export procedure
- Disaster recovery steps

---

## VOLUME 17: FUTURE ROADMAP

### 17.1 Planned Features
Document known planned enhancements:
- True PDF generation for weekly exports
- Family data features (with protocol considerations)
- Multi-user support (potential)
- Mobile app (potential)
- Voice input for chat
- File upload for teaching

### 17.2 Technical Debt
- Areas needing refactoring
- Performance bottlenecks
- Security improvements needed

### 17.3 Scalability Considerations
- Current limits
- Growth paths
- Architecture changes for scale

### 17.4 Alternative Architectures
- Microservices migration path
- Serverless options
- Edge deployment

---

## VOLUME 18: APPENDICES

### A.1 Glossary
Define all project-specific terms:
- BruceOps
- LifeOps
- ThinkOps
- Reality Check
- Drift Detection
- Demo Mode
- Provider Ladder
- etc.

### A.2 Quick Reference Cards
One-page summaries for common tasks

### A.3 Dependency Versions
Complete list of all dependencies with versions from package.json

### A.4 File-to-Purpose Index
Alphabetical list of every file with purpose

### A.5 Endpoint Quick Reference
All endpoints in compact table format

### A.6 Database Quick Reference
All tables and key fields in compact format

### A.7 Environment Variable Quick Reference
All env vars with descriptions

### A.8 Changelog
Version history with changes

---

# GENERATION INSTRUCTIONS

1. **Access the Repository:** Use https://github.com/buckjoewild/harriswildlands.com

2. **Read Every File:** Do not summarize. Document every file, every function, every line if relevant.

3. **Verify Claims:** Every statement must be verifiable against actual code.

4. **Be Exhaustive:** 300-500+ pages equivalent. Miss nothing.

5. **Include Code Examples:** Show actual code from the repository.

6. **Create Diagrams:** Use text-based diagrams where visual representation helps.

7. **Future-Proof:** Document extension patterns, not just current state.

8. **Operational Focus:** A new developer should be fully operational after reading this.

9. **Version Everything:** Include version numbers, commit hashes if relevant.

10. **Index Everything:** Create comprehensive cross-references.

---

# VERIFICATION CHECKLIST

After generation, verify:

- [ ] Every file in repository is documented
- [ ] Every API endpoint is documented with request/response schemas
- [ ] Every database table is documented with all fields
- [ ] Every environment variable is documented
- [ ] Every component is documented with props and usage
- [ ] Every hook is documented with API
- [ ] All AI features are documented with prompts and outputs
- [ ] All workflows are documented step-by-step
- [ ] All error scenarios are documented with solutions
- [ ] Extension patterns are documented for all major additions
- [ ] Security audit is complete
- [ ] Deployment procedures are complete for all platforms
- [ ] Troubleshooting covers common issues
- [ ] Quick reference appendices are complete

---

# OUTPUT FORMAT

Generate as a structured document with:
- Clear section numbering (1.1, 1.2, 2.1, etc.)
- Tables for structured data
- Code blocks for all code examples
- Text diagrams for architecture
- Cross-references between sections
- Page break markers between volumes

This document should be THE definitive reference for HarrisWildlands.com.
