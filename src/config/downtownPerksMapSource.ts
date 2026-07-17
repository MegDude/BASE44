export type DowntownPerksSourceAdapterId =
  | "google-saved-list"
  | "manual-import"
  | "partner-import"
  | "cms"
  | "google-places"
  | "eventbrite"
  | "calendar"
  | "api"
  | "future-connector";

export type DowntownPerksSourceAdapter = {
  id: DowntownPerksSourceAdapterId;
  label: string;
  provider: string;
  runtimeFetchAllowed: boolean;
  residentFacing: boolean;
  purpose: string;
};

export const DOWNTOWN_PERKS_SOURCE_REGISTRY: DowntownPerksSourceAdapter[] = [
  {
    id: "google-saved-list",
    label: "Google Saved List",
    provider: "google-maps-saved-list",
    runtimeFetchAllowed: false,
    residentFacing: false,
    purpose: "source-inventory-import-and-reconciliation",
  },
  {
    id: "manual-import",
    label: "Manual Import",
    provider: "operator-curated",
    runtimeFetchAllowed: false,
    residentFacing: false,
    purpose: "operator-approved-place-and-content-imports",
  },
  {
    id: "partner-import",
    label: "Partner Import",
    provider: "partner-workspace",
    runtimeFetchAllowed: false,
    residentFacing: false,
    purpose: "partner-approved-profile-offer-event-and-campaign-updates",
  },
  {
    id: "cms",
    label: "CMS",
    provider: "platform-cms",
    runtimeFetchAllowed: false,
    residentFacing: false,
    purpose: "editorial-copy-media-and-publication-state",
  },
  {
    id: "google-places",
    label: "Google Places",
    provider: "google-places",
    runtimeFetchAllowed: false,
    residentFacing: false,
    purpose: "place-id-coordinate-hours-and-operational-verification",
  },
  {
    id: "eventbrite",
    label: "Eventbrite",
    provider: "eventbrite",
    runtimeFetchAllowed: false,
    residentFacing: false,
    purpose: "future-event-ingestion-adapter",
  },
  {
    id: "calendar",
    label: "Calendar",
    provider: "calendar",
    runtimeFetchAllowed: false,
    residentFacing: false,
    purpose: "future-event-calendar-ingestion-adapter",
  },
  {
    id: "api",
    label: "API",
    provider: "platform-api",
    runtimeFetchAllowed: false,
    residentFacing: false,
    purpose: "future-first-party-and-partner-api-connectors",
  },
  {
    id: "future-connector",
    label: "Future Connector",
    provider: "future",
    runtimeFetchAllowed: false,
    residentFacing: false,
    purpose: "reserved-source-adapter-slot",
  },
] as const;

export const DOWNTOWN_PERKS_MAP_SOURCE = {
  id: "google-saved-list-downtown-perks",
  adapterId: "google-saved-list",
  provider: "google-maps-saved-list",
  name: "Downtown Perks",
  sourceUrl: "https://maps.app.goo.gl/hMzqjSE2RfZqZXhz5",
  runtimeFetchAllowed: false,
  residentFacing: false,
  purpose: "source-inventory-import-and-reconciliation",
} as const;

export const DOWNTOWN_PERKS_KNOWLEDGE_GRAPH_MODEL = {
  registry: "canonical-entity-registry",
  graph: "downtown-perks-knowledge-graph",
  entityCarries: ["sources", "sourceHistory", "collectionMemberships", "routeMemberships", "campaignMemberships"],
  consumers: ["collections", "routes", "campaigns", "ai", "reports", "resident-map", "partner-workspace"],
} as const;

export const DOWNTOWN_PERKS_DEFAULT_MAP_STATE = {
  mode: "resident",
  tab: "map",
  filter: "Featured",
  collection: "downtown-perks-featured",
} as const;

export const DOWNTOWN_PERKS_PRIMARY_FILTERS = [
  "Featured",
  "Perks",
  "Events",
  "Dining",
  "Buildings",
  "Routes",
] as const;
