# GRAVITY — SESSION START

Use this runbook every time you begin work in GRAVITY.

Do not skip steps.

---

## Pre-Flight Checklist

### Step 1: Read Orientation Documents

**Time:** 2-3 minutes

Read these in order (you may have already done this):
1. C:\GRAVITY\00_INDEX\START_HERE.md
2. C:\GRAVITY\00_INDEX\SYSTEM_MAP.md
3. C:\GRAVITY\01_RUNBOOKS\OPERATOR_RULES.md

**Verify:** You understand roles, scope, and the execution rhythm.

---

### Step 2: Verify System Health

**Action:** Check API and MCP status

**Command sequence:**

1. Check BruceOps API health:
   ```
   - Call: bruceops:check_api_health
   - Expected: ✅ API Status: ok, Database: connected
   ```

2. Check MCP status:
   ```
   - Call: Desktop Commander:get_config
   - Expected: No errors, config retrieved
   ```

3. Record results in log entry

**Stop if:**
- API is down (❌ status)
- Database is disconnected
- MCP returns errors

**Recovery:** Read C:\GRAVITY\01_RUNBOOKS\EMERGENCY_RESET.md

---

### Step 3: Update CURRENT_STATE.md

**Action:** Record session start information

**Edit:** C:\GRAVITY\00_INDEX\CURRENT_STATE.md

**Update these fields:**
- Last updated: [current date/time]
- MCP Status: [operational/degraded/offline]
- API Status: [ok/error]
- Last Check: [timestamp]
- Current Work: [task name or "none"]

---

### Step 4: Create Today's Session Log

**Action:** Create new log file for today (if it doesn't exist)

**File:** C:\GRAVITY\04_LOGS\SESSION_LOG_YYYY-MM-DD.md

**Template:**

```markdown
# Session Log YYYY-MM-DD

[Session entries will be appended here]
```

**If file already exists:** Continue with appending entries during work.

---

### Step 5: Declare Intent

**Action:** Write the opening entry in today's session log

**Entry format:**

```markdown
## [Session Start]

**Time:** [timestamp]
**Operator:** Claude Desktop (or other identifier)
**Task:** [brief description of work to be done]
**Scope:** [which directories affected]

**Health Check:**
- ✅ API: [status]
- ✅ MCP: [status]
- ✅ Scope: Verified

**Next Step:** [first action in task order]

Ready to proceed.
```

---

### Step 6: Receive Task Order

**Action:** Wait for FOREMAN to provide the task

**What you need:**
- Clear description of work
- Scope boundaries (affected files/folders)
- Success criteria
- Any special rules or constraints

**If task is unclear:**
- Pause
- Quote the unclear part
- Ask for clarification
- Do not proceed until clear

---

## Quick Checklist

Before starting work:

- [ ] Read START_HERE.md
- [ ] Read OPERATOR_RULES.md
- [ ] Verify API health: ✅
- [ ] Verify MCP status: ✅
- [ ] Updated CURRENT_STATE.md
- [ ] Created/opened SESSION_LOG_YYYY-MM-DD.md
- [ ] Wrote session start entry
- [ ] Received task order from FOREMAN
- [ ] Understood task completely

If any checkbox is not ✅, do not proceed.

---

## Recovery

If you were interrupted:
1. Reread this file
2. Verify health checks
3. Append new session entry to existing log
4. Continue work

If system was restarted:
1. Reread START_HERE.md
2. Follow this checklist from the top
3. Check last_session.json to understand context
4. Continue from last known state

---

## You Are Now Ready

Proceed with task execution using:
- C:\GRAVITY\01_RUNBOOKS\OPERATOR_RULES.md (execution rhythm)
- C:\GRAVITY\03_WORK\GRAVITY_OPERATIONS_README.md (daily reference)
