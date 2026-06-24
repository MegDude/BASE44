import type { StripeProductKey } from "./stripeProducts";

export type PartnerType = "Venue" | "Property" | "Hotel" | "Brand" | "Civic" | "Real Estate" | "Resident";

export type PricingPlan = {
  id: StripeProductKey;
  partnerType: PartnerType;
  tier: string;
  label: string;
  annualPrice: number | null;
  summary: string;
  checkoutKey: StripeProductKey;
  includes: string[];
  bestFor: string;
  billing: "Annual subscription" | "Lead path";
};

export type PricingModule = {
  id: StripeProductKey;
  label: string;
  price: number;
  summary: string;
  billing: "One-time module" | "Annual add-on";
};

export type PricingModuleGroup = {
  id: string;
  heading: string;
  sentence: string;
  modules: PricingModule[];
};

export const PRICING_REGISTRY = {
  partnerTypes: ["Venue", "Property", "Hotel", "Brand", "Civic", "Real Estate", "Resident"] as PartnerType[],
  plans: [
    {
      id: "venueFreeListing",
      partnerType: "Venue",
      tier: "Free Listing",
      label: "Venue Free Listing",
      annualPrice: 0,
      summary: "A lead path for venues that want basic visibility before checkout.",
      checkoutKey: "venueFreeListing",
      includes: ["Basic listing", "Partner intake", "Setup review"],
      bestFor: "Getting listed",
      billing: "Lead path",
    },
    {
      id: "venueBasicAnnual",
      partnerType: "Venue",
      tier: "Basic",
      label: "Venue Basic Annual",
      annualPrice: 30,
      summary: "A simple annual map presence for local operators.",
      checkoutKey: "venueBasicAnnual",
      includes: ["Map Listing", "Business Profile", "Resident Offer"],
      bestFor: "Getting started",
      billing: "Annual subscription",
    },
    {
      id: "venueGrowthAnnual",
      partnerType: "Venue",
      tier: "Growth",
      label: "Venue Growth Annual",
      annualPrice: 79,
      summary: "Campaign support and reporting for active operators.",
      checkoutKey: "venueGrowthAnnual",
      includes: ["Everything in Basic", "Campaign Support", "Reporting"],
      bestFor: "Active operators",
      billing: "Annual subscription",
    },
    {
      id: "venueProAnnual",
      partnerType: "Venue",
      tier: "Pro",
      label: "Venue Pro Annual",
      annualPrice: 199,
      summary: "Priority visibility and expanded reporting for always-on participation.",
      checkoutKey: "venueProAnnual",
      includes: ["Everything in Growth", "Priority Visibility", "Expanded Reporting"],
      bestFor: "Always-on participation",
      billing: "Annual subscription",
    },
    {
      id: "propertyPartnerAnnual",
      partnerType: "Property",
      tier: "Portfolio",
      label: "Property Portfolio",
      annualPrice: null,
      summary: "Multi-property workspace, centralized reporting, shared campaigns, team permissions, enterprise support, and custom integrations.",
      checkoutKey: "propertyPartnerAnnual",
      includes: ["Everything in Core", "Multi-property workspace", "Centralized reporting", "Portfolio dashboards", "Shared campaigns", "Team permissions", "Enterprise support", "Custom integrations"],
      bestFor: "Ownership groups and operators managing multiple properties",
      billing: "Annual subscription",
    },
    {
      id: "propertyBasicBuildingAnnual",
      partnerType: "Property",
      tier: "Starter",
      label: "Property Starter Annual",
      annualPrice: 99,
      summary: "Property profile, building detail page, amenities integration, resident map access, local perks, nearby events, QR onboarding, and basic reporting.",
      checkoutKey: "propertyBasicBuildingAnnual",
      includes: ["Property profile", "Building detail page", "Amenities integration", "Resident map access", "Local perks", "Nearby events", "QR onboarding", "Basic reporting"],
      bestFor: "Single buildings getting started",
      billing: "Annual subscription",
    },
    {
      id: "propertyResidentPlusAnnual",
      partnerType: "Property",
      tier: "Core",
      label: "Property Core Annual",
      annualPrice: 149,
      summary: "Everything in Starter plus enhanced reporting, resident campaigns, property-specific perks, survey access, QR performance tracking, resident communications, and building analytics.",
      checkoutKey: "propertyResidentPlusAnnual",
      includes: ["Everything in Starter", "Enhanced reporting", "Resident campaigns", "Property-specific perks", "Survey access", "QR performance tracking", "Resident communications", "Building analytics"],
      bestFor: "Properties actively using Downtown Perks as a resident engagement channel",
      billing: "Annual subscription",
    },
    {
      id: "hotelStarterAnnual",
      partnerType: "Hotel",
      tier: "Starter",
      label: "Hotel Starter Annual",
      annualPrice: 99,
      summary: "Give guests a better way to discover what is nearby during their stay.",
      checkoutKey: "hotelStarterAnnual",
      includes: ["Hotel Profile", "Guest Guide", "Nearby Recommendations"],
      bestFor: "Independent hotels and boutique properties",
      billing: "Annual subscription",
    },
    {
      id: "hotelProAnnual",
      partnerType: "Hotel",
      tier: "Guest Experience",
      label: "Hotel Guest Experience Annual",
      annualPrice: 149,
      summary: "Promote local experiences, guest engagement, and track activity across the stay.",
      checkoutKey: "hotelProAnnual",
      includes: ["Everything in Starter", "Guest Campaigns", "Enhanced Reporting"],
      bestFor: "Hotels actively promoting local experiences and guest engagement",
      billing: "Annual subscription",
    },
    {
      id: "brandAccessAnnual",
      partnerType: "Brand",
      tier: "Access",
      label: "Brand Access Annual",
      annualPrice: 99,
      summary: "A place-based brand surface across downtown decision moments.",
      checkoutKey: "brandAccessAnnual",
      includes: ["Brand Guide", "Perk Surface", "Activation Map"],
      bestFor: "Place-based visibility",
      billing: "Annual subscription",
    },
    {
      id: "brandCampaignsAnnual",
      partnerType: "Brand",
      tier: "Campaigns",
      label: "Brand Campaigns Annual",
      annualPrice: 199,
      summary: "Campaign support for brands showing up inside local moments.",
      checkoutKey: "brandCampaignsAnnual",
      includes: ["Everything in Access", "Campaign Support", "Reporting"],
      bestFor: "Always-on sponsorship",
      billing: "Annual subscription",
    },
    {
      id: "civicBasicAnnual",
      partnerType: "Civic",
      tier: "Basic",
      label: "Civic Basic Annual",
      annualPrice: 49,
      summary: "Basic civic visibility and public information.",
      checkoutKey: "civicBasicAnnual",
      includes: ["Civic Profile", "Public Info", "Event Visibility"],
      bestFor: "Light public presence",
      billing: "Annual subscription",
    },
    {
      id: "civicPlusAnnual",
      partnerType: "Civic",
      tier: "Plus",
      label: "Civic Plus Annual",
      annualPrice: 30,
      summary: "Participation support for districts and civic programs.",
      checkoutKey: "civicPlusAnnual",
      includes: ["Everything in Basic", "Program Visibility", "Survey Access"],
      bestFor: "Community participation",
      billing: "Annual subscription",
    },
    {
      id: "civicProAnnual",
      partnerType: "Civic",
      tier: "Pro",
      label: "Civic Pro Annual",
      annualPrice: 99,
      summary: "Recurring civic reporting and program support.",
      checkoutKey: "civicProAnnual",
      includes: ["Everything in Plus", "Program Reporting", "Broadcast Tools"],
      bestFor: "District programs",
      billing: "Annual subscription",
    },
    {
      id: "realEstateAnnual",
      partnerType: "Real Estate",
      tier: "Annual",
      label: "Real Estate Annual",
      annualPrice: 199,
      summary: "Listing visibility connected to walkable neighborhood context.",
      checkoutKey: "propertyPartnerAnnual",
      includes: ["Listing Tour", "Neighborhood Context", "Lead Routing"],
      bestFor: "Lifestyle-led listings",
      billing: "Annual subscription",
    },
  ] as PricingPlan[],
  moduleGroups: [
    {
      id: "annualAddOns",
      heading: "Annual Add-On Subscriptions",
      sentence: "Ongoing capabilities available to every annual partner type.",
      modules: [
        { id: "unlimitedPerkCampaignsAnnual", label: "Unlimited Perk Campaigns Annual", price: 79, summary: "Ongoing annual capability for recurring perk campaigns.", billing: "Annual add-on" },
        { id: "surveySeriesAnnual", label: "Survey Series Annual", price: 79, summary: "Annual survey series and trend reporting.", billing: "Annual add-on" },
        { id: "analyticsPlusAnnual", label: "Analytics Plus Annual", price: 30, summary: "Starter analytics and activity reporting.", billing: "Annual add-on" },
        { id: "analyticsProAnnual", label: "Analytics Pro Annual", price: 79, summary: "Expanded analytics, comparisons, and attribution.", billing: "Annual add-on" },
        { id: "districtSponsorAnnual", label: "District Sponsor Annual", price: 199, summary: "Category or district ownership surface.", billing: "Annual add-on" },
      ],
    },
    {
      id: "campaigns",
      heading: "One-Time Campaigns",
      sentence: "Offer and campaign modules available to every partner type.",
      modules: [
        { id: "perkCampaign", label: "Perk Campaign", price: 30, summary: "A tracked resident perk campaign.", billing: "One-time module" },
        { id: "featuredCampaign", label: "Featured Campaign", price: 49, summary: "Featured placement for one offer or moment.", billing: "One-time module" },
        { id: "sponsoredCampaign", label: "Sponsored Campaign", price: 99, summary: "District-wide sponsored exposure.", billing: "One-time module" },
      ],
    },
    {
      id: "events",
      heading: "One-Time Events",
      sentence: "Promote live moments where residents and visitors are deciding what to do next.",
      modules: [
        { id: "eventBoost", label: "Event Boost", price: 20, summary: "Featured event visibility.", billing: "One-time module" },
        { id: "featuredEvent", label: "Featured Event", price: 49, summary: "Enhanced event discovery.", billing: "One-time module" },
        { id: "sponsoredEvent", label: "Sponsored Event", price: 99, summary: "District-wide event promotion.", billing: "One-time module" },
      ],
    },
    {
      id: "placements",
      heading: "Placements",
      sentence: "Category and district visibility for specific windows.",
      modules: [
        { id: "categoryFeatured7d", label: "Category Featured 7 Days", price: 20, summary: "A one-week category feature.", billing: "One-time module" },
        { id: "categoryFeatured30d", label: "Category Featured 30 Days", price: 60, summary: "A one-month category feature.", billing: "One-time module" },
        { id: "categoryFeatured90d", label: "Category Featured 90 Days", price: 150, summary: "A seasonal category feature.", billing: "One-time module" },
        { id: "districtFeatured30d", label: "District Featured 30 Days", price: 99, summary: "A one-month district feature.", billing: "One-time module" },
        { id: "districtFeatured90d", label: "District Featured 90 Days", price: 249, summary: "A seasonal district feature.", billing: "One-time module" },
      ],
    },
    {
      id: "broadcasts",
      heading: "Broadcasts",
      sentence: "Nearby and SMS reach for timely local moments.",
      modules: [
        { id: "nearbyBroadcast5Min", label: "Nearby Broadcast 5 Min", price: 20, summary: "Reach nearby residents in a five-minute walk zone.", billing: "One-time module" },
        { id: "nearbyBroadcast10Min", label: "Nearby Broadcast 10 Min", price: 30, summary: "Reach nearby residents in a ten-minute walk zone.", billing: "One-time module" },
        { id: "nearbyBroadcastDistrict", label: "Nearby Broadcast District", price: 40, summary: "Broadcast across one district.", billing: "One-time module" },
        { id: "nearbyBroadcastDowntown", label: "Nearby Broadcast Downtown", price: 75, summary: "Broadcast across downtown.", billing: "One-time module" },
        { id: "smsBroadcast500", label: "SMS Broadcast 500", price: 30, summary: "A small SMS send for time-sensitive updates.", billing: "One-time module" },
        { id: "smsBroadcast2500", label: "SMS Broadcast 2,500", price: 79, summary: "A mid-size SMS send for partner campaigns.", billing: "One-time module" },
        { id: "smsBroadcast5000", label: "SMS Broadcast 5,000", price: 149, summary: "A larger SMS send for major moments.", billing: "One-time module" },
      ],
    },
    {
      id: "research",
      heading: "Surveys + Research",
      sentence: "Ask better local questions and turn resident feedback into action.",
      modules: [
        { id: "singleSurvey", label: "Single Survey", price: 30, summary: "One survey with response capture.", billing: "One-time module" },
        { id: "customResearchProject", label: "Custom Research Project", price: 199, summary: "Custom audience questions and summary.", billing: "One-time module" },
      ],
    },
    {
      id: "reporting",
      heading: "Analytics + Reporting",
      sentence: "Reporting modules for partner performance, saves, scans, use, and demand.",
      modules: [
        { id: "customPartnerReport", label: "Custom Partner Report", price: 79, summary: "A one-time custom report for a partner campaign or setup.", billing: "One-time module" },
      ],
    },
    {
      id: "activation",
      heading: "Activation Services",
      sentence: "Hands-on launch and field support for partner moments.",
      modules: [
        { id: "inVenueActivation", label: "In-Venue Activation", price: 99, summary: "On-site activation support inside a venue.", billing: "One-time module" },
        { id: "propertyActivation", label: "Property Activation", price: 99, summary: "On-site activation support inside a property.", billing: "One-time module" },
        { id: "multiLocationActivation", label: "Multi-Location Activation", price: 199, summary: "Activation support across multiple locations.", billing: "One-time module" },
        { id: "streetTeamHalfDay", label: "Street Team Half Day", price: 199, summary: "Half-day downtown field support.", billing: "One-time module" },
        { id: "streetTeamFullDay", label: "Street Team Full Day", price: 399, summary: "Full-day downtown field support.", billing: "One-time module" },
      ],
    },
    {
      id: "support",
      heading: "Support Services",
      sentence: "Setup, reporting, and launch modules for cleaner execution.",
      modules: [
        { id: "surveyPulse", label: "Survey Pulse", price: 49, summary: "A quick pulse survey for one partner question.", billing: "One-time module" },
        { id: "campaignLaunchKit", label: "Campaign Launch Kit", price: 99, summary: "Launch copy, setup, and campaign coordination.", billing: "One-time module" },
        { id: "buildingPlacementPack", label: "Building Placement Pack", price: 99, summary: "Placement support for one building or property.", billing: "One-time module" },
      ],
    },
    {
      id: "sponsorships",
      heading: "Sponsorships",
      sentence: "Sponsorship surfaces for district-wide discovery and seasonal programs.",
      modules: [
        { id: "seasonalSponsor", label: "Seasonal Sponsor", price: 499, summary: "Seasonal sponsor visibility for a major downtown moment.", billing: "One-time module" },
      ],
    },
    {
      id: "residentAccess",
      heading: "Resident Access",
      sentence: "Resident access remains separate from partner subscriptions.",
      modules: [
        { id: "residentJoinBuildingNotMember", label: "Resident Join - Building Not Member", price: 25, summary: "Resident join path when a building is not yet a member.", billing: "One-time module" },
      ],
    },
  ] as PricingModuleGroup[],
} as const;

export const PARTNER_TYPES = PRICING_REGISTRY.partnerTypes;
export const ANNUAL_PLANS = PRICING_REGISTRY.plans;
export const PRICING_MODULE_GROUPS = PRICING_REGISTRY.moduleGroups;
export const PRICING_MODULES = PRICING_REGISTRY.moduleGroups.flatMap((group) => group.modules);

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getPlansForPartnerType(partnerType: PartnerType) {
  const planOrder = ["propertyBasicBuildingAnnual", "propertyResidentPlusAnnual", "propertyPartnerAnnual"];
  const plans = ANNUAL_PLANS.filter((plan) => plan.partnerType === partnerType);

  if (partnerType !== "Property") return plans;

  return [...plans].sort((a, b) => {
    const aIndex = planOrder.indexOf(a.id);
    const bIndex = planOrder.indexOf(b.id);
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });
}

export function calculatePricingTotal(plan?: PricingPlan, modules: PricingModule[] = []) {
  return (plan?.annualPrice || 0) + modules.reduce((sum, item) => sum + item.price, 0);
}

export function getPriceText(item: PricingPlan | PricingModule) {
  const price = "annualPrice" in item ? item.annualPrice : item.price;
  if (price == null) return "Custom";
  const suffix = "annualPrice" in item || item.billing === "Annual add-on" ? "/year" : "";
  return `${formatCurrency(price)}${suffix}`;
}

export function getBillingKind(item: PricingPlan | PricingModule) {
  if ("annualPrice" in item) {
    return item.billing === "Lead path" ? "lead_path" : "annual_subscription";
  }

  return item.billing === "Annual add-on" ? "annual_add_on" : "one_time_module";
}

export function getContactProductOptions(partnerType?: PartnerType) {
  const plans = partnerType ? getPlansForPartnerType(partnerType) : ANNUAL_PLANS;
  const modules = PRICING_REGISTRY.moduleGroups
    .filter((group) => partnerType === "Resident" ? group.id === "residentAccess" : group.id !== "residentAccess")
    .flatMap((group) => group.modules);
  return [...plans, ...modules];
}
