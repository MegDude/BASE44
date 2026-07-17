# BASE44 migration classification — 2026-07-17

Source: `/Users/megdude/Downloads/BASE44 2`
Target: `/Users/megdude/Downloads/BASE44 RECONCILIATION`
Baseline HEAD: `4d6f759aefc7e53368700bfbff52a1bfdb8b61b8`

This replaces the 2026-07-16 provisional inventory. Every currently changed or untracked path is assigned an explicit migration decision. Decisions authorize review scope, not wholesale copying.

## Totals

- Paths classified: **275**
- Tracked changes: **87**
- Untracked files: **188**
- Unknown decisions: **0**

## Decisions

| Decision | Count |
| --- | ---: |
| ARCHITECTURE_REVIEW | 14 |
| CONTRACT_ONLY | 6 |
| COPY_DOC_AFTER_REVIEW | 39 |
| COPY_NOW | 1 |
| EXCLUDE_ARCHIVE | 8 |
| KEEP_EVIDENCE | 1 |
| MANUAL_REVIEW | 36 |
| PORT_LATER_PARTNER | 23 |
| PORT_LATER_RESIDENT | 46 |
| PORT_LATER_SHARED | 12 |
| PORT_NOW | 1 |
| PORT_PARTIAL_EVENTS | 28 |
| REVIEW_CONFIG | 2 |
| REVIEW_DATA | 9 |
| REVIEW_TEST | 2 |
| STYLE_REVIEW | 4 |
| VERIFY_MEDIA | 43 |

## Domains

| Domain | Count |
| --- | ---: |
| API contract | 6 |
| Configuration | 2 |
| Data | 10 |
| Documentation | 44 |
| Media | 43 |
| Partner | 22 |
| Resident account | 46 |
| Resident map | 55 |
| Shared application | 38 |
| Styles | 3 |
| Tests and tooling | 6 |

## First-slice rule

Only `PORT_NOW`, `COPY_NOW`, and the event-specific hunks inside `PORT_PARTIAL_EVENTS` may enter the first Events Nearby slice. API implementation, broad style locks, the alternate native-map shell, partner work, unrelated resident work, and unverified media stay out.

## File-by-file classification

| File | Source state | Domain | Decision | Rationale |
| --- | --- | --- | --- | --- |
| `api/events.js` | modified | API contract | **CONTRACT_ONLY** | BASE44 may consume the API contract but must not migrate backend persistence or orchestration. |
| `api/map-actions.js` | modified | API contract | **CONTRACT_ONLY** | BASE44 may consume the API contract but must not migrate backend persistence or orchestration. |
| `api/perks/[id]/redemption-token.js` | untracked | API contract | **CONTRACT_ONLY** | BASE44 may consume the API contract but must not migrate backend persistence or orchestration. |
| `api/resident-access.js` | modified | API contract | **CONTRACT_ONLY** | BASE44 may consume the API contract but must not migrate backend persistence or orchestration. |
| `api/resident-card/issue.js` | untracked | API contract | **CONTRACT_ONLY** | BASE44 may consume the API contract but must not migrate backend persistence or orchestration. |
| `api/resident-card/verify.js` | untracked | API contract | **CONTRACT_ONLY** | BASE44 may consume the API contract but must not migrate backend persistence or orchestration. |
| `backups/map-panel-design-system/2026-07-16-before-ios15-polish/panel-system-source.tar.gz` | untracked | Resident map | **EXCLUDE_ARCHIVE** | Reference or backup material must not enter the production bundle. |
| `backups/map-panel-design-system/2026-07-16-before-ios15-polish/README.md` | untracked | Resident map | **EXCLUDE_ARCHIVE** | Reference or backup material must not enter the production bundle. |
| `backups/map-panel-design-system/2026-07-16-before-ios15-polish/worktree-before-ios15-polish.patch` | untracked | Resident map | **EXCLUDE_ARCHIVE** | Reference or backup material must not enter the production bundle. |
| `backups/route-panel-polish/2026-07-16-before-sharp-scroll/CollectionRoutePanel.jsx` | untracked | Resident map | **EXCLUDE_ARCHIVE** | Reference or backup material must not enter the production bundle. |
| `backups/route-panel-polish/2026-07-16-before-sharp-scroll/route-collection-product-final.css` | untracked | Resident map | **EXCLUDE_ARCHIVE** | Reference or backup material must not enter the production bundle. |
| `docs/archive/resident-map-v1/App-route-state-after-cutover.jsx` | untracked | Documentation | **EXCLUDE_ARCHIVE** | Reference or backup material must not enter the production bundle. |
| `docs/archive/resident-map-v1/Map.jsx` | untracked | Documentation | **EXCLUDE_ARCHIVE** | Reference or backup material must not enter the production bundle. |
| `docs/archive/resident-map-v1/README.md` | untracked | Documentation | **EXCLUDE_ARCHIVE** | Reference or backup material must not enter the production bundle. |
| `docs/auth/first-party-map-auth.md` | modified | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/build-comparison-current-vs-deployed-2026-07-16.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/canonical-motion-component-instruction.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/current-base44-map-audit.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/current-partner-experience-audit.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/deployment-ownership.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/events-nearby-data-diagnosis.md` | untracked | Documentation | **COPY_NOW** | Evidence for the first Events Nearby vertical slice. |
| `docs/google-map-deployment-config.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/map-panel-design-system.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/migration/local-worktree-baseline.txt` | untracked | Documentation | **KEEP_EVIDENCE** | Migration evidence belongs on the reconciliation branch, not in runtime code. |
| `docs/mobile-bottom-tabs/qa-report.md` | modified | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/mobile-panel-accessibility-results.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/mobile-panel-performance-results.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/mobile-panel-regression-matrix.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/mobile-panel-visual-regression.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/mobile-sheet-architecture.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/native-map-regression-audit-template.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/panel-content-inventory.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/panel-drawer-audit.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/panel-journey-map.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/partner-accessibility-results.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/partner-entitlement-model.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/partner-experience-regression-matrix.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/partner-journey-map.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/partner-map-workspace-contract.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/partner-mobile-navigation-decision.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/partner-native-sheet-architecture.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/partner-performance-results.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/partner-preview-contract.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/partner-release-readiness.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/partner-route-decision.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/partner-status-model.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/platform-motion-os-architecture.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/platform-taxonomy-partner-workspace-audit.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/product-operating-system-specification.md` | modified | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/release-readiness-checklist.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/resident-bottom-navigation-decision.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/resident-dashboard-audit.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/resident-map-v1-freeze.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/resident-route-decision.md` | untracked | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `docs/route-map-5173.md` | modified | Documentation | **COPY_DOC_AFTER_REVIEW** | Keep useful decisions and QA evidence after checking for drift or duplication. |
| `package.json` | modified | Configuration | **REVIEW_CONFIG** | Merge dependency or build changes individually; do not replace configuration wholesale. |
| `public/fonts/canela/Canela-Regular-Trial.otf` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/hotels-nearby/hotel-van-zandt-lounge.webp` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/hotels-nearby/hvz-how-suite-it-is.jpg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/hotels-nearby/hvz-stay-in-the-groove.webp` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/hotels-nearby/hvz-texas-resident-rate.jpg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/hotels-nearby/hvz-texas-sized-savings.jpg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/hotels-nearby/watr-rooftop.webp` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/refresh/brands/equinox-austin.jpeg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/refresh/brands/fine-eyewear-sport.jpg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/refresh/brands/fine-eyewear-store.webp` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/refresh/brands/heritage-boots.jpg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/refresh/brands/rivian-drive.jpeg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/refresh/brands/yeti-store.png` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/refresh/civic/daa-art-walk-sculpture.jpeg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/refresh/civic/republic-square-lawn.jpg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/refresh/civic/waller-creek-design-marker.png` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/refresh/civic/waterloo-golden-hour.png` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/refresh/civic/waterloo-greenway-creek.png` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/refresh/civic/waterloo-park.jpeg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/refresh/civic/waterloo-trail.jpeg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/refresh/properties/waterline.jpg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/refresh/venues/bangers-patio.webp` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map-entities/refresh/venues/stay-put-sign.jpg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map/panels/panel-detail/congress-skyline.jpg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map/panels/panel-detail/downtown-south-congress-walk.jpg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map/panels/panel-detail/fairmont-pool.webp` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map/panels/panel-detail/fairmont-room-skyline.webp` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map/panels/panel-detail/happy-hour-table.jpg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map/panels/panel-detail/lady-bird-bike-skyline.jpg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map/panels/panel-detail/lake-wellness-route.jpg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map/panels/panel-detail/rainey-date-night-walk.jpg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map/panels/panel-detail/red-river-cultural-district.png` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map/panels/panel-detail/seaholm-district.jpg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map/panels/panel-detail/second-street-district.jpg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/map/panels/panel-detail/waterline-red-river.avif` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/residential-content/shared-access-700-red-river.jpeg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/residential-content/shared-access-amenity.jpeg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/residential-content/shared-access-cesar-chavez.jpeg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/residential-content/shared-access-community.jpeg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/residential-content/shared-access-downtown-future.jpeg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/residential-content/shared-access-downtown-lake.jpeg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/residential-content/shared-access-jazz.jpeg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `public/images/residential-content/shared-access-waterloo.jpeg` | untracked | Media | **VERIFY_MEDIA** | Require entity match, usage rights, dimensions and manifest assignment before copying. |
| `scripts/import-downtown-perks-google-list.ts` | untracked | Tests and tooling | **REVIEW_TEST** | Retain only tests aligned with the reconciled route architecture. |
| `scripts/test-first-party-auth.ts` | modified | Tests and tooling | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `scripts/test-mobile-tab-system.ts` | modified | Tests and tooling | **PORT_PARTIAL_EVENTS** | Retain only assertions for the shared resident sheet and Events tab lifecycle. |
| `scripts/test-onboarding-local-media.mjs` | untracked | Tests and tooling | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `scripts/test-partner-panel-content.mjs` | untracked | Tests and tooling | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/api/base44Client.js` | modified | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/App.jsx` | modified | Shared application | **PORT_PARTIAL_EVENTS** | Review only first-party resident map and Events route wiring. |
| `src/components/ai-workbench/ai-workbench.css` | untracked | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/components/ai-workbench/AIWorkbench.jsx` | untracked | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/components/ai-workbench/ClarificationPanel.jsx` | untracked | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/components/ai-workbench/ExecutionActions.jsx` | untracked | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/components/ai-workbench/IdeaComposer.jsx` | untracked | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/components/ai-workbench/OutputSection.jsx` | untracked | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/components/ai-workbench/RefinementBar.jsx` | untracked | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/components/ai-workbench/WorkbenchOutput.jsx` | untracked | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/components/ai-workbench/WorkflowSelector.jsx` | untracked | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/components/Layout.jsx` | modified | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/components/map/CollectionRoutePanel.jsx` | modified | Resident map | **PORT_PARTIAL_EVENTS** | Candidate shared Browse/Detail route surface for Events Nearby. |
| `src/components/map/MapDetailDrawer.jsx` | modified | Resident map | **PORT_PARTIAL_EVENTS** | Candidate event detail behavior; do not copy unrelated entity changes. |
| `src/components/map/mobileTabRegistry.ts` | modified | Resident map | **PORT_PARTIAL_EVENTS** | Port only canonical resident tab metadata and Events routing. |
| `src/components/map/mobileTabState.ts` | modified | Resident map | **PORT_PARTIAL_EVENTS** | Port only state preservation needed by the Events sheet. |
| `src/components/map/searchIntentRailConfig.ts` | modified | Resident map | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/components/map/unified/UnifiedFilterChips.jsx` | modified | Resident map | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/components/modals/QRCodeModal.jsx` | modified | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/components/Navbar.jsx` | modified | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/components/navigation/BottomActionBar.tsx` | untracked | Shared application | **PORT_LATER_SHARED** | Shared navigation requires route-wide review after the first slice is stable. |
| `src/components/navigation/context-navigation.css` | untracked | Shared application | **PORT_LATER_SHARED** | Shared navigation requires route-wide review after the first slice is stable. |
| `src/components/navigation/ContextBackAction.tsx` | untracked | Shared application | **PORT_LATER_SHARED** | Shared navigation requires route-wide review after the first slice is stable. |
| `src/components/navigation/ContextHeader.tsx` | untracked | Shared application | **PORT_LATER_SHARED** | Shared navigation requires route-wide review after the first slice is stable. |
| `src/components/navigation/ContextNavigationProvider.tsx` | untracked | Shared application | **PORT_LATER_SHARED** | Shared navigation requires route-wide review after the first slice is stable. |
| `src/components/navigation/ContinueExploring.tsx` | untracked | Shared application | **PORT_LATER_SHARED** | Shared navigation requires route-wide review after the first slice is stable. |
| `src/components/navigation/navigation.types.ts` | untracked | Shared application | **PORT_LATER_SHARED** | Shared navigation requires route-wide review after the first slice is stable. |
| `src/components/navigation/navigation.utils.ts` | untracked | Shared application | **PORT_LATER_SHARED** | Shared navigation requires route-wide review after the first slice is stable. |
| `src/components/navigation/QuickSearchModal.tsx` | modified | Shared application | **PORT_LATER_SHARED** | Shared navigation requires route-wide review after the first slice is stable. |
| `src/components/navigation/SmartBreadcrumbs.tsx` | untracked | Shared application | **PORT_LATER_SHARED** | Shared navigation requires route-wide review after the first slice is stable. |
| `src/components/partner/engage/partner-engage.css` | untracked | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/components/partner/engage/PartnerEngageModule.jsx` | untracked | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/components/partner/PartnerMobileTabBar.tsx` | modified | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/components/resident/dashboard/ActivityFeed/ActivityFeed.tsx` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/dashboard/AIConcierge/AIConcierge.tsx` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/dashboard/Buildings/BuildingSpotlight.tsx` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/dashboard/Community/CommunityUpdate.tsx` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/dashboard/dashboardData.ts` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/dashboard/DashboardGrid/DashboardTile.tsx` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/dashboard/DashboardGrid/TodaysDashboard.tsx` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/dashboard/DashboardPage.tsx` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/dashboard/DashboardSection.tsx` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/dashboard/dashboardStorage.ts` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/dashboard/Events/UpcomingEvents.tsx` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/dashboard/Greeting/DynamicGreeting.tsx` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/dashboard/QuickExplore/QuickExplore.tsx` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/dashboard/Recommendations/Recommendations.tsx` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/dashboard/ResidentCard/CardProfilePanel.tsx` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/dashboard/ResidentCard/ResidentCardModule.tsx` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/dashboard/Routes/WalkingRoutes.tsx` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/dashboard/Saved/SavedModule.tsx` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/ResidentMobileTabBar.tsx` | modified | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/components/resident/tabs/ResidentCardTab.jsx` | modified | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/config/downtownPerksMapSource.ts` | untracked | Resident map | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/config/workspaceArchitecture.ts` | modified | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/content/downtown-perks/downtownPerksPartnerWorkspaceRegistry.ts` | modified | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/content/downtownPerksMapCopy.ts` | untracked | Resident map | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/data/brandActivationIntelligence.js` | modified | Data | **REVIEW_DATA** | Validate canonical IDs, taxonomy and relationships before selective copy. |
| `src/data/downtownPerksCollections.seed.ts` | untracked | Resident map | **REVIEW_DATA** | Validate canonical IDs, taxonomy and relationships before selective copy. |
| `src/data/downtownPerksEntityImages.ts` | modified | Data | **PORT_PARTIAL_EVENTS** | Port only verified media entries used by migrated events. |
| `src/data/events/firstThursdayRainey.js` | untracked | Resident map | **PORT_NOW** | Canonical event record for the first Events Nearby slice. |
| `src/data/hospitalityContentLibrary.js` | modified | Data | **REVIEW_DATA** | Validate canonical IDs, taxonomy and relationships before selective copy. |
| `src/data/imports/attachedMapInventory.js` | modified | Resident map | **PORT_PARTIAL_EVENTS** | Port only verified event entities and relationships. |
| `src/data/legendsGeneratedListings.js` | modified | Data | **REVIEW_DATA** | Validate canonical IDs, taxonomy and relationships before selective copy. |
| `src/data/legendsListings.js` | modified | Data | **REVIEW_DATA** | Validate canonical IDs, taxonomy and relationships before selective copy. |
| `src/data/legendsPropertyContent.js` | modified | Data | **REVIEW_DATA** | Validate canonical IDs, taxonomy and relationships before selective copy. |
| `src/data/legendsPropertyContent.ts` | modified | Data | **REVIEW_DATA** | Validate canonical IDs, taxonomy and relationships before selective copy. |
| `src/data/mapCollections.ts` | modified | Resident map | **PORT_PARTIAL_EVENTS** | Port the canonical events-nearby collection only. |
| `src/data/mapNativeCampaigns.js` | modified | Resident map | **REVIEW_DATA** | Validate canonical IDs, taxonomy and relationships before selective copy. |
| `src/data/media/entityMediaManifest.ts` | modified | Data | **PORT_PARTIAL_EVENTS** | Port only event-specific verified media records. |
| `src/data/production/districtHeroRegistry.ts` | modified | Data | **REVIEW_DATA** | Validate canonical IDs, taxonomy and relationships before selective copy. |
| `src/data/production/index.ts` | modified | Data | **PORT_PARTIAL_EVENTS** | Port only exports required by the migrated event entities. |
| `src/data/residentialMixedUseContentLibrary.js` | modified | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/data/supplementalMapEntities.js` | modified | Resident map | **PORT_PARTIAL_EVENTS** | Port only event entities required by Events Nearby. |
| `src/features/native-map/entity-sheet.adapter.ts` | untracked | Resident map | **ARCHITECTURE_REVIEW** | Potential second shell; reconcile primitives only and do not create a competing drawer engine. |
| `src/features/native-map/EntitySheetRenderer.tsx` | untracked | Resident map | **ARCHITECTURE_REVIEW** | Potential second shell; reconcile primitives only and do not create a competing drawer engine. |
| `src/features/native-map/index.ts` | untracked | Resident map | **ARCHITECTURE_REVIEW** | Potential second shell; reconcile primitives only and do not create a competing drawer engine. |
| `src/features/native-map/map-ui.machine.ts` | untracked | Resident map | **ARCHITECTURE_REVIEW** | Potential second shell; reconcile primitives only and do not create a competing drawer engine. |
| `src/features/native-map/map-ui.store.ts` | untracked | Resident map | **ARCHITECTURE_REVIEW** | Potential second shell; reconcile primitives only and do not create a competing drawer engine. |
| `src/features/native-map/MapBottomNavigation.tsx` | untracked | Resident map | **ARCHITECTURE_REVIEW** | Potential second shell; reconcile primitives only and do not create a competing drawer engine. |
| `src/features/native-map/native-map.css` | untracked | Resident map | **ARCHITECTURE_REVIEW** | Potential second shell; reconcile primitives only and do not create a competing drawer engine. |
| `src/features/native-map/NativeBottomSheet.tsx` | untracked | Resident map | **ARCHITECTURE_REVIEW** | Potential second shell; reconcile primitives only and do not create a competing drawer engine. |
| `src/features/native-map/NativeMapShell.tsx` | untracked | Resident map | **ARCHITECTURE_REVIEW** | Potential second shell; reconcile primitives only and do not create a competing drawer engine. |
| `src/features/native-map/SearchCommandSurface.tsx` | untracked | Resident map | **ARCHITECTURE_REVIEW** | Potential second shell; reconcile primitives only and do not create a competing drawer engine. |
| `src/features/native-map/tokens.ts` | untracked | Resident map | **ARCHITECTURE_REVIEW** | Potential second shell; reconcile primitives only and do not create a competing drawer engine. |
| `src/features/native-map/types.ts` | untracked | Resident map | **ARCHITECTURE_REVIEW** | Potential second shell; reconcile primitives only and do not create a competing drawer engine. |
| `src/features/native-map/useMapViewportInsets.ts` | untracked | Resident map | **ARCHITECTURE_REVIEW** | Potential second shell; reconcile primitives only and do not create a competing drawer engine. |
| `src/hooks/useContextNavigation.ts` | untracked | Shared application | **PORT_LATER_SHARED** | Shared navigation requires route-wide review after the first slice is stable. |
| `src/hooks/useMapEntityData.js` | modified | Resident map | **PORT_PARTIAL_EVENTS** | Review only event normalization and canonical entity sourcing. |
| `src/hooks/useSearchDrivenMapEntities.js` | modified | Resident map | **PORT_PARTIAL_EVENTS** | Review only atomic event filtering behavior. |
| `src/lib/ai-workbench/generateWorkbenchDraft.js` | untracked | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/lib/ai-workbench/workflows.js` | untracked | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/lib/AuthContext.jsx` | modified | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/lib/authReturnPath.ts` | modified | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/lib/engage/engageModel.js` | untracked | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/lib/engage/engageProviderAdapter.js` | untracked | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/lib/googleMapsLoader.ts` | modified | Resident map | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/lib/map/canonicalTaxonomy.ts` | untracked | Resident map | **PORT_PARTIAL_EVENTS** | Port explicit event intent and category tags if required. |
| `src/lib/map/entityImageResolver.ts` | modified | Resident map | **PORT_PARTIAL_EVENTS** | Port only event media-resolution behavior. |
| `src/lib/map/entityPanelArchetypes.js` | modified | Resident map | **PORT_PARTIAL_EVENTS** | Port only the resident event panel archetype. |
| `src/lib/map/entityPinResolver.ts` | modified | Resident map | **PORT_PARTIAL_EVENTS** | Port only event pin classification if absent from main. |
| `src/lib/map/mapIconRegistry.ts` | modified | Resident map | **PORT_PARTIAL_EVENTS** | Port only the unique event icon mapping if absent from main. |
| `src/lib/map/normalizeEntity.ts` | modified | Resident map | **PORT_PARTIAL_EVENTS** | Port only event field normalization required by the collection. |
| `src/lib/map/perkImageRegistry.ts` | modified | Resident map | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/lib/map/rankMapEntities.ts` | modified | Resident map | **PORT_PARTIAL_EVENTS** | Port only deterministic Events Nearby ordering if required. |
| `src/lib/mapEntityAliases.js` | modified | Resident map | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/lib/maps/downtownPerksMarkers.ts` | untracked | Resident map | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/lib/maps/removeMapMarker.ts` | untracked | Resident map | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/lib/mapSystemConstants.js` | modified | Resident map | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/lib/navigation/route-context.ts` | untracked | Shared application | **PORT_LATER_SHARED** | Shared navigation requires route-wide review after the first slice is stable. |
| `src/lib/partner/canonicalPartnerWorkspace.ts` | untracked | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/lib/partner/liveMapOverview.js` | untracked | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/lib/partner/partnerMapContentClient.ts` | untracked | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/lib/partner/partnerPanelContent.js` | untracked | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/lib/residentCard.js` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/lib/supabaseServer.js` | modified | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/lib/useLocations.js` | modified | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/main.jsx` | modified | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/onboarding/onboardingMedia.js` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/onboarding/ResidentOnboardingFlow.jsx` | modified | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/onboarding/state/onboardingPersistence.js` | modified | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/pages/AdminMarketingStudio.jsx` | modified | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/pages/AIWorkbenchPage.jsx` | untracked | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/pages/AuthCallbackPage.jsx` | modified | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/pages/downtown-perks/Events.jsx` | modified | Resident map | **PORT_PARTIAL_EVENTS** | Port only canonical event page relationships and actions. |
| `src/pages/downtown-perks/PerksCard.jsx` | modified | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/pages/Home.jsx` | modified | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/pages/legacyMapStyles.js` | untracked | Resident map | **PORT_PARTIAL_EVENTS** | Import only approved shared sheet and route styles used by the active map. |
| `src/pages/Map.jsx` | modified | Resident map | **PORT_PARTIAL_EVENTS** | Port shared sheet lifecycle and Events Nearby behavior by hunk; never copy the full local file. |
| `src/pages/PartnerLifecycle.jsx` | modified | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/pages/partners/Access.jsx` | modified | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/pages/partners/Brands.jsx` | modified | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/pages/partners/Residential.jsx` | modified | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/pages/PartnerWorkspace.jsx` | modified | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/pages/Pricing.jsx` | modified | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/pages/PublicMapGateway.jsx` | deleted | Resident map | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/pages/ResidentAccess.jsx` | modified | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/pages/ResidentHome.tsx` | modified | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/pages/ResidentMap.jsx` | untracked | Resident account | **ARCHITECTURE_REVIEW** | Potential second shell; reconcile primitives only and do not create a competing drawer engine. |
| `src/pages/ResidentSignIn.jsx` | modified | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/pages/SplashPage.jsx` | modified | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `src/styles/brand-fonts.css` | untracked | Styles | **STYLE_REVIEW** | Do not copy broad style locks without selector-level visual regression. |
| `src/styles/map-action-system-final.css` | untracked | Resident map | **STYLE_REVIEW** | Do not copy broad style locks without selector-level visual regression. |
| `src/styles/map-card-pin-regression-lock-final.css` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/styles/map-detail-panel-product-final.css` | untracked | Resident map | **PORT_PARTIAL_EVENTS** | Review event detail rules; reject global overrides outside the shared sheet. |
| `src/styles/map-native-drawer-authority-final.css` | untracked | Resident account | **PORT_PARTIAL_EVENTS** | Port shared resident close, reopen, snap and safe-area behavior. |
| `src/styles/map-panel-navigation-system-final.css` | untracked | Resident map | **PORT_PARTIAL_EVENTS** | Port the single back/close control pattern after selector review. |
| `src/styles/onboarding-layout-system-final.css` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/styles/partner-lifecycle-headings-final.css` | untracked | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/styles/partner-onboarding-editorial-merge-final.css` | untracked | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/styles/partner-signup-sharp-final.css` | untracked | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/styles/partner-tools-polish-final.css` | modified | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/styles/pricing-lead-polish-final.css` | modified | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/styles/resident-auth-module-final.css` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/styles/resident-card-polish-final.css` | modified | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/styles/resident-dashboard-premium-final.css` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/styles/resident-home-light-editorial-final.css` | modified | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/styles/resident-onboarding-design-lock.css` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/styles/resident-onboarding-final.css` | modified | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/styles/resident-onboarding-premium-sweep-final.css` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/styles/resident-onboarding-typography-final.css` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/styles/resident-onboarding-unified-final.css` | untracked | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/styles/resident-product-alignment-final.css` | modified | Resident account | **PORT_LATER_RESIDENT** | Resident work outside the Events slice; migrate in its governed phase. |
| `src/styles/route-collection-product-final.css` | untracked | Resident map | **PORT_PARTIAL_EVENTS** | Port only Events Nearby route and collection presentation. |
| `src/styles/search-console-audience-lock-final.css` | untracked | Styles | **STYLE_REVIEW** | Do not copy broad style locks without selector-level visual regression. |
| `src/styles/top-navigation-consistency-lock.css` | untracked | Styles | **STYLE_REVIEW** | Do not copy broad style locks without selector-level visual regression. |
| `src/styles/workspace-overview-operating-final.css` | modified | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/styles/workspace-profile-editor.css` | modified | Partner | **PORT_LATER_PARTNER** | Outside the first resident Events slice; review in the partner migration phase. |
| `src/types/downtownPerksImportedPlace.ts` | untracked | Shared application | **MANUAL_REVIEW** | No automatic copy; inspect the exact diff and destination ownership first. |
| `tests/e2e/native-map-foundation.spec.ts` | untracked | Tests and tooling | **REVIEW_TEST** | Retain only tests aligned with the reconciled route architecture. |
| `vite.config.js` | modified | Configuration | **REVIEW_CONFIG** | Merge dependency or build changes individually; do not replace configuration wholesale. |
