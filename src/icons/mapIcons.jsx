import React from "react";

function BaseMapIcon({ children, size = 20, className, fill = "none", strokeWidth = 2 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <BaseMapIcon {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="20" y1="20" x2="16.5" y2="16.5" />
    </BaseMapIcon>
  );
}

export function CoffeeIcon(props) {
  return (
    <BaseMapIcon {...props}>
      <path d="M3 8h13v6a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8Z" />
      <path d="M16 10h2a2 2 0 0 1 0 4h-2" />
      <path d="M8 4c0 2 2 2 2 4" />
      <path d="M12 4c0 2 2 2 2 4" />
    </BaseMapIcon>
  );
}

export function RestaurantIcon(props) {
  return (
    <BaseMapIcon {...props}>
      <path d="M6 2v10" />
      <path d="M10 2v10" />
      <path d="M6 6h4" />
      <path d="M14 2c2 3 2 7 0 10" />
    </BaseMapIcon>
  );
}

export function NightlifeIcon(props) {
  return (
    <BaseMapIcon {...props}>
      <path d="M5 3h14l-5 6v8h-4V9L5 3Z" />
    </BaseMapIcon>
  );
}

export function CalendarIcon(props) {
  return (
    <BaseMapIcon {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </BaseMapIcon>
  );
}

export function StarIcon(props) {
  return (
    <BaseMapIcon {...props} fill="currentColor" strokeWidth={0}>
      <path d="M12 2l3 6 7 .5-5 4 1.5 6.5L12 16l-6.5 3L7 12.5l-5-4 7-.5 3-6Z" />
    </BaseMapIcon>
  );
}

export function BuildingIcon(props) {
  return (
    <BaseMapIcon {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
    </BaseMapIcon>
  );
}

export function LocationIcon(props) {
  return (
    <BaseMapIcon {...props}>
      <path d="M12 22s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z" />
      <circle cx="12" cy="10" r="3" />
    </BaseMapIcon>
  );
}

export function HeartIcon(props) {
  return (
    <BaseMapIcon {...props}>
      <path d="M20 6c0-2-2-4-4-4s-4 2-4 2-2-2-4-2-4 2-4 4c0 6 12 14 12 14S20 12 20 6Z" />
    </BaseMapIcon>
  );
}

export function FilterIcon(props) {
  return (
    <BaseMapIcon {...props}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </BaseMapIcon>
  );
}

export function ArrowRightIcon(props) {
  return (
    <BaseMapIcon {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </BaseMapIcon>
  );
}

export function SparklesIcon(props) {
  return (
    <BaseMapIcon {...props} fill="currentColor" strokeWidth={0}>
      <path d="M12 2l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z" />
    </BaseMapIcon>
  );
}

export function ShoppingBagIcon(props) {
  return (
    <BaseMapIcon {...props}>
      <path d="M6 8h12l-1 11H7L6 8Z" />
      <path d="M9 9V7a3 3 0 0 1 6 0v2" />
    </BaseMapIcon>
  );
}

export function BriefcaseIcon(props) {
  return (
    <BaseMapIcon {...props}>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M9 7V5h6v2" />
      <path d="M3 12h18" />
    </BaseMapIcon>
  );
}

export function MegaphoneIcon(props) {
  return (
    <BaseMapIcon {...props}>
      <path d="M4 11v2" />
      <path d="M6 10l10-4v12L6 14Z" />
      <path d="M6 14v4a2 2 0 0 0 2 2h1" />
      <path d="M18 8c1.5 1 2 2.2 2 4s-.5 3-2 4" />
    </BaseMapIcon>
  );
}

export function LandmarkIcon(props) {
  return (
    <BaseMapIcon {...props}>
      <path d="M3 21h18" />
      <path d="M6 18V10" />
      <path d="M10 18V10" />
      <path d="M14 18V10" />
      <path d="M18 18V10" />
      <path d="M4 10h16" />
      <path d="M12 3 3 7v3h18V7l-9-4Z" />
    </BaseMapIcon>
  );
}
