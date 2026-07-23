# Authentication Routing Reconciliation

## Objective

Reconcile partner authentication without replacing the current production auth context or merging stale branches wholesale.

## Scope

1. Preserve current Supabase resident password, registration, confirmation, Google, Apple, and magic-link flows.
2. Reuse the existing `authReturnPath` safety utilities for local-only return routing.
3. Add partner password sign-in as an additive method.
4. Preserve partner magic-link sign-in and all current account-type routing.
5. Preserve super-admin role hydration and organization switching.
6. Keep the production alias untouched until preview validation passes.

## Required validation before merge

- `npm run typecheck`
- `npm run lint`
- `npm run test:first-party-auth`
- `npm run test:platform-integration`
- `npm run build`
- Preview QA for `/partners/sign-in`
- Verify magic-link and password modes
- Verify invalid `returnTo` values cannot leave the origin
- Verify resident access still routes to the resident map
- Verify partner access still routes to `/partner-workspace/overview`
- Verify super-admin sessions remain on the account selector

## Change rule

Do not copy the older auth file from PR #77. Extract only the safe-return and partner-password behavior into the current `main` implementation so later resident authentication, role normalization, and logout routing are retained.
