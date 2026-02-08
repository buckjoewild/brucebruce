# Acceptance Test Results

## Test Run: December 26, 2025

| Test | Command | Expected Result | Actual Result | Status |
|------|---------|-----------------|---------------|--------|
| Local dev works | `npm run dev` | Server starts, accessible at PORT | Server running on port 5000 | PASS |
| Health endpoint | `curl http://localhost:5000/api/health` | Returns JSON with all status fields | Returns status, database, ai_provider, ai_status | PASS |
| Demo mode works | Visit `/?demo=true` | Shows demo data in LifeOps | Demo banner visible, sample data loads | PASS |
| Missing AI keys safe | Start without AI keys | App loads, logging works, AI shows "unavailable" | AI provider: off, app functions normally | PASS |
| Data export complete | Settings -> Export Data -> Download | JSON includes all 7 data types | Exports logs, ideas, goals, checkins, teaching, harris, settings | PASS |
| No crash outside Replit | Run without Replit env vars | Logs message about demo mode, doesn't crash | Shows standalone mode message | PASS |
| Production build works | `npm run build && npm run start` | Built app serves correctly | Pending Docker test |  |
| Docker cold start | `docker compose up` (fresh checkout) | Both containers start, app accessible | Pending external test |  |
| Database persists | Create log -> restart -> verify | Log survives restart | Pending external test |  |

## Notes
- Health endpoint now includes: status, database, ai_provider, ai_status
- AI Provider ladder: gemini -> openrouter -> off (with automatic fallback)
- Demo mode controlled via URL parameter or localStorage (not server env var)
- Replit OIDC gracefully detects non-Replit environment and prompts for demo mode

## Database Schema Sync
- Uses: `drizzle-kit push` (not migrations)
- Runs on: Container startup via npm run db:push
- Purpose: Sync schema to match code definitions
