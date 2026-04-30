import React from "react";
import {
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  CoffeeIcon,
  HeartIcon,
  LandmarkIcon,
  LocationIcon,
  MegaphoneIcon,
  NightlifeIcon,
  RestaurantIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StarIcon,
} from "@/icons/mapIcons";
import { getScale, PIN_COLORS } from "@/styles/pinTokens";
import "@/styles/pin.css";

const LEGENDS_LOGO =
  "https://media.base44.com/images/public/69d94e4f5b7886cf42a2cf62/59a2b6b9d_legends-logocopy.png";

function resolveIcon(type) {
  if (type === "perk") return StarIcon;
  if (type === "event") return CalendarIcon;
  if (type === "building") return BuildingIcon;
  if (type === "hotel") return BuildingIcon;
  if (type === "brand") return MegaphoneIcon;
  if (type === "civic") return LandmarkIcon;
  if (type === "coffee") return CoffeeIcon;
  if (type === "wellness") return HeartIcon;
  if (type === "nightlife") return NightlifeIcon;
  if (type === "spark") return SparklesIcon;
  if (type === "retail") return ShoppingBagIcon;
  if (type === "services") return BriefcaseIcon;
  if (type === "restaurant") return RestaurantIcon;
  return LocationIcon;
}

export function mapType(entity) {
  const raw = `${entity?.iconType || entity?.category || entity?.subcategory || ""}`.toLowerCase();
  if (entity?.perk || entity?.perk_value || entity?.type === "perk") return "perk";
  if (entity?.type === "event") return "event";
  if (entity?.type === "brand") return "brand";
  if (entity?.type === "civic") return "civic";
  if (entity?.type === "hotel") return "hotel";
  if (entity?.type === "property" || entity?.type === "building") return "building";
  if (raw.includes("coffee") || raw.includes("cafe")) return "coffee";
  if (raw.includes("wellness") || raw.includes("yoga") || raw.includes("spa") || raw.includes("fitness")) return "wellness";
  if (raw.includes("retail") || raw.includes("shop")) return "retail";
  if (raw.includes("service")) return "services";
  if (raw.includes("bar") || raw.includes("cocktail") || raw.includes("drink") || raw.includes("nightlife")) return "nightlife";
  if (
    raw.includes("restaurant") ||
    raw.includes("dining") ||
    raw.includes("food") ||
    raw.includes("brunch") ||
    raw.includes("pizza")
  ) {
    return "restaurant";
  }
  return "default";
}

export default function Pin({
  type = "default",
  selected = false,
  score = 0,
  inRadius = true,
  boosted = false,
  isLegends = false,
}) {
  const Icon = resolveIcon(type);
  const color = PIN_COLORS[type] || PIN_COLORS.default;
  const scale = getScale(score, selected);
  const opacity = inRadius ? 1 : 0.35;
  const usesShelllessPropertyStyle = type === "building" || type === "hotel";

  return (
    <div
      className={[
        "dp-map-pin",
        `dp-map-pin--${type}`,
        selected ? "dp-map-pin--selected" : "",
        boosted ? "dp-map-pin--boost" : "",
        inRadius ? "" : "dp-map-pin--out-of-radius",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        "--pin-color": color,
        "--pin-scale": String(scale),
        "--pin-opacity": String(opacity),
        "--pin-surface": selected ? color : "#ffffff",
      }}
    >
      <span className="dp-map-pin__shell" />
      {type === "event" ? <span className="dp-map-pin__ripple" /> : null}
      {type === "perk" ? <span className="dp-map-pin__pulse" /> : null}
      <span className="dp-map-pin__icon">
        {isLegends ? (
          <img src={LEGENDS_LOGO} alt="" className="dp-map-pin__logo" />
        ) : (
          <Icon size={16} className={selected && !usesShelllessPropertyStyle ? "text-white" : ""} />
        )}
      </span>
    </div>
  );
}
