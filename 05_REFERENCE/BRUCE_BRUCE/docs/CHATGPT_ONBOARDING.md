# HarrisWildlands — ChatGPT Onboarding

Purpose: bring an assistant up to speed on what has been built and how it operates so far. This document summarizes architecture, key files, runtime workflows, conventions, and practical examples.

---

## High-level architecture

- Single full-stack repository combining an Express server and a Vite React client.
- The server both exposes a JSON API under `/api/*` and — in development — mounts the Vite client as middleware so API + client run on the same process.
- The `shared/` folder defines the API contract (Zod schemas + helper `buildUrl`) that both client and server import to keep types in sync.

Key responsibilities:
- `server/`: API handlers, authentication, AI integration, storage layer, and static serving in production.
- `client/`: React UI built with Vite and Tailwind — hooks call the API directly and validate responses against `shared/routes.ts`.
- `shared/`: Zod-first API contract and DB schema types used across both runtimes.

Core files (start here):
- `server/index.ts` — server entry, request logging, Vite setup in dev, static serving in production.
- `server/routes.ts` — route registration, CORS, rate-limits, AI call wrappers, and the majority of API endpoints.
- `server/storage.ts` — `IStorage` implementation with user-scoped database access.
- `server/replit_integrations/replitAuth.ts` — session handling and Replit OIDC integration plus standalone mode.
- `shared/routes.ts` — API contract: endpoints, HTTP methods, input and response Zod schemas, and `buildUrl` helper.
- `shared/schema.ts` — database table schemas and TypeScript types (drizzle + Zod).
- `client/src/hooks/use-bruce-ops.ts` — example client-side usage of `@shared/routes` and hook patterns.
- `script/build.ts` — production build: `vite build` then `esbuild` server bundle with an allowlist to reduce cold-start syscalls.

## Runtime & developer workflows

Scripts in `package.json`:

- `npm run dev` — Development: runs `tsx server/index.ts`. Server sets up Vite middleware so both client and API are available on `PORT` (default 5000).
- `npm run build` — Production build: runs `script/build.ts` to build client and bundle server into `dist/index.cjs`.
- `npm run start` — Run production bundle (`NODE_ENV=production node dist/index.cjs`).
- `npm run check` — `tsc` type check.
- `npm run db:push` — Run `drizzle-kit` migrations/push.

Windows notes: package scripts set env vars inline (POSIX). On PowerShell use:

```powershell
$env:NODE_ENV='production'
npm run start
```

Or use WSL / cross-env for cross-platform scripts.

## Environment variables (important)

- `PORT` — listening port (default 5000)
- `NODE_ENV` — `production` disables Vite and enables static serving
- `DATABASE_URL` — Postgres connection string (used for session store and DB)
- `SESSION_SECRET` — session secret for express-session
- `AI_PROVIDER` — `off` / `gemini` / `openrouter` (controls AI ladder)
- `GOOGLE_GEMINI_API_KEY` — Gemini key (if using Gemini)
- `OPENROUTER_API_KEY` — OpenRouter key (if using OpenRouter)
- `STANDALONE_MODE`, `REPL_ID`, `ISSUER_URL` — control Replit OIDC vs standalone auto-login behavior

## Authentication patterns

- Dual-mode auth: the server supports either a session-based user (web UI / Replit OIDC) or Bearer token auth intended for programmatic clients (MCP / desktop integrators).
- `server/replit_integrations/replitAuth.ts`:
  - Standalone mode: when `STANDALONE_MODE=true` or Replit variables are absent, the server auto-injects a `standalone-user` into every request (useful for local dev/self-host).
  - Replit OIDC: when Replit env vars exist, the code uses OpenID-Client passport strategy and persists sessions (Postgres-backed store if `DATABASE_URL` provided).
- Token auth: `server/routes.ts` exposes token generation under `/api/settings/tokens` (session-only for creation) and validates token usage in `authenticateToken`.
- `authenticateDual` middleware allows routes to accept either session or Bearer token. When adding endpoints, use `authenticateDual` if the endpoint should be accessible by both web and programmatic clients.

## AI integration

- AI provider ladder located near the top of `server/routes.ts`.
  - Environment `AI_PROVIDER` may set preferred provider; fallback ladder prefers Gemini then OpenRouter when keys present.
  - Exposes helper functions `callGemini`, `callOpenRouterAPI`, `callAI`, `callAIWithFullPrompt` used by multiple endpoints.
- Rate-limited: AI endpoints are wrapped with a stricter rate limit (10 req/min) compared to general endpoints (100 req/15min).
- Caching pattern: heavy AI outputs (weekly insights, some summaries) are cached into `settings` (see weekly insight generation); follow this pattern to avoid unnecessary AI calls and hitting rate limits or costs.
- When adding AI usage:
  - Use `callAI(...)` helper to respect provider ladder and fallback logic.
  - If results are expensive or repeated, persist them via `storage.updateSetting` or another caching store keyed by user and date.

## Storage & DB patterns

- `server/storage.ts` implements `IStorage` using `drizzle-orm`. Important patterns:
  - All user-scoped queries filter on `userId` — do not allow direct updates that switch `userId`.
  - Update helpers intentionally strip `userId` from client-provided payloads to prevent ownership changes.
  - Use `db.insert(...).returning()` for new rows and `db.update(...).where(...).returning()` for updates.
- Schemas & types live in `shared/schema.ts` and are referenced in `shared/routes.ts` for API contract validation.

## Client patterns

- Client hooks (e.g., `client/src/hooks/use-bruce-ops.ts`) import `api` and `buildUrl` from `@shared/routes` and validate responses with `api.*.responses[200].parse(...)`.
- Demo mode: UI includes demo fallbacks (`isDemoMode`, `demoLogs`, etc.) to simplify development without a full stack or auth.

## Rate limiting, CORS, and request logging

- CORS and headers are configured in `server/routes.ts` (allowed origins include localhost and `claude.ai`). Modify carefully.
- Rate limiting is created via `express-rate-limit`: general limiter (100/15min) applied to `/api/`; AI limiter (10/min) applied to `/api/ai/`.
- Request logging: `server/index.ts` wraps responses to capture JSON responses for `/api` logs; useful for debugging request/response flows.

## Adding a new endpoint — recommended steps

1. Add Zod input/response shapes and (optionally) DB types in `shared/schema.ts`.
2. Add endpoint entry to `shared/routes.ts` with `method`, `path`, `input` and `responses`.
3. Implement server handler in `server/routes.ts` following existing patterns:
   - Use `authenticateDual` or `isAuthenticated` as appropriate.
   - Parse input with `api.<name>.<action>.input.parse(req.body)` and handle `z.ZodError` returning 400.
   - Use `storage` methods for DB access — add to `IStorage` and `server/storage.ts` if needed for new tables.
   - For AI-powered endpoints use `callAI(...)` and cache heavy results in `settings` if repeated.
4. Add client hook in `client/src/hooks` that consumes the `shared/routes.ts` entry and uses React Query for caching/invalidation.

Example (high level): to add `/api/notes`:
- Add `notes` table/type in `shared/schema.ts`.
- Add `api.notes.list` and `api.notes.create` to `shared/routes.ts`.
- Implement handlers in `server/routes.ts` that call `storage.getNotes(userId)` and `storage.createNote(userId, input)`.
- Add `useNotes` and `useCreateNote` in `client/src/hooks` using `api.notes.*` validators.

## Production build & bundling

- `script/build.ts` runs `vite build` and then bundles the server with `esbuild` into `dist/index.cjs`.
- To reduce cold start syscalls the script keeps an `allowlist` of server dependencies to bundle; other dependencies are externalized. Do not change the allowlist without understanding cold start trade-offs.

## Debugging tips

- Local dev: run `npm run dev` and open `http://localhost:5000` (or `PORT` used). Server logs include structured timing info for `/api` routes.
- Use the logging wrapper in `server/index.ts` to inspect the JSON response captured in logs.
- If sessions behave oddly, check `DATABASE_URL` and the session store selection in `server/replit_integrations/replitAuth.ts`.
- For AI provider failures, check `server/routes.ts` logs indicating which provider failed and whether a fallback occurred.

## Security & operational cautions

- Never commit `SESSION_SECRET`, API keys, or `DATABASE_URL` to source control.
- Standalone mode uses a persistent `standalone-user` and an in-memory session store when `DATABASE_URL` is absent — not secure for multi-user production.
- Token management endpoints are created via session-authenticated routes; tokens grant full access to user data — treat them as secrets.

## Files & locations quick map

- `server/index.ts` — server entry and logging
- `server/routes.ts` — API handlers, AI integration, CORS, rate-limits, authenticateDual
- `server/storage.ts` — DB access abstraction and defensive patterns
- `server/db.ts` — DB client initialization (drizzle)
- `server/replit_integrations/replitAuth.ts` — session & OIDC
- `shared/routes.ts` — API contract (Zod) and `buildUrl`
- `shared/schema.ts` — DB table definitions and types
- `client/src/hooks/use-bruce-ops.ts` — client usage patterns and validation
- `script/build.ts` — build orchestration for prod

---

If you want, I can:
- expand the auth section into a step-by-step dev guide for local Replit OIDC or standalone configuration,
- add a concrete endpoint example with full server + shared + client code,
- or produce a one-page Windows dev checklist with copy-paste commands.

Tell me which of those to produce next.
