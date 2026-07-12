# Map content migration log

Audit date: 2026-07-11

## Preserved localhost session content

| Entity group | Source | Status | Validated in migration |
| --- | --- | --- | --- |
| Hospitality parents and child venues | Local `5173` hospitality content library and import deck | Migrated | Canonical IDs, relationships, copy, images, route inventory, duplicate report. |
| Residential and mixed-use properties | Local `5173` residential content library and import deck | Migrated | Titles, property relationships, media manifest, route inventory. |
| Rainey launch entities | Local `5173` launch imports and curation data | Preserved for audit | Relationships and public status must remain source-backed. |
| Larry's and Guy + Larry | Local `5173` restaurant layer | Preserved for validation | Do not invent partner/perk status; verify copy and entity relationship before release. |
| Resident perks and events | Local `5173` normalized map datasets | Preserved | Intent exclusivity clears stale pins, rows, counts, perks, selections, and drawer URL state. |
| Search-intent taxonomy | Local `5173` search intent registry/config | Migrated | Thirty registered intents pass taxonomy tests; lunch and dinner have distinct icons. |
| Resident and partner mobile tabs | Local `5173` mobile tab registry/shell | Migrated | Five tabs per mode; accessible tab semantics and auth return routing included. |

## Provenance artifacts

- `docs/media-audit/media-change-log.md`
- `docs/media-audit/route-surface-inventory.csv`
- `docs/media-audit/perks-media-inventory.csv`
- `reports/hospitality/import-report.md`
- `reports/residential-mixed-use/import-report.md`

## Exclusions

- No LAUNCHPERKS presentation markup, global CSS, route folders, or map components were copied.
- No `.env` files, Vercel project state, caches, build output, or generated screenshots are included in the reviewed source diff.
- Content marked for manual review remains unapproved and must not be represented as a live perk, partnership, or campaign.
