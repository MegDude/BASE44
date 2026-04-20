# Downtown Perks Copilot Instructions

You are working in the BASE44 repository for the Downtown Perks platform.

## Deployment contract
- Source of truth repository: BASE44
- Release branch: main
- Production deploy target: Vercel project downtown-perks-live
- Data layer: Supabase
- Billing layer: Stripe
- Mapping/UI: Leaflet-based resident map

## Repo facts
- This codebase currently builds as a React + Vite application with React Router.
- Base44 runtime values are used for frontend app bootstrapping.
- Supabase server access depends on environment variables being present.
- Production safety matters more than speed of changes.

## Required operating rules
1. Verify repo state before release changes:
   - git remote -v
   - git branch --show-current
   - git status --short
2. Production deploys only from main.
3. Do not leave the working tree dirty when claiming release readiness.
4. Do not introduce unpinned toolchain changes or depend on latest tags.
5. Never claim success without fresh verification evidence.

## Required verification before completion
Run all of the following when touching release-critical code:
- npm run lint
- npm run typecheck
- npm run build

If map behavior changes, also verify the live explore route in a browser and confirm there are no runtime errors.

## Environment contract
Validate these values before marking the pipeline healthy:
- VITE_BASE44_APP_ID
- VITE_BASE44_APP_BASE_URL
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_MAP_PROVIDER_KEY
- NEXT_PUBLIC_APP_URL

## Status output format
Always summarize pipeline state as one of:
- GREEN: repo synced, build passing, deploy parity confirmed
- YELLOW: app builds but deployment or env parity is incomplete
- RED: build failure, broken deploy path, or blocking env/config issue
