# Privacy red-zones and sharing boundaries

**Audience:** All users (governance document)  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Define which data is considered "red-zone" (sensitive) and establish sharing boundaries.

## Core principle

> **Private by default. Sharing requires explicit opt-in.**

This system is designed for personal use. Sharing is not the default assumption.

## Red-zone categories

These fields/topics are considered sensitive:

### Family

| Field | Example content |
|-------|-----------------|
| `familyConnection` | "Quality time with kids today" |
| Family-related notes | Spouse discussions, parenting notes |

**Why sensitive:** Family matters are private to the household.

### Faith

| Field | Example content |
|-------|-----------------|
| `faithAlignment` | "Prayer time, felt centered" |
| Faith-related reflections | Spiritual struggles, religious practices |

**Why sensitive:** Sacred content is not for public interpretation.

### Emotional/vulnerable

| Field | Example content |
|-------|-----------------|
| Mood/stress logs | "Feeling overwhelmed" |
| `driftCheck` | "Noticing procrastination pattern" |
| Top friction entries | Personal frustrations |

**Why sensitive:** Vulnerability is shared selectively.

## Sharing boundaries

### Default: No sharing

- Data stays on your device/server
- No analytics sent anywhere
- No social features
- No public profiles

### Export: All data

The export feature includes ALL data:
- Including red-zone fields
- As a complete JSON bundle

**Before sharing an export:**
1. Review what's included
2. Consider redacting sensitive entries
3. Know who will see it

### AI context: Included

When AI features are enabled:
- AI sees your data to provide context
- AI responses are personalized
- AI does not store or share your data externally

**Current AI providers:**
- Gemini: Google's privacy policy applies
- OpenRouter: OpenRouter's privacy policy applies

### Summaries: Possible future feature

A potential future feature: "Share summary only"
- Aggregated stats (not raw entries)
- Patterns without specific content
- Weekly overview without daily details

This is not yet implemented.

## Implementation

### Technical safeguards

| Measure | Implementation |
|---------|----------------|
| User-scoped data | All queries filtered by userId |
| No public endpoints | All data endpoints require auth |
| Local storage option | Docker deployment keeps data local |
| Export control | User must explicitly request export |

### What's NOT implemented

| Feature | Status |
|---------|--------|
| Field-level encryption | Not implemented |
| Selective redaction on export | Not implemented |
| Sharing with other users | Not implemented |
| Public profile/stats | Not implemented |

## Decision framework

When adding features, ask:

1. **Does it require sharing?** If no, it's fine.
2. **Is sharing opt-in?** If yes, it's fine.
3. **Are red-zones protected?** They should be excluded or require extra confirmation.
4. **Can user review before sharing?** Transparency is required.

## User responsibilities

You are responsible for:
- Deciding what to log
- Deciding what to share
- Securing your deployment (if self-hosted)
- Managing your export files

The system provides tools, not guarantees.

## Faith boundary

A specific constraint for faith-related content:

> Sacred/private content is not interpreted or redistributed by default.

Meaning:
- AI will not "analyze" your faith entries beyond what you ask
- Faith patterns are not highlighted as "drift" by default
- Spiritual content is treated with extra care

## References

- Export guide: `10-user-guide/15-export-and-personal-backups.md`
- Security: `20-operator-guide/24-security-local-lan-and-auth-modes.md`
- AI providers: `30-developer-reference/35-ai-provider-ladder.md`
