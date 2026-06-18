# Downtown Perks Map-First Compliance Audit

Target: `http://localhost:5173`

## Product Principle

The map is the product.

Every visible control should answer at least one question:

- What is nearby?
- What should I do?
- Where should I go next?

## Compliance Summary

| Area | Status | Finding | Remediation |
| --- | --- | --- | --- |
| Map canvas | Partial | Map is the primary route, but drawers and command surfaces can visually compete with it. | Keep command center compact, top anchored, and cap drawers to preserve map context. |
| Ask the Map | Partial | Strong engine and UI exists, but command console has been repeatedly restyled and can drift. | Lock top-centered collapsed state, one expanded panel, one prompt hierarchy. |
| Filters | Partial | Prompt rail and featured pin rail exist; context filters are partly duplicated through active filter/query state. | Use one Level 1 intent rail and one featured/context rail. District and distance should become progressive disclosure. |
| Pins | Partial | Central pin registry exists. Marker factory currently renders direct icons/logos rather than navy circles/gold icons. | Preserve current working logo/icon pins, document circular pin requirement as future functional change if desired. |
| Drawers | Partial | Multiple drawer systems exist and sections can feel database-like. | CSS and IA should prioritize hero/title/action/story/related/footer. |
| Bottom nav | Needs consolidation | Two render paths exist in `Map.jsx`. | Normalize both now; consolidate later into one component. |
| Resident card | Partial | QR and demo scan flow exist; visual density remains a recurring risk. | Keep QR dominant, reduce statistics, keep utility actions. |
| Partner mode | Partial | Partner tools exist and route correctly through map/workspace. | Reduce dashboard-style chrome in map panels; keep campaign/report actions wired. |
| Registries | Partial | Multiple registries exist, including production inventory, image, copy, pin, action, and search intent registries. | Establish single registry ownership map and remove legacy fallbacks only after adapter coverage. |

## Element Audit

### Helps Decide

Keep and prioritize:

- Ask the Map command center
- Intent filters
- Selected entity drawer
- Directions
- Save
- RSVP
- Claim perk
- Partner campaign/report actions
- Nearby/related rails
- Search result rows

### Helps Discover

Keep and simplify:

- Featured pins
- Nearby recommendations
- Related entities
- District context
- Events/perks filters
- Brand/civic layers

### Helps Act

Keep wired:

- Directions links
- Save/unsave
- RSVP
- Add wallet
- Show QR
- Demo scan
- Partner campaign launch
- Partner reports
- Map mode switching

### Noise Candidates

Review before removal:

- Duplicate overview/why-it-matters sections inside drawers
- Extra nested cards in panels
- Secondary explanations that repeat title/subtitle
- Multiple CTA rows in a single panel
- Decorative dashboard metrics inside map context
- Legacy map result panels that duplicate drawer content

## Required Decision Architecture

All entity panels should follow:

1. See it: hero/image/title
2. Understand it: one short story/why statement
3. Decide: reason tags or key facts
4. Act: one primary action and up to two secondary actions
5. Discover: nearby/related
6. Continue: Ask the Map prompts or footer CTA

## Current Functional Anchors

Do not break:

- `SearchIntentConsole` in `src/pages/Map.jsx`
- `mapActionRegistry.ts`
- `AskMapEngine.js`
- `MarkerFactory.jsx`
- `entityPinResolver.ts`
- `pinAssetRegistry.ts`
- production registries
- resident and partner URL params in `/map`

## Remediation Applied

The global remediation pass is presentation-layer only:

- Map command center stays top-centered.
- Bottom navigation is normalized across both render paths.
- Drawers and sheets are constrained so map context remains visible.
- Interactive text contrast is locked for selected and unselected states.
- Grey/purple/orange visual drift is overridden on map surfaces.
- Touch targets are preserved at or above 44px.

## Remaining Product Work

These require component refactors, not CSS-only cleanup:

- Consolidate duplicate bottom navigation render paths.
- Consolidate map stores.
- Convert filter model into explicit Level 1 Intent, Level 2 District, Level 3 Distance.
- Move all drawer rendering to one universal drawer architecture.
- Convert legacy marker color utilities to the pin registry.
