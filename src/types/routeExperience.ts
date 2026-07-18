export type RoutePublicType = "walk" | "route" | "guide" | "collection";
export type RouteTheme = "navy" | "emerald" | "gold";
export type RouteVisibility = "public" | "resident" | "partner" | "admin";
export type RouteStatus = "draft" | "published" | "paused" | "archived";

export type RouteAccessibility = {
  stepFree?: boolean;
  surface?: string;
  seating?: string;
  restrooms?: string;
  lighting?: string;
  water?: string;
  wheelchairNotes?: string;
  strollerNotes?: string;
};

export type RouteExperienceDefinition = {
  id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  routeType: RoutePublicType;
  summary: string;
  description?: string;
  category: string;
  routeMode: "walking" | "editorial";
  colorTheme: RouteTheme;
  icon: "route";
  status: RouteStatus;
  visibility: RouteVisibility;
  ordered: boolean;
  estimatedMinutes?: number;
  estimatedTime?: string;
  distanceMeters?: number;
  distanceLabel?: string;
  neighborhood?: string;
  partnerName?: string;
  partnerWorkspaceId?: string;
  heroImageUrl?: string;
  stopIds: string[];
  stopHints: string[];
  accessibility?: RouteAccessibility;
  beforeYouGo?: string[];
  relatedRouteIds?: string[];
  ctaLabel?: string;
};

export type RouteProgressState = {
  routeId: string;
  state: "not-started" | "active" | "completed";
  activeStopId?: string;
  checkedInStopIds: string[];
  skippedStopIds: string[];
  saved: boolean;
};
