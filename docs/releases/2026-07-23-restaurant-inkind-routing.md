# Restaurant + inKind routing production release

**Release date:** 2026-07-23  
**Application commit:** `fa5959dc786a191e96fcfc8e6d08609360fd325f`  
**Source PR:** #81 — Fix restaurant pins and verified inKind layer routing

## Production contract

- Restaurant is the canonical place identity and retains the knife-and-fork Dining marker.
- Search intent filters and ranks results without redefining the base marker.
- inKind is a verified secondary program layer, not an alias for all restaurants or all perks.
- A verified inKind restaurant appears in both Dining and inKind while keeping its Dining marker.
- Ordinary restaurants and generic restaurant perks do not enter the inKind layer without explicit membership or curated cohort evidence.

## Validation gates

- Generated content inventory: passed
- Map intent regression coverage: passed
- Playwright application suite: passed
- Vercel preview: passed
- Production deployment: triggered from `main`

This release note intentionally contains no secrets, contact data, or environment configuration.
