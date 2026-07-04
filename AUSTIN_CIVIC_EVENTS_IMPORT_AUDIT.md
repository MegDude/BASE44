# Austin Civic Events Import Audit

Import date: 2026-07-02

Source files:
- `/Users/megdude/Downloads/PERKS BAC/AUSTIN CIVIC DATA/EVENTS/austin_events_extract.csv`
- `/Users/megdude/Downloads/PERKS BAC/AUSTIN CIVIC DATA/EVENTS/austin_events_extract.ics`

Reference only:
- `/Users/megdude/Downloads/PERKS BAC/NOTES/DOWNTOWN PERKS — FINAL GOVERNED PLATFORM SYSTEM.md`

## Strategy

Events were imported into the existing supplemental map entity registry so the current Events filter, search, map pins, and event drawer continue to work without a parallel UI path.

Only future events on or after 2026-07-02 were eligible. Past events were not imported.

Only mappable in-person events with reliable venue coordinates were added. Virtual events and ambiguous multi-location rows were skipped to avoid inaccurate pins.

## Imported

| Event | Date | Venue | Status |
| --- | --- | --- | --- |
| Julia C. Butridge Gallery Exhibit: The Classroom | Jul 6-Aug 15, 2026 | Dougherty Arts Center | Imported |
| Julia C. Butridge Gallery Exhibit: Little Memories | Jul 6-Aug 15, 2026 | Dougherty Arts Center | Imported |
| Artist Reception: Recovering the Lost Words | Jul 8, 2026 | Dougherty Arts Center | Imported |
| Artist Talk: Recovering the Lost Words | Aug 12, 2026 | Dougherty Arts Center | Imported |
| Austin Small Business Connections Conference | Aug 19, 2026 | Palmer Events Center | Imported |
| Austin Pride Parade | Aug 22, 2026 | Congress Avenue | Imported |

## Skipped

| Reason | Count | Notes |
| --- | ---: | --- |
| Past before 2026-07-02 | 56 | Excluded per instruction. |
| Virtual/no mappable coordinate | 6 | Kept out of map entity registry. |
| Ambiguous or broad venue | 1 | `Austin Public Library - Assorted Branches` has no single pin. |
| Outside the downtown product area | 3 | Millwood, Montopolis, and Fiesta Gardens rows were not added to the downtown map. |

## Design / Governance Check

The governed platform reference reinforces that the map is the product and that overlays should stay stable, synchronized, and mobile-first. No design-system changes were needed for this batch. The imported events use existing white-panel event drawers, existing event pins, existing map filters, and current search behavior.
