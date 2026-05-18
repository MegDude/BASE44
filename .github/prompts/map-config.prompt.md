---
mode: agent
description: Downtown Perks map system — configuration and behavioral directive
---

# Downtown Perks Map — System Directive

## The map is an interface, not a feature.

The Downtown Perks map is the primary entry point into the resident experience.
It must feel immediate, legible, and alive.
This directive defines how it is built, configured, and extended.

---

## Technology

**Library:** React-Leaflet (`react-leaflet` + `leaflet@1.9.4`)
**Tile provider:** CartoCDN light — `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
**No Google Maps.** The platform uses open tile infrastructure.
**Attribution:** `&copy; CARTO` (required, minimal)

---

## Canonical Map Configuration

```ts
// src/lib/mapSystemConstants.js — single source of truth

export const AUSTIN_CENTER = [30.267, -97.743];

export const DOWNTOWN_VIEW_BOUNDS = [
  [30.2582, -97.7535],  // SW corner
  [30.2795, -97.7382],  // NE corner
];

export const MAP_DEFAULTS = {
  center: AUSTIN_CENTER,
  zoom: 14,        // default city-level zoom
  minZoom: 12,     // never pull back past neighborhood level
  maxZoom: 19,     // street-level detail allowed
};
```

**Rule:** These values are the only accepted defaults. Pages and components never hardcode coordinates.

---

## Container Sizing

The map occupies a defined container — it never dictates its own size.

| Surface | Height | Notes |
|---------|--------|-------|
| Explore (mobile) | `calc(100vh - 68px - 44px - 60px)` | screen minus navbar, search, filter strip |
| Explore (desktop) | `100%` of a `w-2/3` panel | side-by-side with results panel |
| Campaign preview | `480px` | fixed, in a rounded card container |
| Partner demo | `400px` | inline section, no overflow |
| Homepage embed | `360px` | teaser, not interactive |

**CSS rule:** Always `overflow: hidden` on the container. Leaflet handles internal overflow.

---

## Tile Layer

```tsx
<TileLayer
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
  attribution="&copy; CARTO"
/>
```

The light CartoCDN tile is chosen deliberately:
- Neutral background that does not compete with markers or UI
- Navy, gold, and category color markers read clearly on it
- Low contrast base matches the off-white UI palette

**Never swap the tile layer without design review.** The tile choice is a product decision.

---

## Coordinate Safety

All coordinates flow through `src/lib/mapCoordinates.js` — no exceptions.

```ts
// Required pipeline for every item rendered on map:
const validItems = filterValidMapItems(items).map(normalizeCoordinates);
const coords = getValidLatLng(item);      // returns null if invalid
if (!coords) return null;                 // silent fail — never crash
```

**Rule:** No lat/lng values reach Leaflet without passing through this validation layer.
If an item has no valid coordinates, it is silently excluded from the map.

### Coordinate shape expected on entities

```ts
entity.location.latitude   // preferred
entity.location.longitude  // preferred
entity.latitude            // fallback
entity.longitude           // fallback
entity.lat                 // fallback
entity.lng / entity.lon    // fallback
```

`normalizeCoordinates()` handles all forms. Use it.

---

## Viewport Management

### Default view
When no item is selected and no items are filtered: fit `DOWNTOWN_VIEW_BOUNDS` at `maxZoom: 15`.

### Filtered results
Fit bounds of valid item coordinates, padded, intersected against `DOWNTOWN_VIEW_BOUNDS`.

```ts
paddingTopLeft:     isDesktop ? [24, 120] : [16, 140]
paddingBottomRight: isDesktop ? [340, 40] : [16, 180]
```

### Item selected
`map.flyTo(position, Math.max(currentZoom, 14), { duration: 0.55 })`
Only fires if position passes `isValidLatLngArray()`.

### Bounds constraint
```ts
map.setMaxBounds(L.latLngBounds(DOWNTOWN_VIEW_BOUNDS))
```
The user cannot pan outside downtown Austin. This is intentional product behavior.

---

## Marker System

### Default resident marker
```ts
L.divIcon({
  html: `<div style="width:12px;height:12px;border-radius:999px;
    background:#0b1f33;border:2px solid #fff;
    box-shadow:0 4px 12px rgba(11,31,51,0.18)"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})
```

### Category color map
```ts
export const CATEGORY_COLORS = {
  restaurant:    '#f59e0b',
  bar:           '#f59e0b',
  fitness:       '#10b981',
  wellness:      '#8b5cf6',
  beauty:        '#ec4899',
  retail:        '#6b7280',
  entertainment: '#3b82f6',
  coworking:     '#06b6d4',
  hospitality:   '#f97316',   // was 'hotel' — canonical key is 'hospitality'
  property:      '#C8973A',   // was 'building' — canonical key is 'property'
};
```

### Partner insight marker
Used in partner-facing map previews. Color encodes insight type:
```ts
const PARTNER_INSIGHT_COLORS = {
  engagement:  '#C8973A',
  campaign:    '#315E7E',
  opportunity: '#2F6F55',
  coverage:    '#7B6B4F',
  performance: '#0B1F33',
};
```

Unselected: 24×24px, 12px border-radius.
Selected: 34×34px, 14px border-radius, outer ring glow.

---

## Filter Chips (canonical)

```ts
export const FILTER_CHIPS = [
  { id: 'places',     label: 'Places',        icon: 'MapPin',     active: true  },
  { id: 'events',     label: 'Events',        icon: 'Calendar',   active: false },
  { id: 'perks',      label: 'Perks',         icon: 'Gift',       active: false },
  { id: 'properties', label: 'Properties',    icon: 'Building2',  active: false }, // not 'buildings'
  { id: 'open-now',   label: 'Open now',      icon: 'Clock',      active: false },
  { id: 'walkable-5', label: '5 min walk',    icon: 'Sparkles',   active: false },
  { id: 'popular',    label: 'Popular now',   icon: 'TrendingUp', active: false },
  { id: 'new',        label: 'New',           icon: 'Star',       active: false },
];
```

**Rule:** `id: 'buildings'` is legacy. Use `id: 'properties'`. Update `mapSystemConstants.js`.

---

## Map Modes

`MapShell` accepts a `mode` prop that controls rendering behavior:

| Mode | Usage |
|------|-------|
| `'resident'` | Default explore experience |
| `'partner'` | Partner dashboard with insight markers |
| `'campaign-preview'` | Inline campaign demo, no interaction required |

---

## Map Surfaces in the Codebase

| Surface | Component | Mode |
|---------|-----------|------|
| `/explore` | `UnifiedMapShell` via `UnifiedMapView` | resident |
| `/partners/*` demos | `MapShell` via `MapExplorer` | partner |
| Campaign pages | `MapShell` via `CampaignMapDemo` | campaign-preview |
| Homepage teaser | `MapShell` (read-only embed) | resident |

---

## Controls

- `zoomControl={false}` — custom zoom controls only; no default Leaflet buttons
- `attributionControl={false}` — attribution rendered manually in footer or overlay
- `scrollWheelZoom={true}` — enabled on all surfaces
- `preferCanvas={true}` — better performance on dense marker sets
- `tap={true}`, `tapTolerance={20}` — mobile touch optimization

---

## What Not To Do

- **Never** use Google Maps. The tile source is CartoCDN. Keep it that way.
- **Never** hardcode `lat`/`lng` values in pages or components. Use `AUSTIN_CENTER` from constants.
- **Never** render a `<Marker>` without passing coordinates through `getValidLatLng()`.
- **Never** use `map.setView()` or `map.flyTo()` directly in a page — use `MapFlyTo` or `MapViewportManager`.
- **Never** override `DOWNTOWN_VIEW_BOUNDS`. It defines the product's geographic scope.
- **Never** label a filter chip or marker category `'hotel'` or `'building'`. Use `'hospitality'` and `'property'`.

---

## Completion Criteria for Map Changes

You are done when:

- [ ] All marker categories use canonical keys (`hospitality`, `property`, not `hotel`, `building`)
- [ ] `FILTER_CHIPS` in `mapSystemConstants.js` uses `id: 'properties'`, not `id: 'buildings'`
- [ ] `CATEGORY_COLORS` uses `hospitality` and `property` keys
- [ ] No page or component hardcodes coordinates outside `mapSystemConstants.js`
- [ ] All coordinate paths flow through `src/lib/mapCoordinates.js`
- [ ] Map renders without console errors on `/explore` and partner preview routes
- [ ] Viewport snaps to `DOWNTOWN_VIEW_BOUNDS` when no items or selection

If the map feels off, check coordinate validation and bounds constraints first.
