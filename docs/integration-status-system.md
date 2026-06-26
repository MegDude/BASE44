# Integration Status System

## Required Providers

- Tally / Jotform / SurveyJS
- Twilio Verify
- Twilio Messaging
- Supabase Operational Store
- n8n
- OpenAI
- Google Sheets / Reports DB
- Google Maps
- Stripe
- Email provider
- Storage provider

## Existing Support

Operations has `IntegrationEndpoint` records and upload/email helper endpoints.

## Missing Contract

- `GET /api/integrations/status`
- `POST /api/integrations/:id/test`

## Provider State Model

Each integration should show:

- configured
- pending credentials
- error
- disabled
- last tested
- last success
- logs
- required env vars
- setup instructions
- test connection action

External provider calls should only run when credentials are present.
