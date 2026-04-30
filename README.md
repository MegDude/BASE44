# Downtown Perks

Downtown Perks is a Vite + React + Tailwind app for a map-first downtown Austin product. The map is the product, the card is access, and analytics are proof.

## Product laws

- The map is the product.
- The card is access.
- Analytics are proof.
- The dashboard explains what happened and what to do next.
- Public browse routes work before login.
- One shared map interaction model powers home, explore, resident, and partner surfaces.
- The decision loop is `Open -> See -> Decide -> Act`.
- The runtime loop is `Ask -> Rank -> Map -> Panel -> Action -> Signal`.

## Project overview

Downtown Perks is a live neighborhood layer for downtown Austin. The homepage, explore map, resident surfaces, partner overview, partner workspace, and partner dashboard all consolidate around one map interaction model instead of separate map implementations.

The current production direction is:

- homepage stays map-first
- public routes work before login
- one shared drawer system powers details
- ranking and filter state route people back into the map
- supporting pages explain or route into the map instead of replacing it

## Local setup

1. Run `npm install`
2. Copy `.env.example` to `.env.local`
3. Start the app with `npm run dev`

## Scripts

- `npm run dev` starts Vite
- `npm run build` creates the production build in `dist`
- `npm run preview` serves the built app locally
- `npm run lint` runs ESLint on `js` and `jsx` files
- `npm run typecheck` runs the existing repo typecheck

## Routes

Core public routes:

- `/`
- `/explore`
- `/map`
- `/events`
- `/perks`
- `/card`
- `/residents`
- `/about`
- `/partners`
- `/partners/properties`
- `/partners/hotels`
- `/partners/venues`
- `/partners/brands`
- `/partners/civic`
- `/partners/apply`
- `/partners/dashboard`
- `/partner-workspace`

## Deep-link map examples

- `/explore?intent=places`
- `/explore?type=property&intent=residential`
- `/explore?type=event&time=now`
- `/explore?type=perk&radius=5`
- `/explore?saved=true`
- `/explore?district=rainey`
- `/explore?category=coffee`
- `/explore?category=nightlife`
- `/explore?type=event&time=now`

## Shared map model

The main map flow uses shared URL filter parsing, ranking, drawer state, and map normalization:

- [src/hooks/useMapFilters.js](/Users/megdude/BASE44/src/hooks/useMapFilters.js)
- [src/lib/mapFilters.js](/Users/megdude/BASE44/src/lib/mapFilters.js)
- [src/lib/routeHelpers.js](/Users/megdude/BASE44/src/lib/routeHelpers.js)
- [src/store/mapStateStore.ts](/Users/megdude/BASE44/src/store/mapStateStore.ts)
- [src/components/map/MapShell.jsx](/Users/megdude/BASE44/src/components/map/MapShell.jsx)
- [src/components/map/unified/UnifiedMapShell.jsx](/Users/megdude/BASE44/src/components/map/unified/UnifiedMapShell.jsx)

Invalid coordinates are guarded in [src/lib/mapValidation.ts](/Users/megdude/BASE44/src/lib/mapValidation.ts) so bad records never render markers or crash the runtime.

## Consolidation guardrails

- Preserve working map-first routes instead of replacing them with placeholder scaffolds.
- Production routes must not render stubs.
- One shared panel system should handle entity details.
- Marker click and result click should resolve to the same selected entity state.
- Use the best existing live implementation when duplicate surfaces exist.

## Environment notes

Safe public defaults live in `.env.example`:

- `VITE_APP_NAME`
- `VITE_DEFAULT_CITY`
- `VITE_DEFAULT_DISTRICT`
- `VITE_PUBLIC_BASE_URL`

The repo also preserves optional Base44, Supabase, Stripe, and map-provider env vars already used elsewhere in the workspace. Do not commit private API keys or production secrets.

## Vercel deployment

- Build command: `npm run build`
- Output directory: `dist`
- SPA refreshes are handled by [vercel.json](/Users/megdude/BASE44/vercel.json)
- The root rewrite sends all routes to `index.html`

## Known next integrations

- Supabase
- Google Maps
- Ask the Map API
- Partner analytics database
- Real redemption tracking
