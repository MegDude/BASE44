export function toResidentEntityView(entity: any = {}) {
  return {
    title: entity.title || entity.name || "Downtown place",
    category: entity.category || entity.categoryLabel || entity.kind || "Nearby",
    distance: entity.distanceLabel || entity.distance || entity.walkTime || "",
    status: entity.openStatus || entity.statusLabel || entity.status || "",
    benefit: entity.perkLabel || entity.offerTitle || entity.perkTitle || "",
    description: entity.residentDescription || entity.description || entity.summary || "",
    actions: ["Save", "Get Directions", "Show Perk"],
  };
}
