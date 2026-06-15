export type PartnerRole = "venue" | "brand" | "property" | "hotel" | "civic" | "real-estate";

export const partnerRoleConfig: Record<PartnerRole, {
  label: string;
  hook: string;
  audience: string;
  pricing: string;
  campaignModule: string;
  cta: string;
  faqs: string[];
}> = {
  venue: {
    label: "Venues",
    hook: "Be visible when someone nearby decides where to go.",
    audience: "Residents, guests, workers, and visitors already making plans downtown.",
    pricing: "Events start at $20. Offers start at $30.",
    campaignModule: "Promote events, happy hours, and nearby offers.",
    cta: "Create venue campaign",
    faqs: ["Can I promote an event?", "Can I add a happy hour?", "How quickly can this go live?"],
  },
  brand: {
    label: "Brands",
    hook: "Show up when local context matters.",
    audience: "People near stores, events, hotels, trails, and downtown routines.",
    pricing: "Featured placements start at $49.",
    campaignModule: "Launch a local brand moment tied to a real downtown plan.",
    cta: "Explore brand campaigns",
    faqs: ["Can I promote a local launch?", "Can I connect to events?", "What can we measure?"],
  },
  property: {
    label: "Properties",
    hook: "Make the neighborhood part of the amenity.",
    audience: "Residents and prospects comparing daily life around the building.",
    pricing: "Property participation starts with a simple resident experience setup.",
    campaignModule: "Connect residents to nearby perks, events, and local routines.",
    cta: "Explore property campaigns",
    faqs: ["Can residents see nearby perks?", "Can we support move-in week?", "Can this connect to listings?"],
  },
  hotel: {
    label: "Hotels",
    hook: "Extend the stay beyond the lobby.",
    audience: "Guests looking for dinner, coffee, events, wellness, and things nearby.",
    pricing: "Guest discovery packages are scoped by hotel size and placement.",
    campaignModule: "Feature local recommendations, offers, and event moments.",
    cta: "Explore hotel campaigns",
    faqs: ["Can this support guests after check-in?", "Can we add local offers?", "Can staff use the map?"],
  },
  civic: {
    label: "Civic",
    hook: "Make what is happening easier to find.",
    audience: "Residents, workers, visitors, and downtown stakeholders.",
    pricing: "Civic participation is scoped by program and public-service needs.",
    campaignModule: "Promote public tours, events, surveys, and civic stops.",
    cta: "Explore civic campaigns",
    faqs: ["Can we add surveys?", "Can stops appear on the map?", "Can reports stay plain English?"],
  },
  "real-estate": {
    label: "Real Estate",
    hook: "Turn neighborhood attention into qualified interest.",
    audience: "People comparing buildings, listings, nearby perks, and daily downtown fit.",
    pricing: "Real estate visibility starts at $99 to $199 per year.",
    campaignModule: "Connect listings to building pages, nearby perks, and tour context.",
    cta: "Explore listing campaigns",
    faqs: ["Can listings connect to buildings?", "Can Legends inventory appear on the map?", "Can buyers see nearby context?"],
  },
};

