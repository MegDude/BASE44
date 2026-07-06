type WaterlooCampaignPin = {
  id: string;
  name: string;
  kind: "event" | "partner-placement";
  category: string;
  parentDestinationId: "waterloo-park";
  district: "Waterloo";
  description: string;
  partnerUseCase: string;
  residentValue: string;
  campaignCardCopy: string;
  imageRequirement: string;
  downtownPerksUse: {
    mapPin: true;
    drawer: true;
    campaignCard: true;
    partnerPlacement: true;
    eventPlacement: true;
  };
};

const useAll = {
  mapPin: true,
  drawer: true,
  campaignCard: true,
  partnerPlacement: true,
  eventPlacement: true,
} as const;

const WATERLOO_CAMPAIGN_IMAGES = {
  moody: "/images/map-entities/perks/moody_theater_live_music_1779052684229.png",
  festival: "/images/imported/perks/waterlook-greenway.png",
  wellness: "/images/imported/perks/running-on-trail.png",
  foodTrucks: "/images/imported/perks/austin-farmers-markets-lone-star.jpg",
  market: "/images/imported/perks/austin-craft-markets-local-artisans.webp",
  publicArt: "/images/partners/civic/daa-art-walk/daa-art-walk-2.jpg",
  family: "/images/imported/perks/community-0087-edibleaustin-picnic-2015-768x512.jpg",
  movies: "/images/imported/perks/03-waterloo-park.jpg",
  brand: "/images/imported/perks/night-market.png",
} as const;

function cardCopy(name: string) {
  return `${name}\n\nShow up around Waterloo Park when people are already nearby.\n\nUse this placement for event discovery, resident perks, RSVP prompts, partner offers, and neighborhood visibility.`;
}

const records: Array<[string, string, "event" | "partner-placement", string, string]> = [
  ["concert-series", "Concert Series", "event", "Event", WATERLOO_CAMPAIGN_IMAGES.moody],
  ["summer-programming", "Summer Programming", "event", "Event", WATERLOO_CAMPAIGN_IMAGES.festival],
  ["wellness-classes", "Wellness Classes", "partner-placement", "Fitness", WATERLOO_CAMPAIGN_IMAGES.wellness],
  ["food-truck-activations", "Food Truck Activations", "partner-placement", "Dining", WATERLOO_CAMPAIGN_IMAGES.foodTrucks],
  ["community-markets", "Community Markets", "partner-placement", "Shopping", WATERLOO_CAMPAIGN_IMAGES.market],
  ["public-art-tours", "Public Art Tours", "event", "Arts", WATERLOO_CAMPAIGN_IMAGES.publicArt],
  ["seasonal-festivals", "Seasonal Festivals", "event", "Event", WATERLOO_CAMPAIGN_IMAGES.festival],
  ["family-events", "Family Events", "event", "Family", WATERLOO_CAMPAIGN_IMAGES.family],
  ["outdoor-movies", "Outdoor Movies", "event", "Entertainment", WATERLOO_CAMPAIGN_IMAGES.movies],
  ["brand-activations", "Brand Activations", "partner-placement", "Brand", WATERLOO_CAMPAIGN_IMAGES.brand],
];

export const waterlooParkCampaignPins: WaterlooCampaignPin[] = records.map(([id, name, kind, category, imageRequirement]) => ({
  id: `waterloo-${id}`,
  name,
  kind,
  category,
  parentDestinationId: "waterloo-park",
  district: "Waterloo",
  description: `${name} gives residents another reason to check what is happening around Waterloo Park.`,
  partnerUseCase: "Use this placement to show up around Waterloo Park when people are already nearby for events, walks, concerts, classes, and weekend plans.",
  residentValue: "A simple way to find something useful nearby without searching across different pages.",
  campaignCardCopy: cardCopy(name),
  imageRequirement,
  downtownPerksUse: useAll,
}));
