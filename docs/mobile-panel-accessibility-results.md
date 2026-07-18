# Mobile panel accessibility audit

Date: 2026-07-16

This is the baseline accessibility checklist for the native sheet migration. Results should be updated after implementation screenshots and keyboard/screen-reader verification.

## Current baseline observations from source inspection

| Area | Current state | Risk | Required correction |
| ---- | ------------- | ---- | ------------------- |
| Dialog semantics | Several panels use `role="dialog"`; others are page panels or custom sections | Multiple dialog-like surfaces can coexist and confuse focus order | One active `NativeSheet` with clear `aria-labelledby`, level announcements, and focus restoration |
| Focus management | Back/close buttons exist in several branches | Focus restoration is not centralized | `NativeSheetProvider` owns focus capture/restoration per transition |
| Gesture alternatives | Drag handles exist through `NativeDrawerHandle` but not one explicit control grammar | Gestures may be required to discover states | Provide explicit Expand, Collapse, Back, Close buttons |
| Touch targets | Bottom nav and many buttons appear near 44px, but panel content varies | Small icon-only controls may fail | Enforce 44×44 minimum on sheet header, action rows, and drag handle |
| Screen-reader progress | Result counts and sheet level changes are not governed by one live region | Users may not know Browse/Detail changed | Add polite live region for sheet level, context, and result count |
| Color-only state | Some selected/active states rely on color or styling | Selected state may not be announced | Use `aria-pressed`, `aria-selected`, or checked rows plus text/state labels |
| Nested scrolling | Several panels can contain list/carousel/card scrolls inside drawer scroll | Keyboard and screen readers can become trapped | One vertical scroll owner inside Browse/Detail |
| Map-only access | Map pins are visual, but list drawers provide some access | Entity access can degrade during map/provider errors | Browse list must remain complete and operable without map interaction |
| Reduced motion | Some CSS includes reduced-motion guards, but motion is scattered | Inconsistent behavior | Motion tokens and sheet transitions must respect one reduced-motion switch |

## Acceptance checks

- [ ] Only one active sheet/dialog is exposed to assistive tech.
- [ ] Sheet title is announced on open.
- [ ] Level changes are announced without stealing focus.
- [ ] Back returns focus to the triggering row or parent sheet control.
- [ ] Close returns focus to the originating map/search/bottom-nav control.
- [ ] Every entity reachable by marker is reachable by list row.
- [ ] Every action button has an action-specific label.
- [ ] Save/selected state is communicated by accessible state and visible text/icon.
- [ ] Keyboard users can expand, collapse, back, close, select rows, save, redeem, and open directions.
- [ ] Text enlargement does not clip sheet header or primary action row.
- [ ] Reduced motion still communicates hierarchy.

## First implementation focus

For Events Nearby, verify:

```text
Open events Browse
→ focus on Browse title
→ select event row
→ Detail title announced
→ Back returns to same event row in Browse
→ Close returns to map/search control
```
