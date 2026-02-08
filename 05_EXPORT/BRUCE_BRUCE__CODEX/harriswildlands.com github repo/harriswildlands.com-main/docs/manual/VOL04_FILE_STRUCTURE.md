# VOLUME 4: COMPLETE FILE STRUCTURE

**HarrisWildlands.com Technical Project Manual**  
**Version:** 1.0.0  
**Generated:** December 28, 2025

---

## 4.1 Repository Root

```
harriswildlands.com/
├── package.json           # Dependencies and scripts
├── package-lock.json      # Dependency lock file
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── drizzle.config.ts      # Drizzle ORM configuration
├── Dockerfile             # Docker image definition
├── docker-compose.yml     # Docker services orchestration
├── .replit                # Replit configuration
├── replit.nix             # Nix package configuration
├── replit.md              # Project documentation for agents
├── design_guidelines.md   # Frontend design guidelines
├── client/                # React frontend
├── server/                # Express backend
├── shared/                # Shared code (schema, routes)
├── scripts/               # Utility scripts
├── docs/                  # Documentation
├── attached_assets/       # User-uploaded assets
├── dist/                  # Production build output
└── migrations/            # Database migrations
```

---

## 4.2 Root Configuration Files

### package.json

| Field | Value |
|-------|-------|
| **name** | rest-express |
| **version** | 1.0.0 |
| **type** | module (ESM) |
| **license** | MIT |

**Scripts:**
```json
{
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "tsx script/build.ts",
  "start": "NODE_ENV=production node dist/index.cjs",
  "check": "tsc",
  "db:push": "drizzle-kit push"
}
```

### tsconfig.json

**Key Settings:**
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "strict": true,
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

### vite.config.ts

**Key Configuration:**
```typescript
export default defineConfig({
  plugins: [react(), runtimeErrorOverlay()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
  },
});
```

### tailwind.config.ts

**Key Settings:**
- Dark mode: class-based
- Content: `./client/index.html`, `./client/src/**/*.{ts,tsx}`
- Plugins: tailwindcss-animate, @tailwindcss/typography
- Custom fonts: DM Sans, Outfit, Fira Code

### drizzle.config.ts

```typescript
export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

---

## 4.3 Client Directory

```
client/
├── index.html             # HTML entry point
└── src/
    ├── main.tsx           # React entry point
    ├── App.tsx            # Router and providers
    ├── index.css          # Global styles
    ├── vite-env.d.ts      # Vite type declarations
    ├── components/        # React components
    │   ├── ui/            # shadcn/ui components (48)
    │   ├── Layout.tsx     # Main layout wrapper
    │   ├── ThemeProvider.tsx  # Theme context
    │   ├── DemoBanner.tsx     # Demo mode banner
    │   ├── PageBackground.tsx # Animated background
    │   ├── BotanicalMotifs.tsx # Decorative elements
    │   ├── CanopyView.tsx     # Visual component
    │   ├── HoverRevealImage.tsx # Interactive image
    │   └── InterfaceOverlay.tsx # UI overlay
    ├── hooks/             # Custom React hooks
    │   └── use-toast.ts   # Toast notifications
    ├── lib/               # Utilities
    │   ├── queryClient.ts # TanStack Query config
    │   └── utils.ts       # Helper functions
    └── pages/             # Route components
        ├── Dashboard.tsx      # /
        ├── LifeOps.tsx        # /life-ops
        ├── Goals.tsx          # /goals
        ├── ThinkOps.tsx       # /think-ops
        ├── RealityCheck.tsx   # /reality-check
        ├── TeachingAssistant.tsx # /teaching
        ├── HarrisWildlands.tsx   # /harris
        ├── WeeklyReview.tsx   # /weekly-review
        ├── Chat.tsx           # /chat
        ├── Settings.tsx       # /settings
        ├── BruceOps.tsx       # /bruce-ops
        └── not-found.tsx      # 404
```

### client/src/main.tsx

```typescript
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

### client/src/App.tsx

**Providers Stack:**
```typescript
<QueryClientProvider client={queryClient}>
  <ThemeProvider>
    <TooltipProvider>
      <Router />
      <Toaster />
    </TooltipProvider>
  </ThemeProvider>
</QueryClientProvider>
```

**Routes:**
| Path | Component | Purpose |
|------|-----------|---------|
| `/` | Core (Dashboard) | Main dashboard |
| `/life-ops` | LifeOps | Daily logging |
| `/goals` | Goals | Goal management |
| `/think-ops` | ThinkOps | Idea pipeline |
| `/reality-check` | RealityCheck | Idea validation |
| `/teaching` | TeachingAssistant | Lesson planning |
| `/harris` | HarrisWildlands | Content generation |
| `/weekly-review` | WeeklyReview | Weekly analytics |
| `/chat` | Chat | AI conversation |
| `/settings` | Settings | User preferences |
| `*` | NotFound | 404 page |

---

## 4.4 Server Directory

```
server/
├── index.ts               # Server entry point
├── routes.ts              # API route handlers
├── storage.ts             # Database access layer
├── db.ts                  # Database connection
├── google-drive.ts        # Google Drive integration
├── static.ts              # Static file serving
├── vite.ts                # Vite dev server integration
└── replit_integrations/
    └── auth/
        ├── index.ts       # Auth exports
        ├── replitAuth.ts  # OIDC implementation
        ├── routes.ts      # Auth routes
        └── storage.ts     # User storage
```

### server/index.ts

**Middleware Setup Order:**
1. `express.json()` - Body parsing
2. `express.urlencoded()` - Form data
3. Request logging middleware
4. Route registration (`registerRoutes`)
5. Error handler
6. Static/Vite serving

**Server Configuration:**
```typescript
const port = parseInt(process.env.PORT || "5000", 10);
httpServer.listen({
  port,
  host: "0.0.0.0",
  reusePort: true,
});
```

### server/routes.ts

**Endpoint Groups:**
| Group | Endpoints |
|-------|-----------|
| Health | GET /api/health |
| Auth | GET /api/me, login/callback/logout |
| Dashboard | GET /api/dashboard |
| Logs | GET/POST/PUT /api/logs |
| Ideas | GET/POST/PUT /api/ideas, POST /api/ideas/:id/reality-check |
| Teaching | GET/POST /api/teaching |
| Harris | POST /api/harris |
| Settings | GET/PUT /api/settings |
| Goals | GET/POST/PUT /api/goals |
| Checkins | GET/POST /api/checkins |
| Weekly Review | GET /api/review/weekly, POST /api/review/weekly/insight |
| Chat | POST /api/chat |
| Export | GET /api/export/data |

### server/storage.ts

**Interface Methods:**
```typescript
interface IStorage {
  // Logs
  getLogs(userId: string): Promise<Log[]>;
  createLog(userId: string, log: InsertLog): Promise<Log>;
  getLogByDate(userId: string, date: string): Promise<Log | undefined>;
  updateLog(userId: string, id: number, updates: InsertLog): Promise<Log | undefined>;
  updateLogSummary(userId: string, id: number, summary: string): Promise<Log>;
  
  // Ideas
  getIdeas(userId: string): Promise<Idea[]>;
  getIdea(userId: string, id: number): Promise<Idea | undefined>;
  createIdea(userId: string, idea: InsertIdea): Promise<Idea>;
  updateIdea(userId: string, id: number, updates: Partial<Idea>): Promise<Idea>;
  
  // Teaching
  getTeachingRequests(userId: string): Promise<TeachingRequest[]>;
  createTeachingRequest(userId: string, req: InsertTeachingRequest, output: any): Promise<TeachingRequest>;
  
  // Harris
  getHarrisContent(userId: string): Promise<HarrisContent[]>;
  createHarrisContent(userId: string, content: InsertHarrisContent, copy: any): Promise<HarrisContent>;
  
  // Goals
  getGoals(userId: string): Promise<Goal[]>;
  createGoal(userId: string, goal: InsertGoal): Promise<Goal>;
  updateGoal(userId: string, id: number, updates: Partial<Goal>): Promise<Goal>;
  
  // Checkins
  getCheckins(userId: string, startDate?: string, endDate?: string): Promise<Checkin[]>;
  upsertCheckin(userId: string, goalId: number, date: string, done: boolean, score?: number, note?: string): Promise<Checkin>;
  
  // Weekly Review
  getWeeklyReview(userId: string): Promise<WeeklyReviewData>;
  
  // Transcripts
  getTranscripts(userId: string): Promise<Transcript[]>;
  createTranscript(userId: string, transcript: InsertTranscript): Promise<Transcript>;
  updateTranscript(userId: string, id: number, updates: Partial<Transcript>): Promise<Transcript>;
  deleteTranscript(userId: string, id: number): Promise<boolean>;
}
```

### server/db.ts

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

---

## 4.5 Shared Directory

```
shared/
├── schema.ts              # Database schema + types
├── routes.ts              # API contract definitions
└── models/
    └── auth.ts            # Auth model exports
```

### shared/schema.ts

**Tables Defined:**
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `logs` | Daily calibration | vices, metrics, reflections |
| `ideas` | Idea pipeline | title, status, realityCheck |
| `goals` | Goal tracking | domain, title, weeklyMinimum |
| `checkins` | Goal progress | goalId, date, done, score |
| `teachingRequests` | Lesson plans | grade, standard, output |
| `harrisContent` | Brand content | contentType, generatedCopy |
| `userSettings` | User prefs | aiModel, theme, protocols |
| `settings` | Global settings | key, value |
| `driftFlags` | Pattern detection | type, sentence |
| `transcripts` | Voice braindumps | content, patterns |

### shared/routes.ts

**API Contract Pattern:**
```typescript
export const api = {
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/logs',
      responses: { 200: z.array(logSchema) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/logs',
      input: insertLogSchema,
      responses: { 
        201: logSchema,
        400: errorSchemas.validation 
      },
    },
  },
  // ... more endpoints
};
```

---

## 4.6 Documentation Directory

```
docs/
├── README.md                        # Documentation index
├── 00-start-here/
│   ├── 00-overview-and-reading-paths.md
│   └── 01-glossary.md
├── 10-user-guide/
│   ├── 10-quickstart-standalone-docker.md
│   ├── 11-first-run-demo-mode.md
│   ├── 12-lifeops-daily-logging.md
│   ├── 13-thinkops-ideas-pipeline.md
│   ├── 14-weekly-review.md
│   ├── 15-export-and-personal-backups.md
│   └── 16-troubleshooting.md
├── 20-operator-guide/
│   ├── 20-standalone-deployment-docker-compose.md
│   ├── 21-configuration-env.md
│   ├── 22-data-storage-and-persistence.md
│   ├── 23-updates-and-upgrades.md
│   ├── 24-security-local-lan-and-auth-modes.md
│   ├── 25-healthchecks-and-basic-monitoring.md
│   └── 26-disaster-recovery.md
├── 30-developer-reference/
│   ├── 30-architecture-overview.md
│   ├── 31-repo-layout.md
│   ├── 32-api-routes-reference.md
│   ├── 33-database-schema-reference.md
│   ├── 34-auth-replit-oidc-and-fallbacks.md
│   ├── 35-ai-provider-ladder.md
│   └── 36-validation-and-testing-checklist.md
├── 40-protocols-and-governance/
│   ├── 40-lifeops-thinkops-separation.md
│   ├── 41-drift-detection-signals.md
│   ├── 42-privacy-red-zones-and-sharing-boundaries.md
│   └── 43-non-goals-and-safety-constraints.md
├── 50-releases-and-evidence/
│   ├── 50-keystone-v1.0-2025-12-27.md
│   ├── 51-acceptance-test-checklist.md
│   └── 52-changelog.md
└── manual/                          # This technical manual
    ├── VOL01_EXECUTIVE_OVERVIEW.md
    ├── VOL02_TECH_STACK.md
    ├── VOL03_ARCHITECTURE.md
    ├── VOL04_FILE_STRUCTURE.md
    └── ... (18 volumes total)
```

---

## 4.7 Scripts Directory

```
scripts/
└── smoke-test.sh          # Automated verification script
```

**smoke-test.sh Tests:**
1. Health Endpoint - Checks /api/health returns 200
2. Health Fields - Validates JSON structure
3. Auth Status - Checks /api/me endpoint
4. Frontend - Validates HTML response
5. Export Endpoint - Tests /api/export/data
6. Weekly Review - Tests /api/review/weekly

---

## 4.8 UI Components

### shadcn/ui Components (48 files)

```
client/src/components/ui/
├── accordion.tsx      ├── menubar.tsx
├── alert-dialog.tsx   ├── navigation-menu.tsx
├── alert.tsx          ├── pagination.tsx
├── aspect-ratio.tsx   ├── popover.tsx
├── avatar.tsx         ├── progress.tsx
├── badge.tsx          ├── radio-group.tsx
├── breadcrumb.tsx     ├── resizable.tsx
├── button.tsx         ├── scroll-area.tsx
├── calendar.tsx       ├── select.tsx
├── card.tsx           ├── separator.tsx
├── carousel.tsx       ├── sheet.tsx
├── chart.tsx          ├── sidebar.tsx
├── checkbox.tsx       ├── skeleton.tsx
├── collapsible.tsx    ├── slider.tsx
├── command.tsx        ├── StatusBadge.tsx
├── context-menu.tsx   ├── switch.tsx
├── dialog.tsx         ├── table.tsx
├── drawer.tsx         ├── tabs.tsx
├── dropdown-menu.tsx  ├── textarea.tsx
├── form.tsx           ├── toast.tsx
├── hover-card.tsx     ├── toaster.tsx
├── input-otp.tsx      ├── toggle-group.tsx
├── input.tsx          ├── toggle.tsx
└── label.tsx          └── tooltip.tsx
```

### Custom Components (8 files)

| Component | Purpose |
|-----------|---------|
| Layout.tsx | Navigation and page structure |
| ThemeProvider.tsx | Theme context and switching |
| DemoBanner.tsx | Demo mode warning banner |
| PageBackground.tsx | Animated background effects |
| BotanicalMotifs.tsx | Decorative visual elements |
| CanopyView.tsx | Visual component |
| HoverRevealImage.tsx | Interactive image reveal |
| InterfaceOverlay.tsx | UI overlay effects |

---

**Next Volume:** [VOL05 - Database Schema Reference](./VOL05_DATABASE_SCHEMA.md)
