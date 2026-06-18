# Downtown Perks Mobile-First Audit

Target viewport: `390px x 844px`

## Primary Rule

Mobile is the source of truth. Desktop enhances the same structure.

## Critical Mobile Surfaces

### Map

Status: Partial

Findings:

- Map is the dominant route and canvas.
- Command console and bottom nav can compete for vertical space.
- Drawers need strict height caps so map context remains visible.

Applied:

- Ask the Map collapsed state is fixed at the top center.
- Expanded command center uses capped width/height.
- Bottom nav is fixed and normalized across render paths.
- Drawer shells get max-height caps and scrollable interiors.

### Ask the Map

Status: Improved

Findings:

- The command center has resident/partner switch, search, prompt rail, featured pin rail, answer stack.
- The UI can become visually heavy if rails wrap or panel expands too far.

Applied:

- Single-row horizontal rails.
- Compact 44px search row.
- Touch-safe 44px controls.
- No dark or grey selected text failures.

### Bottom Navigation

Status: Improved

Findings:

- Resident and partner nav render through multiple code paths.
- Items must never sit at the screen edge without safe-area padding.

Applied:

- Fixed shell receives safe-area bottom padding.
- Nav items are one row, no wrapping.
- Active and inactive states are high contrast.

### Drawers and Sheets

Status: Partial

Findings:

- Drawers are numerous and not yet a single universal component.
- Some panels can still behave like pages.

Applied:

- Max-height and overflow guardrails.
- White surface lock.
- Reduced border/grey treatment.

Needs component work:

- Universal drawer architecture.
- One scroll container per drawer.
- Hero/title/actions/story/related/footer structure.

### Resident Card

Status: Partial

Findings:

- QR and demo scanning flow exist.
- Visual density can still be reduced.

Recommended:

- Keep QR centered and dominant.
- Keep actions: Show QR, Add Wallet, Perks, Events.
- Remove heavy metric/stat surfaces from card context.

## Mobile Checklist

- Touch targets: enforced at 44px for command center and nav.
- Rails: horizontal scroll, no wrapping.
- Safe areas: command center top and nav bottom use safe area.
- Text contrast: selected/unselected states locked to navy/white/gold.
- Drawer scroll: map panels should scroll internally.
- Map dominance: command center and drawer surfaces are capped.

## Remaining Risks

- Large `Map.jsx` makes mobile behavior harder to reason about.
- Multiple bottom navigation render paths can diverge again.
- Some legacy components use Tailwind `rounded-full`, `bg-primary`, `text-muted-foreground`, and should be migrated to tokens.
