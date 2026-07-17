# Downtown Perks Design System 2.0 — Volume 1B

This repository's canonical visual foundation is `src/styles/design-system-2.css`.
It is intentionally loaded after legacy styles so every product surface resolves to
one palette, semantic system, surface hierarchy, radius scale, and elevation system.

## Engineering law

- Use `--dp-*` variables or their `dp` Tailwind mappings. Do not add literal colors.
- Cards and controls use `--dp-radius-xs` through `--dp-radius-lg`.
- `--dp-radius-xl`, `--dp-radius-sheet`, and `--dp-radius-native-sheet` are reserved
  for dialogs, drawers, and native map sheets.
- Pill buttons, capsule filters, chip clouds, glassmorphism, glow, neumorphism,
  decorative gradients, and heavy shadows are prohibited.
- Third-party primitives must be restyled before they are accepted.
- AI is rendered as editorial insight content, never chat bubbles.
- Charts use navy for discovery, emerald for engagement, gold for conversion, and
  neutral tones for comparisons.

## Enforcement

Run `npm run audit:design-system` before committing frontend work. The command scans
new and changed lines and fails on visual-law regressions. `npm run
audit:design-system:all` produces a non-blocking inventory of inherited styling debt
so it can be migrated incrementally without blocking unrelated releases.

Approved component examples:

```css
.dp-example-card {
  border: var(--dp-border-width) solid var(--dp-border);
  border-radius: var(--dp-radius-md);
  background: var(--dp-surface-1);
  box-shadow: none;
  color: var(--dp-text-primary);
}
```

```jsx
<button className="h-11 rounded-dp-md bg-dp-primary text-white shadow-none">
  View report
</button>
```
