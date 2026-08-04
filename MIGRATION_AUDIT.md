# Downtown Perks: independent-hosting migration audit

## Baseline captured

- Repository: `MegDude/BASE44`
- Commit: `9ac33169b30d1498805c8631d5d46450d004cc39`
- Source: merged v0 PR #216, *Improve mobile map UI and add guided pricing builder*
- Scope: authenticated/map-native application intended for `app.downtownperks.com`

This clone contains the current application source, 1,696 versioned public files (about 1.91 GB), 11 Supabase migrations, and 57 server endpoints. It does **not** contain live Base44 entity rows, Supabase table rows/auth users/storage objects, payment/customer records, integration credentials, or third-party account configuration.

## Decision

Keep Supabase as the system of record, replace Base44 incrementally, and deploy the Vite application plus a Workers API at Cloudflare. Do not attempt a static-only deployment: it would make the interface load while breaking sign-in, transactions, QR redemption, partner operations, and the map’s live data.

## Data inventory and export ownership

| Source | What it contains | Export / preservation action | Cutover rule |
| --- | --- | --- | --- |
| GitHub repository | React/Vite source, map registry/content, migrations, 1.91 GB public media | Already captured at the baseline commit | Treat as immutable until a branch is created for the migration |
| Supabase Postgres | tenant access, workspace, audience, analytics, resident and partner records | Keep the current project first; take a schema and data dump before any database move | Validate row counts and RLS policies before redirecting traffic |
| Supabase Auth | users, sessions, identity providers | Keep the project and change only allowed redirect URLs during the first cutover | Do not export credentials or recreate users client-side |
| Supabase Storage | uploaded media and operational files | Inventory buckets and objects; copy only if changing Supabase projects | Compare object count and byte total per bucket |
| Base44 entities | `AnalyticsSignal`, `Booking`, `Campaign`, `Event`, `Perk`, `SaveAction`, `SharedMapItem`, `UserAction`, `Venue` | Export every entity with IDs, timestamps, ownership fields, and attachments; import into Supabase staging tables | Do not disable Base44 reads until table counts and sampled records reconcile |
| Stripe | products, prices, customers, subscriptions, webhooks | Reuse the Stripe account; repoint webhooks after the Worker endpoints are live | Verify checkout and portal in test mode, then production |
| OpenAI, Resend, Twilio, Google Maps, Luxury Presence | server-only integrations | Recreate secrets in Cloudflare Workers and restrict/refit allowed origins | Never add secrets to the client or Git repository |

## Base44 replacement work

The Base44 SDK is currently called directly by the browser in 20 application modules. Its concrete entity models are listed above; a local-browser fallback is present, which is suitable for development only and must not be mistaken for persistence.

1. Create Supabase tables and RLS policies for the nine Base44 entities in a non-production staging migration.
2. Add a same-origin `/api/entities/*` Workers API that validates the Supabase user JWT server-side.
3. Replace the Base44 repository and workspace calls first, then bookings, saves, events, and analytics.
4. `@base44/vite-plugin` and Vercel browser libraries are removed from the independent app shell. Replace the remaining `@base44/sdk` calls and localStorage fallback only after Platform API parity testing.

## Cloudflare target architecture

| Concern | Target |
| --- | --- |
| React application and public media | Cloudflare Pages or Workers static assets |
| `/api/*` (57 endpoints) | Cloudflare Workers, ported from Vercel `req`/`res` handlers through a compatibility layer and then native Fetch handlers |
| Persistent relational data and auth | Existing Supabase project |
| Object media added after cutover | Supabase Storage initially; R2 only if an explicit storage migration is approved |
| Domain | `app.downtownperks.com` on Cloudflare; keep `downtownperks.com` separate for the marketing site |
| Analytics | Cloudflare Web Analytics or a first-party event endpoint; remove Vercel Analytics and Speed Insights |

## Required runtime configuration

Public build variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (or anon key), `VITE_GOOGLE_MAPS_API_KEY`, `VITE_GOOGLE_MAP_ID`, and the eventual same-origin API base URL.

Worker-only secrets: `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` if used, `STRIPE_SECRET_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY`, `TWILIO_*`, `LUXURY_PRESENCE_WEBHOOK_SECRET`, `DP_REDEMPTION_SIGNING_SECRET`, and any audit/IP hashing secret. These must be added with secret management, never committed.

## Current blockers

1. The v0 chat URL is signed out in this environment, so its export controls cannot be read. The merged GitHub baseline already includes the latest visible v0 work; upload `drawer-layout-alignment (1)` only if it contains changes that were never merged.
2. `/Users/megdude/Desktop/4 AUG` is on the user’s Mac and is not mounted in this workspace. Upload the folder as one ZIP if it contains source, media, exports, or credentials-free configuration not present in GitHub.
3. Database and Base44 exports require their respective authenticated dashboards or service credentials. No export has been attempted, and no live data has been changed.

## Acceptance gates before DNS cutover

- Build succeeds without Vercel browser libraries or the Base44 Vite plugin; remaining Base44 SDK calls must be migrated behind the Platform API before a full data cutover.
- All 57 `/api` routes have Worker parity tests; critical paths are sign-in, resident pass, save, redemption issue/verify, partner scope, workspace reports, checkout, contact, and listing interest.
- Supabase row/object counts reconcile and RLS tests pass for resident, partner, and super-admin scopes.
- iPhone 15, tablet, and desktop manual QA passes for map markers, drawers, routes, and workspace navigation.
- Staging runs on a Cloudflare preview URL before `app.downtownperks.com` changes.
