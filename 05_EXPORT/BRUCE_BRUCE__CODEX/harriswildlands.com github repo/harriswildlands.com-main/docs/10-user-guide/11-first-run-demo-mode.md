# First run: Standalone mode vs Demo mode

**Audience:** End users  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Clarify the two ways to use the app without Replit authentication.

## Two modes explained

| Mode | Activation | Data Saved? | Use Case |
|------|------------|-------------|----------|
| **Standalone mode** | Automatic with Docker | Yes - to database | Real usage, self-hosted |
| **Demo mode** | `?demo=true` URL parameter | No - client-side only | Quick evaluation |

### Standalone mode (Docker users)

When you run the app via Docker Compose:

- You're **automatically logged in** as "Local User"
- Your data **is saved** to the PostgreSQL database
- No additional configuration needed
- This is the **default for self-hosted deployments**

**How to tell you're in standalone mode:**
- No login screen
- Data persists after restart

### Demo mode (evaluation)

To try the app without saving any data:

1. Open: `http://localhost:5000?demo=true`
2. You'll see sample data (logs, ideas, goals)
3. Changes are **not saved** - they exist only in your browser

**How to tell you're in demo mode:**
- Yellow banner at the top: "Demo Mode - Changes are temporary"
- Data resets when you close the browser

### Demo mode vs Standalone mode

| Question | Standalone | Demo |
|----------|------------|------|
| Is my data saved? | Yes | No |
| Will data survive restart? | Yes | No |
| Do I need to configure anything? | No | Add `?demo=true` to URL |
| Best for... | Daily use | Quick look around |

## Switching between modes

### To exit demo mode:
1. Remove `?demo=true` from the URL
2. Or clear your browser's localStorage

### To enter demo mode:
1. Add `?demo=true` to any page URL
2. Example: `http://localhost:5000?demo=true`

## Common questions

**Q: I'm running Docker but I see a login screen. What's wrong?**
A: Check that `STANDALONE_MODE=true` is set in your docker-compose.yml (it is by default).

**Q: I want to evaluate the app without Docker. Can I use demo mode?**
A: Demo mode requires the app to be running. If you're on the Replit-hosted version, you can add `?demo=true` to try it.

**Q: Why would I use demo mode?**
A: To show someone the interface without affecting your real data, or to test UI features.

## References

- Quickstart: `10-quickstart-standalone-docker.md`
- Auth modes (operator): `20-operator-guide/24-security-local-lan-and-auth-modes.md`
