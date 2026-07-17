# Partner analytics metric dictionary

The partner Analytics workspace uses only events scoped to the active workspace ID or an entity owned by that workspace. Internal, test, bot, preview, and invalid redemption records are excluded before aggregation.

| Metric | Definition | Canonical event inputs |
| --- | --- | --- |
| Experience opens | A Downtown Perks experience opened successfully. | `entity.opened`, `experience.opened`, `campaign.joined` |
| QR activity | A valid QR or approved trackable-link open. Repeat scans from the same subject and code within 30 seconds are deduplicated. | `qr.opened`, `qr.scanned`, `qr_scan` |
| Listing views | An entity or listing detail rendered successfully. | `entity.viewed`, `listing.viewed` |
| Saves | An intentional save of a place, offer, or event. Repeated saves by the same subject and target are deduplicated for the loaded dataset. | `entity.saved`, `offer.saved`, `event.saved` |
| Directions | A directions action initiated from Downtown Perks. | `directions.requested` |
| Verified visits | A visit or event check-in recorded under the approved visit rules. | `location.visited`, `visit.verified`, `event.checkin` |
| Redemptions | A confirmed, validated, or completed offer redemption. | `perk.redeemed`, `offer.redeemed` |
| Event RSVPs | A completed event RSVP. | `event.rsvp`, `event.rsvp_completed` |
| Repeat engagement | A session containing more than one reportable action during the loaded period. | Derived from stable session IDs |

## Periods and comparisons

- Supported periods are 7, 30, 60, and 90 days, plus year to date.
- Comparison periods use an immediately preceding window of equal duration.
- The interface does not present a percentage change until a complete comparable period is available.
- Custom dates, when supplied by a trusted report surface, use Austin local-day boundaries.

## Attribution and limitations

- Source reporting is first-touch reporting from the stable `source` identifier. It is not multi-touch attribution.
- Campaigns, offers, events, entities, sources, and districts are filterable only when their stable identifiers are present on events.
- Survey demographics and motivations are never inferred from behavioral events.
- Cost per action remains unavailable until spend and campaign-objective records are connected.
- Demo organizations are explicitly marked `is_demo` and are never mixed into production workspace totals.
