# App backend dependency matrix

## Canonical environment boundary

| Name | Boundary | Purpose |
| --- | --- | --- |
| `VITE_APP_ENV` | Public build | Production-like UI guard |
| `VITE_SUPABASE_URL` | Public build | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public build | Preferred browser auth key |
| `VITE_SUPABASE_ANON_KEY` | Public build | Legacy browser auth-key fallback |
| `VITE_GOOGLE_MAPS_API_KEY` | Public build | HTTP-referrer-restricted Maps key |
| `VITE_GOOGLE_MAP_ID` | Public build | Canonical map style ID |
| `VITE_GOOGLE_MAPS_MAP_ID` | Public build | Legacy map-ID alias |
| `VITE_GOOGLE_PLACES_ENABLED` | Public build | Public map feature flag |
| `VITE_GOOGLE_GEOCODER` | Public build | Public map feature flag |
| `VITE_FORCE_LIVE_WORKSPACES` | Public build | QA-only live workspace enforcement; do not set in production unless approved |
| `VITE_IMAGE_RESOLVER_WARNINGS` | Public build | Development diagnostics |
| `BACKEND_ORIGIN` | Worker-only | Fixed Backend Platform origin; not client supplied |
| `APP_ORIGINS` | Worker-only | Exact comma-separated credentialed CORS allowlist |
| `ASSETS` | Worker binding | Built `dist` static assets |

All `process.env` names used by `api/`, `src/server/`, database, billing, email, SMS, Google Sheets, AI, Supabase service-role, audit, redemption, and webhook code belong to the Backend Platform runtime, not this app Worker. Examples include `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY`, `TWILIO_*`, `GOOGLE_SHEETS_PRIVATE_KEY`, `LUXURY_PRESENCE_API_KEY`, webhook/signing secrets, and audit salts. None may use `VITE_`.

## Proxy contract

The Worker preserves method, query, streaming request body, `Authorization`, necessary cookies, conditional/range headers, and selected content negotiation headers. It streams the backend response, preserves accurate status/body and selected protocol headers, rewrites only same-backend redirect locations to the app host, and blocks credentialed CORS from unlisted origins. It is not an open proxy because the target always derives from Worker-owned `BACKEND_ORIGIN`.

WebSocket upgrades return explicit `501 WEBSOCKET_NOT_SUPPORTED`; real-time transport requires a dedicated Backend Platform service binding or separately reviewed WebSocket origin. Ordinary streaming responses remain supported.
