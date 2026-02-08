# Glossary

**Last updated:** 2025-12-27

Use this glossary to keep terms consistent across user docs, operator docs, and the keystone.

## Core concepts

- **LifeOps:** Daily reality capture / ledger. Minimal input using yes/no toggles, 1-10 scales, and optional text reflections. Factual, not aspirational.

- **ThinkOps:** Idea capture and development lane. Kept separate from LifeOps to prevent ideation from contaminating operations.

- **Drift flag:** A factual signal derived from patterns (e.g., "4 missed days this week"). Signals, not judgments. You decide what to do with them.

- **Red-zone:** A category of information that is not shared/exported by default without explicit opt-in (e.g., family details, faith reflections).

- **Faith boundary:** Constraint that sacred/private content is not interpreted or redistributed by default.

- **Bruce context:** The AI system prompt that personalizes responses to the user's goals and values.

## Modes

- **Standalone mode:** Running locally via Docker Compose. Auto-login enabled, data persisted to database. No Replit authentication required.

- **Demo mode:** Client-side evaluation mode activated via `?demo=true` URL parameter. Uses sample data. No data is saved to the database.

- **Replit OIDC:** Authentication path when Replit environment variables (`REPL_ID`, `ISSUER_URL`) are present.

## Outputs

- **Weekly review:** Endpoint/page that summarizes stats and drift flags for the past week. Currently text-based (PDF pending).

- **Export:** JSON bundle download of all stored entities (logs, ideas, goals, check-ins, etc.).

## AI

- **AI provider ladder:** Strategy to use Gemini → OpenRouter → OFF depending on configuration and availability.

- **OFF:** AI features disabled. Core logging/tracking still functions without AI.

## Metrics

- **Completion rate:** Percentage of check-ins completed over a time window.

- **Missed days:** Count of days without expected log entries.

- **Domain stats:** Aggregated metrics per goal domain (health, family, faith, work).

## Four lanes

| Lane | Purpose |
|------|---------|
| **LifeOps** | Daily calibration, routines, logs, family leadership tracking |
| **ThinkOps** | Idea capture, reality-checking, project pipeline management |
| **Teaching Assistant** | Standards-aligned lesson plan generation for classroom use |
| **HarrisWildlands** | Brand content and website copy generation |
