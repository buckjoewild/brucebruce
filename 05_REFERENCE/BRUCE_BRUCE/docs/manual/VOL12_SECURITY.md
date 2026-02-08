# VOLUME 12: SECURITY GUIDE

**HarrisWildlands.com Technical Project Manual**  
**Version:** 1.0.0  
**Generated:** December 28, 2025

---

## 12.1 Security Model Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Authentication (Replit OIDC / Standalone)               │
│ 2. Session Management (PostgreSQL-backed)                   │
│ 3. Route Protection (isAuthenticated middleware)            │
│ 4. Data Isolation (userId scoping)                          │
│ 5. Input Validation (Zod schemas)                           │
│ 6. Error Handling (Safe responses)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 12.2 Authentication Security

### Replit OIDC

| Aspect | Implementation |
|--------|----------------|
| Protocol | OpenID Connect |
| Token validation | Server-side |
| Session storage | PostgreSQL |
| Cookie security | HttpOnly, Secure, SameSite |

### Session Configuration

```typescript
app.use(session({
  store: new PostgresStore({ pool, tableName: 'session' }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));
```

### Session Secret Requirements

- Minimum 32 characters
- Random generation recommended
- Never commit to version control
- Rotate periodically

**Generate secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 12.3 Authorization

### Route Protection

```typescript
// Middleware
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Route usage
app.get("/api/logs", isAuthenticated, async (req, res) => {
  const userId = getUserId(req);
  // ... user-scoped query
});
```

### User ID Extraction

```typescript
function getUserId(req: Request): string {
  return (req.user as any)?.claims?.sub;
}
```

### Data Isolation

All queries filter by userId:

```typescript
async getLogs(userId: string): Promise<Log[]> {
  return await db.select().from(logs)
    .where(eq(logs.userId, userId)); // Never returns other users' data
}
```

---

## 12.4 Input Validation

### Zod Schema Validation

```typescript
// Define schema
const insertLogSchema = createInsertSchema(logs)
  .omit({ id: true, userId: true, createdAt: true });

// Validate in route
app.post("/api/logs", isAuthenticated, async (req, res) => {
  try {
    const input = insertLogSchema.parse(req.body);
    // input is now validated and typed
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    throw err;
  }
});
```

### Protected Fields

Never allow client to set:
- `id` (auto-generated)
- `userId` (from session)
- `createdAt` (auto-generated)

```typescript
// Strip userId from updates
const { userId: _, ...safeUpdates } = req.body;
```

---

## 12.5 Data Security

### User Data Isolation

| Principle | Implementation |
|-----------|----------------|
| Query filtering | All queries include `userId` filter |
| Update protection | Updates verify ownership |
| Delete protection | Deletes verify ownership |

### Sensitive Data Handling

| Data Type | Protection |
|-----------|------------|
| Session secret | Environment variable |
| API keys | Environment variables |
| User content | User-scoped storage |
| Passwords | N/A (OIDC handles auth) |

### Red-Zone Data

Particularly sensitive fields:
- `familyConnection`
- `faithAlignment`
- Mood/stress metrics

Protected by:
- User scoping
- No sharing by default
- Export requires authentication

---

## 12.6 API Security

### CORS

- Same-origin requests only (default)
- No CORS headers exposed

### Rate Limiting

- Weekly insight cached daily
- AI calls have provider limits

### Error Responses

Safe error messages (no stack traces):

```typescript
// Good
res.status(404).json({ message: "Log not found" });

// Bad (exposes internals)
res.status(500).json({ error: err.stack });
```

---

## 12.7 Infrastructure Security

### Replit

- HTTPS enforced
- Network isolation
- Managed secrets

### Docker

Recommendations:
- Use non-root user in container
- Limit container resources
- Network isolation
- Regular image updates

```dockerfile
# Run as non-root (recommended addition)
RUN adduser --disabled-password --gecos '' appuser
USER appuser
```

### Database

- Strong password required
- Network isolation (Docker network)
- Connection pooling limits

---

## 12.8 Secret Management

### Environment Variables

| Secret | Storage |
|--------|---------|
| DATABASE_URL | Environment |
| SESSION_SECRET | Environment |
| GOOGLE_GEMINI_API_KEY | Environment |
| OPENROUTER_API_KEY | Environment |

### Never Do

- Commit secrets to Git
- Log secrets
- Expose secrets in error messages
- Hardcode secrets in code

### Best Practices

```bash
# .env file (Git-ignored)
DATABASE_URL=postgresql://...
SESSION_SECRET=random-secret

# Docker Compose
environment:
  - SESSION_SECRET=${SESSION_SECRET}
```

---

## 12.9 Security Checklist

### Authentication

- [ ] SESSION_SECRET is secure (32+ chars, random)
- [ ] Sessions stored in database (not memory)
- [ ] Cookie security flags set
- [ ] OIDC properly configured (or standalone mode)

### Authorization

- [ ] All API routes protected (except /api/health)
- [ ] User ID extracted from session only
- [ ] All queries filter by userId
- [ ] Updates/deletes verify ownership

### Input

- [ ] All input validated with Zod
- [ ] userId never from client
- [ ] SQL injection prevented (Drizzle ORM)
- [ ] XSS prevented (React escaping)

### Infrastructure

- [ ] HTTPS in production
- [ ] Secrets in environment variables
- [ ] No secrets in logs
- [ ] Regular dependency updates

---

## 12.10 Known Limitations

### Not Implemented

| Feature | Status |
|---------|--------|
| Rate limiting | Not implemented |
| IP blocking | Not implemented |
| 2FA | Not implemented |
| Audit logging | Not implemented |
| Field encryption | Not implemented |

### Mitigations

- Single-user system limits attack surface
- User-scoped data prevents cross-user access
- AI provider rate limits provide some protection

---

## 12.11 Security Updates

### Dependency Updates

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Force fix (use cautiously)
npm audit fix
```

### Reporting Security Issues

Contact repository owner via GitHub security advisories.

---

**Next Volume:** [VOL13 - Extension Patterns](./VOL13_EXTENSION_PATTERNS.md)
