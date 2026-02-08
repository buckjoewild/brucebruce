# Priority 3: Configuration & Deployment Reference

**Generated:** December 27, 2025  
**Project:** BruceOps / HarrisWildlands

---

## Table of Contents
1. [Vite Configuration](#vite-configuration)
2. [Tailwind Configuration](#tailwind-configuration)
3. [TypeScript Configuration](#typescript-configuration)
4. [Drizzle Configuration](#drizzle-configuration)
5. [Docker Deployment](#docker-deployment)
6. [Environment Variables](#environment-variables)
7. [Standalone Mode](#standalone-mode)

---

## Vite Configuration

**File:** `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import runtimeErrorModal from "@replit/vite-plugin-runtime-error-modal";
import devBanner from "@replit/vite-plugin-dev-banner";
import cartographer from "@replit/vite-plugin-cartographer";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorModal(),
    devBanner(),
    cartographer(),
  ],
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
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tabs",
          ],
        },
      },
    },
  },
});
```

### Path Aliases

| Alias | Path | Usage |
|-------|------|-------|
| `@/` | `client/src/` | Frontend components, pages, hooks |
| `@shared` | `shared/` | Shared types, schemas, routes |
| `@assets` | `attached_assets/` | Images and static assets |

---

## Tailwind Configuration

**File:** `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        // ... other semantic colors
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Consolas", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
```

---

## TypeScript Configuration

**File:** `tsconfig.json`

```json
{
  "include": ["client/src", "server", "shared"],
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "verbatimModuleSyntax": true,
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"],
      "@assets/*": ["./attached_assets/*"]
    }
  }
}
```

---

## Drizzle Configuration

**File:** `drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

### Database Commands

```bash
# Push schema changes to database
npm run db:push

# Generate migration files (if needed)
npx drizzle-kit generate

# Run migrations
npx drizzle-kit migrate
```

---

## Docker Deployment

**File:** `Dockerfile`

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Environment
ENV NODE_ENV=production
ENV PORT=5000
ENV STANDALONE_MODE=true

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "dist/index.cjs"]
```

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "${PORT:-5000}:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/bruceops
      - SESSION_SECRET=${SESSION_SECRET:-your-session-secret-here}
      - STANDALONE_MODE=true
      - AI_PROVIDER=${AI_PROVIDER:-off}
      - GOOGLE_GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY:-}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY:-}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=bruceops
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres-data:
```

---

## Environment Variables

### Required Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `SESSION_SECRET` | Yes | Session encryption key | Random 32+ char string |

### Authentication (Replit)

| Variable | Required | Description |
|----------|----------|-------------|
| `REPL_ID` | For Replit | Replit project identifier |
| `ISSUER_URL` | For Replit | OIDC issuer URL |

### AI Configuration

| Variable | Required | Description | Values |
|----------|----------|-------------|--------|
| `AI_PROVIDER` | No | AI provider selection | `gemini`, `openrouter`, `off` |
| `GOOGLE_GEMINI_API_KEY` | For Gemini | Gemini API key | `AIza...` |
| `OPENROUTER_API_KEY` | For OpenRouter | OpenRouter key | `sk-or-...` |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `STANDALONE_MODE` | `false` | Enable standalone mode |

---

## Standalone Mode

Standalone mode allows running BruceOps without Replit authentication.

### Activation

Set `STANDALONE_MODE=true` or run without `REPL_ID`/`ISSUER_URL`.

### Behavior

1. **Auto-login**: All requests use `standalone-user` identity
2. **Session Storage**: Memory-based (or PostgreSQL if available)
3. **Demo Mode**: Available via `?demo=true` URL parameter

### Standalone User

```typescript
const STANDALONE_USER = {
  claims: {
    sub: "standalone-user",
    email: "user@localhost",
    first_name: "Local",
    last_name: "User",
    profile_image_url: null,
  },
  access_token: "standalone-token",
  expires_at: Math.floor(Date.now() / 1000) + 86400 * 365,
};
```

### Health Check Endpoint

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "ok",
  "standalone_mode": true,
  "database": "connected",
  "ai_provider": "gemini",
  "ai_status": "active"
}
```

### Data Export

```bash
curl http://localhost:5000/api/export/data > backup.json
```

---

## Quick Deployment Commands

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Docker

```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down

# Reset database
docker-compose down -v
docker-compose up --build
```

### Database Operations

```bash
# Push schema changes
npm run db:push

# Check database connection
curl http://localhost:5000/api/health | jq .database
```
