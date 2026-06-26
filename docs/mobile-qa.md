# Mobile QA

## Required Viewports

- 320
- 375
- 390
- 430
- 768

## Required Checks

- map loads.
- search console does not block the map.
- destination drawer opens as scrollable bottom sheet.
- drawer never exceeds usable mobile height.
- bottom actions are not hidden behind nav.
- partner tabs scroll.
- campaign action bars do not float unexpectedly.
- story typography wraps without clipping.
- no horizontal overflow.
- no dead buttons.

## Current Risk

Mobile polish has been handled primarily through CSS locks. It needs automated regression coverage for drawer height, scrollability, search-console sizing, and partner-tab panels.
