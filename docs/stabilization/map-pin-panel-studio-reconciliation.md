# Map, Panel, Resident Card, Authentication, and Admin Studio Reconciliation

Issue: #96

## Production entry point

`/map?mode=resident&tab=map&filter=Hotels&query=Hotels+nearby&entityId=launch-dp-pin-e4046742f9`

## Non-regression rules

1. Build from current `main` only.
2. Do not merge stale map, card, auth, workspace, or studio branches wholesale.
3. Preserve the current canonical entity registry and generated inventory.
4. Keep all eligible records discoverable without rendering the entire registry at every zoom.
5. Always retain and open the explicitly selected entity, including generated launch-pin IDs and aliases.
6. Restore the active filter cohort after drawer close, mode change, search clear, or navigation return.
7. Preserve marker coordinates and identities during pan, zoom, filtering, and mode changes.

## Pin identity

- Category controls base glyph and color.
- Search intent controls filter, ranking, and temporary emphasis.
- Perk state is additive.
- Verified inKind membership is additive.
- Restaurant pins remain Dining knife-and-fork pins.
- Hotel pins remain Hotel pins.
- Unknown or unverified inKind status never qualifies a place for the inKind cohort.

## Resident panel

Resident panels use public editorial content and resident actions only. They must not expose internal IDs, analytics, CRM data, campaign planning, partner opportunity scores, admin controls, or private workspace data.

Required resident actions are contextual Save, Directions, Share, valid perk/event/card action, and nearby discovery.

## Partner panel

Partner panels preserve the same canonical identity, media, location, and verified public facts. They may add publishing, campaigns, audiences, analytics, reports, QR, SEO, automation, AI, billing, and workspace actions when authorized.

Every partner action must preserve canonical entity, organization, district, mode, and safe return context.

## Resident Card copy

- RESIDENT CARD
- Your Downtown Card
- Show your card
- Confirm access
- YOUR ACCESS
- WHAT YOUR CARD UNLOCKS
- HAPPENING NEARBY
- BUILDING-SPONSORED ACCESS

Fixed actions:

- Show card
- Add to Wallet
- View perks
- Explore events

No `profile-*` identifier may be rendered on resident-facing surfaces.

## Admin Marketing Studio

Implement one authenticated Studio shell with Command Center, Campaigns, Approvals, Distribution, and Performance as primary sections. Distribution must use grouped channel configuration, canonical persisted distribution jobs, controlled state transitions, audit history, server-side permissions, validation, preview, test, schedule, publish, pause, retry, reporting, QR, map placement, and partner-workspace synchronization.

No visible control may be decorative or disconnected. Production UI must not expose architecture notes, database fields, or implementation inventories.

## Validation sequence

1. Generate and compare the canonical pin inventory.
2. Verify the exact hotel deep link resolves and opens the selected entity.
3. Verify all hotel pins remain discoverable and the active viewport cohort restores correctly.
4. Verify every category and search intent can be cleared and reopened without lost markers.
5. Verify resident and partner panel separation for representative hotel, restaurant, property, civic, event, perk, brand, service, and listing entities.
6. Verify restaurant/inKind taxonomy.
7. Verify Resident Card copy, layout, QR behavior, and no visible internal ID.
8. Verify map-to-workspace-to-map context preservation.
9. Verify resident, partner, admin, platform-admin, and super-admin authentication with safe return routing.
10. Verify Studio create, validate, preview, test, schedule, publish, pause, retry, and report operations.
11. Run focused contracts, typecheck, Playwright desktop/mobile, production build, Vercel preview, and runtime-error review.

## Promotion boundary

Do not merge or promote until the preview proves no regression to current civic, resident, restaurant/inKind, drawer footer, workspace, analytics, authentication, resident saved transactions, and production-domain corrections.
