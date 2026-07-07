import archiveLocationReferences from "@/data/archiveLocationReferences.json";

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const references = archiveLocationReferences.references || [];
const byId = new Map(references.map((reference) => [reference.id, reference]));
const byName = new Map(references.map((reference) => [reference.nameKey, reference]));

function mergeTags(existing, incoming) {
  const current = Array.isArray(existing) ? existing : [];
  const next = String(incoming || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return Array.from(new Set([...current, ...next]));
}

function hasUsefulText(value) {
  return Boolean(String(value || "").trim());
}

export function getArchiveLocationReference(entity) {
  const idKey = slug(entity?.id);
  const nameKey = slug(entity?.name || entity?.current_map_name || entity?.title);
  return byId.get(idKey) || byName.get(nameKey) || null;
}

export function enrichWithArchiveLocationContext(entity) {
  const reference = getArchiveLocationReference(entity);
  if (!reference) return entity;

  const recommendedImage = reference.currentImage && reference.imageStatus === "OK" ? reference.currentImage : undefined;
  const residentDescription = reference.residentShortDescription || reference.recommendedPanelCopy;
  const offer = reference.recommendedPerk;
  const hasExplicitOffer = hasUsefulText(entity.deals_offers || entity.offer || entity.specials || entity.perk);
  const canPublishArchiveOffer =
    hasUsefulText(offer) &&
    String(reference.priority || "").toLowerCase() !== "backlog" &&
    String(entity.source || "").toLowerCase() !== "user-provided rail card migration";

  return {
    ...entity,
    category: entity.category || reference.category || entity.type,
    district: entity.district || reference.district,
    pinKey: entity.pinKey || reference.recommendedPinKey || reference.pinType,
    image: entity.image || recommendedImage,
    summary: hasUsefulText(entity.summary) ? entity.summary : residentDescription,
    description: hasUsefulText(entity.description) ? entity.description : residentDescription,
    deals_offers: entity.deals_offers || entity.offer || (canPublishArchiveOffer ? offer : undefined),
    specials: entity.specials || (canPublishArchiveOffer ? offer : undefined),
    why_people_go: entity.why_people_go || reference.whyPeopleGo,
    partnerOpportunity: entity.partnerOpportunity || reference.partnerOpportunity,
    partnerInsight: entity.partnerInsight || reference.partnerOpportunity,
    residentCta: entity.residentCta || reference.residentCta,
    recommendedPerk: entity.recommendedPerk || (hasExplicitOffer || canPublishArchiveOffer ? offer : undefined),
    tags: mergeTags(entity.tags, reference.tags),
    archiveLocationContext: reference,
    source: entity.source || "Archive 2 location reference",
  };
}

export { archiveLocationReferences };
