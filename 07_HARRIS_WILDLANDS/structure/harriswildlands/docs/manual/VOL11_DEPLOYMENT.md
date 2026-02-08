# VOLUME 11: DEPLOYMENT GUIDE

**HarrisWildlands.com Technical Project Manual**  
**Version:** 1.0.0  
**Generated:** December 28, 2025

---

## 11.1 Deployment Options

| Option | Best For | Complexity |
|--------|----------|------------|
| Replit | Quick start, managed hosting | Low |
| Docker | Self-hosting, privacy | Medium |
| Local | Development | Low |

---

## 11.2 Replit Deployment

### Prerequisites

1. Replit account
2. Fork/import repository

### Steps

```
1. Import repository
   └── github.com/buckjoewild/harriswildlands.com

2. Configure secrets
   ├── DATABASE_URL (auto-provisioned)
   ├── SESSION_SECRET (generate random)
   ├── GOOGLE_GEMINI_API_KEY (optional)
   └── OPENROUTER_API_KEY (optional)

3. Click "Run"
   └── Builds and starts automatically

4. Access via Replit URL
   └── *.repl.co or custom domain
```

### Environment Variables (Replit Secrets)

| Secret | Required | Notes |
|--------|----------|-------|
| DATABASE_URL | Auto | Neon PostgreSQL auto-provisioned |
| SESSION_SECRET | Yes | 32+ random characters |
| GOOGLE_GEMINI_API_KEY | No | For AI features |
| OPENROUTER_API_KEY | No | For AI features |

### Custom Domain

1. Go to Replit project settings
2. Add custom domain
3. Configure DNS:
   - A record → Replit IP
   - CNAME → replit.dev

---

## 11.3 Docker Deployment

### Prerequisites

1. Docker and Docker Compose
2. Git

### Quick Start

```bash
# Clone repository
git clone https://github.com/buckjoewild/harriswildlands.com.git
cd harriswildlands.com

# Create environment file
cp .env.example .env

# Edit .env with your settings
# Required: SESSION_SECRET
# Optional: AI keys

# Start services
docker compose up -d

# Access at http://localhost:5000
```

### Environment File (.env)

```bash
# Required
SESSION_SECRET=your-random-secret-here-32-chars-minimum

# Optional: AI features
AI_PROVIDER=off
GOOGLE_GEMINI_API_KEY=
OPENROUTER_API_KEY=

# Optional: Port
PORT=5000
```

### Docker Commands

| Command | Purpose |
|---------|---------|
| `docker compose up` | Start services |
| `docker compose up -d` | Start detached |
| `docker compose down` | Stop services |
| `docker compose logs -f` | View logs |
| `docker compose up --build` | Rebuild and start |

### Data Persistence

Data stored in Docker volume:
```yaml
volumes:
  postgres-data:
```

**Backup data:**
```bash
docker compose exec db pg_dump -U postgres harriswildlands > backup.sql
```

**Restore data:**
```bash
cat backup.sql | docker compose exec -T db psql -U postgres harriswildlands
```

---

## 11.4 Local Development

### Prerequisites

1. Node.js 20+
2. PostgreSQL 16+
3. Git

### Setup

```bash
# Clone repository
git clone https://github.com/buckjoewild/harriswildlands.com.git
cd harriswildlands.com

# Install dependencies
npm install

# Create local database
createdb bruceops

# Set environment variables
export DATABASE_URL=postgresql://localhost:5432/bruceops
export SESSION_SECRET=dev-secret-change-in-production

# Sync database schema
npm run db:push

# Start development server
npm run dev
```

### Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (hot reload) |
| `npm run build` | Production build |
| `npm run check` | Type checking |
| `npm run db:push` | Sync schema to database |

---

## 11.5 Standalone Mode

### Purpose

Run without Replit authentication for:
- Self-hosted deployments
- Local development
- Privacy-focused use

### Activation

```bash
# Via environment variable
STANDALONE_MODE=true

# Automatic detection
# When REPL_ID and ISSUER_URL are missing
```

### Behavior

- Auto-login enabled (no auth required)
- Single user mode
- Full feature access
- Data persists locally

---

## 11.6 Health Check

### Endpoint

```
GET /api/health
```

### Response

```json
{
  "status": "ok",
  "timestamp": "2025-12-28T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "standalone_mode": true,
  "database": "connected",
  "ai_provider": "gemini",
  "ai_status": "active"
}
```

### Docker Health Check

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

---

## 11.7 Production Checklist

### Security

- [ ] SESSION_SECRET is random 32+ characters
- [ ] DATABASE_URL uses secure password
- [ ] HTTPS enabled (Replit auto, Docker use reverse proxy)
- [ ] Environment variables not in code

### Performance

- [ ] NODE_ENV=production set
- [ ] Production build created (`npm run build`)
- [ ] Database has proper indexes (auto via Drizzle)

### Monitoring

- [ ] Health endpoint accessible
- [ ] Logs configured
- [ ] Backup strategy in place

### AI Features

- [ ] AI provider configured (or disabled)
- [ ] API keys stored securely
- [ ] Rate limits understood

---

## 11.8 Reverse Proxy (Docker)

### Nginx Example

```nginx
server {
    listen 80;
    server_name harriswildlands.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL with Certbot

```bash
sudo certbot --nginx -d harriswildlands.com
```

---

## 11.9 Updating Deployment

### Replit

```
1. Pull latest changes
   └── Git sync in Replit

2. Restart workflow
   └── Click "Stop" then "Run"
```

### Docker

```bash
# Pull latest
git pull origin main

# Rebuild and restart
docker compose down
docker compose up --build -d
```

### Database Migrations

```bash
# After schema changes
npm run db:push

# Docker version
docker compose exec app npm run db:push
```

---

## 11.10 Troubleshooting

### Database Connection Failed

```
Error: DATABASE_URL must be set
```

**Solution:** Ensure DATABASE_URL environment variable is set

### Port Already in Use

```
Error: EADDRINUSE: address already in use :::5000
```

**Solution:** Kill existing process or use different port

### Build Fails

```
Error: npm run build failed
```

**Solution:**
1. Check Node.js version (20+)
2. Clear node_modules and reinstall
3. Check for TypeScript errors

### AI Features Not Working

```
AI insights unavailable
```

**Solutions:**
1. Check AI_PROVIDER setting
2. Verify API key is set
3. Check API key validity
4. Review error logs

---

**Next Volume:** [VOL12 - Security Guide](./VOL12_SECURITY.md)
