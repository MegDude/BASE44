# Downtown Perks Map Parity Checklist

**Date:** 2026-04-15  
**Baseline:** `/resident-app` map inventory  
**Purpose:** Verify rebuild preserves current map functionality and plotted inventory

## Coordinate Safety

- [x] `lib/mapCoordinates.js` created with validation utilities
- [x] `toFiniteNumber()` - safely converts numbers/strings, returns null on invalid
- [x] `isValidCoordinate()` - validates both lat/lng are finite
- [x] `normalizeCoordinates()` - standardizes all coordinate field names
- [x] `getValidLatLng()` - returns only valid [lat, lng] arrays
- [x] `filterValidMapItems()` - removes invalid records before rendering

## Page Refactoring

### Explore Page
- [x] Import coordinate utilities
- [x] Normalize venues + buildings through shared helper
- [x] Filter invalid items before marker rendering
- [x] Guard flyTo with `isFinite()` validation
- [x] Update smart filter coordinate checks
- [x] Preserve venue/building inventory

### Events Page
- [x] Import coordinate utilities
- [x] Normalize event coordinates
- [x] Filter invalid events before map usage
- [x] Guard event selection flyTo
- [x] Preserve event location coverage

### ResidentApp Page
- [ ] Locate ResidentApp.jsx or equivalent `/resident-app` route file
- [ ] Import coordinate utilities
- [ ] Normalize all plotted places, hotels, buildings
- [ ] Preserve nearby stack behavior
- [ ] Preserve selection and detail drawer
- [ ] Maintain baseline inventory density

## Shared Map System

- [ ] `components/map/MapShell.tsx` created
- [ ] MapShell uses shared coordinate validation
- [ ] MapShell replaces duplicate page-specific implementations
- [ ] One canonical map component in use across all pages

## Inventory Preservation

| Entity Type | Old Build | New Build | Coordinates Valid | Pin Renders | Nearby List | Details | Status |
|-------------|-----------|-----------|-------------------|-------------|-------------|---------|--------|
| Venues | ✓ | ? | ? | ? | ? | ? | PENDING |
| Events | ✓ | ? | ? | ? | ? | ? | PENDING |
| Hotels | ✓ | ? | ? | ? | ? | ? | PENDING |
| Buildings | ✓ | ? | ? | ? | ? | ? | PENDING |
| Landmarks | ✓ | ? | ? | ? | ? | ? | PENDING |

## Mobile Behavior

- [ ] Map viewport remains primary
- [ ] Results list moves to bottom sheet
- [ ] Sidebars collapse on mobile
- [ ] Filters scroll horizontally
- [ ] Pins remain tappable
- [ ] Text truncates cleanly

## Error Resolution

- [x] `Invalid LatLng object: (NaN, NaN)` prevented at source
- [ ] All remaining map pages audited
- [ ] No page-specific coordinate parsing remains
- [ ] All coordinate creation routed through shared utility

## Sign-Off

- [ ] Explore page stable
- [ ] Events page stable
- [ ] ResidentApp stable (or confirmed doesn't exist)
- [ ] MapShell component created and tested
- [ ] No duplicate map logic remains
- [ ] Parity verified
- [ ] Mobile behavior fixed

**Status:** IN PROGRESS
**Next Step:** Audit for ResidentApp; create MapShell; verify mobile behavior