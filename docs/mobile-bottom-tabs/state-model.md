# Mobile tab state model

`MobileTabState` is the shared contract for both audience modes. It owns mode, active tab, drawer snap state, selected entity/subview, per-mode tab scroll positions, filters, primary search intent, and the last explicit dismissal.

Rules:

- A mode switch clears incompatible entity, subview, and intent state.
- A tab switch preserves filters and stored scroll positions.
- Drawer state is one of collapsed, medium, expanded, full, or dismissed.
- Full screen is the only modal state and therefore the only state that should trap focus.
- URL state remains authoritative for deep links and browser history.
- Search intent is single-select. Every transition clears old scoped results and incompatible entity/perk/event/route/collection state before committing the next result set.
- A closed drawer never reopens the Search Intent Console.

The pure state helpers live in `src/components/map/mobileTabState.ts`; they are tested independently from rendering.
