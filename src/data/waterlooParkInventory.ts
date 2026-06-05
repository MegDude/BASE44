export type WaterlooParkPin = {
  id: string;
  name: string;
  kind: "destination" | "experience" | "event" | "partner-placement";
  category: string;
  subCategories: string[];
  district: "Waterloo" | "Red River" | "Downtown";
  address?: string;
  lat?: number | null;
  lng?: number | null;
  description: string;
  drawerCopy: string;
  tags: string[];
  imageRequirements: string[];
  imageAssets: {
    heroImage?: string;
    galleryImages?: string[];
    thumbnail?: string;
    imageStatus: "needed" | "sourced" | "approved" | "fallback";
  };
  downtownPerksUse: {
    mapPin: boolean;
    drawer: boolean;
    campaignCard: boolean;
    partnerPlacement: boolean;
    eventPlacement: boolean;
  };
  source: "Downtown Perks Content Deck";
  lastUpdated: "2026-06-04";
};

const useAll = {
  mapPin: true,
  drawer: true,
  campaignCard: true,
  partnerPlacement: true,
  eventPlacement: true,
};

const source = "Downtown Perks Content Deck" as const;
const lastUpdated = "2026-06-04" as const;

function experience(
  id: string,
  name: string,
  category: string,
  subCategories: string[],
  description: string,
  drawerCopy: string,
  tags: string[],
  imageRequirements: string[],
  galleryImages: string[],
  lat: number,
  lng: number,
): WaterlooParkPin {
  return {
    id,
    name,
    kind: "experience",
    category,
    subCategories,
    district: "Waterloo",
    address: "Waterloo Park, Austin, TX 78701",
    lat,
    lng,
    description,
    drawerCopy,
    tags,
    imageRequirements,
    imageAssets: {
      heroImage: galleryImages[0],
      galleryImages,
      thumbnail: galleryImages[0],
      imageStatus: "needed",
    },
    downtownPerksUse: useAll,
    source,
    lastUpdated,
  };
}

export const waterlooParkInventory: WaterlooParkPin[] = [
  {
    id: "waterloo-park",
    name: "Waterloo Park",
    kind: "destination",
    category: "Parks",
    subCategories: ["Outdoor", "Events", "Community", "Live Music"],
    district: "Waterloo",
    address: "500 E 12th St, Austin, TX 78701",
    lat: null,
    lng: null,
    description: "Waterloo Park connects downtown through gardens, trails, public spaces, live music, and community events.",
    drawerCopy: "More than a park.\n\nWaterloo Park connects downtown through gardens, trails, public spaces, live music, and community events.\n\nWalk the creek.\n\nFind a concert.\n\nMeet friends on the lawn.\n\nTake a break between meetings.\n\nSpend an afternoon outside.\n\nOne of downtown Austin's most active public spaces sits right here.",
    tags: ["Parks", "Live Music", "Walking", "Events", "Outdoors", "Community"],
    imageRequirements: ["Waterloo Park aerial", "Great Lawn", "Downtown skyline views", "Waller Creek", "Event crowd imagery", "Lifestyle walking imagery", "Sunset imagery"],
    imageAssets: {
      heroImage: "waterloo-hero-aerial.jpg",
      galleryImages: ["waterloo-sunset-lawn.jpg", "waterloo-lifestyle-walk.jpg", "waterloo-waller-creek.jpg"],
      thumbnail: "waterloo-hero-aerial.jpg",
      imageStatus: "needed",
    },
    downtownPerksUse: useAll,
    source,
    lastUpdated,
  },
  experience(
    "moody-amphitheater",
    "Moody Amphitheater",
    "Live Music",
    ["Events", "Entertainment"],
    "Concerts, festivals and live music in the middle of downtown.",
    "Live music in the middle of downtown.\n\nMoody Amphitheater hosts concerts, festivals, community events, and seasonal programming throughout the year.\n\nBring friends.\n\nFind a show.\n\nStay for the evening.",
    ["Live Music", "Events", "Concerts", "Night Out"],
    ["concert crowd", "stage at night", "event lighting", "lawn seating", "skyline backdrop"],
    ["moody-concert-night.jpg", "moody-crowd.jpg", "moody-stage.jpg"],
    30.27378,
    -97.73555,
  ),
  experience(
    "great-lawn",
    "Great Lawn",
    "Parks",
    ["Outdoor", "Gathering Space"],
    "Open lawn space for concerts, picnics, friends and slow afternoons.",
    "A little extra room downtown.\n\nThe Great Lawn is where people gather before concerts, meet friends after work, enjoy lunch outdoors, or simply slow down for a while.\n\nSometimes the best plan is no plan.",
    ["Parks", "Outdoor", "Picnic", "Friends"],
    ["open lawn", "people relaxing", "picnic lifestyle", "families", "downtown skyline"],
    ["great-lawn-picnic.jpg", "great-lawn-skyline.jpg"],
    30.27334,
    -97.73515,
  ),
  experience(
    "waller-creek-trail",
    "Waller Creek Trail",
    "Walking",
    ["Running", "Outdoors"],
    "A quieter walkable connection through downtown.",
    "A quieter way through downtown.\n\nThe Waller Creek trail creates a walkable connection between districts while offering a break from traffic and busy streets.\n\nGood for a walk.\n\nBetter for clearing your head.",
    ["Walking", "Running", "Outdoors", "Trail"],
    ["creek path", "walking trail", "cyclists", "tree canopy", "urban nature"],
    ["waller-creek-trail.jpg", "waller-creek-running.jpg"],
    30.27412,
    -97.73475,
  ),
  experience(
    "hill-country-garden",
    "Hill Country Garden",
    "Gardens",
    ["Nature", "Photography"],
    "Native Texas plants, seasonal color and quiet places to sit.",
    "Native Texas landscapes in the middle of downtown.\n\nThe Hill Country Garden showcases local plants, seasonal color, and quieter places to sit and explore.\n\nEasy to miss.\n\nWorth finding.",
    ["Gardens", "Nature", "Photography", "Quiet"],
    ["native plants", "wildflowers", "garden paths", "seasonal blooms", "landscape details"],
    ["hill-country-garden.jpg", "hill-country-path.jpg"],
    30.27378,
    -97.73496,
  ),
  experience(
    "family-pavilion",
    "Family Pavilion",
    "Family",
    ["Community", "Play"],
    "Open space, shade and programming for families.",
    "Designed for families and everyday use.\n\nThe Family Pavilion offers open space, shade, gathering areas, and programming throughout the year.\n\nA place to spend time together without needing a reason.",
    ["Family", "Community", "Play", "Shade"],
    ["families", "children playing", "interactive spaces", "pavilion architecture", "community activity"],
    ["family-pavilion.jpg", "family-pavilion-play.jpg"],
    30.27436,
    -97.73512,
  ),
  experience(
    "waterloo-event-zones",
    "Event Zones",
    "Events",
    ["Festivals", "Community"],
    "Festival, market, wellness, food and public art moments around Waterloo Park.",
    "Something is usually happening.\n\nFrom local festivals and cultural events to fitness classes and community programming, Waterloo Park regularly brings people together.\n\nCheck what's happening nearby.",
    ["Events", "Festivals", "Markets", "Wellness", "Food Trucks", "Public Art"],
    ["market events", "community festivals", "food vendors", "art activations", "seasonal programming"],
    ["waterloo-market.jpg", "waterloo-festival.jpg", "waterloo-wellness.jpg", "waterloo-food-trucks.jpg", "waterloo-public-art.jpg"],
    30.27356,
    -97.73568,
  ),
];
