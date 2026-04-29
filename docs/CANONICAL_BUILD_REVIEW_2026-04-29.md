# Canonical Build Review — 2026-04-29

## Reviewed surfaces

- Root Vite app in `/Users/megdude/BASE44`
- Local standalone Next app in `/Users/megdude/BASE44/downtown-perks-platform`
- Local preview target previously observed on `http://127.0.0.1:4176`

## Findings

1. The root Vite app was the active repo mainline, but it had unresolved merge conflicts in:
   - `src/App.jsx`
   - `src/pages/Map.jsx`
   - `src/pages/downtown-perks/ExploreRebuilt.jsx`
   - `api/places.js`
2. The port `4176` preview was not a stable source of truth. It was only a local runtime snapshot and was unavailable during repeat checks.
3. The standalone Next app built successfully when allowed to reach external font assets and its own toolchain dependencies. It remains a valid reference implementation, but it is not the canonical app root for this repository.

## Canonical main version

The canonical main version for this repository is the root Vite app in `/Users/megdude/BASE44`.

Reasoning:

- It matches the current repo deployment workflow in `docs/DEPLOYMENT_WORKFLOW.md`
- It contains the active route inventory, partner pages, map shell, building intelligence system, and the current uncommitted local work
- It is the only version that can safely absorb the current dirty worktree without splitting work across two app roots

## Archived alternatives

The following should be treated as archived reference builds unless intentionally revived:

- `downtown-perks-platform/`
  - Status: archived reference implementation
  - Use only for feature comparison, content recovery, or migration ideas
- `http://127.0.0.1:4176`
  - Status: transient local preview only
  - Not a durable source of truth

## Consolidation completed in this pass

- Restored the root router as one clean superset route tree
- Preserved both primary and legacy Downtown Perks routes inside the root app
- Folded archive-backed and Google-backed map search behavior into one `api/places` handler
- Reduced `/map` to the rebuilt unified explore surface to avoid duplicate map implementations

## Follow-up

- Keep shipping from the root Vite app
- Do not treat `downtown-perks-platform/` as an active deployment root unless the repository is deliberately restructured around it
