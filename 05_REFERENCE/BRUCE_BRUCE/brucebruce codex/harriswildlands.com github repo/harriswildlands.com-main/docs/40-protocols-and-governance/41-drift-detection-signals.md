# Drift detection signals

**Audience:** All users (governance document)  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Define what drift signals are, what they mean, and how they differ from judgments.

## Core principle

> **Drift signals are factual observations, not moral judgments.**

A drift signal says "this pattern exists" - not "you should change" or "this is bad."

## What drift signals are

Drift signals are computed from your data:
- Missed days count
- Streak breaks
- Trend changes
- Pattern deviations

They are **signals** - data points that might warrant your attention.

## What drift signals are NOT

- Recommendations to change behavior
- Judgments about your choices
- AI opinions about what you "should" do
- Pressure to achieve specific metrics

## Example signals

| Signal | What it observes | What it does NOT mean |
|--------|------------------|----------------------|
| "4 missed days this week" | You logged 4 fewer days than usual | That you failed, or need to log more |
| "Exercise streak broken" | Your exercise habit stopped | That you're unhealthy, or lazy |
| "Low energy trend" | Energy scores declining | That you need to "fix" something |
| "ThinkOps ideas stagnant" | No new ideas in 2 weeks | That you're uncreative |

## Human agency

You retain full agency over:
- Whether to care about a signal
- How to interpret it
- What (if anything) to do about it

The system provides data. You provide meaning.

## Why this matters

Many "productivity" systems:
- Shame you for missed goals
- Create anxiety about streaks
- Impose external standards
- Judge your performance

This system explicitly rejects that approach.

**This is a ledger, not a judge.**

## Signal types

### Currently implemented

| Type | Calculation |
|------|-------------|
| Missed days | Count of days without expected log entries |
| Completion rate | Percentage of check-ins completed |
| Domain stats | Aggregated metrics per goal domain |

### Future considerations

| Type | Potential calculation |
|------|----------------------|
| Trend detection | Week-over-week changes in averages |
| Streak tracking | Consecutive days of habit completion |
| Red-zone alerts | Patterns in sensitive fields (opt-in only) |

## Opt-in philosophy

Some signals might be sensitive:
- Faith-related patterns
- Family connection trends
- Emotional state correlations

These should be:
- Opt-in (not computed by default)
- Private (not shared without explicit consent)
- Interpretable (you decide what they mean)

## Weekly review integration

The weekly review displays drift signals with context:
- What happened this week
- How it compares to typical patterns
- No "you should" language

Example output:
```
This week: 5/7 logs completed (vs. typical 6/7)
Energy average: 6.2 (vs. typical 7.1)
Exercise: 3 days (vs. typical 4)
```

Notice: No judgment. Just data.

## Self-deception filter

For ThinkOps (ideas), the reality check includes self-deception pattern detection:
- Wishful thinking
- Confirmation bias
- Overconfidence

These are observations about reasoning patterns, not personal attacks.

## References

- Weekly review: `10-user-guide/14-weekly-review.md`
- LifeOps/ThinkOps separation: `40-lifeops-thinkops-separation.md`
- Privacy red-zones: `42-privacy-red-zones-and-sharing-boundaries.md`
