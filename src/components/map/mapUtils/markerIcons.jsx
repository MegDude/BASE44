import L from "leaflet";

/**
 * Venue/place marker icons (colored dots)
 */
const VENUE_COLORS = {
  restaurant: "#f59e0b",
  bar: "#f59e0b",
  fitness: "#10b981",
  wellness: "#8b5cf6",
  beauty: "#ec4899",
  entertainment: "#3b82f6",
  retail: "#6b7280",
  coworking: "#06b6d4",
  hotel: "#f97316",
};

export function venueIcon(category, active = false) {
  const color = VENUE_COLORS[category] || "#C8973A";
  if (active) {
    return L.divIcon({
      className: "",
      html: `<div style="background:#fff;color:#111;border:2px solid #111;border-radius:999px;padding:5px 11px;font:600 12px/1 Inter,sans-serif;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.2);transform:scale(1.05)">● ${category}</div>`,
      iconSize: [120, 28],
      iconAnchor: [60, 14],
    });
  }
  return L.divIcon({
    className: "",
    html: `<div style="width:11px;height:11px;border-radius:50%;background:${color};border:2.5px solid rgba(255,255,255,.9);box-shadow:0 3px 10px ${color}50"></div>`,
    iconSize: [11, 11],
    iconAnchor: [5.5, 5.5],
  });
}

/**
 * Building/property marker icons (gold squares)
 */
export function buildingIcon(active = false) {
  return L.divIcon({
    className: "",
    html: `<div style="width:${active ? 36 : 28}px;height:${active ? 36 : 28}px;border-radius:${active ? 10 : 7}px;background:${active ? "#111" : "#C8973A"};border:${active ? "2.5px solid #fff" : "2px solid rgba(255,255,255,.9)"};box-shadow:0 4px 14px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${active ? "#fff" : "#fff"}" stroke-width="2.5"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/></svg>
    </div>`,
    iconSize: [active ? 36 : 28, active ? 36 : 28],
    iconAnchor: [active ? 18 : 14, active ? 18 : 14],
  });
}

/**
 * Event marker icons (colored dots)
 */
const EVENT_COLORS = {
  fitness: "#10b981",
  wellness: "#8b5cf6",
  social: "#f59e0b",
  dining: "#ef4444",
  nightlife: "#6366f1",
  arts: "#ec4899",
  networking: "#06b6d4",
  class: "#84cc16",
  run_club: "#f97316",
  yoga: "#a78bfa",
};

export function eventIcon(category, active = false) {
  const color = EVENT_COLORS[category] || "#C8973A";
  if (active) {
    return L.divIcon({
      className: "",
      html: `<div style="background:#fff;color:#111;border:2px solid #111;border-radius:999px;padding:5px 10px;font:600 12px/1 Inter,sans-serif;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.18);transform:scale(1.05)">📍 Selected</div>`,
      iconSize: [100, 28],
      iconAnchor: [50, 14],
    });
  }
  return L.divIcon({
    className: "",
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2.5px solid rgba(255,255,255,.9);box-shadow:0 4px 12px ${color}60"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

export { VENUE_COLORS, EVENT_COLORS };