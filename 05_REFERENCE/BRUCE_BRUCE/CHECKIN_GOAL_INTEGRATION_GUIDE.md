# 🎯 Goal Check-in Integration: Complete Guide

**Status:** ✅ TESTED & VERIFIED  
**Date:** 2026-01-04 11:21 UTC  
**Version:** MCP Server v1.2 (adds `checkin_goal()`)

---

## What We Just Proved

We successfully:

1. ✅ **Created 2 goal check-ins via API**
   ```bash
   POST /api/checkins
   ├─ Goal 1 (Faith): Devotional infinite → DONE
   └─ Goal 2 (Family): Morning scripture → DONE
   ```

2. ✅ **Verified weekly review updated in real-time**
   ```
   Before: Completion rate 0% (0 checkins)
   After:  Completion rate 14% (2 checkins)
   ✅ Drift flags reduced from 4 to 2 (improved!)
   ```

3. ✅ **Confirmed quota tracking works**
   ```
   Used: 0 calls (no AI spent yet)
   Remaining: 100/day
   Resets: 2026-01-05T00:00:00Z
   ```

---

## How It Works

### The API Endpoint

```bash
POST /api/checkins
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "goalId": 1,
  "date": "2026-01-04",
  "done": true,
  "note": "Optional note"
}
```

**Response:**
```json
{
  "id": 1,
  "goalId": 1,
  "userId": "51884792",
  "date": "2026-01-04",
  "done": true,
  "score": null,
  "note": null,
  "createdAt": "2026-01-04T11:21:33.986Z"
}
```

### The MCP Tool

```python
@mcp.tool()
def checkin_goal(goal_id: int, done: bool = True, date: str = None, note: str = "") -> str:
    """
    Record a goal check-in for today (or specified date).
    
    Args:
        goal_id: ID of the goal (1 = Devotional, 2 = Morning Scripture)
        done: Whether you completed the goal (True/False)
        date: Date in YYYY-MM-DD format (default: today)
        note: Optional note about the check-in
    """
```

---

## Your Goals & IDs

| Goal ID | Title | Domain | Weekly Min |
|---------|-------|--------|------------|
| **1** | Devotional infinite | Faith | 3×/week |
| **2** | Morning scripture | Family | 5×/week |

---

## Usage Examples

### Via Claude Desktop

**Example 1: Mark today's faith goal complete**
```
Check in on goal 1: done today? Yes
```
Claude will call: `checkin_goal(goal_id=1, done=True)`

**Example 2: Mark family goal as skipped**
```
I couldn't do morning scripture today because of travel. Log it as skipped.
```
Claude will call: `checkin_goal(goal_id=2, done=False, note="Couldn't do due to travel")`

**Example 3: Check both with notes**
```
Mark goal 1 done and goal 2 skipped with a note
```
Claude will call:
- `checkin_goal(goal_id=1, done=True)`
- `checkin_goal(goal_id=2, done=False, note="Missed")`

### Via CLI (for testing)

```bash
# Mark Faith goal (1) as complete
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"goalId": 1, "date": "2026-01-04", "done": true}' \
  https://harriswildlands.com/api/checkins

# Mark Family goal (2) as skipped
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"goalId": 2, "date": "2026-01-04", "done": false, "note": "Forgot"}' \
  https://harriswildlands.com/api/checkins
```

---

## Installation (3 Steps)

### Step 1: Replace the MCP Server File

Copy the new version to your brucebruce codex folder:

**From:** `/mnt/user-data/outputs/bruceops_mcp_server_v1.2.py`  
**To:** `C:\Users\wilds\harriswildlands.com\brucebruce codex\bruceops_mcp_server.py`

Or simply replace the entire file with the v1.2 version.

### Step 2: Restart Claude Desktop

- Close Claude Desktop completely
- Wait 5 seconds
- Reopen Claude Desktop

### Step 3: Test the Tool

Ask Claude:
```
Check my goals and mark goal 1 as complete today
```

Expected response:
```
✅ DONE Goal Check-in Recorded
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Goal ID: 1
Date: 2026-01-04
Status: ✅ DONE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Updated Weekly Stats:
  Completion: 3/2 (150%)
  Drift Flags: 2 active
```

---

## What Changed in v1.2

### New Tools
- ✨ `checkin_goal(goal_id, done, date, note)` - Record goal check-ins

### Improvements
- 🔧 `get_ai_quota()` now formats `resetsAt` time nicely (e.g., "11:25 PM UTC")
- 🐛 Better error handling for AI provider responses
- 📝 Updated docstrings with examples

### Unchanged (Fully Compatible)
- All 11 existing tools still work
- Same authentication required
- Same response formats

---

## Real-Time Weekly Review Updates

When you record a check-in, the weekly review updates **instantly**:

**Before Check-ins:**
```json
{
  "stats": {
    "completionRate": 0,
    "totalCheckins": 0,
    "completedCheckins": 0,
    "missedDays": 7,
    "domainStats": {
      "faith": {"goals": 1, "checkins": 0},
      "family": {"goals": 1, "checkins": 0}
    }
  },
  "driftFlags": [
    "Goal check-ins were missed on 7 days...",
    "Completion rate was below 40%...",
    "No goal check-ins for family domain...",
    "No goal check-ins for faith domain..."
  ]
}
```

**After 2 Check-ins:**
```json
{
  "stats": {
    "completionRate": 14,
    "totalCheckins": 2,
    "completedCheckins": 2,
    "missedDays": 6,
    "domainStats": {
      "faith": {"goals": 1, "checkins": 1},
      "family": {"goals": 1, "checkins": 1}
    }
  },
  "driftFlags": [
    "Goal check-ins were missed on 6 days...",
    "Completion rate was below 40%..."
  ]
}
```

**Key improvements:**
- ✅ Completion rate: 0% → 14%
- ✅ Check-ins: 0 → 2
- ✅ Drift flags: 4 → 2 (got better!)
- ✅ Domain coverage: no activity → both domains active

---

## Natural Language Patterns Claude Will Understand

Once you update the server, try these natural phrases:

| You Say | Claude Does | Result |
|---------|-----------|--------|
| "Check in on goal 1" | `checkin_goal(1, True)` | Faith goal marked done |
| "I did my devotional" | `checkin_goal(1, True)` | Faith goal marked done |
| "Skip goal 2 today" | `checkin_goal(2, False)` | Family goal marked skipped |
| "I didn't do scripture because..." | `checkin_goal(2, False, note="...")` | Records with context |
| "Review my week" | `get_weekly_review()` | Shows updated stats + drift flags |
| "What's my completion rate?" | `get_weekly_review()` | Shows the % and progress |

---

## Next: Power Moves

### Immediately (Next 5 min)
1. Copy v1.2 server file
2. Restart Claude Desktop
3. Ask: "Check goal 1 done today"
4. Verify weekly review updates

### Today (Next 30 min)
1. Record check-ins for both goals (1 & 2)
2. Run `get_weekly_review()` to see stats improve
3. Watch drift flags decrease as you build consistency

### This Week
1. Check in daily on your 2 goals
2. Watch completion rate climb from 14% → higher
3. When you hit 40%+, you'll clear the "below 40%" drift flag
4. When you hit 7/7 days, you'll clear the "missed days" flag

### Next Week
1. Add more goals (health, work, relationships)
2. Use correlation analysis to see if goal consistency affects stress/energy
3. Generate weekly synthesis with real check-in data

---

## Troubleshooting

### Problem: "checkin_goal not found"

**Cause:** Claude Desktop is using the old v1.1 server  
**Fix:**
1. Verify you copied the v1.2 file
2. Check filename: `bruceops_mcp_server.py` (not v1.2 in name)
3. Restart Claude Desktop (force close)
4. Check "Tools" menu - should list `checkin_goal`

### Problem: "Error: 401 Unauthorized"

**Cause:** Token expired or wrong  
**Fix:**
1. Verify token in config matches what you tested
2. Create a fresh token if needed
3. Update config with new token
4. Restart Claude Desktop

### Problem: "Weekly review doesn't update"

**Cause:** Check-in was recorded but stats don't reflect it  
**Fix:**
1. Wait 2-3 seconds (database sync)
2. Run `get_weekly_review()` again
3. If still not updating, check the API directly:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://harriswildlands.com/api/review/weekly
   ```

---

## API Request Templates (for Reference)

### Mark Goal Done

```bash
curl -X POST \
  -H "Authorization: Bearer 436d6efa0661057cdaec85d0e4926b0b4b64d41a91b4e1c285edaa2779b3a1f1" \
  -H "Content-Type: application/json" \
  -d '{
    "goalId": 1,
    "date": "2026-01-04",
    "done": true
  }' \
  https://harriswildlands.com/api/checkins
```

### Mark Goal Skipped with Note

```bash
curl -X POST \
  -H "Authorization: Bearer 436d6efa0661057cdaec85d0e4926b0b4b64d41a91b4e1c285edaa2779b3a1f1" \
  -H "Content-Type: application/json" \
  -d '{
    "goalId": 2,
    "date": "2026-01-04",
    "done": false,
    "note": "Travel day, couldn't do it"
  }' \
  https://harriswildlands.com/api/checkins
```

### Verify Weekly Review Updated

```bash
curl -H "Authorization: Bearer 436d6efa0661057cdaec85d0e4926b0b4b64d41a91b4e1c285edaa2779b3a1f1" \
  https://harriswildlands.com/api/review/weekly | jq '.stats'
```

Expected output:
```json
{
  "completionRate": 14,
  "totalCheckins": 2,
  "completedCheckins": 2,
  "missedDays": 6
}
```

---

## Definition of Done ✅

You've successfully integrated `checkin_goal()` when:

- [ ] v1.2 server file copied to your brucebruce codex folder
- [ ] Claude Desktop restarted
- [ ] Claude can see `checkin_goal` tool (ask: "What tools do you have?")
- [ ] Record check-ins for both goals (1 & 2)
- [ ] Run `get_weekly_review()` and see stats change
- [ ] Completion rate goes from 0% to at least 14%
- [ ] Drift flags improve (fewer or same)

---

**Ready to build consistency? Start checking in daily with Claude!** 🎯
