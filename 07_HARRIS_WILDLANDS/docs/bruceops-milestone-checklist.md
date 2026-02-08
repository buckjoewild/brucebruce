# BruceOps: Program 6/10 → 10/10 Milestone Checklist

**Created:** 2025-12-27  
**Based on:** Treyspeed documentation analysis  
**Goal:** Boring reliability + reproducible releases + safe data

---

## How to Use This Checklist

Each milestone has:
- **Pass criteria**: Specific, binary conditions (it either passes or it doesn't)
- **Evidence required**: What you need to prove it's done
- **Estimated effort**: Rough time for Replit Agent or manual work

Mark items: ✅ PASS | ⏳ IN PROGRESS | ❌ BLOCKED | ⬜ NOT STARTED

---

# Milestone 1: Foundation Stability (Current → 7.5/10)

**Theme:** Make the pending checklist items PASS. This is non-negotiable before anything else.

| # | Task | Pass Criteria | Evidence Required | Effort | Status |
|---|------|---------------|-------------------|--------|--------|
| 1.1 | **Docker start verification** | `docker compose up` starts all containers without errors | Terminal output showing healthy containers + screenshot | 15 min | ⬜ |
| 1.2 | **DB persistence verification** | Create log → `docker compose down` → `docker compose up` → log still exists | Before/after screenshots or JSON export diff | 20 min | ⬜ |
| 1.3 | **Production build verification** | `npm run build` succeeds AND `npm start` serves the app | Build output + working localhost screenshot | 15 min | ⬜ |
| 1.4 | **Demo mode reconciliation** | Single documented truth: either default demo OR `?demo=true` required | Updated Quick Start + Keystone with matching language | 30 min | ⬜ |
| 1.5 | **Smoke test script** | Single command checks: `/api/health`, `/export`, `/weekly.pdf` | Script file + sample output | 45 min | ⬜ |

### M1 Completion Criteria
- [ ] All 5 items marked PASS with evidence
- [ ] Acceptance checklist in repo updated with today's date
- [ ] No "pending" items remain for core functionality

### M1 Deliverables
1. Updated `51-acceptance-test-checklist.md` with PASS status + dates
2. `scripts/smoke-test.sh` (or equivalent)
3. One-line demo mode instruction that matches reality

---

# Milestone 2: Operational Safety (7.5/10 → 8.5/10)

**Theme:** Backup, recovery, and security documentation. A user shouldn't lose their "truth ledger."

| # | Task | Pass Criteria | Evidence Required | Effort | Status |
|---|------|---------------|-------------------|--------|--------|
| 2.1 | **Document where data lives** | Clear statement: Docker volume path + Postgres location | Added to `22-data-storage-and-persistence.md` | 20 min | ⬜ |
| 2.2 | **Export cadence recommendation** | User guide states when/how often to export | Added to `15-export-and-personal-backups.md` | 15 min | ⬜ |
| 2.3 | **Backup procedure (operator)** | Step-by-step: volume backup + export backup | Added to `26-disaster-recovery.md` | 30 min | ⬜ |
| 2.4 | **Restore procedure documented** | Either working restore steps OR explicit "TBD" with workaround | Added to `26-disaster-recovery.md` | 30 min | ⬜ |
| 2.5 | **LAN security caveat** | Warning about network exposure when using IP access from phone | Added to `24-security-local-lan-and-auth-modes.md` | 20 min | ⬜ |
| 2.6 | **Auth mode documentation** | Clear explanation: OIDC vs standalone vs demo and when each applies | Added to `24-security-local-lan-and-auth-modes.md` | 30 min | ⬜ |

### M2 Completion Criteria
- [ ] A new user can answer "where is my data?" without asking
- [ ] An operator can backup AND restore (or knows restore is TBD)
- [ ] LAN access warning exists in docs

### M2 Deliverables
1. Completed `22-data-storage-and-persistence.md`
2. Completed `26-disaster-recovery.md`
3. Completed `24-security-local-lan-and-auth-modes.md`
4. Updated `15-export-and-personal-backups.md`

---

# Milestone 3: Automated Confidence (8.5/10 → 9.5/10)

**Theme:** Tests that catch regressions before users do.

| # | Task | Pass Criteria | Evidence Required | Effort | Status |
|---|------|---------------|-------------------|--------|--------|
| 3.1 | **Export shape test** | Automated test: JSON export includes expected entities (logs, ideas, goals, etc.) | Test file + passing CI/run | 1 hr | ⬜ |
| 3.2 | **Weekly review regression test** | Automated test: `/weekly.pdf` returns expected output format | Test file + passing run | 1 hr | ⬜ |
| 3.3 | **"AI OFF still works" test** | Automated test: Core app functions with no AI keys set | Test file + passing run | 45 min | ⬜ |
| 3.4 | **Health endpoint completeness** | `/api/health` returns: server status, DB status, AI provider status | Documented response schema + test | 45 min | ⬜ |
| 3.5 | **Standardized error logging** | Errors include: timestamp, route, error type, actionable message | Log format documented + example | 30 min | ⬜ |

### M3 Completion Criteria
- [ ] 3 automated tests exist and pass
- [ ] Health endpoint is the "single source of truth" for system status
- [ ] Logs are diagnosable without guesswork

### M3 Deliverables
1. `tests/export.test.js` (or equivalent)
2. `tests/weekly.test.js`
3. `tests/ai-off.test.js`
4. Updated `/api/health` response documentation
5. Log format specification

---

# Milestone 4: Polish & Completeness (9.5/10 → 10/10)

**Theme:** Finish what you started; make it feel done.

| # | Task | Pass Criteria | Evidence Required | Effort | Status |
|---|------|---------------|-------------------|--------|--------|
| 4.1 | **Weekly output story resolved** | Either real PDF generation OR renamed route + docs updated | Working feature OR updated docs | 2-4 hrs | ⬜ |
| 4.2 | **Concept bridge document** | 1-2 page "Why this exists" + "How to use it" (not setup; mental model) | New doc in `00-start-here/` | 1 hr | ⬜ |
| 4.3 | **Success metrics defined** | Documented: what does "working well" look like after 2/8 weeks? | Added to concept doc or governance | 30 min | ⬜ |
| 4.4 | **Drift flag philosophy doc** | One-page: what they are, what they aren't, false positive guidance | `41-drift-detection-signals.md` completed | 45 min | ⬜ |
| 4.5 | **Differentiation statement** | One paragraph: what this does that habit trackers / note apps can't | Added to README or concept doc | 20 min | ⬜ |
| 4.6 | **Full documentation deployed** | All 30 docs from treyspeed skeleton exist and are accurate | Docs folder complete | 2-4 hrs | ⬜ |

### M4 Completion Criteria
- [ ] A new user understands the "why" without reading the Keystone
- [ ] Weekly output matches what docs promise
- [ ] All documentation files exist and are internally consistent

### M4 Deliverables
1. `00-start-here/02-why-this-exists.md` (concept bridge)
2. Completed `41-drift-detection-signals.md`
3. All 30 documentation files from skeleton
4. Updated README with differentiation statement

---

# Idea Score: 9/10 → 10/10 (Parallel Track)

These don't block program milestones but complete the picture:

| # | Task | Pass Criteria | Status |
|---|------|---------------|--------|
| I.1 | **Outcome validation** | Document real impact on primary user after 4+ weeks | ⬜ |
| I.2 | **False positive/negative guidance** | What to do when drift flags fire incorrectly (or miss real drift) | ⬜ |
| I.3 | **Success metrics with data** | Actual numbers: avg time-to-log, weekly review completion %, etc. | ⬜ |

---

# Summary: The Path to 10/10

| Milestone | Current | Target | Key Theme |
|-----------|---------|--------|-----------|
| M1 | 6/10 | 7.5/10 | Pending → PASS |
| M2 | 7.5/10 | 8.5/10 | Backup + Security |
| M3 | 8.5/10 | 9.5/10 | Automated tests |
| M4 | 9.5/10 | 10/10 | Polish + Docs complete |

**Estimated total effort:** 15-20 hours (Replit Agent) or 20-30 hours (manual)

---

# Quick Reference: What to Tell Replit

## For M1 (Start Here)
```
Verify these 3 things and report PASS/FAIL:
1. docker compose up - containers start clean
2. DB persistence - data survives restart  
3. npm run build && npm start - production build works

Then create a smoke-test.sh script that checks /api/health, /export, and /weekly.pdf

Finally, update the acceptance checklist with results.
```

## For M2
```
Complete these operator guide docs with real, verified information:
- 22-data-storage-and-persistence.md (where data lives)
- 24-security-local-lan-and-auth-modes.md (auth modes + LAN warning)
- 26-disaster-recovery.md (backup procedure; mark restore as TBD if not implemented)
```

## For M3
```
Create automated tests for:
1. Export shape (JSON includes expected entities)
2. Weekly review (returns expected format)
3. AI-off mode (core app works without AI keys)

Put tests in a tests/ folder and document how to run them.
```

## For M4
```
Create the concept bridge document (00-start-here/02-why-this-exists.md):
- What is LifeOps vs ThinkOps (mental model, not setup)
- What drift flags mean (and don't mean)
- What success looks like after 2 weeks / 8 weeks
- One paragraph on what this does that habit trackers can't

Keep it to 1-2 pages. No setup instructions.
```

---

# Notes

- **Do M1 first.** Everything else depends on knowing what actually works.
- **M2 is about user trust.** People won't use a "truth ledger" if they can lose their data.
- **M3 prevents regressions.** Tests catch problems before users report them.
- **M4 is the difference between "works" and "feels finished."**

Your brother gave you a gift: an honest assessment and a clear path forward. This checklist turns his analysis into action.
