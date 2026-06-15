export const luxuryPresenceActivityMap = {
  VIEW_LISTING: "property_interaction",
  ADD_FAVORITE: "property_interaction",
  REMOVE_FAVORITE: "property_interaction",
  SHARE_LISTING: "property_interaction",
  SHARE_PRIVATE_LISTING: "property_interaction",

  HOME_SEARCH: "search_behavior",
  ADD_SEARCH: "search_behavior",
  REMOVE_SEARCH: "search_behavior",

  SIGNUP: "account_management",
  LOGIN: "account_management",
  GOOGLE_SIGN_ON: "account_management",

  CONTACT_INQUIRY: "communication",
  COMM_OPT_IN: "communication",
  COMM_OPT_OUT: "communication",
  COMM_BROKERAGE_OPT_IN: "communication",
  COMM_BROKERAGE_OPT_OUT: "communication",

  NEWSLETTER_SIGNUP: "marketing_lead_generation",
  EBOOK: "marketing_lead_generation",
  FORCED_LEAD_CAPTURE: "marketing_lead_generation",
  REFERRAL: "marketing_lead_generation",

  HOME_VALUE: "valuation_services",
  PROPERTY_ACCESS: "valuation_services",
};

export const optOutActivityTypes = new Set(["COMM_OPT_OUT", "COMM_BROKERAGE_OPT_OUT"]);

export const optInActivityTypes = new Set(["COMM_OPT_IN", "COMM_BROKERAGE_OPT_IN"]);

export function getLuxuryPresenceActivityCategory(activityType) {
  return luxuryPresenceActivityMap[String(activityType || "").toUpperCase()] || "unknown";
}
