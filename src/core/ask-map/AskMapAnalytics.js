export const ASK_MAP_EVENTS = {
  searchSubmitted: "search_submitted",
  intentDetected: "intent_detected",
  recommendationViewed: "recommendation_viewed",
  recommendationClicked: "recommendation_clicked",
  markerSelected: "marker_selected",
  save: "save",
  rsvp: "rsvp",
  cardOpened: "card_opened",
  redeemed: "redeemed",
};

export function trackAskMapEvent(type, payload = {}) {
  const event = {
    type,
    payload,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ask-map:event", { detail: event }));
  }

  return event;
}
