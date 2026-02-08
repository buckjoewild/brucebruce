# Healthchecks and basic monitoring

**Audience:** Operators  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Document how to verify system health.

## Health endpoint

### GET /api/health

Returns system status:

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "ok",
  "database": "connected",
  "ai_provider": "gemini",
  "ai_status": "online"
}
```

### Response fields

| Field | Values | Meaning |
|-------|--------|---------|
| `status` | `ok`, `degraded`, `error` | Overall status |
| `database` | `connected`, `disconnected` | DB connection |
| `ai_provider` | `gemini`, `openrouter`, `off` | Configured provider |
| `ai_status` | `online`, `offline` | AI availability |

### Status interpretation

| Scenario | status | database | ai_status |
|----------|--------|----------|-----------|
| Everything working | ok | connected | online |
| DB down | error | disconnected | - |
| AI disabled | ok | connected | offline |
| AI provider issue | degraded | connected | offline |

## Smoke test script

Run the full smoke test:

```bash
./scripts/smoke-test.sh
```

Tests:
1. Health endpoint returns 200
2. Health JSON has required fields
3. Auth endpoint responds
4. Frontend HTML loads
5. Export endpoint responds (may require auth)
6. Weekly review endpoint responds (may require auth)

## Docker healthcheck

The database container has a built-in healthcheck:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 5s
  timeout: 5s
  retries: 5
```

Check container health:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

Output:
```
NAMES                          STATUS
harriswildlands-app-1          Up 2 hours
harriswildlands-db-1           Up 2 hours (healthy)
```

## Manual verification checklist

### Daily (optional)
- [ ] App loads in browser
- [ ] Can create a log entry
- [ ] Health endpoint returns OK

### Weekly (recommended)
- [ ] Run smoke test script
- [ ] Check Docker container status
- [ ] Verify export works

### After updates
- [ ] Health endpoint returns OK
- [ ] Smoke test passes
- [ ] Data is intact (check an existing entry)

## Log inspection

### Application logs
```bash
docker compose logs app
docker compose logs app --tail 100  # Last 100 lines
docker compose logs app -f          # Follow (live)
```

### Database logs
```bash
docker compose logs db
```

### Common log patterns

**Healthy startup:**
```
app-1  | ready on port 5000
db-1   | database system is ready to accept connections
```

**Database connection error:**
```
app-1  | Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Missing environment variable:**
```
app-1  | Warning: SESSION_SECRET not set
```

## Alerting (future)

Currently no built-in alerting. Options for self-hosted monitoring:

- **Uptime Kuma:** Simple uptime monitoring
- **Healthchecks.io:** Cron job monitoring
- **Simple cron script:** Curl health endpoint, email on failure

Example cron monitoring:
```bash
*/5 * * * * curl -sf http://localhost:5000/api/health || echo "Health check failed" | mail -s "BruceOps Alert" you@email.com
```

## References

- Troubleshooting: `10-user-guide/16-troubleshooting.md`
- Disaster recovery: `26-disaster-recovery.md`
- Smoke test: `scripts/smoke-test.sh`
