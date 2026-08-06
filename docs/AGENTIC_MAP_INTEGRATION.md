# Downtown Perks Agentic Map Integration

## Purpose

Ask the Map is the shared decision layer for the resident map and partner workspace. It answers from current Downtown Perks context, names the places used in the answer, and returns actions the interface can execute.

It must not become a separate place database, campaign system, reporting store, or user model.

## Canonical surfaces

- Resident map search and entity drawers
- Resident home Ask the Map entry
- Partner map search and entity drawers
- `/ask-map`
- `/partner-workspace/assistant`
- Workspace reports, campaigns, listings, and analytics links returned as agent actions

All surfaces call `src/services/agent/agentClient.ts`.

## Request order

1. Authenticated Base44 conversation using the `perk_finder` agent from the Downtown Perks OpenAPI contract.
2. Server-side `/api/ask-map`, backed by the OpenAI Responses API when `OPENAI_API_KEY` exists in the deployment environment.
3. Context-only Downtown Perks ranking when an external provider is unavailable.

The third layer is an operational fallback. It uses only the supplied map entities and must report `source: "local-agent"` and `degraded: true`.

## Authentication and secrets

- Base44 conversations use the authenticated Base44 SDK session.
- OpenAI credentials are read only inside the Cloudflare serverless route.
- No provider key is accepted from browser payloads.
- No API key is stored in source, local storage, session storage, analytics, or agent messages.
- Conversation IDs are stored in session storage and separated by mode and organization.

## Canonical input

Every request includes:

- `message` and `query`
- `mode`
- `intent`
- `sessionId`
- `userId`, when known
- `organizationId`, when known
- current district or coordinates
- selected entity and current map state
- bounded map context
- recent searches or actions when supplied by the map

Payload construction is owned by `buildAgentPayload()`.

## Canonical output

The UI expects:

- `answer`
- `title`
- `summary`
- `explanation`
- `places`
- `actions`
- `structuredActions`
- `followUps`
- `source`
- `model`
- `conversationId`, when the provider supports it

Provider-specific messages are normalized before they reach a page.

## Supported actions

- `open_entity`
- `apply_filter`
- `open_campaign_prefill`
- `open_report`
- `open_dashboard`
- `search_again`

The map or workspace owns action execution. The model cannot navigate, publish, send, charge, delete, or edit records directly.

## Grounding rules

- Specific places, offers, events, listings, campaigns, analytics, hours, and addresses must come from supplied context.
- Provider entities that do not match a supplied entity ID or title are removed.
- `open_entity` actions for unknown IDs are removed.
- Missing information must be identified instead of completed with a likely value.
- Partner recommendations must state the next practical action.
- Resident recommendations must stay useful from the current map.

## OpenAI implementation

`api/ask-map.js` uses the Responses API and strict Structured Outputs. The model is configurable with `OPENAI_MODEL`; the code default is the current documented GPT-5 family production model selected for this integration.

The response schema limits entity and action counts, validates action types, and then applies a second application-side grounding pass.

## Base44 implementation

The attached Downtown Perks OpenAPI specification verifies:

- `perk_finder` is the registered app agent.
- Conversations can be created and listed.
- Messages can be sent to a conversation.
- Responses can include tool calls and usage.

The browser integration uses the installed `@base44/sdk` agents module rather than manually rebuilding its authentication transport.

## Verification

Run:

```bash
npm run test:agent
npm run typecheck
npm run lint
npm run build
```

After deployment, verify:

```text
POST /api/ask-map
POST /api/agent/query
GET /ask-map
GET /partner-workspace/assistant?organizationId=<organization-id>
GET /map?mode=resident&tab=map&filter=All&console=expanded
GET /map?mode=partner&tab=map&filter=All
```

Both POST routes must return a grounded `200` response when a provider is unavailable. Provider outages must not make the map unusable.
