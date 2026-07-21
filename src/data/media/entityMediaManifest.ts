export type EntityMediaRole =
  | "building_exterior" | "building_shared_amenity" | "hotel_exterior" | "hotel_group_experience"
  | "restaurant_interior" | "nightlife" | "retail" | "mobility" | "civic_space" | "offer" | "route_cover";

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
    { src: "/images/map-entities/attached/properties/paseo/daydreamer-lobby.jpeg", role: "building_shared_amenity", alt: "Daydreamer coffee bar and resident lobby at Paseo.", cropSafe: true, verificationStatus: "verified" },
    { src: "/images/map-entities/attached/properties/paseo/rooftop-pool.jpeg", role: "building_shared_amenity", alt: "Paseo rooftop pool and resident terrace.", cropSafe: true, verificationStatus: "verified" },
    { src: "/images/map-entities/attached/properties/paseo/exterior-sunset.jpeg", role: "building_exterior", alt: "Paseo residential tower at sunset in the Rainey District.", cropSafe: true, verificationStatus: "verified" },
    { src: "/images/reports/paseo-deck.jpeg", role: "building_shared_amenity", alt: "Paseo resident deck and outdoor gathering space.", cropSafe: true, verificationStatus: "verified" },
    { src: "/images/reports/paseo-gym.webp", role: "building_shared_amenity", alt: "Paseo fitness studio for residents.", cropSafe: true, verificationStatus: "verified" },
  ]),
  "700-river": residential("700-river", "700 River", "jpg", [{ src: "/images/residential-content/700-river-shared-access.jpeg", role: "building_shared_amenity", alt: "Shared-access space associated with 700 River.", verificationStatus: "manual_review_required" }]),
  "the-independent": residential("the-independent", "The Independent"),
  "priority-frost-tower": {
    hero: {
      src: "/images/reports/frost-tower-austin.jpg",
      role: "building_exterior",
      alt: "Frost Tower on Congress Avenue in downtown Austin.",
      cropSafe: true,
      verificationStatus: "verified",
    },
    gallery: [{
      src: "/images/map-entities/attached/properties/frost-tower/frost-tower-upward-view.jpg",
      role: "building_exterior",
      alt: "Frost Tower rising above Congress Avenue in downtown Austin.",
      cropSafe: true,
      verificationStatus: "verified",
    }],
  },
  "fifth-and-west": residential("fifth-and-west", "Fifth and West", "jpeg"),
  "the-austonian": residential("the-austonian", "The Austonian"),
  "360-condominiums": residential("360-condominiums", "360 Condominiums"),
  "spring-condominiums": residential("spring-condominiums", "Spring Condominiums"),
  "austin-proper-residences": residential("austin-proper-residences", "Austin Proper Residences", "jpeg"),
  "four-seasons-residences": residential("four-seasons-residences", "Four Seasons Residences Austin"),
  "the-catherine": residential("the-catherine", "The Catherine"),
  northshore: residential("northshore", "Northshore"),
  "the-monarch": residential("the-monarch", "The Monarch by Windsor", "avif"),
  "hotel-van-zandt": { hero: { src: "/images/map-pins/property/hotel-van-zandt.webp", role: "hotel_exterior", alt: "Hotel Van Zandt in Austin's Rainey District.", cropSafe: true, verificationStatus: "verified" }, gallery: [{ src: "/images/map/entities/hotel-van-zandt-rooftop-pool.jpg", role: "hotel_group_experience", alt: "Hotel Van Zandt rooftop pool overlooking downtown Austin.", cropSafe: true, verificationStatus: "verified" }] },
  "brand-hotel-van-zandt": { hero: { src: "/images/map-pins/property/hotel-van-zandt.webp", role: "hotel_exterior", alt: "Hotel Van Zandt in Austin's Rainey District.", cropSafe: true, verificationStatus: "verified" }, gallery: [{ src: "/images/map/entities/hotel-van-zandt-rooftop-pool.jpg", role: "hotel_group_experience", alt: "Hotel Van Zandt rooftop pool overlooking downtown Austin.", cropSafe: true, verificationStatus: "verified" }] },
  "brand-fairmont-austin": { hero: { src: "/images/map-entities/fairmont-austin/fairmont-austin-skyline.jpg", role: "hotel_exterior", alt: "Fairmont Austin hotel and downtown skyline.", cropSafe: true, verificationStatus: "verified" } },
  "partner-geraldines": { hero: { src: "/images/map-entities/attached/venues/geraldines-stage.jpeg", role: "restaurant_interior", alt: "Geraldine's dining room and live music stage inside Hotel Van Zandt.", cropSafe: true, verificationStatus: "verified" } },
  geraldines: { hero: { src: "/images/map-entities/attached/venues/geraldines-stage.jpeg", role: "restaurant_interior", alt: "Geraldine's dining room and live music stage inside Hotel Van Zandt.", cropSafe: true, verificationStatus: "verified" } },
  "partner-stay-put": { hero: { src: "/images/map/entities/stay-put-rainey-patio.jpg", role: "nightlife", alt: "The Stay Put neon sign on Rainey Street.", cropSafe: true, verificationStatus: "verified" } },
  "stay-put": { hero: { src: "/images/map/entities/stay-put-rainey-patio.jpg", role: "nightlife", alt: "The Stay Put neon sign on Rainey Street.", cropSafe: true, verificationStatus: "verified" } },
  "the-stay-put": { hero: { src: "/images/map/entities/stay-put-rainey-patio.jpg", role: "nightlife", alt: "The Stay Put neon sign on Rainey Street.", cropSafe: true, verificationStatus: "verified" } },
  "partner-bangers": { hero: { src: "/images/map-entities/attached/venues/bangers.jpg", role: "restaurant_interior", alt: "Banger's Sausage House and Beer Garden on Rainey Street.", cropSafe: true, verificationStatus: "verified" } },
  bangers: { hero: { src: "/images/map-entities/attached/venues/bangers.jpg", role: "restaurant_interior", alt: "Banger's Sausage House and Beer Garden on Rainey Street.", cropSafe: true, verificationStatus: "verified" } },
  aris: { hero: { src: "/images/map-listing-actual/aris/aris_hero_clean_1600x900.png", role: "restaurant_interior", alt: "Aris dining room and bar on West Sixth Street.", cropSafe: true, verificationStatus: "verified" }, gallery: [{ src: "/images/map-listing-actual/aris/aris_listing_card_1600x900.png", role: "restaurant_interior", alt: "Aris restaurant dining experience in Austin.", cropSafe: true, verificationStatus: "verified" }] },
  "atx-cocina": { hero: { src: "/images/map-listing-actual/atx-cocina/atx-cocina_hero_clean_1600x900.png", role: "restaurant_interior", alt: "ATX Cocina dining room and bar in downtown Austin.", cropSafe: true, verificationStatus: "verified" }, gallery: [{ src: "/images/map-listing-actual/atx-cocina/atx-cocina_listing_card_1600x900.png", role: "restaurant_interior", alt: "ATX Cocina restaurant experience downtown.", cropSafe: true, verificationStatus: "verified" }] },
  "las-perlas": { hero: { src: "/images/map-listing-actual/las-perlas/las-perlas_hero_clean_1600x900.png", role: "nightlife", alt: "Las Perlas mezcal bar on East Seventh Street.", cropSafe: true, verificationStatus: "verified" }, gallery: [{ src: "/images/map-listing-actual/las-perlas/las-perlas_listing_card_1600x900.png", role: "nightlife", alt: "Las Perlas bar and patio in Austin.", cropSafe: true, verificationStatus: "verified" }] },
  "pelon-s": { hero: { src: "/images/map-listing-actual/pelons/pelons_hero_clean_1600x900.png", role: "restaurant_interior", alt: "Pelon's Tex-Mex restaurant and patio on Red River Street.", cropSafe: true, verificationStatus: "verified" }, gallery: [{ src: "/images/map-listing-actual/pelons/pelons_listing_card_1600x900.png", role: "restaurant_interior", alt: "Pelon's Tex-Mex dining experience in Austin.", cropSafe: true, verificationStatus: "verified" }] },
  "pelons-tex-mex": { hero: { src: "/images/map-listing-actual/pelons/pelons_hero_clean_1600x900.png", role: "restaurant_interior", alt: "Pelon's Tex-Mex restaurant and patio on Red River Street.", cropSafe: true, verificationStatus: "verified" } },
  yeti: { hero: { src: "/images/map-entities/brand-yeti/yeti-flagship-interior.jpg", role: "retail", alt: "YETI's Austin flagship store interior.", cropSafe: true, verificationStatus: "verified" } },
  "partner-yeti": { hero: { src: "/images/map-entities/brand-yeti/yeti-flagship-interior.jpg", role: "retail", alt: "YETI's Austin flagship store interior.", cropSafe: true, verificationStatus: "verified" } },
  equinox: { hero: { src: "/images/reports/equinox-austin.jpg", role: "retail", alt: "Equinox Austin in downtown Austin.", cropSafe: true, verificationStatus: "verified" } },
  "partner-equinox": { hero: { src: "/images/reports/equinox-austin.jpg", role: "retail", alt: "Equinox Austin in downtown Austin.", cropSafe: true, verificationStatus: "verified" } },
  "fine-eyewear": { hero: { src: "/images/map-entities/brand-fine-eyewear/Oversized-Eyewear-1920w.webp", role: "retail", alt: "Fine Eyewear optical collection in Austin.", cropSafe: true, verificationStatus: "verified" } },
  "partner-fine-eyewear": { hero: { src: "/images/map-entities/brand-fine-eyewear/Oversized-Eyewear-1920w.webp", role: "retail", alt: "Fine Eyewear optical collection in Austin.", cropSafe: true, verificationStatus: "verified" } },
  rivian: { hero: { src: "/images/imported/perks/rivian.png", role: "mobility", alt: "Rivian electric vehicles in Austin.", cropSafe: true, verificationStatus: "verified" } },
  "partner-rivian": { hero: { src: "/images/imported/perks/rivian.png", role: "mobility", alt: "Rivian electric vehicles in Austin.", cropSafe: true, verificationStatus: "verified" } },
  "heritage-boots": { hero: { src: "/images/map-entities/brand-heritage-boots/Boot-wars.jpg", role: "retail", alt: "Heritage Boots western boot craftsmanship in Austin.", cropSafe: true, verificationStatus: "verified" } },
  "partner-heritage-boots": { hero: { src: "/images/map-entities/brand-heritage-boots/Boot-wars.jpg", role: "retail", alt: "Heritage Boots western boot craftsmanship in Austin.", cropSafe: true, verificationStatus: "verified" } },
  waterline: { hero: { src: "/images/reports/waterline-austin.jpg", role: "building_exterior", alt: "Waterline tower at 98 Red River in downtown Austin.", cropSafe: true, verificationStatus: "verified" } },
  "priority-the-waterline": { hero: { src: "/images/reports/waterline-austin.jpg", role: "building_exterior", alt: "Waterline tower at 98 Red River in downtown Austin.", cropSafe: true, verificationStatus: "verified" } },
  "waterloo-park": { hero: { src: "/images/map-entities/attached/civic/waterloo-park.jpeg", role: "civic_space", alt: "Waterloo Park and Moody Amphitheater in downtown Austin.", cropSafe: true, verificationStatus: "verified" } },
  "hotel-guest-arrival-route": { hero: { src: "/images/map-entities/rainey-bars/rainey-street.jpeg", role: "route_cover", alt: "Rainey Street hotel guest walking route in downtown Austin.", cropSafe: true, verificationStatus: "verified" } },
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
