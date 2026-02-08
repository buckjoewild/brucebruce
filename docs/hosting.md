# Harris Wildlands MUD — Hosting Guide

## Quick Start (Docker)

```bash
# Build
docker build -t harris-mud .

# Run
docker run -p 5000:5000 harris-mud

# Or with docker-compose
docker compose up -d
```

### Verify

```bash
# HTTP — should return CRT terminal HTML
curl http://localhost:5000/

# WebSocket — connect with any WS client
wscat -c ws://localhost:5000/ws
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Bind address |
| `PORT` | `5000` | Listen port |
| `IDLE_MODE` | `0` | Set `1` to block all builds (safe unattended mode) |
| `MUD_BRUCE_AUTOPILOT` | `true` | Set `false` to disable Bruce NPC |
| `USE_CODEX` | _(unset)_ | Enable real Codex patch generation |
| `CODEX_DRYRUN` | _(unset)_ | Codex dry-run mode |
| `CODEX_CLI` | _(unset)_ | Path to Codex CLI binary |

---

## Reverse Proxy Configs

Both configs below handle the critical WebSocket upgrade on `/ws`.

### Caddy (recommended)

```
mud.harriswildlands.com {
    reverse_proxy localhost:5000
}
```

Caddy handles WebSocket upgrades automatically — no extra headers needed.
TLS is provisioned via Let's Encrypt by default.

### Nginx

```nginx
upstream mud_backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name mud.harriswildlands.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mud.harriswildlands.com;

    ssl_certificate     /etc/letsencrypt/live/mud.harriswildlands.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mud.harriswildlands.com/privkey.pem;

    location / {
        proxy_pass http://mud_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://mud_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }
}
```

---

## DNS Configuration

### Option A: Replit Custom Domain

1. Open the Replit deployment panel
2. Go to Settings > Custom Domains
3. Add `mud.harriswildlands.com`
4. Replit provides an **A record** IP and a **TXT record** for verification
5. At your DNS provider, create:
   - `A` record: `mud.harriswildlands.com` → _(IP from Replit)_
   - `TXT` record: `_replit-verify.mud.harriswildlands.com` → _(value from Replit)_
6. Wait for DNS propagation (up to 48h, usually minutes)

### Option B: VPS (DigitalOcean, Linode, etc.)

1. Provision a VPS with Docker installed
2. Clone the repo and run `docker compose up -d`
3. At your DNS provider, create:
   - `A` record: `mud.harriswildlands.com` → _(VPS public IP)_
4. Set up Caddy or Nginx as above for TLS + reverse proxy

---

## WebSocket Path Reference

The MUD uses a single server that multiplexes HTTP and WebSocket:

- **HTTP** `GET /` — serves the CRT terminal HTML page
- **WebSocket** `ws://host:port/ws` — MUD game connection

The frontend HTML uses a relative WebSocket URL derived from the page origin,
so it works behind any reverse proxy without configuration. The key requirement
is that your proxy passes WebSocket upgrade headers on the `/ws` path.

---

## Production Checklist

- [ ] `IDLE_MODE=1` if leaving unattended
- [ ] Reverse proxy with TLS termination
- [ ] DNS A record pointing to host
- [ ] Firewall: allow 80/443, block direct 5000 access
- [ ] Monitor with `docker compose logs -f`
