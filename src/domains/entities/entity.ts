export const ENTITY_TYPES = [
  "property",
  "building",
  "venue",
  "restaurant",
  "hotel",
  "brand",
  "event",
  "collection",
  "route",
  "offer",
  "campaign",
  "workspace",
  "report",
  "qr",
  "artwork",
  "story",
  "neighborhood",
  "district",
  "resident",
  "partner",
  "media",
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export type EntityStatus = "draft" | "active" | "inactive" | "archived";
export type EntityVisibility = "public" | "resident" | "workspace" | "private";

export type CanonicalEntity = {
  id: string;
  entityType: EntityType;
  slug: string;
  title: string;
  status: EntityStatus;
  visibility: EntityVisibility;
  workspaceId: string | null;
  ownerId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  summary?: string | null;
  description?: string | null;
  tags?: string[];
  categories?: string[];
  coordinates?: { latitude: number; longitude: number } | null;
  address?: string | null;
  media?: { hero?: string | null; gallery?: string[] };
  metadata?: Record<string, unknown>;
};

export type EntityRelationship = {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: string;
  metadata?: Record<string, unknown>;
  createdAt?: string | null;
};
