# Automation Engine

## Existing Support

Operations has:

- `AutomationRun`
- `MessagingJourney`
- `SmsMessageLog`
- `SurveyProviderForm`
- `IntegrationEndpoint`
- `TenantNotification`

## Required Automations

- survey processing
- redemption verification
- resident enrollment
- partner provisioning
- partner perk updates
- partner message handling
- property performance reports
- partner monthly reports
- event follow-up
- campaign triggers
- survey escalations
- resident bulk updates
- QR scan routing
- AI recommendation generation

## Missing Endpoints

- `GET /api/automations`
- `POST /api/automations/:id/run`
- `GET /api/automations/runs`

## Required UI

3014 should expose automation status, last run, next run, success/failure counts, logs, and retry action.
