# Resident and Partner Reconciliation Plan

Date: 2026-07-16
Branch: `codex/reconcile-resident-partner-20260716`
Base: `main`

## Source hierarchy

1. GitHub `main` is the canonical committed baseline.
2. `/Users/megdude/Downloads/BASE44 2` is the source for valid uncommitted local resident and partner changes.
3. Ready BASE44 deployments are runtime and visual references, not code sources.
4. `/Users/megdude/Documents/NINA UPDATE` defines journey, IA, signup, pricing and role decisions.
5. Marketing and backend projects remain separate products and must not be merged wholesale.

## Required migration order

1. Record the local worktree status, diff and untracked-file inventory.
2. Back up tracked, staged and untracked local changes.
3. Compare local files against this reconciliation branch.
4. Classify each change as keep-main, copy-local, port-partial, rewrite, delete-duplicate, config-only or exclude.
5. Repair Google Maps preview configuration using the working local BASE44 implementation.
6. Reconcile resident map, Events Nearby, shared sheet state, Resident Home and Card.
7. Reconcile partner map, resident preview, registration, pricing, checkout and provisioning.
8. Normalize route ownership, pricing, entitlements, data IDs and environment variables.
9. Run resident and partner regression tests at 393×852 and desktop sizes.
10. Deploy this branch to the `base-44-h2iq` preview project and compare local versus preview behavior.
11. Open a PR into `main`; do not force-push or overwrite `main`.

## Non-negotiable rules

- Do not copy deployment bundles into source.
- Do not merge `base-build26` or `downtown-perks-backend` into BASE44.
- Do not discard the dirty local worktree.
- Do not duplicate commits already contained in `main`.
- Do not create a second mobile sheet engine.
- Preserve the working local Google canvas, canonical data, pins, routes, perks, events and actions.
- Preserve distinct resident and partner intent.

## First vertical slice

`Events Nearby` resident map → correct event data → shared Browse/Detail sheet → partner-managed event preview → verified Google canvas in preview deployment.

## Required local evidence

The following must be generated from `/Users/megdude/Downloads/BASE44 2` before code migration:

- `git status --short`
- `git rev-parse HEAD`
- `git diff --name-status`
- `git diff --stat`
- `git ls-files --others --exclude-standard`
- tracked working-tree patch
- staged patch
- untracked-file inventory

## Acceptance gate

No migration is complete until every local changed and untracked file is classified, resident and partner regression tests pass, the preview matches local behavior, and the work enters `main` through a reviewable pull request.
