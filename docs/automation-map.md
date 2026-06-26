# Automation Map

## Automation Rule

Automations are operational workflows. They must be visible, retryable, auditable, and measurable from 3014. Product pages may display outcomes, not own automation logic.

## Current Automation Surface

3014 exposes:

- `/api/automations/triggers`
- `/api/automations/actions`
- automation-related workflow endpoints
- audit and analytics routes used by several mutations

## Required Automation Triggers

| Trigger | Required actions | Status |
| --- | --- | --- |
| Partner registered | create workspace, owner, permissions, onboarding checklist | partial |
| Checkout completed | activate subscription, provision modules, send receipt | partial |
| Campaign published | create placements, notify relevant audiences, start reporting | partial |
| Perk redeemed | record redemption, update report, notify partner if needed | partial |
| Event RSVP | record RSVP, schedule reminder, update event report | partial |
| QR scanned | record scan, resolve destination, update analytics/audit | partial |
| Report generated | store export, notify workspace, update audit | partial |
| AI recommendation accepted | create task/campaign/action and audit decision | missing |

## Required Engine Capabilities

- idempotency keys
- retries
- failure states
- dead-letter visibility
- audit trail
- tenant isolation
- operator dashboard
- test fixtures

## Production Status

Automation score: **6/10**. Route surface exists, but the product is not yet using a fully centralized, observable automation engine for every workflow.
