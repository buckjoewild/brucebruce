# HarrisWildlands Complete File Reference for AI Systems

**Purpose:** Quick reference of ALL files AI systems can access for modification

---

## 🎯 TIER 1: CRITICAL FILES (Must Have for Any AI Task)

### Database & API Contract
| File | Purpose | Lines | AI Usage |
|------|---------|-------|----------|
| `shared/schema.ts` | Complete database schema (Drizzle ORM) | ~500 | Define/modify tables, understand data model |
| `shared/routes.ts` | API route contracts (Zod validation) | ~400 | Add/modify endpoints, validate requests |
| `server/routes.ts` | API endpoint implementations | ~850 | Implement business logic, add features |
| `server/storage.ts` | Database CRUD operations | ~800 | Query/update database, add data access |

### Configuration
| File | Purpose | Lines | AI Usage |
|------|---------|-------|----------|
| `package.json` | Dependencies & scripts | ~100 | Install packages, run commands |
| `.env.example` | Environment variables template | ~30 | Configure API keys, database, etc. |
| `tsconfig.json` | TypeScript configuration | ~30 | Understand type checking rules |

---

## 🎯 TIER 2: ESSENTIAL FILES (Needed for Most Tasks)

### Frontend Core
| File | Purpose | Lines | AI Usage |
|------|---------|-------|----------|
| `client/src/App.tsx` | Main app component & routing | ~100 | Add routes, modify app structure |
| `client/src/main.tsx` | React entry point | ~30 | Configure React, providers |
| `client/src/index.css` | Global styles | ~200 | Modify theme, add global CSS |

### Page Components (Core UI)
| File | Purpose | Lines | AI Usage |
|------|---------|-------|----------|
| `client/src/pages/LifeOps.tsx` | Daily logging interface | ~500 | Modify logging UI, add metrics |
| `client/src/pages/ThinkOps.tsx` | Idea capture & analysis | ~600 | Modify idea workflow, AI integration |
| `client/src/pages/Goals.tsx` | Goal tracking interface | ~400 | Modify goals UI, add features |
| `client/src/pages/Dashboard.tsx` | Overview dashboard | ~300 | Add widgets, modify layout |
| `client/src/pages/WeeklyReview.tsx` | Weekly synthesis view | ~350 | Modify review logic, add charts |
| `client/src/pages/Settings.tsx` | User settings | ~250 | Add settings, modify preferences |
| `client/src/pages/BruceOps.tsx` | Landing/orientation | ~200 | Modify landing page |
| `client/src/pages/TeachingAssistant.tsx` | Teaching tools | ~300 | Add teaching features |
| `client/src/pages/HarrisWildlands.tsx` | Content generator | ~250 | Modify content workflows |
| `client/src/pages/Chat.tsx` | AI chat interface | ~200 | Modify chat UI |
| `client/src/pages/RealityCheck.tsx` | Idea validation | ~150 | Modify validation flow |

### Backend Core
| File | Purpose | Lines | AI Usage |
|------|---------|-------|----------|
| `server/index.ts` | Server entry point & middleware | ~200 | Add middleware, configure server |
| `server/db.ts` | Database connection | ~50 | Modify DB config |
| `server/vite.ts` | Vite dev server integration | ~80 | Configure development |
| `server/static.ts` | Static file serving | ~40 | Serve assets |
| `server/google-drive.ts` | Google Drive integration | ~150 | Modify Drive integration |

### Authentication
| File | Purpose | Lines | AI Usage |
|------|---------|-------|----------|
| `server/replit_integrations/auth/replitAuth.ts` | Replit OIDC configuration | ~150 | Modify auth flow |
| `server/replit_integrations/auth/routes.ts` | Auth endpoints | ~100 | Add auth routes |
| `server/replit_integrations/auth/storage.ts` | Auth data operations | ~80 | Modify user storage |

---

## 🎯 TIER 3: SUPPORTING FILES (Context & Utilities)

### React Hooks
| File | Purpose | Lines | AI Usage |
|------|---------|-------|----------|
| `client/src/hooks/use-auth.ts` | Authentication hook | ~50 | Modify auth state |
| `client/src/hooks/use-demo.tsx` | Demo mode hook | ~80 | Modify demo behavior |
| `client/src/hooks/use-bruce-ops.ts` | BruceOps state | ~40 | Add state management |
| `client/src/hooks/use-mobile.tsx` | Mobile detection | ~20 | Responsive behavior |
| `client/src/hooks/use-toast.ts` | Toast notifications | ~30 | Add notifications |

### Utilities
| File | Purpose | Lines | AI Usage |
|------|---------|-------|----------|
| `client/src/lib/queryClient.ts` | React Query setup | ~60 | Modify caching |
| `client/src/lib/utils.ts` | Helper functions | ~50 | Add utilities |
| `client/src/lib/auth-utils.ts` | Auth utilities | ~40 | Auth helpers |
| `client/src/lib/coreImagery.ts` | Image mappings | ~80 | Modify assets |

### Layout Components
| File | Purpose | Lines | AI Usage |
|------|---------|-------|----------|
| `client/src/components/Layout.tsx` | Main layout wrapper | ~150 | Modify app structure |
| `client/src/components/InterfaceOverlay.tsx` | Terminal aesthetic | ~200 | Modify visual style |
| `client/src/components/BotanicalMotifs.tsx` | Decorative elements | ~100 | Add visual elements |
| `client/src/components/DemoBanner.tsx` | Demo mode indicator | ~50 | Modify demo UI |
| `client/src/components/ThemeProvider.tsx` | Theme context | ~80 | Modify theming |

### Build Scripts
| File | Purpose | Lines | AI Usage |
|------|---------|-------|----------|
| `script/build.ts` | Production build | ~150 | Modify build process |
| `script/seed.ts` | Database seeding | ~100 | Add seed data |

---

## 📚 DOCUMENTATION FILES (Read-Only Reference)

### Technical Manual (18 Volumes)
| File | Content | AI Usage |
|------|---------|----------|
| `docs/manual/TECHNICAL_MANUAL.md` | Index & overview | Navigation |
| `docs/manual/VOL01_EXECUTIVE_OVERVIEW.md` | Project vision | Understand goals |
| `docs/manual/VOL02_TECH_STACK.md` | All dependencies | Know what's available |
| `docs/manual/VOL03_ARCHITECTURE.md` | System design | Understand structure |
| `docs/manual/VOL04_FILE_STRUCTURE.md` | Directory tree | Navigate codebase |
| `docs/manual/VOL05_DATABASE_SCHEMA.md` | **All DB tables** | **Critical reference** |
| `docs/manual/VOL06_API_CATALOG.md` | **All endpoints** | **Critical reference** |
| `docs/manual/VOL07_AI_INTEGRATION.md` | AI patterns | Add AI features |
| `docs/manual/VOL08_USER_WORKFLOWS.md` | User journeys | Understand UX |
| `docs/manual/VOL09_COMPONENTS.md` | UI components | Use components |
| `docs/manual/VOL10_CONFIGURATION.md` | Config options | Set up environment |
| `docs/manual/VOL11_DEPLOYMENT.md` | Deploy guides | Launch app |
| `docs/manual/VOL12_SECURITY.md` | Security patterns | Secure code |
| `docs/manual/VOL13_EXTENSION_PATTERNS.md` | **How to add features** | **Critical for coding** |
| `docs/manual/VOL14_TROUBLESHOOTING.md` | Common issues | Debug problems |
| `docs/manual/VOL15_TESTING.md` | Test strategies | Add tests |
| `docs/manual/VOL16_MAINTENANCE.md` | Maintenance tasks | Ongoing work |
| `docs/manual/VOL17_ROADMAP.md` | Future plans | Understand direction |
| `docs/manual/VOL18_APPENDICES.md` | Quick references | Look up details |

### Other Documentation
| File | Content | AI Usage |
|------|---------|----------|
| `docs/ARCHITECTURE.md` | System architecture | Understand design |
| `docs/CODEBASE.md` | Code organization | Navigate code |
| `docs/TECHNICAL_EVIDENCE.md` | Implementation proof | Verify features |
| `docs/STANDALONE.md` | Self-hosting guide | Deploy independently |
| `design_guidelines.md` | UI/UX principles | Design consistency |

---

## ⚙️ CONFIGURATION FILES

### Build Configuration
| File | Purpose | AI Modification |
|------|---------|----------------|
| `vite.config.ts` | Vite bundler config | Modify build |
| `tailwind.config.ts` | Tailwind CSS config | Modify styles |
| `postcss.config.js` | PostCSS config | CSS processing |
| `components.json` | shadcn/ui config | UI components |
| `drizzle.config.ts` | Database ORM config | DB connection |

### Deployment
| File | Purpose | AI Modification |
|------|---------|----------------|
| `Dockerfile` | Container build | Modify container |
| `docker-compose.yml` | Multi-container setup | Add services |
| `.replit` | Replit deployment | Deploy to Replit |

---

## 🎨 UI COMPONENT LIBRARY (50+ Files)

### Most Important Components
```
client/src/components/ui/
├── button.tsx         # Button component
├── card.tsx           # Card container
├── input.tsx          # Text input
├── textarea.tsx       # Multi-line input
├── select.tsx         # Dropdown select
├── dialog.tsx         # Modal dialog
├── badge.tsx          # Status badge
├── tabs.tsx           # Tab navigation
├── table.tsx          # Data table
├── toast.tsx          # Toast notification
└── ... (40+ more)
```

**Full list available in:** `docs/manual/VOL09_COMPONENTS.md`

---

## 📊 FILE STATISTICS

| Category | Count | Total Lines |
|----------|-------|-------------|
| **TypeScript/TSX** | 80+ | ~12,000 |
| **Documentation** | 30+ | ~8,000 |
| **Configuration** | 10+ | ~500 |
| **Total** | 120+ | ~20,500 |

---

## 🎯 AI TASK → FILE MAPPING

### "Add a new API endpoint"
1. `shared/routes.ts` - Define contract
2. `server/routes.ts` - Implement handler
3. `server/storage.ts` - Add DB function (if needed)
4. `shared/schema.ts` - Add table (if needed)

### "Modify the LifeOps daily log"
1. `client/src/pages/LifeOps.tsx` - UI changes
2. `shared/schema.ts` - Schema changes
3. `shared/routes.ts` - API changes
4. `server/routes.ts` - Backend changes

### "Add AI analysis to Goals"
1. `client/src/pages/Goals.tsx` - Add UI trigger
2. `server/routes.ts` - Add AI endpoint
3. `shared/routes.ts` - Define contract

### "Deploy to Docker"
1. `Dockerfile` - Container config
2. `docker-compose.yml` - Services
3. `.env.example` - Copy to `.env`
4. `docs/manual/VOL11_DEPLOYMENT.md` - Follow guide

### "Understand the database"
1. `docs/manual/VOL05_DATABASE_SCHEMA.md` - Read this first
2. `shared/schema.ts` - See actual code
3. `server/storage.ts` - See usage examples

---

## 🚀 QUICK START FOR AI SYSTEMS

### First Time Setup
```bash
# Read these files first (in order):
1. docs/manual/TECHNICAL_MANUAL.md          # Index
2. docs/manual/VOL01_EXECUTIVE_OVERVIEW.md  # What is this?
3. docs/manual/VOL05_DATABASE_SCHEMA.md     # Data model
4. docs/manual/VOL06_API_CATALOG.md         # API surface
5. package.json                              # Dependencies

# Then explore:
- shared/schema.ts                           # Actual schema code
- shared/routes.ts                           # Actual API contracts
- server/routes.ts                           # Actual implementations
```

### Making Changes
```bash
# Before modifying any file:
1. Read: docs/manual/VOL13_EXTENSION_PATTERNS.md
2. Check: shared/routes.ts (API contract)
3. Check: shared/schema.ts (data model)
4. Modify: server/routes.ts or client/src/pages/*.tsx
5. Test: npm run check (TypeScript)
```

---

## ⚠️ CRITICAL RULES FOR AI MODIFICATION

### ✅ SAFE TO MODIFY
- `server/routes.ts` - Add endpoints
- `client/src/pages/*.tsx` - Modify UI
- `shared/schema.ts` - Add tables/fields
- `shared/routes.ts` - Add contracts
- `client/src/components/*` - Add/modify components

### ⚠️ MODIFY WITH CAUTION
- `server/index.ts` - Core server
- `server/db.ts` - Database connection
- `server/replit_integrations/auth/*` - Authentication
- `client/src/main.tsx` - React entry
- `package.json` - Dependencies

### ❌ DO NOT MODIFY
- `node_modules/` - Dependencies
- `dist/` - Build output
- `.git/` - Version control
- `.env` - Secrets (use `.env.example` as template)

---

## 📝 NOTES FOR SPECIFIC AI SYSTEMS

### ChatGPT
- **Strength:** Code generation
- **Key files:** `server/routes.ts`, `shared/schema.ts`, page components
- **Use for:** Adding features, generating components

### Claude
- **Strength:** Architecture analysis
- **Key files:** All documentation, `docs/manual/VOL*`
- **Use for:** System design, refactoring, analysis

### Replit Agent
- **Strength:** Direct deployment
- **Key files:** All files (direct repo access)
- **Use for:** Full-stack development, deployment

---

**Last Updated:** 2026-01-03
**Version:** 1.0
**Total Files Documented:** 120+
