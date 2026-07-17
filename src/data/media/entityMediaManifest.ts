export type EntityMediaRole =
  | "building_exterior" | "building_shared_amenity" | "hotel_exterior" | "hotel_group_experience"
  | "restaurant_interior" | "nightlife" | "offer" | "route_cover";

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
  paseo: residential("paseo", "Paseo", "webp", [{ src: "/images/residential-content/paseo-amenity.jpg", role: "building_shared_amenity", alt: "Shared resident amenity space at Paseo.", cropSafe: true, verificationStatus: "verified" }]),
  "700-river": residential("700-river", "700 River", "jpg", [{ src: "/images/residential-content/700-river-shared-access.jpeg", role: "building_shared_amenity", alt: "Shared-access space associated with 700 River.", verificationStatus: "manual_review_required" }]),
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
  "hotel-van-zandt": { hero: { src: "/images/residential-content/the-shore-hospitality.webp", role: "hotel_exterior", alt: "Hotel Van Zandt in the Rainey District.", cropSafe: true, verificationStatus: "verified" } },
  "brand-hotel-van-zandt": { hero: { src: "/images/residential-content/the-shore-hospitality.webp", role: "hotel_exterior", alt: "Hotel Van Zandt in the Rainey District.", cropSafe: true, verificationStatus: "verified" } },
  "brand-fairmont-austin": { hero: { src: "/images/map-entities/fairmont-austin/fairmont-austin-skyline.jpg", role: "hotel_exterior", alt: "Fairmont Austin hotel and downtown skyline.", cropSafe: true, verificationStatus: "verified" } },
  "partner-geraldines": { hero: { src: "/images/map-entities/attached/venues/geraldines-stage.jpeg", role: "restaurant_interior", alt: "Geraldine's dining room and live music stage inside Hotel Van Zandt.", cropSafe: true, verificationStatus: "verified" } },
  geraldines: { hero: { src: "/images/map-entities/attached/venues/geraldines-stage.jpeg", role: "restaurant_interior", alt: "Geraldine's dining room and live music stage inside Hotel Van Zandt.", cropSafe: true, verificationStatus: "verified" } },
  "partner-stay-put": { hero: { src: "/images/imported/perks/stayput.png", role: "nightlife", alt: "The Stay Put bar on Rainey Street.", cropSafe: true, verificationStatus: "verified" } },
  "partner-bangers": { hero: { src: "/images/restaurants/bangers-bar.webp", role: "restaurant_interior", alt: "Banger's Sausage House and Beer Garden on Rainey Street.", cropSafe: true, verificationStatus: "verified" } },
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
