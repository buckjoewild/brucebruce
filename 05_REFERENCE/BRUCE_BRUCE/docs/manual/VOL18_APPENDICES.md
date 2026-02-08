# VOLUME 18: APPENDICES & QUICK REFERENCES

**HarrisWildlands.com Technical Project Manual**  
**Version:** 1.0.0  
**Generated:** December 28, 2025

---

## A. Quick Command Reference

### Development

```bash
npm run dev          # Start development server
npm run check        # TypeScript type checking
npm run build        # Production build
npm run start        # Start production server
npm run db:push      # Sync schema to database
```

### Docker

```bash
docker compose up              # Start all services
docker compose up -d           # Start detached
docker compose down            # Stop all services
docker compose logs -f         # Follow logs
docker compose exec db psql -U postgres harriswildlands  # DB shell
docker compose exec app npm run db:push  # Sync schema
```

### Database

```bash
# Backup
docker compose exec db pg_dump -U postgres harriswildlands > backup.sql

# Restore
cat backup.sql | docker compose exec -T db psql -U postgres harriswildlands

# Schema sync
npm run db:push
```

---

## B. Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | PostgreSQL connection |
| SESSION_SECRET | Yes | - | Session encryption key |
| PORT | No | 5000 | Server port |
| NODE_ENV | No | development | Environment mode |
| AI_PROVIDER | No | off | gemini/openrouter/off |
| GOOGLE_GEMINI_API_KEY | No | - | Gemini API key |
| OPENROUTER_API_KEY | No | - | OpenRouter API key |
| STANDALONE_MODE | No | false | Enable auto-login |
| ISSUER_URL | Auto | - | OIDC issuer |
| REPL_ID | Auto | - | Replit environment |

---

## C. API Endpoint Reference

### Health & Auth

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/health | No | System status |
| GET | /api/me | Yes | Current user |

### LifeOps

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/logs | Yes | List logs |
| GET | /api/logs/:date | Yes | Get log by date |
| POST | /api/logs | Yes | Create log |
| PUT | /api/logs/:id | Yes | Update log |
| POST | /api/logs/summary | Yes | Generate AI summary |

### Goals & Check-ins

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/goals | Yes | List goals |
| POST | /api/goals | Yes | Create goal |
| PUT | /api/goals/:id | Yes | Update goal |
| GET | /api/checkins | Yes | List check-ins |
| POST | /api/checkins | Yes | Upsert check-in |
| POST | /api/checkins/batch | Yes | Batch upsert |

### ThinkOps

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/ideas | Yes | List ideas |
| POST | /api/ideas | Yes | Create idea |
| PUT | /api/ideas/:id | Yes | Update idea |
| POST | /api/ideas/:id/reality-check | Yes | Run AI analysis |

### Weekly Review

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/review/weekly | Yes | Get review data |
| POST | /api/review/weekly/insight | Yes | Generate insight |
| GET | /api/export/weekly.pdf | Yes | Export review |

### Teaching & Harris

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/teaching | Yes | List requests |
| POST | /api/teaching | Yes | Generate lesson |
| POST | /api/harris | Yes | Generate copy |

### Chat & Export

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/chat | Yes | AI conversation |
| GET | /api/export/data | Yes | Export all data |

---

## D. Database Table Reference

| Table | Fields | Purpose |
|-------|--------|---------|
| users | id, email, name, etc. | User accounts |
| session | sid, sess, expire | Session storage |
| logs | id, userId, date, metrics... | Daily logs |
| ideas | id, userId, title, status... | Idea pipeline |
| goals | id, userId, domain, title... | Goal tracking |
| checkins | id, goalId, date, done... | Goal check-ins |
| teaching_requests | id, userId, grade... | Lesson requests |
| harris_content | id, userId, contentType... | Brand content |
| user_settings | id, userId, theme... | Preferences |
| drift_flags | id, userId, type... | Pattern flags |
| transcripts | id, userId, content... | Braindumps |
| settings | id, key, value | Global settings |

---

## E. File Structure Reference

```
harriswildlands.com/
├── client/src/
│   ├── pages/              # 12 route components
│   ├── components/ui/      # 48 shadcn components
│   ├── components/         # 8 custom components
│   ├── hooks/              # Custom hooks
│   └── lib/                # Utilities
├── server/
│   ├── routes.ts           # API handlers
│   ├── storage.ts          # Database layer
│   ├── db.ts               # Connection
│   └── replit_integrations/auth/
├── shared/
│   ├── schema.ts           # Tables + types
│   └── routes.ts           # API contracts
├── docs/manual/            # This manual (18 volumes)
├── scripts/                # Utility scripts
├── Dockerfile              # Docker build
├── docker-compose.yml      # Docker services
└── package.json            # Dependencies
```

---

## F. Domain Reference

Goal domains:
- faith
- family
- work
- health
- logistics
- property
- ideas
- discipline

Idea categories:
- tech
- business
- creative
- family
- faith
- learning

Idea statuses:
- draft → parked → promoted → shipped/discarded

---

## G. AI Response Formats

### Reality Check

```json
{
  "known": ["verified fact"],
  "likely": ["reasonable assumption"],
  "speculation": ["hope or guess"],
  "flags": ["self-deception pattern"],
  "decision": "Promote|Park|Salvage|Discard",
  "reasoning": "explanation"
}
```

### Weekly Insight

```
"This week, [action]. [Reason why]."
```

### Teaching Output

```json
{
  "lessonOutline": "...",
  "handsOnActivity": "...",
  "exitTicket": "...",
  "answerKey": "...",
  "differentiation": "...",
  "prepList": ["item1", "item2"]
}
```

---

## H. Troubleshooting Quick Reference

| Symptom | Quick Fix |
|---------|-----------|
| Database connection failed | Check DATABASE_URL |
| Port in use | `lsof -i :5000` then kill |
| Auth not working | Check SESSION_SECRET |
| AI not working | Check AI_PROVIDER and keys |
| Schema mismatch | `npm run db:push` |
| Build fails | `npm run check` for errors |

---

## I. Version History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2025-12-27 | Keystone release |

---

## J. Glossary

| Term | Definition |
|------|------------|
| BruceOps | Project internal name |
| Drift Flag | Pattern-based warning |
| K/L/S | Known/Likely/Speculation |
| Lane | Operational area (LifeOps, ThinkOps, etc.) |
| Reality Check | AI idea validation |
| Standalone Mode | Auth-free operation |

---

## K. Contact & Support

- **Repository:** github.com/buckjoewild/harriswildlands.com
- **Production:** harriswildlands.com
- **Documentation:** /docs directory

---

## L. License

MIT License - See LICENSE file in repository.

---

**End of Technical Manual**

---

## Manual Index

| Volume | Title |
|--------|-------|
| VOL01 | Executive Overview |
| VOL02 | Technology Stack |
| VOL03 | Architecture |
| VOL04 | File Structure |
| VOL05 | Database Schema |
| VOL06 | API Catalog |
| VOL07 | AI Integration |
| VOL08 | User Workflows |
| VOL09 | Components |
| VOL10 | Configuration |
| VOL11 | Deployment |
| VOL12 | Security |
| VOL13 | Extension Patterns |
| VOL14 | Troubleshooting |
| VOL15 | Testing |
| VOL16 | Maintenance |
| VOL17 | Roadmap |
| VOL18 | Appendices |
