# VOLUME 10: CONFIGURATION REFERENCE

**HarrisWildlands.com Technical Project Manual**  
**Version:** 1.0.0  
**Generated:** December 28, 2025

---

## 10.1 Environment Variables

### Required Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Session encryption key |
| `PORT` | No | Server port (default: 5000) |

### AI Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_PROVIDER` | No | `gemini`, `openrouter`, or `off` (default: `off`) |
| `GOOGLE_GEMINI_API_KEY` | No | Google AI Studio API key |
| `OPENROUTER_API_KEY` | No | OpenRouter API key |

### Authentication

| Variable | Required | Description |
|----------|----------|-------------|
| `ISSUER_URL` | Auto | Replit OIDC issuer (auto-provided) |
| `REPL_ID` | Auto | Replit environment ID (auto-provided) |
| `STANDALONE_MODE` | No | Enable auto-login (`true`/`false`) |

### Environment Mode

| Variable | Values | Description |
|----------|--------|-------------|
| `NODE_ENV` | `development`, `production` | Runtime environment |

---

## 10.2 Database Configuration

### Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

### Replit (Auto-provisioned)

```
DATABASE_URL=postgresql://neon_user:neon_pass@neon.host:5432/harriswildlands
```

### Docker

```
DATABASE_URL=postgresql://postgres:postgres@db:5432/harriswildlands
```

### Local Development

```
DATABASE_URL=postgresql://localhost:5432/bruceops
```

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

## 10.3 TypeScript Configuration

### tsconfig.json

```json
{
  "include": ["client/src/**/*", "shared/**/*", "server/**/*"],
  "exclude": ["node_modules", "build", "dist", "**/*.test.ts"],
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./node_modules/typescript/tsbuildinfo",
    "noEmit": true,
    "module": "ESNext",
    "strict": true,
    "lib": ["esnext", "dom", "dom.iterable"],
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "types": ["node", "vite/client"],
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

### Path Aliases

| Alias | Path | Usage |
|-------|------|-------|
| `@/*` | `./client/src/*` | Frontend imports |
| `@shared/*` | `./shared/*` | Shared code imports |
| `@assets` | `./attached_assets` | Asset imports |

---

## 10.4 Vite Configuration

### vite.config.ts

```typescript
export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    // Dev-only plugins (Replit environment)
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [cartographer(), devBanner()]
      : []),
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
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
```

### Build Output

| Path | Contents |
|------|----------|
| `dist/public/` | Frontend bundle |
| `dist/index.cjs` | Backend bundle |

---

## 10.5 Tailwind Configuration

### tailwind.config.ts

```typescript
export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: ".5625rem", // 9px
        md: ".375rem",  // 6px
        sm: ".1875rem", // 3px
      },
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        // ... more color definitions
      },
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        display: ["'Outfit'", "sans-serif"],
        mono: ["'Fira Code'", "monospace"],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography")
  ],
};
```

### CSS Variables (index.css)

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode overrides */
}
```

---

## 10.6 Docker Configuration

### Dockerfile

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

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "${PORT:-5000}:5000"
    environment:
      - STANDALONE_MODE=true
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/harriswildlands
      - SESSION_SECRET=${SESSION_SECRET:-standalone-secret-change-me}
      - PORT=5000
      - NODE_ENV=production
      - AI_PROVIDER=${AI_PROVIDER:-off}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY:-}
      - GOOGLE_GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY:-}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=harriswildlands
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres-data:
```

---

## 10.7 NPM Scripts

### package.json Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `NODE_ENV=development tsx server/index.ts` | Start dev server |
| `build` | `tsx script/build.ts` | Production build |
| `start` | `NODE_ENV=production node dist/index.cjs` | Start production |
| `check` | `tsc` | Type checking |
| `db:push` | `drizzle-kit push` | Sync schema |

### Common Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production
npm run start

# Type check
npm run check

# Sync database schema
npm run db:push

# Docker deployment
docker compose up
```

---

## 10.8 Replit Configuration

### .replit

Configured for automatic:
- Port detection (5000)
- Build commands
- Run commands

### replit.nix

Nix packages for:
- Node.js 20
- PostgreSQL client
- Build tools

---

## 10.9 Session Configuration

### express-session Setup

```typescript
app.use(session({
  store: new PostgresStore({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));
```

---

## 10.10 Default Values

### Application Defaults

| Setting | Default |
|---------|---------|
| Port | 5000 |
| AI Provider | off |
| Theme | lab |
| AI Tone | balanced |
| Reminder Time | 07:00 |

### Database Defaults

| Field | Default |
|-------|---------|
| Log vices | false |
| Idea status | draft |
| Goal status | active |
| Goal priority | 2 |
| Check-in done | false |

---

**Next Volume:** [VOL11 - Deployment Guide](./VOL11_DEPLOYMENT.md)
