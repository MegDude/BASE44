# Downtown Perks Governance

Status: canonical foundation package

This directory defines the resident-first Governance experience before database, API, or production UI implementation begins.

## Canonical specification

- [Resident Governance Platform — Volume 2](./resident-governance-platform-v2.md)
- [Foundation gate checklist](./foundation-gate-checklist.md)

## Precedence

When governance instructions conflict, use this order:

1. `resident-governance-platform-v2.md`
2. `docs/downtown-perks-experience-governance.md`
3. `docs/domain-map.md`
4. `docs/entity-relationship-map.md`
5. `docs/map-panel-design-system.md`
6. Earlier meeting notes and implementation drafts

Volume 2 supersedes earlier governance navigation and experience proposals. It does not supersede security, privacy, accessibility, entity-identity, or map-data governance rules.

## Scope boundary

This foundation package authorizes experience and architecture definition only. It does not authorize:

- creating production tables;
- applying Supabase migrations;
- changing production authentication or permissions;
- enabling OpenAI requests;
- ingesting civic feeds;
- publishing surveys, candidate questions, meetings, or board records;
- deploying to production.

Those actions begin only after the foundation gate is approved and the corresponding implementation phase is explicitly authorized.
