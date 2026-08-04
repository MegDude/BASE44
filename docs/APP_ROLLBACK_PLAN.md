# App rollback plan

No rollback action is applied by this PR.

1. Before cutover, record the current `app.downtownperks.com` DNS target, proxy state, TTL, Worker version, Backend Platform release, Supabase callback list, and Maps referrer list.
2. Keep the previous app host serving and healthy throughout the staging and production smoke window.
3. On a frontend regression, Cloudflare Dashboard -> Workers & Pages -> Versions & Deployments: restore the last known-good Worker version. Expected: prior assets and routing return. Verify `/map`, a deep-linked entity, and `/auth/callback`.
4. On an API regression, restore the previous `BACKEND_ORIGIN` value or Backend Platform release. Expected: `/api/unknown` returns JSON 404 and authenticated endpoints preserve 401/403 rather than fabricated success.
5. On a domain regression, Cloudflare Dashboard -> DNS or Worker Custom Domains: restore the recorded prior target and proxy state. Verify DNS propagation, TLS, and direct routes.
6. Remove only the callback/referrer entries added for the failed release after traffic is restored.

Rollback owner must capture timestamps, affected routes, Worker version, backend version, and verification evidence. Never rotate or delete production secrets as a routine rollback step.
