# Replit Deployment Prompt — MCP v1 Hardening

Copy and paste the entire section below (from `[START PROMPT]` to `[END PROMPT]`) into your Replit Agent or code manually.

---

## [START PROMPT]

### Objective
Harden the BruceOps MCP server with Bearer token auth, retries, trace IDs, and a `clip_url()` write tool. This enables Claude Desktop to call BruceOps API securely.

### Changes Required

**File: `brucebruce codex/bruceops_mcp_server.py`**

#### Step 1: Update imports (lines 1-12)
Add `import time` and `import uuid` after `import os`:

```python
from mcp.server.fastmcp import FastMCP
import httpx
import os
import time
import uuid
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import json
```

#### Step 2: Replace HTTP client config (lines 19-20)
Replace:
```python
# HTTP client for making requests
client = httpx.Client(timeout=30.0)
```

With:
```python
# Auth + transport config
BRUCEOPS_TOKEN = os.getenv("BRUCEOPS_TOKEN")  # Bearer token for programmatic access
TIMEOUT_S = float(os.getenv("BRUCEOPS_TIMEOUT", "30"))
MAX_RETRIES = int(os.getenv("BRUCEOPS_MAX_RETRIES", "2"))

DEFAULT_HEADERS: Dict[str, str] = {
    "User-Agent": "bruceops-mcp/1.1",
    "Accept": "application/json",
}
if BRUCEOPS_TOKEN:
    DEFAULT_HEADERS["Authorization"] = f"Bearer {BRUCEOPS_TOKEN}"

client = httpx.Client(
    timeout=TIMEOUT_S,
    headers=DEFAULT_HEADERS,
    limits=httpx.Limits(max_keepalive_connections=5, max_connections=10),
)

RETRY_STATUS = {429, 502, 503, 504}
```

#### Step 3: Replace `safe_api_call()` function
Replace the entire `safe_api_call()` function (starting at `def safe_api_call(method: str...`) with:

```python
def safe_api_call(method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
    """Make API call with auth, retries, trace id, and safe error handling."""
    url = f"{API_BASE}{endpoint}"
    headers = kwargs.pop("headers", {}) or {}
    trace_id = headers.get("X-Trace-Id") or str(uuid.uuid4())
    headers["X-Trace-Id"] = trace_id

    for attempt in range(MAX_RETRIES + 1):
        try:
            response = client.request(method, url, headers=headers, **kwargs)

            # Retry transient failures
            if response.status_code in RETRY_STATUS and attempt < MAX_RETRIES:
                time.sleep(0.6 * (2 ** attempt))
                continue

            response.raise_for_status()

            ctype = (response.headers.get("content-type") or "").lower()
            if "application/json" in ctype:
                data = response.json()
                if isinstance(data, dict):
                    data.setdefault("trace_id", trace_id)
                return data

            return {"ok": True, "trace_id": trace_id, "text": response.text}

        except httpx.HTTPStatusError as e:
            status = e.response.status_code if e.response else None
            body: Any = None
            try:
                body = e.response.json() if e.response else None
            except Exception:
                body = e.response.text if e.response else None
            return {"error": str(e), "status_code": status, "trace_id": trace_id, "body": body}

        except (httpx.TimeoutException, httpx.TransportError) as e:
            if attempt < MAX_RETRIES:
                time.sleep(0.6 * (2 ** attempt))
                continue
            return {"error": str(e), "status_code": None, "trace_id": trace_id}

        except Exception as e:
            return {"error": f"Unexpected error: {str(e)}", "trace_id": trace_id}
```

#### Step 4: Add `clip_url()` tool
Find the `list_ideas()` function and add this new tool **after it** (after the closing `return output` of `list_ideas`):

```python


@mcp.tool()
def clip_url(title: str, url: str, notes: str = "") -> str:
    """
    Save a URL into your Ideas inbox ("Clip to Brain").

    Args:
        title: Page title
        url: Page URL
        notes: Optional note / context
    """
    payload = {"title": title, "url": url}
    if notes:
        payload["notes"] = notes

    result = safe_api_call("POST", "/api/ideas", json=payload)
    if "error" in result:
        return f"Error: {result.get('error')} (status={result.get('status_code')}, trace_id={result.get('trace_id')})"

    # Best-effort formatting (API may return the created record or a success object)
    created_id = result.get("id") or result.get("idea", {}).get("id")
    return f"✅ Clipped: {title}\n🔗 {url}\n🆔 {created_id if created_id else '(id not returned)'}"
```

### Environment Variables

Set these in Replit Secrets (or your MCP server environment):

```
BRUCEOPS_API_BASE=https://harriswildlands.com
BRUCEOPS_TOKEN=<your-api-token-here>
BRUCEOPS_TIMEOUT=30
BRUCEOPS_MAX_RETRIES=2
```

**To get a token:**
1. Visit https://harriswildlands.com
2. Log in → Settings → API Tokens → Create Token
3. Copy the token and paste into `BRUCEOPS_TOKEN` above

### Verification

After changes, test locally or in Replit:

```bash
cd "brucebruce codex"
python -c "
import os
import bruceops_mcp_server
result = bruceops_mcp_server.check_api_health()
print('✅ Import OK')
print(result[:200])
"
```

Expected output: API health status or clean error with trace_id.

### Deploy

1. Commit changes: `git add . && git commit -m "MCP v1: Bearer auth, retries, trace IDs, clip_url tool"`
2. Push to Replit: `git push`
3. Redeploy: Click "Run" or trigger your Replit deployment workflow
4. Test in Claude Desktop:
   - Set `BRUCEOPS_TOKEN` in Claude Desktop env
   - Restart Claude Desktop
   - Ask: "Check the API health"
   - Should succeed without 401 errors

### Success Criteria

- ✅ `check_api_health()` returns 200 OK with trace_id
- ✅ Errors include `status_code` and `trace_id` for debugging
- ✅ `clip_url("Test", "https://example.com", "hello")` creates an Idea in UI
- ✅ Claude Desktop calls work without auth errors

## [END PROMPT]

---

## Usage

1. **Copy the entire prompt section** (between `[START PROMPT]` and `[END PROMPT]`).
2. **Paste into Replit Agent** or manually apply the steps.
3. **Set environment variables** in Replit Secrets.
4. **Commit and deploy** per your usual harriswildlands.com workflow.

---

## Reference

- Local changes applied: [brucebruce codex/bruceops_mcp_server.py](../brucebruce%20codex/bruceops_mcp_server.py)
- Full docs: [brucebruce codex/MCP_v1_README.md](../brucebruce%20codex/MCP_v1_README.md)
