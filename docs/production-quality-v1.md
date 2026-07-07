# Production Quality V1

Status: Canonical refinement directive  
Repository: `/Users/megdude/Downloads/BASE44 2`  
GitHub: `https://github.com/MegDude/BASE44`  
Branch: `main`

## Objective

Downtown Perks is now in a product-quality phase. The platform is stable enough that broad feature accumulation should stop unless a feature is explicitly reviewed, verified, and approved.

Production Quality V1 focuses on presentation, consistency, maintainability, technical maintenance, and low-risk refinement.

## Repository Rule

`BASE44 2` is the production source of truth. Archive repositories are reference material only.

Do not blind-merge older branches. Do not cherry-pick work only because it is newer. Import a change only when it improves the production application without introducing regressions.

## Application Design System

Every application screen should share spacing, typography, control sizing, interaction timing, icon sizing, panel rhythm, and drawer architecture.

Marketing may use a distinct editorial treatment. Application surfaces must feel like one premium native product.

Application surfaces include resident app, partner workspace, dashboard, reports, campaigns, pricing, registration, billing, settings, drawers, panels, sheets, dialogs, CRM, media, and admin tools.

## Typography

Application surfaces use one interface typeface:

- Inter
- SF Pro Display where available
- system-ui fallback

Do not use Instrument Serif within the application. Build hierarchy through spacing, weight, scale, and composition.

## Visual Weight

Reduce visual weight through fewer stacked cards, fewer nested containers, lighter borders, fewer boxed sections, softer shadows, and less dashboard framing.

Use whitespace, photography, typography, elevation, and subtle layering. Use navy for text, icons, navigation, and emphasis, not as a dominant surface color.

## Drawer Architecture

Every entity drawer should follow the same presentation model:

1. Hero
2. Context
3. Primary action
4. Story
5. Nearby
6. Continue exploring

Only the content changes.

## Content Preservation

Do not replace venue narratives, property descriptions, hotel content, event copy, inKind explanations, Legends content, partner-authored copy, or manually curated descriptions.

Presentation may change. Content must survive. Remove only literal duplication.

## Mobile-First Quality

Design from a 390 x 844 viewport first. Desktop expands the experience. It does not define it.

Every primary interaction should be reachable comfortably with one hand.

## Interaction Quality

Standard timing:

```css
220ms cubic-bezier(.22, 1, .36, 1)
```

Use the same motion behavior for transitions, hover, pressed, loading, empty, success, and error states.

## Map Rule

The map is stable. Only perform presentation refinements unless a bug requires otherwise.

Do not modify clustering, pin logic, search, routing, filters, or entity loading without a focused QA pass.

## Release Gate

Before deployment:

- Working tree is clean except approved changes
- `npm run lint` passes
- `npm run typecheck` passes
- `npm run build` passes
- Mobile QA completed
- Desktop QA completed
- Map verified
- Partner workflow verified
- Checkout verified
- Reports verified
- No new console errors
