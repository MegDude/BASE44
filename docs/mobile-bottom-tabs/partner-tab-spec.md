# Partner mobile tabs

Canonical navigation is **Overview, Map, Campaigns, Audience, Workspace**.

Partner drawers describe operational opportunity, supported aggregated signals, campaign timing, visibility, actions, and measurement handoffs. They must not lead with resident redemption instructions or expose individual resident identity. Unsupported metrics remain hidden; revenue and conversion are never inferred from handoff events.

Overview uses the existing information panel, Map retains the geographic surface, Campaigns uses campaign content, Audience uses privacy-safe activity signals, and Workspace routes into the authenticated platform. The canonical section order, purpose, empty state, route, and analytics event are defined in `src/components/map/mobileTabRegistry.ts`.
