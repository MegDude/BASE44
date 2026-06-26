# Design System Audit

## Current Rule

Downtown Perks uses one product language across resident and partner surfaces. Differences may exist in information hierarchy, copy, data, and actions. Typography, spacing, controls, drawers, cards, icons, and motion should feel shared.

## Verified Current State

- Inter is the active interface typeface.
- A final imported typography governance layer now exists at `src/styles/typography-governance.css`.
- `src/main.jsx` imports that layer after the prior polish files.
- Map, saved drawer, search console, partner workspace, contact, and pricing surfaces still have many older local rules beneath that final layer.
- Several components still include `font-bold`, `font-extrabold`, and `font-heading` utility classes, but the final governance layer softens them globally.

## Typography Governance

The product should avoid overly heavy text. Default targets:

- Body: 400-430
- Labels: 500-560
- Strong text: 560
- Headings: 520-560
- Avoid 700-900 except inside visual assets or brand SVGs where unavoidable.

Instrument/serif display drift should not be used for app panels, drawers, cards, popups, controls, or operational copy.

## Component Duplication

Duplicate visual primitives remain across:

- `src/components/ui`
- `src/components/map`
- `src/components/partner`
- page-level button/card/drawer JSX
- late CSS files with final overrides

Most duplicated categories:

- Buttons
- Cards
- Drawers/sheets
- Search inputs
- Filter chips
- KPI cards
- Timeline/activity rows
- Tables/report cards

## CSS Risk

The app relies on multiple late-stage CSS layers:

- `map-glass-final.css`
- `dp-recovery-final.css`
- `search-rollup-final.css`
- `search-console-premium-final.css`
- `downtown-command-center.css`
- `homepage-standardization-patch.css`
- `pricing-clean.css`
- `contact-clean.css`
- `typography-governance.css`

This works, but it is fragile. The final architecture should reduce override layers into tokens, primitives, and route-specific composition.

## Required Remediation

1. Keep `typography-governance.css` as the final temporary lock.
2. Create shared primitives for button, card, drawer, search, chip, table, KPI, timeline.
3. Remove page-specific copies after each surface migrates to primitives.
4. Move visual constants into tokens.
5. Reduce `!important` usage once duplicate selectors are removed.
6. Add visual regression smoke tests for map, saved drawer, search console, partner workspace, pricing, and contact.

## Score

Design system score: **8/10**

The visual direction is strong. The implementation is still override-heavy and needs component consolidation before it can be considered enterprise-grade.
