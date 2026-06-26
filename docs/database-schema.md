# Database Schema Audit

## Current 3014 Entity Layer

The operations service currently uses typed entity arrays in a JSON database. It includes records for buildings, residents, partners, perks, events, campaigns, surveys, messaging, reports, analytics containers, automations, integrations, tenants, workspaces, QR experiences, AI context, notifications, audit logs, and map entity links.

## Required Normalized Entity Rules

Every operational entity should include:

- `id`
- `organization_id` or `tenant_id`
- `workspace_id`
- `status`
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`
- `deleted_at`
- `metadata`

## Gap

The current records use timestamps and IDs, but not every entity consistently includes tenant scope, workspace scope, soft-delete, creator/updater, and metadata. A migration layer is needed before this is production safe.
