# Harris Wildlands / harriswildlands.com — Project Closeout (v1)
**Prepared for:** broseph  
**Date:** 2026-01-03  
**Scope:** Brand + website copy + transcript analytics spec + AI collaboration/handoff materials

## Executive summary
- **Brand voice + homepage copy shipped**: "Weird Little Train" motif + family/science sanctuary tone and site sections ready to publish.
- **Tone & persona system shipped**: "Monday, But Kind" with a portable reset trigger (save-state keyword) and a short communication contract.
- **Transcript analytics feature spec shipped**: measurable "Triggers & Signals" metrics (counts/ratios per 1,000 words) with evidence snippets and minimal UI + API contracts.
- **Engineering handoff shipped**: a complete file reference and an AI collaboration package describing code layout, critical files, and safe modification zones.

## What we built (workstreams / angles)

### 1) Brand + website copy (Faith × Family × Science)
- **Tagline / positioning:** "Where the gospel meets gigabytes. Where science meets sarcasm. Where the Harris family rolls deep."
- **Homepage sections drafted:** Meet the Mad Household, Ethos, The Lab, Kid Corner, and footer language ready to paste into the site.
- **Standalone page copy drafted:** *The Family* and *The Science Sanctuary* pages (voice: funny, faith-grounded, classroom-lab energy).

### 2) Interaction design angle: tone negotiation + persona guardrails
- **Save-state keyword:** `weird little train` (re-primes tone when memory is off).
- **Communication contract:** short paragraphs; playful but never contemptuous; faith/family treated as first-class values; repair loop when impact is negative.
- **Persona kit:** "Monday, But Kind" — allowed vs forbidden moves + a 3-block response frame.

### 3) Product/feature angle: "Triggers & Signals" (transcript dashboard analytics)
- **Goal:** compute measurable language metrics (no diagnosis, no personality typing, no speculation).
- **Model:** StarCraft-inspired metrics (Economy, Output, Trades, APM, Supply Blocks) + Topic vs State densities.
- **UI spec:** Trigger leaderboard + Signals scoreboard + Evidence drawer; export JSON.
- **Backend contracts:** `/api/analytics/triggers`, `/api/analytics/signals`, `/api/analytics/lexicons` with versioned lexicons.

### 4) Engineering angle: AI-ready repository map + safe modification rules
- **Critical file map:** schema/contracts/routes/storage + core page components (LifeOps, ThinkOps, Goals, Dashboard, WeeklyReview, Settings, BruceOps).
- **AI collaboration bundle:** suggested "essential files zip" for AI chats; commands for dev/build/docker; high-risk zones called out.

## Artifacts delivered

| Artifact | Purpose | Status | Source/Location |
|---|---|---|---|
| Website copy: Family + Science Sanctuary | Publishable page copy | Draft-ready | `Harriswildlands Site.pdf` |
| Weird Little Train interaction analysis (v2) | Tone reset system + persona kit + website copy blocks | Draft-ready | `Weird Little Train—interaction Analysis (harris Wildlands).pdf` |
| Triggers & Signals spec (v1.2) | Analytics metrics + UI + API contracts + lexicons | Ready for implementation | `Transcript_Triggers_and_Signals_Project_Spec_v1_2.docx` |
| Complete File Reference | Repo file map + AI task→file mapping | Ready | `COMPLETE_FILE_REFERENCE.md` |
| AI Collaboration Package | Shareable bundle manifest + commands + rules | Ready | `AI_COLLABORATION_PACKAGE.md` |

## Key decisions and constraints
- **Integrity-first analytics:** all transcript insights must be text-derived (counts/ratios), with short evidence snippets. No diagnosis, no personality typing.
- **Pacing guardrail:** short paragraphs by default; avoid information avalanches; chunk heavy output.
- **Tone guardrail:** playful is allowed; contempt is not. Faith/family are protected categories.
- **Versioning:** lexicons are versioned; recompute analytics when lexicon version changes.

## Open items / recommended backlog
### Ship the site copy
- Paste the homepage blocks + Family/Science pages into the site and validate mobile readability.

### Implement Triggers & Signals (Spec → Build → Verify → Ship)
- **Spec:** confirm lexicon v1 defaults and choose your custom trigger list (e.g., vape, smoke, sleep, wife, overwhelmed).
- **Build:** implement the three endpoints + caching + KWIC evidence; wire up the UI panels.
- **Verify:** unit tests for tokenization, per-1,000 scaling, KWIC windowing, and de-duplication.
- **Ship:** add JSON export + a small "lexicon version" label in the UI.

### Package the Think section for heavy transcripts
- Publish a dedicated "Think" area that can safely host large transcript dumps and expose the analytics tooling above (search + pattern recognition).

## Copy/paste blocks

### Communication contract (paste into any chat)
```
Trigger: weird little train
Pace: short paragraphs; no info avalanches.
Tone: playful, never contemptuous; no roasting faith or sincerity.
Respect: treat faith/family as first-class values.
If harm is felt: (1) acknowledge impact, (2) apologize, (3) restate intent, (4) ask for pacing/tone preference, (5) continue.
```

### Prompt: re-prime the vibe
```
weird little train — same respectful tone as our October session. Short paragraphs. Start with an acknowledgment, then 3 concrete steps.
```

## Next actions (≤30 minutes each)
1) Create a new `/docs/closeout/` folder in the repo and drop this Markdown + the DOCX closeout report there.
2) Pick 10–20 custom trigger tokens for lexicon A1 (your real life friction/win terms).
3) In Replit, stub the three analytics endpoints (returning hard-coded sample JSON that matches the schema).

## Definition of done
- Closeout docs are stored in-repo and linked from the main README or manual index.
- Triggers & Signals endpoints exist (even mocked), UI tab renders, and JSON export downloads.
- Site copy blocks are pasted into the site and visible without layout breaks on mobile.