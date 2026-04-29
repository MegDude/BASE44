export function getPartnerFlowForType(partnerType, context = {}) {
  switch (partnerType) {
    case "properties":
    case "property":
    case "building":
      return {
        type: "residential_onboarding",
        label: "Connect this property",
        partnerType: "properties",
        ...context,
      };
    case "hospitality":
    case "hotel":
      return {
        type: "hospitality_onboarding",
        label: "Use this for guests",
        partnerType: "hospitality",
        ...context,
      };
    case "venues":
    case "venue":
    case "perk":
    case "event":
      return {
        type: "venue_onboarding",
        label: "Add this venue",
        partnerType: "venues",
        ...context,
      };
    case "brands":
    case "brand":
    case "campaign":
      return {
        type: "brand_campaign",
        label: "Launch this campaign",
        partnerType: "brands",
        ...context,
      };
    case "civic":
    case "district":
      return {
        type: "civic_onboarding",
        label: "Start civic inquiry",
        partnerType: "civic",
        ...context,
      };
    case "resident":
      return {
        type: "resident_card",
        label: "Request resident access",
        partnerType: "resident",
        ...context,
      };
    default:
      return {
        type: "start_here",
        label: "Start here",
        partnerType: partnerType || "other",
        ...context,
      };
  }
}

export function getEntityInquiryFlow(entity, context = {}) {
  if (!entity) return null;

  const rawType = String(
    entity.partnerType ||
      entity.entityType ||
      entity.type ||
      entity.category ||
      ""
  ).toLowerCase();

  let inferredType = rawType;
  if (["property", "building", "listing"].includes(rawType)) inferredType = "property";
  if (["hotel", "hospitality"].includes(rawType)) inferredType = "hotel";
  if (["venue", "restaurant", "bar", "coffee", "wellness", "retail", "perk", "event"].includes(rawType)) inferredType = "venue";
  if (["brand", "campaign"].includes(rawType)) inferredType = "brand";
  if (["district", "civic"].includes(rawType)) inferredType = "civic";

  const entityName =
    entity.buildingName ||
    entity.propertyName ||
    entity.hotelName ||
    entity.venueName ||
    entity.brandName ||
    entity.title ||
    entity.name ||
    "";

  const baseContext = {
    sourceComponent: context.sourceComponent || "map_detail_panel",
    source: context.source || context.sourceComponent || "map_detail_panel",
    entity,
    district: entity.district || context.district || null,
    pageContext: {
      organization: entityName,
      propertyName: inferredType === "property" ? entityName : "",
      hotelName: inferredType === "hotel" ? entityName : "",
      venueName: inferredType === "venue" ? entityName : "",
      brandName: inferredType === "brand" ? entityName : "",
      initiative: inferredType === "civic" ? entityName : "",
      building: inferredType === "property" ? entityName : "",
      address: entity.address || "",
      district: entity.district || context.district || "",
      partnerType:
        inferredType === "property"
          ? "properties"
          : inferredType === "hotel"
            ? "hospitality"
            : inferredType === "venue"
              ? "venues"
              : inferredType === "brand"
                ? "brands"
                : inferredType === "civic"
                  ? "civic"
                  : "",
      objective:
        entity.shortInsight ||
        entity.summary ||
        entity.description ||
        "",
      perkTitle: entity.perkTitle || entity.perk?.title || "",
      perkValue: entity.perk_value || entity.perk?.value || "",
      perkDetails: entity.perkDetails || "",
      intent: inferredType === "venue" ? "Both" : "",
    },
  };

  return getPartnerFlowForType(inferredType, baseContext);
}
