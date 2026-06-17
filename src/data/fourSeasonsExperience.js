const FOUR_SEASONS_BASE = {
  brand: "Four Seasons",
  partnerType: "hotels",
  neighborhood: "Downtown Core",
  district: "Downtown Core",
  address: "98 San Jacinto Blvd, Austin, TX 78701",
  source: "Downtown Perks Four Seasons Austin experience cluster",
};

const IMAGES = {
  hotel: "/images/entities/four-seasons/four-seasons-austin-luxury-hotel.webp",
  promotions: "/images/entities/four-seasons/four-seasons-promotions.webp",
  garden: "/images/entities/four-seasons/four-seasons-activation.jpg",
  picnic: "/images/entities/four-seasons/four-seasons.jpg",
  aerial: "/images/entities/four-seasons/four-seasons-aerial-view.webp",
  flights: "/images/entities/four-seasons/gallery/AUS_2439_aspect16x9.jpg",
  tea: "/images/entities/four-seasons/gallery/AUS_2423_aspect4x5.jpg",
  spa: "/images/entities/four-seasons/gallery/AUS_2500_original.jpg",
};

function categoryKey(parts) {
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
}

function fourSeasonsEntity(input) {
  const {
    id,
    kind,
    category,
    title,
    lat,
    lng,
    imageUrl,
    eyebrow,
    headline,
    subhead,
    description,
    scheduleLabel,
    highlights = [],
    residentPerk,
    primaryCta,
    relatedEntityIds = [],
    pinKey,
  } = input;

  return {
    ...FOUR_SEASONS_BASE,
    id,
    name: title,
    title,
    shortTitle: title,
    type: kind === "experience" ? "venue" : kind,
    kind,
    entityType: kind,
    sourceType: kind === "event" ? "event" : kind === "perk" ? "offer" : kind,
    markerType: kind,
    detailDrawerType: kind,
    pinKey,
    category,
    category_key: categoryKey(["four seasons", kind, category, title, eyebrow, ...highlights]),
    latitude: lat,
    longitude: lng,
    image: imageUrl,
    imageUrl,
    cardEyebrow: eyebrow,
    drawerHeadline: headline,
    summary: subhead,
    description,
    scheduleLabel,
    timing: scheduleLabel,
    offer: residentPerk?.copy,
    hasPerk: Boolean(residentPerk),
    perk: residentPerk
      ? {
          title: residentPerk.label,
          value: residentPerk.copy,
          description: residentPerk.copy,
          isActive: true,
        }
      : undefined,
    highlights,
    bestFor: highlights,
    knownFor: highlights,
    residentQuickFacts: [scheduleLabel, ...highlights].filter(Boolean).slice(0, 5),
    primaryAction: primaryCta?.label,
    secondaryAction: "Get Directions",
    website: primaryCta?.href,
    related: relatedEntityIds,
    relatedEntityIds,
    tags: ["Four Seasons", eyebrow, category, ...highlights],
    searchKeywords: [
      "four seasons austin",
      "four seasons downtown",
      title,
      category,
      eyebrow,
      ...highlights,
    ],
  };
}

export const FOUR_SEASONS_HOSPITALITY_ACCESS = fourSeasonsEntity({
  id: "four-seasons-austin",
  kind: "hotel",
  category: "Hotel",
  title: "Four Seasons Hotel Austin",
  lat: 30.2619,
  lng: -97.7423,
  imageUrl: IMAGES.hotel,
  eyebrow: "HOTEL",
  headline: "Four Seasons Austin",
  subhead: "A lakeside downtown stay with dining, spa, music, gardens, and seasonal experiences.",
  description: "Set along Lady Bird Lake, Four Seasons Austin connects guests and locals to a quieter side of downtown. Come for lakeside dining, spa treatments, afternoon tea, live music, and seasonal programming on the lawn.",
  highlights: ["Lakefront hotel", "Dining and cocktails", "Spa and wellness", "Seasonal experiences", "Steps from the trail"],
  primaryCta: {
    label: "View Experiences",
    href: "https://www.fourseasons.com/austin/",
  },
  relatedEntityIds: [
    "four-seasons-roses-and-rose",
    "four-seasons-flights-and-bites",
    "four-seasons-afternoon-tea",
    "four-seasons-honey-rose-ritual",
    "four-seasons-lakeside-picnic",
    "four-seasons-garden-sessions",
  ],
  pinKey: "four-seasons",
});

export const FOUR_SEASONS_EXPERIENCE_ENTITIES = [
  FOUR_SEASONS_HOSPITALITY_ACCESS,
  fourSeasonsEntity({
    id: "four-seasons-roses-and-rose",
    kind: "experience",
    category: "Seasonal",
    title: "Roses & Rosé",
    lat: 30.26198,
    lng: -97.74213,
    imageUrl: IMAGES.promotions,
    eyebrow: "SEASONAL EXPERIENCE",
    headline: "Roses & Rosé",
    subhead: "A spring garden moment with rosé, florals, music, dining, and lakeside views.",
    description: "Four Seasons Austin turns spring into a full-property experience with floral installations, rosé-forward menus, garden seating, and live music on the lawn. It works for an easy afternoon, golden-hour drink, or polished downtown date plan.",
    scheduleLabel: "February 12 - May 31, 2026",
    highlights: ["Pop-up rose gardens", "Rosé pours", "Garden seating", "Live music Fridays", "Dining and spa experiences"],
    primaryCta: {
      label: "See Seasonal Details",
      href: "https://www.fourseasons.com/austin/seasonal/spring-roses-and-rose/",
    },
    relatedEntityIds: ["four-seasons-flights-and-bites", "four-seasons-garden-sessions", "four-seasons-afternoon-tea"],
    pinKey: "campaign",
  }),
  fourSeasonsEntity({
    id: "four-seasons-flights-and-bites",
    kind: "perk",
    category: "Food + Drink",
    title: "Flights & Bites at Ciclo",
    lat: 30.26182,
    lng: -97.74208,
    imageUrl: IMAGES.flights,
    eyebrow: "FOOD + DRINK",
    headline: "Flights & Bites",
    subhead: "Rosé Champagne flights paired with polished small plates at Ciclo.",
    description: "A self-guided tasting built around rosé Champagne and seasonal bites. Pair the pours with Tuna Tiradito, Wagyu Anticucho, and Spanish Chorizo Croquetas, then stay for lake views or the rose garden outside.",
    scheduleLabel: "Daily, 5:00-6:00 PM",
    highlights: ["Rosé Champagne tasting", "Small plate pairings", "Indoor or garden seating", "Friday live music nearby"],
    residentPerk: {
      label: "Downtown Perks idea",
      copy: "Welcome rosé pour with a qualifying reservation.",
    },
    primaryCta: {
      label: "Reserve Flights & Bites",
      href: "https://www.opentable.com/booking/experiences-availability?rid=1026469&restref=1026469&experienceId=634594",
    },
    relatedEntityIds: ["four-seasons-roses-and-rose", "four-seasons-garden-sessions"],
    pinKey: "dining",
  }),
  fourSeasonsEntity({
    id: "four-seasons-garden-sessions",
    kind: "event",
    category: "Live Music",
    title: "Garden Sessions at Four Seasons",
    lat: 30.26176,
    lng: -97.74238,
    imageUrl: IMAGES.garden,
    eyebrow: "LIVE MUSIC",
    headline: "Golden hour on the lawn",
    subhead: "Local music, garden seating, rosé pours, and lake views every Friday evening.",
    description: "The Ciclo Lawn becomes an easy Friday landing spot with local music, blooming garden installations, and rosé served outside. It is low-lift, polished, and the kind of downtown plan people forget they needed.",
    scheduleLabel: "Fridays, 5:00-8:00 PM",
    highlights: ["Live local music", "Outdoor lawn setting", "Rose trailer", "Golden-hour views"],
    primaryCta: {
      label: "Add to Calendar",
      href: "https://www.fourseasons.com/austin/seasonal/spring-roses-and-rose/",
    },
    relatedEntityIds: ["four-seasons-roses-and-rose", "four-seasons-lakeside-picnic"],
    pinKey: "event",
  }),
  fourSeasonsEntity({
    id: "four-seasons-afternoon-tea",
    kind: "experience",
    category: "Dining",
    title: "Roses & Rosé A-Tea-X",
    lat: 30.26204,
    lng: -97.74243,
    imageUrl: IMAGES.tea,
    eyebrow: "AFTERNOON TEA",
    headline: "A-Tea-X at Live Oak",
    subhead: "A floral afternoon tea with scones, tea sandwiches, loose-leaf teas, and cocktails.",
    description: "Served inside Live Oak, this seasonal tea service is designed for slow afternoons and polished catch-ups. Expect delicate bites, fragrant teas, spring cocktails, and a rose-adorned lounge setting.",
    scheduleLabel: "Daily, 1:00-3:00 PM",
    highlights: ["Afternoon tea", "Seasonal scones", "Tea sandwiches", "Loose-leaf teas", "Floral cocktails"],
    residentPerk: {
      label: "Downtown Perks idea",
      copy: "Complimentary sparkling rosé with a qualifying tea reservation.",
    },
    primaryCta: {
      label: "Reserve Afternoon Tea",
      href: "https://www.opentable.com/booking/experiences-availability?rid=1027306&restref=1027306&experienceId=633051",
    },
    relatedEntityIds: ["four-seasons-roses-and-rose", "four-seasons-flights-and-bites"],
    pinKey: "dining",
  }),
  fourSeasonsEntity({
    id: "four-seasons-lakeside-picnic",
    kind: "experience",
    category: "Leisure",
    title: "Lakeside Picnic Experience",
    lat: 30.26167,
    lng: -97.74222,
    imageUrl: IMAGES.picnic,
    eyebrow: "OUTDOOR EXPERIENCE",
    headline: "Picnic by the lake",
    subhead: "A curated lawn picnic with rosé, music, and downtown lake views.",
    description: "Hotel guests can book a prepared picnic setup on the lawn with a bottle of rosé and a portable speaker. It is built for slower afternoons, date plans, and small celebrations without leaving downtown.",
    highlights: ["Luxury picnic setup", "Bottle of rosé", "Portable speaker", "Lawn seating", "Lake views"],
    residentPerk: {
      label: "Downtown Perks idea",
      copy: "Complimentary dessert add-on with a qualifying picnic booking.",
    },
    primaryCta: {
      label: "Plan Picnic",
      href: "https://www.fourseasons.com/austin/",
    },
    relatedEntityIds: ["four-seasons-austin", "four-seasons-garden-sessions"],
    pinKey: "park",
  }),
  fourSeasonsEntity({
    id: "four-seasons-honey-rose-ritual",
    kind: "perk",
    category: "Wellness",
    title: "Honey Rose Ritual",
    lat: 30.26188,
    lng: -97.74255,
    imageUrl: IMAGES.spa,
    eyebrow: "SPA",
    headline: "Honey Rose Ritual",
    subhead: "An 80-minute seasonal spa treatment with rose oils, grapefruit, and a honey foot scrub.",
    description: "A spring reset at The Spa, designed to soften the edges of the week. The treatment combines grapefruit and rose oils with restorative massage, then finishes with a honey foot scrub and pressure-point massage.",
    highlights: ["80-minute treatment", "Rose and grapefruit oils", "Honey foot scrub", "Pressure-point massage", "Seasonal wellness offer"],
    residentPerk: {
      label: "Downtown Perks idea",
      copy: "Complimentary seasonal enhancement with a qualifying spa booking.",
    },
    primaryCta: {
      label: "Book Treatment",
      href: "https://www.fourseasons.com/austin/spa/seasonal_treatments/",
    },
    relatedEntityIds: ["four-seasons-austin", "four-seasons-roses-and-rose"],
    pinKey: "wellness",
  }),
];

export const FOUR_SEASONS_WEEK_CAMPAIGN = {
  id: "campaign-four-seasons-week",
  name: "Four Seasons Week",
  title: "Four Seasons Week",
  slug: "four-seasons-week",
  type: "campaign",
  kind: "campaign",
  entityType: "campaign",
  sourceType: "campaign",
  markerType: "campaign",
  detailDrawerType: "campaign",
  pinKey: "campaign",
  campaignType: "series",
  sponsorId: "four-seasons-austin",
  sponsorName: "Four Seasons Austin",
  sponsorLogo: IMAGES.hotel,
  description: "A resident-facing week of lakeside dining, garden music, afternoon tea, spa treatments, and outdoor moments at Four Seasons Austin.",
  summary: "Dining, spa, music, and lakeside plans at Four Seasons Austin.",
  neighborhood: ["Downtown Core", "Waterfront"],
  district: "Downtown Core",
  address: "98 San Jacinto Blvd, Austin, TX 78701",
  latitude: 30.2619,
  longitude: -97.7423,
  startDate: "2026-08-01",
  endDate: "2026-08-07",
  status: "upcoming",
  reward: "Resident hospitality benefits",
  participatingEntities: FOUR_SEASONS_EXPERIENCE_ENTITIES.map((entity) => entity.id),
  campaignPins: ["campaign-four-seasons-week", ...FOUR_SEASONS_EXPERIENCE_ENTITIES.map((entity) => entity.id)],
  campaignColor: "#C8A96A",
  image: IMAGES.promotions,
  imageUrl: IMAGES.promotions,
  primaryAction: "Explore Experiences",
  secondaryAction: "Get Directions",
  rewardLabel: "Resident dining, spa, and seasonal hospitality access",
  stats: ["Dining", "Spa", "Garden music", "Afternoon tea", "Lakefront"],
  tags: ["Campaigns", "Four Seasons", "Hospitality", "Dining", "Spa", "Waterfront"],
  searchKeywords: ["four seasons week", "four seasons austin", "spa experiences nearby", "afternoon tea", "garden sessions"],
  residentSearchIntents: ["Four Seasons", "Hospitality", "Wellness", "Dining", "Waterfront"],
  source: "Downtown Perks Four Seasons Austin experience cluster",
};

export function getFourSeasonsExperienceUpdate(item) {
  const text = [item?.id, item?.slug, item?.name, item?.title, item?.brand, item?.raw?.id, item?.raw?.name, item?.raw?.title]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!text) return null;
  const isResidentialFourSeasons =
    text.includes("four seasons residences") ||
    text.includes("four-seasons-residences") ||
    text.includes("rental-four-seasons") ||
    text.includes("mls");
  if (isResidentialFourSeasons) return null;

  if (
    text.includes("four seasons hotel austin") ||
    text.includes("partner-four-seasons") ||
    text.includes("four-seasons-congress-guest-dining-campaign") ||
    text.includes("four seasons guest dining campaign")
  ) {
    return {
      ...FOUR_SEASONS_HOSPITALITY_ACCESS,
      id: item?.id || FOUR_SEASONS_HOSPITALITY_ACCESS.id,
      name: item?.name || FOUR_SEASONS_HOSPITALITY_ACCESS.name,
      title: item?.title || item?.name || FOUR_SEASONS_HOSPITALITY_ACCESS.title,
    };
  }

  return null;
}
