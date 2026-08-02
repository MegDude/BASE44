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
