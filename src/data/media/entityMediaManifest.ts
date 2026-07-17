export type EntityMediaRole =
  | "building_exterior" | "building_shared_amenity" | "hotel_exterior" | "hotel_group_experience"
  | "restaurant_interior" | "nightlife" | "offer" | "route_cover" | "civic_space" | "public_art" | "retail" | "mobility";

export type EntityMediaItem = {
  src: string;
  role: EntityMediaRole;
  alt: string;
  objectPosition?: string;
  cropSafe?: boolean;
  verificationStatus: "verified" | "manual_review_required";
};

type EntityMediaEntry = { hero: EntityMediaItem; gallery?: EntityMediaItem[] };

const residential = (id: string, name: string, extension = "jpg", gallery: EntityMediaItem[] = []): EntityMediaEntry => ({
  hero: { src: `/images/residential-content/${id}.${extension}`, role: "building_exterior", alt: `${name} residential building in downtown Austin.`, cropSafe: true, verificationStatus: "verified" },
  gallery,
});

export const entityMediaManifest: Record<string, EntityMediaEntry> = {
  "44-east-ave": residential("44-east-ave", "44 East Ave"),
  "natiivo-austin": residential("natiivo-austin", "Natiivo Austin"),
  "the-shore": residential("the-shore", "The Shore", "jpg", [{ src: "/images/residential-content/the-shore-hospitality.webp", role: "hotel_group_experience", alt: "Hotel Van Zandt hospitality experience near The Shore.", cropSafe: true, verificationStatus: "verified" }]),
  milago: residential("milago", "Milago"),
  "70-rainey": residential("70-rainey", "70 Rainey"),
  vesper: residential("vesper", "Vesper"),
  "the-quincy": residential("the-quincy", "The Quincy", "webp"),
  "waterline-residences": residential("waterline-residences", "Waterline Residences"),
  paseo: residential("paseo", "Paseo", "webp", [
    { src: "/images/residential-content/paseo-amenity.jpg", role: "building_shared_amenity", alt: "Shared resident amenity space at Paseo.", cropSafe: true, verificationStatus: "verified" },
    { src: "/images/residential-content/shared-access-amenity.jpeg", role: "building_shared_amenity", alt: "Shared resident amenity access for the Downtown Perks building network.", cropSafe: true, verificationStatus: "manual_review_required" },
    { src: "/images/residential-content/shared-access-downtown-lake.jpeg", role: "building_shared_amenity", alt: "Downtown lake access near participating resident amenities.", cropSafe: true, verificationStatus: "manual_review_required" },
  ]),
  "700-river": residential("700-river", "700 River", "jpg", [
    { src: "/images/residential-content/shared-access-700-red-river.jpeg", role: "building_shared_amenity", alt: "Shared-access amenity imagery associated with 700 River.", cropSafe: true, verificationStatus: "manual_review_required" },
    { src: "/images/residential-content/700-river-shared-access.jpeg", role: "building_shared_amenity", alt: "Shared-access space associated with 700 River.", verificationStatus: "manual_review_required" },
    { src: "/images/residential-content/shared-access-downtown-lake.jpeg", role: "building_shared_amenity", alt: "Downtown lake access near 700 River.", cropSafe: true, verificationStatus: "manual_review_required" },
  ]),
  "the-independent": residential("the-independent", "The Independent"),
  "fifth-and-west": residential("fifth-and-west", "Fifth and West", "jpeg"),
  "the-austonian": residential("the-austonian", "The Austonian"),
  "360-condominiums": residential("360-condominiums", "360 Condominiums"),
  "spring-condominiums": residential("spring-condominiums", "Spring Condominiums"),
  "austin-proper-residences": residential("austin-proper-residences", "Austin Proper Residences", "jpeg"),
  "four-seasons-residences": residential("four-seasons-residences", "Four Seasons Residences Austin"),
  "the-catherine": residential("the-catherine", "The Catherine"),
  northshore: residential("northshore", "Northshore"),
  "the-monarch": residential("the-monarch", "The Monarch by Windsor", "avif"),
  "hotel-van-zandt": { hero: { src: "/images/map-entities/hotels-nearby/hotel-van-zandt-lounge.webp", role: "hotel_exterior", alt: "Hotel Van Zandt lounge and bar hospitality interior.", cropSafe: true, verificationStatus: "verified" } },
  "brand-hotel-van-zandt": { hero: { src: "/images/map-entities/hotels-nearby/hotel-van-zandt-lounge.webp", role: "hotel_exterior", alt: "Hotel Van Zandt lounge and bar hospitality interior.", cropSafe: true, verificationStatus: "verified" } },
  "hvz-texas-sized-savings-40": { hero: { src: "/images/map-entities/hotels-nearby/hvz-texas-sized-savings.jpg", role: "offer", alt: "Hotel Van Zandt rooftop pool summer stay offer.", cropSafe: true, verificationStatus: "verified" } },
  "hvz-stay-in-the-groove": { hero: { src: "/images/map-entities/hotels-nearby/hvz-stay-in-the-groove.webp", role: "offer", alt: "Hotel Van Zandt music-inspired stay offer.", cropSafe: true, verificationStatus: "verified" } },
  "hvz-texas-resident-rate": { hero: { src: "/images/map-entities/hotels-nearby/hvz-texas-resident-rate.jpg", role: "offer", alt: "Hotel Van Zandt cocktail lounge resident rate offer.", cropSafe: true, verificationStatus: "verified" } },
  "hvz-how-suite-it-is": { hero: { src: "/images/map-entities/hotels-nearby/hvz-how-suite-it-is.jpg", role: "offer", alt: "Hotel Van Zandt rooftop cabana suite offer.", cropSafe: true, verificationStatus: "verified" } },
  "brand-fairmont-austin": {
    hero: { src: "/images/map/panels/panel-detail/fairmont-room-skyline.webp", role: "hotel_exterior", alt: "Fairmont Austin room view across downtown Austin.", cropSafe: true, verificationStatus: "verified" },
    gallery: [{ src: "/images/map/panels/panel-detail/fairmont-pool.webp", role: "hotel_group_experience", alt: "Fairmont Austin pool and downtown hospitality experience.", cropSafe: true, verificationStatus: "verified" }],
  },
  "partner-geraldines": { hero: { src: "/images/map-entities/attached/venues/geraldines-stage.jpeg", role: "restaurant_interior", alt: "Geraldine's dining room and live music stage inside Hotel Van Zandt.", cropSafe: true, verificationStatus: "verified" } },
  geraldines: { hero: { src: "/images/map-entities/attached/venues/geraldines-stage.jpeg", role: "restaurant_interior", alt: "Geraldine's dining room and live music stage inside Hotel Van Zandt.", cropSafe: true, verificationStatus: "verified" } },
  "partner-stay-put": { hero: { src: "/images/map-entities/refresh/venues/stay-put-sign.jpg", role: "nightlife", alt: "The Stay Put neon sign on Rainey Street.", cropSafe: true, verificationStatus: "verified" } },
  "partner-bangers": { hero: { src: "/images/map-entities/refresh/venues/bangers-patio.webp", role: "restaurant_interior", alt: "Banger's Sausage House and Beer Garden patio on Rainey Street.", cropSafe: true, verificationStatus: "verified" } },
  "partner-yeti": { hero: { src: "/images/map-entities/refresh/brands/yeti-store.png", role: "retail", alt: "YETI's Austin flagship store and outdoor patio.", cropSafe: true, verificationStatus: "verified" } },
  "perk-yeti-downtown-hydration": { hero: { src: "/images/map-entities/refresh/brands/yeti-store.png", role: "offer", alt: "YETI's Austin flagship store for the downtown hydration perk.", cropSafe: true, verificationStatus: "verified" } },
  "perk-yeti-trail-day": { hero: { src: "/images/map-entities/refresh/brands/yeti-store.png", role: "offer", alt: "YETI's Austin flagship store for trail-day pickup.", cropSafe: true, verificationStatus: "verified" } },
  "partner-equinox": { hero: { src: "/images/map-entities/refresh/brands/equinox-austin.jpeg", role: "retail", alt: "Equinox Austin at night in downtown Austin.", cropSafe: true, verificationStatus: "verified" } },
  "partner-fine-eyewear": { hero: { src: "/images/map-entities/refresh/brands/fine-eyewear-store.webp", role: "retail", alt: "Fine Eyewear's Austin optical store interior.", cropSafe: true, verificationStatus: "verified" } },
  "campaign-see-austin-differently-fine-eyewear": { hero: { src: "/images/map-entities/refresh/brands/fine-eyewear-sport.jpg", role: "offer", alt: "Eyewear styled for the See Austin Differently discovery walk.", cropSafe: true, verificationStatus: "verified" } },
  "partner-rivian": { hero: { src: "/images/map-entities/refresh/brands/rivian-drive.jpeg", role: "mobility", alt: "A Rivian electric truck in motion.", cropSafe: true, verificationStatus: "verified" } },
  "perk-rivian-waterfront-drive": { hero: { src: "/images/map-entities/refresh/brands/rivian-drive.jpeg", role: "offer", alt: "A Rivian electric truck for the waterfront-drive experience.", cropSafe: true, verificationStatus: "verified" } },
  "campaign-rivian-downtown-experience-layer": { hero: { src: "/images/map-entities/refresh/brands/rivian-drive.jpeg", role: "mobility", alt: "A Rivian electric truck for the downtown experience campaign.", cropSafe: true, verificationStatus: "verified" } },
  "partner-heritage-boots": { hero: { src: "/images/map-entities/refresh/brands/heritage-boots.jpg", role: "retail", alt: "Heritage Boots western boot style.", cropSafe: true, verificationStatus: "verified" } },
  "priority-the-waterline": { hero: { src: "/images/map-entities/refresh/properties/waterline.jpg", role: "building_exterior", alt: "Waterline tower at 98 Red River in downtown Austin.", cropSafe: true, verificationStatus: "verified" } },
  "waterloo-park": { hero: { src: "/images/map-entities/refresh/civic/waterloo-park.jpeg", role: "civic_space", alt: "Waterloo Park and Moody Amphitheater in downtown Austin.", cropSafe: true, verificationStatus: "verified" } },
  "civic-waterloo-greenway": { hero: { src: "/images/map-entities/refresh/civic/waterloo-greenway-creek.png", role: "civic_space", alt: "Families exploring Waterloo Greenway beside Waller Creek.", cropSafe: true, verificationStatus: "verified" } },
  "civic-waterloo-discovery-route": { hero: { src: "/images/map-entities/refresh/civic/waterloo-greenway-creek.png", role: "route_cover", alt: "Waterloo Greenway discovery route beside Waller Creek.", cropSafe: true, verificationStatus: "verified" } },
  "waller-creek-trail": { hero: { src: "/images/map-entities/refresh/civic/waterloo-trail.jpeg", role: "civic_space", alt: "The restored Waller Creek trail through Waterloo Greenway.", cropSafe: true, verificationStatus: "verified" } },
  "great-lawn": { hero: { src: "/images/map-entities/refresh/civic/waterloo-park.jpeg", role: "civic_space", alt: "The Great Lawn and Moody Amphitheater at Waterloo Park.", cropSafe: true, verificationStatus: "verified" } },
  "hill-country-garden": { hero: { src: "/images/map-entities/refresh/civic/waterloo-golden-hour.png", role: "civic_space", alt: "Native gardens and walking paths in golden-hour light at Waterloo Park.", cropSafe: true, verificationStatus: "verified" } },
  "family-pavilion": { hero: { src: "/images/map-entities/refresh/civic/waterloo-greenway-creek.png", role: "civic_space", alt: "Families exploring the green space and creek at Waterloo Greenway.", cropSafe: true, verificationStatus: "verified" } },
  "waterloo-event-zones": { hero: { src: "/images/map-entities/refresh/civic/waterloo-park.jpeg", role: "civic_space", alt: "An active community event at Waterloo Park and Moody Amphitheater.", cropSafe: true, verificationStatus: "verified" } },
  "discovery-waterloo-reflection-point": { hero: { src: "/images/map-entities/refresh/civic/waterloo-greenway-creek.png", role: "civic_space", alt: "Waterloo Greenway's creek, gardens, and downtown setting.", cropSafe: true, verificationStatus: "verified" } },
  "discovery-waller-creek-design-marker": { hero: { src: "/images/map-entities/refresh/civic/waller-creek-design-marker.png", role: "civic_space", alt: "A pedestrian bridge and restored creek at the Waller Creek Design Marker.", cropSafe: true, verificationStatus: "verified" } },
  "discovery-golden-hour-waterloo": { hero: { src: "/images/map-entities/refresh/civic/waterloo-golden-hour.png", role: "civic_space", alt: "Golden-hour light across the gardens and paths at Waterloo Park.", cropSafe: true, verificationStatus: "verified" } },
  "civic-republic-square-programming": { hero: { src: "/images/map-entities/refresh/civic/republic-square-lawn.jpg", role: "civic_space", alt: "The lawn and gathering space at Republic Square in downtown Austin.", cropSafe: true, verificationStatus: "verified" } },
  "civic-public-art-daa-art-walk": { hero: { src: "/images/map-entities/refresh/civic/daa-art-walk-sculpture.jpeg", role: "public_art", alt: "A public sculpture featured on the Downtown Austin Art Walk.", cropSafe: true, verificationStatus: "verified" } },
  "building-network-paseo-daydreamer-lobby": {
    hero: { src: "/images/map-entities/attached/properties/paseo/daydreamer-lobby.jpeg", role: "building_shared_amenity", alt: "Daydreamer lobby and resident gathering space at Paseo.", cropSafe: true, verificationStatus: "verified" },
    gallery: [
      { src: "/images/residential-content/shared-access-amenity.jpeg", role: "building_shared_amenity", alt: "Shared resident amenity access for the Downtown Perks building network.", cropSafe: true, verificationStatus: "manual_review_required" },
      { src: "/images/residential-content/shared-access-waterloo.jpeg", role: "building_shared_amenity", alt: "Waterloo-area shared-access context for residents.", cropSafe: true, verificationStatus: "manual_review_required" },
    ],
  },
  "building-network-paseo-rooftop-pool": {
    hero: { src: "/images/map-entities/attached/properties/paseo/rooftop-pool.jpeg", role: "building_shared_amenity", alt: "Paseo rooftop pool shared-access amenity.", cropSafe: true, verificationStatus: "verified" },
    gallery: [
      { src: "/images/residential-content/shared-access-amenity.jpeg", role: "building_shared_amenity", alt: "Shared resident amenity access for eligible Downtown Perks residents.", cropSafe: true, verificationStatus: "manual_review_required" },
      { src: "/images/residential-content/shared-access-downtown-lake.jpeg", role: "building_shared_amenity", alt: "Downtown lake access near participating resident amenities.", cropSafe: true, verificationStatus: "manual_review_required" },
    ],
  },
  "building-network-paseo-fitness-recovery": {
    hero: { src: "/images/reports/paseo-gym.webp", role: "building_shared_amenity", alt: "Paseo fitness amenity for eligible resident access.", cropSafe: true, verificationStatus: "verified" },
    gallery: [
      { src: "/images/residential-content/shared-access-waterloo.jpeg", role: "building_shared_amenity", alt: "Waterloo-area wellness and shared-access context for residents.", cropSafe: true, verificationStatus: "manual_review_required" },
      { src: "/images/residential-content/shared-access-amenity.jpeg", role: "building_shared_amenity", alt: "Shared resident amenity access for the Downtown Perks building network.", cropSafe: true, verificationStatus: "manual_review_required" },
    ],
  },
  "building-network-700-river-shared-access": {
    hero: { src: "/images/residential-content/shared-access-700-red-river.jpeg", role: "building_shared_amenity", alt: "700 River shared-access amenity for eligible residents.", cropSafe: true, verificationStatus: "manual_review_required" },
    gallery: [
      { src: "/images/residential-content/shared-access-downtown-lake.jpeg", role: "building_shared_amenity", alt: "Downtown lake access near 700 River.", cropSafe: true, verificationStatus: "manual_review_required" },
      { src: "/images/residential-content/shared-access-community.jpeg", role: "building_shared_amenity", alt: "Community shared-access context for downtown residents.", cropSafe: true, verificationStatus: "manual_review_required" },
      { src: "/images/residential-content/shared-access-jazz.jpeg", role: "building_shared_amenity", alt: "Music and community access context for downtown residents.", cropSafe: true, verificationStatus: "manual_review_required" },
    ],
  },
  "hotel-guest-arrival-route": { hero: { src: "/images/map/panels/panel-detail/rainey-date-night-walk.jpg", role: "route_cover", alt: "A Rainey Street hotel guest walking route in downtown Austin.", cropSafe: true, verificationStatus: "verified" } },
  "walking-happy-hour-route": { hero: { src: "/images/map/panels/panel-detail/happy-hour-table.jpg", role: "route_cover", alt: "A downtown happy hour route with friends and drinks.", cropSafe: true, verificationStatus: "verified" } },
  "lady-bird-lake-trail-route": { hero: { src: "/images/map/panels/panel-detail/lady-bird-bike-skyline.jpg", role: "route_cover", alt: "Lady Bird Lake trail route with the Austin skyline.", cropSafe: true, verificationStatus: "verified" } },
};

const aliasCandidates = (entity: Record<string, unknown>) => [entity.id, entity.entityId, entity.slug, entity.name, (entity.raw as Record<string, unknown> | undefined)?.id]
  .map((value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"))
  .filter(Boolean);

export function getEntityMediaEntry(entity: Record<string, unknown>): EntityMediaEntry | null {
  for (const key of aliasCandidates(entity)) if (entityMediaManifest[key]) return entityMediaManifest[key];
  const id = String(entity.id || "").toLowerCase();
  if (id.startsWith("hvz-")) return entityMediaManifest["hotel-van-zandt"];
  if (id.startsWith("fairmont-")) return entityMediaManifest["brand-fairmont-austin"];
  return null;
}
