# Downtown Perks platform-system governance audit

## Attachment-by-attachment review

1. **Unified Product-System Refactor** — Accepted as the platform direction for BASE44 only. Marketing remains untouched. The platform must move through incremental PRs because a single all-routes rewrite would risk regressions.
2. **Two Builds, One Downtown Perks Product** — Accepted as the release model. Marketing and platform remain separate deployments, connected by shared tokens, handoff params, and preview-first gates.
3. **Unify Marketing-to-Platform Experience** — Accepted as the authenticated-surface standard. The platform token layer and shared primitives govern resident, partner, workspace, and admin flows.
4. **Repeated Unified Product-System Refactor** — Same directive as item 1; tracked in the same contract to avoid duplicate implementation paths.

## Current canonical pieces

- Token layer: `src/styles/platform-tokens.css`
- Platform shell: `src/components/platform/PlatformShell.jsx`
- Safe return/handoff helper: `src/lib/authReturnPath.ts`
- Partner/admin scope helpers: `src/lib/partnerWorkspaceContext.ts`, `src/lib/admin/adminScopeClient.ts`, `api/admin/scope.js`
- Drawer primitive: `src/components/map/NativeDrawerShell.jsx`
- Detail primitive: `src/components/map/CanonicalDetailPanel.jsx`
- Saved path: `src/features/resident/saved/savedStore.ts`
- Analytics path: `src/lib/analytics/track.ts`, `src/lib/platformEvents.js`

## Classification

- **Canonical now**: `platform-tokens.css`, `PlatformShell`, `NativeDrawerShell`, `CanonicalDetailPanel`, safe auth return path, server admin scope endpoint.
- **Merge-required**: route-specific drawers/actions that still bypass shared primitives; partner registration/config flows; checkout return screens; remaining workspace route permission rendering.
- **Deprecated/hold**: standalone route-specific visual overrides that reintroduce grey/glass/heavy-shadow/pill treatment.
- **Manual cleanup**: stale non-agent/draft PRs and Dependabot PRs should be reviewed separately.

## Next implementation phases

1. Replace route-local controls with platform primitive wrappers.
2. Consolidate resident Home/Card/Profile anatomy onto the authenticated page order.
3. Convert partner registration to the schema-driven persisted flow.
4. Add module/plan-aware workspace route rendering tests.
5. Expand admin negative authorization tests for organization, portfolio, listing, and platform scope.
6. Add cross-project marketing-to-platform E2E once the marketing preview target is available.

## Release gate

This PR only adds the source-controlled governance contract and token extensions. It does not claim platform-wide completion. Production promotion should wait for downstream route-by-route PRs plus iPhone 15, tablet, desktop, accessibility, and authorization evidence.
