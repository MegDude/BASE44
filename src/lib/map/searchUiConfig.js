import {
  Coffee,
  Gift,
  Heart,
  Music,
  ShoppingBag,
  Users,
  Utensils,
} from "lucide-react";

export const PRIMARY_SEARCH_PRESETS = [
  { id: "all", label: "All" },
  { id: "coffee", label: "Coffee", icon: Coffee },
  { id: "dining", label: "Dining", icon: Utensils },
  { id: "nightlife", label: "Nightlife", icon: Music },
  { id: "wellness", label: "Wellness", icon: Heart },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "market", label: "Market" },
];

export const SECONDARY_SEARCH_PRESETS = [
  { id: "crowd", label: "Crowd", icon: Users },
  { id: "perks", label: "Perks", icon: Gift },
];

export const ASK_MAP_QUESTIONS = [
  {
    title: "Where do you want to go?",
    subtitle: "Coffee. Dinner. Groceries. Fitness. Drinks. All within walking distance.",
    query: "coffee nearby",
  },
  {
    title: "What do you want to do?",
    subtitle: "See what is on tonight. Find something worth showing up for.",
    query: "events tonight",
  },
  {
    title: "Who do you want to meet?",
    subtitle: "See who is going. Join in. Make a plan.",
    query: "live music nearby",
  },
];

const PRESET_DEFINITIONS = {
  all: {
    entityTypes: ["venue", "event", "perk", "building"],
    categories: [],
    query: "",
  },
  coffee: {
    entityTypes: ["venue"],
    categories: ["coffee"],
    query: "coffee nearby",
  },
  dining: {
    entityTypes: ["venue"],
    categories: ["restaurant", "bar"],
    query: "dining nearby",
  },
  nightlife: {
    entityTypes: ["venue", "event"],
    categories: ["bar", "entertainment"],
    query: "nightlife nearby",
  },
  wellness: {
    entityTypes: ["venue"],
    categories: ["wellness", "fitness", "beauty"],
    query: "wellness nearby",
  },
  shopping: {
    entityTypes: ["venue"],
    categories: ["retail"],
    query: "shopping nearby",
  },
  market: {
    entityTypes: ["venue"],
    categories: ["retail", "services"],
    query: "market nearby",
  },
};

export function getPrimaryPresetDefinition(presetId = "all") {
  return PRESET_DEFINITIONS[presetId] || PRESET_DEFINITIONS.all;
}

export function isPrimaryPresetActive(presetId, activeFilters) {
  const preset = getPrimaryPresetDefinition(presetId);
  const entityTypes = [...activeFilters.entityTypes].sort();
  const categories = [...activeFilters.categories].sort();

  return (
    entityTypes.join("|") === [...preset.entityTypes].sort().join("|") &&
    categories.join("|") === [...preset.categories].sort().join("|")
  );
}
