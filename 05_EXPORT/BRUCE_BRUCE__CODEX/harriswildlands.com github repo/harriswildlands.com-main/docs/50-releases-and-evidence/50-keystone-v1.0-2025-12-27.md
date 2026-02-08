# Keystone v1.0 (2025-12-27)

**Type:** Release artifact  
**Status:** VERIFIED  
**Date:** December 27, 2025

## Overview

This is the v1.0 keystone release of BruceOps / HarrisWildlands.

### What's included

| Component | Status |
|-----------|--------|
| LifeOps (daily logging) | Complete |
| ThinkOps (ideas pipeline) | Complete |
| Weekly Review | Complete |
| Export | Complete |
| AI Integration | Complete |
| Standalone mode | Complete |
| Documentation | Complete |

### What's pending

| Component | Status |
|-----------|--------|
| PDF export | TBD |
| Data import/restore | TBD |
| Account deletion | TBD |

## Deployment options

### Option 1: Replit (recommended for quick start)

The app is deployed on Replit at: https://harriswildlands.com

Features:
- Automatic HTTPS
- Replit OIDC authentication
- Managed PostgreSQL

### Option 2: Docker (recommended for privacy)

```bash
git clone https://github.com/buckjoewild/harriswildlands.com.git
cd harriswildlands.com
cp .env.example .env
docker compose up
```

Features:
- Local data storage
- Standalone mode (auto-login)
- Full control

## Verification evidence

### M1 Verification (Phase 1)

| Item | Result | Evidence |
|------|--------|----------|
| Docker start | VERIFIED (config) | Dockerfile + docker-compose.yml properly configured |
| DB persistence | VERIFIED (config) | Volume configured, tested in Replit dev |
| Production build | PASS | `npm run build` completes successfully |
| Demo mode | RESOLVED | Two modes documented (STANDALONE vs ?demo) |
| Smoke test | PASS | All 6 tests pass |

### Smoke test results

```
Test 1: Health Endpoint - PASSED
Test 2: Health Fields - PASSED
Test 3: Auth Status - PASSED
Test 4: Frontend - PASSED
Test 5: Export Endpoint - PASSED
Test 6: Weekly Review - PASSED
```

## Core architecture

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Tailwind, shadcn/ui |
| Backend | Express, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| AI | Gemini / OpenRouter (optional) |
| Auth | Replit OIDC / Standalone mode |

## Key design decisions

1. **Shared schema** - Types defined once in `shared/schema.ts`
2. **User-scoped data** - All entities include userId
3. **AI optional** - Core features work without AI
4. **Standalone-first** - Runs locally without cloud dependencies
5. **Privacy by default** - No sharing, no analytics

## Four lanes

| Lane | Purpose | Status |
|------|---------|--------|
| LifeOps | Daily calibration, logs, habits | Complete |
| ThinkOps | Ideas, reality checks, pipeline | Complete |
| Teaching Assistant | Lesson plan generation | Complete |
| HarrisWildlands | Brand content generation | Complete |

## Documentation structure

```
docs/
├── 00-start-here/           (2 files)
├── 10-user-guide/           (7 files)
├── 20-operator-guide/       (7 files)
├── 30-developer-reference/  (7 files)
├── 40-protocols-and-governance/ (4 files)
└── 50-releases-and-evidence/    (3 files)
```

Total: 30 documentation files

## Known issues

1. PDF export not yet implemented (returns text)
2. Data import/restore not yet implemented
3. Account deletion not yet implemented

## Upgrade path

For future versions:
1. Check changelog: `52-changelog.md`
2. Backup data before updating
3. Run `git pull && docker compose up --build`

## References

- Acceptance checklist: `51-acceptance-test-checklist.md`
- Changelog: `52-changelog.md`
- Architecture: `30-developer-reference/30-architecture-overview.md`
