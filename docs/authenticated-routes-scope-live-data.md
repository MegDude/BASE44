# Authenticated Routes, Super-Admin Recovery, Live Data, and Production Repair

This document captures the platform repair contract for authenticated Downtown Perks routes. It is not a substitute for backend-owned authorization, payment, publishing, QR, or activity persistence.

## Route authorization contract

Every protected route and API request resolves through the backend before protected data is rendered:

```text
request
→ authenticated session
→ verified email where required
→ server-resolved profile and roles
→ active subscription or entitlement where required
→ authorized organization, portfolio, or listing scope
→ render or return the authorized result
```

The browser may preserve `returnTo` and requested scope. It never grants access.

Do not authorize from:

- client-side email comparisons;
- browser storage;
- fake admin users;
- static demo workspace state;
- generic dashboard fallbacks;
- scope values that have not been validated by the backend.

## Route matrix

| Route group | Required authorization |
| --- | --- |
| `/sign-in`, `/create-account`, `/forgot-password`, `/reset-password` | Public; role-based route after completion |
| `/accept-invite` | Public until verified; valid unexpired invitation required |
| `/complete-profile` | Authenticated user can complete only their own profile |
| `/choose-plan`, `/checkout` | Authenticated eligible account/product only |
| `/resident/*` | Active resident membership or permitted guest view |
| `/partner-workspace/*` | Partner membership plus authorized organization/portfolio/listing scope |
| `/admin`, `/admin/*` | `super_admin`, `platform_admin`, or authorized `org_admin` only |
| `/api/admin/*` | Server-side admin permission check |
| `/api/workspace/*` | Membership, entitlement, and scope check |
| `/api/experiences/*` | Publish/manage entitlement plus scope check |
| `/api/payments/*` | Correct actor or verified provider signature |

Unauthorized results:

- no session → `/sign-in?returnTo=<safe-internal-path>`;
- insufficient role → 403, with no redirect to another organization;
- invalid scope → normalize to nearest valid parent scope;
- unauthorized API scope → 403;
- incomplete profile → `/complete-profile?returnTo=<safe-path>`;
- payment pending → plan or checkout state;
- loading → explicit loading, never false unavailable access.

`returnTo` accepts internal Downtown Perks paths only.

## Admin scope contract

`GET /api/admin/scope` returns a server-resolved scope. It must never return a fake empty scope for unauthorized users.

For super admins, default scope is platform:

```json
{
  "access": "platform",
  "activeScope": {
    "level": "platform",
    "organizationId": null,
    "portfolioId": null,
    "listingId": null,
    "label": "All Downtown Perks"
  }
}
```

The production defect found on 2026-08-02 was caused by selecting `partner_listings.address`, which is not present in the deployed table. The API must select only columns that exist or guard schema-dependent fields behind a backend contract.

## Password recovery contract

Password sign-in and recovery must be implemented by the canonical backend auth provider:

- `/sign-in` and `/partners/sign-in` must expose password-capable access when provider support is available.
- `Forgot password?` opens `/reset-password` or `/forgot-password` and submits to the provider.
- Reset links are single-use, short-lived, provider-issued, and redirect to `https://app.downtownperks.com/reset-password`.
- Completing reset revokes old sessions and routes by server-resolved role.
- `me@megdude.com` must recover to server-resolved `super_admin` and route to `/admin`.
- Recovery events are audit logged without tokens, passwords, or credentials.
- The confirmation copy must not reveal account existence: `If an account matches this email, we’ve sent a secure reset link.`

## Live data rules

- Do not display fabricated counts, static activity trends, borrowed organization records, fake People data, or placeholder intelligence.
- Workspace activity must come from `GET /api/workspace/activity` or show a scoped empty/error state.
- Publishing actions require authenticated, scoped, idempotent backend endpoints before enabled in production.
- Payment or plan access activates only after verified provider webhook processing.
