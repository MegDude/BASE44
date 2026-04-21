# Downtown Perks Developer Checklist

## Product Alignment

- The homepage states the canonical positioning line.
- Perks-first language is demoted below map-native operating-layer language.
- Public CTAs route into working product surfaces, not decorative pages.
- Resident, partner, property, and operator paths feel like one system.

## Map Integration

- Search handoff writes to the unified map store.
- Query state is preserved in the `/downtown-perks/explore?q=` URL.
- Intent chips route to the live map.
- AI intent routing uses the existing `searchMapIntent` function.
- Map selection opens detail in the existing drawer or bottom sheet.

## Routing

- Resident entry points route to `/resident-app`.
- Map entry points route to `/downtown-perks/explore`.
- Building narrative routes to `/downtown-perks/for-buildings`.
- Partner narrative routes to `/partners`.
- Dashboard entry routes to `/dashboard`.
- Pricing routes to `/pricing`.

## Verification

Run:

```bash
npm run build
```

Then manually check:

- `/`
- `/downtown-perks/explore`
- `/resident-app`
- `/partners`
- `/dashboard`
- `/pricing`

## Guardrails

Do not introduce a second map store.

Do not rebuild backend behavior inside the homepage.

Do not migrate stacks as part of a copy or hierarchy pass.

Do not use perks as the master frame.

