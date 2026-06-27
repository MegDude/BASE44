# Downtown Perks Platform Operations Blueprint

This document captures the operating architecture introduced in Stages 11-17.

## Operating Rule

Every map item should be publishable, editable, schedulable, measurable, and reusable.

## Shared Event Model

All product actions publish structured events before any downstream integration uses them.

Core examples:

- `entity.viewed`
- `entity.saved`
- `entity.shared`
- `directions.requested`
- `perk.redeemed`
- `campaign.joined`
- `qr.scanned`
- `event.rsvp`
- `event.checkin`
- `search.completed`
- `cms.entity.updated`

## Event Fields

Each event should include:

- `timestamp`
- `userId`
- `profileId`
- `sessionId`
- `entityId`
- `entityType`
- `district`
- `campaignId`
- `partnerId`
- `buildingId`
- `source`
- `result`
- `metadata`

## CMS Domains

The internal CMS should manage:

- Attractions
- Venues
- Restaurants
- Coffee
- Hotels
- Residential
- Retail
- Events
- Campaigns
- Perks
- Collections
- Walking routes
- Images
- Sponsors
- Organizations
- Districts
- Reports
- Users
- Settings

## Implementation Principle

New features should publish platform events through `src/lib/platformEvents.js` rather than writing directly to another system. Downstream services can subscribe to or mirror those events into analytics, CRM, reports, Stripe, campaign dashboards, or partner workspaces.
