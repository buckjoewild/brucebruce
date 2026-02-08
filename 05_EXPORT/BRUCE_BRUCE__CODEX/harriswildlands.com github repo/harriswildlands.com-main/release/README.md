# Thought Weaver / BruceOps - Standalone Deployment

## Prerequisites
- Docker & Docker Compose
- OR Node 20 (for local development)

## Windows Home Desktop Deployment (Easiest)

For self-hosting on your home Windows desktop:

1. **First Time Setup:**
   - Install [Docker Desktop](https://docker.com/products/docker-desktop)
   - Copy the `release/` folder to your desktop
   - Double-click `deploy-windows.bat`

2. **What the script does:**
   - Checks Docker is installed and running
   - Creates environment config
   - Builds and starts containers
   - Runs smoke tests (health, database, frontend)
   - Runs stress tests (rapid requests, concurrent connections)
   - Opens browser to your app

3. **Quick Test:**
   - Run `test-app.bat` anytime to verify the app is healthy

4. **App Management:**
   - Run `manage-app.bat` for a menu with:
     - Start/Stop/Restart
     - View live logs
     - Run health checks
     - Database backup
     - Rebuild and deploy

**Access URLs:**
- Main app: `http://localhost:5000`
- Demo mode: `http://localhost:5000/?demo=true`

---

## Quick Start (Docker - Manual)
1. Copy `.env.example` to `.env`
2. Edit `.env` with your database credentials and optional API keys
3. Run: `docker compose up`
4. Access at `http://localhost:5000` (or your configured PORT)
5. Demo mode: visit `/?demo=true`

## Local Development
```bash
npm install
npm run dev
# Access at http://localhost:5000 (or configured PORT)
```

## Production Build (without Docker)
```bash
npm install
npm run build
npm run start
```

## Environment Variables
See `.env.example` for all configuration options.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Random string for session encryption

**Optional:**
- `PORT` - Server port (defaults to 5000)
- `AI_PROVIDER` - AI provider preference: `gemini`, `openrouter`, or `off`
- `GOOGLE_GEMINI_API_KEY` - Gemini API key (free tier available)
- `OPENROUTER_API_KEY` - OpenRouter API key (paid, supports multiple models)

## Demo Mode
Add `?demo=true` to URL or set in localStorage.
No authentication required for testing.

## Database
- Docker: Postgres data persists in named volume `postgres-data`
- Data survives restarts unless you run `docker compose down -v`
- Schema sync: Uses `drizzle-kit push` (not migrations)

## AI Provider Ladder
The app tries AI providers in this order:
1. Gemini (if `AI_PROVIDER=gemini` and `GOOGLE_GEMINI_API_KEY` is set)
2. OpenRouter (if `AI_PROVIDER=openrouter` and `OPENROUTER_API_KEY` is set)
3. Off (graceful degradation - daily logging still works)

If the primary provider fails, it automatically falls back to the next available provider.

## Modules
- **LifeOps** - Daily calibration, routines, and logging
- **ThinkOps** - Idea capture and reality-checking
- **Teaching Assistant** - Standards-aligned lesson plan generation
- **HarrisWildlands** - Brand content and website copy generation

## Data Export
All your data can be exported from Settings page as JSON.
Includes: logs, ideas, goals, checkins, teaching requests, harris content, and settings.

## Health Check
`GET /api/health` returns system status including:
- Database connection status
- AI provider status
- Environment information
