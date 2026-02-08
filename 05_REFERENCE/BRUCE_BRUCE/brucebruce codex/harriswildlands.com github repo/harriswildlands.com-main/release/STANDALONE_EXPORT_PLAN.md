# Standalone Export Plan

## What's Included
- Docker Compose setup (app + database)
- Environment configuration template
- Replit OIDC guards (won't crash outside Replit)
- Demo mode preserved (localStorage control)
- Health check endpoint
- Data export functionality (7 data types)
- AI provider ladder (Gemini -> OpenRouter -> Off)
- Graceful AI failure handling
- Complete documentation

## What's NOT Included
- Replit-specific auth (guarded, not removed)
- Production auth system (use demo mode or add Auth.js later)
- Filled `.env` file (you must configure)

## How to Use This Export
1. Extract zip to your machine
2. Copy `.env.example` to `.env` and configure
3. Run `docker compose up`
4. Access app at configured PORT
5. Use `?demo=true` for testing without auth

## Data Export
All 7 data types are included in the JSON export:
- logs
- ideas
- goals
- checkins
- teaching_requests
- harris_content
- user_settings

## Next Steps (After Export)
- [ ] Test all 4 modules in demo mode
- [ ] Configure AI keys and test provider fallback
- [ ] Set up production auth (Auth.js recommended)
- [ ] Deploy to your hosting platform
- [ ] Set up backups for database volume
