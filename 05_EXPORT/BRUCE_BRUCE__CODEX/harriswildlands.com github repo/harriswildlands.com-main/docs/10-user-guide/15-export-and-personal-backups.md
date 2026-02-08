# Export and personal backups

**Audience:** End users  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Explain the export feature and establish a simple backup habit.

## What export does

Produces a **JSON bundle** containing all your stored data:

- Logs (daily entries)
- Ideas (ThinkOps pipeline)
- Goals
- Check-ins
- Drift flags
- Teaching requests
- Harris content
- User settings

## How to export

1. Navigate to the **Settings** page
2. Click the **Export Data** button
3. Save the downloaded JSON file

Or use the API directly:
```
GET /api/export/data
```

## Where to store your backup

Store the JSON file somewhere safe:

| Option | Security Level |
|--------|---------------|
| Encrypted cloud folder (iCloud, Google Drive with encryption) | Good |
| Password manager attachment | Good |
| External hard drive | Good for offline |
| Email to yourself | Not recommended (unencrypted) |

## Recommended backup cadence

| Frequency | Good for |
|-----------|----------|
| **Weekly** (minimum) | After each weekly review |
| **Daily** | If you're logging important data |
| **Before updates** | Before running `git pull` or `docker compose up --build` |

## What to do with the backup

The JSON file is your **truth ledger**. Use it to:

- **Verify data integrity:** Confirm your entries are being saved
- **Migrate to new instance:** If you move to a new server
- **Personal analysis:** Import into spreadsheets or other tools
- **Peace of mind:** Know your data isn't locked in

## Restore from backup

**Current status:** Restore/import functionality is **TBD**.

For now, the backup serves as:
1. Proof of your data
2. Source for manual migration
3. Raw material for analysis

If you need to restore, options include:
- Manual database insertion (requires technical skills)
- Contact for migration assistance

## Red-zone privacy note

The export includes **all** your data, including:
- Family connection notes
- Faith alignment reflections
- Personal drift checks

Before sharing the export file:
- Review what's included
- Consider redacting sensitive entries
- See: `40-protocols-and-governance/42-privacy-red-zones-and-sharing-boundaries.md`

## References

- Privacy red-zones: `40-protocols-and-governance/42-privacy-red-zones-and-sharing-boundaries.md`
- Data persistence: `20-operator-guide/22-data-storage-and-persistence.md`
- Disaster recovery: `20-operator-guide/26-disaster-recovery.md`
