# Downtown Perks

Downtown Perks is a Vite + React + Tailwind app for a map-first downtown Austin product. The map is the product, the card is access, and analytics are proof.

## Product laws

- The map is the product.
- The card is access.
- Analytics are proof.
- Public browse routes work before login.
- One shared map interaction model powers home, explore, resident, and partner surfaces.
- The runtime loop is `Ask -> Rank -> Map -> Panel -> Action -> Signal`.

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

## Environment notes

Safe public defaults live in `.env.example`:

<<<<<<< ours
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

## Shared map model

The main map flow lives in the shared explore runtime and uses:

- URL filter parsing in [src/hooks/useMapFilters.js](/Users/megdude/BASE44/src/hooks/useMapFilters.js)
- Shared filtering in [src/lib/mapFilters.js](/Users/megdude/BASE44/src/lib/mapFilters.js)
- Shared deep-link creation in [src/lib/routeHelpers.js](/Users/megdude/BASE44/src/lib/routeHelpers.js)
- Shared drawer state in [src/store/mapStateStore.ts](/Users/megdude/BASE44/src/store/mapStateStore.ts)

Invalid coordinates are guarded in [src/lib/mapValidation.ts](/Users/megdude/BASE44/src/lib/mapValidation.ts) so bad records do not render markers or crash the map.

## Known next integrations

- Supabase
- Google Maps
- Ask the Map API
- Partner analytics database
- Real redemption tracking
=======
Support: [https://app.base44.com/support](https://app.base44.com/support)

## Quick test links for map search

After running `npm run dev`, use the following in your browser:

- UI route test: `http://localhost:5173/map?q=coffee%20near%20me`
- API test: `http://localhost:5173/api/places?query=coffee%20near%20me`

If the API returns a `Missing GOOGLE_MAPS_API_KEY` error, add this env var before testing:

- `GOOGLE_MAPS_API_KEY=your_google_places_key`
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
