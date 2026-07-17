function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalized(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const RESIDENT_ONLY_COPY = /\b(show your (?:card|resident pass)|resident perk|resident card|resident pass|redeem perk|claim perk|save this place|worth visiting|your resident benefit|verified resident)\b/i;

function partnerSafe(value) {
  const text = clean(value);
  return text && !RESIDENT_ONLY_COPY.test(text) ? text : "";
}

function isRepeated(value, accepted) {
  const key = normalized(value);
  if (!key) return true;
  return accepted.some((existing) => {
    const existingKey = normalized(existing);
    return existingKey === key || (key.length > 42 && existingKey.length > 42 && (existingKey.includes(key) || key.includes(existingKey)));
  });
}

export function dedupePartnerPanelCopy(copy) {
  const accepted = [];
  const result = { ...copy };
  for (const key of ["title", "value", "description", "terms", "audience", "timing", "placement", "action"]) {
    const value = clean(copy?.[key]);
    if (!value || isRepeated(value, accepted)) {
      result[key] = "";
      continue;
    }
    result[key] = value;
    accepted.push(value);
  }
  return result;
}

function partnerKind(place) {
  const text = [place?.partnerType, place?.type, place?.kind, place?.entityType, place?.category, place?.category_key, place?.destinationKind]
    .map(normalized)
    .join(" ");
  if (/real estate|listing|rental|residential|property|apartment|condo/.test(text)) return "property";
  if (/civic|park|public place|art|museum|trail|community/.test(text)) return "civic";
  if (/event|festival|concert|market/.test(text)) return "event";
  if (/hotel|hospitality|resort/.test(text)) return "hotel";
  if (/restaurant|dining|bar|coffee|food/.test(text)) return "dining";
  if (/brand|retail|shop|store/.test(text)) return "brand";
  if (/wellness|fitness|spa|health/.test(text)) return "wellness";
  if (/parking|garage/.test(text)) return "parking";
  return "partner";
}

const templates = {
  property: {
    category: "Property performance",
    audience: "Qualified renters, buyers, residents, relocation clients, and agents exploring the surrounding neighborhood.",
    objective: "Connect listing interest to neighborhood context, tours, inquiries, and measurable lead actions.",
    timing: "Prioritize live inventory, open-house windows, relocation cycles, and high-intent neighborhood searches.",
    action: "Manage listing visibility",
  },
  civic: {
    category: "Civic participation",
    audience: "Downtown residents, visitors, volunteers, supporters, and community partners.",
    objective: "Grow participation in public programs, routes, events, learning, and stewardship.",
    timing: "Coordinate around published programs, seasonal conditions, event windows, and route activity.",
    action: "Manage civic programming",
  },
  event: {
    category: "Event operations",
    audience: "Nearby residents, visitors, ticket holders, hotel guests, and people planning the same date.",
    objective: "Convert discovery into RSVPs, ticket actions, directions, check-ins, and post-event follow-up.",
    timing: "Use the on-sale, reminder, day-of, and post-event windows as separate campaign moments.",
    action: "Manage event campaign",
  },
  hotel: {
    category: "Guest experience",
    audience: "Current guests, future guests, meeting attendees, nearby residents, and concierge teams.",
    objective: "Connect the stay to dining, wellness, events, reservations, and measurable neighborhood discovery.",
    timing: "Focus on pre-arrival, check-in, evening planning, weekends, and group-event windows.",
    action: "Manage guest visibility",
  },
  dining: {
    category: "Dining performance",
    audience: "Nearby residents, office teams, hotel guests, eventgoers, and people deciding where to eat or meet.",
    objective: "Turn nearby intent into reservations, walk-ins, offer claims, directions, and repeat visits.",
    timing: "Use lunch, happy hour, dinner, late-night, and pre-event demand as distinct activation windows.",
    action: "Manage dining campaign",
  },
  brand: {
    category: "Brand activation",
    audience: "Downtown shoppers, residents, visitors, hotel guests, and event audiences close enough to act.",
    objective: "Connect the brand to a specific visit, appointment, purchase, sample, scan, or event action.",
    timing: "Coordinate around launches, weekends, event traffic, retail peaks, and limited-time availability.",
    action: "Manage brand activation",
  },
  wellness: {
    category: "Wellness growth",
    audience: "Nearby residents, employees, hotel guests, members, and people actively planning a wellness visit.",
    objective: "Convert local discovery into bookings, trial visits, memberships, offer claims, and repeat sessions.",
    timing: "Focus on mornings, lunch breaks, after-work windows, weekends, and seasonal wellness goals.",
    action: "Manage wellness offer",
  },
  parking: {
    category: "Parking demand",
    audience: "Drivers heading to nearby events, restaurants, hotels, workplaces, and downtown destinations.",
    objective: "Turn arrival intent into reservations, directions, verified entry, and repeat use.",
    timing: "Match availability to event arrivals, dinner peaks, commuter windows, and weekend demand.",
    action: "Manage parking availability",
  },
  partner: {
    category: "Partner opportunity",
    audience: "Nearby residents, visitors, guests, workers, and downtown decision-makers.",
    objective: "Turn local discovery into a clear, measurable customer or community action.",
    timing: "Use live availability, nearby activity, events, and audience signals to choose the next activation window.",
    action: "Manage partner content",
  },
};

export function resolvePartnerPanelCopy(place) {
  const kind = partnerKind(place);
  const template = templates[kind];
  const panel = place?.partnerPanel || place?.raw?.partnerPanel || place?.panel_content || {};
  const name = clean(place?.name || place?.title || "This partner");
  const district = clean(place?.district || place?.neighborhood || place?.raw?.district || "Downtown Austin");
  const summary = partnerSafe(
    panel.summary ||
    panel.opportunity ||
    place?.partnerInsight ||
    place?.raw?.partnerInsight ||
    place?.description ||
    place?.summary,
  );
  const copy = {
    category: partnerSafe(panel.category) || template.category,
    title: partnerSafe(panel.title) || `${name} operating opportunity`,
    value: partnerSafe(panel.objective) || template.objective,
    description: summary || `${name} can use its ${district} map presence to support ${template.objective.charAt(0).toLowerCase()}${template.objective.slice(1)}`,
    terms: partnerSafe(panel.opportunity) || template.objective,
    audience: partnerSafe(panel.audience) || template.audience,
    timing: partnerSafe(panel.timing) || template.timing,
    placement: partnerSafe(panel.placement) || `${district} map, search, collections, routes, and partner reporting.`,
    action: partnerSafe(panel.primaryActionLabel || panel.action) || template.action,
  };
  return dedupePartnerPanelCopy(copy);
}

export function partnerContentSlug(place) {
  return clean(place?.ownerSlug || place?.organization_slug || place?.organizationSlug || place?.slug || place?.id)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
