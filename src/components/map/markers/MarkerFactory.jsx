import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import Pin, { mapType } from "@/components/map/Pin";
import { isWithinRadius } from "@/styles/pinTokens";

const LEGENDS_LOGO =
  "https://media.base44.com/images/public/69d94e4f5b7886cf42a2cf62/59a2b6b9d_legends-logocopy.png";

function getClusterVisual(entity) {
  const family = String(entity?.category || entity?.metadata?.category || "venue").toLowerCase();
  if (family === "property") {
    return {
      label: "Homes nearby",
      shell: "#0B1F33",
      accent: "#C6A85A",
      icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V8l8-5 8 5v13"/><path d="M9 21v-6h6v6"/></svg>`,
    };
  }
  if (family === "event") {
    return {
      label: "Events nearby",
      shell: "#0B1F33",
      accent: "#C6A85A",
      icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4M16 3v4"/></svg>`,
    };
  }
  if (family === "partner") {
    return {
      label: "Perks nearby",
      shell: "#C6A85A",
      accent: "#0B1F33",
      icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1F33" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12 12 20 4 12l8-8 8 8Z"/></svg>`,
    };
  }
  if (family === "civic") {
    return {
      label: "Places nearby",
      shell: "#F7F9FC",
      accent: "#0B1F33",
      icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1F33" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="M6 20V10l6-4 6 4v10"/><path d="M9 20v-5h6v5"/></svg>`,
    };
  }
  return {
    label: "Places nearby",
    shell: "#F7F9FC",
    accent: "#0B1F33",
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1F33" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.2-4.2 8.6-6.8 10.8a1.7 1.7 0 0 1-2.4 0C8.2 18.6 4 14.2 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
  };
}

function createClusterMarker(entity, options = {}) {
  const count = Number(entity?.metadata?.clusterCount || entity?.clusterCount || 0);
  const district = String(entity?.district || entity?.metadata?.district || "Downtown");
  const selected = Boolean(options?.isSelected);
  const visual = getClusterVisual(entity);
  const shell = selected ? "#0B1F33" : visual.shell;
  const textColor = selected ? "#fff" : visual.accent;
  const iconMarkup =
    selected && visual.accent !== "#ffffff"
      ? visual.icon.replace(/stroke="#0B1F33"/g, 'stroke="white"')
      : visual.icon;

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:999px;background:${shell};border:1.5px solid rgba(11,31,51,0.12);box-shadow:0 12px 28px rgba(11,31,51,0.18);color:${textColor};font-family:Inter,system-ui,sans-serif;transform:translate(-50%, -50%);white-space:nowrap;">
      <span style="position:relative;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:999px;background:${selected ? "rgba(255,255,255,0.14)" : "rgba(11,31,51,0.06)"};flex-shrink:0;">${iconMarkup}
        <span style="position:absolute;right:-2px;bottom:-2px;display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:${selected ? "#C6A85A" : "#0B1F33"};color:white;font-size:9px;font-weight:800;line-height:1;">${count}</span>
      </span>
      <span style="display:grid;gap:1px;">
        <span style="font-size:11px;font-weight:700;line-height:1.1">${district}</span>
        <span style="font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.72;line-height:1.1">${visual.label}</span>
      </span>
    </div>`,
    iconSize: null,
    iconAnchor: [0, 0],
    popupAnchor: [0, -28],
  });
}

function renderPin(entity, options = {}) {
  const score = getEntityScore(entity);
  const type = mapType(entity);
  const radiusMinutes = Number.isFinite(options?.radiusMinutes) ? options.radiusMinutes : null;
  const inRadius = isWithinRadius(entity, radiusMinutes);
  const boosted = score > 85;
  const isLegends = Boolean(entity?.isLegends || entity?.metadata?.isLegends);

  return renderToStaticMarkup(
    <Pin
      type={type}
      selected={Boolean(options?.isSelected)}
      score={score}
      inRadius={inRadius}
      boosted={boosted}
      isLegends={isLegends}
    />
  );
}

function getEntityScore(entity) {
  let score = Number(entity?.metadata?.popularity ?? entity?.score ?? 0);

  if (entity?.isLive || entity?.eventTiming?.isLive) score += 25;
  if (entity?.isOpenNow) score += 12;
  if (entity?.perk || entity?.perk_value || entity?.type === "perk") score += 15;

  const walkMinutes = entity?.metadata?.walkMinutes;
  if (Number.isFinite(walkMinutes)) {
    score += Math.max(0, 20 - walkMinutes * 2);
  }

  return Math.max(0, Math.min(100, score));
}

function createPillMarker(entity) {
  const label = String(entity?.name || entity?.title || "Downtown place");
  const type = mapType(entity);
  const isLegends = Boolean(entity?.isLegends || entity?.metadata?.isLegends);
  const darkSurface = entity?.type === "building" || entity?.type === "hotel" || entity?.type === "property" || isLegends;
  const isBrand = entity?.type === "brand";
  const isCivic = entity?.type === "civic";
  const bg = isBrand
    ? "rgba(255,255,255,0.98)"
    : isCivic
      ? "rgba(255,255,255,0.98)"
      : darkSurface
        ? "rgba(20,38,59,0.95)"
        : "rgba(255,255,255,0.98)";
  const border = darkSurface
    ? "rgba(198,168,90,0.42)"
    : isBrand
      ? "rgba(198,168,90,0.26)"
      : isCivic
        ? "rgba(11,26,43,0.14)"
        : "rgba(11,26,43,0.10)";
  const textColor = darkSurface ? "#F7F9FC" : "#0B1A2B";
  const metaColor = darkSurface ? "rgba(247,249,252,0.72)" : "rgba(11,26,43,0.52)";
  const dot = darkSurface ? "#C6A85A" : isCivic ? "#0B1A2B" : "#C6A85A";
  const typeLabel =
    entity?.type === "hotel"
      ? "Hotel"
      : entity?.type === "building" || entity?.type === "property"
        ? isLegends
          ? "Legends"
          : "Building"
        : entity?.type === "brand"
          ? "Brand"
          : entity?.type === "civic"
            ? "Civic"
            : type;
  const logoMarkup = isLegends
    ? `<img src="${LEGENDS_LOGO}" alt="" style="width:16px;height:16px;object-fit:contain;display:block" />`
    : `<span style="width:8px;height:8px;border-radius:50%;background:${dot};flex-shrink:0;display:inline-block"></span>`;

  return L.divIcon({
    className: "pill-marker",
    html: `<div style="position:relative;display:inline-flex;align-items:center;gap:8px;padding:7px 12px 7px 10px;background:${bg};border:1.5px solid ${border};border-radius:22px;box-shadow:0 8px 20px rgba(11,31,51,0.16);white-space:nowrap;font-family:Inter,system-ui,sans-serif;color:${textColor};">
      <span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;flex-shrink:0">${logoMarkup}</span>
      <span style="display:grid;gap:1px">
        <span style="font-size:11px;font-weight:700;line-height:1.1">${label}</span>
        <span style="font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${metaColor};line-height:1.1">${typeLabel}</span>
      </span>
    </div>`,
    iconSize: null,
    iconAnchor: [0, 0],
    popupAnchor: [0, -32],
  });
}

function createPropertyShowcaseMarker(entity, options = {}) {
  const isLegends = Boolean(entity?.isLegends || entity?.metadata?.isLegends);
  const isSelected = Boolean(options?.isSelected);
  const theme = options?.theme === "light" ? "light" : "dark";
  const size = isLegends ? (isSelected ? 38 : 34) : isSelected ? 24 : 20;
  const ring =
    isSelected
      ? "0 0 0 10px rgba(198,168,90,0.18)"
      : theme === "light"
        ? "0 0 0 6px rgba(194,143,84,0.14)"
        : "0 0 0 6px rgba(11,31,51,0.08)";
  const inner = isLegends
    ? `<img src="${LEGENDS_LOGO}" alt="" style="width:${isSelected ? 28 : 24}px;height:${isSelected ? 28 : 24}px;object-fit:contain;display:block" />`
    : `<span style="width:${isSelected ? 10 : 8}px;height:${isSelected ? 10 : 8}px;border-radius:999px;background:${theme === "light" ? "#C28F54" : isSelected ? "#C6A85A" : "#0B1A2B"};display:block"></span>`;

  return L.divIcon({
    className: "property-showcase-marker",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:999px;background:${isLegends ? "rgba(255,255,255,0.98)" : theme === "light" ? "rgba(255,255,255,0.98)" : "rgba(11,26,43,0.96)"};border:${isLegends ? "1.5px solid rgba(198,168,90,0.42)" : theme === "light" ? "1.5px solid rgba(194,143,84,0.42)" : "1.5px solid rgba(255,255,255,0.92)"};box-shadow:${ring},0 10px 22px rgba(11,31,51,0.18);transform:translate(-50%, -50%);overflow:hidden">${inner}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export function createCompactMarker(entity, options = {}) {
  return L.divIcon({
    className: "custom-marker",
    html: renderPin(entity, options),
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

export function createSelectedMarker(entity, options = {}) {
  return createCompactMarker(entity, { ...options, isSelected: true });
}

export function createMarker(entity, options = {}) {
  if (entity?.type === "cluster" || entity?.entity_type === "cluster") {
    return createClusterMarker(entity, options);
  }

  if (options?.variant === "property-showcase") {
    return createPropertyShowcaseMarker(entity, options);
  }

  const shouldShowPill =
    (!options?.suppressPill && options?.showPill) ||
    (!options?.suppressPill &&
      ["brand", "civic"].includes(entity?.type));

  if (shouldShowPill && !options?.isSelected) return createPillMarker(entity);
  if (options?.isSelected) return createSelectedMarker(entity, options);
  return createCompactMarker(entity, options);
}

export function getMarkerColors() {
  return {
    standard: "#0B1A2B",
    building: "#0B1A2B",
    event: "#0B1A2B",
    perk: "#C6A85A",
    coffee: "#0B1A2B",
    nightlife: "#0B1A2B",
  };
}

export function getMarkerVariant(entity) {
  if (entity?.isLive) return "live";
  if (entity?.isSaved) return "saved";
  if (entity?.perk?.isActive) return "perk-active";
  return "default";
}
