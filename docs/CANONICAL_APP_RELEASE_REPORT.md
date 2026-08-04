# Canonical app release report

## Status

**Draft readiness: automated app-shell gates pass; production cutover is not release-ready.**

PR #223 remains a bounded BASE44 app migration with no marketing changes, deployment, DNS changes, custom-domain changes, or production-secret changes.

## Implemented

- Worker serves `dist`, supports SPA direct loads, and intercepts `/api` Worker-first.
- Fixed-origin backend proxy preserves query, method, streaming body, bearer auth, necessary cookies, and accurate backend errors without fabricated success.
- Credentialed CORS is exact-origin allowlisted; unknown origins fail explicitly.
- Same-backend redirects are rewritten safely; external redirect locations are not forwarded.
- WebSocket upgrades fail explicitly pending a dedicated backend transport.
- Resident `tab=pass`, workspace audience/connections, role routing, safe `returnTo`, map deep-link stability, Legends identity, viewport containment, and admin empty-scope behavior have focused contract coverage.
- Runtime excludes two archival PDFs over Cloudflare's per-asset limit while retaining their optimized application images.

## Automated results

`npm ci`, typecheck, lint, app-shell/route/auth/super-admin/Legends/viewport/drawer/workspace tests, `test:map-marker-stability`, `test:waterloo-native-sheet`, `npm run build`, Wrangler dry-run, and local Worker smoke passed. Installed-browser QA also passed the public app smoke routes plus representative map containment and marker-stability checks at iPhone 15, tablet landscape, and desktop dimensions.

## Manual blockers

| Blocker | Dashboard/page | Field | Expected value | Verification | Rollback |
| --- | --- | --- | --- | --- | --- |
| Backend staging origin | Cloudflare Workers & Pages -> staging Worker -> Variables | `BACKEND_ORIGIN` | Exact HTTPS staging Platform API origin | JSON 404 for unknown API; visible 502 on outage | Remove/restore variable |
| Credentialed origins | Same page | `APP_ORIGINS` | Exact staging app origin, later exact production origin | Allowed preflight 204; attacker origin 403 | Restore prior list |
| Auth callbacks | Supabase -> Authentication -> URL Configuration | Redirect URLs | Exact staging/production `/auth/callback` URLs | Resident, partner, expired-session, missing-membership flows | Remove added URLs |
| Maps browser key | Google Cloud -> APIs & Services -> Credentials | HTTP referrers | Exact staging/production hosts | Map loads without referrer rejection | Remove added referrer |
| Live role and scope QA | Staging identity/data administration | Dedicated resident, partner, restricted-admin, super-admin fixtures | Active profiles with explicit memberships and no production data mutation | Verify server-authorized 401/403/scope, no local sample fallback | Disable/delete fixtures |
| Data reconciliation | Supabase and Backend Platform staging | Tables, RLS, storage objects, endpoint parity | Counts and sampled records match approved baseline | Resident/partner/admin isolation and backend contracts pass | Keep old host; do not cut DNS |
| Responsive QA | Cloudflare staging preview | 393x852, 768x1024, 1440x900 | No overflow; stable map/entity/drawer routes | Installed-browser screenshots and interaction checks | Roll back Worker version |

Authenticated browser cases remain blocked until dedicated staging credentials exist. Credentials must not be fabricated or copied from production.

## Comprehensive reconciliation

| Requested area | Disposition |
| --- | --- |
| Full env and Worker binding matrix | Implemented in `APP_BACKEND_DEPENDENCY_MATRIX.md`; backend-only `process.env` names are classified by boundary rather than copied into the app Worker. |
| Proxy CORS, allowlist, open-proxy, redirect, streaming, WebSocket analysis | Implemented in Worker code, app-shell tests, and dependency matrix. WebSockets are deliberately unsupported here because they require a separately reviewed Backend Platform transport. |
| Expanded routes and external `returnTo` rejection | Covered for resident pass, audience, connections, callback loops, external/protocol-relative/backslash-host inputs, and role destinations. |
| Restricted admin, expired session, missing membership | Static route/auth contracts are covered; live browser verification is blocked pending dedicated staging identities. |
| Resident Home and `tab=pass` normalization | Canonical routes documented and contract-tested. `tab=card` is treated as a requested compatibility check, not introduced as a competing canonical URL. |
| Map deep links and entity stability | Map marker contract plus installed-browser marker selection passed on mobile and desktop. |
| Legends identity and PII-safe analytics | Listing/parent identity, SEO Snapshot, and strategic privacy contracts cover identity and cross-business analytics privacy. Live source/account authorization remains a staging blocker. |
| Workspace false success, sample data, server scope | Existing protected workspace and admin-scope contracts pass; production mode forces live workspace behavior. A full removal of legacy demo/local workspace implementation is intentionally omitted because it is broader than app-shell migration and requires Backend Platform parity first. Production cutover remains blocked until no local sample fallback is observed with staging accounts. |
| Requested focused tests | `test:map-marker-stability` and `test:waterloo-native-sheet` passed; the Waterloo assertion was updated to match the current accessible Back-label implementation. |
| Browser QA | Public routes passed at representative mobile, tablet, and desktop sizes. Authenticated cases were not run without staging credentials. |
| Five requested docs | Added without replacing broader historical documentation. |
| DNS and rollback | Prepared only; no action applied. |
| Manual instructions | Release blocker table includes dashboard/page, field, expected value, verification, and rollback. |

## Auth and Partner Intelligence product audit

See `APP_AUTH_AND_INTELLIGENCE_ARCHITECTURE.md`. The canonical datastore remains Supabase plus the Backend Platform; Firebase collections do not exist and were not introduced. Public guest browsing and server-authorized resident/partner gates are retained. Complete redemption history and metric-backed Partner Intelligence across opens, saves, RSVPs, scans, visits, lift, and repeat activity remain explicit Backend Platform dependencies, not client-side placeholder work.

The platform integration gate now enforces trusted super-admin session claims rather than requiring the partner sign-in screen to consult a public email allowlist. Email configuration is recovery metadata only and must not grant browser authorization. Cloudflare also preserves the standalone Founding Partner Collection for `/founding-partners` and `/founding-partner-collection` instead of resolving those extensionless routes through the SPA fallback.
