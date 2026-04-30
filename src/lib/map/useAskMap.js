import { useMemo, useState } from "react";
import { useSharedMapFeed } from "@/lib/map/useSharedMapFeed";
import { getPrimaryPresetDefinition } from "@/lib/map/searchUiConfig";

export const ASK_MAP_FILTERS = [
  { id: "all", label: "All" },
  { id: "coffee", label: "Coffee" },
  { id: "dining", label: "Dining" },
  { id: "nightlife", label: "Nightlife" },
  { id: "wellness", label: "Wellness" },
  { id: "shopping", label: "Shopping" },
  { id: "perks", label: "Perks" },
  { id: "5min", label: "5 min walk" },
];

export const ASK_MAP_PROMPTS = ["Coffee nearby", "Happy hour now", "Events tonight"];

export function askMapType(item) {
  const type = String(item?.type || item?.entity_type || "").toLowerCase();
  if (["building", "property", "hotel"].includes(type)) return "building";
  if (type === "perk") return "perk";
  if (type === "event") return "event";
  return "venue";
}

export function askMapMeta(item) {
  const walkMinutes = item?.metadata?.walkMinutes;
  return {
    title: item?.title || item?.name || "Downtown pick",
    detail: Number.isFinite(walkMinutes) ? `${walkMinutes} min walk` : item?.district || "Downtown Austin",
    summary: item?.perk?.value || item?.perk_value || item?.description || item?.category || "Nearby now",
  };
}

export function askMapMatches(item, filterId = "all") {
  if (!item || filterId === "all") return true;
  const category = String(item?.category || item?.subcategory || "").toLowerCase();
  const type = askMapType(item);
  const walkMinutes = Number(item?.metadata?.walkMinutes ?? 999);
  if (filterId === "perks" || filterId === "perk") return type === "perk" || Boolean(item?.perk?.value || item?.perk_value);
  if (filterId === "5min") return walkMinutes <= 5;
  if (filterId === "dining") return ["restaurant", "bar", "dining"].includes(category);
  if (filterId === "nightlife") return ["bar", "entertainment", "nightlife"].includes(category) || type === "event";
  if (filterId === "wellness") return ["wellness", "fitness", "beauty"].includes(category);
  if (filterId === "shopping") return ["retail", "shopping", "market"].includes(category);
  if (["venue", "event", "building"].includes(filterId)) return type === filterId;
  return category === filterId;
}

export function useAskMap({ initialQuery = "", initialFilter = "all", sourceItems = null, limit = 180, resultLimit = 60 } = {}) {
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const preset = getPrimaryPresetDefinition(activeFilter);
  const searchQuery = String(query || "").trim() || preset.query || "";
  const { items: feedItems = [] } = useSharedMapFeed({ query: searchQuery, activeCategory: "all", limit });
  const baseItems = sourceItems || feedItems;

  const visibleItems = useMemo(() => {
    return (baseItems || []).filter((item) => askMapMatches(item, activeFilter)).slice(0, resultLimit);
  }, [activeFilter, baseItems, resultLimit]);

  function submit(nextQuery) {
    const cleanQuery = String(nextQuery || queryInput || "").trim();
    setQuery(cleanQuery);
    setQueryInput(cleanQuery);
  }

  function changeFilter(nextFilter) {
    setActiveFilter(nextFilter);
    const nextPreset = getPrimaryPresetDefinition(nextFilter);
    if (nextPreset.query) {
      setQuery(nextPreset.query);
      setQueryInput(nextPreset.query);
    }
  }

  return { queryInput, setQueryInput, query, setQuery, activeFilter, setActiveFilter, visibleItems, searchQuery, submit, changeFilter };
}
