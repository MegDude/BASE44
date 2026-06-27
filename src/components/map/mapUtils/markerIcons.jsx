import L from "leaflet";
import { getMapIcon } from "@/lib/map/mapIconRegistry";

/**
 * Venue/place marker icons (colored dots)
 */
const VENUE_COLORS = {
  restaurant: "#BFA46A",
  bar: "#BFA46A",
  fitness: "#0A121E",
  wellness: "#0A121E",
  beauty: "#0A121E",
  entertainment: "#0A121E",
  retail: "#0A121E",
  coworking: "#0A121E",
  hotel: "#BFA46A",
};

const VENUE_ICON_KEYS = {
  restaurant: "dining",
  bar: "nightlife",
  fitness: "wellness",
  wellness: "wellness",
  beauty: "wellness",
  entertainment: "culture",
  retail: "retail",
  coworking: "property",
  hotel: "hotel",
};

const EVENT_ICON_KEYS = {
  fitness: "wellness",
  wellness: "wellness",
  social: "nightlife",
  dining: "dining",
  nightlife: "nightlife",
  arts: "culture",
  networking: "event",
  class: "event",
  run_club: "wellness",
  yoga: "wellness",
};

function circularPinHtml(iconKey, active = false) {
  const pin = getMapIcon(iconKey);
  return `<div class="dp-live-pin ${active ? "is-selected" : ""}" data-pin-label="${pin.label}" aria-hidden="true"><div class="dp-live-pin__core">${pin.glyph}</div></div>`;
}

export function venueIcon(category, active = false) {
  const iconKey = VENUE_ICON_KEYS[category] || "dining";
  if (active) {
    return L.divIcon({
      className: "",
      html: circularPinHtml(iconKey, true),
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });
  }
  return L.divIcon({
    className: "",
    html: circularPinHtml(iconKey),
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
    html: circularPinHtml("property", active),
    iconSize: [active ? 42 : 38, active ? 42 : 38],
    iconAnchor: [active ? 21 : 19, active ? 21 : 19],
  });
}

/**
 * Event marker icons (colored dots)
 */
const EVENT_COLORS = {
  fitness: "#0A121E",
  wellness: "#0A121E",
  social: "#BFA46A",
  dining: "#BFA46A",
  nightlife: "#0A121E",
  arts: "#0A121E",
  networking: "#0A121E",
  class: "#0A121E",
  run_club: "#BFA46A",
  yoga: "#0A121E",
};

export function eventIcon(category, active = false) {
  const iconKey = EVENT_ICON_KEYS[category] || "event";
  if (active) {
    return L.divIcon({
      className: "",
      html: circularPinHtml(iconKey, true),
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });
  }
  return L.divIcon({
    className: "",
    html: circularPinHtml(iconKey),
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

export { VENUE_COLORS, EVENT_COLORS };
