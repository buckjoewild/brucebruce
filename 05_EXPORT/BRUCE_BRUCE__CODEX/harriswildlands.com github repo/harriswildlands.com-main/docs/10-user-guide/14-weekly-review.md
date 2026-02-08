# Weekly review

**Audience:** End users  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Explain what the weekly review output is and how to use it.

## How to access the weekly review

Navigate to the **Weekly Review** page in the app, or access directly at:
- `http://localhost:5000/weekly-review`

## What it shows

The weekly review computes and displays:

### Statistics
- **Completion rate:** Percentage of goal check-ins completed
- **Missed days:** Number of days without expected entries
- **Domain stats:** Breakdown by category (health, family, faith, work)

### Visualizations
- Charts showing trends over time
- Goal completion progress

### AI insights (if enabled)
- Weekly pattern analysis
- Suggested focus areas
- Cached daily to avoid excessive API calls

## Current behavior

The weekly review is currently **text-based** with charts.

**Note:** PDF generation is planned but not yet implemented. The endpoint `/weekly.pdf` exists but produces text output.

## How to interpret drift flags

Drift flags are **signals, not judgments**. They indicate patterns that may warrant attention.

| Signal | What it means | What to do |
|--------|---------------|------------|
| "4 missed days this week" | You logged 4 days fewer than usual | Notice it. Maybe life was busy. Maybe routine slipped. You decide. |
| "Exercise streak broken" | Your exercise habit stopped | Could be intentional rest, injury, or drift. Only you know. |
| "Low energy trend" | Energy scores declining | Check sleep, stress, or other factors. Or accept it and move on. |

### What drift flags are NOT

- They are **not** moral judgments
- They are **not** recommendations to change
- They are **not** AI telling you what to do

They are **factual observations** about your logged data. You retain full agency over interpretation and action.

## Troubleshooting

**Q: The weekly review is empty.**
A: You need at least some log entries or check-ins to generate stats.

**Q: AI insights aren't appearing.**
A: Check that AI_PROVIDER is configured (not "off").

**Q: The data seems wrong.**
A: Verify your log entries are being saved (check the LifeOps page).

## References

- Drift flags: `40-protocols-and-governance/41-drift-detection-signals.md`
- LifeOps: `12-lifeops-daily-logging.md`
- Export: `15-export-and-personal-backups.md`
