# Disaster recovery

**Audience:** Operators  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Document what to do if things go wrong.

## Disaster scenarios

| Scenario | Severity | Recovery path |
|----------|----------|---------------|
| App won't start | Low | Troubleshoot or rollback |
| Database corruption | High | Restore from backup |
| Data accidentally deleted | High | Restore from backup |
| Machine failure | High | New machine + backup restore |
| Docker issues | Low | Rebuild containers |

## Prevention (backup strategy)

### Recommended backup schedule

| Backup type | Frequency | Retention |
|-------------|-----------|-----------|
| JSON export | Weekly (minimum) | Keep last 4 |
| pg_dump | Before updates | Keep last 2 |
| Volume snapshot | Monthly | Keep last 1 |

### Backup commands

**JSON export (user data):**
```bash
curl http://localhost:5000/api/export/data > backup-$(date +%Y%m%d).json
```

**Database dump (full):**
```bash
docker compose exec db pg_dump -U postgres pgbruce > backup-$(date +%Y%m%d).sql
```

**Volume backup:**
```bash
docker run --rm -v harriswildlands_pgdata:/data -v $(pwd):/backup \
  alpine tar czf /backup/pgdata-$(date +%Y%m%d).tar.gz -C /data .
```

## Recovery procedures

### Scenario: App won't start

1. Check logs:
   ```bash
   docker compose logs app
   ```

2. Common fixes:
   - Port conflict: Change port or stop conflicting service
   - Missing env vars: Check `.env` file
   - Database not ready: Wait or restart

3. Rebuild:
   ```bash
   docker compose down
   docker compose up --build
   ```

4. If still failing, rollback:
   ```bash
   git log --oneline -5
   git checkout <previous-working-commit>
   docker compose up --build
   ```

### Scenario: Database corruption

Symptoms:
- Errors about data integrity
- Missing tables
- Query failures

Recovery:
```bash
# Stop app
docker compose down

# Remove corrupted volume
docker volume rm harriswildlands_pgdata

# Start fresh database
docker compose up -d db

# Restore from backup
docker compose exec -T db psql -U postgres pgbruce < backup.sql

# Start app
docker compose up
```

### Scenario: Accidental data deletion

If you deleted data through the UI or API:

1. Check if you have a recent backup
2. Restore from backup (see above)
3. Note: Currently no "undo" feature in the app

If you ran `docker compose down -v`:

1. This deleted the database volume
2. Only recovery is from backup
3. If no backup exists, data is lost

### Scenario: Machine failure

1. Set up new machine with Docker
2. Clone repository:
   ```bash
   git clone https://github.com/buckjoewild/harriswildlands.com.git
   ```
3. Copy `.env` from backup or recreate
4. Restore database from backup:
   ```bash
   docker compose up -d db
   docker compose exec -T db psql -U postgres pgbruce < backup.sql
   docker compose up
   ```

### Scenario: Need to migrate to new server

Same as machine failure recovery, plus:

1. Export data from old server:
   ```bash
   docker compose exec db pg_dump -U postgres pgbruce > migration.sql
   ```

2. Copy to new server:
   ```bash
   scp migration.sql newserver:/path/to/
   ```

3. Import on new server (after setup):
   ```bash
   docker compose exec -T db psql -U postgres pgbruce < migration.sql
   ```

## Recovery testing

Periodically test your recovery process:

1. Take a backup
2. Set up a test environment (different directory or machine)
3. Restore the backup
4. Verify data is intact

This ensures your backups are actually usable.

## Data loss acceptance

For this personal system, consider:

- What's the oldest data you'd accept losing? (1 day? 1 week?)
- Set backup frequency accordingly
- Store backups in multiple locations

## Contact for help

If you're stuck:
1. Check troubleshooting guide: `10-user-guide/16-troubleshooting.md`
2. Review logs carefully
3. Search error messages online
4. Open a GitHub issue with details

## References

- Data storage: `22-data-storage-and-persistence.md`
- Backups: `10-user-guide/15-export-and-personal-backups.md`
- Troubleshooting: `10-user-guide/16-troubleshooting.md`
