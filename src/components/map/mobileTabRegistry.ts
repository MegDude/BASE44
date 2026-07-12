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
  { id: "info", label: "Home", purpose: "A useful daily downtown starting point.", route: "/map?mode=resident&tab=map&filter=All&panel=info", emptyTitle: "Your downtown guide will get smarter as you save places and explore nearby.", emptyAction: "Explore map", analyticsEvent: "resident_home_open", sections: ["Today nearby", "Recommended now", "Current perks", "Upcoming events", "Saved places", "Resident building", "Walking routes", "Hidden gems", "Recently viewed"] },
  { id: "map", label: "Map", purpose: "Discovery and decisions in geographic context.", route: "/map?mode=resident&tab=map&filter=All", emptyTitle: "Move the map or choose a category to explore downtown.", emptyAction: "Reset filters", analyticsEvent: "resident_map_open", sections: ["Current search intent", "Active filters", "Nearby categories", "Walking routes", "Recent searches", "Current district", "Map legend"] },
  { id: "perks", label: "Perks", purpose: "Discover and use verified resident benefits.", route: "/map?mode=resident&tab=perks&filter=Perks", emptyTitle: "No active perks match these filters.", emptyAction: "Try another category", analyticsEvent: "resident_perks_open", sections: ["Featured perk", "Available now", "Near me", "Resident-only", "Building-specific", "Dining", "Wellness", "Shopping", "Hotels", "Expiring soon", "Recently used"] },
  { id: "events", label: "Events", purpose: "Decide what to attend and act quickly.", route: "/map?mode=resident&tab=events&filter=Events", emptyTitle: "Nothing is scheduled nearby for this date.", emptyAction: "Choose another date", analyticsEvent: "resident_events_open", sections: ["Happening today", "Starting soon", "This weekend", "Nearby", "Resident events", "Music", "Food and drink", "Culture", "Wellness", "Civic", "Saved events"] },
  { id: "card", label: "Card", purpose: "Resident identity, eligibility, and redemption.", route: "/map?mode=resident&tab=pass", emptyTitle: "Activate resident access to show your Downtown Perks Card.", emptyAction: "Activate card", analyticsEvent: "resident_card_open", sections: ["Resident QR", "Card status", "Resident ID", "Building", "Eligibility", "Active perks", "Recent redemptions", "Help and support"] },
] as const;

export const partnerMobileTabs: readonly MobileTabDefinition[] = [
  { id: "info", label: "Overview", purpose: "A concise operating view of current activity.", route: "/map?mode=partner&tab=overview", emptyTitle: "Activity appears after your profile or first campaign starts receiving engagement.", emptyAction: "Complete profile", analyticsEvent: "partner_overview_open", sections: ["Campaign status", "Key metrics", "Current offer", "Upcoming event", "Audience signal", "Recommended action", "Recent activity", "Quick links"] },
  { id: "map", label: "Map", purpose: "Local context and nearby opportunity.", route: "/map?mode=partner&tab=map&filter=All", emptyTitle: "Add or select a business location to see local opportunity.", emptyAction: "Edit visibility", analyticsEvent: "partner_map_open", sections: ["Own business", "Active visibility", "Nearby audience", "Nearby events", "Nearby properties", "Complementary categories", "Campaign suggestions", "Map filters"] },
  { id: "campaigns", label: "Campaigns", purpose: "Create, manage, and evaluate campaigns.", route: "/map?mode=partner&tab=campaigns", emptyTitle: "No campaigns are live yet.", emptyAction: "Create campaign", analyticsEvent: "partner_campaigns_open", sections: ["Active", "Scheduled", "Draft", "Completed", "Expired"] },
  { id: "activity", label: "Audience", purpose: "Privacy-safe nearby and engagement signals.", route: "/map?mode=partner&tab=audience", emptyTitle: "Audience insights will appear after your profile or campaign begins receiving activity.", emptyAction: "Launch campaign", analyticsEvent: "partner_audience_open", sections: ["Nearby now", "Resident buildings", "Guest signals", "Saved interest", "Repeat interest", "Campaign audience", "Recommended segment"] },
  { id: "workspace", label: "Workspace", purpose: "Central operational access.", route: "/partner-workspace/overview", emptyTitle: "Your workspace modules will appear when account access is active.", emptyAction: "Open account access", analyticsEvent: "partner_workspace_open", sections: ["Profile", "Perks", "Events", "Campaigns", "Audience", "Media", "Reports", "QR", "Surveys", "Team", "Billing", "Integrations", "Settings"] },
] as const;

export const mobileTabsByMode = { resident: residentMobileTabs, partner: partnerMobileTabs } as const;

export function getMobileTab(mode: MapAudienceMode, id: string) {
  return mobileTabsByMode[mode].find((tab) => tab.id === id) || mobileTabsByMode[mode][1];
}

export function normalizeMobileTab(mode: MapAudienceMode, tab?: string | null, panel?: string | null) {
  const requested = panel || tab || "map";
  const aliases: Record<string, string> = mode === "resident"
    ? { home: "info", card: "card", pass: "card" }
    : { overview: "info", audience: "activity", reports: "activity" };
  const canonical = aliases[requested] || requested;
  return getMobileTab(mode, canonical).id;
}
