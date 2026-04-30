import { defaultMapPanelState, type MapPanelState } from "@/store/useMapPanelStore";

const allowedModes = new Set(["search", "ask"]);
const allowedDecisions = new Set(["now", "open", "near"]);
const allowedTypes = new Set(["all", "venues", "events", "perks", "buildings"]);

export function buildMapPanelQuery(state: Partial<MapPanelState>) {
  const params = new URLSearchParams();

  if (state.mode) params.set("mode", state.mode);
  if (state.query) params.set("query", state.query);
  if (state.decision) params.set("decision", state.decision);
  if (state.type) params.set("type", state.type);
  if (state.district) params.set("district", state.district);

  if (state.categories?.length) {
    params.set("categories", state.categories.join(","));
  }

  if (state.filters?.crowd) params.set("crowd", "1");
  if (state.filters?.deals) params.set("deals", "1");
  if (state.filters?.fiveMin) params.set("fiveMin", "1");
  if (state.filters?.tenMin) params.set("tenMin", "1");
  if (state.filters?.openNow) params.set("openNow", "1");
  if (state.filters?.activeSpecials) params.set("activeSpecials", "1");
  if (state.filters?.foodDeals) params.set("foodDeals", "1");
  if (state.filters?.drinkDeals) params.set("drinkDeals", "1");
  if (state.filters?.residentPerks) params.set("residentPerks", "1");
  if (state.filters?.needsDetails) params.set("needsDetails", "1");

  return params.toString();
}

export function parseMapPanelQuery(search: string): Partial<MapPanelState> {
  const params = new URLSearchParams(search);

  const mode = params.get("mode");
  const decision = params.get("decision");
  const type = params.get("type");
  const query = params.get("query") ?? "";
  const district = params.get("district") ?? "";

  const categories = (params.get("categories") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    mode: allowedModes.has(mode ?? "")
      ? (mode as MapPanelState["mode"])
      : defaultMapPanelState.mode,
    decision: allowedDecisions.has(decision ?? "")
      ? (decision as MapPanelState["decision"])
      : defaultMapPanelState.decision,
    type: allowedTypes.has(type ?? "")
      ? (type as MapPanelState["type"])
      : defaultMapPanelState.type,
    district,
    query,
    submittedQuery: query.trim(),
    categories,
    filters: {
      crowd: params.get("crowd") === "1",
      deals: params.get("deals") === "1",
      fiveMin: params.get("fiveMin") === "1",
      tenMin: params.get("tenMin") === "1",
      openNow: params.get("openNow") === "1",
      activeSpecials: params.get("activeSpecials") !== "0",
      foodDeals: params.get("foodDeals") === "1",
      drinkDeals: params.get("drinkDeals") === "1",
      residentPerks: params.get("residentPerks") === "1",
      needsDetails: params.get("needsDetails") === "1",
    },
  };
}
