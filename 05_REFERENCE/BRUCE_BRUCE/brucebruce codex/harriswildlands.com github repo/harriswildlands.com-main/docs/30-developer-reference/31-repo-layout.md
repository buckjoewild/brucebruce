# Repository layout

**Audience:** Developers  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Annotated directory tree for fast orientation.

## Root structure

```
harriswildlands.com/
├── client/                  # React frontend
├── server/                  # Express backend
├── shared/                  # Shared types and schemas
├── docs/                    # Documentation (this folder)
├── scripts/                 # Utility scripts
├── attached_assets/         # User-uploaded assets
├── Dockerfile               # Container build
├── docker-compose.yml       # Multi-container orchestration
├── package.json             # Node.js dependencies
├── tsconfig.json            # TypeScript config
├── tailwind.config.ts       # Tailwind CSS config
├── vite.config.ts           # Vite bundler config
├── drizzle.config.ts        # Drizzle ORM config
├── .env.example             # Environment template
├── replit.md                # Replit AI context
└── design_guidelines.md     # Frontend design system
```

## client/ (Frontend)

```
client/
├── src/
│   ├── App.tsx              # Root component, router
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles, CSS variables
│   │
│   ├── pages/               # Route components
│   │   ├── Home.tsx         # Landing page
│   │   ├── LifeOps.tsx      # Daily logging
│   │   ├── ThinkOps.tsx     # Ideas pipeline
│   │   ├── RealityCheck.tsx # AI reality check
│   │   ├── WeeklyReview.tsx # Weekly stats + insights
│   │   ├── Chat.tsx         # AI chat interface
│   │   ├── Settings.tsx     # User settings + export
│   │   └── not-found.tsx    # 404 page
│   │
│   ├── components/          # Reusable components
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── layout/          # Layout components
│   │   ├── app-sidebar.tsx  # Navigation sidebar
│   │   └── ThemeToggle.tsx  # Dark/light mode
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── use-auth.ts      # Authentication state
│   │   ├── use-demo.tsx     # Demo mode state
│   │   └── use-toast.ts     # Toast notifications
│   │
│   └── lib/                 # Utilities
│       ├── queryClient.ts   # TanStack Query setup
│       └── utils.ts         # Helper functions
│
└── index.html               # HTML template
```

## server/ (Backend)

```
server/
├── index.ts                 # Server entry point
├── routes.ts                # API route handlers
├── storage.ts               # Database access layer
├── vite.ts                  # Vite dev server integration
├── google-drive.ts          # Google Drive integration
│
└── replit_integrations/     # Replit-specific auth
    └── auth/
        └── replitAuth.ts    # OIDC implementation
```

## shared/ (Shared code)

```
shared/
├── schema.ts                # Drizzle models + Zod schemas
└── routes.ts                # Route type definitions
```

## docs/ (Documentation)

```
docs/
├── README.md                # Documentation index
├── 00-start-here/           # Entry point
├── 10-user-guide/           # End-user docs
├── 20-operator-guide/       # Self-hosting docs
├── 30-developer-reference/  # Technical reference
├── 40-protocols-and-governance/  # Philosophy + constraints
└── 50-releases-and-evidence/     # Release artifacts
```

## scripts/ (Utilities)

```
scripts/
└── smoke-test.sh            # Health check script
```

## Key files explained

| File | Purpose |
|------|---------|
| `shared/schema.ts` | All database models, insert schemas, types |
| `server/routes.ts` | All API endpoints |
| `server/storage.ts` | IStorage interface + DatabaseStorage implementation |
| `client/src/App.tsx` | Router + layout + providers |
| `client/src/lib/queryClient.ts` | TanStack Query config + apiRequest helper |

## Naming conventions

| Pattern | Example | Meaning |
|---------|---------|---------|
| `PascalCase.tsx` | `WeeklyReview.tsx` | React component |
| `kebab-case.tsx` | `not-found.tsx` | Page (wouter route) |
| `camelCase.ts` | `queryClient.ts` | Utility module |
| `UPPER_CASE` | `STANDALONE_MODE` | Environment variable |

## Import aliases

Configured in `vite.config.ts`:

| Alias | Path |
|-------|------|
| `@/` | `client/src/` |
| `@shared/` | `shared/` |
| `@assets/` | `attached_assets/` |

Example:
```typescript
import { Button } from "@/components/ui/button";
import { insertLogSchema } from "@shared/schema";
```

## References

- Architecture: `30-architecture-overview.md`
- API routes: `32-api-routes-reference.md`
- Database schema: `33-database-schema-reference.md`
