# Downtown Perks Global Map Remediation Pass

Target: `http://localhost:5173`

## Scope

Applied across:

- Map
- Explore
- Properties
- Hotels
- Events
- Perks
- Venues
- Resident Card
- Saved
- Partner Views
- Insights
- Reports

This pass is intentionally presentation-layer only. It does not modify:

- business logic
- state management
- route structure
- map rendering engine
- pin behavior
- search behavior
- API integrations
- stores
- analytics

## Files Changed

- `src/styles/dp-recovery-final.css`

## Remediation Applied

### Map Dominance

- Preserved the map as the primary viewport.
- Kept the command center top-centered and fixed.
- Capped expanded command center height so it cannot consume the full map.
- Capped drawer/sheet behavior through scroll and max-height guardrails.

### Ask the Map Command Center

- Locked collapsed Ask the Map to top center.
- Locked expanded command center to one white/glass surface.
- Removed selected-state contrast failure by forcing selected chips to navy with white text.
- Kept rails single-row, horizontally scrollable, and mobile-first.

### Bottom Navigation

- Normalized both bottom navigation render paths in `Map.jsx`.
- Preserved fixed bottom placement.
- Added safe-area padding.
- Kept one-row icon plus label layout.
- Locked active and inactive color states.

### Drawer and Sheet Surfaces

- Locked map panels, sheets, and drawers to white surfaces.
- Reduced grey-card drift.
- Preserved internal scrolling.
- Preserved all existing actions.

### Design System

- Added governance variables for navy, gold, white, background, borders, radii, and motion.
- Locked map controls to Inter.
- Locked editorial map headings to Instrument Serif.
- Standardized focus states with gold outlines.
- Reduced cross-system color drift on map surfaces.

### Accessibility

- Preserved 44px touch target minimum for core command, nav, chip, and drawer controls.
- Added high-contrast active states.
- Added visible focus states.

## Deferred Structural Remediation

These were not changed in this pass because they require component/data refactors:

- Consolidating three map stores into one.
- Removing the duplicate bottom navigation render path.
- Converting all drawers to one universal drawer component.
- Replacing legacy marker color utilities with pin registry adapters.
- Converting filter architecture into explicit Level 1 Intent, Level 2 District, Level 3 Distance.
- Moving search intent UI to a single data-driven registry.

## Validation Plan

Run:

```bash
npm run build
npm run lint
npm run typecheck
```

Manual check:

- `/map?mode=resident&tab=map&filter=All`
- `/map?mode=resident&tab=map&filter=Perks`
- `/map?mode=resident&tab=map&filter=Civic`
- `/map?mode=resident&tab=map&filter=Legends`
- `/map?mode=resident&tab=pass`
- `/map?mode=partner&tab=map&filter=All`
- `/partners/dashboard`
- `/partners/campaigns`
- `/partners/reports`
