---
mode: agent
description: Partner system refactor — system directive for Downtown Perks
---

# Downtown Perks — Partner System Directive

## One system. Five entry points. No drift.

Downtown Perks does not have five partner types.
It has one system that behaves differently depending on who is using it.
This directive aligns the codebase with that reality.

---

## Canonical Partner Types

There are exactly five. They do not change.

| Type | Route | Legacy aliases to remove |
|------|-------|--------------------------|
| Properties | `/partners/properties` | "Buildings", `/downtown-perks/for-buildings` |
| Hospitality | `/partners/hospitality` | "Hotels", `/partners/hotels` |
| Venues | `/partners/venues` | — |
| Brands | `/partners/brands` | — |
| Civic | `/partners/civic` | — |

**Rule:** Any page, component, or label outside this set is legacy. Treat it as such.

---

## Content Model

All partner logic lives in one file: `src/content/partnerTypes.ts`

Each entry is not content — it is **behavioral intent**. It answers:
- Who is this for?
- What do they get?
- How does the platform work for them?
- What action should they take next?

### Required shape per partner type

```ts
{
  key: string;                   // 'properties' | 'hospitality' | 'venues' | 'brands' | 'civic'
  label: string;                 // display name — never "Hotels", never "Buildings"
  layerLabel: string;            // short label used in map filter chips and layer toggles
  route: string;                 // canonical route — e.g. '/partners/properties'
  summary: string;               // one sentence: what this partner understands immediately
  highlight: string;             // what differentiates this layer
  heroTitle: string;
  heroBody: string;
  metrics: { value: string; label: string }[];
  useCases: { title: string; description: string }[];
  platformPoints: string[];      // how the system behaves underneath
  primaryCta: { label: string; href: string };
}
```

If it matters, it lives here. If it lives elsewhere, it is a mistake.

---

## Shared Components

### PartnerTypeCard
The entry point for a partner type. Not a marketing tile — a decision surface.

- Renders from `partnerTypes.ts` config — no hardcoded data
- Answers at a glance: Is this for me? What do I get? Where do I go next?
- Never duplicated; never linked with hardcoded hrefs

### PartnerTypesSection
One mapped loop. Five outcomes.

```tsx
partnerTypes.map(pt => <PartnerTypeCard key={pt.key} {...pt} />)
```

Used in: `/partners`, homepage, future pricing or entry flows.
If you are manually listing partner types, something is wrong.

### PartnerTypePageTemplate
One structure. Five interpretations.

Every partner page follows this exact section order:
1. Hero — what this is
2. Metrics — proof it works
3. Use cases — how it shows up in reality
4. Platform logic — how the system behaves underneath
5. CTA — what to do next
6. FAQ — optional

No custom layouts unless the product explicitly demands it.

---

## Routes

Partner pages are wrappers, not thinkers.

```tsx
// Each route:
const pt = partnerTypes.find(p => p.key === routeKey);
return <PartnerTypePageTemplate {...pt} />;
```

Result: no duplicated layouts, no inconsistent messaging, no structural drift.
If one page changes, they all change.

---

## Language Cleanup

Search and replace across the entire repo:

| Find | Replace |
|------|---------|
| `"Hotels"` | `"Hospitality"` |
| `"Buildings"` | `"Properties"` |
| `hotel` (in `layerLabel`, `sourceContext`, `FILTER_CHIPS`) | `hospitality` |
| `building` (in `layerLabel`, `sourceContext`, `FILTER_CHIPS`) | `property` |
| Hardcoded partner CTAs in JSX | Config-driven from `primaryCta` |

---

## Legacy Routing

Redirects only — no parallel systems.

```ts
'/partners/hotels'            → '/partners/hospitality'
'/downtown-perks/for-buildings' → '/partners/properties'
```

Remove redirect logic when analytics confirm zero traffic.

---

## Styling Contract

The product should feel considered, not decorated.

- Background: off-white (`#F9F8F6`), not pure white
- Structure: navy (`#0B1F33`)
- Accent: gold (`#C8973A`) — used sparingly, earned not applied
- Depth: glass/blur where it adds depth, not novelty
- Shape: rounded corners, never soft/bubbly
- Borders: none heavy; use shadow and spacing instead

The UI holds the content. It does not compete with it.

---

## Completion Criteria

You are done when:

- [ ] Every partner page uses `PartnerTypePageTemplate` — no custom layouts
- [ ] `/partners` renders partner types from config with no manual duplication
- [ ] Navigation uses canonical labels — no trace of "hotels" or "buildings"
- [ ] All `layerLabel` values in `FILTER_CHIPS` and map constants use canonical keys
- [ ] Cards, pages, and CTAs all resolve from `partnerTypes.ts`
- [ ] Legacy routes redirect cleanly
- [ ] `.github/prompts/partner-types-refactor.prompt.md` exists (this file)

If something feels slightly off, it usually is.

---

## Final Note

This refactor does not add features. It removes friction.

Before: a set of pages that describe a platform.
After: a system that behaves like one.

That difference is what makes everything else — map, QR, partnerships — actually scale.
