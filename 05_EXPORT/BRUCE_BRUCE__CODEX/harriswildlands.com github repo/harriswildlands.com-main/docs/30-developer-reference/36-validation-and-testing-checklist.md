# Validation and testing checklist

**Audience:** Developers  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Checklist for validating changes before deployment.

## Pre-commit checklist

### Code quality

- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] No console.log statements left in production code
- [ ] Zod schemas updated if data model changed
- [ ] API routes have proper error handling

### Frontend

- [ ] Forms validate correctly (test with invalid input)
- [ ] Loading states shown during API calls
- [ ] Error states handled gracefully
- [ ] Works in both light and dark mode
- [ ] Mobile responsive (if applicable)

### Backend

- [ ] New endpoints have authentication checks
- [ ] Storage operations use typed schemas
- [ ] Errors return proper HTTP status codes
- [ ] Logging added for debugging (but no sensitive data)

## Build verification

```bash
# Full build test
npm run build

# Should complete without errors
# Check dist/ folder is created
```

## Smoke test

Run the smoke test script:

```bash
./scripts/smoke-test.sh
```

Expected: All 6 tests pass

### Manual smoke test

1. [ ] Health endpoint: `curl http://localhost:5000/api/health`
2. [ ] Frontend loads: Open browser to http://localhost:5000
3. [ ] Create a log entry
4. [ ] View ideas list
5. [ ] Export data works
6. [ ] (If AI configured) Chat responds

## Database changes

If schema changed:

1. [ ] Schema updated in `shared/schema.ts`
2. [ ] Insert schema updated with `.omit()` for auto-fields
3. [ ] Storage interface updated in `server/storage.ts`
4. [ ] Run `npx drizzle-kit push` to sync
5. [ ] Test with existing data (backwards compatibility)

## Auth changes

If authentication modified:

1. [ ] Test Replit OIDC flow (if in Replit)
2. [ ] Test standalone mode: `STANDALONE_MODE=true`
3. [ ] Test demo mode: `?demo=true`
4. [ ] Verify session persistence after restart

## AI changes

If AI features modified:

1. [ ] Test with `AI_PROVIDER=gemini`
2. [ ] Test with `AI_PROVIDER=openrouter`
3. [ ] Test with `AI_PROVIDER=off` (graceful degradation)
4. [ ] Verify error handling when API fails

## Docker verification

```bash
# Full Docker test
docker compose down
docker compose up --build

# Verify:
# - Containers start without errors
# - Health endpoint works
# - Data persists after restart
```

## Regression testing

After changes, verify:

1. [ ] LifeOps: Create, edit, delete log
2. [ ] ThinkOps: Create, edit, delete idea
3. [ ] Goals: Create goal, add check-in
4. [ ] Weekly review: Stats display correctly
5. [ ] Export: JSON download works
6. [ ] Settings: Theme toggle works

## Performance check

- [ ] Page loads in < 2 seconds
- [ ] API responses in < 500ms
- [ ] No memory leaks (check Docker stats)
- [ ] Database queries are efficient (no N+1)

## Security check

- [ ] No secrets in code or logs
- [ ] No sensitive data in error messages
- [ ] Auth required on protected routes
- [ ] Input validation on all endpoints

## Documentation

If user-facing changes:

- [ ] Update relevant docs in `docs/`
- [ ] Update `replit.md` if architecture changed
- [ ] Add entry to `docs/50-releases-and-evidence/52-changelog.md`

## Deployment

After all checks pass:

1. [ ] Commit with descriptive message
2. [ ] Push to main branch
3. [ ] Verify Replit auto-deploys (if using Replit)
4. [ ] Or `docker compose up --build` for self-hosted

## Rollback plan

If issues after deployment:

1. Check logs: `docker compose logs app`
2. Rollback to previous commit: `git checkout <commit>`
3. Rebuild: `docker compose up --build`
4. Restore from backup if data issues

## References

- Smoke test script: `scripts/smoke-test.sh`
- Disaster recovery: `20-operator-guide/26-disaster-recovery.md`
- Acceptance checklist: `50-releases-and-evidence/51-acceptance-test-checklist.md`
