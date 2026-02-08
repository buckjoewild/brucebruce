# Copilot / AI Agent Instructions — HarrisWildlands

Purpose: quickly orient an AI coding assistant to be productive in this repository.

- **Big picture:** this is a single Node + Vite application where the `server/` process both exposes a JSON API under `/api/*` and (in dev) mounts a Vite-powered client. The runtime entry is `server/index.ts` which conditionally sets up Vite in development and serves static files in production.

- **Key folders/files:**
  - `server/` — application server and API (entry: server/index.ts)
  - `client/` — React UI (Vite + Tailwind)
  - `shared/` — TypeScript schemas and `@shared` API contracts used by both client and server (`shared/routes.ts`, `shared/schema.ts`)
  - `script/build.ts` — production build: runs `vite build` then bundles the server with `esbuild` into `dist/index.cjs`
  - `package.json` — useful scripts: `dev`, `build`, `start`, `check`, `db:push`

- **Run / build workflow (exact):**
  - Development: `npm run dev` — uses `tsx` to run `server/index.ts` (dev mode: server spins up Vite middleware).
  - Build: `npm run build` — runs `script/build.ts` (bundles client via Vite, then server via esbuild).
  - Start (prod): `npm run start` — runs `dist/index.cjs` (expects `NODE_ENV=production`).
  - DB migrations: `npm run db:push` (uses `drizzle-kit`).

- **Notable environment variables** (search `server/` to find usages):
  - `PORT` — server listens on this port (default 5000).
  - `NODE_ENV` — switches dev vs production behavior (Vite is only enabled when not `production`).
  - `DATABASE_URL`, `SESSION_SECRET` — used by auth/session and DB-backed session store.
  - `AI_PROVIDER`, `GOOGLE_GEMINI_API_KEY`, `OPENROUTER_API_KEY` — AI features and provider selection live in `server/routes.ts`.
  - `STANDALONE_MODE`, `REPL_ID`, `ISSUER_URL` — control Replit OIDC / standalone auth behavior in `server/replit_integrations`.

- **Architectural patterns and conventions to respect:**
  - API contract lives in `shared/routes.ts` (Zod schemas). The server validates inputs using those schemas and the client uses the same contract to parse responses. Keep `shared/*` in sync when changing endpoints.
  - Authentication is dual-mode: session-based Replit OIDC (see `server/replit_integrations/replitAuth.ts`) plus Bearer token auth for programmatic clients. Many endpoints accept either (see `authenticateDual` in `server/routes.ts`).
  - AI calls are centralized in `server/routes.ts` (functions: `callGemini`, `callOpenRouterAPI`, `callAI*`). The code implements a provider ladder and fallbacks — be careful when editing provider logic.
  - Rate limiting is applied server-side: general (100/15min) and AI-specific (10/min) limits are declared near route registration. Avoid adding heavy per-request AI calls without caching.
  - Defensive DB patterns: `server/storage.ts` enforces user-scoped queries (strip `userId` from updates) — follow that pattern for new storage methods.

- **Cross-cutting conventions**
  - Path aliases: `@shared/*` and `@/*` (client) are defined in `tsconfig.json` — import using these aliases.
  - Zod-first API design: inputs and outputs are typed/validated in `shared/schema.ts` and `shared/routes.ts`; use these types in server handlers and client hooks (`client/src/hooks/use-bruce-ops.ts`).

- **Windows notes:** `package.json` scripts set env vars like `NODE_ENV=production` inline (POSIX syntax). On Windows use PowerShell/WSL or prefix appropriately (e.g., in PowerShell: `$env:NODE_ENV='production'; npm run start`) or install `cross-env` if adding cross-platform scripts.

- **Quick code pointers / places to inspect for changes**
  - API surface & validation: `shared/routes.ts`, `shared/schema.ts`
  - Server entry / lifecycle: `server/index.ts` (vite toggling, port, logging)
  - Route-level AI behavior, CORS and rate-limits: `server/routes.ts`
  - Auth and session behavior: `server/replit_integrations/*` (standalone mode vs Replit OIDC)
  - Storage / DB access patterns: `server/storage.ts`, `server/db.ts`
  - Production build & bundling rationale: `script/build.ts` (server deps allowlist and esbuild config)

- **Examples to follow**
  - For new endpoints: add contract to `shared/routes.ts` with Zod schemas, validate on the server using the `api.*.input.parse(...)` pattern, and consume from the client using `api.*.responses[...]` parsers (see `client/src/hooks/use-bruce-ops.ts`).
  - For AI features: respect the provider ladder and caching expectations; heavy responses should be cached in `settings`/`storage` where existing endpoints do so (weekly insight caching, token previews, etc.).

- **What NOT to change without caution**
  - The shared API contract shapes in `shared/` (client + server rely on them).
  - Session/auth flow in `server/replit_integrations/replitAuth.ts` unless you understand Replit OIDC and standalone fallback.
  - `script/build.ts` server bundle allowlist — it's tuned to reduce cold-start syscalls.

If any section is unclear or you'd like more examples (end-to-end changes, new endpoint template, or how to run locally on Windows), tell me which area and I'll expand or add snippets.
