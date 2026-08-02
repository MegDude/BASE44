# Legends listings audit and backend wiring record

Date: 2026-08-02
Branch: `vercel-agent/legends-listing-audit-foundation`

## Scope completed in this pass

- Standardized the Legends map pin asset to `/pins/downtown-perks/legends-logo-gold.svg` in the Legends listing data source.
- Added `src/server/legends/listingCatalog.js` as a server-side canonical Legends listing catalog adapter backed by the approved generated Legends listing export.
- Added public listing endpoints:
  - `GET /api/listings`
  - `GET /api/listings/:listingId`
  - `GET /api/listings/:listingId/related`
  - `GET /api/properties/:propertyId`
- Added resident listing action endpoints:
  - `POST /api/listings/:listingId/save`
  - `DELETE /api/listings/:listingId/save`
  - `POST /api/listings/:listingId/contact`
- Added admin quality endpoint:
  - `GET /api/admin/listings/quality`
- Added Downtown Top 10 server collection support through `GET /api/listings?collection=downtown-top-10`.
- Added `test:legends-listing-backend` to enforce canonical listing fields, Legends scope, approved pin asset, marker size/anchor, public/admin field separation, save/contact endpoint behavior, The Shore property ID separation, and Top 10 constraints.

## Verified contracts

- Listing IDs are unique in the server catalog.
- Listings remain separate from properties through `propertyId`.
- The Shore remains canonical property ID `the-shore` where matched.
- Listing markers use canonical listing IDs, approved gold Legends SVG, bottom-center anchor, and shared standard marker size.
- Resident-facing list/detail endpoints return public listing fields only.
- Admin listing quality endpoint requires an admin signal.
- Listing contact action delegates to the existing traceable listing-interest flow.
- Listing save action writes the canonical resident saved listing relationship when Supabase is configured.

## Existing gaps not fully solved in this pass

- The authoritative MLS/Luxury Presence live source connection is not configured or verified here; this branch uses the approved generated Legends export already present in the repository.
- Backend authorization should be strengthened beyond header/query admin signals before production use of the admin quality endpoint.
- Full resident/partner/admin UI migration to one listing-specific `NativeDetailSheet` remains a larger product workstream.
- Manual iPhone/tablet/desktop QA and production smoke testing were not completed in this branch.
- Production deployment is not part of this branch; do not treat a preview as production.

## Validation run

- `npm run test:legends-logo-pin` passed.
- `npm run test:legends-listing-identity` passed.
- `npm run test:legends-listing-backend` passed.
- `node --check` passed for the new server catalog and endpoint files.
- `git diff --check` passed.
