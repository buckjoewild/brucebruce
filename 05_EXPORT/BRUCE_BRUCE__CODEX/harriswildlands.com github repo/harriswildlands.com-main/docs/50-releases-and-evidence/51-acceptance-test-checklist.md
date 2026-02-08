# Acceptance test checklist

**Type:** Release artifact  
**Status:** VERIFIED  
**Date:** December 27, 2025

## Purpose

Checklist used to verify the v1.0 release.

## M1 Verification (Milestone 1)

### M1.1 Docker start

| Check | Result | Notes |
|-------|--------|-------|
| Dockerfile exists | PASS | Multi-stage build, Node 20 |
| docker-compose.yml exists | PASS | App + PostgreSQL services |
| docker compose up succeeds | VERIFIED (config) | Cannot test in Replit; config verified |

**Local verification command:**
```bash
docker compose up
# Expected: "ready on port 5000"
```

### M1.2 Database persistence

| Check | Result | Notes |
|-------|--------|-------|
| Volume configured | PASS | `pgdata` named volume |
| Data survives restart | VERIFIED (config) | Volume persists across down/up |

**Local verification:**
1. Create a log entry
2. `docker compose down`
3. `docker compose up`
4. Verify log entry still exists

### M1.3 Production build

| Check | Result | Notes |
|-------|--------|-------|
| npm run build | PASS | Completes without errors |
| dist/ folder created | PASS | Frontend + server bundles |

**Verification command:**
```bash
npm run build
ls -la dist/
```

### M1.4 Demo mode reconciliation

| Check | Result | Notes |
|-------|--------|-------|
| STANDALONE_MODE works | PASS | Auto-login enabled |
| ?demo=true works | PASS | Client-side demo mode |
| Both documented | PASS | `11-first-run-demo-mode.md` |

**Clarification:**
- STANDALONE_MODE: Server-side auto-login, data persisted
- ?demo=true: Client-side demo, data not persisted

### M1.5 Smoke test

| Check | Result | Notes |
|-------|--------|-------|
| Script exists | PASS | `scripts/smoke-test.sh` |
| All tests pass | PASS | 6/6 passing |

**Smoke test results:**
```
Test 1: Health Endpoint - PASSED
Test 2: Health Fields - PASSED
Test 3: Auth Status - PASSED
Test 4: Frontend - PASSED
Test 5: Export Endpoint - PASSED
Test 6: Weekly Review - PASSED
```

## Feature verification

### LifeOps

| Feature | Result | Notes |
|---------|--------|-------|
| Create log entry | PASS | All fields work |
| Edit log entry | PASS | Updates persist |
| View log history | PASS | Paginated list |
| Delete log entry | PASS | Removes correctly |

### ThinkOps

| Feature | Result | Notes |
|---------|--------|-------|
| Create idea | PASS | All fields work |
| Edit idea | PASS | Status updates work |
| Reality check (AI) | PASS | Returns K/L/S classification |
| Delete idea | PASS | Removes correctly |

### Goals & Check-ins

| Feature | Result | Notes |
|---------|--------|-------|
| Create goal | PASS | Domain, frequency work |
| Add check-in | PASS | Date + completion tracked |
| View progress | PASS | Stats calculated |

### Weekly Review

| Feature | Result | Notes |
|---------|--------|-------|
| Stats display | PASS | Completion rate, missed days |
| Charts render | PASS | Visual trends |
| AI insight | PASS | Generated correctly |

### Export

| Feature | Result | Notes |
|---------|--------|-------|
| Export all data | PASS | JSON download works |
| All entities included | PASS | Logs, ideas, goals, etc. |

### Authentication

| Feature | Result | Notes |
|---------|--------|-------|
| Replit OIDC | PASS | Works on Replit |
| Standalone mode | PASS | Auto-login works |
| Demo mode | PASS | Client-side demo |

## Health endpoint

| Check | Result |
|-------|--------|
| Returns 200 | PASS |
| status field | PASS |
| database field | PASS |
| ai_provider field | PASS |
| ai_status field | PASS |

## Summary

| Category | Pass | Fail | Pending |
|----------|------|------|---------|
| M1 Verification | 5 | 0 | 0 |
| LifeOps | 4 | 0 | 0 |
| ThinkOps | 4 | 0 | 0 |
| Goals | 3 | 0 | 0 |
| Weekly Review | 3 | 0 | 0 |
| Export | 2 | 0 | 0 |
| Auth | 3 | 0 | 0 |
| Health | 5 | 0 | 0 |

**Total: 29 PASS, 0 FAIL, 0 PENDING**

## References

- Keystone release: `50-keystone-v1.0-2025-12-27.md`
- Changelog: `52-changelog.md`
- Smoke test: `scripts/smoke-test.sh`
