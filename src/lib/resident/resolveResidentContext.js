const LEGACY_MAP = {
  perks: { tab: "map", subview: "perks" },
  saved: { tab: "saved" },
  buildings: { tab: "map", subview: "building" },
  now: { tab: "now" },
  card: { tab: "card" },
  map: { tab: "map" },
  plan: { tab: "plan" },
  you: { tab: "you" },
};

const VALID_TABS = new Set(["now", "map", "card", "saved", "plan", "you"]);

export function resolveResidentContext(input = {}) {
  const fromUrl = String(input?.tab || "").trim().toLowerCase();

  if (LEGACY_MAP[fromUrl]) {
    return LEGACY_MAP[fromUrl];
  }

  if (VALID_TABS.has(fromUrl)) {
    return { tab: fromUrl };
  }

  return { tab: "now" };
}
