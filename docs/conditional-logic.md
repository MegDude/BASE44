# Conditional Logic

## Required Product Conditions

- backend unavailable: show offline/error with retry.
- map entity inactive: hide from resident map.
- partner entity active: show in partner/admin surfaces.
- resident mode: resident copy/actions only.
- partner mode: partner copy/actions only.
- perk paused: redemption disabled.
- perk active: redemption enabled.
- campaign scheduled: scheduled state.
- campaign active: placements visible.
- event full: RSVP disabled or waitlist.
- integration pending: external action disabled.
- AI unavailable: fallback suggestion state.
- permission missing: hide restricted controls.
- QR invalid: safe invalid state.
- QR expired: expired state and audit.
- automation failed: failed run and retry.

## Current Status

Some UI conditions exist in product components, but many are not yet enforced by typed backend rules. The operations audit mirror now helps record action attempts and failures in 3014.
