# First-party map authentication

## Canonical routes

- `/map` — public map gateway
- `/app` — guest map
- `/app/map` — retired compatibility alias that preserves query state and redirects to `/map`
- `/sign-in` — resident email-link and Google sign-in
- `/auth/callback` — shared first-party Supabase callback
- `/card` — resident card and access
- `/partner-workspace/overview` — authenticated partner destination
- `/admin-studio/command-center` — authenticated admin destination

All map query state is preserved through the gateway and authentication flow, including `mode`, `tab`, `filter`, `intent`, `entityId`, `perkId`, `eventId`, `collectionId`, `collection`, `routeId`, `district`, `query`, and `radius`.

## Supabase production configuration

Set the Supabase Auth Site URL to:

`https://downtownperks.com`

Add these exact Redirect URLs:

- `https://downtownperks.com/auth/callback`
- `https://www.downtownperks.com/auth/callback`
- `http://localhost:5173/auth/callback`

If Vercel previews are used for authentication QA, add a team-scoped preview wildcard separately. Production callbacks should remain exact.

The magic-link email template must use `{{ .RedirectTo }}` when a flow supplies `emailRedirectTo`; otherwise Supabase can fall back to the Site URL and lose the requested map state.

Google must be enabled under Supabase Auth providers, and its provider callback must point to the Supabase project callback URL. Application return routing still uses the first-party `/auth/callback` path above.

## Role governance

Authorization roles must be stored in Supabase `app_metadata.role` as one of:

- `resident`
- `partner`
- `admin`

Do not use user-editable `user_metadata` for role authorization. Accounts without a governed app role default to resident access and cannot enter the partner workspace.

## Deployment requirements

The production Vercel project must expose:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` or the project publishable key in that variable

The existing Vercel SPA rewrite serves `/map`, `/sign-in`, and `/auth/callback` from the same application. The retired `/app/map` alias redirects immediately to `/map`; no cross-origin map rewrite or iframe is permitted.
