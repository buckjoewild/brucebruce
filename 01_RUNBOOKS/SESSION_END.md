# GRAVITY — SESSION END

Use this runbook when finishing work or ending a session.

Do not end a session incomplete.

---

## Completion Checklist

Before ending, verify all of these:

### Task Completion

- [ ] Task order was fulfilled
- [ ] All required files were created/modified
- [ ] All changes were tested
- [ ] All test results are logged
- [ ] No files were modified outside scope

**If incomplete:** Finish the work first, then proceed.

---

### Log Entry

- [ ] SESSION_LOG_YYYY-MM-DD.md has an entry for this task
- [ ] Entry includes: [VERIFY], [PATCH], [TEST], [LOG], [PUBLISH] sections
- [ ] Entry includes evidence (file listings, command outputs)
- [ ] Entry has no secrets or credentials
- [ ] Status is marked: COMPLETE or INCOMPLETE

**If missing:** Write log entry now, then proceed.

---

### Publish Bundle

- [ ] Bundle directory exists: C:\GRAVITY\06_PUBLISH\bundle_YYYY-MM-DD__topic\
- [ ] Bundle contains work artifacts
- [ ] Bundle contains SESSION_LOG snapshot
- [ ] Bundle directory is readable
- [ ] Log entry references bundle path

**If missing:** Create bundle now, then proceed.

---

### State Update

- [ ] CURRENT_STATE.md is updated
- [ ] Last session information is recorded
- [ ] Current active project is cleared (if work is done)

**If missing:** Update now, then proceed.

---

## Final Verification

### Run Verification Checks

1. **File existence:**
   ```
   List C:\GRAVITY\04_LOGS\
   Verify SESSION_LOG_YYYY-MM-DD.md exists
   ```

2. **Bundle existence:**
   ```
   List C:\GRAVITY\06_PUBLISH\
   Verify bundle_* directory exists with artifacts
   ```

3. **Log entry completeness:**
   ```
   Read last entry in SESSION_LOG
   Verify it has [VERIFY], [PATCH], [TEST], [LOG], [PUBLISH]
   ```

4. **No orphaned files:**
   ```
   List C:\GRAVITY\03_WORK\
   Verify only files related to published work remain
   ```

---

## Session End Entry

**Add to SESSION_LOG:**

```markdown
## [Session End]

**Time:** [timestamp]
**Status:** [COMPLETE or INCOMPLETE]
**Work Completed:** [task name]
**Bundle:** [path]

**Final Checks:**
- ✅ All changes tested
- ✅ Log complete
- ✅ Bundle published
- ✅ State updated

Session closed.
```

---

## Incomplete Sessions

If work is incomplete:

1. **Log it explicitly:**
   ```markdown
   ## [Session Incomplete]
   
   **Reason:** [why work stopped]
   **State:** [what was partially done]
   **Next Step:** [what needs to happen next]
   **Bundle:** [temporary location or "not published"]
   ```

2. **Leave breadcrumbs:**
   - Save work-in-progress notes
   - Update CURRENT_STATE.md with incomplete status
   - Note exact files that need finishing

3. **Do not publish incomplete work**

4. **Close session:**
   - Add session end entry
   - Mark as INCOMPLETE
   - Note when to resume

---

## System Shutdown

If this is the last session before shutdown:

1. **Complete the checklist above**
2. **Verify all work is published**
3. **Update CURRENT_STATE.md with final state**
4. **Add note to SESSION_LOG:**
   ```markdown
   System shutting down. All work published. Ready for restart.
   ```

---

## Recovery After Restart

When restarting:

1. Read SESSION_START.md
2. Check last_session.json in C:\GRAVITY\02_STATE\
3. Read last entry in SESSION_LOG_YYYY-MM-DD.md
4. Verify no incomplete work
5. Proceed with new task or resume incomplete work

---

## Summary

Session end ensures:
- Work is complete and tested
- Work is logged fully
- Work is published and deliverable
- System state is clean
- Restart is safe

Never skip session end.
