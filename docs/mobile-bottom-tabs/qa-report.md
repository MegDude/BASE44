# Mobile bottom-tab QA

## Implemented checks

- Canonical resident and partner tab labels are separated by mode.
- Bottom navigation uses `tablist`, `tab`, `aria-selected`, and `aria-pressed` semantics.
- Touch selection uses one click path, preventing pointer/click double toggles.
- The shared visual contract uses `100dvh`, safe-area insets, 44–56px targets, Inter, white surfaces, navy text, and the gold accent.
- Drawer states and per-tab scroll persistence have pure state tests.
- Empty states are tab-specific and include a useful action.
- Partner Workspace remains protected by the existing auth contract.
- `/map`, `/app/map`, `/sign-in`, and `/auth/callback` are first-party routes in the same application; no iframe exists in BASE44.
- Auth return paths reject absolute and protocol-relative destinations.
- Search-intent transitions clear selected entities, scoped results, perks, events, routes, collections, listings, and campaigns.

## Required browser matrix before deployment

- 390×844, 393×852, 430×932, 768×1024, 1024×768, 1440×900.
- Resident: Home, Map, Perks, Events, Card, selected venue/hotel/property/event/perk/route.
- Partner: Overview, Map, Campaigns, Audience, Workspace, selected property/hotel/campaign/event/perk.
- Signed out, signed in, loading, empty, API failure, and expired session.

Deployment remains intentionally blocked until the automated build and representative mobile browser checks complete.
