# Configuration (Environment variables)

**Audience:** Operators  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Document all environment variables with their defaults and when to use them.

## Quick reference

| Variable | Required? | Default | Purpose |
|----------|-----------|---------|---------|
| `DATABASE_URL` | Yes | (none) | PostgreSQL connection string |
| `STANDALONE_MODE` | No | `false` | Enable auto-login for Docker |
| `SESSION_SECRET` | Recommended | (none) | Session encryption key |
| `AI_PROVIDER` | No | `off` | AI provider: `gemini`, `openrouter`, `off` |
| `GOOGLE_GEMINI_API_KEY` | If using Gemini | (none) | Gemini API key |
| `OPENROUTER_API_KEY` | If using OpenRouter | (none) | OpenRouter API key |
| `PORT` | No | `5000` | Server port |

## Database

### DATABASE_URL

**Required.** PostgreSQL connection string.

```
DATABASE_URL=postgres://user:password@host:port/database
```

Examples:
```bash
# Docker Compose internal
DATABASE_URL=postgres://postgres:postgres@db:5432/pgbruce

# External database
DATABASE_URL=postgres://myuser:mypass@db.example.com:5432/bruceops

# Neon serverless
DATABASE_URL=postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

## Authentication

### STANDALONE_MODE

Enables auto-login without Replit authentication.

```bash
STANDALONE_MODE=true   # Auto-login enabled
STANDALONE_MODE=false  # Replit OIDC required (default)
```

**When to use:**
- Docker deployments: `true`
- Replit: Not needed (uses OIDC)

### SESSION_SECRET

Used to encrypt session cookies.

```bash
SESSION_SECRET=your-random-32-char-string-here
```

**Generate a secure secret:**
```bash
openssl rand -hex 32
```

**If not set:**
- Development: Uses default (not secure)
- Production: Should always be set

### Replit-specific (auto-configured)

These are set automatically in Replit:

| Variable | Purpose |
|----------|---------|
| `REPL_ID` | Identifies the Repl |
| `ISSUER_URL` | OIDC issuer URL |
| `REPLIT_DOMAINS` | Allowed domains |

## AI providers

### AI_PROVIDER

Controls which AI service to use.

```bash
AI_PROVIDER=gemini     # Use Google Gemini
AI_PROVIDER=openrouter # Use OpenRouter
AI_PROVIDER=off        # Disable AI features
```

The system uses a "provider ladder" - if one fails, it tries the next.

### GOOGLE_GEMINI_API_KEY

Required if `AI_PROVIDER=gemini`.

```bash
GOOGLE_GEMINI_API_KEY=AIzaSy...
```

Get a key from [Google AI Studio](https://aistudio.google.com/).

### OPENROUTER_API_KEY

Required if `AI_PROVIDER=openrouter`.

```bash
OPENROUTER_API_KEY=sk-or-v1-...
```

Get a key from [OpenRouter](https://openrouter.ai/).

## Server

### PORT

Server port (default: 5000).

```bash
PORT=5000
```

**Note:** In Docker Compose, this is the container port. Map to a different host port in `docker-compose.yml` if needed.

## .env.example

The repository includes `.env.example` with documented defaults:

```bash
# Database (required)
DATABASE_URL=postgres://postgres:postgres@db:5432/pgbruce

# Authentication (standalone mode for Docker)
STANDALONE_MODE=true
SESSION_SECRET=change-me-to-a-random-string

# AI Provider (optional)
# Options: gemini, openrouter, off
AI_PROVIDER=off
# GOOGLE_GEMINI_API_KEY=
# OPENROUTER_API_KEY=

# Server
PORT=5000
```

## Environment precedence

1. Shell environment variables (highest)
2. `.env` file
3. `docker-compose.yml` environment section
4. Code defaults (lowest)

## Secrets management

**Never commit secrets to git:**
- `.env` is in `.gitignore`
- Use `.env.example` as a template
- For Replit: Use the Secrets tab

## References

- Standalone deployment: `20-standalone-deployment-docker-compose.md`
- AI provider ladder: `30-developer-reference/35-ai-provider-ladder.md`
- Auth modes: `24-security-local-lan-and-auth-modes.md`
