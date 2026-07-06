function cleanBenefitCopy(value: any = "") {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (/^(show|save|use|open|scan|tap|click|claim|redeem|get directions|ask)\b/i.test(text)) return "";
  return text;
}

function buildBenefitFallback(perk: any = {}, entity: any = {}) {
  const name = entity.name || entity.title || perk.partnerName || perk.parentEntityName || "This Downtown Perks pin";
  const value = cleanBenefitCopy(perk.value || perk.offerText || perk.perkValue || entity.offer || entity.deals_offers);
  const category = entity.category || perk.category || "resident";
  if (value) return `${name} gives verified residents ${value}, with the benefit tied directly to this ${String(category).toLowerCase()} listing.`;
  return `${name} includes a resident benefit through Downtown Perks, giving verified residents a clear local advantage tied to this pin.`;
}

export function toResidentPerkView(perk: any = {}, entity: any = {}) {
  const offerDetails = cleanBenefitCopy(perk.offerText || perk.value || perk.description || entity.description || entity.summary) || buildBenefitFallback(perk, entity);
  return {
    title: perk.title || perk.perkTitle || perk.offerTitle || entity.perkLabel || "Resident perk",
    partnerName: perk.partnerName || perk.parentEntityName || entity.name || entity.title || "",
    offerDetails,
    howToRedeem: perk.redeemInstructions || perk.terms || "Show your Resident Pass when the offer is active.",
    eligibility: perk.eligibility || "Verified residents",
    distance: entity.distanceLabel || entity.walkTime || "",
    openStatus: entity.openStatus || entity.statusLabel || "",
    actions: ["Save", "Show Pass", "Get Directions"],
  };
}
