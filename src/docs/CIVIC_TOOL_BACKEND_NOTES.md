# Civic Tool Backend Notes

This pass builds a civic backend tool from the Downtown Perks planning transcripts that were locally accessible in `Downloads`.

## Accessible Transcript Inputs Used

- `src/data/archive-imports/transcripts/Austin Downtown Discussion_otter_ai.txt`
- `src/data/archive-imports/transcripts/Downtown perks Horacio .txt`
- `src/data/archive-imports/transcripts/DOWWNTOWN PERKS HORACTIO BRIEF.txt`
- `src/data/archive-imports/transcripts/Downtown Perks Platform Meeting_otter_ai.txt`
- `src/data/archive-imports/transcripts/Downtown perskReal Estate AI Strategy Meeting_otter_ai.txt`

## Civic Backend Route

- `GET /api/civic-dashboard`

This route now returns:

- civic summary metrics
- corridor rollups
- onboarding / outreach recommendations
- transcript-derived operating themes
- dashboard modules
- activity feed
- source file references

## Implementation Intent

The civic tool is not treated as a generic dashboard skin.
It is built around the operating model described in the transcript set:

- resident-first downtown layer
- launch in Rainey
- expand district by district
- connect property teams, local businesses, and civic groups
- measure activation readiness, event participation, and district coverage

## Frontend Integration

`usePartnerInsights("civic")` now asks `/api/civic-dashboard` for civic-specific summary and activity feed data.
That gives the civic partner map a backend-specific answer layer rather than only a fallback generic summary.
