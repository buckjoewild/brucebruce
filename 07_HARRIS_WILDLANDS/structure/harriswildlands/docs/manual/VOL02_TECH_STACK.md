# VOLUME 2: TECHNOLOGY STACK DEEP DIVE

**HarrisWildlands.com Technical Project Manual**  
**Version:** 1.0.0  
**Generated:** December 28, 2025

---

## 2.1 Frontend Stack

### React 18.3.1
**Purpose:** UI framework

| Aspect | Detail |
|--------|--------|
| Version | 18.3.1 |
| Why Chosen | Industry standard, large ecosystem, team familiarity |
| Usage Pattern | Functional components with hooks |
| Key Features | Concurrent rendering, automatic batching |

**Key Imports:**
```typescript
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
```

### Vite 7.3.0
**Purpose:** Build system and dev server

| Aspect | Detail |
|--------|--------|
| Version | 7.3.0 |
| Why Chosen | Fast HMR, ESM-native, simple config |
| Config File | `vite.config.ts` |

**Key Configuration:**
```typescript
// Path aliases
"@": "./client/src"
"@shared": "./shared"
"@assets": "./attached_assets"

// Build output
outDir: "dist/public"

// Plugins
- @vitejs/plugin-react
- @replit/vite-plugin-runtime-error-modal
- @replit/vite-plugin-cartographer (dev only)
- @replit/vite-plugin-dev-banner (dev only)
```

### Tailwind CSS 3.4.17
**Purpose:** Utility-first CSS framework

| Aspect | Detail |
|--------|--------|
| Version | 3.4.17 |
| Config File | `tailwind.config.ts` |
| Dark Mode | Class-based (`["class"]`) |
| Plugins | tailwindcss-animate, @tailwindcss/typography |

**Custom Configuration:**
```typescript
// Custom fonts
fontFamily: {
  sans: ["'DM Sans'", "sans-serif"],
  display: ["'Outfit'", "sans-serif"],
  mono: ["'Fira Code'", "monospace"],
}

// Custom border radius
borderRadius: {
  lg: ".5625rem", // 9px
  md: ".375rem",  // 6px
  sm: ".1875rem", // 3px
}
```

### shadcn/ui Components
**Purpose:** Pre-built accessible components

| Aspect | Detail |
|--------|--------|
| Base Library | Radix UI primitives |
| Styling | Tailwind CSS |
| Location | `client/src/components/ui/` |
| Components | 48 total |

**Component List:**
```
accordion, alert, alert-dialog, aspect-ratio, avatar, badge,
breadcrumb, button, calendar, card, carousel, chart, checkbox,
collapsible, command, context-menu, dialog, drawer, dropdown-menu,
form, hover-card, input, input-otp, label, menubar, navigation-menu,
pagination, popover, progress, radio-group, resizable, scroll-area,
select, separator, sheet, sidebar, skeleton, slider, StatusBadge,
switch, table, tabs, textarea, toast, toaster, toggle, toggle-group,
tooltip
```

### TanStack Query 5.60.5
**Purpose:** Server state management

| Aspect | Detail |
|--------|--------|
| Version | 5.60.5 |
| Pattern | Object-form queries (v5 requirement) |
| Config File | `client/src/lib/queryClient.ts` |

**Usage Pattern:**
```typescript
// Query
const { data, isLoading } = useQuery({
  queryKey: ['/api/logs'],
});

// Mutation
const mutation = useMutation({
  mutationFn: (data) => apiRequest('/api/logs', { method: 'POST', body: data }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/logs'] }),
});
```

### Wouter 3.3.5
**Purpose:** Client-side routing

| Aspect | Detail |
|--------|--------|
| Version | 3.3.5 |
| Why Chosen | Lightweight (1.5KB), hooks-based |

**Route Configuration (App.tsx):**
```typescript
<Switch>
  <Route path="/" component={Core} />
  <Route path="/life-ops" component={LifeOps} />
  <Route path="/goals" component={Goals} />
  <Route path="/think-ops" component={ThinkOps} />
  <Route path="/teaching" component={TeachingAssistant} />
  <Route path="/harris" component={HarrisWildlands} />
  <Route path="/settings" component={Settings} />
  <Route path="/reality-check" component={RealityCheck} />
  <Route path="/weekly-review" component={WeeklyReview} />
  <Route path="/chat" component={Chat} />
  <Route component={NotFound} />
</Switch>
```

### Recharts 2.15.4
**Purpose:** Data visualization

| Aspect | Detail |
|--------|--------|
| Version | 2.15.4 |
| Usage | Weekly Review charts |
| Components | BarChart, LineChart, PieChart |

### Lucide React 0.453.0
**Purpose:** Icon library

| Aspect | Detail |
|--------|--------|
| Version | 0.453.0 |
| Icon Count | 1000+ |
| Usage | Action icons, visual cues |

### React Hook Form 7.69.0
**Purpose:** Form handling

| Aspect | Detail |
|--------|--------|
| Version | 7.69.0 |
| Resolver | @hookform/resolvers/zod |
| Integration | shadcn/ui Form component |

---

## 2.2 Backend Stack

### Express.js 4.21.2
**Purpose:** HTTP server framework

| Aspect | Detail |
|--------|--------|
| Version | 4.21.2 |
| Entry Point | `server/index.ts` |
| Pattern | RESTful API |

**Middleware Chain:**
```typescript
1. express.json() - JSON body parsing
2. express.urlencoded() - URL-encoded body parsing
3. Request logging - Duration tracking
4. Session middleware - PostgreSQL-backed
5. Passport authentication - OIDC
6. Route handlers - Business logic
7. Error handler - Centralized errors
8. Static/Vite - Production/Development serving
```

### Node.js 20.x
**Purpose:** JavaScript runtime

| Aspect | Detail |
|--------|--------|
| Version | 20.x (LTS) |
| Module System | ESM |
| Type Definitions | @types/node 20.19.27 |

### TypeScript 5.6.3
**Purpose:** Type safety

| Aspect | Detail |
|--------|--------|
| Version | 5.6.3 |
| Config File | `tsconfig.json` |
| Strict Mode | Enabled |
| Module | ESNext |

**Path Aliases:**
```json
{
  "@/*": ["./client/src/*"],
  "@shared/*": ["./shared/*"]
}
```

### tsx 4.20.5
**Purpose:** TypeScript execution

| Aspect | Detail |
|--------|--------|
| Version | 4.20.5 |
| Usage | Development server (`npm run dev`) |

---

## 2.3 Database Stack

### PostgreSQL 16
**Purpose:** Primary data store

| Aspect | Detail |
|--------|--------|
| Version | 16 (Docker image) |
| Connection | pg Pool |
| URL Variable | `DATABASE_URL` |

### Drizzle ORM 0.39.3
**Purpose:** TypeScript ORM

| Aspect | Detail |
|--------|--------|
| Version | 0.39.3 |
| Schema File | `shared/schema.ts` |
| Dialect | PostgreSQL |
| Pattern | Schema-first |

**Connection Setup (server/db.ts):**
```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

### Drizzle Kit 0.31.8
**Purpose:** Schema management

| Aspect | Detail |
|--------|--------|
| Version | 0.31.8 |
| Config File | `drizzle.config.ts` |
| Sync Command | `npm run db:push` |
| Output Directory | `./migrations` |

### drizzle-zod 0.7.0
**Purpose:** Schema-to-Zod integration

| Aspect | Detail |
|--------|--------|
| Version | 0.7.0 |
| Usage | `createInsertSchema()` |

---

## 2.4 Authentication Stack

### Passport.js 0.7.0
**Purpose:** Authentication middleware

| Aspect | Detail |
|--------|--------|
| Version | 0.7.0 |
| Strategy | OIDC (OpenID Connect) |

### openid-client 6.8.1
**Purpose:** OIDC client implementation

| Aspect | Detail |
|--------|--------|
| Version | 6.8.1 |
| Issuer | Replit OIDC |

### express-session 1.18.2
**Purpose:** Session management

| Aspect | Detail |
|--------|--------|
| Version | 1.18.2 |
| Store | PostgreSQL (connect-pg-simple) |

### connect-pg-simple 10.0.0
**Purpose:** PostgreSQL session store

| Aspect | Detail |
|--------|--------|
| Version | 10.0.0 |
| Table | `session` |

---

## 2.5 AI Provider Stack

### Provider Ladder Architecture

```
Priority Order:
1. Gemini (Google AI Studio - free tier)
   ↓ (fallback if fails)
2. OpenRouter (GPT-4o-mini - paid)
   ↓ (fallback if fails)
3. Off (graceful degradation)
```

### Gemini Integration

| Aspect | Detail |
|--------|--------|
| Model | gemini-1.5-flash |
| API | Google Generative Language API v1beta |
| Rate Limit | Free tier limits |
| Env Variable | `GOOGLE_GEMINI_API_KEY` |

**API Call Pattern:**
```typescript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    })
  }
);
```

### OpenRouter Integration

| Aspect | Detail |
|--------|--------|
| Model | openai/gpt-4o-mini |
| API | OpenRouter Chat Completions |
| Cost | ~$0.15/1M input, $0.60/1M output |
| Env Variable | `OPENROUTER_API_KEY` |

**API Call Pattern:**
```typescript
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "openai/gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
  })
});
```

### AI Configuration

| Variable | Values | Default |
|----------|--------|---------|
| `AI_PROVIDER` | `gemini`, `openrouter`, `off` | `off` |
| `GOOGLE_GEMINI_API_KEY` | API key string | - |
| `OPENROUTER_API_KEY` | API key string | - |

---

## 2.6 DevOps Stack

### Docker Configuration

**Dockerfile:**
```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "run", "start"]
```

**docker-compose.yml Services:**
```yaml
services:
  app:
    build: .
    ports: ["${PORT:-5000}:5000"]
    environment:
      - STANDALONE_MODE=true
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/harriswildlands
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
```

### NPM Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `NODE_ENV=development tsx server/index.ts` | Development server |
| `build` | `tsx script/build.ts` | Production build |
| `start` | `NODE_ENV=production node dist/index.cjs` | Production server |
| `check` | `tsc` | Type checking |
| `db:push` | `drizzle-kit push` | Schema sync |

---

## 2.7 Full Dependency List

### Production Dependencies (49 packages)

| Package | Version | Purpose |
|---------|---------|---------|
| @hookform/resolvers | 3.10.0 | Form validation |
| @radix-ui/* | Various | UI primitives (20 packages) |
| @tanstack/react-query | 5.60.5 | Server state |
| class-variance-authority | 0.7.1 | Component variants |
| clsx | 2.1.1 | Class utilities |
| cmdk | 1.1.1 | Command palette |
| connect-pg-simple | 10.0.0 | Session store |
| date-fns | 3.6.0 | Date utilities |
| drizzle-orm | 0.39.3 | ORM |
| drizzle-zod | 0.7.0 | Schema validation |
| embla-carousel-react | 8.6.0 | Carousel |
| express | 4.21.2 | HTTP server |
| express-session | 1.18.2 | Sessions |
| framer-motion | 11.18.2 | Animations |
| googleapis | 148.0.0 | Google APIs |
| lucide-react | 0.453.0 | Icons |
| openid-client | 6.8.1 | OIDC |
| passport | 0.7.0 | Auth |
| pg | 8.16.3 | PostgreSQL driver |
| react | 18.3.1 | UI framework |
| react-dom | 18.3.1 | React DOM |
| react-hook-form | 7.69.0 | Forms |
| recharts | 2.15.4 | Charts |
| tailwind-merge | 2.6.0 | Tailwind utilities |
| vaul | 1.1.2 | Drawer |
| wouter | 3.3.5 | Routing |
| ws | 8.18.0 | WebSocket |
| zod | 3.24.2 | Schema validation |

### Development Dependencies (17 packages)

| Package | Version | Purpose |
|---------|---------|---------|
| @replit/vite-plugin-* | Various | Replit integration |
| @tailwindcss/typography | 0.5.15 | Typography plugin |
| @tailwindcss/vite | 4.1.18 | Vite plugin |
| @types/* | Various | TypeScript types |
| @vitejs/plugin-react | 4.7.0 | React plugin |
| drizzle-kit | 0.31.8 | Schema tools |
| esbuild | 0.25.0 | Bundler |
| tailwindcss | 3.4.17 | CSS framework |
| tsx | 4.20.5 | TS execution |
| typescript | 5.6.3 | Type system |
| vite | 7.3.0 | Build tool |

---

**Next Volume:** [VOL03 - Architecture Documentation](./VOL03_ARCHITECTURE.md)
