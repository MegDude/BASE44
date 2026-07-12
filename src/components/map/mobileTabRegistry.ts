export type MapAudienceMode = "resident" | "partner";
export type DrawerSnapState = "collapsed" | "medium" | "expanded" | "full" | "dismissed";

export type MobileTabDefinition = {
  id: string;
  label: string;
  purpose: string;
  route: string;
  emptyTitle: string;
  emptyAction: string;
  analyticsEvent: string;
  sections: readonly string[];
};

export const residentMobileTabs: readonly MobileTabDefinition[] = [
  { id: "info", label: "Home", purpose: "A calm daily starting point before map discovery.", route: "/resident/home", emptyTitle: "Your downtown guide will get smarter as you save places and explore nearby.", emptyAction: "Explore map", analyticsEvent: "resident_home_open", sections: ["Recommended today", "Nearby categories", "Continue exploring", "Nearby districts", "Popular today", "Saved"] },
  { id: "map", label: "Map", purpose: "Discovery and decisions in geographic context.", route: "/map?mode=resident&tab=map&filter=All", emptyTitle: "Move the map or choose a category to explore downtown.", emptyAction: "Reset filters", analyticsEvent: "resident_map_open", sections: ["Current search intent", "Active filters", "Nearby categories", "Walking routes", "Recent searches", "Current district", "Map legend"] },
  { id: "perks", label: "Perks", purpose: "Discover and use verified resident benefits.", route: "/map?mode=resident&tab=perks&filter=Perks", emptyTitle: "No active perks match these filters.", emptyAction: "Try another category", analyticsEvent: "resident_perks_open", sections: ["Featured perk", "Available now", "Near me", "Resident-only", "Building-specific", "Dining", "Wellness", "Shopping", "Hotels", "Expiring soon", "Recently used"] },
  { id: "events", label: "Events", purpose: "Decide what to attend and act quickly.", route: "/map?mode=resident&tab=events&filter=Events", emptyTitle: "Nothing is scheduled nearby for this date.", emptyAction: "Choose another date", analyticsEvent: "resident_events_open", sections: ["Happening today", "Starting soon", "This weekend", "Nearby", "Resident events", "Music", "Food and drink", "Culture", "Wellness", "Civic", "Saved events"] },
  { id: "card", label: "Card", purpose: "Resident identity, eligibility, and redemption.", route: "/map?mode=resident&tab=pass", emptyTitle: "Activate resident access to show your Downtown Perks Card.", emptyAction: "Activate card", analyticsEvent: "resident_card_open", sections: ["Resident QR", "Card status", "Resident ID", "Building", "Eligibility", "Active perks", "Recent redemptions", "Help and support"] },
] as const;

export const partnerMobileTabs: readonly MobileTabDefinition[] = [
  { id: "info", label: "Home", purpose: "A concise operating view of what needs attention now.", route: "/partner-workspace/overview", emptyTitle: "Activity appears after your profile or first campaign starts receiving engagement.", emptyAction: "Complete profile", analyticsEvent: "partner_home_open", sections: ["Needs attention", "Profile completeness", "Active perks", "Upcoming event", "Performance snapshot", "Recommended action", "Recent activity"] },
  { id: "publish", label: "Publish", purpose: "Create and manage perks, events, listings, and campaigns.", route: "/partner-workspace/offers", emptyTitle: "No partner content has been published yet.", emptyAction: "Create a perk", analyticsEvent: "partner_publish_open", sections: ["Active", "Drafts", "Scheduled", "Past", "Perks", "Events", "Campaigns", "Listing updates"] },
  { id: "map", label: "Map", purpose: "Local context and nearby opportunity.", route: "/map?mode=partner&tab=map&filter=All", emptyTitle: "Add or select a business location to see local opportunity.", emptyAction: "Edit visibility", analyticsEvent: "partner_map_open", sections: ["Own business", "Active visibility", "Nearby audience", "Nearby events", "Nearby properties", "Complementary categories", "Campaign suggestions", "Map filters"] },
  { id: "insights", label: "Insights", purpose: "Reporting, audience, and explainable recommendations.", route: "/partner-workspace/analytics", emptyTitle: "Insights appear after your listing or content receives activity.", emptyAction: "Preview listing", analyticsEvent: "partner_insights_open", sections: ["Reach", "Map views", "Saves", "Directions", "Redemptions", "Audience", "Recommendations"] },
  { id: "workspace", label: "Workspace", purpose: "Organization, team, billing, integrations, and settings.", route: "/partner-workspace/profile", emptyTitle: "Your organization settings appear when account access is active.", emptyAction: "Open account access", analyticsEvent: "partner_workspace_open", sections: ["Organization", "Team", "Locations", "Integrations", "Billing", "Notifications", "Brand assets", "Support"] },
] as const;

export const mobileTabsByMode = { resident: residentMobileTabs, partner: partnerMobileTabs } as const;

export function getMobileTab(mode: MapAudienceMode, id: string) {
  return mobileTabsByMode[mode].find((tab) => tab.id === id) || mobileTabsByMode[mode][1];
}

export function normalizeMobileTab(mode: MapAudienceMode, tab?: string | null, panel?: string | null) {
  const requested = panel || tab || "map";
  const aliases: Record<string, string> = mode === "resident"
    ? { home: "info", card: "card", pass: "card" }
    : { overview: "info", campaigns: "publish", perks: "publish", offers: "publish", events: "publish", audience: "insights", reports: "insights", analytics: "insights" };
  const canonical = aliases[requested] || requested;
  return getMobileTab(mode, canonical).id;
}
