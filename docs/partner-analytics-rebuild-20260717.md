# Partner Analytics rebuild — 2026-07-17

## Canonical decision

`/partner-workspace/overview` remains the operational home. `/partner-workspace/analytics` is the focused decision-support surface. BASE44 owns presentation and URL state; the Backend Platform remains responsible for authorization, workspace-scoped queries, persistence, and generated reports.

## Audit and reuse decisions

| Area | Previous state | Decision |
| --- | --- | --- |
| Workspace context | Existing authenticated shell | Reused; compact controls only |
| Analytics route | Launch totals, onboarding targets, review tasks | Replaced |
| KPI concepts | Reusable cards plus hardcoded route values | Rebuilt with definitions and explicit fixture state |
| Funnel | Primitive not connected to route | Rebuilt as sequential conversion stages |
| Places/geography | Canonical entity ownership and map routes | Reused for rows and deep links |
| Attribution | Existing source primitive | Expanded into a dedicated view |
| Reports/export | Route existed; exports were descriptive | Linked to Reports; added working CSV snapshot |
| Overview | Static civic analytics and fake recent activity | Removed; replaced with concise Analytics handoff |

## Stable URL contract

Supported state: `workspace`, `range`, `comparison`, and `view`. Views: `overview`, `audience`, `places`, `campaigns`, `activity`, `sources`, `geography`, and `reports`.

## Metric dictionary

| Metric | Definition |
| --- | --- |
| Experience open | Opening of a published experience |
| Listing view | Listing detail successfully rendered |
| Save | Intentional save of a place, offer, or event |
| Directions | Directions action initiated from Downtown Perks |
| Verified visit | Visit confirmed through an approved validation method |
| Redemption | Offer validation completed successfully |
| Event RSVP | Completed RSVP associated with the workspace |
| Repeat engagement | Defined action completed in separate sessions |

## Query-service contract

The backend should aggregate canonical analytics events by authenticated `workspaceId`, time range, timezone, comparison period, entity, campaign, offer, event, source, and district. Workspace isolation is mandatory: a valid user in Workspace A must receive no data from Workspace B even if its identifiers are inserted into URLs or requests.

## Known limitations

- The restored frontend has no canonical aggregate analytics client yet.
- Visible values are deterministic fixtures tied only to organizations marked `is_demo`; the UI labels them as demo data.
- Server-side isolation, permissions, entitlements, survey aggregation, PDF/XLSX, and production report generation remain backend work.
- Managed network policy blocked browser screenshot and interaction QA. Lint, typecheck, local build, contract test, and Cloudflare build completed successfully.

## Rollback

Production was not changed. Close the PR and delete the feature branch to abandon the preview. If merged later, use a normal revert commit; do not force-push or reset main.
