# App Cloudflare runbook

## Prepare staging

1. Cloudflare Dashboard -> Workers & Pages -> `downtown-perks-app` staging Worker -> Settings -> Variables and Secrets.
2. Set `BACKEND_ORIGIN` to the exact HTTPS staging Backend Platform origin. Expected: no path to an unrelated service and no user-controlled origin. Verify `/api/unknown` returns the backend JSON 404. Rollback: remove the staging variable.
3. Set `APP_ORIGINS` to the exact staging app origin. Expected: listed-origin OPTIONS returns 204 with credentials; an unlisted origin returns JSON 403. Rollback: restore the prior allowlist.
4. Configure public build variables from `.env.example`; use a browser-restricted Maps key and Supabase publishable key only.
5. Supabase Dashboard -> Authentication -> URL Configuration -> Redirect URLs. Add exact staging and intended production `/auth/callback` URLs. Verify resident and partner callbacks reject external `returnTo`. Rollback: remove newly added redirect URLs.
6. Build with `npm run build`, validate with `wrangler deploy --dry-run`, then deploy only to a non-production staging Worker after explicit approval.

## Prepared DNS sequence (do not apply)

Cloudflare Dashboard -> DNS -> Records: prepare a staging hostname first. Expected: staging resolves only to the reviewed Worker custom domain. Verify TLS, direct SPA routes, API JSON behavior, and rollback before any production hostname is touched.

For production, Cloudflare Dashboard -> Workers & Pages -> Custom Domains: record the current production target and TTL, attach `app.downtownperks.com` only after all release gates pass, then verify DNS, TLS, `/map`, `/auth/callback`, `/api/unknown`, and backend outage behavior. Rollback immediately to the recorded previous target on any auth, API, or asset regression.
