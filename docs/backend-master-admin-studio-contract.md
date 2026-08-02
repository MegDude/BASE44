# Backend Master Build — Admin Studio Contract

This document translates the Backend Master Build Directive into the first BASE44-owned implementation boundary.

## Repository boundary

BASE44 owns the frontend shell, routes, presentation, and API contracts consumed by the app. The Backend Platform owns persistence, RBAC, Stripe webhooks, QR validation, reporting, integrations, scheduled jobs, and row-level enforcement.

This phase therefore adds contracts and Admin Studio routing scaffolding only. It does not create production data, fake partners, static dashboards, local role flags, credentials, or duplicate persistence.

## Required backend control plane

Every protected screen must resolve through the backend before loading operational data:

```text
authenticated user
→ verified role
→ organization/building membership
→ portfolio/listing scope where relevant
→ entitlement
→ permitted records
```

## Admin Studio master routes

The control plane contract requires these routes:

```text
/admin
/admin/people
/admin/residents
/admin/partners
/admin/organizations
/admin/buildings
/admin/portfolios
/admin/listings
/admin/map
/admin/offers
/admin/events
/admin/campaigns
/admin/reports
/admin/plans
/admin/add-ons
/admin/payments
/admin/entitlements
/admin/integrations
/admin/provisioning
/admin/audit-log
/admin/support
```

Each route must use server-authorized data. Client-side role checks may only choose loading or empty states; they never grant access.

## Super Admin contract

Meg Dude’s verified account is the platform-wide Super Admin account:

```text
email: me@megdude.com
role: super_admin
scope: platform-wide
entitlements: *
```

This role still requires server authorization and audit logging for every consequential action.

## Partner workspace shell

Every valid partner organization receives the same workspace shell when the backend returns an authorized scope and active entitlement:

```text
/partner-workspace/home
/partner-workspace/map
/partner-workspace/offers
/partner-workspace/events
/partner-workspace/reach
/partner-workspace/updates
/partner-workspace/results
/partner-workspace/reports
/partner-workspace/connections
/partner-workspace/media
/partner-workspace/team
/partner-workspace/settings
```

## Release phases

1. **Foundation:** contracts for identity, roles, organizations, buildings, residents, map entities, memberships, plans, add-ons, entitlements, payments, audit logs, and server authorization.
2. **Isolation:** RLS and server enforcement for resident/building/organization/portfolio/listing scopes.
3. **Provisioning:** 51-partner reconciliation, prebuilt workspaces, The Shore resident reference flow, QR issuance, and webhook-driven entitlements.
4. **Operations:** Admin Studio views for module catalog, entitlements, provisioning, integrations, billing, audit trail, and support.

## Release gates not satisfied by this phase

The following require Backend Platform access and must not be fabricated in BASE44:

- 51-partner reconciliation and workspace provisioning
- Resident roster matching and The Shore resident approval
- Stripe webhook replay/idempotency tests
- Unique revocable QR issuance and redemption validation
- Cross-organization database isolation tests against production-like data
- Super Admin operational actions with persisted audit logs
- Production migrations and credential-backed integrations

## Platform Authentication, Password Reset, and Super-Admin Recovery

Password sign-in, password reset, and secure recovery are first-class platform requirements. This section is a contract for the Backend Platform and auth provider integration; it does not implement live authentication behavior in BASE44.

### Required login paths

| Path | Contract requirement |
| --- | --- |
| Email + password | Available at `/partners/sign-in` and shared platform sign-in entry points. |
| Password reset | A visible `Forgot password?` link opens `/reset-password`. |
| Magic link | May remain available as a secondary convenience method, not the only recovery route. |
| Authenticated password change | Available in Admin → Account & security, requiring current password or a recent verified session. |
| Super-admin recovery | `me@megdude.com` can request a reset email and, after completion, is routed to `/admin`. |
| Support-safe fallback | Delivery failures show retry copy and record the event without exposing account existence or role details. |

### Password reset flow

```text
Forgot password
→ enter email
→ send one-time provider reset link
→ verified reset page
→ set new password
→ invalidate old sessions
→ sign in
→ server-resolved role routes super_admin to /admin
```

Rules:

1. Submit reset requests to the canonical backend auth provider; never create a frontend-only reset flow.
2. Use single-use, short-lived, provider-issued reset links.
3. Reset links redirect only to approved callback URLs, including `https://app.downtownperks.com/reset-password` and approved preview callbacks.
4. The reset page validates password strength, updates through the provider's verified flow, and revokes old refresh sessions.
5. Post-reset routing is based on server-resolved role only:
   - `super_admin` → `/admin`
   - `platform_admin` / `org_admin` → authorized admin or workspace route
   - partner / resident → their authorized home surface
6. Reset request confirmation must not reveal account existence. Use: `If an account matches this email, we’ve sent a secure reset link.`

### Super-admin recovery requirements

- `me@megdude.com` must resolve as `super_admin` from the server-side profile or membership record on every authenticated request.
- Browser email allowlists and client role flags must never grant Admin access.
- The auth provider email must be verified and linked to a backend `super_admin` authorization record.
- Super-admin access must survive password reset, magic-link sign-in, session refresh, direct `/admin` navigation, and mobile sign-in.
- Audit events must record reset requested, reset completed, sessions revoked, sign-in success, and sign-in failure. Never log reset tokens, passwords, or credentials.
- A protected admin test must sign in as the super-admin test account, verify `/admin` access, and confirm authorized scopes load from the backend.

### Security requirements

| Requirement | Contract requirement |
| --- | --- |
| Password handling | Never place passwords, reset tokens, or credentials in source, browser storage, analytics, logs, PR descriptions, or support notes. |
| Reset token | Single-use, short-lived, provider-issued, and invalid after completion. |
| Redirect safety | Allow-list production and approved preview callback URLs only. |
| Rate limits | Rate-limit sign-in and reset requests by IP and account identifier. |
| Session revocation | Revoke existing sessions after a completed password reset. |
| Authorization | Password recovery restores account access; it never grants or changes roles. |
| Auditability | Record outcome and timestamp without secrets or sensitive reset details. |

### Required user-facing copy

- Sign-in title: `Sign in to Downtown Perks`
- Password reset action: `Forgot password?`
- Reset title: `Set a new password`
- Reset support copy: `Use a password you have not used here before.`
- Completion: `Password updated. Sign in to continue.`
- Admin destination: `Continue to Admin →`

### Acceptance criteria for the future auth implementation

- Password sign-in works on production for the super-admin account.
- `Forgot password?` is present and functional across platform sign-in routes.
- A reset email reaches the verified super-admin email and completes on `app.downtownperks.com`.
- Completing reset preserves server-resolved `super_admin` role and lands at `/admin`.
- Existing sessions are revoked after password reset.
- No credentials or reset tokens appear in logs, analytics, source, or client storage.
- Desktop and iPhone 15 flows pass for sign-in, reset request, reset completion, direct `/admin` access, expired links, reused links, and failed delivery states.
