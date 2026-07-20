export const NATIVE_DRAWER_STATES = ["peek", "medium", "expanded", "full"];
export const LIST_DRAWER_STATES = ["peek", "expanded"];
export const DETAIL_DRAWER_STATES = ["medium", "expanded", "full"];

export function normalizeDrawerState(value, kind = "detail") {
  const allowed = kind === "list" ? LIST_DRAWER_STATES : DETAIL_DRAWER_STATES;
  const legacyValue = value === "collapsed" ? "peek" : value === "half" ? "medium" : value;
  return allowed.includes(legacyValue) ? legacyValue : kind === "list" ? "expanded" : "medium";
}

export function nextDrawerState(value, kind = "detail") {
  const allowed = kind === "list" ? LIST_DRAWER_STATES : DETAIL_DRAWER_STATES;
  const current = normalizeDrawerState(value, kind);
  return allowed[(allowed.indexOf(current) + 1) % allowed.length];
}
