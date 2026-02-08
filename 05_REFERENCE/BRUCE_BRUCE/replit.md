# BruceOps

## Project Context (Audit Summary)

| Field | Value |
|-------|-------|
| **Project Name** | HarrisWildlands (also: BruceOps / Thought-Weaver) |
| **Production URL** | https://harriswildlands.com |
| **GitHub Repo** | https://github.com/buckjoewild/harriswildlands.com |
| **Hosting** | Replit Autoscale (with Docker portability) |
| **Auth** | Replit OIDC + PostgreSQL sessions |
| **Database** | PostgreSQL with Drizzle ORM (Neon-backed) |
| **Key Users** | Solo admin (faith-centered father/teacher/creator) |
| **Privacy** | Private by default, no sharing, user-scoped data |
| **Theme** | Botanical sci-fi terminal (MS-DOS meets forest intelligence) |
| **Last Updated** | January 4, 2026 |

## Overview

BruceOps is a modular personal operating system with a simplified 7-tab navigation:

| Tab | Description | Route |
|-----|-------------|-------|
| **Home** | Dashboard overview | `/` |
| **Life** | Daily calibration, routines, logs | `/life` |
| **Goals** | Trunk (core) & Leaves (growth) tracking | `/goals` |
| **Think** | Ideas, reality-checking, project pipeline | `/think` |
| **Bruce™** | AI Hub (Review, Steward, Teaching tabs) | `/bruce` |
| **Lab** | AI Playground with personas & puzzles | `/lab` |
| **Wildlands** | Brand content generation | `/harris` |

### Navigation Redesign (Jan 2026)
- Consolidated AI features into Bruce™ hub page with internal tabs
- Added Lab page for experimental AI interactions
- Renamed: LifeOps→Life, ThinkOps→Think
- Botanical naming: Core→Trunk, Growth→Leaves

The application serves as a personalized AI assistant for a faith-centered father/teacher/creator, with strict privacy guardrails and a distinctive "botanical sci-fi" visual design aesthetic.

### Core Philosophy
> "Faith over fear & systems over skills"

### Non-Negotiables
- LifeOps outputs are **factual/pattern-based** - no invented context
- ThinkOps separates **Known / Likely / Speculation** with self-deception filters
- Teaching outputs are **standards-aligned, printable-ready, minimal prep**
- Red-zone privacy: support "summaries only" sharing; never assume raw logs should be shared

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query for server state, React hooks for local state
- **Styling**: Tailwind CSS with custom design system featuring three themes (Field/Lab/Sanctuary)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints with typed contracts using Zod schemas
- **AI Integration**: OpenRouter API for LLM calls (GPT-4o-mini default)
- **Authentication**: Replit Auth with OpenID Connect and Passport.js

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Migrations**: Drizzle Kit (`drizzle-kit push` for schema sync)
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/   # UI components and layout
│       ├── hooks/        # Custom React hooks (API, auth, etc.)
│       ├── pages/        # Route components (including new AI pages)
│       └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── routes.ts     # API handlers (with AI endpoints)
│   ├── storage.ts    # Database access layer
│   └── replit_integrations/  # Auth integration
├── shared/           # Shared code (schema, types, routes)
├── scripts/          # Utility scripts (smoke-test.sh)
└── docs/             # Documentation (30 files across 6 sections)
    ├── README.md                    # Documentation index
    ├── 00-start-here/               # Entry point (2 files)
    ├── 10-user-guide/               # End-user docs (7 files)
    ├── 20-operator-guide/           # Self-hosting docs (7 files)
    ├── 30-developer-reference/      # Technical reference (7 files)
    ├── 40-protocols-and-governance/ # Philosophy + constraints (4 files)
    └── 50-releases-and-evidence/    # Release artifacts (3 files)
```

### Key Design Patterns
- **Shared Schema**: Database models and Zod validation schemas defined once in `shared/schema.ts`, used by both frontend and backend
- **Type-Safe API**: Route definitions in `shared/routes.ts` ensure frontend/backend contract alignment
- **User-Scoped Data**: All four lanes store data with `userId` for multi-user isolation
- **AI Context**: Global "Bruce context" prompt personalizes all AI responses to the user's goals

## External Dependencies

### AI Services (Provider Ladder)
AI providers are tried in this order with automatic fallback:
1. **Gemini** (Google AI Studio free tier) - requires `GOOGLE_GEMINI_API_KEY`
2. **OpenRouter** (paid, multiple models) - requires `OPENROUTER_API_KEY`
3. **Off** - graceful degradation, app works without AI

Configuration via `AI_PROVIDER` env var: `gemini` | `openrouter` | `off`
Default model: `openai/gpt-4o-mini` (OpenRouter) or `gemini-1.5-flash` (Gemini)

### Database
- **PostgreSQL**: Primary data store (requires `DATABASE_URL` environment variable)
- Session and user data stored in dedicated tables for Replit Auth

### Authentication
- **Replit Auth**: OpenID Connect-based authentication
- Requires `ISSUER_URL`, `REPL_ID`, and `SESSION_SECRET` environment variables
- **Standalone Mode**: When REPL_ID is missing, falls back to memory sessions and shows demo mode prompt

### Standalone Deployment (Phase 1)
The app supports standalone operation outside Replit:
- **Demo Mode**: Enabled via `?demo=true` URL parameter or localStorage
- **Health Check**: `/api/health` endpoint for Docker health checks
- **Data Export**: `/api/export/data` downloads all user data as JSON
- **Graceful Auth Fallback**: Non-Replit environments use memory sessions with demo mode

### Google Drive Integration
- **Connector**: Replit Google Drive connector (automatic OAuth handling)
- **Client File**: `server/google-drive.ts`
- **API Endpoints**:
  - `GET /api/drive/files` - List files (optional `?q=` query)
  - `POST /api/drive/upload` - Upload file (name, content, mimeType)
  - `GET /api/drive/download/:fileId` - Download file content
  - `POST /api/drive/folder` - Create folder
- **Permissions**: Full Drive access for app data, files, docs, sheets

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Server state management
- `react-hook-form` + `@hookform/resolvers`: Form handling with Zod validation
- `wouter`: Client-side routing
- `express-session` + `connect-pg-simple`: Session management
- `passport` + `openid-client`: Authentication flow
- `googleapis`: Google Drive API client
- `recharts`: Data visualization for weekly review

## AI-Powered Features (December 2025)

### New AI Pages
1. **Reality Check** (`/reality-check`) - Validates ideas with Known/Likely/Speculation classification and self-deception pattern detection
2. **Weekly Review** (`/weekly-review`) - Visualizes goal completion with charts and generates AI-powered weekly insights
3. **Bruce Steward Chat** (`/chat`) - Conversational AI interface with context-aware responses

### AI Endpoints
| Endpoint | Purpose |
|----------|---------|
| `POST /api/ideas/:id/reality-check` | Enhanced reality check with market research |
| `POST /api/review/weekly/insight` | Generate weekly action recommendation (cached daily) |
| `POST /api/chat` | Conversational AI with user data context |

### AI Command Center Endpoints (NEW)
| Endpoint | Purpose |
|----------|---------|
| `POST /api/ai/search` | Semantic search across logs with AI-powered pattern analysis |
| `POST /api/ai/squad` | Multi-perspective AI analysis (systems thinking) |
| `POST /api/ai/weekly-synthesis` | Enhanced weekly narrative report with actionable insights |
| `POST /api/ai/correlations` | Cross-domain correlation detection (energy, stress, mood patterns) |
| `GET /api/ai/quota` | Check daily AI quota usage (100 calls/day limit) |
| `POST /api/ai/cache/clear` | Manually clear cached AI responses |

### Cost Protection Features
- **24-hour Response Caching**: Identical queries return cached results (free, no API cost)
- **Daily Quota**: 100 AI calls per user per day (resets at midnight)
- **Rate Limiting**: 10 AI requests/minute per user, 100 general requests/15min
- **CORS Protection**: Only allowed origins (claude.ai, localhost) can access API

### callAI() and callAIWithCache() Functions
- `callAI()`: Unified AI caller using provider ladder (Gemini -> OpenRouter -> Off)
- `callAIWithCache()`: Wrapper with 24-hour caching and quota enforcement
- Located in `server/routes.ts`

## Technical Documentation

Comprehensive documentation organized by reading path (30 files across 6 sections):

| Section | Purpose | Key Files |
|---------|---------|-----------|
| `docs/00-start-here/` | Entry point and terminology | Overview, Glossary |
| `docs/10-user-guide/` | End-user documentation | Quickstart, LifeOps, ThinkOps, Weekly Review |
| `docs/20-operator-guide/` | Self-hosting and operations | Docker, Configuration, Security, Disaster Recovery |
| `docs/30-developer-reference/` | Technical reference | Architecture, API Routes, Schema, Auth, AI Provider |
| `docs/40-protocols-and-governance/` | Philosophy and constraints | Lane separation, Drift signals, Privacy, Non-goals |
| `docs/50-releases-and-evidence/` | Release artifacts | Keystone v1.0, Acceptance checklist, Changelog |

**Quick links:**
- Start here: `docs/00-start-here/00-overview-and-reading-paths.md`
- Quickstart: `docs/10-user-guide/10-quickstart-standalone-docker.md`
- Architecture: `docs/30-developer-reference/30-architecture-overview.md`
- Changelog: `docs/50-releases-and-evidence/52-changelog.md`