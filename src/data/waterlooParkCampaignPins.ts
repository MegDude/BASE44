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

function cardCopy(name: string) {
  return `${name}\n\nShow up around Waterloo Park when people are already nearby.\n\nUse this placement for event discovery, resident perks, RSVP prompts, partner offers, and neighborhood visibility.`;
}

const records: Array<[string, string, "event" | "partner-placement", string, string]> = [
  ["concert-series", "Concert Series", "event", "Event", "moody-concert-night.jpg"],
  ["summer-programming", "Summer Programming", "event", "Event", "waterloo-festival.jpg"],
  ["wellness-classes", "Wellness Classes", "partner-placement", "Fitness", "waterloo-wellness.jpg"],
  ["food-truck-activations", "Food Truck Activations", "partner-placement", "Dining", "waterloo-food-trucks.jpg"],
  ["community-markets", "Community Markets", "partner-placement", "Shopping", "waterloo-market.jpg"],
  ["public-art-tours", "Public Art Tours", "event", "Arts", "waterloo-public-art.jpg"],
  ["seasonal-festivals", "Seasonal Festivals", "event", "Event", "waterloo-festival.jpg"],
  ["family-events", "Family Events", "event", "Family", "family-pavilion-play.jpg"],
  ["outdoor-movies", "Outdoor Movies", "event", "Entertainment", "great-lawn-skyline.jpg"],
  ["brand-activations", "Brand Activations", "partner-placement", "Brand", "waterloo-market.jpg"],
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
