# VOLUME 14: TROUBLESHOOTING GUIDE

**HarrisWildlands.com Technical Project Manual**  
**Version:** 1.0.0  
**Generated:** December 28, 2025

---

## 14.1 Quick Diagnostics

### Health Check First

```bash
curl http://localhost:5000/api/health
```

**Healthy Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "ai_status": "active"
}
```

**Degraded Response:**
```json
{
  "status": "degraded",
  "database": "error"
}
```

---

## 14.2 Common Issues

### Database Connection Failed

**Symptom:**
```
Error: DATABASE_URL must be set
```

**Causes:**
1. Missing environment variable
2. Invalid connection string
3. Database server not running

**Solutions:**
```bash
# Check environment variable
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Docker: Check db service
docker compose ps db
docker compose logs db
```

### Port Already in Use

**Symptom:**
```
Error: EADDRINUSE: address already in use :::5000
```

**Solutions:**
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3000 npm run dev
```

### Build Fails

**Symptom:**
```
npm run build failed
```

**Solutions:**
```bash
# Check TypeScript errors
npm run check

# Clear cache and reinstall
rm -rf node_modules
npm install

# Check Node version
node --version  # Should be 20+
```

---

## 14.3 Authentication Issues

### Session Not Persisting

**Symptom:** User logged out after refresh

**Causes:**
1. SESSION_SECRET not set
2. PostgreSQL session store not connected
3. Cookie settings incorrect

**Solutions:**
```bash
# Check SESSION_SECRET
echo $SESSION_SECRET

# Check session table
psql $DATABASE_URL -c "SELECT COUNT(*) FROM session"

# Verify cookie in browser DevTools
# Should have: HttpOnly, Secure (in production)
```

### OIDC Callback Error

**Symptom:** Authentication fails after Replit login

**Causes:**
1. ISSUER_URL mismatch
2. Callback URL incorrect
3. Missing user table

**Solutions:**
```bash
# Check environment
echo $ISSUER_URL
echo $REPL_ID

# Verify user table exists
psql $DATABASE_URL -c "SELECT * FROM users LIMIT 1"
```

---

## 14.4 AI Feature Issues

### AI Insights Unavailable

**Symptom:**
```
"AI insights unavailable. Daily logging completed successfully."
```

**Causes:**
1. AI_PROVIDER set to "off"
2. Missing API key
3. API key invalid
4. Rate limit exceeded

**Solutions:**
```bash
# Check provider setting
echo $AI_PROVIDER

# Check API keys
echo $GOOGLE_GEMINI_API_KEY
echo $OPENROUTER_API_KEY

# Test Gemini directly
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$GOOGLE_GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### Reality Check Fails

**Symptom:** JSON parse error in reality check

**Causes:**
1. AI response not JSON
2. AI response truncated
3. Network timeout

**Solutions:**
- Check server logs for raw AI response
- Retry the request
- Verify API key limits

---

## 14.5 Frontend Issues

### Page Not Loading

**Symptom:** Blank page or error

**Solutions:**
```javascript
// Check browser console for errors
// Common issues:
// - Missing import
// - Type error
// - API endpoint 404
```

### Form Not Submitting

**Symptom:** Form button does nothing

**Debug:**
```javascript
// Add to form component
console.log(form.formState.errors);
```

**Common Causes:**
1. Validation error without visible message
2. Missing required field
3. Zod schema mismatch

### Query Not Updating

**Symptom:** Data stale after mutation

**Solution:**
```typescript
// Ensure cache invalidation
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['/api/resource'] });
}
```

---

## 14.6 Docker Issues

### Container Won't Start

**Symptom:**
```
docker compose up fails
```

**Solutions:**
```bash
# Check logs
docker compose logs

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up
```

### Database Not Ready

**Symptom:** App starts before database

**Solution:** Health check already configured, but verify:
```yaml
depends_on:
  db:
    condition: service_healthy
```

### Data Not Persisting

**Symptom:** Data lost after restart

**Solution:** Verify volume mount:
```yaml
volumes:
  - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

---

## 14.7 Performance Issues

### Slow Page Load

**Causes:**
1. Large query results
2. Missing indexes
3. Development mode

**Solutions:**
```bash
# Ensure production mode
NODE_ENV=production npm run start

# Check query performance
psql $DATABASE_URL -c "EXPLAIN ANALYZE SELECT * FROM logs WHERE user_id = 'xxx'"
```

### Memory Issues

**Symptom:** Out of memory errors

**Solutions:**
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run start

# Docker: Set memory limit
docker compose up --memory=2g
```

---

## 14.8 Schema Issues

### Column Not Found

**Symptom:**
```
Error: column "new_column" does not exist
```

**Solution:**
```bash
# Sync schema to database
npm run db:push
```

### Migration Conflict

**Symptom:** Schema push fails

**Solutions:**
```bash
# Check current schema
psql $DATABASE_URL -c "\d table_name"

# Force push (development only!)
npm run db:push -- --force
```

---

## 14.9 Logging

### Enable Debug Logging

```typescript
// In server code
console.log('Debug:', variable);

// Check logs
npm run dev 2>&1 | tee app.log
```

### Docker Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f db
```

---

## 14.10 Recovery Procedures

### Reset Database

```bash
# Docker
docker compose down -v
docker compose up

# Local
dropdb bruceops
createdb bruceops
npm run db:push
```

### Restore from Backup

```bash
# Docker
cat backup.sql | docker compose exec -T db psql -U postgres harriswildlands

# Local
psql $DATABASE_URL < backup.sql
```

### Clear Sessions

```sql
DELETE FROM session;
```

---

## 14.11 Support Checklist

When reporting issues, include:

- [ ] Health check response
- [ ] Error message (full)
- [ ] Browser console errors
- [ ] Server logs
- [ ] Node version (`node --version`)
- [ ] Environment (Replit/Docker/Local)
- [ ] Steps to reproduce

---

**Next Volume:** [VOL15 - Testing Guide](./VOL15_TESTING.md)
