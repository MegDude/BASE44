# Mobile panel journey map

Date: 2026-07-16

The sheet rebuild must be tested as journeys, not as isolated panels. This document defines the expected journey hierarchy and the current friction discovered from source inspection.

## Resident event journey

```text
Open Events collection
→ Peek: "Events Nearby" and count
→ Browse: event rows
→ Detail: selected event
→ Save / calendar / directions
→ Back: same Browse scroll and map position
→ Close: Peek/map context
```

Current friction:

- event Browse and Detail are rendered by separate branches in `Map.jsx`
- selected entity state and closed/minimized booleans can diverge
- the event list can be reached from map tabs and Home, creating duplicate destinations

Canonical behavior:

- one selected entity
- one parent Browse snapshot
- one map camera adjustment when Detail opens
- browser Back mirrors Detail → Browse → Peek

## Perk journey

```text
Open Perks collection
→ Browse perk rows
→ Detail: perk and venue context
→ Redeem
→ Authentication task if needed
→ Return to same perk Detail
→ QR / confirmation
```

Current friction:

- redemption is an independent sheet/modal path
- auth-return intent is separate from panel hierarchy
- QR appears in more than one surface

Canonical behavior:

- redemption/authentication is a focused Detail task with a parent snapshot
- no loss of selected perk, Browse scroll, or map position

## Route journey

```text
Open route collection
→ Browse: route summary and ordered stops
→ Stop Detail
→ Back: same route stop list
→ Start route
```

Current friction:

- `CollectionRoutePanel` is independent from the main map sheet system
- route stop selection can behave like generic entity selection

Canonical behavior:

- route Browse remains parent context
- stop Detail preserves route identity and scroll position

## Property / hotel journey

```text
Open property or hotel
→ Detail: identity, usefulness, access/benefits
→ Save, directions, or learn more
→ Nearby benefits or events
```

Current friction:

- property, hotel, residential, and hospitality drawers are separate content branches
- detail panels can lead with too much descriptive copy before the decision/action

Canonical behavior:

- shared Detail order with category-specific content modules
- no partner-facing controls in resident mode

## Resident home journey

```text
Open /resident/home
→ current value
→ primary Open Map action
→ timely item or active perk
→ saved/recent
→ card status
```

Current friction:

- the home page is carrying a large dashboard and many complete app sections
- Home, Perks, and Card panels duplicate map tab destinations

Canonical behavior:

- Home is a launch surface, not a second map application
- full discovery belongs to `/map?mode=resident`

## Partner journey

```text
Open partner map/workspace context
→ Browse operational rows
→ Detail: status, recommended action, performance, preview
→ focused task sheet for edit/publish/schedule/QR
→ confirmation
→ return to partner Detail with updated status
```

Current friction:

- resident editorial panels and partner operational panels share mechanics but not a clear IA distinction
- partner state can be appended to resident-oriented drawer shells

Canonical behavior:

- same `NativeSheet` engine
- separate partner content priorities and route labels
- preview-as-resident mode visually matches resident Detail and hides edit controls

## Back and close hierarchy

```text
Detail Back → parent Browse
Browse Back → previous collection/search context
Close → dismisses active sheet to Peek/map context
Browser Back → mirrors the same hierarchy
```

Direct entity deep-link fallback:

```text
Detail → Back → relevant category Browse → Close → Peek/map
```
