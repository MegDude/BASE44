# Cloudflare Pages cutover

This frontend can deploy without Vercel. It is intentionally a presentation build: authentication, authorization, transactions, AI calls, and private database access remain server-authorized services.

## Before deployment

1. Create a Cloudflare Pages project from this branch.
2. Set build command to `npm run build` and output directory to `dist`.
3. Add the variables from `.env.cloudflare.example` in the Cloudflare Pages dashboard. Use a browser-restricted Google Maps key. Do not add service-role, Stripe, OpenAI, or other private keys.
4. Set `VITE_API_BASE_URL` to the independently deployed API origin before changing public DNS.
5. Verify the build with `npm run verify:cloudflare-portability`.

## DNS sequence

1. Deploy and test on the Pages preview URL.
2. Attach a staging hostname, such as `staging-app.downtownperks.com`.
3. Verify resident, partner, map, drawer, sign-in, and API paths on mobile and desktop.
4. Point `app.downtownperks.com` to Pages only after the API origin and Google Maps referrers include the new hostname.
5. Keep the previous Vercel alias available until the smoke test passes, then remove its domain assignment.

## Explicit boundary

This change does not move or weaken backend authorization. Existing Vercel-style `/api/*` handlers need a separate migration to Cloudflare Workers or Supabase Edge Functions before the production domain cutover.
