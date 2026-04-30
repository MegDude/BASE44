# Pearl UI Build Spec

## 0) What this build must achieve
- Map-first architecture: the live map is the permanent background
- No static cards/panels: details are instantiated only when user interacts
- Glass-morphic overlays with Pearl White containers and blur
- Signal Gold for active states, pins, primary moments

## 1) Design tokens
### Colors (CSS variables / Tailwind theme)
- `--pearl-white`: rgba(255,255,255,0.90)
- `--pearl-white-80`: rgba(255,255,255,0.80)
- `--signal-gold`: #F2C14E
- `--ink`: #0B0F1A
- `--muted`: rgba(11,15,26,0.64)
- `--navy`: #0B1535

### Blur settings
- Header: `backdrop-filter: blur(12px)`
- Active Sheet: `backdrop-filter: blur(20px)`

### Typography
- Font stack: `ui-sans-serif, system-ui, Inter, SF Pro Display, Segoe UI, Roboto`
- Base size: 14px
- Small: 12px
- Heading: 18–24px
- Line height: 1.35–1.5
- Weights: Regular + SemiBold only

### Spacing
- Unit: 8px
- Rhythm: 8/16/24/32
- Padding: 16px on primary floating surfaces

## 2) System primitives
Create/standardize these components:
- `MapShell` — map background, everything floats above it
- `FloatingHeader` — glass header, icon-first
- `SearchAnchor` — hero search prompt: "Where are you going?"
- `CategoryStrip` — Signal Gold categories (Coffee/Dinner/Happy Hour/Wellness)
- `ActiveSheet` — full-width bottom drawer with 48px handle

## 3) Build phases
### Phase 1: Foundation
- Add tokens and apply global typography
- Disable default borders on cards/containers
- Ensure home route renders map + primitives only

### Phase 2: Interaction-driven UI
- Remove default static selection panel (e.g., Rainey card)
- Wire map pins/search results to open `ActiveSheet`

### Phase 3: Amenity + Pulse layers
- Amenity tabs filter map views
- Events/happy hour pins trigger a slim action sheet (slide-out on desktop)

### Phase 4: Dashboard reduction
- KPI horizontal strip (Scans, Action Rate, Redemptions, Active Perks)
- "What’s Working Now" floating answer card

## 4) QA checklist
- Map is always visible
- No border-based separation
- No content loads by default that should be user-triggered
- Responsive behavior: drawers on mobile, panels on desktop
