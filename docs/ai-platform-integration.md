# AI Platform Integration

## Current AI Surfaces

- Product Ask the Map: `api/ask-map.js`
- Partner Ask the Map: `api/partner/ask-map.js`
- Operations recommendation endpoint: `POST /api/agent-recommendations`
- Operations entity: `AiInsight`
- Operations entity: `PartnerAiContext`

## Strength

The product Ask the Map handler already accepts structured context: mode, filter, district, intent categories, visible context, and supplied entity data.

## Gap

There is no unified 3014 AI API namespace yet:

- `POST /api/ai/ask-map`
- `POST /api/ai/recommendations`
- `POST /api/ai/entity-summary`
- `POST /api/ai/campaign-suggestions`
- `POST /api/ai/survey-summary`
- `POST /api/ai/report-summary`

## Required Rule

AI answers must consume operational context first and respect resident/partner/admin permissions.
