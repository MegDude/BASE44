# Platform Integration Final Execution

This branch is the clean continuation of issue #96 after PR #97 accumulated unrelated workspace, parking, and styling changes.

## Source rules

1. Start from current `main`.
2. Extract only validated map identity work from PR #97.
3. Do not merge PR #97, PR #95, or any stale branch wholesale.
4. Keep production unchanged until each bounded phase passes CI and preview QA.

## Execution phases

### A. Map identity and cohort restoration

- Resolve canonical, generated launch-pin, slug, alias, legacy, listing, and OSM identities through one runtime path.
- Preserve the selected entity in the final rendered marker cohort.
- Keep normal mobile and desktop limits for non-selected results.
- Verify the exact hotel deep link.
- Verify the complete canonical inventory and all hotel records remain discoverable.
- Restore the active category after drawer close, search clear, mode changes, and return navigation.

### B. Resident and partner panel separation

- Resident panels expose verified public editorial content and resident actions only.
- Partner panels add authorized campaign, audience, analytics, QR, reporting, SEO, automation, and workspace controls.
- No internal IDs, CRM data, analytics internals, or admin controls may appear in resident mode.

### C. Resident Card

Use the approved hierarchy:

- RESIDENT CARD
- Your Downtown Card
- Show your card
- Confirm access
- YOUR ACCESS
- WHAT YOUR CARD UNLOCKS
- HAPPENING NEARBY
- BUILDING-SPONSORED ACCESS

Prohibit visible `profile-*` identifiers across Card, map drawer, resident account, and resident home surfaces.

### D. Authentication and authorization

- Add partner password sign-in without replacing magic links.
- Validate safe first-party `returnTo` values.
- Preserve resident password, registration, Google, Apple, reset, and logout behavior.
- Enforce organization permissions, tenant isolation, super-admin override, and organization switching server-side.

### E. Workspace and Admin Marketing Studio

- Connect campaigns, offers, events, QR, residents, buildings, analytics, reports, and distribution through one canonical entity lifecycle.
- Require persisted Distribution jobs, permissions, audit history, validation, preview, test, schedule, publish, pause, retry, map placement, QR destinations, partner workspace synchronization, and reporting.
- No decorative or disconnected production controls.

### F. Design and content consolidation

- Consolidate drawer architecture and remove competing geometry/scroll implementations.
- Reduce corrective CSS layering into governed component and token layers.
- Rewrite building content with verified facts, imagery, amenities, nearby places, routes, offers, and events.
- Maintain bright-white, shadow-free, restrained editorial surfaces and iPhone 15 behavior.

## Validation gates

- Focused source contracts
- Typecheck
- Production build
- Playwright desktop and mobile
- Exact deep-link verification
- Resident/partner privacy checks
- Authentication and authorization checks
- Complete CTA, QR, workflow, report, and distribution verification
- Vercel preview runtime review

No merge or production promotion occurs until every applicable gate passes.
