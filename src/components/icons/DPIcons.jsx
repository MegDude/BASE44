import React from "react";

export function BaseIcon({ children, size = 24, className, fill = "none", ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill={fill}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconSearch(props) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="16.65" y1="16.65" x2="21" y2="21" />
    </BaseIcon>
  );
}

export function IconMap(props) {
  return (
    <BaseIcon {...props}>
      <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20V6.5Z" />
      <path d="M9 4v13.5" />
      <path d="M15 6.5V20" />
    </BaseIcon>
  );
}

export function IconAsk(props) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <circle cx="12" cy="12" r="3" />
    </BaseIcon>
  );
}

export function IconCalendarCheck(props) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="m9 15 2 2 4-4" />
    </BaseIcon>
  );
}

export function IconEvent(props) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </BaseIcon>
  );
}

export function IconBookmark(props) {
  return (
    <BaseIcon {...props}>
      <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3-6 3V5a1 1 0 0 1 1-1Z" />
    </BaseIcon>
  );
}

export function IconCard(props) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="7" y1="15" x2="11" y2="15" />
    </BaseIcon>
  );
}

export function IconPerk(props) {
  return (
    <BaseIcon {...props}>
      <path d="M20 12l-8 8-8-8 8-8 8 8z" />
    </BaseIcon>
  );
}

export function IconClock(props) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </BaseIcon>
  );
}

export function IconProperty(props) {
  return (
    <BaseIcon {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </BaseIcon>
  );
}

export function IconLegends(props) {
  return (
    <BaseIcon {...props}>
      <path d="M7 4v16h10" />
      <path d="M10 8h6" />
      <path d="M10 12h5" />
      <path d="M10 16h6" />
    </BaseIcon>
  );
}

export function IconUser(props) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.8-3.2 4.2-4.8 7-4.8s5.2 1.6 7 4.8" />
    </BaseIcon>
  );
}

export function IconHotel(props) {
  return (
    <BaseIcon {...props}>
      <path d="M3 7h18v10H3z" />
      <path d="M7 7v10" />
    </BaseIcon>
  );
}

export function IconChevronDown(props) {
  return (
    <BaseIcon {...props}>
      <polyline points="6 9 12 15 18 9" />
    </BaseIcon>
  );
}

export function IconChevronUp(props) {
  return (
    <BaseIcon {...props}>
      <polyline points="6 15 12 9 18 15" />
    </BaseIcon>
  );
}

export function IconBrand(props) {
  return (
    <BaseIcon {...props}>
      <path d="M3 11l18-8v18l-18-8z" />
    </BaseIcon>
  );
}

export function IconArrowRight(props) {
  return (
    <BaseIcon {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </BaseIcon>
  );
}

export function IconConversion(props) {
  return (
    <BaseIcon {...props}>
      <path d="M3 4h18l-7 8v6l-4 2v-8z" />
    </BaseIcon>
  );
}

export function IconSave(props) {
  return <IconBookmark {...props} />;
}

export function IconTrendUp(props) {
  return (
    <BaseIcon {...props}>
      <polyline points="3 17 9 11 13 15 21 7" />
    </BaseIcon>
  );
}

export function IconTrendDown(props) {
  return (
    <BaseIcon {...props}>
      <polyline points="3 7 9 13 13 9 21 17" />
    </BaseIcon>
  );
}

export function IconClose(props) {
  return (
    <BaseIcon {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </BaseIcon>
  );
}

export function IconDining(props) {
  return (
    <BaseIcon {...props}>
      <path d="M8 3v8" />
      <path d="M11 3v8" />
      <path d="M8 7h3" />
      <path d="M15 3c1.7 1.6 1.7 4.9 0 6.5V21" />
    </BaseIcon>
  );
}

export function IconDrink(props) {
  return (
    <BaseIcon {...props}>
      <path d="M7 5h10l-2 6H9L7 5Z" />
      <path d="M12 11v8" />
      <path d="M9 19h6" />
    </BaseIcon>
  );
}

export function IconCoffee(props) {
  return (
    <BaseIcon {...props}>
      <path d="M6 9h9a0 0 0 0 1 0 0v3a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V9a0 0 0 0 1 0 0z" />
      <path d="M15 10h1.5a2 2 0 0 1 0 4H15" />
      <path d="M8 3v2M11 3v2M14 3v2" />
    </BaseIcon>
  );
}

export function IconRetail(props) {
  return (
    <BaseIcon {...props}>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </BaseIcon>
  );
}

export function IconFitness(props) {
  return (
    <BaseIcon {...props}>
      <path d="M5 10h3v4H5zM16 10h3v4h-3z" />
      <path d="M8 12h8" />
      <path d="M10 9v6M14 9v6" />
    </BaseIcon>
  );
}

export function IconSettings(props) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.3.7a7.2 7.2 0 0 0-1.7-1L14.5 3h-5L9 5.7a7.2 7.2 0 0 0-1.7 1L5 6 3 9.5 5.1 11A7 7 0 0 0 5 12c0 .3 0 .7.1 1L3 14.5 5 18l2.3-.7c.5.4 1.1.7 1.7 1l.5 2.7h5l.5-2.7c.6-.3 1.2-.6 1.7-1l2.3.7 2-3.5-2.1-1.5c.1-.3.1-.7.1-1Z" />
    </BaseIcon>
  );
}

export function IconInfo(props) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 10v5" />
      <circle cx="12" cy="7" r="0.9" fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}

export function IconCivic(props) {
  return (
    <BaseIcon {...props}>
      <path d="M4 20h16" />
      <path d="M6 20V10l6-4 6 4v10" />
      <path d="M9 20v-5h6v5" />
    </BaseIcon>
  );
}

export function IconTarget(props) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 5v2M19 12h-2M12 19v-2M5 12h2" />
    </BaseIcon>
  );
}

export function IconActivity(props) {
  return (
    <BaseIcon {...props}>
      <path d="M3 12h4l2.5-5 5 10 2.5-5H21" />
    </BaseIcon>
  );
}

export function IconNavigation(props) {
  return (
    <BaseIcon {...props}>
      <path d="M21 3 10 14" />
      <path d="m21 3-7 18-4-7-7-4 18-7Z" />
    </BaseIcon>
  );
}

export function getEntityIcon(item) {
  const type = String(item?.type || item?.markerType || item?.entityType || "").toLowerCase();
  const category = String(item?.category || item?.subcategory || item?.iconType || "").toLowerCase();
  const name = String(item?.name || item?.title || "").toLowerCase();
  const searchable = `${type} ${category} ${name}`;

  if (type === "cluster") {
    if (category === "property") return IconProperty;
    if (category === "event") return IconEvent;
    if (category === "partner") return IconPerk;
    if (category === "civic") return IconCivic;
    return IconMap;
  }
  if (type === "event") return IconEvent;
  if (type === "perk" || item?.perk || item?.perk_value) return IconPerk;
  if (type === "hotel") return IconHotel;
  if (type === "brand" || type === "campaign") return IconBrand;
  if (type === "civic" || type === "district") return IconCivic;
  if (item?.isLegends || item?.metadata?.isLegends) return IconLegends;
  if (type === "property" || type === "building") return IconProperty;
  if (searchable.includes("coffee") || searchable.includes("cafe")) return IconCoffee;
  if (searchable.includes("bar") || searchable.includes("cocktail") || searchable.includes("drink")) return IconDrink;
  if (searchable.includes("fitness") || searchable.includes("yoga") || searchable.includes("gym") || searchable.includes("wellness")) return IconFitness;
  if (searchable.includes("retail") || searchable.includes("shop") || searchable.includes("grocery") || searchable.includes("market")) return IconRetail;
  return IconDining;
}

export function getEntityLabel(item) {
  const type = String(item?.type || item?.markerType || item?.entityType || "").toLowerCase();
  const category = String(item?.category || item?.subcategory || item?.iconType || "").toLowerCase();
  const searchable = `${type} ${category}`;

  if (type === "cluster") {
    if (category === "property") return "Nearby Homes";
    if (category === "event") return "Nearby Events";
    if (category === "partner") return "Nearby Perks";
    if (category === "civic") return "Nearby Places";
    return "Nearby Places";
  }
  if (type === "event") return "Event";
  if (type === "perk" || item?.perk || item?.perk_value) return "Perk";
  if (type === "hotel") return "Hotel";
  if (type === "brand" || type === "campaign") return "Brand";
  if (type === "civic" || type === "district") return "Civic";
  if (item?.isLegends || item?.metadata?.isLegends) return "Legends Property";
  if (type === "property" || type === "building") return "Property";
  if (searchable.includes("coffee") || searchable.includes("cafe")) return "Coffee";
  if (searchable.includes("bar") || searchable.includes("cocktail") || searchable.includes("drink")) return "Drinks";
  if (searchable.includes("fitness") || searchable.includes("yoga") || searchable.includes("gym") || searchable.includes("wellness")) return "Wellness";
  if (searchable.includes("retail") || searchable.includes("shop")) return "Retail";
  if (searchable.includes("grocery") || searchable.includes("market")) return "Grocery";
  return "Venue";
}

export function getResidentTabIcon(tabId) {
  if (tabId === "now") return IconAsk;
  if (tabId === "map") return IconMap;
  if (tabId === "saved") return IconBookmark;
  if (tabId === "plan") return IconCalendarCheck;
  if (tabId === "card") return IconCard;
  if (tabId === "you") return IconUser;
  return IconMap;
}

export function MarkerPin({
  glyph: Glyph,
  selected = false,
  accent = false,
  color = "#0B1A2B",
  accentColor = "#C6A85A",
  variant = "venue",
  saved = false,
  live = false,
}) {
  const isProperty = variant === "property";
  const isEvent = variant === "event";
  const isPerk = variant === "perk";
  const shellFill = selected
    ? color
    : isProperty
      ? "#EEF3F8"
      : isPerk
        ? "#FFF9EC"
        : "#FFFFFF";
  const glyphColor = selected ? "#FFFFFF" : color;

  return (
    <svg
      width="32"
      height="42"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", color }}
    >
      {isEvent ? (
        <circle
          cx="12"
          cy="10.5"
          r="7.6"
          fill={selected ? "rgba(198,168,90,0.28)" : "rgba(198,168,90,0.16)"}
          stroke="none"
        />
      ) : null}
      <path
        d="M12 21s6-5.4 6-10.5A6 6 0 0 0 6 10.5C6 15.6 12 21 12 21z"
        fill={shellFill}
        stroke={color}
        strokeWidth="1.2"
      />
      {isProperty ? (
        <rect
          x="8.2"
          y="6.9"
          width="7.6"
          height="7.2"
          rx="1.8"
          fill={selected ? "rgba(255,255,255,0.18)" : "#FFFFFF"}
          stroke={selected ? "rgba(255,255,255,0.6)" : "rgba(11,26,43,0.12)"}
          strokeWidth="0.6"
        />
      ) : null}
      {Glyph ? (
        <g transform="translate(7.8 6.5) scale(0.35)" style={{ color: glyphColor }}>
          <Glyph size={24} />
        </g>
      ) : (
        <circle cx="12" cy="10.5" r="2.5" stroke={color} fill={selected ? "#FFFFFF" : "none"} />
      )}
      {accent || isPerk ? <circle cx="16.75" cy="7.6" r="1.25" fill={accentColor} stroke="none" /> : null}
      {saved ? (
        <circle cx="7.1" cy="6.8" r="1.35" fill="#0B1A2B" stroke="#FFFFFF" strokeWidth="0.7" />
      ) : null}
      {live ? (
        <circle cx="18.1" cy="13.8" r="1.2" fill="#2F6F55" stroke="#FFFFFF" strokeWidth="0.7" />
      ) : null}
    </svg>
  );
}
