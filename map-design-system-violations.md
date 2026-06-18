# Downtown Perks Map Design System Violations

Target: `http://localhost:5173`

## Locked Tokens

Allowed colors:

```css
--navy-900: #0B1F33;
--navy-800: #132238;
--gold-500: #C8A96A;
--gold-600: #B8963E;
--bg: #F7F8FB;
--surface: #FFFFFF;
--border: rgba(11,31,51,0.08);
```

Allowed fonts:

- Instrument Serif for headlines
- Inter for UI, body, labels, buttons, controls

Allowed interaction motion:

- 180ms
- 220ms
- 260ms
- `cubic-bezier(.22,1,.36,1)`

## Observed Violations

### 1. Competing Color Systems

Examples found in source:

- `#425466`
- `#071B2F`
- `#0A121E`
- `#BFA46A`
- black overlays
- muted Tailwind theme colors
- grey card backgrounds

Impact:

- Makes the map feel assembled from separate systems.
- Creates low-contrast selected states when dark text lands on dark fill or white text lands on light fill.

Remediation:

- Map surfaces now receive token overrides in the global remediation block.
- Legacy route/page colors should be converted gradually to tokens.

### 2. Shape Drift

Observed:

- `rounded-full`
- `rounded-lg`
- `rounded-xl`
- `rounded-t-3xl`
- `rounded-[3px]`
- `rounded-[6px]`
- `rounded-[18px]`
- `rounded-[24px]`

Impact:

- Controls feel unrelated across Ask the Map, bottom navigation, cards, and drawers.

Remediation:

- Controls are locked to a 14px radius.
- Large map surfaces are locked to a 24px radius.
- Legacy component cleanup should remove radius utilities that fight those classes.

### 3. Button Hierarchy Drift

Observed:

- Multiple button sizes.
- Mixed capitalization.
- Heavy navy blocks in map context.
- Equal-weight CTA rows.

Impact:

- Slows decisions because every action competes equally.

Remediation:

- Map button controls receive a shared glass/navy/gold contrast treatment.
- Primary action should remain singular inside each drawer.

### 4. Typography Drift

Observed:

- `font-heading`
- `font-body`
- system default utility leakage
- tracking-heavy labels
- negative or tight tracking on some headings in older components

Impact:

- Premium editorial feel breaks across panels.

Remediation:

- Global `.dp-editorial-headline` class should be used for display headings.
- Map command labels are Inter, uppercase, compact.

### 5. Card/Nesting Overuse

Observed:

- Cards inside drawers.
- Borders inside card groups.
- Dashboard metrics shown within map-context panels.
- Multiple section blocks where one decision layer would work.

Impact:

- The product becomes a directory/dashboard instead of a decision engine.

Remediation:

- The remediation CSS removes grey fills and heavy borders from map panels.
- Component refactor should merge repeated sections into decision/story/action.

### 6. Pin System Drift

Observed:

- Central `pinAssetRegistry.ts` exists.
- Legacy `mapUtils/markerIcons.jsx` still defines category color maps.
- `MarkerFactory.jsx` uses direct icons/logos, not the requested navy circle/gold icon system.

Impact:

- Pin design can split between old and new systems.

Remediation:

- Keep `pinAssetRegistry.ts` as the source of truth.
- Migrate legacy marker color maps to registry adapters.

## Acceptance Status

Presentation-layer lock has been applied for map command center, rails, bottom navigation, drawers, selected text contrast, and core map surfaces.

Remaining violations are mostly structural and should be handled by component consolidation rather than broad visual overrides.
