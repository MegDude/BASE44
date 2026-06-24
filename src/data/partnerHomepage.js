export const partnerNavLinks = [
  { label: "Partners", href: "/map?mode=partner&tab=map&filter=All" },
  { label: "Dashboard", href: "/partners/dashboard" },
  { label: "Properties", href: "/map?mode=partner&tab=map&filter=Properties" },
  { label: "Hotels", href: "/partners/hospitality" },
  { label: "Venues", href: "/partners/venues" },
  { label: "Brands", href: "/map?mode=partner&tab=map&filter=Brands" },
  { label: "Civic", href: "/partners/civic" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/partners/campaigns" },
];

export const heroMetrics = [
  { value: "40+", label: "Active Partners" },
  { value: "180k+", label: "Monthly Interactions" },
  { value: "52%", label: "Repeat Engagement" },
];

export const operatingModelCards = [
  {
    title: "Live Discovery",
    body: "Nearby activity becomes visible in real time through one connected downtown layer.",
  },
  {
    title: "Map-Native Participation",
    body: "Residents, guests, and visitors interact with the city through spatial discovery instead of fragmented searching.",
  },
  {
    title: "Operational Visibility",
    body: "Partners understand movement, interaction, saves, scans, and repeat participation behavior.",
  },
];

export const partnerStates = [
  {
    key: "properties",
    label: "Properties",
    eyebrow: "PROPERTIES",
    headline: "You are not selling square footage. You are selling everything around it.",
    body: [
      "Residents do not experience downtown as isolated buildings.",
      "They experience it through routines, movement, convenience, events, coffee shops, restaurants, fitness studios, hospitality, and neighborhood energy.",
      "Downtown Perks gives properties a live neighborhood layer residents can actually use.",
      "Instead of static amenity lists, residents receive a connected map-native system for discovering what exists around them in real time.",
      "The result is stronger onboarding, stronger participation, and stronger neighborhood attachment.",
    ],
    pricing: ["Starter $99/year", "Core $149/year", "Portfolio Custom"],
    cta: "Bring This to Your Property",
    ctaHref: "/map?mode=partner&tab=map&filter=Properties",
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
      "Resident activations, QR scans by placement, nearby venue opens, perk saves, event RSVPs, return opens, access requests, and top nearby places.",
    intakeTargeting: "Resident onboarding + building QR access.",
    campaignType: "Building launch + neighborhood guide.",
    workspaceHref: "/partner-workspace/overview",
  },
  {
    key: "hotels",
    label: "Hotels",
    eyebrow: "HOTELS",
    headline: "Extend the stay beyond the lobby.",
    body: [
      "Guests immediately ask the same question:",
      "What should we do nearby?",
      "Most hotels still answer with static recommendations, printed lists, or disconnected links.",
      "Downtown Perks transforms nearby discovery into a live operational guest layer.",
      "Guests see nearby restaurants, events, experiences, nightlife, coffee shops, wellness, and local activity directly through one connected downtown map.",
      "The experience feels less like searching the internet and more like understanding the neighborhood in real time.",
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
      "Guest interactions, nearby opens, perk unlocks, guest saves, walkability, top nearby venues, return opens, RSVPs, and QR scans by placement.",
    intakeTargeting: "Guest discovery layer + concierge QR tracking.",
    campaignType: "Guest guide + lobby access path.",
    workspaceHref: "/partner-workspace/overview",
  },
  {
    key: "venues",
    label: "Venues",
    eyebrow: "VENUES",
    headline: "Be nearby when people are ready.",
    body: [
      "Most local advertising reaches people too early, too broadly, or too late.",
      "Downtown Perks places venues inside moments of real-world intent.",
      "People already nearby can discover your venue while actively deciding where to go next.",
      "This creates stronger visibility during high-intent moments instead of passive awareness campaigns.",
      "Not reach.",
      "Relevance.",
      "Not impressions.",
      "Intent.",
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
    eyebrow: "BRANDS",
    headline: "Buy the moment, not the impression.",
    body: [
      "Most media platforms optimize for attention.",
      "Downtown Perks optimizes for physical movement and contextual visibility.",
      "Campaigns appear around real-world activity: events, neighborhoods, hospitality zones, nightlife corridors, residential clusters, and walkable traffic patterns.",
      "This creates measurable local interaction tied directly to place and timing.",
      "The result is more intelligent local activation with clearer attribution and stronger contextual relevance.",
    ],
    pricing: ["Starter $99/year", "Campaign $149/year", "Sponsorship Custom"],
    cta: "Run a Local Campaign",
    ctaHref: "/map?mode=partner&tab=map&filter=Brands",
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
    eyebrow: "CIVIC",
    headline: "Make local participation easier.",
    body: [
      "Cities, districts, chambers, and community organizations all face the same challenge: people miss things because discovery takes too much effort.",
      "Downtown Perks creates a live participation layer residents can actually use.",
      "Events, public initiatives, activations, wellness programs, district campaigns, and neighborhood experiences become visible through one shared downtown system.",
      "The goal is not promotion.",
      "The goal is participation.",
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
      "Event views, RSVPs, attendance proxy, saves, public resource opens, district movement, nearby business engagement, and repeat participation.",
    intakeTargeting: "Event visibility + district participation + RSVP tracking.",
    campaignType: "District participation + RSVP tracking.",
    workspaceHref: "/partner-workspace/reports",
  },
];

export const intelligenceMetrics = [
  { value: "180k+", label: "Monthly Interactions", window: "Last 30 days", source: "Downtown layer baseline", action: "Prioritize high-return corridors." },
  { value: "52%", label: "Repeat Engagement", window: "Last 90 days", source: "Partner activity sample", action: "Tune offers around repeat windows." },
  { value: "40+", label: "Active Partners", window: "Current network", source: "Downtown Perks partner layer", action: "Fill coverage gaps by district." },
  { value: "3.2x", label: "Campaign ROI", window: "Pilot average", source: "Demo campaign benchmark", action: "Shift spend toward intent moments." },
];

export const analyticsCards = [
  { title: "Visibility", body: "See where partners are appearing across the live downtown layer." },
  { title: "Engagement", body: "Track saves, scans, RSVPs, unlocks, directions, and repeat behavior." },
  { title: "Movement", body: "Understand how activity changes by district, radius, time window, and source." },
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
      "Scans, saves, repeat interactions, engagement timing, participation patterns, and activation performance. The goal is operational visibility, not vanity metrics.",
  },
  {
    question: "How do campaigns work?",
    answer:
      "Campaigns are tied to audience, district, radius, timing, placement, and a measurable next action such as a save, RSVP, direction tap, card open, scan, or redemption.",
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
