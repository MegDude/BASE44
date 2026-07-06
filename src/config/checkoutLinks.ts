import { STRIPE_PRODUCTS, type StripeProductKey } from "./stripeProducts";

export const CHECKOUT_LINKS = Object.fromEntries(
  Object.entries(STRIPE_PRODUCTS).map(([key, value]) => [key, value.checkoutUrl]),
) as Record<StripeProductKey, string>;

export const CHECKOUT_LABELS: Record<StripeProductKey, string> = {
  venueFreeListing: "Venue Free Listing",
  venueBasicAnnual: "Venue Basic Annual",
  venueGrowthAnnual: "Venue Growth Annual",
  venueProAnnual: "Venue Pro Annual",
  propertyPartnerAnnual: "Property Partner Annual",
  propertyBasicBuildingAnnual: "Basic Building Annual",
  propertyResidentPlusAnnual: "Resident Plus Annual",
  propertyProAnnual: "Property Pro Annual",
  hotelStarterAnnual: "Hotel Starter Annual",
  hotelProAnnual: "Hotel Pro Annual",
  brandAccessAnnual: "Brand Access Annual",
  brandCampaignsAnnual: "Brand Campaigns Annual",
  civicBasicAnnual: "Civic Basic Annual",
  civicPlusAnnual: "Civic Plus Annual",
  civicProAnnual: "Civic Pro Annual",
  realEstateAnnual: "Real Estate Annual",
  unlimitedPerkCampaignsAnnual: "Unlimited Perk Campaigns Annual",
  surveySeriesAnnual: "Survey Series Annual",
  analyticsPlusAnnual: "Analytics Plus Annual",
  analyticsProAnnual: "Analytics Pro Annual",
  districtSponsorAnnual: "District Sponsor Annual",
  perkCampaign: "Perk Campaign",
  featuredCampaign: "Featured Campaign",
  sponsoredCampaign: "Sponsored Campaign",
  eventBoost: "Event Boost",
  featuredEvent: "Featured Event",
  sponsoredEvent: "Sponsored Event",
  categoryFeatured7d: "Category Featured (7d)",
  categoryFeatured30d: "Category Featured (30d)",
  categoryFeatured90d: "Category Featured (90d)",
  districtFeatured30d: "District Featured (30d)",
  districtFeatured90d: "District Featured (90d)",
  nearbyBroadcast5Min: "Nearby Broadcast (5-min walk)",
  nearbyBroadcast10Min: "Nearby Broadcast (10-min walk)",
  nearbyBroadcastDistrict: "Nearby Broadcast (District)",
  nearbyBroadcastDowntown: "Nearby Broadcast (Downtown)",
  smsBroadcast500: "SMS Broadcast (up to 500)",
  smsBroadcast2500: "SMS Broadcast (up to 2,500)",
  smsBroadcast5000: "SMS Broadcast (up to 5,000)",
  singleSurvey: "Single Survey",
  customResearchProject: "Custom Research Project",
  inVenueActivation: "In-Venue Activation",
  propertyActivation: "Property Activation",
  multiLocationActivation: "Multi-Location Activation",
  streetTeamHalfDay: "Street Team Activation (Half Day)",
  streetTeamFullDay: "Street Team Activation (Full Day)",
  buildingPlacementPack: "Building Placement Pack",
  campaignLaunchKit: "Campaign Launch Kit",
  customPartnerReport: "Custom Partner Report",
  surveyPulse: "Survey Pulse",
  seasonalSponsor: "Seasonal Sponsor",
  residentJoinBuildingNotMember: "Perks Card",
};

export type CheckoutKey = StripeProductKey;

export function resolveCheckoutTarget(key: CheckoutKey) {
  const product = STRIPE_PRODUCTS[key];
  const label = CHECKOUT_LABELS[key];
  const mode = key.toLowerCase().includes("annual") || key === "residentJoinBuildingNotMember" ? "subscription" : "payment";

  if (product.checkoutUrl && mode !== "subscription") return { type: "url" as const, url: product.checkoutUrl, label, mode };
  if (product.priceId) return { type: "price" as const, priceId: product.priceId, label, mode };
  if (product.productId) return { type: "product" as const, productId: product.productId, label, mode };

  return { type: "lead" as const, label, mode };
}
