# Cloudflare app cutover

The BASE44 repository owns the resident-facing application shell. Authentication, authorization, transactions, persistence, billing, reporting engines, and integrations remain owned by the separately deployed Downtown Perks Backend Platform.

## Runtime boundary

The Worker serves `dist` through the `ASSETS` binding and uses SPA fallback for direct-loaded application routes. `/api` and `/api/*` always run Worker-first and proxy to `BACKEND_ORIGIN`; an unconfigured or unavailable backend returns an explicit JSON error and never falls through to `index.html`.

The build copies `public` explicitly and excludes two source PDFs that exceed Cloudflare's 25 MiB per-asset limit: `assets-originals/buildings/404-rio-grande.pdf` and `assets-originals/buildings/quincy.pdf`. Their optimized application images remain available; the archival source PDFs stay versioned but are not runtime assets.

`BACKEND_ORIGIN` is Worker-only configuration. It must be an HTTPS origin in staging and production and must not use a `VITE_` prefix. Browser variables are limited to publishable configuration such as the Supabase URL/publishable key and HTTP-referrer-restricted Google Maps key.

## Release gates

1. Configure `BACKEND_ORIGIN` in the Cloudflare staging Worker.
2. Configure the public Vite variables listed in `.env.example`.
3. Add exact Supabase callback URLs for the staging and production app hosts, including `/auth/callback`.
4. Verify guest map access, resident sign-in/callback, partner workspace access, super-admin routing, Legends drawers, and responsive map containment on the Cloudflare preview URL.
5. Confirm the backend returns JSON 404 responses for unknown `/api/*` routes and visible 5xx responses during an outage.
6. Reconcile live Supabase data, Base44-owned records still used by the browser, storage objects, RLS, and all backend endpoint contracts before changing DNS.

Do not change production DNS, custom domains, or secrets until the staging gates pass. The legacy Cloudflare Pages workflow is not the app cutover path; the Worker static-assets deployment is the canonical target.
