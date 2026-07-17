# Events Nearby reconciliation QA

Date: 2026-07-17
Branch: `codex/reconcile-resident-partner-20260716`
Route: `/app?mode=resident&tab=events&collection=events-nearby&filter=Events`

## Migrated scope

- The Resident Events tab deep-links to the `events-nearby` collection.
- `events-nearby` resolves to the single `Events` filter.
- Collection membership is restricted to canonical event entities even through the single-select filter path.
- Map event records preserve `kind`, `entityType`, and `status` fields.
- Event result counts and result-row categories use event-specific language.
- The Hotel Van Zandt First Thursday record uses the reviewed Rainey event data source.

The slice intentionally excludes broad CSS locks, the alternate native-map shell, route check-in expansion, partner workspace code, API persistence, and unrelated dirty-source changes.

## Automated checks

| Check | Result |
| --- | --- |
| `npm run test:mobile-tabs` | Pass |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm run build` | Pass |
| `git diff --check` | Pass |

## Mobile browser check

Viewport: `393 × 852`

- Clean preview returned HTTP 200 on port 5174.
- Canonical `/app` route retained `mode`, `tab`, `collection`, and `filter` query state.
- Drawer reported `25 events`.
- Four rendered preview rows all used `Event` or `Event / ...` categories.
- No property or brand category leaked into the event preview.
- No framework error overlay appeared.
- No browser console errors appeared.
- No horizontal overflow appeared (`393px` viewport and document width).
- The resident drawer remained flush with the bottom navigation.

## Environment limitation

The clean reconciliation worktree does not currently have a usable local Google Maps configuration, so the canvas showed the existing graceful map-unavailable fallback. This does not affect the verified event dataset, collection scoping, deep link, result copy, or drawer layout. Production deployment remains gated until map configuration is verified in the preview environment.

Screenshot evidence: `/tmp/events-nearby-reconciliation.png` (local QA artifact, not committed).
