# Security: Local, LAN, and auth modes

**Audience:** Operators  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Document security posture for different deployment scenarios.

## Threat model

This is a **personal/family** application with:
- Single admin user (or small trusted group)
- Private data (logs, reflections, ideas)
- No public-facing requirements

The primary threats are:
1. Unauthorized access to personal data
2. Data loss or corruption
3. Privacy leakage through sharing

## Deployment scenarios

### Scenario 1: Local only (localhost)

**Access:** Only from the machine running Docker  
**Network exposure:** None  
**Auth mode:** STANDALONE_MODE (auto-login)

```yaml
# docker-compose.yml
ports:
  - "127.0.0.1:5000:5000"  # Bind to localhost only
```

**Security posture:** High
- No network attack surface
- Physical access required
- Data protected by OS user accounts

### Scenario 2: LAN access (home network)

**Access:** From any device on home network  
**Network exposure:** Local network only  
**Auth mode:** STANDALONE_MODE (auto-login)

```yaml
# docker-compose.yml
ports:
  - "5000:5000"  # All interfaces
```

**Security considerations:**
- Anyone on your network can access
- Trust model: "Family/household network is trusted"
- Router should block external access (default for most routers)

**Mitigation options:**
- Use a password-protected WiFi network
- Consider MAC address filtering
- For higher security, keep at localhost-only

### Scenario 3: Replit hosted

**Access:** Public internet (via Replit URL)  
**Network exposure:** Internet  
**Auth mode:** Replit OIDC

**Security posture:** Good
- Replit handles HTTPS/TLS
- Replit OIDC provides authentication
- Only authenticated users can access data

## Authentication modes comparison

| Mode | Use case | How it works | Security level |
|------|----------|--------------|----------------|
| **STANDALONE_MODE** | Docker/local | Auto-login as "Local User" | Relies on network security |
| **Replit OIDC** | Replit hosting | OAuth via Replit account | Authentication required |
| **Demo mode** | Evaluation | Client-side only, no data saved | N/A (no real data) |

### STANDALONE_MODE details

When `STANDALONE_MODE=true`:
1. No login screen appears
2. User is automatically authenticated as "Local User"
3. All API routes work without authentication checks
4. Data is still user-scoped in the database

**Assumption:** If you can reach the app, you're authorized.

### Replit OIDC details

When running on Replit (REPL_ID is present):
1. Login screen appears
2. User authenticates via Replit account
3. Session stored in PostgreSQL
4. User ID from Replit used for data scoping

## Session security

### SESSION_SECRET

Always set a strong session secret in production:

```bash
SESSION_SECRET=$(openssl rand -hex 32)
```

If not set:
- Sessions may be vulnerable to tampering
- Restart will invalidate all sessions

### Cookie settings

Sessions use these cookie settings:
- `httpOnly: true` (prevents JavaScript access)
- `secure: true` in production (HTTPS only)
- `sameSite: 'lax'` (CSRF protection)

## Database security

### Connection string

Never expose `DATABASE_URL` in logs or errors.

### Access control

In Docker Compose, the database is:
- Only accessible from within Docker network
- Not exposed to host (no port mapping by default)

If you expose the database:
```yaml
# NOT RECOMMENDED unless needed
ports:
  - "5432:5432"
```

## Data privacy

### Red-zone fields

Some fields are considered "red zone" (sensitive):
- `familyConnection`
- `faithAlignment`
- `driftCheck`

These are included in exports but should not be shared casually.

See: `40-protocols-and-governance/42-privacy-red-zones-and-sharing-boundaries.md`

## Recommendations by use case

### Personal use (most secure)
- Localhost-only binding
- STANDALONE_MODE
- Regular backups
- Physical security of machine

### Family/household use
- LAN access OK if network is trusted
- Consider who has network access
- Regular backups

### Sharing with collaborator
- Use Replit hosting with OIDC
- Each user gets their own data scope
- No data sharing between users (currently)

## References

- Configuration: `21-configuration-env.md`
- Privacy red-zones: `40-protocols-and-governance/42-privacy-red-zones-and-sharing-boundaries.md`
- Auth implementation: `30-developer-reference/34-auth-replit-oidc-and-fallbacks.md`
