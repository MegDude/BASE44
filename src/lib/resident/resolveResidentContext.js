const LEGACY_MAP = {
  perks: { tab: "perks", subview: "perks" },
  saved: { tab: "saved" },
  buildings: { tab: "buildings", subview: "building" },
  now: { tab: "now" },
  card: { tab: "card" },
};

const VALID_TABS = new Set(["now", "perks", "card", "saved", "buildings"]);

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
