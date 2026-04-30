import type { ReactNode } from "react";

export type LinkAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export type ChipItem = {
  id: string;
  label: string;
  icon?: ReactNode;
};

export type CapabilityItem = {
  id: string;
  title: string;
  description: string;
  tab: "all" | "places" | "offers" | "events" | "properties";
};

export type PreviewResultType =
  | "moment"
  | "event"
  | "perk"
  | "place"
  | "property";

export type PreviewResult = {
  id: string;
  type: PreviewResultType;
  title: string;
  subtitle?: string;
  description?: string;
  distanceLabel?: string;
  offerLabel?: string;
  badge?: string;
  isFeatured?: boolean;
};

export type RouteCardData = {
  title: string;
  description: string;
  address: string;
  primaryAction: LinkAction;
  secondaryAction?: LinkAction;
  badge?: string;
  imageUrl?: string;
};

export type StepItem = {
  id: string;
  number: number;
  title: string;
  description: string;
};

export type ValueCardItem = {
  id: string;
  title: string;
  description: string;
  action: LinkAction;
};

export type PricingPlan = {
  id: string;
  title: string;
  audience: string;
  price: string;
  description: string;
  action: LinkAction;
  featured?: boolean;
};

export type FooterGroup = {
  id: string;
  title: string;
  links: LinkAction[];
};
