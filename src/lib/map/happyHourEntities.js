import happyHourCatalog from "@/data/generated/happyHourCatalog.json";
import { dedupeVenues } from "@/lib/map/dedupeVenues";
import { getValidLatLng } from "@/lib/map/coordinates";

function toHappyHourEntity(item) {
  const coords = getValidLatLng(item);
  if (!coords) return null;
  const detailText = `${item.specialLabel || ""} ${item.summary || ""}`.toLowerCase();
  const hasFoodDeals = /food|pizza|burger|taco|bite|menu|snack|appetizer/.test(detailText);
  const hasDrinkDeals = /drink|cocktail|beer|wine|martini|margarita|spirit|pour/.test(detailText);
  const hasResidentPerk = /resident|member|card/.test(detailText);
  const offerType = item.hasPublicSpecial
    ? hasResidentPerk
      ? "resident_perk"
      : hasFoodDeals && !hasDrinkDeals
        ? "food_special"
        : hasDrinkDeals && !hasFoodDeals
          ? "drink_special"
          : "happy_hour"
    : "limited_time_offer";

  return {
    id: item.id,
    entity_id: item.id,
    name: item.name,
    title: item.name,
    kind: item.kind,
    specialLabel: item.specialLabel,
    operatingHours: item.operatingHours,
    summary: item.summary,
    isSpeakeasy: Boolean(item.isSpeakeasy),
    type: item.kind === "hotel" ? "hotel" : item.hasPublicSpecial ? "perk" : "venue",
    entity_type: item.kind === "hotel" ? "hotel" : item.hasPublicSpecial ? "perk" : "venue",
    category:
      item.kind === "restaurant"
        ? "restaurant"
        : item.kind === "hotel"
          ? "hotel"
          : item.kind === "speakeasy"
            ? "nightlife"
            : "bar",
    description: item.specialLabel || item.summary,
    address: item.address,
    district: item.district,
    website: item.website,
    hours: item.operatingHours,
    location: {
      latitude: coords.lat,
      longitude: coords.lng,
      valid: true,
    },
    latitude: coords.lat,
    longitude: coords.lng,
    isOpenNow: false,
    isPlotted: true,
    isVisibleInResults: true,
    hasPublicSpecial: Boolean(item.hasPublicSpecial),
    offer_type: offerType,
    perk_value: item.hasPublicSpecial ? item.specialLabel : "",
    markerType: item.kind === "hotel" ? "building" : item.hasPublicSpecial ? "perk" : "standard",
    iconType:
      item.kind === "restaurant"
        ? "restaurant"
        : item.kind === "hotel"
          ? "hotel"
          : "nightlife",
    metadata: {
      walkMinutes: null,
      popularity: item.hasPublicSpecial ? 72 : 38,
      offer_type: offerType,
      hasActiveSpecials: Boolean(item.hasPublicSpecial),
      tags: [
        "happy-hour",
        item.kind,
        item.category,
        item.district,
        item.hasPublicSpecial ? "with-specials" : "needs-details",
        hasFoodDeals ? "food-deals" : null,
        hasDrinkDeals ? "drink-deals" : null,
        hasResidentPerk ? "resident-perks" : null,
      ].filter(Boolean),
      searchKeywords: [
        item.name,
        item.address,
        item.specialLabel,
        item.operatingHours,
        item.kind,
        item.district,
        "happy hour",
      ].filter(Boolean),
      offerDetail: item.specialLabel,
      needsOfferDetails: !item.hasPublicSpecial,
    },
  };
}

export function getHappyHourEntities() {
  return dedupeVenues(happyHourCatalog, (item) => getValidLatLng(item))
    .map(toHappyHourEntity)
    .filter(Boolean);
}
