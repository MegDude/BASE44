# Native Google Maps Architecture

Downtown Perks uses the Google Maps JavaScript API as the rendering engine and keeps the product experience in the Downtown Perks application shell.

## Current Contract

- The canonical `/map` page creates one native `google.maps.Map` instance through `src/map/MapProvider.ts`.
- The app does not use Google Maps iframe embeds, Embed API widgets, `maps.app.goo.gl` share links, or embedded place/directions widgets.
- Search, filters, campaigns, collections, routes, drawers, resident/partner navigation, and notifications remain Downtown Perks UI layers above the map canvas.
- Route overlays are custom branded `google.maps.Polyline` layers through `src/map/RouteManager.ts`.
- Pins are created through `src/map/MarkerManager.ts`; when a valid Map ID is configured, the app uses `google.maps.marker.AdvancedMarkerElement`.
- If a Map ID is not configured in a local environment, the map still renders with the JavaScript API and Downtown Perks SVG marker icons as a compatibility fallback.

## Required Production Configuration

Configure a dedicated Google Cloud Map ID for production:

```text
VITE_GOOGLE_MAP_ID=<downtown-perks-vector-map-id>
```

`VITE_GOOGLE_MAPS_MAP_ID` is also supported for compatibility.

The Map ID should carry Downtown Perks styling:

- clean grayscale roads
- soft blue water
- muted green parks
- off-white land
- reduced POI clutter
- muted business labels
- minimal transit noise
- higher road contrast

## Service Boundary

Google Maps API access belongs under `src/map/`:

- `MapProvider.ts`
- `MapController.ts`
- `CameraController.ts`
- `MarkerManager.ts`
- `RouteManager.ts`
- `DistrictManager.ts`
- `CollectionManager.ts`
- `CampaignManager.ts`
- `BrandManager.ts`
- `PlacesService.ts`
- `SearchIntentEngine.ts`

UI components should call these services instead of constructing Google Maps primitives directly.

## Verification

Run:

```bash
npm run audit:native-map
```

This verifies:

- no forbidden Google Maps iframe/embed patterns
- required map service files exist
- the active map page creates the map through the service layer
- custom route polylines are managed through the route service
- markers are managed through the marker service
- the canonical map page no longer imports React Leaflet
