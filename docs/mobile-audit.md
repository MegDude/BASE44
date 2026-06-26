# Mobile Audit

## Mobile Rule

Resident and partner surfaces must be mobile-first. Drawers should stay usable within viewport height, panels should scroll, bottom navigation should not hide content, and no page should introduce horizontal overflow.

## Current Strengths

- Map drawers have received bottom-sheet/mobile polish in previous passes.
- Search console and saved drawer have compact mobile-oriented styling layers.
- Typography governance reduces oversized/bold text across panels and cards.
- The product route on `5173` now serves from the intended checkout after stale server correction.

## Remaining Mobile Risks

- Some panels still rely on late CSS overrides rather than a single drawer primitive.
- Partner reports/activity/campaign/info panels require regression testing at 320, 375, 390, 430, and 768 widths after every drawer edit.
- Tables and KPI clusters need shared responsive primitives.
- Footer action bars must be audited for safe-area padding and max-height at every panel.

## Required Test Matrix

Routes:

- `/map?mode=resident&tab=map&filter=All`
- `/map?mode=resident&tab=map&filter=Saved`
- `/map?mode=partner&tab=map&filter=All`
- `/map?mode=partner&tab=reports`
- `/map?mode=partner&tab=activity`
- `/map?mode=partner&tab=campaigns`
- `/partner-workspace/overview`
- `/marketing/pricing`

Viewport widths:

- 320
- 375
- 390
- 430
- 768

Checks:

- no horizontal overflow
- drawers scroll and close
- footer does not cover content
- text wraps without clipping
- CTA rows do not overlap
- map remains usable

## Score

Mobile score: **7/10**. Strong product polish exists, but it is still override-based and needs automated viewport regression tests.
