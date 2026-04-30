export type PartnerTypeKey =
  | "properties"
  | "hospitality"
  | "venues"
  | "brands"
  | "civic";

export interface PartnerMetric {
  label: string;
  value: string;
}

export interface PartnerUseCase {
  title: string;
  body: string;
}

export interface PartnerCTA {
  label: string;
  href: string;
}

export interface PartnerTypeConfig {
  key: PartnerTypeKey;
  label: string;
  layerLabel: string;
  href: string;
  eyebrow: string;
  summary: string;
  highlight: string;
  heroTitle: string;
  heroBody: string;
  primaryCta: PartnerCTA;
  secondaryCta?: PartnerCTA;
  metrics: PartnerMetric[];
  useCases: PartnerUseCase[];
  platformPoints: string[];
}

export const partnerTypes: PartnerTypeConfig[] = [
  {
    key: "properties",
    label: "Properties",
    layerLabel: "Property Layer",
    href: "/partners/properties",
    eyebrow: "For Buildings & Residences",
    summary:
      "Make your address more useful. Connect residents to nearby places, events, and perks through one mapped neighborhood layer.",
    highlight: "Property views and resident actions",
    heroTitle: "Turn a building into a neighborhood.",
    heroBody:
      "Residents discover local perks, events, and neighbors through a map tied to where they live. Your property becomes part of the live downtown layer, not just an address.",
    primaryCta: { label: "Partner with us", href: "/partners/properties" },
    secondaryCta: { label: "See how it works", href: "/partners" },
    metrics: [
      { label: "Resident card adoption", value: "3×" },
      { label: "Avg. perks activated per resident", value: "7" },
      { label: "Neighborhood visibility lift", value: "+60%" },
    ],
    useCases: [
      {
        title: "Resident onboarding",
        body: "New residents discover local perks and neighborhood events from move-in day.",
      },
      {
        title: "Amenity visibility",
        body: "Surface building amenities alongside nearby destinations in a single map layer.",
      },
      {
        title: "Community activation",
        body: "Connect residents to district events and building-branded perks.",
      },
    ],
    platformPoints: [
      "Resident-facing map pinned to your property",
      "Card issuance and adoption tracking",
      "Building-branded perk visibility",
      "District event integration",
    ],
  },
  {
    key: "hospitality",
    label: "Hospitality",
    layerLabel: "Guest Layer",
    href: "/partners/hotels",
    eyebrow: "For Hotels & Short-Term Stays",
    summary:
      "Extend the stay beyond the lobby with one live map for dining, events, wellness, and nightlife.",
    highlight: "Guest opens and attributed visits",
    heroTitle: "Extend the stay beyond the lobby.",
    heroBody:
      "Guests scan once and get a curated downtown map — restaurants, events, perks — personalized to where they're staying.",
    primaryCta: { label: "Explore the guest layer", href: "/partners/hotels" },
    secondaryCta: { label: "View all partner types", href: "/partners" },
    metrics: [
      { label: "Avg. guest sessions per stay", value: "4.2" },
      { label: "Reduction in front-desk inquiries", value: "−40%" },
      { label: "Local business referrals driven", value: "2,100+" },
    ],
    useCases: [
      {
        title: "QR-based guest activation",
        body: "A single QR in the room launches a curated downtown guide — no app install required.",
      },
      {
        title: "Curated local recommendations",
        body: "Surface partner restaurants, venues, and events tailored to your guest profile.",
      },
      {
        title: "Perks-card upgrade path",
        body: "Offer repeat guests a Perks Card upgrade for extended neighborhood access.",
      },
    ],
    platformPoints: [
      "Hotel-specific QR onboarding flow",
      "Guest session analytics",
      "Curated nearby map layer",
      "Perk and event visibility for guests",
    ],
  },
  {
    key: "venues",
    label: "Venues",
    layerLabel: "Venue Layer",
    href: "/partners/venues",
    eyebrow: "For Restaurants, Bars & Event Spaces",
    summary:
      "Show up when intent is real. Appear in the map when people nearby are already deciding where to go.",
    highlight: "Map opens and physical visits",
    heroTitle: "Be the answer to what's next.",
    heroBody:
      "Residents and guests discover your venue through the Downtown Perks map at the exact moment they're deciding where to go.",
    primaryCta: { label: "List your venue", href: "/partners/venues" },
    secondaryCta: { label: "See all partner types", href: "/partners" },
    metrics: [
      { label: "Avg. impressions per week", value: "1,800" },
      { label: "In-map perk redemption rate", value: "12%" },
      { label: "Returning resident visits", value: "+28%" },
    ],
    useCases: [
      {
        title: "Happy hour activation",
        body: "Push time-sensitive perks to residents and guests nearby during off-peak hours.",
      },
      {
        title: "Event discovery",
        body: "Surface ticketed and free events to the map before they fill up.",
      },
      {
        title: "Private dining & buyouts",
        body: "Reach a curated audience of local residents and in-market hotel guests.",
      },
    ],
    platformPoints: [
      "Map pin with perk and event visibility",
      "Time-based perk activation",
      "Audience segmentation by proximity",
      "Redemption and impression analytics",
    ],
  },
  {
    key: "brands",
    label: "Brands",
    layerLabel: "Campaign Layer",
    href: "/partners/brands",
    eyebrow: "For Local & National Brands",
    summary:
      "Buy context, not broad reach. Run place-aware campaigns tied to buildings, venues, events, and districts.",
    highlight: "Map opens and source scans",
    heroTitle: "Run campaigns that live in the city.",
    heroBody:
      "Reach residents and visitors in context — near your location, your partner venue, or during relevant district events.",
    primaryCta: { label: "Explore brand partnership", href: "/partners/brands" },
    secondaryCta: { label: "See the platform", href: "/partners" },
    metrics: [
      { label: "Avg. campaign reach per district", value: "4,200" },
      { label: "Intent-to-visit lift", value: "+35%" },
      { label: "Perk redemption on activation", value: "8%" },
    ],
    useCases: [
      {
        title: "Grand opening activation",
        body: "Reach nearby residents and hotel guests with a localized launch campaign.",
      },
      {
        title: "Seasonal promotions",
        body: "Layer brand perks onto district events for contextual amplification.",
      },
      {
        title: "Loyalty crossover",
        body: "Connect existing loyalty programs to the Downtown Perks card layer.",
      },
    ],
    platformPoints: [
      "District-scoped campaign targeting",
      "Event-linked brand activation",
      "Perk-card integration",
      "Campaign performance dashboard",
    ],
  },
  {
    key: "civic",
    label: "Civic",
    layerLabel: "District Layer",
    href: "/partners/civic",
    eyebrow: "For Districts, BIDs & City Partners",
    summary:
      "Make participation visible. Surface district activity, event participation, and neighborhood data where people are already looking.",
    highlight: "RSVPs and repeat participation",
    heroTitle: "Scale the pulse of the district.",
    heroBody:
      "Downtown Perks gives civic organizations a live data layer — events, foot traffic, resident activation — visible across the entire district map.",
    primaryCta: { label: "Explore civic partnership", href: "/partners/civic" },
    secondaryCta: { label: "See all partner types", href: "/partners" },
    metrics: [
      { label: "District events surfaced per month", value: "40+" },
      { label: "Resident engagement with civic content", value: "22%" },
      { label: "New community programs activated", value: "12" },
    ],
    useCases: [
      {
        title: "Event calendar integration",
        body: "Push public and civic events directly to the resident and guest map layer.",
      },
      {
        title: "District foot traffic visibility",
        body: "Access aggregated, privacy-safe data on resident and visitor movement.",
      },
      {
        title: "Community program activation",
        body: "Promote neighborhood programs, sustainability initiatives, and community resources.",
      },
    ],
    platformPoints: [
      "District-wide event map layer",
      "Foot traffic and activation analytics",
      "Community program surfacing",
      "Civic partner dashboard",
    ],
  },
];

export const partnerTypesByKey: Record<PartnerTypeKey, PartnerTypeConfig> =
  Object.fromEntries(partnerTypes.map((p) => [p.key, p])) as Record<
    PartnerTypeKey,
    PartnerTypeConfig
  >;
