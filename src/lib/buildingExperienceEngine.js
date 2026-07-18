import {
  BUILDING_AMENITY_GROUPS,
  BUILDING_CAMPAIGN_RULES,
  BUILDING_COLLECTION_RULES,
  BUILDING_IDENTITY_RULES,
} from "../data/buildingExperienceCatalog.js";

const EARTH_RADIUS_METERS = 6371000;

function list(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  return String(value || "").split(/\s*[;|]\s*/).map((item) => item.trim()).filter(Boolean);
}

function entityText(entity) {
  const raw = entity?.raw || {};
  return [
    entity?.id, entity?.name, entity?.title, entity?.type, entity?.kind, entity?.category, entity?.district,
    entity?.summary, entity?.description, entity?.offer, entity?.deals_offers,
    ...list(entity?.tags), ...list(entity?.searchKeywords), ...list(raw.tags), ...list(raw.searchKeywords),
  ].filter(Boolean).join(" ").toLowerCase();
}

function matchesTerms(text, terms) {
  return terms.some((term) => text.includes(term));
}

function number(value) {
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

function coordinates(entity) {
  const raw = entity?.raw || {};
  return {
    latitude: number(entity?.latitude ?? entity?.lat ?? raw.latitude ?? raw.lat),
    longitude: number(entity?.longitude ?? entity?.lng ?? raw.longitude ?? raw.lng),
  };
}

function distanceMeters(origin, target) {
  const a = coordinates(origin);
  const b = coordinates(target);
  if ([a.latitude, a.longitude, b.latitude, b.longitude].some((value) => value === null)) return Number.POSITIVE_INFINITY;
  const toRadians = (value) => value * Math.PI / 180;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const haversine = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(haversine));
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    const id = String(item?.id || item?.name || "");
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function isEvent(entity) {
  return /\bevent\b/.test(entityText(entity));
}

function isCampaign(entity) {
  return /\bcampaign\b/.test(entityText(entity));
}

function hasActivePerk(entity) {
  const raw = entity?.raw || {};
  return Boolean(entity?.perk?.isActive !== false && (entity?.perk?.title || entity?.offer || entity?.deals_offers || entity?.hasPerk || raw.hasPerk));
}

function buildIdentity(building, sourceText) {
  const explicit = list(building?.buildingIdentity || building?.identityTags || building?.residentContextLabels);
  const inferred = BUILDING_IDENTITY_RULES.filter((rule) => matchesTerms(sourceText, rule.terms)).map((rule) => rule.label);
  return [...new Set([...explicit, ...inferred])].slice(0, 5);
}

function buildAmenities(building) {
  const source = list(building?.sharedAmenities || building?.amenities || building?.raw?.sharedAmenities || building?.raw?.amenities);
  const assigned = new Set();
  const groups = BUILDING_AMENITY_GROUPS.map((group) => {
    const amenities = source.filter((amenity) => {
      const matches = matchesTerms(amenity.toLowerCase(), group.terms);
      if (matches) assigned.add(amenity);
      return matches;
    });
    return { id: group.id, title: group.label, amenities };
  });
  const other = source.filter((amenity) => !assigned.has(amenity));
  if (other.length) groups.push({ id: "building", title: "Building", amenities: other });
  return groups.filter((group) => group.amenities.length);
}

function buildCollections(building, candidates, sourceText) {
  return BUILDING_COLLECTION_RULES.map((rule) => {
    const places = candidates
      .filter((candidate) => !isCampaign(candidate) && !isEvent(candidate) && matchesTerms(entityText(candidate), rule.terms))
      .sort((a, b) => distanceMeters(building, a) - distanceMeters(building, b))
      .slice(0, 6);
    const score = places.length * 10 + (matchesTerms(sourceText, rule.terms) ? 5 : 0);
    return { ...rule, places, score };
  }).sort((a, b) => b.score - a.score).slice(0, 7);
}

function buildCampaigns(building, candidates, sourceText) {
  const buildingId = String(building?.id || "");
  const district = String(building?.district || "").toLowerCase();
  const live = candidates.filter((candidate) => {
    if (!isCampaign(candidate)) return false;
    const participants = list(candidate?.participatingEntities || candidate?.campaignPins || candidate?.raw?.participatingEntities);
    return participants.includes(buildingId) || (district && entityText(candidate).includes(district));
  }).slice(0, 4).map((campaign) => ({
    id: campaign.id,
    title: campaign.name || campaign.title,
    family: campaign.campaignType || "Live campaign",
    status: campaign.status || "Live",
    source: "canonical",
    entity: campaign,
  }));

  const explicit = list(building?.partnerCampaigns || building?.campaignAlignment).map((title, index) => ({
    id: `property-${buildingId}-campaign-${index}`,
    title,
    family: "Building recommendation",
    status: "Recommended",
    source: "building-metadata",
    audience: "Building residents",
    propertyId: buildingId,
    radiusMeters: 1600,
    time: "Schedule in Workspace",
    partnerEligibility: "Approved nearby partners",
  }));

  const rules = BUILDING_CAMPAIGN_RULES.filter((rule) => matchesTerms(sourceText, rule.terms)).map((rule) => ({
    ...rule,
    id: `${buildingId}-${rule.id}`,
    status: "Recommended",
    source: "experience-rule",
    propertyId: buildingId,
    partnerEligibility: "Active partners matching this building and radius",
  }));

  return uniqueById([...live, ...explicit, ...rules]).slice(0, 6);
}

function buildRoutes(building, routeDefinitions, sourceText) {
  const explicitIds = new Set(list(building?.routeIds || building?.raw?.routeIds));
  return routeDefinitions
    .map((route) => {
      const text = `${route.title || ""} ${route.summary || ""} ${route.category || ""} ${route.neighborhood || ""}`.toLowerCase();
      const score = (explicitIds.has(route.id) ? 20 : 0) + (building?.district && text.includes(String(building.district).toLowerCase()) ? 8 : 0) + (matchesTerms(sourceText, text.split(/\W+/).filter((term) => term.length > 5)) ? 2 : 0);
      return { ...route, score };
    })
    .filter((route) => route.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

export function createBuildingExperience(building, options = {}) {
  const candidates = uniqueById((options.places || []).filter((candidate) => candidate?.id && candidate.id !== building?.id));
  const sourceText = [entityText(building), ...list(building?.sharedAmenities), ...list(building?.residentRoutines), ...list(building?.residentGoodFor)].join(" ").toLowerCase();
  const nearby = candidates
    .filter((candidate) => !isCampaign(candidate) && !isEvent(candidate))
    .map((candidate) => ({ ...candidate, buildingDistanceMeters: distanceMeters(building, candidate) }))
    .filter((candidate) => candidate.buildingDistanceMeters <= (options.nearbyRadiusMeters || 2200))
    .sort((a, b) => a.buildingDistanceMeters - b.buildingDistanceMeters)
    .slice(0, 8);
  const events = candidates.filter(isEvent).sort((a, b) => distanceMeters(building, a) - distanceMeters(building, b)).slice(0, 5);
  const perks = candidates.filter(hasActivePerk).sort((a, b) => distanceMeters(building, a) - distanceMeters(building, b)).slice(0, 6);

  return {
    buildingId: building?.id,
    identity: buildIdentity(building, sourceText),
    amenities: buildAmenities(building),
    collections: buildCollections(building, candidates, sourceText),
    campaigns: buildCampaigns(building, candidates, sourceText),
    perks,
    events,
    routes: buildRoutes(building, options.routeDefinitions || [], sourceText),
    nearby,
    guide: {
      summary: building?.residentOverview || building?.overview || building?.summary || "",
      routines: list(building?.residentRoutines || building?.hiddenGems).slice(0, 4),
      goodFor: list(building?.residentGoodFor || building?.campaignAlignment).slice(0, 5),
    },
    analytics: {
      summary: building?.analytics_summary || building?.analyticsSummary || building?.partnerPerformance || null,
      relationshipIds: {
        entityId: building?.id || null,
        propertyId: building?.property_id || building?.propertyId || building?.id || null,
        buildingId: building?.building_id || building?.buildingId || building?.id || null,
        partnerId: building?.partner_id || building?.partnerId || null,
        workspaceId: building?.workspace_id || building?.workspaceId || null,
      },
      events: ["building_viewed", "collection_opened", "campaign_opened", "route_started", "perk_saved", "perk_redeemed"],
    },
  };
}
