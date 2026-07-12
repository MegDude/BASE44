# Resident mobile tabs

Canonical navigation is **Home, Map, Perks, Events, Card**. Saved content lives inside Home and Map rather than competing for a sixth primary destination.

All tabs use the shared mobile drawer contract: a sticky 56–64px header, independently scrollable content, optional sticky actions, safe-area padding, and collapsed/medium/expanded/full/dismissed states. Resident surfaces may describe value, proximity, eligibility, timing, redemption, and next actions. They must not contain audience, campaign, attribution, or performance language.

The canonical section order, purpose, empty-state action, route, and analytics event for each tab are defined in `src/components/map/mobileTabRegistry.ts`. Entity drawers retain the existing verified entity data and media resolver; a tab switch must never substitute generic content for missing data.

Card access exposes only the minimum resident identity needed for verification. QR rendering remains gated by the existing resident-access record and supported API contract.
