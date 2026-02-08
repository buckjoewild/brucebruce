# Architecture overview

**Audience:** Developers / maintainers  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

High-level system architecture for developers maintaining or extending the codebase.

## System diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  React 18 + TypeScript                                   │   │
│  │  ├── wouter (routing)                                    │   │
│  │  ├── TanStack Query (server state)                       │   │
│  │  ├── react-hook-form + zod (forms)                       │   │
│  │  └── shadcn/ui + Tailwind (styling)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP (REST API)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Server (Node.js)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Express + TypeScript                                    │   │
│  │  ├── Passport.js (auth)                                  │   │
│  │  ├── express-session + connect-pg-simple                 │   │
│  │  └── Drizzle ORM (database)                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  External Services                                       │   │
│  │  ├── PostgreSQL (data)                                   │   │
│  │  ├── Gemini API (AI, optional)                           │   │
│  │  └── OpenRouter API (AI fallback, optional)              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Key design decisions

### 1. Shared schema

All data models defined once in `shared/schema.ts`:
- Used by both frontend (types) and backend (ORM)
- Zod schemas for validation
- Single source of truth

### 2. Thin backend

Backend responsibilities:
- Data persistence (CRUD via storage interface)
- Authentication
- AI API calls

Everything else lives in the frontend.

### 3. User-scoped data

All entities include `userId`:
- Logs, ideas, goals, check-ins, etc.
- Multi-user ready (even if single-user in practice)
- Demo mode uses client-side data (no userId)

### 4. AI is optional

"Provider ladder" pattern:
1. Try Gemini (if configured)
2. Fall back to OpenRouter (if configured)
3. Fall back to OFF (app still works)

Core functionality works without AI.

### 5. Standalone-first

Designed to run locally without external dependencies:
- STANDALONE_MODE for auto-login
- Docker Compose for easy deployment
- No cloud services required

## Technology stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 | UI framework |
| Routing | wouter | Client-side routing |
| State | TanStack Query | Server state management |
| Forms | react-hook-form + zod | Form handling + validation |
| Styling | Tailwind + shadcn/ui | CSS + components |
| Backend | Express | HTTP server |
| Auth | Passport + OIDC | Authentication |
| Sessions | express-session + pg | Session storage |
| ORM | Drizzle | Database access |
| Database | PostgreSQL | Data storage |
| AI | Gemini / OpenRouter | Optional AI features |
| Build | Vite + esbuild | Bundling |

## Data flow

### Read operation
```
Browser → TanStack Query → GET /api/resource → Storage → PostgreSQL
    ↑                                                          │
    └──────────────── JSON response ◄──────────────────────────┘
```

### Write operation
```
Browser → Form → POST /api/resource → Zod validation → Storage → PostgreSQL
    ↑                                                               │
    └─────────────── Success + cache invalidation ◄─────────────────┘
```

### AI operation
```
Browser → POST /api/chat → callAI() → Gemini/OpenRouter → Response
    ↑                                                         │
    └──────────────────── AI response ◄───────────────────────┘
```

## Module boundaries

| Module | Responsibility | Dependencies |
|--------|----------------|--------------|
| `client/` | UI, routing, forms | shared/ |
| `server/` | API, auth, storage | shared/ |
| `shared/` | Types, schemas | (none) |

Cross-cutting concerns:
- Types flow from shared → client, server
- No direct client → server imports

## References

- Repo layout: `31-repo-layout.md`
- API routes: `32-api-routes-reference.md`
- Database schema: `33-database-schema-reference.md`
- Auth: `34-auth-replit-oidc-and-fallbacks.md`
- AI: `35-ai-provider-ladder.md`
