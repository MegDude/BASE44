# Native Map Regression Audit Template

Use this after every resident map change.

## Route

- `/map?mode=resident&tab=map&filter=All`
- `/map?mode=resident&tab=map&filter=Events`
- `/map?mode=resident&tab=map&filter=Perks`
- `/map?mode=resident&tab=map&filter=Buildings`
- `/app/map?mode=resident&tab=map&filter=Perks` redirects to the matching `/map` URL and never renders a separate surface

## Viewports

| Viewport | Result | Notes |
| --- | --- | --- |
| 393 x 852 | Pending | iPhone 15 |
| 360 x 800 | Pending | narrow Android |
| 768 x 1024 | Pending | tablet |
| 1440 x 1000 | Pending | desktop |

## Architecture checks

- one map shell
- one selected entity
- one active sheet
- one internal sheet scroll container
- one bottom navigation
- one map-padding source
- one state reducer
- no legacy drawer CSS leaking into resident route
- no marketing hero components inside map
- no oversized buttons, pills, bento boxes, or dark bottom-nav blocks

## Interaction checks

- tap pin opens one sheet
- close returns to map without rerouting
- back returns to map without rerouting
- bottom navigation remains fixed and usable
- search updates results without closing the app
- filter updates results without onboarding/auth loops
- map pan and zoom stay enabled
- selected pin does not jump away from its coordinates
- QR/Card state uses the same sheet system

## Accessibility checks

- 44px minimum touch targets
- visible focus styles
- labeled search input
- labeled bottom navigation
- close and back buttons have accessible names
- reduced-motion mode removes nonessential motion

## Validation commands

```bash
npm run typecheck --if-present
npm run lint --if-present
npm run build
```
