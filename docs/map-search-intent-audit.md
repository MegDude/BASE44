# Map Search Intent Audit

Generated: 2026-07-10T19:08:51.836Z

## Summary

- Total pins audited: 1487
- Visible published pins: 1473
- Passed pins: 1473
- Failed pin issue rows: 14
- Intent controls audited: 23
- Route relationships: 7
- Collection relationships: 7
- Campaign relationships: 15
- Brand relationships: 11
- Empty intents: natural_language
- Duplicate entity IDs: 1
- Duplicate coordinate groups: 28
- Unresolved critical failures: 0

## Canonical Pipeline

1. UI action
2. resolveSearchIntent
3. normalizeEntityTaxonomy
4. queryEntitiesForIntent
5. resolveIntentRelationships
6. rankIntentResult
7. applyMapIntent
8. clearPreviousMapIntent

## Totals By Entity Type

- restaurant: 421
- building: 230
- listing: 119
- retail: 215
- bar: 222
- civic: 57
- hotel: 59
- wellness: 69
- coffee: 77
- brand: 4
- event: 13
- service: 1

## Totals By Category

- Restaurant: 422
- Property: 349
- Retail: 210
- Drinks: 223
- Civic: 58
- Hotel: 59
- Wellness: 69
- Coffee: 75
- Campaigns: 4
- Events: 10
- Music: 2
- Grocery: 5
- Services: 1

## Totals By District

- Congress: 120
- Downtown Core: 1069
- West Campus: 1
- 2nd Street: 57
- Downtown Austin: 57
- Seaholm: 14
- West End: 1
- Rainey: 36
- West 6th: 56
- Waterfront: 21
- The Domain: 3
- Waterloo: 21
- Red River: 25
- West Austin: 1
- Warehouse: 4
- Warehouse District: 1

## Intent Results

- all (resident/category): 1486 pins, 0 routes, 0 collections, 0 campaigns, 0 brands
- coffee (resident/subcategory): 499 pins, 1 routes, 1 collections, 0 campaigns, 0 brands
- dining (resident/category): 612 pins, 1 routes, 1 collections, 2 campaigns, 0 brands
- happy_hour (resident/perk): 6 pins, 1 routes, 1 collections, 0 campaigns, 0 brands
- events (resident/event): 66 pins, 0 routes, 0 collections, 2 campaigns, 2 brands
- hotels (resident/hotel): 67 pins, 1 routes, 1 collections, 0 campaigns, 0 brands
- properties (resident/property): 359 pins, 0 routes, 0 collections, 4 campaigns, 4 brands
- brands (resident/brand): 235 pins, 0 routes, 0 collections, 4 campaigns, 6 brands
- inkind (resident/brand): 448 pins, 1 routes, 1 collections, 1 campaigns, 1 brands
- legends (resident/brand): 350 pins, 0 routes, 0 collections, 1 campaigns, 1 brands
- civic (resident/category): 112 pins, 3 routes, 3 collections, 0 campaigns, 0 brands
- services (resident/category): 64 pins, 0 routes, 0 collections, 0 campaigns, 0 brands
- rainey (resident/district): 36 pins, 0 routes, 0 collections, 2 campaigns, 1 brands
- seaholm (resident/district): 14 pins, 0 routes, 0 collections, 3 campaigns, 3 brands
- west_6th (resident/district): 56 pins, 0 routes, 0 collections, 1 campaigns, 1 brands
- red_river (resident/district): 25 pins, 0 routes, 0 collections, 0 campaigns, 0 brands
- congress (resident/district): 120 pins, 0 routes, 0 collections, 3 campaigns, 2 brands
- waterloo (resident/district): 10 pins, 1 routes, 1 collections, 0 campaigns, 0 brands
- campaigns (partner/campaign): 340 pins, 0 routes, 0 collections, 11 campaigns, 9 brands
- partner_properties (partner/property): 352 pins, 0 routes, 0 collections, 0 campaigns, 0 brands
- partner_events (partner/event): 7 pins, 0 routes, 0 collections, 0 campaigns, 0 brands
- partner_perks (partner/perk): 1 pins, 0 routes, 0 collections, 0 campaigns, 0 brands
- natural_language (resident/natural-language): 0 pins, 0 routes, 0 collections, 0 campaigns, 0 brands

## Natural-Language Queries

- "coffee near Rainey" -> coffee: 499 pins, 1 routes, 1 collections, 0 campaigns
- "happy hour near me" -> happy_hour: 6 pins, 1 routes, 1 collections, 0 campaigns
- "restaurants open now" -> dining: 612 pins, 1 routes, 1 collections, 2 campaigns
- "events tonight" -> events: 66 pins, 0 routes, 0 collections, 2 campaigns
- "dog-friendly places" -> natural_language: 0 pins, 0 routes, 0 collections, 0 campaigns
- "hotels near the Convention Center" -> hotels: 67 pins, 1 routes, 1 collections, 0 campaigns
- "resident perks near Lady Bird Lake" -> natural:resident perks near lady bird lake: 379 pins, 0 routes, 0 collections, 3 campaigns
- "things to do this weekend" -> events: 66 pins, 0 routes, 0 collections, 2 campaigns
- "inKind restaurants" -> dining: 612 pins, 1 routes, 1 collections, 2 campaigns
- "Legends locations" -> legends: 350 pins, 0 routes, 0 collections, 1 campaigns
- "Rainey walking route" -> rainey: 36 pins, 0 routes, 0 collections, 2 campaigns
- "date-night collection" -> natural:date-night collection: 3 pins, 0 routes, 0 collections, 0 campaigns
- "Austin FC campaign" -> brands: 235 pins, 0 routes, 0 collections, 4 campaigns
- "properties near Seaholm" -> properties: 359 pins, 0 routes, 0 collections, 4 campaigns
- "zero result unicorn helipad" -> natural:zero result unicorn helipad: 0 pins, 0 routes, 0 collections, 0 campaigns

## Relationship Warnings

- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection daa-art-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection waterloo-greenway: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection waterloo-greenway: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection waterloo-greenway: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection waterloo-greenway: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection warehouse-district-happy-hour: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection warehouse-district-happy-hour: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection warehouse-district-happy-hour: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection warehouse-district-happy-hour: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection downtown-stories-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection downtown-stories-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection downtown-stories-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection downtown-stories-walk: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection inkind-dining-market: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection inkind-dining-market: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection inkind-dining-market: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection inkind-dining-market: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection coffee-before-work: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection coffee-before-work: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection coffee-before-work: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection hotel-guest-arrival-route: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection hotel-guest-arrival-route: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection hotel-guest-arrival-route: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [warning] collection hotel-guest-arrival-route: Stop is resolved by stop hint fallback or omitted if no matching pin exists.
- [info] campaign campaign-equinox-wellness-reset: Draft campaign is excluded from active intent results.
- [info] campaign campaign-ariat-weekend-western: Draft campaign is excluded from active intent results.
- [info] campaign campaign-new-resident-welcome: Draft campaign is excluded from active intent results.
- [info] campaign campaign-bathe-new-resident-welcome: Draft campaign is excluded from active intent results.

## Remaining Blockers

- No unresolved critical failures in generated audit.
