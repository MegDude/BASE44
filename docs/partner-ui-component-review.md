# Partner UI component review

## Audit metadata

| Item | Reviewed value |
| --- | --- |
| Production domain | `https://app.downtownperks.com` |
| Hosting target | Cloudflare Workers static assets with a separately deployed Platform API |
| Deployment status | Staging required before production domain attachment |
| Local audited HEAD | `9ac33169b30d1498805c8631d5d46450d004cc39` (`Improve mobile map UI and add guided pricing builder`) |
| Source baseline | `MegDude/BASE44` main |
| API ownership | `MegDude/DOWNTOWN-PERKS-PLATFORM`; no server implementation is duplicated in this UI repository |
| Historical Vercel previews | Non-canonical references retained only as historical context; not a release target |

The live alias was compared with the local audited build. Because the deployment was created from a prebuilt CLI artifact, Vercel does not provide a trustworthy Git commit field for it. No commit-to-deployment claim is inferred from the deployment timestamp.

## Decision model

Each significant surface was classified before editing. `Keep` means no design change; `Polish` means limited visual correction; `Refactor` preserves behavior while repairing layout architecture; `Replace` and `Remove` require evidence of an inappropriate or redundant pattern; `Investigate` means no change until ownership or dependencies are resolved.

## Component inventory and classification

| Route | Component | Classification | Current issue / evidence | Proposed or completed change | Functional dependencies | Risk | Files affected |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/partners` | Partner entry redirect | Keep | Redirect remains the canonical entry into registration | No change | React Router registration flow | Low | `src/App.jsx` |
| `/partners/start`, `/partners/register` | Registration journey | Keep | Existing shared journey, selection, and payment state are intentional transactional boundaries | No structural change in this audit | Partner type, pricing, Stripe handoff, session state | High | `src/pages/PartnerLifecycle.jsx` |
| `/partners/sign-up`, `/partners/apply` | Access and application forms | Keep | Bounded form surfaces and field borders provide necessary grouping | No flattening or radius removal | Auth, validation, autofill, workspace provisioning | High | `src/pages/PartnerLifecycle.jsx` |
| `/pricing`, `/marketing/pricing` | Pricing builder and alias | Keep | Selected plan, totals, and checkout grouping are functional patterns | No change | Canonical pricing data and checkout route | High | `src/pages/Pricing.jsx`, `src/App.jsx` |
| `/partners/campaigns` | Campaign builder | Keep | Current campaign layout already uses the aligned platform shell | No speculative redesign | Map campaign state and registration links | Medium | `src/pages/partners/Campaigns.jsx` |
| `/partner-workspace/*` | Workspace shell and operating pages | Polish | Lint found one unused icon import; visual architecture remains operational and should not be flattened | Removed unused import only | Protected routes, organization context, workspace data | Low | `src/pages/PartnerWorkspace.jsx` |
| `/map?mode=partner...` | Entity drawer shell | Refactor | Confirmed collapse: a 632px mobile drawer exposed only a 64px internal scroll viewport | Restored a flex column shell and full-height scroll region while retaining the overlay boundary | Selected entity state, map context, Framer Motion, drawer close/back | Medium | `src/pages/Map.jsx`, `src/styles/map-drawer-premium-regression-final.css`, `src/main.jsx` |
| `/map?mode=partner...&entityId=parking-the-shore-evening` | Shore destination drawer | Refactor | Action row was pushed below long content by legacy ordering locks; controls could not be reached predictably | Restored summary then actions then content; standardized 44px controls and wrapping | Nearby-demand action, save, directions, related entity navigation | Medium | Same drawer family files |
| Partner map venue, hotel, brand, listing drawers | Shared entity variants | Keep | Representative desktop/mobile matrix showed full scroll regions, no horizontal page overflow, and adequate controls after the shared fix | Inherit the shared correction; no variant replacement | Entity registry and related destinations | Low | Shared drawer CSS only |
| Partner map district drawer | District variant | Keep | Desktop and hydrated mobile checks scroll correctly; one automated mobile run missed the async entity hydration | No structural change | District registry hydration | Low | Shared drawer CSS only |
| Map search intent console | Primary and secondary intent rails | Keep | Two rails, small icons, URL state, and 23 registered intents remain intact | No intent registry or map-state change in this audit | Canonical intent registry and URL query state | High | `src/pages/Map.jsx`, search-intent CSS |
| Shared platform CSS | Radius, surface, shadow, spacing tokens | Investigate | Multiple historical token values and late override layers exist across broad consumers | Do not normalize globally until every consumer is traced | Marketing, workspace, map, forms, checkout | High | `src/index.css`, shared style locks |
| `/partners/tools` | Wildcard route behavior | Investigate | No explicit route; currently resolves through `/partners/:role` behavior | Confirm product ownership before adding an alias | Partner role routing | Medium | `src/App.jsx` |
| `/admin/partner` | Admin partner surface | Investigate | Not explicitly owned by this BASE44 route tree | Do not add or redesign in this bounded audit | Backend/admin application | High | None |
| `/app/workspace/*` | Legacy workspace aliases | Investigate | Only the profile alias is explicit; broader wildcard ownership is unclear | Preserve existing alias and trace callers before expansion | Authentication and deep links | Medium | `src/App.jsx` |

## Confirmed regression and correction

The selected-entity drawer used a valid overlay surface, but competing late CSS locks collapsed the document scroll area and changed content order. The correction is deliberately scoped to the active map drawer and does not remove legitimate dialog depth, mobile top corners, bounded rows, selected states, or focus affordances.

Measured result:

- Desktop Shore drawer: 440px wide, 786px usable scroll viewport, scroll content approximately 1576px.
- Mobile Shore drawer: 374px wide, 632px usable scroll viewport, scroll content approximately 1583px.
- No page-level horizontal overflow at 1440px or 390px.
- Back, close, and action controls preserve at least 44px hit areas.
- The action row follows the summary and remains reachable before long descriptive sections.
- Venue, hotel, brand, listing, and district variants retain their content and map behavior.

## Intentional exceptions retained

- The map drawer remains a bounded overlay with modest overlay shadow so it is distinguishable from the map.
- Mobile drawer top corners remain rounded because they communicate sheet behavior.
- Interactive entity rows retain restrained boundaries; static prose sections are flatter.
- Status dots, map pins, icon controls, and selected controls keep purpose-specific geometry.
- Form and checkout boundaries remain unchanged because they support validation and transaction comprehension.

## Before-and-after evidence

| State | Evidence |
| --- | --- |
| Desktop before | `docs/evidence/partner-ui-audit/map-shore-1440-before.png` |
| Desktop after | `docs/evidence/partner-ui-audit/map-shore-1440-after.png` |
| 390px before | `docs/evidence/partner-ui-audit/map-shore-390-before.png` |
| 390px after | `docs/evidence/partner-ui-audit/map-shore-390-after.png` |

The before images use the current production alias. The after images use the audited local build on `127.0.0.1:4176` with the identical route and entity state.

## Verification

| Check | Result |
| --- | --- |
| Typecheck | Pass |
| Map intent registry | Pass: 23 registered intents |
| Search intent browser test | Pass at desktop 1440px and mobile 390px when run with `BASE_URL=http://127.0.0.1:4176` |
| Lint | Pass after selectively removing one unused `Bot` import |
| Generic `npm run test` | Not available in `package.json`; focused project tests are used instead |
| Production build | Pass |
| Diff whitespace validation | Pass |

## Remaining risks

1. GitHub credentials are unavailable in this checkout, so the cached `origin/main` cannot be refreshed and should not be represented as confirmed current.
2. The drawer fix requires unusually high selector specificity to override older route locks. It is bounded to `#dp-active-map-drawer`, but the underlying legacy specificity remains technical debt.
3. Some map entities hydrate asynchronously. Visual automation must wait for the selected entity rather than treating an early absent panel as a regression.
4. The repository contains unrelated uncommitted work. Commit and deployment scope must be reviewed carefully so the audit does not absorb unrelated changes.

## Selective outcome

No component was globally flattened, no route architecture was replaced, no pricing or registration behavior was changed, and no map intent logic moved into presentation code. The only design refactor is the confirmed shared entity-drawer containment regression; the only workspace cleanup is an unused import found by lint.
