# LifeOps / ThinkOps separation

**Audience:** All users (governance document)  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

This document explains why LifeOps and ThinkOps are kept separate and how to maintain that boundary.

## Core principle

> **LifeOps = What happened (facts)**  
> **ThinkOps = What could happen (ideas)**

These two lanes must remain separate to prevent:
- Ideation from contaminating reality tracking
- Action items from getting lost in brainstorms
- Decision fatigue from constant context-switching

## Why this matters

### Problem: Mixed logs

When ideas and operations are mixed:
- "Today I exercised AND I had an idea for a new app" becomes one messy entry
- Hard to analyze patterns (what actually happened)
- Hard to track ideas (what might be worth pursuing)
- The log becomes a dumping ground, not a ledger

### Solution: Separate lanes

| Lane | Contains | Does NOT contain |
|------|----------|------------------|
| **LifeOps** | What happened, how you felt, what you did | Future plans, brainstorms, speculation |
| **ThinkOps** | Ideas, concepts, possibilities | Daily activities, mood logs, habits |

## Implementation

### LifeOps entries

Good LifeOps entry:
- Energy: 7
- Exercise: Yes
- Top win: "Finished the lesson plan"
- Top friction: "Interrupted by meetings"

Bad LifeOps entry:
- "Had an idea for a new revenue stream - should explore this!"
- This belongs in ThinkOps

### ThinkOps entries

Good ThinkOps entry:
- Title: "Subscription model for teaching resources"
- Status: Draft
- Pain point: "Teachers need printable materials"

Bad ThinkOps entry:
- "Feeling tired today, only 5 hours of sleep"
- This belongs in LifeOps

## Edge cases

### "I had an idea while logging"

1. Finish your LifeOps entry first
2. Then create a ThinkOps idea
3. Keep them separate

### "My idea relates to something that happened"

That's fine. They can reference each other conceptually:
- LifeOps: "Noticed friction with lesson prep"
- ThinkOps: "Idea: Create a lesson prep template"

But they remain separate entries in separate systems.

### "I want to track progress on an idea"

Use ThinkOps status progression:
- Draft → Reality-checked → Promoted → Archived

NOT by adding updates to LifeOps.

## Drift signals

If the system detects mixing, it may flag:
- "Multiple ideas captured in LifeOps entries"
- "ThinkOps entries contain daily reflections"

These are signals, not judgments. You decide what to do.

## Enforcement

The system does not technically prevent mixing. It relies on:
1. This documented principle
2. User understanding
3. Drift detection as gentle reminders

## Why not enforce technically?

Rigid enforcement creates friction:
- What if you genuinely need an exception?
- What if the boundary doesn't fit your situation?

The goal is clarity, not rigidity. The separation is a tool for you, not a rule imposed on you.

## References

- LifeOps guide: `10-user-guide/12-lifeops-daily-logging.md`
- ThinkOps guide: `10-user-guide/13-thinkops-ideas-pipeline.md`
- Drift detection: `41-drift-detection-signals.md`
