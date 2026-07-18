# Mobile panel performance audit

Date: 2026-07-16

This document records the performance requirements and current architectural risks for the native sheet rebuild.

## Current baseline risks

| Risk | Source | Impact | Correction |
| ---- | ------ | ------ | ---------- |
| Multiple sheet engines | `Map.jsx`, `CollectionRoutePanel`, `MobileTabDrawerShell`, `UnifiedDrawer`, `features/native-map/NativeBottomSheet`, `BottomSheet` | More layout code, more CSS overrides, harder drag performance | One shared `NativeSheet` engine |
| Multiple panel visibility booleans | `clusterDrawer`, `selectedDrawerClosed`, `selectedDrawerMinimized`, `activePartnerPanel`, tab state | Extra rerenders and inconsistent visibility | State machine/reducer with one active sheet |
| Global dialog CSS overrides | `index.css`, `dp-recovery-final.css`, `map-glass-final.css`, other recovery styles | Recalculation and unpredictable cascade | Retire broad `[role="dialog"]` overrides after migration |
| Nested scroll regions | Results, route panels, entity drawers, modal content | Scroll jank and keyboard traps | One vertical scroll owner per sheet |
| Map camera/padding duplication | Map controls, selected entity, drawers, native-map prototype | Repeated recentering and map jumps | One map-padding source derived from sheet height |
| Large blur areas | Frosted panels and possible child blur surfaces | GPU cost on mobile | Blur only the primary sheet surface |
| Full page rerenders during interaction | State lives in map page and many render branches | Selection and drag can trigger wide rerenders | Memoized rows, stable keys, localized sheet state |

## Targets

```text
60fps sheet drag on iPhone 15
Under 100ms visible selection response
No layout shift when opening Detail
No blank frame during level transition
No full map rerender during sheet drag
No repeated camera recenter during sheet scroll
```

## Implementation requirements

- transform-based sheet movement
- passive pointer/touch listeners where appropriate
- `ResizeObserver` / `visualViewport` for geometry updates
- stable map padding source
- lazy-load detail media
- preload selected detail content when a row is near selection
- memoize Browse rows
- cancel stale data requests
- keep Google map instance stable across sheet transitions
- avoid applying blur to every child surface

## Performance validation

After implementation:

1. Open Events Nearby at `393 × 852`.
2. Expand Peek → Browse.
3. Drag Browse without map pan stealing the gesture.
4. Select an event.
5. Scroll Detail.
6. Back to Browse.
7. Confirm map center, zoom, and list scroll are restored.
8. Repeat with reduced motion enabled.

Record:

- visible jank
- dropped/blank frames
- content clipping
- unexpected map recentering
- duplicate marker/panel rendering
- console errors
