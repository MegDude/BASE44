# Downtown Perks generated content inventory

This directory is the machine-generated source for the partner app content workbook and the future `/admin/content-index` surface.

## Generate

```bash
npm run inventory:partner-content
```

The generator reads:

- React routes from `src/App.jsx` and `src/main.jsx`
- Canonical source registries under `src/content`, `src/data`, `src/config`, `src/pages`, and `src/components`
- Canonical Supabase tables when the required environment variables are available

It writes the complete normalized register set:

```text
inventory/generated/partner-app-pages.csv
inventory/generated/entity-content-register.csv
inventory/generated/relationship-matrix.csv
inventory/generated/copy-link-register.csv
inventory/generated/seo-ai-search-index.csv
inventory/generated/routes-and-collections.csv
inventory/generated/perks-and-events.csv
inventory/generated/campaign-register.csv
inventory/generated/workspace-register.csv
inventory/generated/map-layer-register.csv
inventory/generated/media-register.csv
inventory/generated/redirect-register.csv
inventory/generated/content-inventory.json
inventory/generated/inventory-metadata.json
inventory/generated/inventory-summary.md
inventory/generated/inventory-errors.json
inventory/generated/orphan-report.csv
inventory/generated/duplicate-report.csv
inventory/generated/broken-links.csv
```

## Environment

Source-only generation requires no secrets.

Database-backed generation supports:

```text
VITE_SUPABASE_URL or SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Database joins require a protected service-role key and are skipped when it is unavailable. The generator never falls back to a browser key for an administrative export. CI may use a protected service-role secret only in a trusted workflow. Never expose the service-role value to Vite, browser code, logs, or generated files.

Optional:

```text
DP_CANONICAL_BASE_URL=https://base-44-downtown-perks-live.vercel.app
```

## Quality gates

The generated inventory is designed to enforce these rules:

1. `filter=All` must not permit an unrestricted map query.
2. Every published entity needs a valid resident map link.
3. Every workspace-owned entity needs an authorised partner editor and report link.
4. Every searchable object needs embedding text, synonyms, and agent tags.
5. Every indexable page needs a unique title, meta description, canonical URL, and schema decision.
6. Every relationship must reference canonical immutable IDs.
7. Redirects and aliases must preserve search, hash, and `returnTo` state where applicable.
8. The spreadsheet is a reporting/export surface, not a second source of truth.

## Workbook workflow

The XLSX workbook should be built from these generated CSV/JSON files. Do not manually re-key routes or entities into the spreadsheet.

Required sheets:

- Dashboard
- Partner App Pages
- Entity Content Register
- Workspace Register
- Map Layer Register
- Perks & Events
- Campaign Register
- Routes & Collections
- Relationship Matrix
- Copy & Link Register
- SEO AI Search Index
- Media Register
- Redirect Register
- Quality Gates
- Codex Instructions

The generated JSON backs `/admin/content-index`, so the workbook, CI checks, and admin UI reconcile to the same records.
