# BruceOps MCP v1 — Hardened & Ready

This MCP server provides Claude Desktop with direct, authenticated access to BruceOps API.

## What's New (v1 Hardening)

✅ **Bearer Token Auth** — Set `BRUCEOPS_TOKEN` env var; all requests include `Authorization: Bearer <token>` header.  
✅ **Trace IDs** — Every request gets a unique `X-Trace-Id` header for debugging via API logs.  
✅ **Retries** — Automatic exponential backoff on transient failures (429, 502, 503, 504).  
✅ **Structured Errors** — Failed requests return `trace_id`, `status_code`, and `body` for easy troubleshooting.  
✅ **Write Tool** — `clip_url(title, url, notes, category)` creates ideas directly from Claude.

## Environment Variables

```bash
# Required (set in Claude Desktop's env or Replit secrets)
BRUCEOPS_TOKEN=<your-api-token-here>

# Optional (advanced tuning)
BRUCEOPS_API_BASE=https://harriswildlands.com  # default
BRUCEOPS_TIMEOUT=30                           # seconds
BRUCEOPS_MAX_RETRIES=2                        # retry attempts
```

### Getting a Token

1. Visit https://harriswildlands.com (or your instance).
2. Log in → Settings → API Tokens → Create Token.
3. Copy the token and add to your MCP server env vars.

## Tools Available

### Read Tools (AI-Analysis)

- `check_api_health()` — API status, database connection, AI provider health.
- `get_ai_quota()` — Current AI usage, remaining calls, cache stats.
- `get_recent_logs(days=7)` — Daily LifeOps logs summary.
- `search_logs(query, limit=10)` — Semantic search with AI insight.
- `list_ideas(status=None, limit=20)` — ThinkOps ideas.
- `get_idea_reality_check(idea_id)` — AI reality-check analysis.
- `list_goals(domain=None)` — Goals by domain.
- `get_weekly_review()` — Week summary, drift flags.
- `ask_ai_squad(question)` — Multi-model perspective.
- `find_correlations(days=30)` — Pattern discovery.
- `get_weekly_synthesis()` — AI narrative synthesis.
- `export_all_data()` — Export metadata.

### Write Tools

- `clip_url(title, url, notes="", category="research")` — Save a URL as an Idea in ThinkOps.
  - Posts to `/api/ideas` with the idea data.
  - Returns idea ID on success or error with trace_id.

## How It Works

**Unauthenticated requests** (no `BRUCEOPS_TOKEN`):
- If your API requires auth, requests will get 401/403.
- Error response includes `trace_id` to correlate with server logs.

**Authenticated requests** (with `BRUCEOPS_TOKEN`):
- All requests include `Authorization: Bearer <token>` header.
- Trace ID is generated and attached to every request.
- On transient failures (429, 502, 503, 504), the client retries with exponential backoff.
- Final response always includes `trace_id` for debugging.

## Example: Using clip_url in Claude Desktop

```text
User: Clip this article about productivity systems
URL: https://example.com/productivity-article
Notes: Interesting framework for goal-setting

Claude MCP Call:
clip_url(
  title="Productivity article: Goal-setting framework",
  url="https://example.com/productivity-article",
  notes="Interesting framework for goal-setting",
  category="learning"
)

Response:
✅ Clipped: Productivity article: Goal-setting framework (id: 42)
```

Then in BruceOps UI → ThinkOps → Ideas, the new idea appears with the clipped data.

## Troubleshooting

### 401/403 Errors
- Check that `BRUCEOPS_TOKEN` is set correctly.
- Verify token hasn't expired (Settings → API Tokens).
- Check trace_id in response and correlate with server logs.

### Timeout Errors
- Increase `BRUCEOPS_TIMEOUT` if your network is slow.
- Check if the API is under heavy load.

### Retries Not Working
- Retries only apply to transient codes (429, 502, 503, 504).
- For auth errors (401, 403), retries are skipped.

### Trace ID Missing
- All responses include `trace_id`; if missing, check logs.
- Share trace_id when reporting bugs.

## Architecture

```
safe_api_call()
  ├─ Generate or use X-Trace-Id header
  ├─ Merge with Bearer token from BRUCEOPS_TOKEN
  ├─ Retry loop (up to MAX_RETRIES):
  │   ├─ Send request with httpx.Client
  │   ├─ Check for transient status codes (429, 502, 503, 504)
  │   └─ Backoff: 0.6 * (2 ^ attempt) seconds
  ├─ Parse JSON response or structured error
  └─ Always return dict with trace_id

MCP Tool Functions (e.g., clip_url)
  └─ Call safe_api_call() with method, endpoint, and payload
  └─ Return human-readable string or error message with trace_id
```

## Verification Checklist

- [x] Bearer token auth via `BRUCEOPS_TOKEN` env var
- [x] Trace ID generation (`X-Trace-Id` header on every request)
- [x] Retries on 429, 502, 503, 504 with exponential backoff
- [x] Structured error responses include `trace_id` for debugging
- [x] `clip_url()` tool added and uses `/api/ideas` POST endpoint
- [x] All read tools tested against live API (smoke test passed ✅)

## Next Steps

1. **Set `BRUCEOPS_TOKEN`** in your Claude Desktop env or Replit secrets.
2. **Restart Claude Desktop** to pick up the new env var.
3. **Test in Claude**:
   ```text
   Can you check the API health for me?
   ```
4. **Clip content**: Ask Claude to save URLs using the `clip_url` tool.
5. **Monitor**: Check server logs (Settings → Logs) for trace_id correlations if anything fails.

---

**Questions?** Check the copilot-instructions.md for auth patterns, or review the MCP server source in `bruceops_mcp_server.py`.
