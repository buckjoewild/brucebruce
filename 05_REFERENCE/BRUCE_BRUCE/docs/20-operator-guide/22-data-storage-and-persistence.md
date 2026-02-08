# Data storage and persistence

**Audience:** Operators  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Document where data lives, how it persists, and how to manage it.

## Storage architecture

```
┌─────────────────────────────────────────────────────┐
│  Application Data                                   │
├─────────────────────────────────────────────────────┤
│  PostgreSQL Database                                │
│  ├── users (auth, sessions)                         │
│  ├── logs (LifeOps daily entries)                   │
│  ├── ideas (ThinkOps pipeline)                      │
│  ├── goals (user goals)                             │
│  ├── check_ins (goal check-ins)                     │
│  ├── drift_flags (calculated signals)              │
│  ├── teaching_requests (lesson plans)              │
│  └── harris_content (brand content)                │
└─────────────────────────────────────────────────────┘
```

## Docker volume

In Docker Compose, data is stored in a named volume:

```yaml
volumes:
  pgdata:  # Named volume

services:
  db:
    volumes:
      - pgdata:/var/lib/postgresql/data  # Mount point
```

### Volume location

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect harriswildlands_pgdata
```

### Volume persistence

| Command | Data preserved? |
|---------|-----------------|
| `docker compose down` | Yes |
| `docker compose up --build` | Yes |
| `docker compose down -v` | **NO** - Volume deleted |
| `docker volume rm pgdata` | **NO** - Volume deleted |

## Database tables

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `users` | User accounts | id, username, email |
| `sessions` | Auth sessions | sid, sess, expire |
| `logs` | Daily log entries | id, userId, date, data (JSON) |
| `ideas` | ThinkOps ideas | id, userId, title, status |
| `goals` | User goals | id, userId, title, domain |
| `check_ins` | Goal check-ins | id, goalId, date, completed |
| `drift_flags` | Calculated drift signals | id, userId, type, value |
| `teaching_requests` | Lesson plan requests | id, userId, subject, grade |
| `harris_content` | Brand content | id, userId, type, content |

## Backup strategies

### Option 1: Export feature (recommended for users)

Use the in-app export:
```bash
curl http://localhost:5000/api/export/data > backup.json
```

Produces a JSON file with all user data.

### Option 2: pg_dump (recommended for operators)

Full database backup:
```bash
docker compose exec db pg_dump -U postgres pgbruce > backup.sql
```

Restore:
```bash
docker compose exec -T db psql -U postgres pgbruce < backup.sql
```

### Option 3: Volume backup

Backup the volume directory:
```bash
docker run --rm -v harriswildlands_pgdata:/data -v $(pwd):/backup \
  alpine tar czf /backup/pgdata-backup.tar.gz -C /data .
```

## Data retention

Currently:
- No automatic data deletion
- No TTL on entries
- User responsible for cleanup

Future consideration:
- Configurable retention policies
- Archive old entries

## Sensitive data locations

The following tables may contain sensitive information:

| Table | Sensitive fields |
|-------|------------------|
| `logs` | familyConnection, faithAlignment, driftCheck |
| `ideas` | All content (personal ideas) |

See: `40-protocols-and-governance/42-privacy-red-zones-and-sharing-boundaries.md`

## External database

To use an external PostgreSQL instead of Docker:

1. Set `DATABASE_URL` to your external connection string
2. Remove the `db` service from `docker-compose.yml`
3. Remove the `volumes` section

Requirements:
- PostgreSQL 14+ recommended
- User with CREATE/ALTER/DROP privileges
- Database created before first run

## References

- Disaster recovery: `26-disaster-recovery.md`
- Export feature: `10-user-guide/15-export-and-personal-backups.md`
- Database schema: `30-developer-reference/33-database-schema-reference.md`
