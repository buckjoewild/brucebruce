# Changelog

**Type:** Release artifact  
**Status:** Current  
**Last updated:** December 27, 2025

## Format

```
## [Version] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing features

### Fixed
- Bug fixes

### Removed
- Removed features

### Security
- Security-related changes

### Documentation
- Documentation changes
```

---

## [1.0.0] - 2025-12-27

### Added

**Core Features**
- LifeOps daily logging with scales (1-10), binary habits, and text reflections
- ThinkOps idea pipeline with status tracking (draft → reality-checked → promoted → archived)
- Goals and check-ins with domain categorization
- Weekly review with stats, charts, and AI insights
- Export all user data as JSON

**AI Integration**
- Provider ladder: Gemini → OpenRouter → OFF
- Reality Check with Known/Likely/Speculation classification
- Self-deception pattern detection
- Weekly insight generation (cached daily)
- Bruce Steward Chat interface

**Authentication**
- Replit OIDC integration
- Standalone mode for Docker deployments
- Demo mode for client-side evaluation

**Deployment**
- Docker Compose configuration
- Standalone mode (STANDALONE_MODE env var)
- PostgreSQL with persistent volume
- Health check endpoint

**Documentation**
- Complete documentation set (30 files)
- 6 sections: start-here, user-guide, operator-guide, developer-reference, protocols-governance, releases-evidence
- Smoke test script
- Acceptance test checklist

**Google Drive Integration**
- List, upload, download files
- Create folders
- OAuth via Replit connector

### Technical

**Frontend**
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query for server state
- wouter for routing
- react-hook-form with Zod validation

**Backend**
- Express with TypeScript
- Drizzle ORM
- PostgreSQL sessions via connect-pg-simple
- Passport.js for auth

**Shared**
- Single source of truth in shared/schema.ts
- Type-safe API contracts

---

## [Unreleased]

### Planned

- PDF export for weekly review
- Data import/restore functionality
- Account deletion
- Field-level encryption (optional)
- Selective redaction on export

### Considered

- Mobile app (PWA)
- Offline support
- Multi-language support
- Calendar integration

---

## Migration notes

### From pre-1.0 to 1.0.0

If upgrading from development versions:

1. **Backup your data**
   ```bash
   curl http://localhost:5000/api/export/data > backup.json
   ```

2. **Pull latest code**
   ```bash
   git pull origin main
   ```

3. **Rebuild**
   ```bash
   docker compose up --build
   ```

4. **Verify**
   ```bash
   ./scripts/smoke-test.sh
   ```

No database migrations required for 1.0.0.

---

## References

- Keystone v1.0: `50-keystone-v1.0-2025-12-27.md`
- Acceptance checklist: `51-acceptance-test-checklist.md`
- Updates guide: `20-operator-guide/23-updates-and-upgrades.md`
