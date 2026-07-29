# Downtown Perks production backend baseline

Captured read-only on 2026-07-29 before any v2 feature flags, schema changes, imports, seed operations, or production data mutations.

## Release identity

| Signal | Value |
| --- | --- |
| Repository | `MegDude/BASE44` |
| Production commit | `70f34413a0adaa83d5709dc1d5c2cedb9ea300ec` |
| Vercel project | `base-44-downtown-perks-live` |
| Production deployment | `dpl_7da8saK2e84EVa9o9AoqnPPhUfDR` |
| Deployment state | `READY` |
| Canonical alias | `base-44-downtown-perks-live-meg-dude.vercel.app` |
| Supabase project reference | `zubqpvyfklnbxlufhhfq` |

The live Admin scope endpoint returns `401 AUTH_REQUIRED` without a bearer session and now applies `Cache-Control: private, no-store`.

## Repository inventory

| Inventory | Count |
| --- | ---: |
| Application routes | 203 |
| Server API files | 45 |
| SQL migration files | 14 |
| Canonical map entities | 1,473 |
| Canonical map pins | 1,473 |
| Repository perks | 9 |
| Repository events | 14 |
| Repository campaigns | 25 |
| Inventory orphans | 0 |
| Inventory duplicates | 0 |
| Inventory broken links | 0 |

Repository inventory is not a substitute for live database inventory. The map currently contains significantly more generated/canonical content than the corresponding database tables.

## Live production record baseline

Checksums are MD5 digests calculated inside Postgres over deterministically ordered JSON row representations. No row content or PII was returned.

| Table | Rows | Record checksum | Schema checksum |
| --- | ---: | --- | --- |
| `analytics_signals` | 12,929 | `28d629123f8979ad554ca4ea86960773` | `7e231fae0a28cb7e7a6c1be9f70da8ae` |
| `events` | 0 | `d41d8cd98f00b204e9800998ecf8427e` | `0d35cd75dd49b21705ab5100aec0257b` |
| `partner_audit_events` | 2 | `9eb70d6aafc8ed313fdf5985f8b11918` | `67c8034b781bf14ad746c8b5804a8ab2` |
| `partner_experiences` | 0 | `d41d8cd98f00b204e9800998ecf8427e` | `bba93814a8c8b4203ac6889698433d72` |
| `partner_listings` | 62 | `0f92a5936e96414eb41c5572b4c3e719` | `bd0475f2d93fe38c585bedf8c35672c7` |
| `partner_organizations` | 3 | `7067b3fcd7a4bdf7c102b425a9e5e4f0` | `a4af17e5df4cd36c58d4f62568976e5a` |
| `partner_portfolios` | 2 | `3d83ef58e5a6112cfdf03a143a073b9c` | `8f5aa8768ec058e306cb4c75bcee8ba9` |
| `partner_registrations` | 0 | `d41d8cd98f00b204e9800998ecf8427e` | `3967d280244df5a8459b86704acbebb5` |
| `partner_user_listing_access` | 2 | `23537db10f61d7bfb74358661d3aac63` | `e6c2345ad837d5109db462d3a856a3d4` |
| `partner_users` | 5 | `36cf05a47562f1a067094ba101d04328` | `39e38c629577016c56287a84f14f1409` |
| `perk_redemptions` | 0 | `d41d8cd98f00b204e9800998ecf8427e` | `363fd3ba419d1c2448023f74af513211` |
| `perks` | 0 | `d41d8cd98f00b204e9800998ecf8427e` | `800ad62b28da14bfee8d33d81b1e65a3` |
| `platform_audit_events` | 0 | `d41d8cd98f00b204e9800998ecf8427e` | `bb0cdabb749e5b6e8b9168b42505b4c0` |
| `platform_profiles` | 6 | `9a8cfc3f4151b2454b6bd01965208456` | `79341e84788a5251153ff1c3a841ede7` |
| `resident_memberships` | 1 | `7cd9668b1648e39710d9862b255cde75` | `cef3658300d640144042eba1d8f873d3` |
| `resident_onboarding_profiles` | 5 | `cfa55ae4d9d7f069ef82c27edb753936` | `02960e4b269d0ddf155a97d5b8c6ca31` |
| `resident_profiles` | 6 | `f98b35fbbb61e8ba211b61e5b26a0763` | `e6240046deea19d3097f07cd676adbf1` |
| `resident_saved_entities` | 0 | `d41d8cd98f00b204e9800998ecf8427e` | `14b1f0276b9d89211d629b75a5562c1e` |

## Feature-flag baseline

None of the required additive flags is implemented:

- `resident_access_v2`
- `redemption_v2`
- `rsvp_v2`
- `survey_pipeline_v2`
- `broadcast_delivery_v2`
- `partner_reporting_v2`
- `imports_v2`

No v2 service may be enabled until its contract, authorization, idempotency, audit, shadow comparison, and rollback tests pass.

## Server API gap baseline

Of the required canonical domain contracts, only the general `/api/events` file exists under the requested route naming. The following explicit protected contracts are absent:

- `/api/auth/session`
- `/api/organizations`
- `/api/organization-memberships`
- `/api/resident-profiles`
- `/api/building-access`
- `/api/partners`
- `/api/partner-memberships`
- `/api/perks`
- `/api/redemptions/issue`
- `/api/redemptions/verify`
- `/api/events/rsvp`
- `/api/events/cancel-rsvp`
- `/api/surveys`
- `/api/survey-responses`
- `/api/broadcasts`
- `/api/announcements`
- `/api/reports`
- `/api/exports`
- `/api/imports/validate`
- `/api/imports/execute`
- `/api/admin/accounts`
- `/api/audit-events`

Existing adjacent handlers, including resident-card, partner redemption, published-content, survey helper, and analytics handlers, require contract-level review before they can be counted as replacements.

## Demo and seed boundary

- No executable seed-named API route was detected.
- No `seedDemoData` or `/seed-demo` production handler was detected.
- Legacy demo QR implementations remain in `src/pages/Map.jsx` and `src/pages/downtown-perks/PerksCard.jsx`.
- The legacy QR UI must not be described as a production redemption service until it is replaced by the authenticated, short-lived, single-use transaction.

## Security posture

All 52 listed public tables have RLS enabled. The Supabase security advisor still reports:

- leaked-password protection disabled;
- RLS enabled with no policies on `admin_notification_recipients`, `analytics_signals`, `checkout_records`, `events`, `partner_workspace_provisioning`, `pending_resident_registrations`, `resident_signup_events`, and `stripe_events`.

An RLS-enabled table with no policy is closed to normal Data API roles, but the lack of explicit policies must be intentional and documented. Do not add broad `authenticated` policies as a shortcut.

References:

- [RLS enabled with no policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)
- [Password strength and leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

## Performance posture

The advisor reports two unindexed foreign keys:

- `checkout_records_partner_id_fkey`
- `partner_workspace_provisioning_activated_by_user_id_fkey`

It also reports one duplicate index pair on `resident_signup_events` and multiple permissive SELECT policies across several governance and resident tables. These are review items, not authorization to drop indexes or rewrite policies without query evidence.

References:

- [Unindexed foreign keys](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys)
- [Multiple permissive policies](https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies)
- [Duplicate indexes](https://supabase.com/docs/guides/database/database-linter?lint=0009_duplicate_index)

## Domain disposition

| Domain | Current evidence | Release status | Next controlled phase |
| --- | --- | --- | --- |
| Resident access | 6 profiles, 1 membership, 5 onboarding profiles | Partial | `resident_access_v2` |
| Redemption | QR/session handlers exist; 0 durable redemptions | Blocked | `redemption_v2` |
| Events | UI inventory has 14 events; database has 0 | Not reconciled | `rsvp_v2` |
| Surveys | Helper and migration code exists; no canonical protected endpoints | Partial | `survey_pipeline_v2` |
| Broadcasts | Workspace surfaces exist; no canonical delivery endpoint | Blocked | `broadcast_delivery_v2` |
| Reporting | 12,929 analytics signals; no canonical scoped report/export API | Partial | `partner_reporting_v2` |
| Imports | Import scripts exist; no staged validate/execute service | Blocked | `imports_v2` |

## Release decision

Do not enable a backend domain globally. The next implementation PR should add the feature-flag registry and shared server authorization/idempotency/audit primitives only. It must not migrate data or change current reads. The first domain pilot should be resident access or RSVP after negative cross-organization tests pass.
