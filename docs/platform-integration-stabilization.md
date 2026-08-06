# Downtown Perks platform integration stabilization

## Decision

Treat `MegDude/BASE44` and the Cloudflare project `base-44-downtown-perks-live` as the only production application path. Older repositories and deployments are reference material only. New fixes must land on `main`, pass the integration gate, and deploy through the connected production project.

## Current production contract

- Canonical repository: `MegDude/BASE44`
- Canonical branch: `main`
- Canonical Cloudflare project: `base-44-downtown-perks-live`
- Canonical production alias: `app.downtownperks.com`
- Primary surfaces: resident map, partner map, resident account, partner access, partner workspace, reports, campaigns, pricing and admin
- Authentication: Supabase in production, with Base44 compatibility retained for legacy token hydration
- Owner access: allowlisted super-admin account must retain cross-organization workspace access

## Findings

### P0 — production blockers

1. The action footer was rendered inside competing scroll and sticky systems. A final regression lock now assigns the footer to the drawer's third grid row and keeps only the content viewport scrollable.
2. Authentication has working magic-link and resident password methods, but partner password sign-in and safe `returnTo` routing remain incomplete on current `main`.
3. Several open pull requests are heavily behind `main` and cannot be merged safely without targeted reconciliation. Do not merge stale branches wholesale.
4. Production is connected to GitHub and deploys from `main`, but every production commit needs a shared integration gate rather than relying on isolated visual tests.

### P1 — integration gaps

1. Multiple drawer and surface generations remain imported. They should be reduced to one geometry layer, one surface layer and one entity-content layer.
2. Resident and partner content are still mixed in some building panels. Partner tools must be hidden in resident mode and grouped into one operating section in partner mode.
3. Property content quality varies. Listings need verified addresses, imagery, nearby entities, routes, amenities and source status.
4. Campaign, QR, offer, event and report modules exist, but do not all use one canonical entity identifier and lifecycle.
5. Workspace organization switching is present for super admins, but tenant-scoped authorization must be enforced server-side for every protected API.

### P2 — consolidation work

1. Reduce overlapping CSS files and remove superseded `*-final.css` layers after visual parity is confirmed.
2. Close or rebase stale pull requests after extracting any still-needed changes.
3. Standardize empty, loading, permission-denied and error states across every workspace module.
4. Add route-level production smoke tests for resident, partner, admin and authentication journeys.
5. Create a verified content registry for every launch building and destination.

## Execution sequence

1. Protect production invariants with `scripts/test-platform-integration-gate.mjs`.
2. Reconcile partner password sign-in and safe return routing from PR 77 into current `main` as a small targeted patch.
3. Add server-side organization authorization tests for workspace APIs.
4. Consolidate the drawer stack without changing entity behavior.
5. Split resident presentation from partner operations in property panels.
6. Run content verification across all launch buildings.
7. Retire stale branches and duplicate Cloudflare projects only after production parity is proven.

## Required release checks

- `npm run test:platform-integration`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- mobile verification at 320, 375, 393 and 430 pixels
- desktop verification at 768 and 1440 pixels
- partner magic-link test
- resident password and magic-link tests
- super-admin organization-switch test
- resident and partner map entity-open tests
- fixed drawer action-footer test
- production alias health check

## Definition of integrated

The build is integrated when one repository, one production project, one authentication boundary, one entity model, one drawer system and one analytics lifecycle serve all resident, partner and admin surfaces without duplicated navigation, conflicting styling or unsupported placeholder content.
