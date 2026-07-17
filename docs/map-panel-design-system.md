# Downtown Perks map panel design system

Status: approved baseline with mobile-first refinement for iPhone 15-class viewports.

## Source of truth

- Shared drawer rendering and content order: `src/pages/Map.jsx`
- Shared identity header: `src/components/map/unified/EntityIdentityPanel.tsx`
- Native sheet geometry and list behavior: `src/styles/map-native-drawer-authority-final.css`
- Final detail panel, action, media, and compact-mobile rules: `src/styles/map-detail-panel-product-final.css`
- Shared navigation controls: `src/styles/map-panel-navigation-system-final.css`
- Collection, discovery-walk, and art-walk sheets: `src/components/map/CollectionRoutePanel.jsx` with final authority in `src/styles/route-collection-product-final.css`

Do not add a new per-entity drawer theme when these shared classes can express the design. Resident and partner panels use the same shell, spacing, typography, controls, media treatment, and bottom navigation. Their copy and available actions may differ by audience.

## Visual language

- Canvas: `#F7F8FB`
- Panel surface: `#FFFFFF`
- Primary ink: `#0B1F33`
- Supporting ink: `#445363`
- Accent: Downtown Perks gold (`#BFA46A`; use the stronger accessible gold only for small text)
- UI and body type: Inter or the system sans stack
- Display serif: only for an established hero or editorial display treatment, never routine panel UI
- Sections: flat white regions separated by fine rules; avoid nested bento cards
- Media: full-color, unshaded, 16:9 on compact mobile detail panels
- Corners: restrained 10–18px sheet/media corners and 10–12px controls; avoid excessive pills. Route sheets are the deliberate exception: their panels, controls, actions, stop rows, and check-in surfaces remain sharp with `0px` corners.

## iPhone 15 interaction contract

- Design reference width: 393px; support 375–430px without horizontal scrolling.
- Back, close, drag, tab, and action targets are at least 44px. Primary actions are 48px high.
- The first action is visually primary and full width on compact screens. Additional actions use a two-column grid and may wrap to two lines.
- The sheet respects top and bottom safe areas and never sits under the fixed tab dock.
- Panel content scrolls independently with momentum and contained overscroll.
- The sticky header always provides a centered, truncated title plus back and close controls.
- Bottom tabs remain reachable while a panel is open and use an icon plus a short text label.

## Route and collection sheet contract

- Use the shared `CollectionRoutePanel` for every discovery walk, art walk, tour, and map collection; do not create collection-specific panel shells.
- Use one vertical scroller inside the sheet. The header stays fixed, the content region owns `overflow-y: auto`, and the stops list must never become a second nested scroller.
- Keep the sheet above the fixed bottom navigation and include safe-area padding after the final stop.
- Present route value, metadata, actions, completion, and stops as flat editorial sections divided by fine rules—not cards or bento blocks.
- Give visual weight only to the start and check-in actions. Walking directions and “View all stops” remain lightweight text actions.
- Render stops as full-width divided rows with plain numeric indices. Active state uses a slim left rule, never a filled card or pill.
- Every route must expose all stops through touch scrolling; selecting the final stop must work without minimizing or exiting the sheet.
- Route check-in dialogs use the same sharp geometry and retain QR scan, nearby verification, manual code entry, status, and full internal scrolling.

## Content order

1. Drag affordance and navigation header
2. Hero media when useful
3. Entity identity: audience label, title, concise subtitle, one short context paragraph
4. Primary action group
5. Detail sections in decision order
6. Nearby or related horizontal rail
7. Ask-the-map prompts or supporting tools

Do not repeat the title, category, offer, address, or summary in adjacent sections. Truncated text ends at a word boundary with an ellipsis; it must never end on a dangling conjunction.

## Baseline backup

The pre-refinement system is preserved under `backups/map-panel-design-system/2026-07-16-before-ios15-polish/` as both a source archive and a worktree patch.
