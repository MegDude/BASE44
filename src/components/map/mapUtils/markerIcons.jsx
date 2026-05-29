import L from "leaflet";

/**
 * Venue/place marker icons (colored dots)
 */
const VENUE_COLORS = {
  restaurant: "#B38F4F",
  bar: "#B38F4F",
  fitness: "#0B1F33",
  wellness: "#0B1F33",
  beauty: "#081521",
  entertainment: "#0B1F33",
  retail: "#425466",
  coworking: "#081521",
  hotel: "#B38F4F",
};

const VENUE_GLYPHS = {
  restaurant: '<path d="M7 3v8"/><path d="M4 3v5a3 3 0 0 0 6 0V3"/><path d="M7 11v10"/><path d="M17 3v18"/><path d="M14 3h3a3 3 0 0 1 3 3v5h-6"/>',
  bar: '<path d="M6 3h12l-5 7v8"/><path d="M9 21h6"/><path d="M8 8h8"/>',
  fitness: '<path d="M6 7v10"/><path d="M18 7v10"/><path d="M3 10v4"/><path d="M21 10v4"/><path d="M6 12h12"/>',
  wellness: '<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z"/><path d="M8 12h2l1.5-3 2 6 1.5-3h2"/>',
  beauty: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  entertainment: '<path d="M4 20h16"/><path d="M6 20V9l6-5 6 5v11"/><path d="M9 10h6"/>',
  retail: '<path d="M6 8h12l-1 13H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/><path d="M8 13h8"/>',
  coworking: '<path d="M4 21h16"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1"/>',
  hotel: '<path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M7 10h10"/><path d="M7 15h10"/>',
};

const EVENT_GLYPHS = {
  fitness: VENUE_GLYPHS.fitness,
  wellness: VENUE_GLYPHS.wellness,
  social: '<path d="M6 3h12l-5 7v8"/><path d="M9 21h6"/><path d="M8 8h8"/>',
  dining: VENUE_GLYPHS.restaurant,
  nightlife: VENUE_GLYPHS.bar,
  arts: VENUE_GLYPHS.entertainment,
  networking: '<path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M2 21v-2a4 4 0 0 1 3-3.87"/>',
  class: '<path d="M4 19.5V5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 1-2-1.5Z"/><path d="M8 7h8M8 11h8"/>',
  run_club: '<path d="M13 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/><path d="M4 17l5-5 3 3 3-5 5 2"/><path d="M8 21l3-6"/><path d="M14 15l2 6"/>',
  yoga: VENUE_GLYPHS.wellness,
};

function pinGlyph(paths) {
  return `<svg class="dp-pin-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

function circularPinHtml(paths, active = false) {
  return `<div class="dp-live-pin ${active ? "is-selected" : ""}" aria-hidden="true"><div class="dp-live-pin__core">${pinGlyph(paths)}</div></div>`;
}

export function venueIcon(category, active = false) {
  const glyph = VENUE_GLYPHS[category] || VENUE_GLYPHS.restaurant;
  if (active) {
    return L.divIcon({
      className: "",
      html: circularPinHtml(glyph, true),
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });
  }
  return L.divIcon({
    className: "",
    html: circularPinHtml(glyph),
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

/**
 * Building/property marker icons
 */
export function buildingIcon(active = false) {
  return L.divIcon({
    className: "",
    html: circularPinHtml('<path d="M4 21h16"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1"/>', active),
    iconSize: [active ? 42 : 38, active ? 42 : 38],
    iconAnchor: [active ? 21 : 19, active ? 21 : 19],
  });
}

/**
 * Event marker icons (colored dots)
 */
const EVENT_COLORS = {
  fitness: "#0B1F33",
  wellness: "#0B1F33",
  social: "#B38F4F",
  dining: "#B38F4F",
  nightlife: "#0B1F33",
  arts: "#081521",
  networking: "#081521",
  class: "#0B1F33",
  run_club: "#B38F4F",
  yoga: "#0B1F33",
};

export function eventIcon(category, active = false) {
  const glyph = EVENT_GLYPHS[category] || '<path d="M7 5h10a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2Z"/><path d="M9 9h6"/><path d="M9 13h4"/><path d="M16.5 3.5l1 1.8 2 .4-1.4 1.4.2 2-1.8-.9-1.8.9.3-2-1.5-1.4 2-.4 1-1.8Z"/>';
  if (active) {
    return L.divIcon({
      className: "",
      html: circularPinHtml(glyph, true),
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });
  }
  return L.divIcon({
    className: "",
    html: circularPinHtml(glyph),
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

export { VENUE_COLORS, EVENT_COLORS };
