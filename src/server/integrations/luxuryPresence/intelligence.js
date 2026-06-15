import { optOutActivityTypes } from "./activityMap.js";

export const buyerIntentScore = {
  VIEW_LISTING: 1,
  HOME_SEARCH: 5,
  ADD_SEARCH: 5,
  ADD_FAVORITE: 10,
  SHARE_LISTING: 8,
  SHARE_PRIVATE_LISTING: 12,
  CONTACT_INQUIRY: 25,
  PROPERTY_ACCESS: 35,
};

export const sellerIntentScore = {
  HOME_VALUE: 50,
  CONTACT_INQUIRY: 25,
};

export function getFollowUpPriority(activityType) {
  const type = String(activityType || "").toUpperCase();
  if (["CONTACT_INQUIRY", "PROPERTY_ACCESS", "HOME_VALUE"].includes(type)) return 90;
  if (type === "ADD_FAVORITE") return 55;
  if (type === "VIEW_LISTING") return 20;
  return 0;
}

export function getFollowUpReason(normalized) {
  const type = String(normalized?.activityType || "").toUpperCase();
  if (type === "CONTACT_INQUIRY") return "Contact inquiry needs agent follow-up.";
  if (type === "PROPERTY_ACCESS") return "Private or gated property access request indicates high intent.";
  if (type === "HOME_VALUE") return "Home valuation request indicates seller intent.";
  if (type === "ADD_FAVORITE") return "Saved property indicates repeat buyer interest.";
  if (type === "VIEW_LISTING") return "Listing view should be monitored for repeat engagement.";
  return "Lead activity signal should be reviewed.";
}

export function isSuppressionSignal(activityType) {
  return optOutActivityTypes.has(String(activityType || "").toUpperCase());
}

export function getListingDemandDelta(activityType) {
  const type = String(activityType || "").toUpperCase();
  return {
    views: type === "VIEW_LISTING" ? 1 : 0,
    favorites: type === "ADD_FAVORITE" ? 1 : 0,
    inquiries: type === "CONTACT_INQUIRY" ? 1 : 0,
    demandScore: buyerIntentScore[type] || 0,
    sellerIntentScore: sellerIntentScore[type] || 0,
  };
}
