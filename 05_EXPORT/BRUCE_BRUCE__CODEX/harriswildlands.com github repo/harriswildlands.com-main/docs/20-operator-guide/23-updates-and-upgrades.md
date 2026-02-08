# Updates and upgrades

**Audience:** Operators  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Guide for keeping the deployment up to date.

## Update types

| Type | Frequency | Risk | Procedure |
|------|-----------|------|-----------|
| **Patch** (bug fixes) | As needed | Low | Standard update |
| **Feature** (new features) | Occasional | Low-Medium | Standard update |
| **Breaking** (schema changes) | Rare | Medium | Review changelog first |

## Standard update procedure

### Step 1: Backup (recommended)

```bash
# Export user data
curl http://localhost:5000/api/export/data > backup-$(date +%Y%m%d).json

# Or full database backup
docker compose exec db pg_dump -U postgres pgbruce > backup-$(date +%Y%m%d).sql
```

### Step 2: Pull latest code

```bash
git pull origin main
```

### Step 3: Check changelog

Review `docs/50-releases-and-evidence/52-changelog.md` for:
- Breaking changes
- Migration requirements
- New environment variables

### Step 4: Rebuild and restart

```bash
docker compose up --build
```

### Step 5: Verify

```bash
# Health check
curl http://localhost:5000/api/health

# Smoke test
./scripts/smoke-test.sh

# Check your data is intact
# Open browser and verify entries exist
```

## Handling breaking changes

If the changelog mentions breaking changes:

1. **Read the migration notes carefully**
2. **Backup before proceeding**
3. **Follow any migration scripts provided**
4. **Test in a separate environment if possible**

### Database migrations

Drizzle ORM handles schema changes automatically on startup.

If you see migration errors:
1. Check the error message
2. Consult the changelog
3. Manual intervention may be required for data migrations

## Rollback procedure

If an update causes problems:

### Option 1: Git revert

```bash
git log --oneline -5  # Find previous commit
git checkout <previous-commit>
docker compose up --build
```

### Option 2: Restore from backup

```bash
# Stop the app
docker compose down

# Restore database
docker compose up -d db
docker compose exec -T db psql -U postgres pgbruce < backup.sql

# Restart app
docker compose up
```

## Version checking

Current version information:
```bash
# Git commit
git rev-parse --short HEAD

# Health endpoint (includes version info)
curl http://localhost:5000/api/health
```

## Automation (optional)

For automated updates, consider:

### Watchtower (Docker auto-update)

Not recommended for this project since we build locally.

### Cron-based update script

```bash
#!/bin/bash
cd /path/to/harriswildlands.com
git pull
docker compose up --build -d
```

**Caution:** Automated updates can introduce breaking changes. Manual updates recommended.

## References

- Changelog: `50-releases-and-evidence/52-changelog.md`
- Disaster recovery: `26-disaster-recovery.md`
- Data persistence: `22-data-storage-and-persistence.md`
