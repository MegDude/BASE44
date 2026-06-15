export type AnalyticsEvent =
  | "map_search"
  | "intent_selected"
  | "entity_view"
  | "entity_save"
  | "directions_click"
  | "perk_redeem"
  | "event_rsvp"
  | "campaign_view"
  | "campaign_click"
  | "partner_signal_view"
  | "ask_map_query"
  | "ask_map_recommendation_click";

export function trackDowntownPerksEvent(event: AnalyticsEvent, properties: Record<string, unknown> = {}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("downtown-perks:analytics", { detail: { event, properties } }));
  }
  return { event, properties };
}
