# Google Map deployment configuration

Date: 2026-07-16
Project scope: BASE44 only

## Current finding

Local BASE44 on `127.0.0.1:5173` can load the map canvas when the Google Maps public env is present.

The deployed preview `base-44-downtown-perks-live-meg-dude.vercel.app` renders the shell but falls into:

```text
Map service needs attention.
The map is temporarily unavailable. Please try again shortly.
```

That preview should not be used as the functional baseline until its map configuration is repaired.

## Code conventions

Google Maps loader:

```text
src/lib/googleMapsLoader.ts
```

The loader reads:

```text
VITE_GOOGLE_MAPS_API_KEY
```

The Vite config normalizes these possible inputs:

```text
VITE_GOOGLE_MAPS_API_KEY
GOOGLE_MAPS_API_KEY
VITE_GOOGLE_MAP_ID
VITE_GOOGLE_MAPS_MAP_ID
```

and exposes:

```text
import.meta.env.VITE_GOOGLE_MAPS_API_KEY
import.meta.env.VITE_GOOGLE_MAP_ID
import.meta.env.VITE_GOOGLE_MAPS_MAP_ID
```

## Loader requirements already present

- script ID: `downtown-perks-google-maps-js`
- callback: `__downtownPerksGoogleMapsReady`
- cached loading promise
- duplicate script detection
- auth failure handling through `gm_authFailure`
- one retry for script load failure
- libraries: `geometry`, `marker`, `places`

## Deployment repair checklist

For the BASE44 Vercel project only:

```text
meg-dude/base-44-h2iq
```

Verify env vars exist for the relevant Vercel scopes:

| Variable | Scope | Required | Notes |
| -------- | ----- | -------- | ----- |
| `VITE_GOOGLE_MAPS_API_KEY` | Production, Preview, Development | Yes | Public browser key. Do not commit the value. |
| `VITE_GOOGLE_MAP_ID` or `VITE_GOOGLE_MAPS_MAP_ID` | Production, Preview, Development | Recommended | Needed for Advanced Markers/map styling. |
| `GOOGLE_MAPS_API_KEY` | Server-only, if server enrichment is used | Optional for map canvas | Used by server-side Places tooling, not the browser map loader. |

## Google Cloud restrictions to confirm

Allowed referrers should include:

```text
http://127.0.0.1:5173/*
http://localhost:5173/*
https://base-44-h2iq.vercel.app/*
https://base-44-h2iq-meg-dude.vercel.app/*
https://base-44-h2iq-megdude-meg-dude.vercel.app/*
approved base-44-h2iq preview deployment URLs
future approved app domain
```

APIs to confirm:

```text
Maps JavaScript API
Places API if search/enrichment calls require it
Map ID configured for JavaScript map if Advanced Markers are used
Billing enabled
```

## Do not do

- Do not commit API keys.
- Do not use an unrestricted browser key.
- Do not deploy BASE44 work to `base-build26`, `downtown-perks-backend`, or `base-44-downtown-perks-live`.
- Do not hide Google attribution or legal controls.
- Do not replace the working local map engine with an older deployment.
