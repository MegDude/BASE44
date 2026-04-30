export const HOME_MAP_INTENT_EVENT = "dp-home-map-intent";

export function openHomeMapIntent({
  query = "",
  context = "now",
  insightView,
  layers,
  targetId = "home-map-entry",
} = {}) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(HOME_MAP_INTENT_EVENT, {
      detail: { query, context, insightView, layers },
    })
  );

  const hero = document.getElementById(targetId);
  if (hero) {
    hero.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
