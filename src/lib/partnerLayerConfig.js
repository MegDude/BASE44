export const PARTNER_LAYER_META = {
  properties: {
    routeKey: "properties",
    apiType: "property",
    sourceLabel: "Building access performance",
    listLabel: "Properties",
    viewsLabel: "Property views",
    actionsLabel: "Resident actions",
    unlocksLabel: "Perk unlocks",
    accessLabel: "Access points",
  },
  hospitality: {
    routeKey: "hospitality",
    apiType: "hotel",
    sourceLabel: "QR source performance",
    listLabel: "Hotels",
    viewsLabel: "Hotel views",
    actionsLabel: "Guest actions",
    unlocksLabel: "Offer unlocks",
    accessLabel: "QR touchpoints",
  },
  venues: {
    routeKey: "venues",
    apiType: "venue",
    sourceLabel: "Inbound source performance",
    listLabel: "Venues",
    viewsLabel: "Venue views",
    actionsLabel: "Guest actions",
    unlocksLabel: "Offer unlocks",
    accessLabel: "Source touchpoints",
  },
  brands: {
    routeKey: "brands",
    apiType: "brand",
    sourceLabel: "Campaign source performance",
    listLabel: "Campaigns",
    viewsLabel: "Brand views",
    actionsLabel: "Campaign actions",
    unlocksLabel: "Conversions",
    accessLabel: "Campaign sources",
  },
  civic: {
    routeKey: "civic",
    apiType: "civic",
    sourceLabel: "District source performance",
    listLabel: "District nodes",
    viewsLabel: "District views",
    actionsLabel: "Civic actions",
    unlocksLabel: "Activations",
    accessLabel: "Access points",
  },
};

export function getPartnerLayerMeta(contentId) {
  return PARTNER_LAYER_META[contentId] || PARTNER_LAYER_META.properties;
}
