# System Architecture

## Container Structure
```
+-------------------------------------+
|   App Container (Node 20)           |
|   +-------------+   +------------+  |
|   |  Frontend   |   |  Express   |  |
|   |  (React)    |<--|  API       |  |
|   |  dist/public|   |  dist/     |  |
|   +-------------+   +------+-----+  |
+----------------------------|---------+
                             |
                             v
                    +------------------+
                    |  DB Container    |
                    |  (PostgreSQL 16) |
                    |  Volume: persist |
                    +------------------+
```

## Request Flow
1. Browser -> `http://localhost:5000` (or configured PORT)
2. App container serves React frontend from `dist/public`
3. Frontend API calls -> Express routes in same container
4. Express -> PostgreSQL in db container
5. Response back through chain

## Daily Log Workflow
```
User fills form -> POST /api/logs -> Validate -> Save to DB
                                            |
                                    Try AI analysis (optional)
                                            |
                                    Return success (AI failure ignored)
```

## Demo Mode
- **Trigger**: `?demo=true` in URL OR `localStorage.demo = 'true'`
- **Behavior**: Bypasses auth, returns mock data
- **Scope**: Works in all 4 modules
- **Storage**: Browser localStorage (not server-side)

## AI Integration
- **Providers**: Gemini (free tier) -> OpenRouter (paid) -> Off (canned responses)
- **Configuration**: `AI_PROVIDER` env var + API keys
- **Fallback**: Automatic fallback to next provider on failure
- **Graceful Degradation**: App never crashes on AI failure

## Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + Tailwind + shadcn/ui
- **Backend**: Express.js + TypeScript (ESM)
- **Database**: PostgreSQL 16 + Drizzle ORM
- **Auth**: Replit OIDC (Replit-only) + Demo Mode bypass
- **AI**: Gemini API / OpenRouter API

## Key Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/health | GET | System health check |
| /api/logs | GET/POST | Daily logs CRUD |
| /api/logs/:id | PUT | Update existing log |
| /api/logs/:date | GET | Get log by date |
| /api/ideas | GET/POST | Ideas CRUD |
| /api/goals | GET/POST | Goals CRUD |
| /api/checkins | GET/POST | Goal check-ins |
| /api/teaching | GET/POST | Teaching requests |
| /api/harris | POST | Harris content generation |
| /api/export/data | GET | Full data export (JSON) |

## Environment Variables
| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| DATABASE_URL | Yes | - | PostgreSQL connection |
| SESSION_SECRET | Yes | - | Session encryption |
| PORT | No | 5000 | Server port |
| AI_PROVIDER | No | off | AI provider preference |
| GOOGLE_GEMINI_API_KEY | No | - | Gemini API key |
| OPENROUTER_API_KEY | No | - | OpenRouter API key |
