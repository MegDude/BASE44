# Unified Map Architecture (Phase 3 Lock)

## Overview
Single map engine powering all discovery surfaces (Explore, Events, Buildings, Partner Pages). Real-time search, filters, heatmap, redemptions, and drawer/panel UI.

## Core Components

### Store (Zustand)
`store/unified-map-store.js` — Single source of truth
- Selection state (id, type, drawer state)
- Search query + active filters
- Map pan/zoom state
- Live action tracking + heatmap data
- Redemption state + tracking

### Constants
`lib/mapSystemConstants.js` — Global enforcement
- Breakpoints, container config
- Button sizes, map layout dimensions
- Drawer state heights
- Filter chip definitions
- Search prompt templates
- Category color mappings
- Motion animation presets

### UI Components

#### Search
`components/map/unified/UnifiedSearchBar.jsx`
- Mobile-first input with AI intent detection
- Dropdown prompts when empty
- Ask the Map AI trigger
- Controls entire map via store

#### Filters
`components/map/unified/UnifiedFilterChips.jsx`
- Mobile horizontal scroll + desktop wrap
- Multi-select toggle
- Active indicator
- Real-time results sync

#### Map Shell
`components/map/unified/UnifiedMapShell.jsx`
- Leaflet wrapper
- Marker rendering
- Coordinate safety validation
- Optional child layers (heatmap)

#### Drawer (Mobile)
`components/map/unified/UnifiedDrawer.jsx`
- Tri-state (collapsed, mid, full)
- Touch gesture support
- Desktop: side panel alternative

#### Results Panel (Desktop)
`components/map/unified/UnifiedResultsPanel.jsx`
- Scrollable venue/event/building list
- Selection highlighting
- Empty state handling

#### Heatmap Layer
`components/map/unified/HeatmapLayer.jsx`
- Real-time density visualization
- Time-filtered clustering
- Interactive popups

#### Time Filter
`components/map/unified/TimeFilter.jsx`
- Global time control (Now, Today, Week)
- Affects heatmap + trending pins

### Adapter Hooks
- `VenueMapAdapter` — Venue + Building unified filtering
- `EventMapAdapter` — Event-specific logic
- Returns combined items + marker factory

## Data Flow

```
User Input (search/filter)
    ↓
Store (activeFilters, query)
    ↓
Adapter (filter items)
    ↓
MapShell (render markers)
    ↓
Drawer/Panel (show details)
    ↓
trackAction (save/redeem/RSVP)
    ↓
UserAction entity + live feed
```

## Mobile-First Breakpoints
- **Mobile (0-639px)**: Full-screen map + bottom sheet
- **Tablet (640-1023px)**: Map + floating panels
- **Desktop (1024px+)**: 2/3 map + 1/3 results panel

## Real-Time Features

### Live Actions
- Subscribe to UserAction creates
- Feed into heatmap clustering
- Track saves, redemptions, RSVPs

### Heatmap
- Time-filtered (now=30min, today=0:00, week=7d)
- Spatial grid clustering (anonymity)
- Density color scaling

### Drawer States
- **Collapsed**: Map full screen, sheet hidden
- **Mid**: Map shrinks, results preview visible
- **Full**: Detail view with CTAs

## Redemption Flow
1. User taps "Redeem" in detail drawer
2. Store sets `isRedeeming=true`, `redeemingId=<id>`
3. QR modal displays
4. On scan/confirm: `trackAction('redeem')`
5. Success overlay → dismiss
6. Action appears in live feed + heatmap

## Consistency Rules
- **Never manually manage coordinates** — Always validate via `getValidLatLng()`
- **Always filter items** — Use `filterValidMapItems()` before map render
- **Store is source of truth** — Components read/write only via store actions
- **Motion presets** — Use `MOTION_PRESETS` from constants
- **Colors** — Use `CATEGORY_COLORS` for category icons

## Pages Using Unified Map
- `/downtown-perks/explore` (ExploreRebuilt)
- Partner analytics dashboards
- Admin heatmap monitoring

---

**Phase 3 Complete**: Map system locked, canonical components standardized, real-time flows documented.