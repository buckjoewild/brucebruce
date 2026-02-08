# Troubleshooting

**Audience:** End users  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Consolidate predictable beginner pitfalls into a checklist format.

## Quick fixes

Before diving into specific issues, try these:

1. **Restart the app:** `docker compose down && docker compose up`
2. **Rebuild:** `docker compose up --build`
3. **Check Docker is running:** Open Docker Desktop
4. **Clear browser cache:** Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Common issues

### "Cannot connect to http://localhost:5000"

**Symptoms:**
- Browser shows "connection refused"
- Page won't load

**Checklist:**
- [ ] Is Docker Desktop running?
- [ ] Did `docker compose up` complete without errors?
- [ ] Check terminal for "ready on port 5000" message
- [ ] Try another browser
- [ ] Check if another app is using port 5000

**Fix for port conflict:**
```bash
# Change the port in docker-compose.yml or use environment variable
PORT=3000 docker compose up
# Then access at http://localhost:3000
```

### "Docker compose up fails"

**Symptoms:**
- Error messages during startup
- Containers won't start

**Checklist:**
- [ ] Is Docker Desktop running?
- [ ] Do you have enough disk space?
- [ ] Try: `docker compose down && docker compose up --build`
- [ ] Check for port conflicts (5000, 5432)
- [ ] On Windows: Ensure WSL2 is properly configured

### "My data disappeared"

**Symptoms:**
- Logs/ideas are gone after restart
- Data doesn't persist

**Checklist:**
- [ ] Are you in demo mode? (Check for yellow banner)
- [ ] Did you use `docker compose down -v`? (This deletes volumes!)
- [ ] Is the database container running? `docker ps`
- [ ] Check Docker volume: `docker volume ls`

**Safe restart (preserves data):**
```bash
docker compose down    # Stops containers, keeps data
docker compose up      # Starts fresh, data intact
```

**Danger zone (deletes data):**
```bash
docker compose down -v  # DELETES ALL DATA!
```

### "I see a login screen"

**Symptoms:**
- Asked to log in when expecting standalone mode

**Checklist:**
- [ ] Is `STANDALONE_MODE=true` in your environment?
- [ ] Check docker-compose.yml has the environment variable
- [ ] Try adding `?demo=true` to the URL for evaluation

### "AI features aren't working"

**Symptoms:**
- Reality checks fail
- Weekly insights are empty
- AI summaries missing

**Checklist:**
- [ ] Is `AI_PROVIDER` set to `gemini` or `openrouter`?
- [ ] Is the API key valid?
- [ ] Check `/api/health` for `ai_status`

**Note:** AI is optional. Core logging works without it.

### "Export button does nothing"

**Symptoms:**
- No file downloads when exporting

**Checklist:**
- [ ] Are you logged in (or in standalone mode)?
- [ ] Check browser's download settings
- [ ] Try: `curl http://localhost:5000/api/export/data > backup.json`

### "Page is blank or broken"

**Symptoms:**
- White screen
- Console errors
- UI elements missing

**Checklist:**
- [ ] Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- [ ] Clear browser cache
- [ ] Try incognito/private window
- [ ] Check browser console (F12) for errors

## Health check

Test if the app is running correctly:

```bash
curl http://localhost:5000/api/health
```

Expected output:
```json
{
  "status": "ok",
  "database": "connected",
  "ai_provider": "off",
  "ai_status": "offline"
}
```

Or run the smoke test:
```bash
./scripts/smoke-test.sh
```

## Getting more help

If these don't solve your issue:

1. Check the logs: `docker compose logs`
2. Look for error messages in the terminal
3. Search for the error message online
4. Consider the [GitHub issues](https://github.com/buckjoewild/harriswildlands.com/issues)

## References

- Quickstart: `10-quickstart-standalone-docker.md`
- Health checks: `20-operator-guide/25-healthchecks-and-basic-monitoring.md`
- Data persistence: `20-operator-guide/22-data-storage-and-persistence.md`
