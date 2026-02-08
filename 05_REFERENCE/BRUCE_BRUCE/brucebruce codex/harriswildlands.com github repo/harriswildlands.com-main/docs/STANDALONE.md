# Standalone Deployment Guide

Run BruceOps/HarrisWildlands on your own server without Replit.

## Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/buckjoewild/harriswildlands.com.git
cd harriswildlands.com

# Start the app (database included)
docker-compose up --build

# Open in browser
open http://localhost:5000
```

That's it! The app runs in standalone mode with:
- Auto-login (no authentication required)
- PostgreSQL database (data persists in Docker volume)
- LifeOps logging fully functional

## What Works in Standalone Mode

| Feature | Status | Notes |
|---------|--------|-------|
| LifeOps Daily Logs | Full | Core feature, fully functional |
| Goals & Check-ins | Full | Track habits and progress |
| Weekly Review | Full | View completion stats |
| Data Export | Full | Download all data as JSON |
| ThinkOps Ideas | Partial | Logging works, AI reality-check disabled |
| Teaching Assistant | Disabled | Requires AI provider |
| HarrisWildlands Copy | Disabled | Requires AI provider |
| Google Drive Sync | Disabled | Requires Replit connector |

## Enable AI Features (Optional)

To enable AI-powered features, add API keys to your environment:

```bash
# Create .env file
cp .env.example .env

# Edit .env and add one of:
AI_PROVIDER=gemini
GOOGLE_GEMINI_API_KEY=your-key-here

# Or use OpenRouter:
AI_PROVIDER=openrouter  
OPENROUTER_API_KEY=sk-or-your-key

# Restart
docker-compose down && docker-compose up --build
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STANDALONE_MODE` | No | `true` (in Docker) | Enables auto-login |
| `DATABASE_URL` | Yes | Auto-set | PostgreSQL connection |
| `SESSION_SECRET` | Yes | Provided | Session encryption key |
| `AI_PROVIDER` | No | `off` | AI provider: gemini/openrouter/off |
| `PORT` | No | `5000` | Server port |

## Data Persistence

Your data is stored in a Docker volume called `postgres-data`. To backup:

```bash
# Export all data as JSON
curl http://localhost:5000/api/export/data > backup.json

# Or backup the Docker volume
docker run --rm -v harriswildlands_postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz /data
```

## Health Check

Verify the app is running:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "standalone_mode": true,
  "database": "connected",
  "ai_provider": "off",
  "ai_status": "offline"
}
```

## Troubleshooting

### Database not connecting
```bash
# Check if postgres is healthy
docker-compose ps

# View logs
docker-compose logs db
```

### Reset database
```bash
# Warning: This deletes all data!
docker-compose down -v
docker-compose up --build
```

### Port already in use
```bash
# Use a different port
PORT=3000 docker-compose up --build
```
