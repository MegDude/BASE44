import { legendsPropertyContent, type LegendsProperty } from "@/data/legendsPropertyContent";

function normalize(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .replace(/#/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function entityText(entity: any): string {
  const raw = entity?.raw || {};
  return [
    entity?.id,
    entity?.name,
    entity?.title,
    entity?.address,
    entity?.displayAddress,
    entity?.listingAddress,
    entity?.slug,
    entity?.building,
    entity?.buildingName,
    raw.id,
    raw.name,
    raw.title,
    raw.address,
    raw.displayAddress,
    raw.listingAddress,
    raw.slug,
    raw.building,
    raw.buildingName,
  ].filter(Boolean).join(" ");
}

export function getLegendsMappingNames(property: LegendsProperty): string[] {
  return [
    property.id,
    property.buildingName,
    property.address,
    ...property.entityAliases,
    ...property.listings,
  ].filter(Boolean);
}

export function resolveLegendsPropertyByEntity(entity: any): LegendsProperty | null {
  const haystack = normalize(entityText(entity));
  if (!haystack) return null;

  return legendsPropertyContent.find((property) => (
    getLegendsMappingNames(property).some((alias) => {
      const normalizedAlias = normalize(alias);
      return normalizedAlias && haystack.includes(normalizedAlias);
    })
  )) ?? null;
}

