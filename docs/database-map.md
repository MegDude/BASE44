# Database Map

## Current Stores

| Store | Role | Risk |
| --- | --- | --- |
| 3014 JSON operational store | local backend persistence and simulation | not production durable |
| Base44 entity store | legacy product and workspace reads/writes | duplicate operational state |
| Product serverless/Supabase handlers | contact, campaign requests, proxy endpoints | partial isolated workflows |
| Static product registries | map pins, copy, supplemental entities | useful seed layer, not source of truth |

## Required Canonical Tables

- organizations
- workspaces
- users
- roles
- permissions
- partners
- properties
- buildings
- residents
- map_entities
- perks
- perk_redemptions
- events
- event_rsvps
- campaigns
- qr_codes
- qr_scans
- analytics_events
- audit_events
- reports
- automations
- notifications
- conversations
- subscriptions
- invoices
- media_assets

## Relationship Rules

- One map entity references one canonical domain record.
- One partner may own many locations, perks, events, campaigns, reports, and QR codes.
- One resident action may update saved state, analytics, recommendations, and reports.
- One campaign may attach to partners, properties, buildings, perks, events, QR, and analytics.
- AI conversations reference user, organization, mode, entity context, tool calls, and audit.

## Required Remediation

1. Promote 3014 from JSON store to durable DB-backed repositories.
2. Add indexes for map lookup, tenant lookup, campaign/report queries, and analytics time windows.
3. Add constraints for tenant isolation and entity uniqueness.
4. Create migrations and seed scripts.
5. Migrate Base44/static records into canonical operational tables.
