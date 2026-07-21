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
  { id: "home", label: "Home", purpose: "See what matters now and open the right resident action.", route: "/resident/home", emptyTitle: "Your nearby plans, saved places, and resident access appear here.", emptyAction: "Open map", analyticsEvent: "resident_home_open", sections: ["Today nearby", "Ask Downtown", "Resident card", "Saved places", "Upcoming events", "Walking routes"] },
  { id: "map", label: "Map", purpose: "Discovery and decisions in geographic context.", route: "/map?mode=resident&tab=map&filter=All", emptyTitle: "Move the map or choose a category to explore downtown.", emptyAction: "Reset filters", analyticsEvent: "resident_map_open", sections: ["Current search intent", "Active filters", "Nearby categories", "Walking routes", "Recent searches", "Current district", "Map legend"] },
  { id: "perks", label: "Perks", purpose: "Discover and use verified resident benefits.", route: "/map?mode=resident&tab=perks&filter=Perks", emptyTitle: "No active perks match these filters.", emptyAction: "Try another category", analyticsEvent: "resident_perks_open", sections: ["Featured perk", "Available now", "Near me", "Resident-only", "Building-specific", "Dining", "Wellness", "Shopping", "Hotels", "Expiring soon", "Recently used"] },
  { id: "events", label: "Events", purpose: "Decide what to attend and act quickly.", route: "/map?mode=resident&tab=events&filter=Events", emptyTitle: "Nothing is scheduled nearby for this date.", emptyAction: "Choose another date", analyticsEvent: "resident_events_open", sections: ["Happening today", "Starting soon", "This weekend", "Nearby", "Resident events", "Music", "Food and drink", "Culture", "Wellness", "Civic", "Saved events"] },
  { id: "card", label: "Card", purpose: "Show verified resident access and a secure QR when a participating place asks.", route: "/map?mode=resident&tab=pass", emptyTitle: "Sign in or create an account to prepare your resident card.", emptyAction: "Create account", analyticsEvent: "resident_card_open", sections: ["Resident status", "QR", "Building access", "Current benefits"] },
] as const;

export const partnerMobileTabs: readonly MobileTabDefinition[] = [
  { id: "info", label: "Home", purpose: "What needs attention now.", route: "/partner-workspace/overview", emptyTitle: "Activity appears after people use your profile or campaign.", emptyAction: "Complete profile", analyticsEvent: "partner_home_open", sections: ["Needs attention", "Profile", "Perks", "Events", "Performance", "Next action", "Activity"] },
  { id: "map", label: "Map", purpose: "Local context and nearby opportunity.", route: "/map?mode=partner&tab=map&filter=All", emptyTitle: "Add or select a business location to see local opportunity.", emptyAction: "Edit visibility", analyticsEvent: "partner_map_open", sections: ["Own business", "Active visibility", "Nearby audience", "Nearby events", "Nearby properties", "Complementary categories", "Campaign suggestions", "Map filters"] },
  { id: "publish", label: "Publish", purpose: "Create and manage offers, events, campaigns, messages, and map content.", route: "/partner-workspace/publish", emptyTitle: "No drafts or live content yet.", emptyAction: "Create content", analyticsEvent: "partner_publish_open", sections: ["Drafts", "Scheduled", "Live", "Needs attention", "Offers", "Events", "Campaigns", "Broadcasts", "Surveys", "Listings", "Routes"] },
  { id: "performance", label: "Performance", purpose: "Reporting, SEO, audience, map activity, and explainable recommendations.", route: "/partner-workspace/performance", emptyTitle: "Results appear after people interact with published content.", emptyAction: "Open map", analyticsEvent: "partner_performance_open", sections: ["Headline results", "Funnel", "Campaigns", "Offers", "Events", "Audience", "Map activity", "SEO Snapshot", "Reports"] },
  { id: "workspace", label: "Workspace", purpose: "Organization, entities, people, media, team, integrations, billing, and settings.", route: "/partner-workspace/workspace", emptyTitle: "Your organization settings appear when account access is active.", emptyAction: "Open profile", analyticsEvent: "partner_workspace_open", sections: ["Organization", "Entities", "People", "Media", "Team", "Integrations", "Automations", "AI tools", "QR codes", "Billing", "Notifications", "Support"] },
] as const;

export const mobileTabsByMode = { resident: residentMobileTabs, partner: partnerMobileTabs } as const;

export function getMobileTab(mode: MapAudienceMode, id: string) {
  return (
    mobileTabsByMode[mode].find((tab) => tab.id === id) ||
    mobileTabsByMode[mode].find((tab) => tab.id === "map") ||
    mobileTabsByMode[mode][0]
  );
}

export function normalizeMobileTab(mode: MapAudienceMode, tab?: string | null, panel?: string | null) {
  const requested = panel || tab || "map";
  const aliases: Record<string, string> = mode === "resident"
    ? { info: "home", pass: "card", profile: "home", saved: "home" }
    : { overview: "info", campaigns: "publish", perks: "publish", offers: "publish", events: "publish", audience: "performance", reports: "performance", analytics: "performance", insights: "performance" };
  const canonical = aliases[requested] || requested;
  return getMobileTab(mode, canonical).id;
}
