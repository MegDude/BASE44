export interface DashboardMapSummary {
  total: number;
  venues: number;
  events: number;
  perks: number;
  properties: number;
  lastInteractionAt?: string;
}

export interface DashboardInteractionMetric {
  action: "search" | "view" | "save" | "rsvp" | "redeem" | "directions";
  entityId?: string;
  entityType?: string;
  residentId?: string;
  query?: string;
  createdAt: string;
}
