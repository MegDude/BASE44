# BASE44 reconciliation change inventory

Date: 2026-07-16

Source evidence: `/Users/megdude/Downloads/BASE44 2`

Clean target: `/Users/megdude/Downloads/BASE44 RECONCILIATION`

This inventory is generated from `docs/migration/local-worktree-baseline.txt`. It is an initial classification, not approval to migrate every file.

## Summary

- Total changed or untracked paths classified: 234
- Tracked modified/deleted paths: 76
- Untracked paths: 158

## Domain counts

| Domain | Count |
| --- | ---: |
| Configuration | 2 |
| Data | 47 |
| Documentation | 71 |
| Partner pricing | 2 |
| Partner registration | 5 |
| Partner workspace bridge | 8 |
| Resident auth | 16 |
| Resident card | 4 |
| Resident home | 20 |
| Resident map | 31 |
| Routes | 3 |
| Shared navigation | 14 |
| Styles | 8 |
| Tests | 3 |

## File inventory

| File | Domain | Change type | Present on main | Local only | Valid | Duplicate | Obsolete | Migration action |
| ---- | ------ | ----------- | --------------: | ---------: | ----: | --------: | -------: | ---------------- |
| api/resident-access.js | Routes | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| package.json | Configuration | modified | yes | no | unknown | unknown | unknown | CONFIG_ONLY |
| scripts/test-first-party-auth.ts | Tests | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/App.jsx | Documentation | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/api/base44Client.js | Documentation | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/Layout.jsx | Shared navigation | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/map/MapDetailDrawer.jsx | Resident map | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/map/mobileTabRegistry.ts | Resident map | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/map/mobileTabState.ts | Resident map | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/map/searchIntentRailConfig.ts | Resident map | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/map/unified/UnifiedFilterChips.jsx | Resident map | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/modals/QRCodeModal.jsx | Resident card | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/navigation/QuickSearchModal.tsx | Shared navigation | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/partner/PartnerMobileTabBar.tsx | Partner workspace bridge | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/ResidentMobileTabBar.tsx | Documentation | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/tabs/ResidentCardTab.jsx | Resident card | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/content/downtown-perks/downtownPerksPartnerWorkspaceRegistry.ts | Partner workspace bridge | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/data/brandActivationIntelligence.js | Data | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/data/downtownPerksEntityImages.ts | Data | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/data/hospitalityContentLibrary.js | Data | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/data/imports/attachedMapInventory.js | Data | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/data/legendsGeneratedListings.js | Data | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/data/legendsListings.js | Data | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/data/legendsPropertyContent.js | Data | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/data/legendsPropertyContent.ts | Data | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/data/mapCollections.ts | Data | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/data/mapNativeCampaigns.js | Data | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/data/media/entityMediaManifest.ts | Data | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/data/production/districtHeroRegistry.ts | Data | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/data/production/index.ts | Data | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/data/residentialMixedUseContentLibrary.js | Data | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/data/supplementalMapEntities.js | Data | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/hooks/useMapEntityData.js | Documentation | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/hooks/useSearchDrivenMapEntities.js | Documentation | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/lib/AuthContext.jsx | Resident auth | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/lib/authReturnPath.ts | Resident auth | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/lib/googleMapsLoader.ts | Resident map | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/lib/map/entityImageResolver.ts | Resident map | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/lib/map/entityPanelArchetypes.js | Resident map | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/lib/map/entityPinResolver.ts | Resident map | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/lib/map/mapIconRegistry.ts | Resident map | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/lib/map/normalizeEntity.ts | Resident map | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/lib/map/perkImageRegistry.ts | Resident map | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/lib/map/rankMapEntities.ts | Resident map | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/lib/mapEntityAliases.js | Documentation | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/lib/mapSystemConstants.js | Documentation | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/lib/supabaseServer.js | Documentation | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/lib/useLocations.js | Data | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/main.jsx | Documentation | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/onboarding/ResidentOnboardingFlow.jsx | Resident auth | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/onboarding/state/onboardingPersistence.js | Resident auth | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/pages/AdminMarketingStudio.jsx | Documentation | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/pages/AuthCallbackPage.jsx | Resident auth | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/pages/Home.jsx | Documentation | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/pages/Map.jsx | Resident map | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/pages/PartnerLifecycle.jsx | Partner registration | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/pages/PartnerWorkspace.jsx | Partner workspace bridge | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/pages/Pricing.jsx | Partner pricing | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/pages/PublicMapGateway.jsx | Documentation | deleted | yes | no | unknown | unknown | possibly | DELETE_DUPLICATE |
| src/pages/ResidentAccess.jsx | Resident auth | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/pages/ResidentHome.tsx | Resident home | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/pages/ResidentSignIn.jsx | Resident auth | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/pages/SplashPage.jsx | Documentation | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/pages/downtown-perks/Events.jsx | Documentation | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/pages/downtown-perks/PerksCard.jsx | Documentation | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/pages/partners/Access.jsx | Partner registration | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/pages/partners/Brands.jsx | Partner registration | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/pages/partners/Residential.jsx | Partner registration | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/partner-tools-polish-final.css | Styles | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/pricing-lead-polish-final.css | Partner pricing | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/resident-card-polish-final.css | Resident card | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/resident-home-light-editorial-final.css | Resident home | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/resident-onboarding-final.css | Resident auth | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/resident-product-alignment-final.css | Styles | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/workspace-overview-operating-final.css | Partner workspace bridge | modified | yes | no | unknown | unknown | unknown | PORT_PARTIAL |
| vite.config.js | Configuration | modified | yes | no | unknown | unknown | unknown | CONFIG_ONLY |
| api/resident-card/issue.js | Routes | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| api/resident-card/verify.js | Routes | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| docs/archive/resident-map-v1/App-route-state-after-cutover.jsx | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| docs/archive/resident-map-v1/Map.jsx | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| docs/archive/resident-map-v1/README.md | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| docs/build-comparison-current-vs-deployed-2026-07-16.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/canonical-motion-component-instruction.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/current-base44-map-audit.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/current-partner-experience-audit.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/deployment-ownership.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/events-nearby-data-diagnosis.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/google-map-deployment-config.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/migration/local-worktree-baseline.txt | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| docs/mobile-panel-accessibility-results.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/mobile-panel-performance-results.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/mobile-panel-regression-matrix.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/mobile-panel-visual-regression.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/mobile-sheet-architecture.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/native-map-regression-audit-template.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/panel-content-inventory.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/panel-drawer-audit.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/panel-journey-map.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/partner-accessibility-results.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/partner-entitlement-model.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/partner-experience-regression-matrix.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/partner-journey-map.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/partner-map-workspace-contract.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/partner-mobile-navigation-decision.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/partner-native-sheet-architecture.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/partner-performance-results.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/partner-preview-contract.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/partner-release-readiness.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/partner-route-decision.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/partner-status-model.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/platform-motion-os-architecture.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/platform-taxonomy-partner-workspace-audit.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/release-readiness-checklist.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/resident-bottom-navigation-decision.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/resident-dashboard-audit.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/resident-map-v1-freeze.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| docs/resident-route-decision.md | Documentation | untracked | no | yes | unknown | unknown | unknown | COPY_LOCAL |
| public/fonts/canela/Canela-Regular-Trial.otf | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/map-entities/hotels-nearby/hotel-van-zandt-lounge.webp | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/map-entities/hotels-nearby/hvz-how-suite-it-is.jpg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/map-entities/hotels-nearby/hvz-stay-in-the-groove.webp | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/map-entities/hotels-nearby/hvz-texas-resident-rate.jpg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/map-entities/hotels-nearby/hvz-texas-sized-savings.jpg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/map-entities/hotels-nearby/watr-rooftop.webp | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/map/panels/panel-detail/congress-skyline.jpg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/map/panels/panel-detail/downtown-south-congress-walk.jpg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/map/panels/panel-detail/fairmont-pool.webp | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/map/panels/panel-detail/fairmont-room-skyline.webp | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/map/panels/panel-detail/happy-hour-table.jpg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/map/panels/panel-detail/lady-bird-bike-skyline.jpg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/map/panels/panel-detail/lake-wellness-route.jpg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/map/panels/panel-detail/rainey-date-night-walk.jpg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/map/panels/panel-detail/red-river-cultural-district.png | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/map/panels/panel-detail/seaholm-district.jpg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/map/panels/panel-detail/second-street-district.jpg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/map/panels/panel-detail/waterline-red-river.avif | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/residential-content/shared-access-700-red-river.jpeg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/residential-content/shared-access-amenity.jpeg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/residential-content/shared-access-cesar-chavez.jpeg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/residential-content/shared-access-community.jpeg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/residential-content/shared-access-downtown-future.jpeg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/residential-content/shared-access-downtown-lake.jpeg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/residential-content/shared-access-jazz.jpeg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| public/images/residential-content/shared-access-waterloo.jpeg | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| scripts/import-downtown-perks-google-list.ts | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| scripts/test-onboarding-local-media.mjs | Tests | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/ai-workbench/AIWorkbench.jsx | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/ai-workbench/ClarificationPanel.jsx | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/ai-workbench/ExecutionActions.jsx | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/ai-workbench/IdeaComposer.jsx | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/ai-workbench/OutputSection.jsx | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/ai-workbench/RefinementBar.jsx | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/ai-workbench/WorkbenchOutput.jsx | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/ai-workbench/WorkflowSelector.jsx | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/ai-workbench/ai-workbench.css | Styles | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/navigation/BottomActionBar.tsx | Shared navigation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/navigation/ContextBackAction.tsx | Shared navigation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/navigation/ContextHeader.tsx | Shared navigation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/navigation/ContextNavigationProvider.tsx | Shared navigation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/navigation/ContinueExploring.tsx | Shared navigation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/navigation/SmartBreadcrumbs.tsx | Shared navigation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/navigation/context-navigation.css | Shared navigation | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/navigation/navigation.types.ts | Shared navigation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/navigation/navigation.utils.ts | Shared navigation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/partner/engage/PartnerEngageModule.jsx | Partner workspace bridge | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/components/partner/engage/partner-engage.css | Partner workspace bridge | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/dashboard/AIConcierge/AIConcierge.tsx | Resident home | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/dashboard/ActivityFeed/ActivityFeed.tsx | Resident home | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/dashboard/Buildings/BuildingSpotlight.tsx | Resident home | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/dashboard/Community/CommunityUpdate.tsx | Resident home | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/dashboard/DashboardGrid/DashboardTile.tsx | Resident home | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/dashboard/DashboardGrid/TodaysDashboard.tsx | Resident home | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/dashboard/DashboardPage.tsx | Resident home | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/dashboard/DashboardSection.tsx | Resident home | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/dashboard/Events/UpcomingEvents.tsx | Resident home | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/dashboard/Greeting/DynamicGreeting.tsx | Resident home | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/dashboard/QuickExplore/QuickExplore.tsx | Resident home | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/dashboard/Recommendations/Recommendations.tsx | Resident home | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/dashboard/ResidentCard/CardProfilePanel.tsx | Resident home | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/dashboard/ResidentCard/ResidentCardModule.tsx | Resident home | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/dashboard/Routes/WalkingRoutes.tsx | Resident home | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/dashboard/Saved/SavedModule.tsx | Resident home | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/dashboard/dashboardData.ts | Resident home | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/components/resident/dashboard/dashboardStorage.ts | Resident home | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/config/downtownPerksMapSource.ts | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/content/downtownPerksMapCopy.ts | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/data/downtownPerksCollections.seed.ts | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/data/events/firstThursdayRainey.js | Data | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/features/native-map/EntitySheetRenderer.tsx | Resident map | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/features/native-map/MapBottomNavigation.tsx | Resident map | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/features/native-map/NativeBottomSheet.tsx | Resident map | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/features/native-map/NativeMapShell.tsx | Resident map | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/features/native-map/SearchCommandSurface.tsx | Resident map | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/features/native-map/entity-sheet.adapter.ts | Resident map | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/features/native-map/index.ts | Resident map | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/features/native-map/map-ui.machine.ts | Resident map | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/features/native-map/map-ui.store.ts | Resident map | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/features/native-map/native-map.css | Resident map | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/features/native-map/tokens.ts | Resident map | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/features/native-map/types.ts | Resident map | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/features/native-map/useMapViewportInsets.ts | Resident map | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/hooks/useContextNavigation.ts | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/lib/ai-workbench/generateWorkbenchDraft.js | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/lib/ai-workbench/workflows.js | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/lib/engage/engageModel.js | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/lib/engage/engageProviderAdapter.js | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/lib/map/canonicalTaxonomy.ts | Resident map | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/lib/maps/downtownPerksMarkers.ts | Resident map | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/lib/maps/removeMapMarker.ts | Resident map | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/lib/navigation/route-context.ts | Shared navigation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/lib/partner/canonicalPartnerWorkspace.ts | Partner workspace bridge | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/lib/partner/liveMapOverview.js | Partner workspace bridge | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/lib/residentCard.js | Resident card | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/onboarding/onboardingMedia.js | Resident auth | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/pages/AIWorkbenchPage.jsx | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/pages/ResidentMap.jsx | Resident map | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/pages/legacyMapStyles.js | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| src/styles/brand-fonts.css | Styles | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/map-card-pin-regression-lock-final.css | Styles | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/map-native-drawer-authority-final.css | Resident auth | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/map-panel-navigation-system-final.css | Shared navigation | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/onboarding-layout-system-final.css | Resident auth | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/partner-lifecycle-headings-final.css | Styles | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/partner-signup-sharp-final.css | Partner registration | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/resident-auth-module-final.css | Resident auth | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/resident-dashboard-premium-final.css | Styles | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/resident-onboarding-design-lock.css | Resident auth | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/resident-onboarding-premium-sweep-final.css | Resident auth | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/resident-onboarding-typography-final.css | Resident auth | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/resident-onboarding-unified-final.css | Resident auth | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/search-console-audience-lock-final.css | Styles | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/styles/top-navigation-consistency-lock.css | Shared navigation | untracked | no | yes | unknown | unknown | unknown | PORT_PARTIAL |
| src/types/downtownPerksImportedPlace.ts | Documentation | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |
| tests/e2e/native-map-foundation.spec.ts | Tests | untracked | no | yes | unknown | unknown | unknown | NEEDS_DECISION |

## Required next step

Before migration, replace `unknown` classifications with a reviewed decision and port only the minimum coherent behavior into the reconciliation branch.
