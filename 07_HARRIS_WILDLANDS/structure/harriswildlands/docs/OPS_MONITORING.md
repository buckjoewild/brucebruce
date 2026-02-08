# Ops Monitoring & Observability

## Endpoints
- `GET /api/health` – basic health check (no auth)
- `GET /api/health/detailed` – health + observability snapshot (no auth)
- `GET /api/status` – uptime + request stats (requires `OBSERVABILITY_TOKEN` if set)
- `GET /api/metrics` – text metrics (requires `OBSERVABILITY_TOKEN` if set)

## Environment Variables
- `OBSERVABILITY_TOKEN` – gate `/api/status` and `/api/metrics`
- `SLOW_REQUEST_MS` – log + alert slow requests
- `ALERT_WEBHOOK_URL` – generic webhook (JSON payload)
- `DISCORD_WEBHOOK_URL` – Discord webhook
- `EMAIL_ALERT_WEBHOOK_URL` – email webhook (Zapier/Make/etc)

## Smoke Test
```bash
npm run smoke:test
```

## Logs
Logs are written to `./logs`:
- `requests-YYYY-MM-DD.log`
- `slow-requests-YYYY-MM-DD.log`
- `errors-YYYY-MM-DD.log`
- `alerts-YYYY-MM-DD.log`
- `fatal-YYYY-MM-DD.log`
