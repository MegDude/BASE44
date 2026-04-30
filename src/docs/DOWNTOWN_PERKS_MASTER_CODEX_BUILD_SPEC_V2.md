# Downtown Perks Master Codex Build Spec v2

Status: Production blueprint

## 0. Execution objective

Downtown Perks is a live urban operating system:

```text
Map -> Behavior -> Signals -> Insight -> Action -> Revenue -> Feedback loop
```

Every feature should reinforce this loop.

## 1. Core product rules

- One map. Everything nearby.
- No app download.
- No login friction.
- The map is the product.

UX rule:

```text
Scan -> Context -> Prompt -> Action -> Outcome
```

## 2. Platform architecture

```text
MapShell UI
-> API layer
-> Supabase Urban OS
-> Aggregation engine
-> Ask the Map AI
-> Partner dashboard
-> Campaign engine
-> Revenue attribution
-> Map feedback loop
```

## 3. Website conversion engine

### Dynamic route factory

Use role-driven partner routes:

```text
/partners/[role]
```

Each route should inject:

- hook copy
- hero image
- pricing model
- role-specific proof

### Brand network proof layer

Support image-led showcase entries for:

- Fine Eyewear
- YETI
- Rivian

### Dual-audience FAQ hub

Separate FAQ logic for:

- resident utility
- partner ROI

## 4. Resident app

### Now engine

Surface real-time mood and timing signals including:

- quiet / busy
- morning ritual
- tonight

### Building gateway

Building-specific verification should update the resident verification state when the user email domain matches the property rule.

### Walkability engine

Use a 400 meter walkability radius and a global five-minute walk filter.

### Gamification engine

Point updates should support progression like:

- Explorer
- Local
- Legend

## 5. Partner dashboard

### Action queue

Translate spikes into plain-language next actions.

Example:

```text
Event spike at Waterloo detected: Deploy Happy Hour perk now.
```

### Journey builder

Partners should be able to map QR stations and prompts to journey stages.

### Ask the Map for partners

Partners should be able to query their own funnel, scoped by partner identity.

## 6. Urban OS schema

### Layer 1: Identity and verification

```sql
users (
  user_id,
  email,
  loyalty_points,
  status_level,
  home_anchor_id
)

resident_verification (
  verification_id,
  user_id,
  building_id,
  is_verified,
  verified_at
)
```

### Layer 2: Map entities

```sql
partners (
  partner_id,
  partner_name,
  category,
  lat_lng,
  active_vibe
)

perks (
  perk_id,
  partner_id,
  offer_copy,
  is_exclusive,
  point_value
)
```

### Layer 3: Interaction loop

```sql
events (
  event_id,
  partner_id,
  start_time,
  end_time,
  event_pulse_radius,
  is_civic_programmed
)

interactions (
  interaction_id,
  user_id,
  partner_id,
  interaction_type,
  location_context
)
```

### Layer 4: Revenue attribution

```sql
partner_revenue (
  id,
  partner_id,
  source,
  revenue
)
```

## 7. Connective tissue

### SMS loyalty loop

```text
Save -> wait 120 minutes -> if no redemption -> send SMS deep link
```

### Event pulse sync

Ingest event feeds, write active events to the database, and boost partners inside the pulse radius.

### Signal strength

```text
Signal Strength = (Map Impressions x Interaction Rate) / Distance
```

If signal strength exceeds threshold:

- show in trending
- push to partner action queue

## 8. Map engine rules

Required map UI components:

- `MapFilters`
- `AskMapInput`
- `SignalLayer`

Remove:

- duplicate filters
- card-heavy result duplication
- disconnected map wrappers

## 9. Ask the Map AI

Expected response shape:

```json
{
  "insight": "...",
  "action": "...",
  "confidence": 0.92
}
```

Supported prompt families:

- What is happening right now?
- Where should I go?
- What is converting best?

## 10. Campaign engine

Examples:

- perk boost
- event sync
- SMS recovery
- brand placement

Examples of automation rules:

- visits high and conversions low -> deploy perk
- event spike -> launch campaign
- saved and not visited -> send SMS

## 11. Revenue attribution

Model:

```text
Direct = 1.0
Assisted = 0.6
Influenced = 0.3
```

```text
ROI = (Revenue - Cost) / Cost
```

## 12. Visual DNA

- Background: `#F8F7F3`
- Structure: `#071A2C`
- Signal: `#C9A24A`

Rules:

- glass only for controls and overlays
- no card stacking as a default layout
- typography should drive hierarchy
- map-first structure beats brochure structure

## 13. Copy system

Core lines:

- Where downtown meets you
- Everything nearby
- Just open the map and go
- Be the one they notice
- Where downtown works like a system

## 14. System loop

```text
User opens map
-> interacts
-> signals captured
-> AI interprets
-> dashboard shows insight
-> campaign launches
-> revenue tracked
-> system improves
```

## 15. Success metrics

- Map to action: +30%
- Campaign usage: +25%
- Revenue per partner: +35%
- ROI visibility: 100%

## Final position

Downtown Perks is not just a website, dashboard, or map.

It is a real-time operating system for downtown behavior, decisions, and revenue.
