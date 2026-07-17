# Events Nearby data diagnosis

Date: 2026-07-16
Route: `/map?mode=resident&tab=map&filter=Events&collection=events-nearby`

## Symptom

The route rendered the correct map shell and results drawer, but the drawer reported:

```text
0 places
```

This was incorrect and misleading for an event collection.

## Root cause

`events-nearby` existed as a collection seed in `src/data/downtownPerksCollections.seed.ts`:

```ts
entityRules: {
  entityType: "event",
  status: "upcoming",
}
```

However, the active map route did not evaluate `entityRules`. It used `matchesCollection(place, collection)` in `src/pages/Map.jsx`.

`matchesCollection()` had no explicit case for `events-nearby`, so it fell through to:

```ts
return text.includes(key.replace(/-/g, " "));
```

That checked for the phrase `events nearby` in every entity text and removed all actual events.

There was a second compatibility issue: events created by `eventPlace()` in `src/lib/useLocations.js` had `type: "event"`, `markerType: "event"`, and `detailDrawerType: "event"`, but did not preserve `kind`, `entityType`, or `status`, even though collection seeds and future backend rules expect those fields.

A third UI/data routing issue appeared during browser verification: single-select filters skipped `matchesCollection()` when the collection alias matched the active filter. That meant `filter=Events&collection=events-nearby` could still display event-adjacent places in the resident drawer even though the smarter result count was event-only.

## Fix applied

Files changed:

- `src/pages/Map.jsx`
- `src/lib/useLocations.js`

Changes:

```text
events-nearby → Events filter alias
events-nearby collection → isEventEntity(place)
eventPlace() → kind: "event"
eventPlace() → entityType: "event"
eventPlace() → status: "upcoming" unless explicitly provided
single-select Events + events-nearby → strict isEventEntity(place) collection scope
Events drawer counts/categories → event-specific wording
```

## Data-stage diagnosis

| Stage | Input count | Output count | Removed items | Reason |
| ----- | ----------: | -----------: | ------------- | ------ |
| Event source inspection | 20+ `eventPlace(...)` calls plus supplemental event entities | 20+ candidate event records | none | Event data exists in active BASE44 source. |
| Event entity detection | event records with `type: "event"` / event markers | should pass `isEventEntity()` | non-event civic/venue records excluded | `isEventEntity()` correctly avoids generic civic places unless explicit event signal exists. |
| Collection membership before fix | candidate events | 0 | all events | `matchesCollection()` lacked `events-nearby` case and looked for text phrase `events nearby`. |
| Collection membership after fix | candidate events | event entities matching Events filter | non-event entities | `events-nearby` now resolves directly to `isEventEntity(place)`. |
| UI label | event collection | event-specific | old wording said `places` | Result announcements and drawer headers now use event-specific nouns. |
| Single-select collection scope | `filter=Events&collection=events-nearby` | event-only drawer and marker candidate set | event-adjacent properties/venues | Events Nearby now applies strict event collection membership even through the single-select path. |

## Verification

Local browser verification at `393 × 852` passed for:

- `/map?mode=resident&tab=map&filter=Events&collection=events-nearby`
- Google map canvas present.
- Main status copy reports events, not places.
- Resident drawer count reports events, not places.
- No `Property` or `Brand` row-label drift in the Events Nearby drawer.
- No Google Maps ownership/error overlay appeared.

Known unrelated local console issues remain:

- `[Base44 SDK Error] 404: App not found`
- `[map-search] public request returned more than 100 records 371`
- Google Maps legacy `Marker` deprecation warning

## Remaining follow-up

1. If a date-validity pass is added later, compare event dates using `America/Chicago`.
2. Ensure event records with venue-only coordinates can resolve venue coordinates.
3. Add a truthful empty state if current filters genuinely return zero:

```text
No nearby events match the current filters.
Expand the distance or view all upcoming events.
```
