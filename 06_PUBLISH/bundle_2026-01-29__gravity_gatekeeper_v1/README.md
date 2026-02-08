# GRAVITY 02_TASKS — TASK QUEUE RULES

This folder is the authoritative task intake and staging area for GRAVITY operations.

---

## Purpose

**02_TASKS** is where:
- FOREMAN places active task orders
- OPERATOR stages task context and materials
- Work is tracked before execution
- Task completion is recorded

---

## Rules (Match OPERATOR_RULES.md)

### 1. Task Naming Convention

**Format:** `TASK__YYYYMMDD__topic__status.md`

**Examples:**
- `TASK__20260129__gravity_hardening__ACTIVE.md`
- `TASK__20260129__publish_repair__COMPLETE.md`
- `TASK__20260129__gatekeeper_v1__ACTIVE.md`

**Status values:** ACTIVE, COMPLETE, BLOCKED, WAITING

### 2. Task File Structure

Every task file must contain:

```markdown
# TASK: [Title]

## Objective
[What outcome must exist]

## Scope
WRITE: [exact paths]
READ: [exact paths]
SUPPORT: [exact paths]

## Constraints
- [constraint 1]
- [constraint 2]

## Deliverables
- [deliverable 1]
- [deliverable 2]

## Success Criteria
- [criterion 1]

## Stop Conditions
- [stop condition 1]

## Status
[ACTIVE | COMPLETE | BLOCKED | WAITING]

## Log Reference
C:\GRAVITY\04_LOGS\SESSION_LOG_YYYY-MM-DD.md
```

### 3. Task Authority

**Only FOREMAN can:**
- Create new task files
- Change task status to COMPLETE
- Mark tasks BLOCKED

**OPERATOR must:**
- Read task before execution
- Follow scope boundaries exactly
- Log work with phase labels
- Update task status when complete

### 4. Task Lifecycle

1. **FOREMAN creates task** → File written to 02_TASKS
2. **OPERATOR reads task** → Verifies scope and criteria
3. **OPERATOR executes** → Follows VERIFY → PATCH → TEST → LOG → PUBLISH
4. **OPERATOR updates status** → Changes to COMPLETE with log reference
5. **FOREMAN reviews** → Verifies deliverables

### 5. Scope Consistency

**02_TASKS task scope must match:**
- ALLOWED_PATHS.md (C:\GRAVITY write scope)
- OPERATOR_RULES.md (scope enforcement)
- Current session scope

**Stop condition:** If task scope contradicts ALLOWED_PATHS, OPERATOR stops and asks FOREMAN.

### 6. No Deletion

Task files are append-only historical records.
- Completed tasks stay in 02_TASKS
- Mark as COMPLETE, do not delete
- Archive old tasks if folder grows (move to 05_REFERENCE)

### 7. Cross-Reference

Each task file must reference its session log:
```
## Log Reference
C:\GRAVITY\04_LOGS\SESSION_LOG_YYYY-MM-DD.md
```

Session logs reference task files:
```
## [Task Name]
Task: C:\GRAVITY\02_TASKS\TASK__YYYYMMDD__topic__status.md
```

---

## Quality Checks

Before FOREMAN releases a task file:
- ✅ Objective is clear and specific
- ✅ Scope boundaries are explicit (no wildcards)
- ✅ Deliverables are measurable
- ✅ Success criteria are testable
- ✅ Stop conditions are explicit

Before OPERATOR begins work:
- ✅ Task has been read completely
- ✅ Scope is understood and accepted
- ✅ Stop conditions are noted
- ✅ Log file path is ready
- ✅ Deliverables are clear

---

## Examples

**ACTIVE task:** Describes work about to start
**COMPLETE task:** Has log reference, deliverables verified
**BLOCKED task:** Cannot proceed; states why and next step
**WAITING task:** Awaiting external input or approval

---

## Integration with OPERATOR_RULES

**02_TASKS enforces:**
- Scope Rule — Task scope limited to C:\GRAVITY
- Verification Rule — Task must be read before execution
- Minimal Change Rule — Task specifies only necessary work
- Logging Rule — Task references session log
- Stop Condition Rule — Task includes stop conditions

If any of these are violated, OPERATOR stops and escalates to FOREMAN.

---

## Folder Status

- WRITE: Yes (FOREMAN creates, OPERATOR updates)
- READ: Yes (both)
- DELETE: No (append-only)
- MODIFICATION: Status updates only

---

## Contact

Questions about task intake or queue: Review this file and OPERATOR_RULES.md.

Ambiguous task orders: OPERATOR stops and asks FOREMAN.
