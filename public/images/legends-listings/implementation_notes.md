# Downtown Perks Map: Icon + Image Source Review

## Decision
Use a single circular pin system for every Downtown Perks map entity, with category-specific icons for resident utility and restrained brand badges for named partner layers. Keep the existing map UI intact. The clean-up is mostly a data/asset alignment update, not a redesign.

## What was reviewed
- Source file: `downtown-perks-map-entities.csv`
- Entities reviewed: **127**
- Legends real estate listings: **45**
- Current unique pin assets in source: **17**
- New/generated icon assets in this pack: **19**
- Pin updates recommended: **17**
- Image/source reviews recommended: **76**

## Most important source corrections
1. Several entities use the generic dining pin even when the category is coffee, nightlife, culture, wellness, or event. These should move to category-specific icons.
2. All Legends listings already point to `/pins/circular/special/legends-badge.svg`. Keep that path, but populate the blank `address` column and replace generic panel copy.
3. Some image records are category fallbacks or appear mismatched, especially retail records using YETI imagery, Four Seasons using a W Austin image path, and property records using wellness imagery.
4. `civic-waterloo` is missing `partnerPanelDescription` and should be fixed before launch.

## Visual direction
The Downtown Perks icon system should feel like resident utility with downtown polish: warm ivory, ink, copper, muted civic blues, and clean line symbols. Avoid cartoonish icons, heavy gradients, oversized brand logos, or overly saturated nightlife styling.

## Implementation notes
- Replace current broad icon assignments using `data/map_pin_overrides.json`.
- Place the generated SVGs into the matching app asset paths under `/pins/circular/...`.
- For production brand pins, use approved partner logo assets where available. The included brand badges are safe monogram placeholders.
- Keep map marker sizing consistent with the current UI: 36–44px default, 44–48px active/selected.
- Add `aria-label` values in this pattern: `{pinLabel}: {name} in {district}`.
- For Legends panels, keep the Legends badge as the pin identity and update panel copy to be property-specific with contact/property actions visible.

## Files included
- `pins/circular/` — SVG icon set.
- `data/map_entity_icon_image_audit.csv` — row-level review and recommendations for all entities.
- `data/map_pin_overrides.json` — implementation-ready pin override map.
- `data/icon_manifest.csv` — icon labels, paths, and usage rules.
- `docs/downtown_perks_design_tokens.json` — palette and pin specs.
- `preview/downtown_perks_icon_board.png` — visual preview board.