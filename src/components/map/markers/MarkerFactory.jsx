import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import {
  IconActivity,
  IconBrand,
  IconCivic,
  IconCoffee,
  IconDining,
  IconEvent,
  IconHotel,
  IconPerk,
  IconProperty,
  IconTarget,
  MarkerPin,
} from "@/components/icons/DPIcons";

const COLORS = {
  navy: "#0B1A2B",
  navySoft: "#22405C",
  low: "#8AA0B6",
  civic: "#18314A",
  opportunity: "#2F6F55",
  surface: "#FFFFFF",
  stroke: "rgba(11,26,43,0.16)",
  accent: "#C6A85A",
};

const SHADOW = "drop-shadow(0 8px 16px rgba(11,26,43,0.12))";
const ACTIVE_SHADOW = "drop-shadow(0 12px 22px rgba(11,26,43,0.18))";

function renderMarkerIcon(glyph, options = {}) {
  return renderToStaticMarkup(<MarkerPin glyph={glyph} {...options} />);
}

function wrapPin(
  glyph,
  {
    width = 32,
    height = 42,
    active = false,
    className = "custom-marker",
    color = COLORS.navy,
    accent = false,
    topRanked = false,
  } = {}
) {
  return L.divIcon({
    className,
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:${width}px;height:${height}px;transform:${active ? "translateY(-2px) scale(1.08)" : topRanked ? "translateY(-1px) scale(1.03)" : "translateY(0) scale(1)"};transition:transform .2s ease, filter .2s ease;filter:${active ? ACTIVE_SHADOW : SHADOW};">${renderMarkerIcon(glyph, { selected: active, color, accent, accentColor: COLORS.accent })}</div>`,
    iconSize: [width, height],
    iconAnchor: [Math.round(width / 2), Math.round(height * 0.84)],
    popupAnchor: [0, -Math.round(height * 0.84)],
  });
}

function createPillMarker(entity) {
  const label = String(entity?.name || entity?.title || "Downtown place");
  const darkSurface = entity?.type === "building" || entity?.type === "hotel" || entity?.type === "property";
  const bg = darkSurface ? "rgba(20,38,59,0.95)" : "rgba(255,255,255,0.96)";
  const border = darkSurface ? "rgba(198,168,90,0.38)" : "rgba(11,26,43,0.10)";
  const textColor = darkSurface ? "#F7F9FC" : COLORS.navy;
  const dot = COLORS.accent;

  return L.divIcon({
    className: "pill-marker",
    html: `<div style="position:relative;display:inline-flex;align-items:center;gap:5px;padding:6px 11px 6px 9px;background:${bg};border:1.5px solid ${border};border-radius:22px;box-shadow:0 6px 18px rgba(11,31,51,0.16);white-space:nowrap;font-family:Inter,system-ui,sans-serif;font-size:11px;font-weight:600;color:${textColor};backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);">
      <span style="width:6px;height:6px;border-radius:50%;background:${dot};flex-shrink:0;display:inline-block"></span>
      <span>${label}</span>
    </div>`,
    iconSize: null,
    iconAnchor: [0, 0],
    popupAnchor: [0, -32],
  });
}

function getVenueGlyph(entity) {
  const raw = `${entity?.iconType || entity?.category || entity?.subcategory || ""}`.toLowerCase();
  if (raw.includes("coffee") || raw.includes("cafe")) return IconCoffee;
  if (
    raw.includes("restaurant") ||
    raw.includes("dining") ||
    raw.includes("food") ||
    raw.includes("bar") ||
    raw.includes("nightlife")
  ) {
    return IconDining;
  }
  return IconDining;
}

function getPerformanceConfig(state = "medium") {
  if (state === "high") return { color: COLORS.navy, glyph: IconActivity };
  if (state === "medium") return { color: COLORS.navySoft, glyph: IconActivity };
  if (state === "low") return { color: COLORS.low, glyph: IconActivity };
  if (state === "spike") return { color: COLORS.navySoft, glyph: IconEvent, accent: true };
  if (state === "opportunity") return { color: COLORS.opportunity, glyph: IconTarget, accent: true };
  return { color: COLORS.navySoft, glyph: IconActivity };
}

function createEntityMarker(entity, active = false) {
  if (entity?.performanceState) {
    const config = getPerformanceConfig(entity.performanceState);
    return wrapPin(config.glyph, {
      active,
      className: `custom-marker insight-marker insight-${entity.performanceState}`,
      color: config.color,
      accent: config.accent,
    });
  }

  if (entity?.markerType === "moment" || entity?.type === "moment") {
    return wrapPin(IconActivity, { active, className: "custom-marker moment-marker-icon", color: COLORS.navySoft, accent: true });
  }
  if (entity?.markerType === "perk" || entity?.type === "perk" || entity?.perk || entity?.perk_value) {
    return wrapPin(IconPerk, { active, className: "custom-marker perk-marker-icon", color: COLORS.navy, accent: true });
  }
  if (entity?.markerType === "event" || entity?.type === "event") {
    return wrapPin(IconEvent, { active, className: "custom-marker event-marker-icon", color: COLORS.navySoft, accent: true });
  }
  if (entity?.type === "hotel") {
    return wrapPin(IconHotel, { active, className: "custom-marker hotel-marker-icon", color: COLORS.navy });
  }
  if (entity?.markerType === "building" || ["building", "property"].includes(entity?.type)) {
    return wrapPin(IconProperty, { active, className: "custom-marker building-marker-icon", color: COLORS.navy });
  }
  if (entity?.markerType === "brand" || entity?.type === "brand") {
    return wrapPin(IconBrand, { active, className: "custom-marker brand-marker-icon", color: COLORS.navy, accent: true });
  }
  if (entity?.markerType === "civic" || entity?.type === "civic") {
    return wrapPin(IconCivic, { active, className: "custom-marker civic-marker-icon", color: COLORS.civic });
  }

  return wrapPin(getVenueGlyph(entity), {
    active,
    className: "custom-marker place-marker-icon",
    color: COLORS.navy,
  });
}

export function createCompactMarker(entity) {
  return createEntityMarker(entity, false);
}

export function createSelectedMarker(entity) {
  return createEntityMarker(entity, true);
}

export function createMarker(entity, options = {}) {
  if (options?.showPill) return createPillMarker(entity);
  if (options?.isSelected) return createSelectedMarker(entity);
  return createCompactMarker(entity);
}

export function getMarkerColors() {
  return {
    standard: COLORS.navy,
    building: COLORS.navy,
    event: COLORS.navySoft,
    perk: COLORS.navy,
    brand: COLORS.navy,
    civic: COLORS.civic,
  };
}

export function getMarkerVariant(entity) {
  if (entity?.isLive) return "live";
  if (entity?.isSaved) return "saved";
  if (entity?.perk?.isActive) return "perk-active";
  return "default";
}

