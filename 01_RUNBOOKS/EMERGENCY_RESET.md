# GRAVITY — EMERGENCY RESET

Use this when confusion, drift, or overload occurs.

This is not a failure. This is a circuit breaker.

---

## What Triggers Emergency Reset

- You are uncertain about scope
- Instructions seem contradictory
- You have made multiple errors in sequence
- You feel "stuck" or looping
- API/MCP is offline and you cannot proceed
- You are about to do something outside scope

**Do not wait.** Reset immediately.

---

## The Reset Process

### Step 1: STOP

Stop all work.
Put down the current task.
Do not finish what you were doing.

---

### Step 2: READ (In This Order)

Read these documents in this exact order:

1. **This file** (you are reading it)
2. **C:\GRAVITY\00_INDEX\START_HERE.md**
3. **C:\GRAVITY\01_RUNBOOKS\OPERATOR_RULES.md**

Read slowly.
Do not skip.
Verify you understand each section before moving on.

---

### Step 3: VERIFY HEALTH

Check system status:

```
Call: bruceops:check_api_health
Expected: ✅ API Status: ok, Database: connected

If FAIL:
  - Note the failure
  - Wait 30 seconds
  - Retry once
  - If still fails: System is offline. Stop. Notify FOREMAN.
```

---

### Step 4: LOG THE RESET

Write entry to SESSION_LOG_YYYY-MM-DD.md:

```markdown
## [Emergency Reset]

**Time:** [timestamp]
**Trigger:** [what caused the reset]
**Action:** Read START_HERE.md and OPERATOR_RULES.md
**Status:** Reset complete, ready to receive new instructions

Proceeding slowly.
```

---

### Step 5: WAIT FOR DIRECTION

Do not resume work.
Wait for FOREMAN to provide new instruction.

When FOREMAN provides new task:
- Read it carefully
- Ask questions if unclear
- Follow SESSION_START.md
- Proceed methodically

---

## What Reset Does

Emergency reset:
- ✅ Clears your current task
- ✅ Resets your understanding of scope
- ✅ Re-verifies system health
- ✅ Logs what happened
- ✅ Puts you in position to receive new instruction

Emergency reset does NOT:
- ❌ Undo completed work
- ❌ Delete logs or artifacts
- ❌ Delete published bundles
- ❌ Change system rules
- ❌ Lose any data

---

## After Reset

When ready to proceed:

1. **Read:** C:\GRAVITY\00_INDEX\CURRENT_STATE.md
2. **Verify:** What is the current operational state?
3. **Wait:** FOREMAN provides next task
4. **Read:** C:\GRAVITY\01_RUNBOOKS\SESSION_START.md
5. **Execute:** Using OPERATOR_RULES.md

---

## This Is Not Failure

Emergency reset is a designed feature.

It exists so that:
- You can recover from confusion cleanly
- You do not propagate errors
- You do not work outside scope
- You do not create incomplete/bad output
- Clarity is preserved

Using emergency reset is correct behavior.

---

## Summary

When stuck:
1. STOP
2. Read START_HERE.md
3. Read OPERATOR_RULES.md
4. Verify health
5. Log the reset
6. Wait for FOREMAN

That is all.

You are safe.
Proceed grounded.
