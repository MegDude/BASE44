# Resident route decision

Date: 2026-07-16

## Current route ownership

`src/App.jsx` currently defines:

| Route | Current owner | Current purpose |
| ----- | ------------- | --------------- |
| `/` | Redirect | Redirects to resident map default path |
| `/app` | `MapLaunchGate` | App launch gate |
| `/app/map` | `RedirectWithSearch` | Retired compatibility alias; redirects to `/map` |
| `/map` | `MapPage` | Canonical public/resident/partner map route |
| `/onboarding` and `/onboarding/:step` | `ResidentOnboardingFlow` | Resident onboarding |
| `/resident/home` | `ResidentHome` → `DashboardPage` | Resident home/dashboard route |
| `/resident` | No explicit route in current table | Falls through rather than owning a unique resident purpose |

## Decision

Use three distinct resident destinations:

```text
/resident
→ resident entry route: onboarding, resident marketing, or redirect decision

/resident/home
→ authenticated resident launch surface

/map?mode=resident
→ primary discovery map application
```

Do not allow `/resident` and `/resident/home` to become near-identical dashboards.

## Recommended behavior

| User state | `/resident` behavior | `/resident/home` behavior | `/map?mode=resident` behavior |
| ---------- | -------------------- | ------------------------- | ----------------------------- |
| Signed-out, no onboarding state | Begin resident onboarding | Redirect to onboarding or auth-aware entry | Begin onboarding/entry logic before map access if required |
| Signed-out, partial onboarding | Resume onboarding | Resume onboarding or auth gate | Preserve intended map return |
| Authenticated resident, onboarding complete | Redirect to `/resident/home` or map based on source | Open resident home | Open resident map |
| Authenticated resident, incomplete onboarding | Resume first incomplete step | Resume first incomplete step | Resume onboarding before map |
| Partner account | Redirect to partner destination | Do not show resident home | Do not allow resident-only map |
| Explicit guest | Use limited resident map only after explicit guest action | Do not show resident account/card surfaces | Limited map without authenticated perks/card |

## Route-state requirements

The native sheet rebuild should use URL state for stable states only:

```text
mode
tab
filter
collection
query
entityId
routeId
perkId
eventId
sheet=peek|browse|detail
```

Do not place continuous drag position, scroll offsets, or sensitive profile values in the URL.

## Current default warning

`ResidentMobileTabBar` currently links Map to:

```text
/map?mode=resident&tab=map&filter=Featured&collection=downtown-perks-featured
```

Recent route correction restored `/map` to canonical `MapPage`. `/app/map` no longer owns a panel implementation, preventing it from drifting from `/map`; `/resident/home` remains a separate resident dashboard task.
