function textParts(entity = {}) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  return [
    entity.id,
    entity.name,
    entity.title,
    entity.type,
    entity.kind,
    entity.entityType,
    entity.category,
    entity.category_key,
    entity.subcategory,
    entity.partnerType,
    entity.detailDrawerType,
    raw.id,
    raw.name,
    raw.title,
    raw.type,
    raw.kind,
    raw.entityType,
    raw.category,
    raw.category_key,
    raw.subcategory,
    raw.partnerType,
    raw.detailDrawerType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function clean(value, fallback = "") {
  const text = String(value ?? "").trim();
  if (!text || /^(undefined|null|nan|\[object object\])$/i.test(text)) return fallback;
  return text;
}

function categoryForEntity(entity = {}, mode = "resident") {
  const text = textParts(entity);
  if (/\b(active listing|available listing|listing|rental|mls|unit|for rent|for sale)\b/.test(text)) return "listing";
  if (/\b(residential|property|building|condo|apartment|tower|residences)\b/.test(text)) return "property";
  if (/\b(event|rsvp|concert|market|show|class|tour|tonight)\b/.test(text)) return "event";
  if (/\b(perk|offer|discount|redeem|happy hour|inkind|in kind)\b/.test(text)) return "perk";
  if (mode === "partner" && /\b(campaign|activation|sponsor|brand)\b/.test(text)) return "campaign";
  if (/(retail|shop|store|boutique|market|bookpeople|whole foods|trader joe)/.test(text)) return "retail";
  if (/\b(coffee|cafe|espresso)\b/.test(text)) return "coffee";
  if (/\b(bar|cocktail|nightlife|music|brewery|beer|wine)\b/.test(text)) return "nightlife";
  if (/\b(restaurant|dining|sushi|taco|pizza|food|kitchen|grill|bistro|brunch|lunch|dinner)\b/.test(text)) return "dining";
  if (/\b(hotel|hospitality|guest|stay)\b/.test(text)) return "hotel";
  if (/\b(parking|garage|ev charging|mobility)\b/.test(text)) return "mobility";
  if (/\b(civic|park|public art|museum|library|trail|waterloo|republic square)\b/.test(text)) return "civic";
  if (/\b(service|salon|spa|cleaner|printing|pharmacy|shipping|wellness|fitness|gym|yoga)\b/.test(text)) return "service";
  return "place";
}

const CATEGORY_STANDARD = {
  dining: {
    label: "Dining",
    verb: "Reserve",
    eyebrow: "Bookable dining moment",
    promise: "Pick a time, route there, and keep the plan attached to the map.",
    primaryAction: "reserve",
    primaryLabel: "Reserve",
    intent: "booking",
    routeLabel: "Get directions",
    metrics: ["Table intent", "Walkable", "Resident-ready"],
    steps: ["Choose time", "Confirm party", "Arrive nearby"],
  },
  coffee: {
    label: "Coffee",
    verb: "Plan",
    eyebrow: "Fast nearby stop",
    promise: "Save it, route quickly, and keep a backup nearby.",
    primaryAction: "plan_visit",
    primaryLabel: "Plan stop",
    intent: "visit",
    routeLabel: "Route",
    metrics: ["Quick stop", "Morning fit", "Easy save"],
    steps: ["Save", "Route", "Check nearby"],
  },
  nightlife: {
    label: "Nightlife",
    verb: "Go",
    eyebrow: "Evening plan",
    promise: "Turn the venue into a clean night-out plan with directions and nearby context.",
    primaryAction: "plan_visit",
    primaryLabel: "Plan night",
    intent: "visit",
    routeLabel: "Route",
    metrics: ["After-work", "High intent", "Nearby options"],
    steps: ["Pick time", "Route", "Save backup"],
  },
  retail: {
    label: "Retail",
    verb: "Visit",
    eyebrow: "Retail stop",
    promise: "Save the store, get there fast, and keep relevant nearby places in reach.",
    primaryAction: "plan_visit",
    primaryLabel: "Plan visit",
    intent: "visit",
    routeLabel: "Route",
    metrics: ["Shopping", "Nearby", "Saveable"],
    steps: ["Save", "Route", "Explore nearby"],
  },
  event: {
    label: "Event",
    verb: "RSVP",
    eyebrow: "Event action",
    promise: "RSVP, save the plan, and route to the venue when it is time.",
    primaryAction: "rsvp",
    primaryLabel: "RSVP",
    intent: "rsvp",
    routeLabel: "Directions",
    metrics: ["Time-bound", "RSVP", "Calendar-ready"],
    steps: ["RSVP", "Save", "Arrive"],
  },
  perk: {
    label: "Perk",
    verb: "Claim",
    eyebrow: "Resident benefit",
    promise: "Make the offer easy to use, save, and redeem from the same panel.",
    primaryAction: "redeem",
    primaryLabel: "Claim",
    intent: "redemption",
    routeLabel: "Directions",
    metrics: ["Resident perk", "Redeemable", "Nearby"],
    steps: ["Open perk", "Show pass", "Redeem"],
  },
  property: {
    label: "Property",
    verb: "Request",
    eyebrow: "Residential request",
    promise: "Capture leasing or showing intent with the place, listing, and context attached.",
    primaryAction: "request_info",
    primaryLabel: "Request info",
    intent: "lead",
    routeLabel: "Tour route",
    metrics: ["High intent", "Listing context", "Agent-ready"],
    steps: ["Share timeline", "Attach listing", "Follow up"],
  },
  listing: {
    label: "Listing",
    verb: "Tour",
    eyebrow: "Listing request",
    promise: "Move from discovery to showing request without losing the unit context.",
    primaryAction: "request_tour",
    primaryLabel: "Request tour",
    intent: "lead",
    routeLabel: "View route",
    metrics: ["Unit-level", "Agent-ready", "Tour intent"],
    steps: ["Choose timeline", "Send request", "Schedule"],
  },
  hotel: {
    label: "Hotel",
    verb: "Send",
    eyebrow: "Guest action",
    promise: "Package the hotel with nearby dining, services, and guest-ready routes.",
    primaryAction: "concierge_request",
    primaryLabel: "Concierge request",
    intent: "lead",
    routeLabel: "Directions",
    metrics: ["Guest fit", "Concierge", "Nearby"],
    steps: ["Request", "Route", "Share plan"],
  },
  mobility: {
    label: "Mobility",
    verb: "Route",
    eyebrow: "Arrival utility",
    promise: "Get there cleanly, save the option, and keep the route attached.",
    primaryAction: "route",
    primaryLabel: "Start route",
    intent: "directions",
    routeLabel: "Start route",
    metrics: ["Arrival", "Utility", "Fast"],
    steps: ["Choose", "Route", "Arrive"],
  },
  civic: {
    label: "Civic",
    verb: "Explore",
    eyebrow: "Civic guide",
    promise: "Turn the stop into a walkable civic route with nearby context.",
    primaryAction: "explore",
    primaryLabel: "Explore",
    intent: "guide",
    routeLabel: "Directions",
    metrics: ["Routeable", "Public", "Guide-ready"],
    steps: ["Open guide", "Route", "Continue"],
  },
  service: {
    label: "Service",
    verb: "Request",
    eyebrow: "Local service",
    promise: "Save the service, route to it, or send a lightweight request.",
    primaryAction: "service_request",
    primaryLabel: "Request service",
    intent: "lead",
    routeLabel: "Directions",
    metrics: ["Errand", "Useful", "Nearby"],
    steps: ["Request", "Route", "Save"],
  },
  campaign: {
    label: "Campaign",
    verb: "Launch",
    eyebrow: "Partner activation",
    promise: "Keep campaign intent, audience, and map placement in one operational flow.",
    primaryAction: "campaign_request",
    primaryLabel: "Start campaign",
    intent: "campaign",
    routeLabel: "View placement",
    metrics: ["Audience", "Placement", "Measured"],
    steps: ["Choose audience", "Set offer", "Launch"],
  },
  place: {
    label: "Place",
    verb: "Plan",
    eyebrow: "Map action",
    promise: "Save, route, and act from one consistent panel.",
    primaryAction: "plan_visit",
    primaryLabel: "Plan visit",
    intent: "visit",
    routeLabel: "Directions",
    metrics: ["Nearby", "Saveable", "Useful"],
    steps: ["Open", "Save", "Route"],
  },
};

export function getMapPanelStandard(entity = {}, mode = "resident") {
  const category = categoryForEntity(entity, mode);
  const standard = CATEGORY_STANDARD[category] || CATEGORY_STANDARD.place;
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  const title = clean(entity.name || entity.title || raw.name || raw.title, "Downtown place");
  const subtitle = clean(
    [entity.category || raw.category || standard.label, entity.district || entity.neighborhood || raw.district || raw.neighborhood || "Downtown Austin"]
      .filter(Boolean)
      .join(" · "),
  );
  const address = clean(entity.address || raw.address || "");
  const website = clean(entity.website || entity.url || raw.website || raw.url || "");
  const phone = clean(entity.phone || raw.phone || raw.telephone || "");

  return {
    ...standard,
    category,
    mode,
    title,
    subtitle,
    address,
    website,
    phone,
    backendAction: standard.primaryAction,
    secondaryActions: [
      { id: "directions", label: standard.routeLabel, action: "directions" },
      { id: "save", label: "Save", action: "save" },
      ...(website ? [{ id: "website", label: "Website", action: "website", href: website }] : []),
      ...(phone ? [{ id: "phone", label: "Call", action: "phone", href: `tel:${phone}` }] : []),
    ],
  };
}

export function buildMapActionPayload({ entity, standard, action, mode, form = {}, sessionId, profileId }) {
  const raw = entity?.raw && typeof entity.raw === "object" ? entity.raw : {};
  const partnerId = entity?.partnerId || raw.partnerId || raw.partner_id || raw.ownerId || raw.owner_id || "";
  const workspaceId = entity?.workspaceId || raw.workspaceId || raw.workspace_id || partnerId || "";
  const campaignId = entity?.campaignId || raw.campaignId || raw.campaign_id || "";
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const route = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "";
  return {
    id: `${action}-${entity?.id || entity?.entityId || raw.id || "entity"}-${Date.now()}`,
    action,
    mode,
    sessionId,
    profileId,
    pageUrl,
    route,
    campaignId,
    partnerId,
    workspaceId,
    listingId: entity?.listingId || raw.listingId || raw.listing_id || "",
    entity: {
      id: entity?.id || entity?.entityId || raw.id || "",
      name: entity?.name || entity?.title || raw.name || raw.title || "",
      type: entity?.type || entity?.kind || entity?.entityType || standard?.category || "place",
      category: entity?.category || raw.category || standard?.label || "",
      district: entity?.district || entity?.neighborhood || raw.district || "",
      address: entity?.address || raw.address || "",
      partnerId,
      workspaceId,
      campaignId,
      brand: entity?.brand || raw.brand || raw.partnerName || raw.partner_name || "",
    },
    standard: {
      category: standard?.category,
      intent: standard?.intent,
      label: standard?.label,
    },
    form,
    metadata: {
      standardTitle: standard?.title,
      standardSubtitle: standard?.subtitle,
      standardPrimaryAction: standard?.primaryAction,
    },
    source: "map_standard_panel",
  };
}
