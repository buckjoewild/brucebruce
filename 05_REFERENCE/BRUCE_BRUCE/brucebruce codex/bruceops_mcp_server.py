"""
BruceOps MCP Server
Provides Claude Desktop with direct access to BruceOps API
"""

from mcp.server.fastmcp import FastMCP
import httpx
import os
import uuid
import time
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import json
import sys

# Initialize FastMCP server
mcp = FastMCP("BruceOps")

# API Configuration - Use environment variable or default to production
API_BASE = os.getenv("BRUCEOPS_API_BASE", "https://harriswildlands.com")

# BRUCEOPS token (Bearer)
BRUCEOPS_TOKEN = os.getenv("BRUCEOPS_TOKEN")
TIMEOUT_S = float(os.getenv("BRUCEOPS_TIMEOUT", "30"))
MAX_RETRIES = int(os.getenv("BRUCEOPS_MAX_RETRIES", "2"))

DEFAULT_HEADERS = {
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


def log_api_call(tool_name: str, method: str, endpoint: str, timeout: float, status_code: Optional[int] = None, body: Optional[str] = None, exception: Optional[Exception] = None):
    """Log API call details to debug file (no secrets)."""
    timestamp = datetime.utcnow().isoformat() + "Z"
    url = f"{API_BASE}{endpoint}"
    
    log_entry = f"""
[{timestamp}]
Tool: {tool_name}
Method: {method}
URL: {url}
Timeout: {timeout}s
Python: {sys.executable}
httpx version: {httpx.__version__}
"""
    
    if exception:
        log_entry += f"Exception: {type(exception).__name__}: {str(exception)}\n"
    elif status_code is not None:
        body_preview = body[:120] if body else "(no body)"
        log_entry += f"Status: {status_code}\nBody (first 120 chars): {body_preview}\n"
    else:
        log_entry += "Status: No response\n"
    
    log_entry += "---\n"
    
    # Append to debug log
    try:
        debug_log_path = r"C:\GRAVITY\04_LOGS\PHASE3C_MCP_DEBUG.md"
        with open(debug_log_path, "a", encoding="utf-8") as f:
            f.write(log_entry)
    except Exception as e:
        # Silently fail if logging fails (don't break the tool)
        pass


def safe_api_call(method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
    """Make API call with error handling + retries + trace id."""
    url = f"{API_BASE}{endpoint}"
    headers = kwargs.pop("headers", {}) or {}
    trace_id = headers.get("X-Trace-Id") or str(uuid.uuid4())
    headers["X-Trace-Id"] = trace_id

    for attempt in range(MAX_RETRIES + 1):
        try:
            resp = client.request(method, url, headers=headers, **kwargs)

            # Retry on transient codes
            if resp.status_code in RETRY_STATUS and attempt < MAX_RETRIES:
                backoff = 0.6 * (2 ** attempt)
                time.sleep(backoff)
                continue

            resp.raise_for_status()

            ctype = (resp.headers.get("content-type") or "").lower()
            if "application/json" in ctype:
                data = resp.json()
                if isinstance(data, dict):
                    data.setdefault("trace_id", trace_id)
                    log_api_call("safe_api_call", method, endpoint, TIMEOUT_S, resp.status_code, resp.text)
                    return data
                log_api_call("safe_api_call", method, endpoint, TIMEOUT_S, resp.status_code, resp.text)
                return {"trace_id": trace_id, "data": data}

            # Non-JSON success responses (rare, but safer)
            log_api_call("safe_api_call", method, endpoint, TIMEOUT_S, resp.status_code, resp.text)
            return {"ok": True, "trace_id": trace_id, "text": resp.text}

        except httpx.HTTPStatusError as e:
            status = e.response.status_code if e.response else None
            body = None
            try:
                body = e.response.json()
            except Exception:
                body = (e.response.text if e.response else None)

            log_api_call("safe_api_call", method, endpoint, TIMEOUT_S, status, str(body) if body else None, e)

            return {
                "error": str(e),
                "status_code": status,
                "trace_id": trace_id,
                "body": body,
            }

        except (httpx.TimeoutException, httpx.TransportError) as e:
            log_api_call("safe_api_call", method, endpoint, TIMEOUT_S, exception=e)
            if attempt < MAX_RETRIES:
                time.sleep(0.6 * (2 ** attempt))
                continue
            return {"error": str(e), "trace_id": trace_id, "status_code": None}

        except Exception as e:
            log_api_call("safe_api_call", method, endpoint, TIMEOUT_S, exception=e)
            return {"error": f"Unexpected error: {str(e)}", "trace_id": trace_id}


# ============================================================================
# HEALTH & STATUS TOOLS
# ============================================================================

@mcp.tool()
def check_api_health() -> str:
    """
    Check BruceOps API health and connectivity.
    Returns server status, database connection, and AI provider status.
    """
    result = safe_api_call("GET", "/api/health")
    
    if "error" in result:
        error_msg = result.get("error", "Unknown error")
        status_code = result.get("status_code", "?")
        return f"❌ API Error (status {status_code}): {error_msg}\n\nCheck C:\\GRAVITY\\04_LOGS\\PHASE3C_MCP_DEBUG.md for details."
    
    status_emoji = "✅" if result.get("status") == "ok" else "⚠️"
    db_emoji = "✅" if result.get("database") == "connected" else "❌"
    
    output = f"""
{status_emoji} API Status: {result.get('status', 'unknown')}
{db_emoji} Database: {result.get('database', 'unknown')}

AI Providers:
"""
    
    ai_status = result.get("ai", {})
    for provider, status in ai_status.items():
        emoji = "✅" if status == "available" else "⚠️"
        output += f"  {emoji} {provider}: {status}\n"
    
    return output.strip()


@mcp.tool()
def get_ai_quota() -> str:
    """
    Get current AI usage quota and cost tracking.
    Returns daily usage, remaining calls, cache stats, and estimated costs.
    """
    result = safe_api_call("GET", "/api/ai/quota")
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    used = result.get("used", 0)
    limit = result.get("limit", 100)
    remaining = result.get("remaining", 0)
    cache_size = result.get("cacheSize", 0)
    reset_at = result.get("resetAt", "Unknown")
    
    # Estimate cost (assuming $0.0045 per call average)
    estimated_cost = used * 0.0045
    
    return f"""
📊 AI Usage Today:
   Used: {used}/{limit} calls
   Remaining: {remaining} calls
   Cache entries: {cache_size}
   
💰 Estimated cost: ${estimated_cost:.4f}
🔄 Resets at: {reset_at}
"""


# ============================================================================
# LIFEOPS - DAILY LOGS
# ============================================================================

@mcp.tool()
def get_recent_logs(days: int = 7) -> str:
    """
    Get recent daily logs from LifeOps.
    
    Args:
        days: Number of recent days to fetch (default 7)
    
    Returns summary of recent logs with key metrics.
    """
    result = safe_api_call("GET", "/api/logs")
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    logs = result if isinstance(result, list) else []
    
    # Sort by date descending and take most recent
    logs.sort(key=lambda x: x.get('date', ''), reverse=True)
    recent_logs = logs[:days]
    
    if not recent_logs:
        return "No logs found."
    
    output = f"📅 Last {len(recent_logs)} days:\n\n"
    
    for log in recent_logs:
        date = log.get('date', 'Unknown')
        energy = log.get('energy', 'N/A')
        stress = log.get('stress', 'N/A')
        mood = log.get('mood', 'N/A')
        top_win = log.get('topWin', 'None')
        
        output += f"**{date}**\n"
        output += f"  Energy: {energy}/10 | Stress: {stress}/10 | Mood: {mood}/10\n"
        output += f"  Win: {top_win}\n\n"
    
    return output


@mcp.tool()
def search_logs(query: str, limit: int = 10) -> str:
    """
    Search through logs using AI-powered semantic search.
    
    Args:
        query: Search query (e.g., "high energy days", "stress patterns")
        limit: Maximum number of results (default 10)
    
    Returns matching logs with AI analysis.
    """
    result = safe_api_call(
        "POST",
        "/api/ai/search",
        json={"query": query, "limit": limit}
    )
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    count = result.get("count", 0)
    samples = result.get("samples", [])
    insight = result.get("insight", "No analysis available")
    cached = result.get("cached", False)
    
    cache_note = " (cached ⚡)" if cached else " (fresh 🔥)"
    
    output = f"🔍 Found {count} matches{cache_note}\n\n"
    
    # Show sample logs
    for log in samples[:5]:  # Show up to 5 samples
        date = log.get('date', 'Unknown')
        energy = log.get('energy', 'N/A')
        stress = log.get('stress', 'N/A')
        top_win = log.get('topWin', 'None')
        
        output += f"**{date}**: Energy {energy}/10, Stress {stress}/10\n"
        if top_win != 'None':
            output += f"  Win: {top_win}\n"
        output += "\n"
    
    output += f"\n💡 **AI Insight:**\n{insight}\n"
    
    return output


# ============================================================================
# THINKOPS - IDEAS
# ============================================================================

@mcp.tool()
def list_ideas(status: Optional[str] = None, limit: int = 20) -> str:
    """
    List ideas from ThinkOps.
    
    Args:
        status: Filter by status (active, archived, exploring, building)
        limit: Maximum number of ideas to return
    
    Returns list of ideas with key details.
    """
    result = safe_api_call("GET", "/api/ideas")
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    ideas = result if isinstance(result, list) else []
    
    # Filter by status if provided
    if status:
        ideas = [i for i in ideas if i.get('status', '').lower() == status.lower()]
    
    # Sort by priority (descending) then excitement
    ideas.sort(key=lambda x: (
        -(x.get('priority', 0) or 0),
        -(x.get('excitement', 0) or 0)
    ))
    
    ideas = ideas[:limit]
    
    if not ideas:
        return f"No ideas found{' with status: ' + status if status else ''}."
    
    output = f"💡 {len(ideas)} Ideas:\n\n"
    
    for idea in ideas:
        title = idea.get('title', 'Untitled')
        status_val = idea.get('status', 'exploring')
        excitement = idea.get('excitement', 'N/A')
        feasibility = idea.get('feasibility', 'N/A')
        pitch = idea.get('pitch', '')
        
        output += f"**{title}** ({status_val})\n"
        output += f"  Excitement: {excitement}/10 | Feasibility: {feasibility}/10\n"
        if pitch:
            output += f"  {pitch[:100]}{'...' if len(pitch) > 100 else ''}\n"
        output += "\n"
    
    return output


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


@mcp.tool()
def get_idea_reality_check(idea_id: int) -> str:
    """
    Run AI reality check on a specific idea.
    
    Args:
        idea_id: ID of the idea to analyze
    
    Returns AI analysis of the idea's viability, risks, and recommendations.
    """
    result = safe_api_call(
        "POST",
        f"/api/ideas/{idea_id}/reality-check",
        json={}
    )
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    reality_check = result.get("realityCheck", {})
    cached = result.get("cached", False)
    
    cache_note = " (cached ⚡)" if cached else " (fresh 🔥)"
    
    output = f"🔎 Reality Check{cache_note}\n\n"
    
    # Extract key sections
    viability = reality_check.get("viability", "No analysis")
    risks = reality_check.get("risks", [])
    recommendations = reality_check.get("recommendations", [])
    
    output += f"**Viability:**\n{viability}\n\n"
    
    if risks:
        output += "**Risks:**\n"
        for risk in risks:
            output += f"  • {risk}\n"
        output += "\n"
    
    if recommendations:
        output += "**Recommendations:**\n"
        for rec in recommendations:
            output += f"  • {rec}\n"
    
    return output


# ============================================================================
# GOALS & CHECKINS
# ============================================================================

@mcp.tool()
def list_goals(domain: Optional[str] = None) -> str:
    """
    List current goals.
    
    Args:
        domain: Filter by domain (Health, Family, Faith, Work, etc.)
    
    Returns list of goals with progress and status.
    """
    result = safe_api_call("GET", "/api/goals")
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    goals = result if isinstance(result, list) else []
    
    # Filter by domain if provided
    if domain:
        goals = [g for g in goals if g.get('domain', '').lower() == domain.lower()]
    
    # Sort by priority
    goals.sort(key=lambda x: -(x.get('priority', 0) or 0))
    
    if not goals:
        return f"No goals found{' for domain: ' + domain if domain else ''}."
    
    output = f"🎯 {len(goals)} Goals:\n\n"
    
    for goal in goals:
        title = goal.get('title', 'Untitled')
        domain_val = goal.get('domain', 'General')
        status = goal.get('status', 'active')
        weekly_min = goal.get('weeklyMinimum', 0)
        
        output += f"**{title}** ({domain_val})\n"
        output += f"  Status: {status} | Weekly minimum: {weekly_min}\n\n"
    
    return output


@mcp.tool()
def get_weekly_review() -> str:
    """
    Get current week's review with stats and drift flags.
    
    Returns comprehensive weekly summary including:
    - Check-in completion rates
    - Goal progress
    - Drift flags
    - AI narrative (if available)
    """
    result = safe_api_call("GET", "/api/review/weekly")
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    stats = result.get("stats", {})
    drift_flags = result.get("driftFlags", [])
    
    total = stats.get("totalCheckins", 0)
    completed = stats.get("completedCheckins", 0)
    completion_rate = stats.get("completionRate", 0)
    missed_days = stats.get("missedDays", 0)
    
    output = f"""
📊 **Weekly Review**

**Check-in Stats:**
  Completed: {completed}/{total} ({completion_rate}%)
  Missed days: {missed_days}

"""
    
    if drift_flags:
        output += "⚠️ **Drift Flags:**\n"
        for flag in drift_flags:
            output += f"  • {flag}\n"
        output += "\n"
    else:
        output += "✅ No drift flags this week!\n\n"
    
    return output


# ============================================================================
# AI SQUAD
# ============================================================================

@mcp.tool()
def ask_ai_squad(question: str) -> str:
    """
    Get perspectives from AI Squad (Claude, Grok, ChatGPT simulations).
    
    Args:
        question: Your question for the AI squad
    
    Returns multiple AI perspectives on your question.
    """
    result = safe_api_call(
        "POST",
        "/api/ai/squad",
        json={"question": question}
    )
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    claude_resp = result.get("claude", {})
    grok_resp = result.get("grok", {})
    chatgpt_resp = result.get("chatgpt", {})
    cached = result.get("cached", False)
    
    cache_note = " (cached ⚡)" if cached else " (fresh 🔥)"
    
    output = f"🤖 **AI Squad Response**{cache_note}\n\n"
    
    output += f"**Claude** ({claude_resp.get('perspective', 'Systems Thinker')}):\n"
    output += f"{claude_resp.get('response', 'No response')}\n\n"
    
    output += f"**Grok** ({grok_resp.get('perspective', 'Data Analyst')}):\n"
    output += f"{grok_resp.get('response', 'Not implemented')}\n\n"
    
    output += f"**ChatGPT** ({chatgpt_resp.get('perspective', 'Human Advocate')}):\n"
    output += f"{chatgpt_resp.get('response', 'Not implemented')}\n"
    
    return output


# ============================================================================
# ANALYTICS & CORRELATIONS
# ============================================================================

@mcp.tool()
def find_correlations(days: int = 30) -> str:
    """
    Discover patterns and correlations in your data.
    
    Args:
        days: Number of days to analyze (default 30)
    
    Returns AI-discovered patterns across your logs, habits, and performance.
    """
    result = safe_api_call(
        "POST",
        "/api/ai/correlations",
        json={"days": days}
    )
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    correlations = result.get("correlations", "No analysis available")
    days_analyzed = result.get("daysAnalyzed", days)
    cached = result.get("cached", False)
    
    cache_note = " (cached ⚡)" if cached else " (fresh 🔥)"
    
    return f"""
🔗 **Correlation Analysis** ({days_analyzed} days){cache_note}

{correlations}
"""


@mcp.tool()
def get_weekly_synthesis() -> str:
    """
    Generate AI-powered narrative synthesis of your week.
    
    Returns comprehensive AI analysis of the week including:
    - Performance narrative
    - Pattern recognition
    - Recommendations
    """
    result = safe_api_call(
        "POST",
        "/api/ai/weekly-synthesis",
        json={}
    )
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    narrative = result.get("narrative", "No synthesis available")
    cached = result.get("cached", False)
    
    cache_note = " (cached ⚡)" if cached else " (fresh 🔥)"
    
    return f"""
📖 **Weekly Synthesis**{cache_note}

{narrative}
"""


# ============================================================================
# DATA EXPORT
# ============================================================================

# DISABLED: export_all_data() can be large and cause timeouts
# Uncomment if needed for Claude Desktop
# @mcp.tool()
# def export_all_data() -> str:
#     """
#     Export complete BruceOps dataset as JSON.
#     
#     Returns information about the export and a sample of the data structure.
#     Note: Full export should be downloaded via the Settings page UI.
#     """
#     result = safe_api_call("GET", "/api/export/data")
#     
#     if "error" in result:
#         return f"Error: {result['error']}"
#     
#     # Count items in each category
#     logs_count = len(result.get("logs", []))
#     ideas_count = len(result.get("ideas", []))
#     goals_count = len(result.get("goals", []))
#     checkins_count = len(result.get("checkins", []))
#     
#     return f"""
# 📦 **Export Summary**
# 
# Data available:
#   • Logs: {logs_count} entries
#   • Ideas: {ideas_count} entries
#   • Goals: {goals_count} entries
#   • Check-ins: {checkins_count} entries
# 
# To download the full export:
# 1. Visit Settings page in BruceOps UI
# 2. Click "Export All Data"
# 3. Save the JSON file
# 
# This tool shows metadata only. Use the UI for full download.
# """


# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    print(f"[*] BruceOps MCP Server starting...")
    print(f"[*] Connected to: {API_BASE}")
    print(f"[+] Ready for Claude Desktop!\n")
    mcp.run()
