# Authentication: Replit OIDC and fallbacks

**Audience:** Developers  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Document the authentication system with all its modes.

## Authentication modes

| Mode | Condition | Behavior |
|------|-----------|----------|
| **Replit OIDC** | `REPL_ID` present | Full OAuth flow via Replit |
| **Standalone** | `STANDALONE_MODE=true` | Auto-login as "Local User" |
| **Demo** | `?demo=true` URL param | Client-side demo data |

## Implementation files

| File | Purpose |
|------|---------|
| `server/replit_integrations/auth/replitAuth.ts` | OIDC + standalone logic |
| `client/src/hooks/use-auth.ts` | Frontend auth state |
| `client/src/hooks/use-demo.tsx` | Demo mode state |

## Replit OIDC flow

```
1. User visits /api/login/replit
2. Redirect to Replit OAuth
3. User authenticates on Replit
4. Callback to /api/auth/callback
5. Session created in PostgreSQL
6. User info stored in session
7. Redirect to app
```

### Key environment variables

| Variable | Purpose |
|----------|---------|
| `REPL_ID` | Triggers OIDC mode |
| `ISSUER_URL` | OIDC issuer (Replit sets this) |
| `SESSION_SECRET` | Session encryption |

### Session storage

Sessions stored in PostgreSQL via `connect-pg-simple`:

```typescript
app.use(session({
  store: new PgSession({ pool: db.pool }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));
```

## Standalone mode

When `STANDALONE_MODE=true` and not in Replit:

```typescript
// server/replit_integrations/auth/replitAuth.ts
if (process.env.STANDALONE_MODE === 'true' && !process.env.REPL_ID) {
  // Auto-create session with local user
  req.session.user = {
    id: 'local-user',
    username: 'Local User',
    email: null
  };
}
```

### Behavior

- No login screen
- All requests authenticated as "Local User"
- Data scoped to `userId: 'local-user'`
- Sessions still stored in PostgreSQL

## Demo mode

When `?demo=true` is in the URL:

```typescript
// client/src/hooks/use-demo.tsx
const isDemo = new URLSearchParams(window.location.search).get('demo') === 'true';

if (isDemo) {
  // Load demo data from localStorage
  // Bypass API calls
  // Show demo banner
}
```

### Behavior

- Client-side only (no server changes)
- Demo data seeded in localStorage
- Changes not persisted to database
- Yellow banner shown to user

## Auth state (frontend)

```typescript
// client/src/hooks/use-auth.ts
export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
```

## Protected routes

### Backend

```typescript
// server/routes.ts
function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

app.get('/api/logs', requireAuth, async (req, res) => {
  // Handler
});
```

### Frontend

```typescript
// Redirect to login if not authenticated
const { user, isLoading } = useAuth();

if (isLoading) return <Loading />;
if (!user) return <Redirect to="/login" />;
```

## User data structure

```typescript
interface User {
  id: string;           // Replit user ID or 'local-user'
  username: string;     // Display name
  email: string | null; // Email (nullable)
  profileImageUrl?: string;
}
```

## Security considerations

### Session security

- `httpOnly: true` - Prevents XSS access to cookie
- `secure: true` in production - HTTPS only
- `sameSite: 'lax'` - CSRF protection

### Standalone mode security

- Relies on network security (localhost/LAN)
- No authentication barrier
- Suitable for personal/trusted environments

### Demo mode security

- No real data exposed
- Demo data is synthetic
- No server-side state changes

## References

- Security: `20-operator-guide/24-security-local-lan-and-auth-modes.md`
- API routes: `32-api-routes-reference.md`
- Configuration: `20-operator-guide/21-configuration-env.md`
