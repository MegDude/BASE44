# Reporting Map

## Reporting Rule

Reports must be generated from operational events, not static product summaries. Every product action should contribute to a relevant report stream where appropriate.

## Required Report Domains

| Report | Inputs | Product exposure | Status |
| --- | --- | --- | --- |
| Partner report | views, directions, saves, scans, redemptions, events, campaigns | partner reports tab/workspace | partial |
| Campaign report | impressions, clicks, redemptions, audience, spend/effort | campaigns tab | partial |
| Perk report | unlocks, saves, redemptions, nearby context | perks/workspace | partial |
| Event report | views, RSVP, check-in, follow-up | events/workspace | partial |
| Building report | resident saves, card usage, nearby benefits | building/partner workspace | partial |
| Resident report | saved, RSVP, card, preferences | resident profile/admin | partial |
| Executive report | aggregate platform health | admin/operations | partial |

## Current Backend Routes

3014 exposes report and analytics routes, including summary, exports, campaign reports, partner analytics, resident analytics, and district analytics.

## Current Product Risk

Some product panels still render insight copy and KPI-like content from local/static context rather than guaranteed operational reports.

## Required Remediation

1. Define report contracts per domain.
2. Route partner tabs through report APIs.
3. Ensure map actions write analytics before report display.
4. Add report freshness metadata.
5. Add empty/loading/error states when operational data is absent.
