# Phase 1A End-to-End Test Plan

## Overview
Validates the unified data foundation: SharedMapItem entity → getSharedMapFeed function → ExploreRebuilt + Events pages.

---

## Test 1: SharedMapItem Entity

### Setup
1. Navigate to dashboard → entities → SharedMapItem
2. Verify schema matches expected structure (entity_id, entity_type, title, lat/lng, etc.)

### Validation
- [ ] Entity created successfully
- [ ] All required fields present: `entity_id`, `entity_type`, `title`, `latitude`, `longitude`
- [ ] Entity types include: venue, event, perk, building, property, hotel, campaign, civic_activation
- [ ] Metadata field accepts arbitrary objects

---

## Test 2: getSharedMapFeed Function

### Setup
1. Go to dashboard → code → functions → getSharedMapFeed
2. Use the "Test" button in the function editor

### Test Case 2a: Basic Feed (No Filters)
**Payload:**
```json
{
  "search": "",
  "filters": {},
  "limit": 100
}
```

**Expected Response:**
```json
{
  "items": [
    {
      "id": "venue-...",
      "entity_id": "...",
      "entity_type": "venue",
      "title": "Venue Name",
      "latitude": 30.267,
      "longitude": -97.743,
      "status": "active",
      ...
    },
    ...
  ],
  "count": number,
  "timestamp": "2026-04-15T..."
}
```

**Validation:**
- [ ] Response includes aggregated venues, events, buildings, campaigns, perks
- [ ] All items have valid coordinates
- [ ] Status field is present on all items
- [ ] Metadata is properly structured

### Test Case 2b: Category Filter
**Payload:**
```json
{
  "search": "",
  "filters": {
    "categories": ["restaurant", "bar"]
  },
  "limit": 100
}
```

**Validation:**
- [ ] Only venues with category in ["restaurant", "bar"] are returned
- [ ] Count reflects filtered results

### Test Case 2c: Status Filter
**Payload:**
```json
{
  "search": "",
  "filters": {
    "statuses": ["active"]
  },
  "limit": 100
}
```

**Validation:**
- [ ] Only items with status="active" returned
- [ ] Items with status "inactive", "archived", etc. are excluded

### Test Case 2d: Search Query
**Payload:**
```json
{
  "search": "coffee",
  "filters": {},
  "limit": 100
}
```

**Validation:**
- [ ] Results include items where title, subtitle, or description contains "coffee"
- [ ] Search is case-insensitive
- [ ] Empty search returns all items

### Test Case 2e: Limit Parameter
**Payload:**
```json
{
  "search": "",
  "filters": {},
  "limit": 10
}
```

**Validation:**
- [ ] Response contains exactly 10 items (or fewer if fewer exist)
- [ ] Count field reflects actual count

---

## Test 3: ExploreRebuilt Page Integration

### Setup
1. Navigate to `/downtown-perks/explore` in the app
2. Verify page loads without errors

### Test 3a: Initial Load
**Validation:**
- [ ] Map displays
- [ ] No console errors
- [ ] Markers appear on map for venues, events, buildings
- [ ] Results panel loads (desktop view)
- [ ] Bottom sheet loads (mobile view)

### Test 3b: Filter Functionality
**Actions:**
1. Click a filter chip (e.g., "restaurants")
2. Verify results update

**Validation:**
- [ ] Filtered results display on map
- [ ] Marker count decreases
- [ ] Results panel updates immediately
- [ ] Search bar shows filter is active

### Test 3c: Search Functionality
**Actions:**
1. Type in search bar (e.g., "coffee")
2. Verify results update

**Validation:**
- [ ] Search results appear in real-time
- [ ] Map markers update to show only matching items
- [ ] Results panel shows matching items

### Test 3d: Marker Selection
**Actions:**
1. Click a marker on the map

**Validation:**
- [ ] Marker highlights
- [ ] Item details appear in drawer (mobile) or sidebar (desktop)
- [ ] Selected item is visually distinguished

### Test 3e: Time Filter
**Actions:**
1. Change time filter (if available)

**Validation:**
- [ ] Results update based on time filter
- [ ] Events/items respect the time window

---

## Test 4: Events Page Integration

### Setup
1. Navigate to `/downtown-perks/events` in the app

### Test 4a: Event List Load
**Validation:**
- [ ] Page loads without errors
- [ ] Events display in results panel
- [ ] Event count matches API response
- [ ] Events show correct status (upcoming, live, past)

### Test 4b: Event Search
**Actions:**
1. Type in search bar (e.g., "yoga")

**Validation:**
- [ ] Results filter to events matching "yoga"
- [ ] Map markers update
- [ ] Search is case-insensitive

### Test 4c: Event Category Filter
**Actions:**
1. Click category filter chips

**Validation:**
- [ ] Results filter by category
- [ ] Multiple filters can be applied
- [ ] Map updates synchronously

### Test 4d: Event Detail
**Actions:**
1. Click an event in the results list

**Validation:**
- [ ] Event detail view opens
- [ ] Event information is complete (date, time, capacity, etc.)
- [ ] RSVP button is available
- [ ] All event metadata displays correctly

---

## Test 5: Data Integrity

### Validation Points
- [ ] No duplicate items appear in results
- [ ] All coordinates are valid lat/lng pairs
- [ ] No null/undefined titles or required fields
- [ ] Entity IDs are unique
- [ ] Status values are from defined enum
- [ ] Image URLs are properly formatted (if present)

---

## Test 6: Performance

### Validation Points
- [ ] Initial page load < 2 seconds
- [ ] Filter/search updates < 500ms
- [ ] Map re-render smooth (no jank)
- [ ] No memory leaks (browser dev tools)
- [ ] API response time < 1 second

---

## Rollback Plan
If any test fails:
1. Check function logs in dashboard → code → functions → getSharedMapFeed
2. Verify entity schema matches expected structure
3. Review filter/search logic in function
4. Check page component integration (imports, hook calls)
5. Verify API response structure matches expected contract

---

## Sign-Off
- [ ] All tests pass
- [ ] No console errors
- [ ] Data flows correctly through pipeline
- [ ] UI updates sync with data changes
- [ ] Ready for Step 7 (install shared map system)