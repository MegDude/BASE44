export function toResidentPerkView(perk: any = {}, entity: any = {}) {
  return {
    title: perk.title || perk.perkTitle || perk.offerTitle || entity.perkLabel || "Resident perk",
    partnerName: perk.partnerName || perk.parentEntityName || entity.name || entity.title || "",
    offerDetails: perk.offerText || perk.value || perk.description || entity.description || "",
    howToRedeem: perk.redeemInstructions || perk.terms || "Show your Resident Pass when the offer is active.",
    eligibility: perk.eligibility || "Verified residents",
    distance: entity.distanceLabel || entity.walkTime || "",
    openStatus: entity.openStatus || entity.statusLabel || "",
    actions: ["Save", "Show Pass", "Get Directions"],
  };
}
