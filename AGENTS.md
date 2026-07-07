# Downtown Perks / BASE44 Codex Notes

Work token-light by default.

- Start with the exact route, file, branch, port, or deployment named by the user.
- Prefer targeted `rg`, `git diff -- <file>`, and small browser checks over whole-repo or whole-dataset reads.
- Cap command output with narrow file lists, line ranges, and summarized Playwright results.
- Do not load all map inventory, all media, all prior deployments, or all related repos unless the task explicitly asks for a full audit.
- For map and panel regressions, verify one or two representative routes first, then patch the shared source pattern.
- Preserve unrelated dirty files. Stage and commit only files intentionally changed for the current task.
- For deployment requests, verify branch, clean/dirty state, build result, and the canonical URL separately before reporting success.

## Repository Synchronization Contract

BASE44 and the Downtown Perks Backend Platform share the product, but they are separate bounded contexts.

BASE44 owns the resident-facing map application and UI: map shell, drawers, search, pins, clusters, routes, districts, filters, resident card UI, event and perk UI, property UI, mobile UX, animations, typography, imagery, rails, design system, presentation logic, loading states, accessibility, and frontend routing.

The Backend Platform owns APIs, database, authentication, RBAC, CRM, billing, Stripe, workspace, reports, campaign engine, QR engine, AI orchestration, surveys, notifications, media storage, persistence, jobs, integrations, and analytics.

When working in BASE44, only migrate UI, UX, design system, copy, image, rail, accessibility, frontend routing, search/filter UX, and map interaction improvements. Do not migrate backend services, workspace code, admin UI, CRM, Stripe, authentication implementations, database models, server utilities, environment configuration, backend middleware, worker queues, reporting engines, or AI providers.

When syncing Backend Platform work into BASE44, only bring API contracts, entity fields, response schemas, action endpoint expectations, validation expectations, and routing metadata. Do not copy workspace implementation, admin implementation, billing implementation, server utilities, middleware, or persistence implementation.

BASE44 never implements duplicate persistence. If backend functionality is missing, use the existing API contract and show a graceful map-safe state. Shared actions are split intentionally: BASE44 owns the button, drawer, and interaction; the Backend Platform owns mutation, validation, storage, and analytics.

Before copying code between repositories, classify it as presentation, business logic, persistence, animation, or infrastructure. Only migrate code appropriate to the destination repository. When uncertain, prefer sharing contracts and APIs instead of copying implementation.
