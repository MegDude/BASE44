# Downtown Perks / BASE44 Codex Notes

Work token-light by default.

- Start with the exact route, file, branch, port, or deployment named by the user.
- Prefer targeted `rg`, `git diff -- <file>`, and small browser checks over whole-repo or whole-dataset reads.
- Cap command output with narrow file lists, line ranges, and summarized Playwright results.
- Do not load all map inventory, all media, all prior deployments, or all related repos unless the task explicitly asks for a full audit.
- For map and panel regressions, verify one or two representative routes first, then patch the shared source pattern.
- Preserve unrelated dirty files. Stage and commit only files intentionally changed for the current task.
- For deployment requests, verify branch, clean/dirty state, build result, and the canonical URL separately before reporting success.

## SEO Snapshot Product Language

For Legends reporting surfaces, use **SEO Snapshot** as the screen and product name. Do not title the screen “Luxury Presence SEO snapshot” or write the drawer as if Luxury Presence is the user-facing feature.

Luxury Presence may appear only as source attribution, for example “Source: Luxury Presence reporting dashboard,” or in integration/source-status copy. The report itself should answer:

- what changed in search demand;
- why it matters for Downtown Austin listings, pages, campaigns, and map content;
- what each role does next.

The role reads are:

- Owner — executive read: approve the next page, campaign, or listing priority.
- Marketing — campaign read: turn high-intent searches into map-visible campaigns, offers, and routes.
- Content and SEO — keyword read: update the page, listing, guide, schema, or internal links tied to the priority term.
- Workspace manager — operating read: assign the update and keep map/reporting status current.

Keep the UI language plain and operational. Avoid backend-first phrases such as “fully reconciled,” “visible rows only,” or “integration status” unless the task is specifically about data plumbing.

## Repository Synchronization Contract

BASE44 and the Downtown Perks Backend Platform share the product, but they are separate bounded contexts.

BASE44 owns the resident-facing map application and UI: map shell, drawers, search, pins, clusters, routes, districts, filters, resident card UI, event and perk UI, property UI, mobile UX, animations, typography, imagery, rails, design system, presentation logic, loading states, accessibility, and frontend routing.

The Backend Platform owns APIs, database, authentication, RBAC, CRM, billing, Stripe, workspace, reports, campaign engine, QR engine, AI orchestration, surveys, notifications, media storage, persistence, jobs, integrations, and analytics.

When working in BASE44, only migrate UI, UX, design system, copy, image, rail, accessibility, frontend routing, search/filter UX, and map interaction improvements. Do not migrate backend services, workspace code, admin UI, CRM, Stripe, authentication implementations, database models, server utilities, environment configuration, backend middleware, worker queues, reporting engines, or AI providers.

When syncing Backend Platform work into BASE44, only bring API contracts, entity fields, response schemas, action endpoint expectations, validation expectations, and routing metadata. Do not copy workspace implementation, admin implementation, billing implementation, server utilities, middleware, or persistence implementation.

BASE44 never implements duplicate persistence. If backend functionality is missing, use the existing API contract and show a graceful map-safe state. Shared actions are split intentionally: BASE44 owns the button, drawer, and interaction; the Backend Platform owns mutation, validation, storage, and analytics.

Before copying code between repositories, classify it as presentation, business logic, persistence, animation, or infrastructure. Only migrate code appropriate to the destination repository. When uncertain, prefer sharing contracts and APIs instead of copying implementation.
