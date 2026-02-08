# Standalone deployment (Docker Compose)

**Audience:** Operators / self-hosters  
**Status:** VERIFIED (configuration)  
**Last updated:** 2025-12-27

## Purpose

Deep guide to Docker Compose deployment for operators who need more control than the quickstart provides.

## Architecture overview

```
┌──────────────────────────────────────────┐
│  Docker Compose Environment              │
├──────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  │
│  │  App (Node.js) │  │  PostgreSQL    │  │
│  │  Port 5000     │  │  Port 5432     │  │
│  │                │──│                │  │
│  │  - Express     │  │  - pgbruce     │  │
│  │  - Vite        │  │  - Volume      │  │
│  └────────────────┘  └────────────────┘  │
└──────────────────────────────────────────┘
```

## Files involved

| File | Purpose |
|------|---------|
| `Dockerfile` | Builds the Node.js application image |
| `docker-compose.yml` | Orchestrates app + database containers |
| `.env` | Configuration (copied from `.env.example`) |
| `.env.example` | Template with documented variables |

## Dockerfile breakdown

```dockerfile
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 5000
CMD ["npm", "start"]
```

Key points:
- Multi-stage build (smaller final image)
- Node 20 LTS
- Production dependencies only
- Port 5000 exposed

## Docker Compose breakdown

```yaml
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgres://postgres:postgres@db:5432/pgbruce
      - STANDALONE_MODE=true
      - AI_PROVIDER=off
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=pgbruce
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

Key points:
- `STANDALONE_MODE=true` enables auto-login
- Database uses named volume for persistence
- Healthcheck ensures DB is ready before app starts

## Deployment commands

### Initial setup
```bash
git clone https://github.com/buckjoewild/harriswildlands.com.git
cd harriswildlands.com
cp .env.example .env
docker compose up
```

### Start / stop
```bash
docker compose up       # Start (foreground)
docker compose up -d    # Start (background)
docker compose down     # Stop (preserves data)
```

### Update to new version
```bash
git pull
docker compose up --build
```

### Complete reset (DELETES ALL DATA)
```bash
docker compose down -v  # -v removes volumes
docker compose up --build
```

## Customization

### Change port
```bash
# In docker-compose.yml
ports:
  - "3000:5000"  # Host port 3000 → container port 5000
```

### Add AI provider
```yaml
environment:
  - AI_PROVIDER=gemini
  - GOOGLE_GEMINI_API_KEY=your-key-here
```

### Use external database
```yaml
environment:
  - DATABASE_URL=postgres://user:pass@your-host:5432/dbname
```

Remove the `db` service and `volumes` section if using external DB.

## Verification checklist

After deployment, verify:

- [ ] Health endpoint returns OK: `curl http://localhost:5000/api/health`
- [ ] Frontend loads: Open `http://localhost:5000` in browser
- [ ] Data persists: Create a log entry, restart (`docker compose down && up`), verify entry exists
- [ ] Smoke test passes: `./scripts/smoke-test.sh`

## References

- User quickstart: `10-user-guide/10-quickstart-standalone-docker.md`
- Configuration: `21-configuration-env.md`
- Data persistence: `22-data-storage-and-persistence.md`
- Security: `24-security-local-lan-and-auth-modes.md`
