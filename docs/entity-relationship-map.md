# Entity Relationship Map

## Core Relationship

`PlatformTenant -> TenantWorkspace -> PartnerProfile -> PartnerLocation -> MapEntityLink`

## Product Entities

- Partner
- Property
- Building
- Venue
- Hotel
- Brand
- Civic
- Perk
- Event
- Campaign
- QR experience

## Operational Relationships

- Partner owns profiles, locations, offers, events, reports, analytics, QR, AI context, notifications, audit logs.
- Map links connect product pins to operational tenants/workspaces.
- Campaigns should relate to partners, resident segments, perks, events, QR, reports, and analytics.
- Perks should relate to partners, campaigns, QR, redemptions, reports, and analytics.
- Events should relate to venues/partners, RSVPs, attendance, follow-up surveys, reports, and analytics.

## Required Rule

Every 5173 entity must exist once and be referenced by context. Presentation may change; entity identity should not.
