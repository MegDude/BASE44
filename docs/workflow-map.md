# Workflow Map

## Workflow Rule

Workflows belong to the 3014 workflow/domain layer. The 5173 product may start a workflow and render status, but it must not own the business decision tree.

## Current Workflow Evidence

| Workflow | Product path | Backend path | Status |
| --- | --- | --- | --- |
| Ask the Map | shared agent client | `/api/agent/query`, `/api/agent/stream` | aligned |
| Map impression | `fireWorkflow()` from map | `/api/impression` and audit mirror | partial |
| Save place/perk | map and saved surfaces | `/api/save` and audit mirror | partial |
| Visit/directions | map actions | `/api/visit` and analytics/audit | partial |
| Search log | map search console | `/api/search-log` and audit mirror | partial |
| Survey completion | survey flows | `/api/survey-responses/webhook/complete` | partial |
| Partner registration | partner lifecycle | 3014 provisioning endpoints exist | partial |
| Checkout | partner lifecycle | product calls `/api/stripe/create-checkout-session`; backend exposes `/api/checkout/session` | mismatch |
| Workspace provisioning | partner lifecycle/workspace | `/api/partners/:id/provision-workspace` | present |
| Perk redemption | resident card/perks | `/api/perks/:id/redeem` | present |
| Event RSVP | event drawers | `/api/events/:id/rsvp` | present |
| Campaign publish | partner campaigns | `/api/campaigns/:id/publish` | present |

## Target Workflow Engine

Every workflow should follow:

```text
intent
-> validation
-> permissions
-> domain mutation
-> analytics event
-> audit event
-> report update
-> automation trigger
-> product response
```

## Immediate Remediation

1. Replace the checkout route mismatch with `/api/checkout/session`.
2. Move map save/visit/search/impression decisions behind typed 3014 endpoints.
3. Convert partner lifecycle registration state into a resumable 3014 workflow.
4. Ensure every perk redemption, RSVP, QR scan, and campaign publish emits analytics and audit records.
