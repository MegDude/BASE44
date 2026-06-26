# Entity-Specific Copy Regression Fix

## Regression Source

The generic organization copy came from three source layers:

1. `src/lib/useLocations.js`
   - DANA's live map record used a generic civic-layer summary instead of organization-specific copy.
   - This record feeds the visible map entity/detail copy path.

2. `src/utils/recommendCampaigns.ts`
   - The fallback recommendation used generic strategy language when no nearby evidence matched.
   - This created phrases such as generic launch/test copy instead of entity-specific campaign guidance.

3. `src/utils/recommendAudience.ts`
   - Dining and civic audience helpers used broad category phrases instead of copy tied to named nearby entities.

`src/pages/Map.jsx` also contained generic partner recommendation section labels that made the fallback feel like a real organization-specific insight.

## Files Changed

- `src/lib/useLocations.js`
- `src/data/supplementalMapEntities.js`
- `src/utils/recommendCampaigns.ts`
- `src/utils/recommendAudience.ts`
- `src/pages/Map.jsx`

## DANA Fields Restored Or Added

The Downtown Austin Neighborhood Association record now includes:

- `shortDescription`
- `fullDescription`
- `whyItMatters`
- `bestFor`
- `residentAction`
- `partnerAction`
- `nearbyContext`
- `campaignOpportunity`
- `suggestedPairings`
- `reportingSummary`
- `primaryCTA`
- `secondaryCTA`
- updated `summary`
- updated `description`
- updated tags/category/district in the supplemental seed

## Fallback Copy Removed

The banned copy sweep now returns no matches across `src`, `api`, and `docs` for the specified generic phrases.

## Fallback Guardrail

Fallback recommendations now reference the selected entity name, district/neighborhood, category/type, and active status where available. Generic system phrases should not surface as entity copy.

## Remaining Manual Copy Work

This pass fixed the identified DANA regression and the generic fallback helpers. A full content QA should still review every entity that does not yet have the full field set, especially imported seed records and generated Google/production inventory records.
