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

It writes:

```text
inventory/generated/partner-app-pages.csv
inventory/generated/entity-content-register.csv
inventory/generated/relationship-matrix.csv
inventory/generated/content-inventory.json
inventory/generated/inventory-metadata.json
```

## Environment

Source-only generation requires no secrets.

Database-backed generation supports:

```text
VITE_SUPABASE_URL or SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

The anon key is supported as a fallback, but Row Level Security may prevent a complete administrative inventory. CI should use a protected service-role secret only in trusted workflows. Never expose the service-role value to Vite or browser code.

Optional:

```text
DP_CANONICAL_BASE_URL=https://base-44-h2iq.vercel.app
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

Recommended sheets:

- Dashboard
- Partner App Pages
- Entity Content Register
- Relationship Matrix
- Copy & Link Register
- SEO AI Search Index
- Codex Audit Instructions

The generated JSON should also back the future admin content index so the workbook, CI checks, and admin UI reconcile to the same records.
