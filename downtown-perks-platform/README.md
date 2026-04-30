# Downtown Perks

Production-ready Next.js App Router build for Downtown Perks. The real app root is this folder: it contains `package.json`, `app/`, `middleware.ts`, `next.config.ts`, and the Supabase schema in `supabase/schema.sql`.

## Stack

- Next.js 15 App Router
- React 19
- Shared Downtown Perks resident + partner shell rebuilt from the Replit product structure
- Supabase Auth and database persistence
- Stripe Checkout + Stripe webhook verification
- Twilio SMS send + Twilio status callbacks
- Vercel deployment target

## Product surfaces

### Shared routes

- `/` ecosystem home
- `/search` ask-the-map surface
- `/events` shared event framing
- `/about` product and pilot overview
- `/contact` pilot handoff and text-link entry
- `/station?station=1..4` QR prompt flow

### Resident app routes

- `/resident-app`
- `/resident-app/map`
- `/resident-app/perks`
- `/resident-app/card`
- `/resident-app/events`
- `/resident-app/saved`
- `/resident-app/properties`
- `/resident-app/profile`
- `/resident-app/explore`
- `/resident-app/station?station=1..4`

### Partner dashboard routes

- `/partner-dashboard`
- `/partner-dashboard/map`
- `/partner-dashboard/partner`
- `/partner-dashboard/redemptions`
- `/partner-dashboard/explorer`
- `/partner-dashboard/about`

Partner routes accept `?type=properties|hotels|venues|brands|civic`.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Fill in the environment variables you need for the features you are testing.
3. Install dependencies:

```bash
npm install
```

4. Run checks:

```bash
npm run typecheck
npm run build
```

5. Start the production server locally if needed:

```bash
npm run start
```

## Environment variables

### Required for the base production app

These are required if you want sign-in, sign-up, `/admin`, and database-backed persistence to work:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS`

### Required for live Stripe checkout

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Optional:

- `STRIPE_PRICE_VENUE_PILOT`
- `STRIPE_PRICE_PROPERTY_PILOT`

If the price IDs are omitted, `/api/checkout` creates inline Stripe price data.

### Required for live Twilio SMS

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`

Optional:

- `TWILIO_STATUS_CALLBACK_URL`

### Optional for OpenAI-powered ask-the-map

- `OPENAI_API_KEY`

Optional:

- `OPENAI_MODEL`

When `OPENAI_API_KEY` is present, the ask-the-map route uses OpenAI to refine search recommendations while preserving the local downtown dataset as fallback context.

### Recommended

- `NEXT_PUBLIC_SITE_URL`

Set this to the canonical production origin, for example `https://your-project.vercel.app` or your custom domain. The app falls back to the incoming request origin if this is not set, but the explicit value is better for production callbacks and absolute URLs.

## API routes and webhook endpoints

### App routes

- `POST /api/checkout`
- `POST /api/text-link`
- `POST /api/rsvp`
- `POST /api/redeem`
- `POST /api/stripe/webhook`
- `POST /api/twilio/status`
- `GET /auth/callback`

### Auth and admin routes

- `/sign-in`
- `/sign-up`
- `/admin`

### Production webhook URLs

After deployment, configure these exact endpoints in Stripe and Twilio using your live domain:

- Stripe webhook endpoint: `https://YOUR_DOMAIN/api/stripe/webhook`
- Twilio status callback endpoint: `https://YOUR_DOMAIN/api/twilio/status`

### Route behavior notes

- `/api/checkout` validates plan IDs and only accepts same-origin success and cancel URLs.
- `/api/text-link` validates phone input, uses live Twilio only when Twilio env vars are present, and records failed sends.
- `/api/rsvp` and `/api/redeem` validate payloads and persist through the Supabase service role client.
- `/api/stripe/webhook` runs in the Node.js runtime, verifies the Stripe signature, and returns non-2xx if persistence fails so Stripe can retry.
- `/api/twilio/status` runs in the Node.js runtime, verifies the Twilio signature when `TWILIO_AUTH_TOKEN` is present, and returns non-2xx if persistence fails so Twilio can retry.
- `/auth/callback` sanitizes the `next` parameter to internal paths only and fails back to `/sign-in` if Supabase config is missing or the auth exchange fails.

## Supabase setup

1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql`.
3. Enable email OTP or magic-link auth in Supabase Auth.
4. In Supabase Auth URL settings, add your deployed site URL and local URL as allowed redirect URLs:

- `http://localhost:3000`
- `https://YOUR_DOMAIN`
- `https://YOUR_DOMAIN/auth/callback`

5. Put at least one admin email into `ADMIN_EMAILS`.

## Stripe setup

1. Create or reuse your Stripe account.
2. Add `STRIPE_SECRET_KEY` to Vercel.
3. Create a webhook in Stripe pointing to:

- `https://YOUR_DOMAIN/api/stripe/webhook`

4. Subscribe to at least:

- `checkout.session.completed`
- `checkout.session.expired`

5. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.
6. If you have fixed Stripe Prices, set `STRIPE_PRICE_VENUE_PILOT` and `STRIPE_PRICE_PROPERTY_PILOT`.

## Twilio setup

1. Create or reuse a Twilio phone number that can send SMS.
2. Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER` to Vercel.
3. Configure the status callback URL as:

- `https://YOUR_DOMAIN/api/twilio/status`

4. If you want to override that URL explicitly, set `TWILIO_STATUS_CALLBACK_URL`.

## Deploying to Vercel

### Vercel project settings

Use these settings when importing the repo from GitHub:

- Framework Preset: `Next.js`
- Root Directory: `.`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave empty
- Node.js Version: `20.x`

### Deploy steps

1. Push this folder to GitHub.
2. Import the repository into Vercel.
3. Add the environment variables from `.env.example`.
4. Deploy.
5. After the first deploy, configure Stripe and Twilio webhooks with the deployed domain.
6. Update `NEXT_PUBLIC_SITE_URL` to the final production domain or custom domain.
7. Redeploy after adding webhook secrets if needed.
8. If you previously enabled Vercel deployment protection, disable it for public demos or make sure your reviewers have access.

## Post-deploy checklist

- Confirm `/sign-in` sends a Supabase magic link.
- Confirm `/admin` is only accessible to emails in `ADMIN_EMAILS`.
- Confirm `/api/checkout` creates a Stripe Checkout session.
- Confirm Stripe webhooks reach `/api/stripe/webhook`.
- Confirm `/api/text-link` sends SMS when Twilio env vars are present.
- Confirm Twilio status callbacks reach `/api/twilio/status`.
- Confirm Supabase tables receive rows for RSVPs, redemptions, text links, checkouts, and webhook events.

## Vercel config

`vercel.json` is intentionally minimal. It only sets response security headers and does not override the standard Next.js build pipeline.
