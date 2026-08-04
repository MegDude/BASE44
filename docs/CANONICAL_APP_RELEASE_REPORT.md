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
