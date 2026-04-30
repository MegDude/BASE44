export const BUILD_PACK_SECTIONS = [
  {
    id: "intent",
    eyebrow: "System intent",
    title: "One system, not a pile of pages.",
    intro:
      "This page is the production build pack for the Downtown Perks rebuild. It locks the system rules, route logic, UI kit decisions, interaction patterns, file maps, data structure, and implementation order used by the live app.",
    blocks: [
      {
        type: "callout",
        tone: "info",
        title: "Important correction",
        body:
          "Do not hide behavior behind generic notes like synced markers, synced cards, or nearby perks. Distribute those behaviors intentionally across Explore, Events, Perks, Buildings, Ask the Map, and partner live views.",
      },
      {
        type: "pill-list",
        items: [
          "one design language",
          "one map interaction model",
          "one typography cadence",
          "one iconography family",
          "one partner framework",
          "one shared data and analytics layer",
        ],
      },
      {
        type: "list",
        title: "Surfaces in scope",
        items: [
          "homepage and launch marketing site",
          "resident-facing app surfaces",
          "partner-facing public pages",
          "partner live map views",
          "partner workspace",
          "operator dashboard",
        ],
      },
    ],
  },
  {
    id: "reality",
    eyebrow: "Current app reality",
    title: "The live build is Vite + React Router, not Next App Router.",
    intro:
      "The spec references a clean Next.js rebuild. The live product running in this repo is a Vite and React Router app. This build pack keeps the product rules from the spec but maps them onto the actual repo and route structure that exists today.",
    blocks: [
      {
        type: "grid",
        title: "Locked implementation assumptions for the live repo",
        items: [
          { label: "Framework", value: "Vite + React Router" },
          { label: "Map runtime", value: "Shared MapShell + UnifiedMapShell stack" },
          { label: "State", value: "Zustand stores for selected entity, drawer state, filters, panel state" },
          { label: "Data", value: "Supabase-backed entities with seeded local data fallbacks" },
          { label: "AI", value: "Ask the Map endpoint and ranked search pipeline" },
          { label: "Deployment", value: "Vercel-targeted web build" },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Engineering rule",
        body:
          "Do not write docs as if the framework has already changed. Specs must clearly separate current implementation from target architecture.",
      },
    ],
  },
  {
    id: "loop",
    eyebrow: "Core loop",
    title: "Ask → Rank → Map → Panel → Action → Signal",
    intro:
      "This is the non-negotiable product loop. Search is the entry point. The map is the output. The panel is the decision layer. The action creates the signal.",
    blocks: [
      {
        type: "steps",
        items: [
          {
            step: "01",
            title: "Ask",
            body: "Resident and partner queries resolve through one shared Ask the Map system.",
          },
          {
            step: "02",
            title: "Rank",
            body: "Results are ordered by proximity, category fit, activity, offer value, and time relevance.",
          },
          {
            step: "03",
            title: "Map",
            body: "Markers, filters, results list, and overlays all reflect the same ranked set.",
          },
          {
            step: "04",
            title: "Panel",
            body: "One selected entity at a time. Desktop uses a right drawer. Mobile uses a bottom sheet.",
          },
          {
            step: "05",
            title: "Action",
            body: "Save, RSVP, redeem, open card, inspect insight, or create campaign draft.",
          },
          {
            step: "06",
            title: "Signal",
            body: "Every meaningful action writes analytics events and feeds partner intelligence.",
          },
        ],
      },
    ],
  },
  {
    id: "surfaces",
    eyebrow: "Behavior distribution",
    title: "Put each behavior where it actually matters.",
    intro:
      "The product should not explain everything everywhere. Each surface owns a specific slice of the shared system.",
    blocks: [
      {
        type: "table",
        columns: ["Surface", "Primary job", "Must own"],
        rows: [
          ["Explore", "Live resident decision map", "search intent, category filters, ranked nearby results, one active drawer"],
          ["Events", "Time-based discovery", "live event timing, RSVP path, before/after event context"],
          ["Perks", "Redemption utility", "card-first access, eligible offers, save and redeem states"],
          ["Buildings", "Residential trust layer", "building identity, nearby value, walkable context, property-specific utility"],
          ["Ask the Map", "Natural language entry", "intent parsing, confidence, ranking mode, chips after search"],
          ["Partner live views", "Operational intelligence", "heatmaps, engagement clusters, conversion context, next-action insights"],
        ],
      },
    ],
  },
  {
    id: "routes",
    eyebrow: "Route logic",
    title: "Current routes and target route intent",
    intro:
      "Use the live route map as the working source of truth. Keep public browse surfaces public and keep role-specific behaviors attached to the correct routes.",
    blocks: [
      {
        type: "table",
        columns: ["Route", "Surface", "Notes"],
        rows: [
          ["/", "Home", "Map-first public entry and launch marketing surface"],
          ["/map and /explore", "Explore", "Canonical resident browse and map decision surface"],
          ["/events", "Events", "Time-first map mode with event discovery"],
          ["/perks", "Perks", "Offer and perks entry"],
          ["/card", "Perks Card", "Resident card access and redemption flow"],
          ["/resident-app", "Resident app", "Tab-based resident utility shell"],
          ["/partners", "Partner overview", "One downtown layer, five partner roles"],
          ["/partners/dashboard", "Partner dashboard", "Live partner intelligence and performance views"],
          ["/partner-workspace", "Partner workspace", "Operational control surface"],
          ["/about", "System story", "Public product explanation and platform framing"],
          ["/build-pack", "Implementation/spec page", "Production build pack for engineering and product alignment"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Public route rule",
        body:
          "Home, explore, events, perks, and public resident discovery routes stay browsable before login. Access layers can appear later, but the map should not disappear behind auth.",
      },
    ],
  },
  {
    id: "files",
    eyebrow: "File map",
    title: "Canonical files in the live repo",
    intro:
      "These are the repo surfaces that currently define the shared product behavior. New work should start here instead of adding duplicate map or page runtimes.",
    blocks: [
      {
        type: "code",
        title: "Current canonical surface map",
        code: `src/App.jsx
src/components/Layout.jsx
src/components/Navbar.jsx
src/components/Footer.jsx
src/components/map/MapShell.jsx
src/components/map/unified/UnifiedMapShell.jsx
src/components/map/unified/UnifiedDrawer.jsx
src/components/map/unified/UnifiedResultsPanel.jsx
src/pages/Home.jsx
src/pages/downtown-perks/ExploreRebuilt.jsx
src/pages/downtown-perks/Events.jsx
src/pages/downtown-perks/PerksPage.jsx
src/pages/resident-app/index.jsx
src/pages/partners/Index.jsx
src/pages/Dashboard.jsx
src/store/mapStateStore.ts
src/store/useMapPanelStore.ts
src/content/partnerTypes.ts`,
      },
      {
        type: "code",
        title: "Target clean architecture from the spec",
        code: `app/
  page.tsx
  map/page.tsx
  resident/card/page.tsx
  partners/page.tsx
  api/ask-map/route.ts

src/
  core/map/MapShell.tsx
  core/map/useMapController.ts
  components/map/AskMap.tsx
  components/map/MapControls.tsx
  components/map/ResultsPanel.tsx
  components/map/DetailDrawer.tsx
  lib/supabase.ts
  lib/analytics.ts
  styles/tokens.css`,
      },
    ],
  },
  {
    id: "data",
    eyebrow: "Data system",
    title: "One shared entity model and one shared pipeline.",
    intro:
      "Buildings, Contacts, and Outreach remain the single source of truth for building pipeline work. Product-side map entities and analytics events must stay normalized and validated before rendering.",
    blocks: [
      {
        type: "list",
        title: "Core business databases",
        items: ["Buildings", "Contacts", "Outreach"],
      },
      {
        type: "list",
        title: "Usage workflow",
        items: [
          "Add or enrich buildings",
          "Add decision-makers and contact emails",
          "Log every outreach touch",
          "Move buildings through the pipeline",
        ],
      },
      {
        type: "table",
        columns: ["Entity", "Required fields", "Rules"],
        rows: [
          ["Map entity", "id, type, title, lat, lng, category", "never render without valid numeric coordinates"],
          ["Analytics event", "event_name, entity_id, entity_type, source, created_at", "do not block UI if analytics fails"],
          ["Saved item", "profile_id, entity_id, created_at", "must also emit analytics save event"],
          ["Redemption", "profile_id, partner_id, entity_id, created_at", "must also emit analytics redemption event"],
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Coordinate guardrail",
        body:
          "Separate content inventory from plottable map entities. Records without valid numeric coordinates may enrich search or admin QA, but they must never render as markers.",
      },
    ],
  },
  {
    id: "ui",
    eyebrow: "UI kit decisions",
    title: "Clean, bold, sharp, map-first.",
    intro:
      "Use one visual language: off-white canvas, rich navy structure, restrained gold accents, editorial display type, Inter for UI, glass only for interaction layers, and fewer cards and borders.",
    blocks: [
      {
        type: "grid",
        title: "Core tokens",
        items: [
          { label: "Background", value: "#F4F6FA / off-white" },
          { label: "Structure", value: "deep navy" },
          { label: "Accent", value: "gold only for active or premium signal" },
          { label: "Surface", value: "light glass or quiet white panels" },
          { label: "Display type", value: "Canela" },
          { label: "UI type", value: "Inter" },
        ],
      },
      {
        type: "table",
        columns: ["Allowed", "Forbidden"],
        rows: [
          ["glass overlays, floating controls, map-first layouts, editorial spacing", "card walls, boxed section stacks, repeated CTAs, decorative border clutter"],
          ["one primary action per section", "multiple competing actions in the same module"],
          ["bottom sheets on mobile and drawers on desktop", "mixed popup systems or duplicate detail components"],
        ],
      },
      {
        type: "list",
        title: "Component rules",
        items: [
          "Map is framed by overlays, not boxed into a decorative card.",
          "Cards are used only when containment is necessary.",
          "Inner surfaces never have a larger radius than their parent.",
          "Default border width is 1px; 2px only for selected, active, or focused states.",
        ],
      },
    ],
  },
  {
    id: "map",
    eyebrow: "Map interaction model",
    title: "One panel system. One marker identity system.",
    intro:
      "No Leaflet default popups, no random floating cards, and no parallel marker styling. Map interaction must feel like one product system.",
    blocks: [
      {
        type: "table",
        columns: ["Rule", "Decision"],
        rows: [
          ["Primary detail panel", "desktop right drawer, mobile bottom sheet"],
          ["Panel count", "only one open at a time"],
          ["Selection", "click marker or result row updates the same selected entity"],
          ["Close behavior", "close button required, Escape closes, no hidden panels behind map"],
          ["Map layers", "map base under markers, markers under glass UI, drawers above all map layers"],
        ],
      },
      {
        type: "table",
        columns: ["Entity type", "Marker identity"],
        rows: [
          ["property and listing", "Legends logo"],
          ["perk", "star or ticket in gold state"],
          ["event", "calendar with navy and gold accent"],
          ["venue", "storefront or map pin in navy"],
          ["coffee", "coffee cup"],
          ["nightlife", "music or martini"],
          ["hotel", "bed or building"],
          ["civic", "landmark or flag"],
          ["wellness", "heart or spark"],
          ["brand activation", "sparkles or bolt"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Legends rule",
        body:
          "Legends owns residential and property identity. Downtown Perks owns the neighborhood activity layer. Property and listing markers must use the Legends logo path.",
      },
    ],
  },
  {
    id: "ask-map",
    eyebrow: "Ask the Map",
    title: "Search is the entry. The map is the output.",
    intro:
      "The system should feel conversational but return structured map intent. No separate results page. No extra search bars. No search logic duplicated by page.",
    blocks: [
      {
        type: "list",
        title: "Resident opening prompts",
        items: [
          "Where do you want to go?",
          "What are you in the mood for?",
          "What’s happening nearby?",
        ],
      },
      {
        type: "list",
        title: "Partner opening prompts",
        items: [
          "What are people doing nearby?",
          "Where is demand right now?",
          "What’s driving engagement?",
        ],
      },
      {
        type: "code",
        title: "API contract",
        code: `{
  "query": "happy hour near me",
  "mode": "resident",
  "intent": "find_perk",
  "categories": ["bar", "nightlife"],
  "district": null,
  "radiusMeters": 1000,
  "ranking": "offer",
  "timeWindow": "now",
  "confidence": 0.91
}`,
      },
      {
        type: "callout",
        tone: "warning",
        title: "Shared search rule",
        body:
          "One endpoint, one intent model, one search input family. Resident mode updates markers and results. Partner mode updates overlays and insight panels.",
      },
    ],
  },
  {
    id: "analytics",
    eyebrow: "Analytics and proof",
    title: "Every meaningful interaction becomes a measurable signal.",
    intro:
      "Downtown Perks is only defensible if saves, scans, redemptions, and engagement become a clear proof layer for partners, properties, and operators.",
    blocks: [
      {
        type: "list",
        title: "Minimum events",
        items: [
          "map_open",
          "search_submit",
          "entity_view",
          "save",
          "card_open",
          "redemption",
          "partner_overlay_view",
          "campaign_click",
        ],
      },
      {
        type: "steps",
        items: [
          {
            step: "01",
            title: "Save",
            body: "Save writes to saved_items and analytics_events.",
          },
          {
            step: "02",
            title: "Scan or redeem",
            body: "Redemption writes to redemptions and analytics_events.",
          },
          {
            step: "03",
            title: "Dashboard",
            body: "Partner views roll those events into demand, conversion, and next-action intelligence.",
          },
          {
            step: "04",
            title: "Heatmap",
            body: "Partner heatmaps visualize saves, scans, searches, visits, and campaign activity by time window.",
          },
        ],
      },
    ],
  },
  {
    id: "urban-os",
    eyebrow: "Master system spec",
    title: "The Urban OS ties copy, schema, map behavior, and revenue together.",
    intro:
      "This is the canonical Codex-level system framing for Downtown Perks. It connects the map-first product story to the underlying verification, interaction, partner, event, campaign, and revenue model.",
    blocks: [
      {
        type: "table",
        columns: ["Layer", "Purpose", "Core objects"],
        rows: [
          ["Identity", "Verification and progression", "users, resident_verification"],
          ["Map entities", "Partners and offers", "partners, perks, events"],
          ["Signal loop", "Behavior capture", "interactions, saves, visits, redemptions"],
          ["Partner action", "Insights and campaigns", "action queue, journeys, ask-the-map, campaigns"],
          ["Revenue", "Proof of value", "partner_revenue, attribution weights, ROI"],
        ],
      },
      {
        type: "list",
        title: "Functional systems locked by this spec",
        items: [
          "website conversion engine with vertical partner routes and role-specific pricing",
          "resident app now engine, building gateway, walkability controller, and gamification",
          "partner dashboard action queue, journey builder, and B2B ask-the-map layer",
          "sms loyalty loop, event pulse sync, and signal-strength-driven trending logic",
          "copy, schema, UI, and measurement working as one enforced operating model",
        ],
      },
      {
        type: "code",
        title: "Master system loop",
        code: `Map -> Behavior -> Signals -> Insight -> Action -> Revenue -> Feedback loop

Scan -> Context -> Prompt -> Action -> Outcome

Signal Strength = (Map Impressions x Interaction Rate) / Distance`,
      },
      {
        type: "callout",
        tone: "info",
        title: "Visual DNA rule",
        body:
          "Use Navy (#071A2C) for structure, Off-White (#F8F7F3) for space, and Gold (#C9A24A) only for signals and active states. Typography should do more of the work than stacked cards or boxed layouts.",
      },
    ],
  },
  {
    id: "order",
    eyebrow: "Implementation order",
    title: "Build the product loop first, then the proof layer.",
    intro:
      "The platform should scale by adding capability to one system, not by building parallel products.",
    blocks: [
      {
        type: "steps",
        items: [
          { step: "1", title: "Repo cleanup and shared tokens", body: "Lock design tokens, route map, and canonical file ownership." },
          { step: "2", title: "MapShell runtime", body: "One selected entity model, one drawer model, one result synchronization model." },
          { step: "3", title: "Homepage plus full map", body: "Make the live map the central product surface, not a decorative preview." },
          { step: "4", title: "Resident card and save-scan-go flow", body: "Complete the resident action loop before adding extra brochure copy." },
          { step: "5", title: "Partner dashboard and heatmap", body: "Turn usage into insight, not just raw KPI panels." },
          { step: "6", title: "Ask the Map endpoint and ranking", body: "Structured search intent should drive visible map behavior." },
          { step: "7", title: "Supabase analytics hardening", body: "Track events, saved items, redemptions, and partner metrics cleanly." },
          { step: "8", title: "Deployment hardening", body: "Keep public product routes browsable and production-ready on Vercel." },
        ],
      },
    ],
  },
  {
    id: "acceptance",
    eyebrow: "Acceptance criteria",
    title: "The build is done when the system behaves like one product.",
    intro:
      "Use these checks as the production definition of done. If they fail, the build is not complete even if the visuals look good.",
    blocks: [
      {
        type: "checklist",
        items: [
          "One shared map powers homepage, explore, resident app, and partner intelligence views.",
          "No duplicate popup systems remain. Drawers and sheets are canonical.",
          "Search updates the map directly and uses one intent model.",
          "Resident flow works: discover → save → scan → redeem.",
          "Partner flow works: publish → appear → measure → adjust.",
          "Invalid coordinates never render markers or crash the map.",
          "Property and listing identity uses Legends branding consistently.",
          "Analytics events exist for map, save, search, card, redemption, and partner actions.",
          "Public browse routes render without auth walls before the map.",
          "The UI feels calm, sharp, navy, glass-light, and map-first instead of card-heavy.",
        ],
      },
    ],
  },
];

export const BUILD_PACK_RESOURCES = [
  {
    label: "Master Codex Spec (repo)",
    href: "/build-pack#urban-os",
  },
  {
    label: "Master Build Instruction",
    href: "https://www.notion.so/Downtown-Perks-Master-Build-Instruction-Copilot-Replit-aed73075955c4b0f9c6cd2b4e66cf70a?pvs=21",
  },
  {
    label: "Ask the Map Agent",
    href: "https://www.notion.so/Downtown-Perks-Ask-the-Map-Agent-Build-Instruction-d35fb72539f44b6381761206d98164dd?pvs=21",
  },
  {
    label: "Build Instructions + Code",
    href: "https://www.notion.so/Build-Instructions-Code-Notion-Supabase-MapShell-29bbdd8cc6fc49559a4e023819a6703c?pvs=21",
  },
  {
    label: "Copy Deck",
    href: "https://www.notion.so/Downtown-Perks-Copy-Deck-Full-Platform-Dashboard-a2e56f92154f40ba983f514cadfe3618?pvs=21",
  },
  {
    label: "Enhanced Copy Deck",
    href: "https://www.notion.so/Downtown-Perks-Enhanced-Copy-Deck-3352e63f902b80fca44ad9838897834c?pvs=21",
  },
  {
    label: "Buildings",
    href: "https://www.notion.so/78d723bced0f4fd4bc8e27435ab43b5e?pvs=21",
  },
  {
    label: "Contacts",
    href: "https://www.notion.so/eb6d7452055d4b42a468db5730547eea?pvs=21",
  },
  {
    label: "Outreach",
    href: "https://www.notion.so/70feb21b3a2740908efacc873363556c?pvs=21",
  },
];
