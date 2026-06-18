# Downtown Perks Accessibility Audit

Target: `http://localhost:5173`

## Accessibility Goals

- WCAG AA contrast.
- 44px minimum touch targets.
- Keyboard navigation for primary controls.
- Visible focus state.
- Semantic labels for icon buttons.
- No selected-state contrast failure.

## Current Strengths

- Search console input has an `aria-label`.
- Search console rails use buttons and `aria-pressed`.
- Bottom navigation buttons use `aria-pressed`.
- Drawer close/back buttons generally include `aria-label`.
- Resident card sheet uses dialog semantics in several paths.
- Ask responses use `aria-live` in the map command answer block.

## Findings

### Touch Targets

Status: Partial

Risk:

- Some legacy buttons are visually small or icon-only.

Applied:

- Global map governance CSS enforces 44px minimum touch targets for command center, nav, chips, submit/collapse, and drawer controls.

### Focus States

Status: Improved

Risk:

- Some custom buttons have no obvious focus ring.

Applied:

- Focus-visible ring is locked to `#C8A96A` for map command/nav/drawer controls.

### Contrast

Status: Improved

Risk:

- Previous active states could produce dark text on dark backgrounds or white text on light backgrounds.

Applied:

- Selected/active nav and filter states use explicit text/icon colors.
- Unselected controls use navy muted text on white/glass.

### Dialogs and Drawers

Status: Partial

Risk:

- Multiple drawer implementations may not all enforce focus management.
- Some map panels are `dialog`, others are `aside`.

Recommendation:

- Universal drawer should use `role="dialog"` for modal overlays and maintain focus trap when it blocks background interaction.

### Screen Reader Labels

Status: Partial

Risk:

- Logo-only featured pin controls require label/title consistency.

Observed:

- Featured pin rail buttons have `aria-label={item.label}`.

Recommendation:

- Keep label text in the accessibility tree even when visual labels are hidden.

### Keyboard Navigation

Status: Partial

Risk:

- Map marker keyboard navigation is not verified.

Recommendation:

- Ensure marker elements or their list equivalents are keyboard reachable.
- Results list should mirror marker selection.

## Acceptance Checklist

- Command center collapsed trigger is keyboard focusable.
- Expanded search input is focusable and labeled.
- Prompt and featured rails are button-based.
- Bottom navigation is keyboard focusable.
- Selected states pass contrast.
- Drawer close/back controls have labels.
- QR demo scan controls have labels.

## Not Verified in This Pass

- Full screen-reader traversal.
- Browser-based keyboard tab order.
- Map marker keyboard focus.
- Automated axe scan.
