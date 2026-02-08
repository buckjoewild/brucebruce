# VOLUME 16: MAINTENANCE GUIDE

**HarrisWildlands.com Technical Project Manual**  
**Version:** 1.0.0  
**Generated:** December 28, 2025

---

## 16.1 Daily Maintenance

### Health Check

```bash
curl http://localhost:5000/api/health
```

Verify:
- status: "ok"
- database: "connected"
- ai_status: "active" (if enabled)

### Log Review

```bash
# Docker
docker compose logs --tail=100 app

# Check for errors
docker compose logs app | grep -i error
```

---

## 16.2 Weekly Maintenance

### Database Cleanup

```sql
-- Remove old sessions (older than 30 days)
DELETE FROM session WHERE expire < NOW() - INTERVAL '30 days';

-- Count records by table
SELECT 'logs' as table_name, COUNT(*) FROM logs
UNION SELECT 'ideas', COUNT(*) FROM ideas
UNION SELECT 'goals', COUNT(*) FROM goals
UNION SELECT 'checkins', COUNT(*) FROM checkins;
```

### Cache Cleanup

```sql
-- Remove old AI insight caches (older than 7 days)
DELETE FROM settings WHERE key LIKE 'weekly-insight-%' 
AND key < CONCAT('weekly-insight-', (CURRENT_DATE - INTERVAL '7 days')::text);
```

### Backup

```bash
# Docker
docker compose exec db pg_dump -U postgres harriswildlands > backup-$(date +%Y%m%d).sql

# Compress
gzip backup-*.sql
```

---

## 16.3 Monthly Maintenance

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities (if safe)
npm audit fix
```

### Database Vacuum

```sql
VACUUM ANALYZE;
```

### Storage Review

```bash
# Docker volume size
docker system df -v

# Database size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size('harriswildlands'));"
```

---

## 16.4 Backup Strategy

### Full Backup

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d)
BACKUP_DIR=/backups

# Database backup
docker compose exec -T db pg_dump -U postgres harriswildlands > $BACKUP_DIR/db-$DATE.sql

# Compress
gzip $BACKUP_DIR/db-$DATE.sql

# Keep last 30 days
find $BACKUP_DIR -name "db-*.sql.gz" -mtime +30 -delete
```

### Restore Procedure

```bash
# Stop app
docker compose stop app

# Restore database
gunzip -c backup-20251228.sql.gz | docker compose exec -T db psql -U postgres harriswildlands

# Start app
docker compose start app
```

### Export User Data

```bash
# API endpoint for user self-service
curl http://localhost:5000/api/export/data \
  -H "Cookie: connect.sid=SESSION" \
  -o user-data-export.json
```

---

## 16.5 Monitoring

### Key Metrics

| Metric | Check | Alert If |
|--------|-------|----------|
| Health status | Every 5 min | Not "ok" |
| Database connections | Every 5 min | > 80% pool |
| Response time | Every request | > 1s (non-AI) |
| Error rate | Rolling 5 min | > 1% |
| Disk usage | Every hour | > 80% |

### Simple Monitoring Script

```bash
#!/bin/bash
# monitor.sh
while true; do
  HEALTH=$(curl -s http://localhost:5000/api/health | jq -r .status)
  if [ "$HEALTH" != "ok" ]; then
    echo "$(date) ALERT: Health check failed: $HEALTH"
    # Send notification
  fi
  sleep 300
done
```

---

## 16.6 Log Management

### Log Rotation (Docker)

```yaml
# docker-compose.yml addition
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Log Analysis

```bash
# Error count by day
docker compose logs app | grep -i error | cut -d' ' -f1 | sort | uniq -c

# Most common errors
docker compose logs app | grep -i error | sort | uniq -c | sort -rn | head -10
```

---

## 16.7 Update Procedures

### Application Update

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Sync database
npm run db:push

# Restart
# Replit: Restart workflow
# Docker: docker compose up -d --build
```

### Zero-Downtime Update (Docker)

```bash
# Build new image
docker compose build

# Stop and start (brief downtime)
docker compose up -d
```

### Rollback

```bash
# Git rollback
git checkout <previous-commit>

# Rebuild and restart
npm run build
docker compose up -d --build
```

---

## 16.8 Database Maintenance

### Check Table Sizes

```sql
SELECT 
  table_name,
  pg_size_pretty(pg_total_relation_size(table_name::text)) as size
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(table_name::text) DESC;
```

### Reindex

```sql
REINDEX DATABASE harriswildlands;
```

### Analyze Query Performance

```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = '1000';
SELECT pg_reload_conf();

-- Check slow queries
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 16.9 Security Maintenance

### Rotate Session Secret

1. Generate new secret
2. Update environment variable
3. Restart application
4. All users will be logged out

### Review Access

```sql
-- Count active sessions
SELECT COUNT(*) FROM session WHERE expire > NOW();

-- Active users
SELECT DISTINCT sess->>'passport' FROM session WHERE expire > NOW();
```

### Update Dependencies for Security

```bash
# Check vulnerabilities
npm audit

# Update with security fixes
npm audit fix

# Force update (may break)
npm audit fix --force
```

---

## 16.10 Disaster Recovery

### Complete System Loss

1. Provision new server/Replit
2. Clone repository
3. Configure environment variables
4. Restore database from backup
5. Verify with health check
6. Update DNS if needed

### Database Corruption

1. Stop application
2. Restore from last good backup
3. Verify data integrity
4. Start application
5. Test all features

### Compromised Credentials

1. Rotate SESSION_SECRET immediately
2. Rotate API keys
3. Review access logs
4. Notify affected users
5. Update environment variables

---

## 16.11 Maintenance Schedule

| Task | Frequency | Duration |
|------|-----------|----------|
| Health check | Daily | 1 min |
| Log review | Daily | 5 min |
| Session cleanup | Weekly | 2 min |
| Backup | Weekly | 5 min |
| Dependency update | Monthly | 30 min |
| Security audit | Monthly | 30 min |
| Database vacuum | Monthly | 10 min |

---

**Next Volume:** [VOL17 - Roadmap & Future](./VOL17_ROADMAP.md)
