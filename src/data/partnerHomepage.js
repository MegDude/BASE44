export const partnerNavLinks = [
  { label: "Partners", href: "/partners" },
  { label: "Dashboard", href: "/partners/dashboard" },
  { label: "Properties", href: "/partners/properties" },
  { label: "Hotels", href: "/partners/hospitality" },
  { label: "Venues", href: "/partners/venues" },
  { label: "Brands", href: "/partners/brands" },
  { label: "Civic", href: "/partners/civic" },
  { label: "Pricing", href: "/marketing/pricing" },
  { label: "Contact", href: "/partners/campaigns" },
];

export const heroMetrics = [
  { value: "40+", label: "Active Partners" },
  { value: "180k+", label: "Monthly Interactions" },
  { value: "52%", label: "Repeat Engagement" },
];

export const operatingModelCards = [
  {
    title: "Be useful nearby",
    body: "Show up around the places, events, and routines people are already using downtown.",
  },
  {
    title: "Give one clear next step",
    body: "Make it easy to save, scan, RSVP, request, call, book, or get directions.",
  },
  {
    title: "See what people used",
    body: "Review opens, saves, scans, directions, RSVPs, and follow-up requests in plain language.",
  },
];

export const partnerStates = [
  {
    key: "properties",
    label: "Properties",
    eyebrow: "Properties",
    headline: "You are not selling square footage. You are selling everything around it.",
    body: [
      "Residents do not choose a building in isolation.",
      "They choose the coffee nearby, the walk to dinner, the trail access, the events they can actually make, and the small conveniences that make downtown feel easier.",
      "Downtown Perks gives each building a useful neighborhood layer residents can open from day one.",
    ],
    pricing: ["Starter $99/year", "Core $149/year", "Portfolio Custom"],
    cta: "Bring This to Your Property",
    ctaHref: "/partners/properties",
    metrics: [
      { value: "12k+", label: "Scans" },
      { value: "73%", label: "Repeat Engagement" },
      { value: "6+", label: "Live Buildings" },
    ],
    activityFeed: [
      { label: "New move-in opened the neighborhood guide", time: "1 hr ago" },
      { label: "Resident saved dinner nearby", time: "5 min ago" },
      { label: "Resident unlocked happy hour near Seaholm", time: "12 min ago" },
    ],
    analyticsFraming:
      "Resident access, QR scans by placement, nearby venue opens, perk saves, event RSVPs, return opens, access requests, and top nearby places.",
    intakeTargeting: "Resident onboarding + building QR access.",
    campaignType: "Building launch + neighborhood guide.",
    workspaceHref: "/partner-workspace/overview",
  },
  {
    key: "hotels",
    label: "Hotels",
    eyebrow: "Hotels",
    headline: "Extend the stay beyond the lobby.",
    body: [
      "Guests immediately ask the same question:",
      "What should we do nearby?",
      "Static recommendation lists go stale quickly.",
      "Downtown Perks gives guests a live nearby guide for restaurants, events, coffee, nightlife, wellness, and local experiences.",
      "It feels less like searching the internet and more like getting a useful local answer.",
    ],
    pricing: ["Starter $99/year", "Guest Experience $149/year", "Portfolio Custom"],
    cta: "Activate Guest Discovery",
    ctaHref: "/partners/hospitality",
    metrics: [
      { value: "8k+", label: "Guest Opens" },
      { value: "34%", label: "Conversion Rate" },
      { value: "4.1", label: "Avg Nearby Stops" },
    ],
    activityFeed: [
      { label: "Guest saved rooftop bar nearby", time: "8 min ago" },
      { label: "Visitor opened weekend event guide", time: "21 min ago" },
      { label: "Guest unlocked coffee perk downtown", time: "1 hr ago" },
    ],
    analyticsFraming:
      "Guest opens, nearby places, perk unlocks, saved places, walkable options, top nearby venues, return opens, RSVPs, and QR scans by placement.",
    intakeTargeting: "Guest discovery layer + concierge QR tracking.",
    campaignType: "Guest guide + lobby access path.",
    workspaceHref: "/partner-workspace/overview",
  },
  {
    key: "venues",
    label: "Venues",
    eyebrow: "Venues",
    headline: "Be nearby when people are ready.",
    body: [
      "Most local advertising reaches people too early, too broadly, or too late.",
      "Downtown Perks places venues near the moment someone is deciding where to go next.",
      "A nearby happy hour, a show before dinner, a patio after work, or a last-minute plan can become easy to act on.",
    ],
    pricing: ["Free Listing $0/year", "Basic $30/year", "Growth $79/year", "Pro $199/year"],
    cta: "Launch Venue Visibility",
    ctaHref: "/partners/venues",
    metrics: [
      { value: "24k+", label: "Visits" },
      { value: "41%", label: "Repeat Rate" },
      { value: "3.8%", label: "Avg Engagement" },
    ],
    activityFeed: [
      { label: "Resident unlocked dinner perk nearby", time: "Just now" },
      { label: "Saved happy hour near Rainey Street", time: "7 min ago" },
      { label: "Repeat visitor returned this week", time: "34 min ago" },
    ],
    analyticsFraming:
      "Detail opens, saves, directions, Show Card taps, redemptions, repeat engagement, peak windows, and offer performance.",
    intakeTargeting: "Venue listing + offer/perk + timing window.",
    campaignType: "Venue visibility + offer test.",
    workspaceHref: "/partner-workspace/campaigns",
  },
  {
    key: "brands",
    label: "Brands",
    eyebrow: "Brands",
    headline: "Buy the moment, not the impression.",
    body: [
      "Most media buys chase attention.",
      "Downtown Perks helps brands appear around real downtown plans.",
      "Campaigns can connect to events, neighborhoods, hotels, residential buildings, nightlife corridors, and walkable routes.",
      "The result is a local campaign people can understand, save, and use.",
    ],
    pricing: ["Starter $99/year", "Campaign $149/year", "Sponsorship Custom"],
    cta: "Run a Local Campaign",
    ctaHref: "/partners/brands",
    metrics: [
      { value: "15+", label: "Campaigns" },
      { value: "3.2x", label: "Avg ROI" },
      { value: "200+", label: "Burst Interactions" },
    ],
    activityFeed: [
      { label: "Festival campaign unlocked nearby", time: "3 min ago" },
      { label: "Resident opened branded activation", time: "18 min ago" },
      { label: "Weekend campaign reached 4 districts", time: "1 hr ago" },
    ],
    analyticsFraming:
      "Campaign views, detail opens, saves, unlocks, directions, RSVPs, redemptions, lift by corridor, and lift by time window.",
    intakeTargeting: "Sponsored corridor + campaign radius + activation report.",
    campaignType: "Sponsored corridor + activation report.",
    workspaceHref: "/partner-workspace/campaigns",
  },
  {
    key: "civic",
    label: "Civic",
    eyebrow: "Civic",
    headline: "Make local participation easier.",
    body: [
      "People miss good local programs because finding them takes too much effort.",
      "Downtown Perks makes civic events, public art, wellness programs, district campaigns, and community resources easier to find.",
      "The goal is simple: help more people know what is here and take part.",
    ],
    pricing: ["Community $30/year", "Program $99/year", "District Custom"],
    cta: "Coordinate Community Activity",
    ctaHref: "/partners/civic",
    metrics: [
      { value: "28k+", label: "Monthly Opens" },
      { value: "3.2k+", label: "Event RSVPs" },
      { value: "8+", label: "Active Organizations" },
    ],
    activityFeed: [
      { label: "Resident RSVP'd to downtown wellness event", time: "5 min ago" },
      { label: "Visitor opened district wayfinding guide", time: "22 min ago" },
      { label: "Community activation gained new enrollments", time: "2 hrs ago" },
    ],
    analyticsFraming:
      "Event views, RSVPs, saves, public resource opens, nearby business opens, and repeat participation.",
    intakeTargeting: "Event visibility + district participation + RSVP tracking.",
    campaignType: "District participation + RSVP tracking.",
    workspaceHref: "/partner-workspace/reports",
  },
];

export const intelligenceMetrics = [
  { value: "180k+", label: "Monthly Opens", window: "Last 30 days", source: "Downtown layer baseline", action: "Prioritize useful corridors." },
  { value: "52%", label: "Repeat Use", window: "Last 90 days", source: "Partner sample", action: "Tune offers around repeat windows." },
  { value: "40+", label: "Active Partners", window: "Current network", source: "Downtown Perks partner layer", action: "Fill coverage gaps by district." },
  { value: "3.2x", label: "Campaign ROI", window: "Pilot average", source: "Demo campaign benchmark", action: "Put budget near the moments people can use." },
];

export const analyticsCards = [
  { title: "Visibility", body: "See where partners are appearing across the live downtown layer." },
  { title: "Use", body: "Track saves, scans, RSVPs, unlocks, directions, and repeat visits." },
  { title: "Local Patterns", body: "Understand what people use by district, nearby area, time window, and entry point." },
  { title: "Action", body: "Use recommended next steps to adjust timing, offer, placement, and campaign radius." },
];

export const partnerFaqs = [
  {
    question: "Do residents need to download an app?",
    answer:
      "No. Downtown Perks is designed to reduce friction, not create more of it. Residents can access the experience through QR codes and mobile web flows.",
  },
  {
    question: "How do venues appear on the map?",
    answer:
      "Partners receive placement inside the live downtown layer based on category, location, timing, and nearby activity. Visibility becomes contextual instead of purely search-driven.",
  },
  {
    question: "Can this work across multiple buildings or locations?",
    answer:
      "Yes. The system supports multi-property portfolios, hospitality groups, venue networks, and multi-location activations.",
  },
  {
    question: "What metrics can partners actually see?",
    answer:
      "Scans, saves, repeat opens, timing, participation, and campaign results. The goal is practical reporting, not vanity metrics.",
  },
  {
    question: "How do campaigns work?",
    answer:
      "Choose one place, one audience, and one action. Publish it to the map, then review saves, scans, opens, directions, and redemptions.",
  },
  {
    question: "How does onboarding work?",
    answer:
      "Partners choose a category, connect listing details and QR entry points, publish perks or events where relevant, and use the workspace to tune visibility after launch.",
  },
];

export const intakeGoals = [
  "Improve resident engagement",
  "Increase repeat visits",
  "Promote an activation",
  "Guide hotel guests",
  "Increase nearby visibility",
  "Launch a local campaign",
  "Coordinate district participation",
];

export const organizationTypes = [
  { key: "properties", label: "Property" },
  { key: "hotels", label: "Hotel" },
  { key: "venues", label: "Venue" },
  { key: "brands", label: "Brand" },
  { key: "civic", label: "Civic organization" },
  { key: "real-estate", label: "Real estate / leasing" },
  { key: "custom", label: "Custom" },
];

export const intakeFields = [
  "Organization name",
  "Partner type",
  "Primary contact",
  "Email",
  "Phone",
  "Website",
  "Address or activation area",
  "Main goal",
  "Timeline",
  "Notes",
];
