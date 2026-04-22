const LEGACY_MAP = {
  perks: { tab: "perks", subview: "perks" },
  saved: { tab: "saved" },
  plan: { tab: "plan" },
  buildings: { tab: "buildings", subview: "building" },
  now: { tab: "now" },
  map: { tab: "map" },
  card: { tab: "card" },
  profile: { tab: "profile" },
  you: { tab: "you" },
};

const VALID_TABS = new Set(["now", "map", "perks", "card", "saved", "plan", "buildings", "profile", "you"]);

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
