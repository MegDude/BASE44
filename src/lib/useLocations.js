import { useEffect, useState } from "react";
import data from "../data/locations.json";
import { luxuryPresenceBuildingPlaces } from "../data/luxuryPresenceInventory";
import { supplementalMapEntities } from "../data/supplementalMapEntities";
import { getRepublicAustinMapPlaces } from "../data/imports/republicAustinPins";
import { launchMapPinPlaces } from "../data/imports/launchMapPins";
import {
  ATTACHED_FEATURED_BRANDS,
  ATTACHED_HAPPY_HOUR_PERK_LOCATIONS,
  ATTACHED_LEGENDS_IMPORTED_PROPERTIES,
  ATTACHED_RAIL_MIGRATED_LOCATIONS,
  ATTACHED_SUPPLEMENTAL_DOWNTOWN_LOCATIONS,
} from "../data/imports/attachedMapInventory";
import { downtownParkingItems } from "../data/parkingBookings";
import { waterlooParkInventory } from "../data/waterlooParkInventory";
import { waterlooParkCampaignPins } from "../data/waterlooParkCampaignPins";
import { daaTourStops } from "../data/daaArtParksTour";
import { legendsListingPlaces } from "../data/legendsListings";
import { rentalListings } from "../data/rentalListings";
import { mapNativeCampaigns } from "../data/mapNativeCampaigns";
import { buildingAmenityNetworkEntities } from "../data/buildingAmenityNetwork";
import { larryAndGuyRestaurantLayer } from "../data/larryAndGuyRestaurantLayer";
import { applyLaunchMapCuration } from "../data/raineyLaunchCuration";
import { civicDiscoveryEntities } from "../data/civicDiscoveryNetwork";
import { getActiveMapEntityLocations } from "../data/map/mapEntityRegistry";
import { getDowntownCoreRestaurantUpdate } from "../data/downtownCoreRestaurantPerks";
import { getFourSeasonsExperienceUpdate } from "../data/fourSeasonsExperience";
import { getLegendsResidentialExperience } from "../data/legendsResidentialExperience";
import { getHappyHourPlaces } from "./happyHours";
import { enrichWithArchiveLocationContext } from "./archiveLocationContext";
import { isDowntownAustin78701Entity } from "./map/downtownAustinScope";
import { normalizeEntity } from "./map/normalizeEntity";
import { getHospitalityCsvUpdate } from "../data/hospitalityContentLibrary";
import { getResidentialMixedUseUpdate } from "../data/residentialMixedUseContentLibrary";
import { applyDunlapPortfolioGovernance, dunlapPortfolioEntities } from "../data/dunlapPortfolio";
import { applyHospitalityOperatorGovernance, hospitalityOperatorPortfolioEntities } from "../data/hospitalityOperatorPortfolios";

const FAIRMONT_HOTEL_IMAGE = "/images/map-entities/fairmont-austin/fairmont-austin-skyline.jpg";
const FAIRMONT_POOL_IMAGE = "/images/map-entities/fairmont-austin/fairmont-rooftop-pool.webp";
const FAIRMONT_CABANA_IMAGE = "/images/map-entities/fairmont-austin/fairmont-pool-cabanas.webp";
const FAIRMONT_BOOKING_URL = "https://na.spatime.com/fha78701/6840393/home";
const LEGENDS_BRAND_LINE = "Legends Real Estate";

function eventPlace({
  id,
  name,
  category,
  categoryKey,
  latitude,
  longitude,
  district,
  address,
  summary,
  rsvpCount,
  time,
  date,
  image,
  tags = [],
  partnerInsight = "",
  ...rest
}) {
  return {
    ...rest,
    id: `event-${id}`,
    name,
    type: "event",
    category: `Event / ${category}`,
    category_key: ["event", categoryKey || category, district, ...tags].join(" ").toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    markerType: "event",
    detailDrawerType: "event",
    isEvent: true,
    latitude,
    longitude,
    district,
    address,
    summary,
    description: summary,
    rsvp_count: rsvpCount,
    time,
    date,
    image,
    tags,
    partnerInsight,
    source: "Downtown Perks event layer",
  };
}

function parkingBookingPlace(item) {
  return {
    id: item.id,
    name: item.title,
    type: "parking",
    kind: "parking",
    partnerType: "properties",
    markerType: "parking",
    detailDrawerType: "parking",
    pinKey: "parking",
    category: "Parking / Resident Perk",
    category_key: [
      "parking",
      "resident perk",
      "reservable parking",
      item.buildingName,
      item.neighborhood,
      ...(item.spotTypes || []),
    ]
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_"),
    latitude: item.lat,
    longitude: item.lng,
    district: item.neighborhood,
    address: item.address,
    summary: "Reserve nearby parking before you head out.",
    description: "Park close. Walk less. Do more downtown.",
    neighborhood_narrative: "Parking helps people plan dinner, events, errands, and nights out without making the trip harder than it needs to be.",
    alignment_to_downtown_perks: "Show available parking on the map when people nearby are choosing where to go.",
    deals_offers: item.perkLabel || item.pricingLabel,
    specials: item.pricingLabel,
    image: item.imageUrl,
    isParkingBooking: true,
    hasPerk: true,
    perk: {
      title: item.perkLabel || "Resident parking rate",
      value: item.pricingLabel || "Resident rate available",
      description: "Reserve nearby parking before you head out.",
      isActive: true,
    },
    parkingBooking: item,
    source: "Downtown Perks parking booking layer",
  };
}

function attachedHappyHourPerkPlace(item) {
  const kind = String(item.kind || "").toLowerCase();
  const specials = Array.isArray(item.specials) ? item.specials.filter(Boolean) : [];
  const hasPerk = Boolean(item.hasPublicSpecial || specials.length);
  const isDining = kind === "restaurant" || /restaurant|food|dining/i.test(item.category || "");
  const isCoffee = /coffee|cafe/i.test(`${item.category || ""} ${item.name || ""}`);
  const isNightlife = kind === "bar" || /bar|nightlife|cocktail|beer|wine/i.test(`${item.category || ""} ${item.specialLabel || ""}`);

  return {
    id: item.id,
    venueId: String(item.id || "").replace(/^happy-hour-/, ""),
    name: item.name,
    venueName: item.name,
    type: "venue",
    kind: kind || "venue",
    sourceType: "happy_hour",
    markerType: "venue",
    detailDrawerType: "venue",
    pinKey: isNightlife ? "nightlife" : isCoffee ? "coffee" : "dining",
    category: item.category || (isDining ? "Restaurant / Food" : "Bar / Nightlife"),
    category_key: [
      "happy hour",
      hasPerk ? "resident perk" : "",
      item.kind,
      item.category,
      item.district,
      item.alignment,
      ...specials,
    ]
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_"),
    latitude: item.latitude,
    longitude: item.longitude,
    district: item.district,
    address: item.address,
    website: item.website,
    phone: item.phone,
    email: item.email,
    operatingHours: item.operatingHours,
    summary: item.summary || `${item.category || "Downtown"} listing in Downtown Austin.`,
    description: item.alignment || item.summary,
    alignment_to_downtown_perks: item.alignment,
    deals_offers: item.specialLabel || specials.join(" · "),
    specials: item.specialLabel || specials.join(" · "),
    events_available: item.eventsAvailable,
    hasPerk,
    hasHappyHour: true,
    hasPerkPotential: hasPerk,
    happyHour: {
      days: item.operatingHours || "Confirm hours",
      time: item.operatingHours || "",
      offer: item.specialLabel || specials.join(" · ") || "Save this nearby spot",
      details: item.alignment || item.summary,
      redemption: "",
    },
    perk: hasPerk
      ? {
          title: item.specialLabel || "Resident perk",
          value: item.specialLabel || specials[0],
          description: item.alignment || "Resident-facing offer or special.",
          isActive: true,
        }
      : undefined,
    tags: ["Happy Hour", "Perks", item.kind, item.category, item.district, item.alignment].filter(Boolean),
    raw: { attachedHappyHourPerk: item },
    source: item.source || "User-provided happy hour and perk attachment",
  };
}

function attachedSupplementalPlace(item) {
  const category = String(item.sourceCategory || item.category || "Place").trim();
  const icon = String(item.icon || "").toLowerCase();
  const explicitIntentTerms = [
    item.entityType,
    item.category,
    item.sourceCategory,
    item.icon,
    item.name,
  ].filter(Boolean);
  return {
    id: item.id,
    name: item.name,
    type: item.entityType || "venue",
    kind: item.entityType || "venue",
    sourceType: item.entityType || "venue",
    markerType: item.entityType || "venue",
    detailDrawerType: item.entityType || "venue",
    pinKey: icon || (category.toLowerCase().includes("coffee") ? "coffee" : "venue"),
    category,
    category_key: explicitIntentTerms
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_"),
    latitude: item.latitude,
    longitude: item.longitude,
    district: item.district || "Downtown Austin",
    address: item.address,
    website: item.website,
    summary: item.summary,
    description: item.alignment || item.summary,
    alignment_to_downtown_perks: item.alignment,
    searchKeywords: explicitIntentTerms,
    tags: [item.entityType, item.category, item.sourceCategory].filter(Boolean),
    raw: { attachedSupplementalLocation: item },
    source: item.source || "User-provided supplemental downtown locations",
  };
}

function isProductionReadyRailMigratedLocation(item) {
  const type = String(item?.entityType || "").toLowerCase();
  const category = String(item?.category || item?.sourceCategory || "").toLowerCase();
  const id = String(item?.id || "").toLowerCase();

  if (id === "rail-migrated-waterloo-records-video") return true;
  if (["event", "campaign"].includes(type)) return false;
  if (/\b(perk|campaign|event)\b/i.test(category)) return false;
  return true;
}

function attachedLegendsPropertyPlace(item) {
  const count = Number(item.groupedListingCount || 0);
  return {
    id: item.id,
    name: item.name,
    type: "property",
    kind: "property",
    entityType: "property",
    sourceType: "building",
    partnerType: "properties",
    brand: LEGENDS_BRAND_LINE,
    markerType: "property",
    detailDrawerType: "property",
    pinKey: "legends",
    category: "Legends Real Estate / Grouped Listings",
    category_key: ["legends", "residential property", "grouped listings", item.name, item.address, ...(item.categoryKeys || [])]
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_"),
    latitude: item.latitude,
    longitude: item.longitude,
    district: "Downtown Austin",
    address: item.address,
    summary: count > 1
      ? `${count} Legends listings are grouped at this downtown address.`
      : "Legends listing pin with downtown residential context.",
    description: "This property pin combines listing interest with nearby dining, hotels, wellness, events, parking, and resident perks.",
    groupedListingCount: count,
    primaryAction: "Ask Legends",
    secondaryAction: "View nearby",
    tags: ["Legends", "Listings", "Residential", "Property", "MLS", `${count} grouped listings`],
    raw: { attachedLegendsProperty: item },
    source: "User-provided Legends import attachment",
  };
}

function attachedFeaturedBrandPlace(item) {
  const text = [item.category, item.type, item.iconType, item.tag, item.description].join(" ").toLowerCase();
  const isProperty = /\b(property|residential|building|mixed-use|premium residential)\b/.test(text);
  const isHotel = /\b(hotel|hospitality|stay)\b/.test(text);
  const isVenue = /\b(venue|bar|restaurant|nightlife|dining)\b/.test(text);
  const resolvedType = isProperty ? "property" : isHotel ? "hotel" : isVenue ? "venue" : item.type || "brand";

  return {
    id: `featured-${item.slug}`,
    name: item.name,
    type: resolvedType,
    kind: resolvedType,
    entityType: resolvedType,
    sourceType: resolvedType === "property" ? "building" : resolvedType,
    partnerType: isProperty ? "properties" : isHotel ? "hotel" : isVenue ? "venues" : "brand",
    brand: item.name,
    markerType: resolvedType,
    detailDrawerType: resolvedType,
    pinKey: item.iconType || resolvedType,
    category: item.category,
    category_key: [item.category, item.tag, item.type, item.iconType, ...(item.searchKeywords || []), ...(item.askMapIntentTags || [])]
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_"),
    latitude: item.latitude,
    longitude: item.longitude,
    district: item.district,
    address: item.address,
    summary: item.description,
    description: item.description,
    image: item.imageUrl || item.heroImage || item.panelImage,
    imageUrl: item.imageUrl,
    heroImage: item.heroImage || item.imageUrl,
    panelImage: item.panelImage || item.heroImage || item.imageUrl,
    gallery: Array.isArray(item.gallery) ? item.gallery : [item.imageUrl, item.heroImage, item.panelImage].filter(Boolean),
    route: item.route,
    primaryAction: isProperty ? "Open Property Layer" : "Open Partner Layer",
    secondaryAction: "Save",
    tags: [item.category, item.tag, ...(item.searchKeywords || []), ...(item.askMapIntentTags || [])].filter(Boolean),
    raw: { attachedFeaturedBrand: item },
    source: "User-provided featured brand attachment",
  };
}

function rentalListingPlace(listing) {
  const legendsResidentialExperience = getLegendsResidentialExperience(listing);
  const sqftDisplay = listing.sqft ? `${Number(listing.sqft).toLocaleString()} sqft` : "";
  const facts = [
    listing.priceLabel,
    `${listing.beds} bd`,
    `${listing.baths} ba`,
    sqftDisplay,
  ].filter(Boolean).join(" · ");

  return {
    id: listing.id,
    name: `${listing.building} #${listing.unit}`,
    type: "rental",
    kind: "rental",
    entityType: "rental",
    sourceType: "rental",
    markerType: "rental",
    detailDrawerType: "rental",
    pinKey: "legends",
    brand: "Legends Real Estate",
    category: "Legends Real Estate / Rental",
    category_key: [
      "legends",
      "legends real estate",
      "rental",
      "residential",
      "residential intelligence",
      "building",
      "lifestyle",
      "neighborhood",
      "leasing",
      "apartment",
      "condo",
      listing.building,
      listing.neighborhood,
      listing.mls,
      ...listing.highlights,
      ...listing.amenities,
      ...listing.nearbyPerks,
    ]
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_"),
    latitude: listing.lat,
    longitude: listing.lng,
    district: listing.neighborhood,
    neighborhood: listing.neighborhood,
    address: listing.address,
    summary: listing.description,
    description: listing.description,
    image: legendsResidentialExperience?.heroImage || "/images/buildings/lobby-to-street-arrival.png",
    price: listing.price,
    priceLabel: listing.priceLabel,
    beds: listing.beds,
    baths: listing.baths,
    sqft: listing.sqft,
    unit: listing.unit,
    mls: listing.mls,
    building: listing.building,
    listingFacts: facts,
    highlights: listing.highlights,
    amenities: listing.amenities,
    nearbyPerks: listing.nearbyPerks,
    rentalListing: listing,
    legendsResidentialExperience,
    source: "Legends Real Estate residential intelligence layer",
    tags: ["Legends", "Rentals", "Residential", "Residential Intelligence", listing.building, listing.neighborhood, listing.mls, ...listing.highlights, ...listing.amenities, ...listing.nearbyPerks],
  };
}

const fairmontWellnessSchedule = [
  ["2026-07-01", "Wed · Jul 1 · 6:00 PM", "6:00 PM - 7:00 PM", "Zilker Ballroom, 6th Floor", "Power Flow & Sculpt"],
  ["2026-07-08", "Wed · Jul 8 · 6:00 PM", "6:00 PM - 7:00 PM", "Zilker Ballroom, 6th Floor", "Gentle Yoga & Recovery"],
  ["2026-07-11", "Sat · Jul 11 · 8:00 AM", "8:00 AM - 9:00 AM", "Zilker Ballroom, 6th Floor", "Power Flow & Sculpt"],
  ["2026-07-15", "Wed · Jul 15 · 6:00 PM", "6:00 PM - 7:00 PM", "Hamilton Pool Room, 3rd Floor", "Gentle Yoga & Recovery"],
  ["2026-07-18", "Sat · Jul 18 · 8:00 AM", "8:00 AM - 9:00 AM", "Zilker Ballroom, 6th Floor", "Power Flow & Sculpt"],
  ["2026-07-22", "Wed · Jul 22 · 6:00 PM", "6:00 PM - 7:00 PM", "Fairmont Spa, 6th Floor", "Gentle Yoga & Recovery"],
  ["2026-07-25", "Sat · Jul 25 · 8:00 AM", "8:00 AM - 9:00 AM", "Zilker Ballroom, 6th Floor", "Power Flow & Sculpt"],
  ["2026-07-29", "Wed · Jul 29 · 6:00 PM", "6:00 PM - 7:00 PM", "Zilker Ballroom, 6th Floor", "Gentle Yoga & Recovery"],
  ["2026-08-01", "Sat · Aug 1 · 8:00 AM", "8:00 AM - 9:00 AM", "Zilker Ballroom, 6th Floor", "Power Flow & Sculpt"],
  ["2026-08-05", "Wed · Aug 5 · 6:00 PM", "6:00 PM - 7:00 PM", "Fairmont Spa, 6th Floor", "Gentle Yoga & Recovery"],
  ["2026-08-08", "Sat · Aug 8 · 8:00 AM", "8:00 AM - 9:00 AM", "Firewheel Rooftop Meeting Room", "Power Flow & Sculpt"],
  ["2026-08-12", "Wed · Aug 12 · 6:00 PM", "6:00 PM - 7:00 PM", "Fairmont Spa, 6th Floor", "Gentle Yoga & Recovery"],
  ["2026-08-15", "Sat · Aug 15 · 8:00 AM", "8:00 AM - 9:00 AM", "Firewheel Rooftop Meeting Room", "Power Flow & Sculpt"],
  ["2026-08-19", "Wed · Aug 19 · 6:00 PM", "6:00 PM - 7:00 PM", "Zilker Ballroom, 6th Floor", "Gentle Yoga & Recovery"],
  ["2026-08-22", "Sat · Aug 22 · 8:00 AM", "8:00 AM - 9:00 AM", "Firewheel Rooftop Meeting Room", "Power Flow & Sculpt"],
  ["2026-08-26", "Wed · Aug 26 · 6:00 PM", "6:00 PM - 7:00 PM", "Firewheel Rooftop Meeting Room", "Gentle Yoga & Recovery"],
  ["2026-08-29", "Sat · Aug 29 · 8:00 AM", "8:00 AM - 9:00 AM", "Fairmont Spa, 6th Floor", "Power Flow & Sculpt"],
];

const fairmontWellnessEventPins = fairmontWellnessSchedule.map(([isoDate, label, duration, room, className]) => {
  const isPower = className.includes("Power");
  return eventPlace({
    id: `fairmont-summer-wellness-${isoDate}`,
    parentId: "event-fairmont-summer-wellness",
    name: `${className} at Fairmont Austin`,
    category: "Wellness",
    categoryKey: `fairmont summer wellness ${className} ${room}`,
    latitude: 30.26368,
    longitude: -97.73876,
    district: "Red River",
    address: "101 Red River St, Austin, TX 78701",
    time: label,
    date: `${isoDate}T${label.includes("8:00 AM") ? "08:00:00" : "18:00:00"}-05:00`,
    image: isPower ? FAIRMONT_CABANA_IMAGE : FAIRMONT_POOL_IMAGE,
    rsvpCount: isPower ? 36 : 32,
    tags: ["Fairmont Austin", "Summer Wellness Series", className, room, "Yoga", "Recovery", "Spa"],
    summary: `${className} during Fairmont Austin's Summer Wellness Series. Drop in for class, then add Thermal Circuit access if you want the sauna, steam room, saline pool, and cold plunge.`,
    description: `${className} during Fairmont Austin's Summer Wellness Series. Drop in for class, then add Thermal Circuit access if you want the sauna, steam room, saline pool, and cold plunge.`,
    offer: "$25 class / +$50 Thermal Circuit",
    price: "$25 drop-in",
    addOn: "Thermal Circuit Access +$50",
    checkIn: "Arrive 15 minutes early at Fairmont Spa reception.",
    reservation: "Recommended. Space is limited.",
    eventRoom: room,
    eventDuration: duration,
    bookingUrl: FAIRMONT_BOOKING_URL,
    website: FAIRMONT_BOOKING_URL,
    primaryAction: "Book Class",
    secondaryAction: "Add to Calendar",
    related: ["event-fairmont-summer-wellness", "partner-fairmont-austin", "perk-lululemon-run-club"],
    goodFor: ["Morning reset", "After-work movement", "Wellness dates", "Hotel guests", "Downtown residents"],
    included: isPower
      ? ["Balance", "Mobility", "Bodyweight strength", "Weekend motivation"]
      : ["Stretching", "Breathwork", "Stress relief", "Recovery"],
    partnerInsight: "Tracks dated wellness demand, booking intent, spa add-on interest, and hotel guest plus resident crossover.",
  });
});

const eventPlaces = [
  eventPlace({
    id: "fairmont-rooftop-pool-dj-series",
    parentId: "partner-fairmont-austin",
    name: "Fairmont Rooftop Pool DJ Series",
    category: "Rooftop Pool",
    categoryKey: "fairmont rooftop pool dj weekend summer hotel",
    latitude: 30.26368,
    longitude: -97.73876,
    district: "Red River",
    address: "101 Red River St, Austin, TX 78701",
    time: "Sat-Sun · 12:00 PM",
    date: "2026-06-27T12:00:00-05:00",
    image: FAIRMONT_POOL_IMAGE,
    rsvpCount: 86,
    tags: ["Fairmont Austin", "Rooftop Pool", "DJ", "Weekend", "Summer", "Staycation"],
    summary: "Spend the afternoon beside Fairmont's rooftop pool with live DJs, cocktails, themed weekends, and seasonal activations.",
    description: "Whether you're swimming or just taking in the atmosphere, this is one of downtown's signature summer hotel experiences.",
    offer: "Book early during holiday weekends. Pool capacity regularly sells out.",
    primaryAction: "Book Pool Pass",
    secondaryAction: "Save",
    related: ["partner-fairmont-austin", "event-fairmont-dive-in-movies", "event-fairmont-fourth-of-july-pool-party"],
    goodFor: ["Pool day", "Friends", "Visitors", "Staycation", "Weekend"],
    included: ["Live DJ", "Pool access with reservation", "Food and drinks available", "Weekend atmosphere"],
    partnerInsight: "Strongest for weekend hotel guests, residents planning pool days, and visitors looking for a downtown summer anchor.",
  }),
  eventPlace({
    id: "fairmont-live-music-fulton",
    parentId: "partner-fairmont-austin",
    name: "Live Music in Fulton",
    category: "Live Music",
    categoryKey: "fairmont fulton lobby bar live music cocktails",
    latitude: 30.26368,
    longitude: -97.73876,
    district: "Red River",
    address: "101 Red River St, Austin, TX 78701",
    time: "Daily · 5:00 PM",
    date: "2026-06-26T17:00:00-05:00",
    image: FAIRMONT_HOTEL_IMAGE,
    rsvpCount: 58,
    tags: ["Fairmont Austin", "Fulton", "Live Music", "Lobby Bar", "Cocktails"],
    summary: "Local musicians play every evening in Fulton's relaxed lobby bar setting.",
    description: "Easy for a casual drink before dinner, a comfortable after-work stop, or a low-friction live music plan inside the hotel.",
    offer: "Pair live music with dinner at Garrison or rooftop drinks afterwards.",
    primaryAction: "View Tonight's Artist",
    secondaryAction: "Save",
    related: ["partner-fairmont-austin", "event-fairmont-room-725-comedy-series", "partner-hotel-van-zandt"],
    goodFor: ["After work", "Cocktails", "Visitors", "Conversation", "Live music"],
    included: ["Casual indoor lounge", "Craft cocktails", "Small bites", "Daily music"],
    partnerInsight: "Useful for measuring evening hotel traffic, after-work saves, and dinner-to-drinks movement.",
  }),
  eventPlace({
    id: "fairmont-rules-and-regs-summer-music",
    parentId: "partner-fairmont-austin",
    name: "Summer Music Series at Rules & Regs",
    category: "Rooftop Music",
    categoryKey: "fairmont rules and regs rooftop music cocktails",
    latitude: 30.26368,
    longitude: -97.73876,
    district: "Red River",
    address: "101 Red River St, Austin, TX 78701",
    time: "Weekly · 7:00 PM",
    date: "2026-06-27T19:00:00-05:00",
    image: FAIRMONT_CABANA_IMAGE,
    rsvpCount: 64,
    tags: ["Fairmont Austin", "Rules & Regs", "Rooftop", "Live Music", "Cocktails"],
    summary: "An evening rooftop series with Latin, acoustic performers, and DJs overlooking the downtown skyline.",
    description: "Arrive before sunset, order a cocktail, and let the skyline do some of the work.",
    offer: "Arrive before sunset for the best atmosphere.",
    primaryAction: "Reserve Table",
    secondaryAction: "Save",
    related: ["partner-fairmont-austin", "event-fairmont-rooftop-pool-dj-series"],
    goodFor: ["Sunset", "Date night", "Cocktails", "Groups", "Visitors"],
    included: ["Live music", "Skyline views", "Seasonal cocktails", "Outdoor rooftop"],
    partnerInsight: "Best for date-night saves, rooftop interest, and visitor evening plans around Red River and Rainey.",
  }),
  eventPlace({
    id: "fairmont-room-725-comedy-series",
    parentId: "partner-fairmont-austin",
    name: "Room 725 Summer Comedy Series",
    category: "Comedy",
    categoryKey: "fairmont room 725 comedy series friday",
    latitude: 30.26368,
    longitude: -97.73876,
    district: "Red River",
    address: "101 Red River St, Austin, TX 78701",
    time: "Fri · 8:00 PM",
    date: "2026-06-26T20:00:00-05:00",
    image: FAIRMONT_HOTEL_IMAGE,
    rsvpCount: 42,
    tags: ["Fairmont Austin", "Room 725", "Comedy", "Friday", "Date Night"],
    summary: "Austin comedians perform weekly inside Fairmont's intimate Room 725 venue.",
    description: "An easy evening to pair with dinner downstairs or rooftop drinks before heading home.",
    offer: "Dinner at Fulton beforehand makes an easy evening.",
    primaryAction: "Reserve",
    secondaryAction: "Save",
    related: ["partner-fairmont-austin", "event-fairmont-live-music-fulton", "event-fairmont-theatre-of-magic"],
    goodFor: ["Friends", "Date night", "Visitors", "Comedy lovers"],
    included: ["Professional comedians", "Cocktail service", "Indoor venue", "Reserved seating"],
    partnerInsight: "Shows entertainment intent inside the hotel and whether comedy drives dinner, drinks, and direction taps.",
  }),
  eventPlace({
    id: "fairmont-theatre-of-magic",
    parentId: "partner-fairmont-austin",
    name: "Austin's Theatre of Magic",
    category: "Entertainment",
    categoryKey: "fairmont room 725 magic theatre families visitors",
    latitude: 30.26368,
    longitude: -97.73876,
    district: "Red River",
    address: "101 Red River St, Austin, TX 78701",
    time: "Weekly · 5:00 PM",
    date: "2026-06-28T17:00:00-05:00",
    image: FAIRMONT_HOTEL_IMAGE,
    rsvpCount: 37,
    tags: ["Fairmont Austin", "Room 725", "Magic", "Families", "Visitors"],
    summary: "Close-up illusion, sleight of hand, and interactive performances inside one of downtown's most unusual hotel venues.",
    description: "Good when you want something different without turning the evening into a production.",
    primaryAction: "Book Tickets",
    secondaryAction: "Save",
    related: ["partner-fairmont-austin", "event-fairmont-room-725-comedy-series"],
    goodFor: ["Families", "Visitors", "Couples", "Something different"],
    included: ["Interactive performance", "Small audience", "Professional performers", "Indoor theatre"],
    partnerInsight: "Useful for family-friendly visitor intent, unusual date-night saves, and indoor entertainment demand.",
  }),
  eventPlace({
    id: "fairmont-dive-in-movies",
    parentId: "partner-fairmont-austin",
    name: "Dive-in Movies at Fairmont",
    category: "Movies",
    categoryKey: "fairmont dive in movies rooftop pool summer",
    latitude: 30.26368,
    longitude: -97.73876,
    district: "Red River",
    address: "101 Red River St, Austin, TX 78701",
    time: "Every other Tue · 7:45 PM",
    date: "2026-06-30T19:45:00-05:00",
    image: FAIRMONT_POOL_IMAGE,
    rsvpCount: 51,
    tags: ["Fairmont Austin", "Dive-in Movies", "Rooftop Pool", "Summer", "Outdoor"],
    summary: "Watch classic films from the rooftop pool with drinks, food, and a downtown summer evening around you.",
    description: "Bring a towel, arrive before sunset, and make the movie the easiest part of the night.",
    offer: "Bring a towel and arrive before sunset.",
    primaryAction: "Reserve",
    secondaryAction: "Save",
    related: ["partner-fairmont-austin", "event-fairmont-rooftop-pool-dj-series"],
    goodFor: ["Summer evenings", "Visitors", "Couples", "Friends", "Staycation"],
    included: ["Pool access", "Movie screening", "Food and drinks", "Outdoor experience"],
    partnerInsight: "Good for tracking seasonal pool interest, movie-night saves, and guest plus resident crossover.",
  }),
  eventPlace({
    id: "fairmont-summer-wellness",
    parentId: "partner-fairmont-austin",
    name: "Summer Wellness Series",
    category: "Wellness",
    categoryKey: "fairmont spa summer wellness yoga recovery thermal circuit",
    latitude: 30.26368,
    longitude: -97.73876,
    district: "Red River",
    address: "101 Red River St, Austin, TX 78701",
    time: "Jul 1-Aug 29 · Wed + Sat",
    date: "2026-07-01T18:00:00-05:00",
    image: FAIRMONT_CABANA_IMAGE,
    rsvpCount: 44,
    tags: ["Fairmont Austin", "Summer Wellness Series", "Spa", "Wellness", "Yoga", "Recovery", "Thermal Circuit"],
    summary: "A summer series of Power Flow, Sculpt, Gentle Yoga, and Recovery classes at Fairmont Austin, with optional Thermal Circuit access after class.",
    description: "Move, recover, and reset with yoga and recovery sessions at Fairmont Austin. Drop in for a single class, then add Thermal Circuit access if you want the sauna, steam room, saline pool, and cold plunge.",
    offer: "$25 class / +$50 Thermal Circuit",
    price: "$25 drop-in",
    addOn: "Thermal Circuit Access +$50",
    checkIn: "Arrive 15 minutes early at Fairmont Spa reception.",
    reservation: "Recommended. Space is limited.",
    bookingUrl: FAIRMONT_BOOKING_URL,
    website: FAIRMONT_BOOKING_URL,
    primaryAction: "Book Class",
    secondaryAction: "Add to Calendar",
    related: ["partner-fairmont-austin", ...fairmontWellnessEventPins.map((event) => event.id), "event-waterloo-yoga", "perk-lululemon-run-club"],
    goodFor: ["Morning reset", "After-work movement", "Wellness dates", "Hotel guests", "Downtown residents"],
    included: ["Power Flow & Sculpt", "Gentle Yoga & Recovery", "Optional Thermal Circuit", "Fairmont Spa check-in"],
    schedule: fairmontWellnessSchedule.map(([isoDate, label, duration, room, className]) => ({ isoDate, label, duration, room, className })),
    panelHeadline: "Move, recover, then maybe earn the steam room.",
    panelBody: "A summer series of Power Flow, Sculpt, Gentle Yoga, and Recovery classes at Fairmont Austin, with optional Thermal Circuit access after class.",
    quickFacts: ["Wellness", "Fairmont Spa Austin", "July 1-August 29", "Wednesdays 6-7 PM", "Saturdays 8-9 AM", "$25 drop-in", "+$50 Thermal Circuit"],
    partnerInsight: "Best for wellness users, spa interest, resident fitness routines, dated class bookings, and hotel guest programming.",
  }),
  ...fairmontWellnessEventPins,
  eventPlace({
    id: "fairmont-fourth-of-july-pool-party",
    parentId: "partner-fairmont-austin",
    name: "Fourth of July Weekend Pool Party",
    category: "Seasonal Event",
    categoryKey: "fairmont fourth july pool party dj cocktails holiday",
    latitude: 30.26368,
    longitude: -97.73876,
    district: "Red River",
    address: "101 Red River St, Austin, TX 78701",
    time: "Seasonal · Rooftop Pool",
    date: "2026-07-04T12:00:00-05:00",
    image: FAIRMONT_POOL_IMAGE,
    rsvpCount: 92,
    tags: ["Fairmont Austin", "Fourth of July", "Pool Party", "DJs", "Holiday Weekend"],
    summary: "Celebrate Independence Day weekend with DJs, cocktails, poolside entertainment, and one of downtown's liveliest hotel pool scenes.",
    description: "This one regularly reaches capacity, so advance booking is the move.",
    offer: "Advance booking is recommended.",
    primaryAction: "Book Pool Pass",
    secondaryAction: "Save",
    related: ["partner-fairmont-austin", "event-fairmont-rooftop-pool-dj-series", "event-fairmont-dive-in-movies"],
    goodFor: ["Holiday weekend", "Visitors", "Groups", "Summer celebration"],
    included: ["Live DJs", "Drink specials", "Pool access", "Special activations", "Holiday atmosphere"],
    partnerInsight: "Strong for holiday-weekend demand, pool pass saves, group planning, and hotel guest conversion.",
  }),
  eventPlace({
    id: "hotel-van-zandt-first-thursday",
    name: "Hotel Van Zandt First Thursday",
    category: "Happy Hour",
    categoryKey: "happy_hour hotel_van_zandt first_thursday",
    latitude: 30.2588,
    longitude: -97.7392,
    district: "Rainey",
    address: "605 Davis St, Austin, TX 78701",
    time: "Thu 13 · 5:00 PM",
    date: "2026-06-13T17:00:00-05:00",
    image: "/images/imported/perks/hotel-van-zandt-entrance.jpg",
    rsvpCount: 68,
    tags: ["Hotel Van Zandt", "Geraldine's", "First Thursday", "Rainey", "Happy Hour", "Live Music"],
    summary: "A featured Rainey hotel moment connecting guests, residents, Geraldine's, happy hour, and nearby live music.",
    partnerInsight: "Useful for seeing how hotel guests and residents respond to First Thursday timing, Geraldine's traffic, saves, and nearby follow-on plans.",
  }),
  eventPlace({
    id: "geraldines-happy-hour-live-music",
    name: "Geraldine's Happy Hour + Live Music",
    category: "Live Music",
    categoryKey: "live_music happy_hour hotel_van_zandt",
    latitude: 30.2587,
    longitude: -97.7392,
    district: "Rainey",
    address: "605 Davis St, Austin, TX 78701",
    time: "Mon 10 · 6:00 PM",
    date: "2026-06-10T18:00:00-05:00",
    image: "/images/map-entities/attached/venues/geraldines-stage.jpeg",
    rsvpCount: 74,
    tags: ["Hotel Van Zandt", "Geraldine's", "Live Music", "Rainey", "Happy Hour"],
    summary: "Dinner, drinks, and live music inside Hotel Van Zandt for residents and hotel guests already near Rainey.",
    partnerInsight: "Shows which audiences save music-led hotel programming and whether happy hour creates dinner, directions, and nearby venue interest.",
  }),
  eventPlace({
    id: "parker-jazz-club",
    name: "Parker Jazz Club",
    category: "Music",
    categoryKey: "music jazz downtown_calendar",
    latitude: 30.26832,
    longitude: -97.7404,
    district: "Downtown",
    address: "Parker Jazz Club, Downtown Austin, TX 78701",
    time: "Tue 11 · 8:30 PM",
    date: "2026-06-11T20:30:00-05:00",
    image: "/images/imported/perks/parker-jazz-club.jpg",
    rsvpCount: 43,
    tags: ["Jazz", "Music", "Downtown calendar", "Date night", "Evening"],
    summary: "An intimate downtown jazz set with table service, low lights, and a room built for actually listening.",
    partnerInsight: "Shows late-evening save behavior, direction taps, and nearby dinner or drink interest before and after a music event.",
  }),
  eventPlace({
    id: "lobby-hour",
    name: "Lobby Hour",
    category: "Happy Hour",
    categoryKey: "happy_hour resident_meetup",
    latitude: 30.26698,
    longitude: -97.74562,
    district: "2nd Street",
    address: "The Paseo Lobby, Austin, TX 78701",
    time: "Mon 10 · 6:30 PM",
    date: "2026-06-10T18:30:00-05:00",
    image: "/images/buildings/lobby-to-street-arrival.png",
    rsvpCount: 34,
    tags: ["Resident meetup", "Lobby", "Happy Hour", "2nd Street"],
    summary: "A casual meet-up a couple blocks away. Drop in, meet a few neighbors, grab a drink, and let the night figure itself out.",
    partnerInsight: "Shows building-to-neighborhood movement, lobby QR interest, saves, and nearby places residents choose after the meetup.",
  }),
  eventPlace({
    id: "seaholm-happy-hour",
    name: "Seaholm Happy Hour",
    category: "Happy Hour",
    categoryKey: "happy_hour seaholm after_work",
    latitude: 30.26897,
    longitude: -97.75032,
    district: "Seaholm",
    address: "Seaholm District, Austin, TX 78701",
    time: "Mon 10 · 5:00 PM",
    date: "2026-06-10T17:00:00-05:00",
    image: "/images/map-entities/dining/outdoor-dining-arrival.avif",
    rsvpCount: 41,
    tags: ["Seaholm", "After work", "Happy Hour"],
    summary: "A simple after-work stop near Seaholm for a quick drink, an easy dinner plan, or meeting someone before the night gets crowded.",
    partnerInsight: "Shows after-work timing, resident saves, and nearby dining interest around Seaholm.",
  }),
  eventPlace({
    id: "rainey-patio-night",
    name: "Rainey Patio Night",
    category: "Things to do",
    categoryKey: "things_to_do patio rainey",
    latitude: 30.25855,
    longitude: -97.73835,
    district: "Rainey",
    address: "Rainey Street, Austin, TX 78701",
    time: "Wed 12 · 7:00 PM",
    date: "2026-06-12T19:00:00-05:00",
    image: "/images/partners/hospitality-rooftop-social.png",
    rsvpCount: 52,
    tags: ["Rainey", "Patio", "Night out", "Residents"],
    summary: "An easy night out for residents looking for music, drinks, and enough nearby spots to keep things interesting without overplanning.",
  }),
  eventPlace({
    id: "run-club",
    name: "Run Club",
    category: "Fitness",
    categoryKey: "fitness run_club",
    latitude: 30.27166,
    longitude: -97.75029,
    district: "Seaholm",
    address: "Shoal Creek Trailhead, Austin, TX 78701",
    time: "Fri 14 · 7:15 AM",
    date: "2026-06-14T07:15:00-05:00",
    image: "/images/residents/downtown-rooftop-evening.png",
    rsvpCount: 28,
    tags: ["Fitness", "Run club", "Coffee after", "Seaholm"],
    summary: "Start nearby, finish with coffee after. Built for residents who want movement without another app or group thread.",
  }),
  eventPlace({
    id: "coffee-walk",
    name: "Coffee Walk",
    category: "Things to do",
    categoryKey: "coffee_walk morning",
    latitude: 30.26472,
    longitude: -97.74604,
    district: "2nd Street",
    address: "2nd Street District, Austin, TX 78701",
    time: "Fri 14 · 9:00 AM",
    date: "2026-06-14T09:00:00-05:00",
    image: "/images/buildings/lobby-to-street-arrival.png",
    rsvpCount: 22,
    tags: ["Coffee", "Morning", "2nd Street", "Residents"],
    summary: "Meet downstairs, walk a few blocks, and grab coffee nearby. Easy, useful, and over before the day gets away from you.",
  }),
  eventPlace({
    id: "rooftop-social",
    name: "Rooftop Social",
    category: "Access",
    categoryKey: "access rooftop_social",
    latitude: 30.26491,
    longitude: -97.74375,
    district: "Congress",
    address: "Downtown Rooftop, Austin, TX 78701",
    time: "Sat 15 · 7:00 PM",
    date: "2026-06-15T19:00:00-05:00",
    image: "/images/partners/hospitality-rooftop-social.png",
    rsvpCount: 46,
    tags: ["Rooftop", "Access", "Congress", "Residents"],
    summary: "Curated access for downtown residents. See who's going, RSVP, and use your card when you arrive.",
  }),
  eventPlace({
    id: "waterline-preview",
    name: "Waterline Preview Walk",
    category: "Local",
    categoryKey: "local preview_walk residential",
    latitude: 30.26072,
    longitude: -97.7392,
    district: "Rainey",
    address: "Waterline District, Austin, TX 78701",
    time: "Sat 15 · 4:30 PM",
    date: "2026-06-15T16:30:00-05:00",
    image: "/images/imported/perks/w-austin-lavaca-listing.jpg",
    rsvpCount: 31,
    tags: ["Waterline", "Preview", "Residential", "Rainey"],
    summary: "See what is opening nearby, what is walkable, and which places are worth keeping on your radar if you live downtown.",
  }),
  eventPlace({
    id: "sunday-brunch-card",
    name: "Sunday Brunch Card Perk",
    detailEntityType: "perk",
    detailMediaApproved: false,
    perk: {
      title: "Sunday Brunch Card",
      detailMediaApproved: false,
      summary: "Unlock resident brunch benefits at participating downtown restaurants each Sunday.",
      benefit: "Brunch benefits at participating downtown restaurants every Sunday.",
      eligibility: ["Active Downtown Perks Resident Card", "Participating locations", "Available Sundays"],
      redemptionMethod: "show-card",
      redemptionInstructions: ["Choose a participating restaurant.", "Open your Resident Card before ordering.", "Show the card when you ask for the resident benefit."],
      recurringSchedule: "Available Sundays during participating brunch hours.",
      status: "live",
      participatingEntityIds: ["happy-hour-caroline", "happy-hour-moonshine-comfort-cocktails", "event-geraldines-happy-hour-live-music"],
      participatingEntityNames: ["Caroline", "Moonshine Comfort & Cocktails", "Geraldine's Happy Hour + Live Music"],
      participatingEntities: [
        { id: "happy-hour-caroline", name: "Caroline", type: "venue", category: "Dining", district: "Congress", latitude: 30.268727, longitude: -97.742332, benefit: "Sunday resident brunch benefit" },
        { id: "happy-hour-moonshine-comfort-cocktails", name: "Moonshine Comfort & Cocktails", type: "venue", category: "Dining", district: "Red River", latitude: 30.263779, longitude: -97.738029, benefit: "Sunday resident brunch benefit" },
        { id: "event-geraldines-happy-hour-live-music", name: "Geraldine's", type: "venue", category: "Dining", district: "Rainey", latitude: 30.2587, longitude: -97.7392, image: "/images/map-entities/attached/venues/geraldines-stage.jpeg", benefit: "Sunday resident brunch benefit" },
      ],
      terms: ["One resident benefit per participating visit.", "Availability and restaurant hours may change.", "A valid Resident Card is required."],
      analyticsEventName: "sunday_brunch_card_used",
    },
    category: "Perk",
    categoryKey: "perk brunch card",
    latitude: 30.26458,
    longitude: -97.74412,
    district: "Congress",
    address: "Downtown Dining Partners, Austin, TX 78701",
    time: "Sun 16 · 11:30 AM",
    date: "2026-06-16T11:30:00-05:00",
    image: "/images/map-entities/dining/outdoor-dining-arrival.avif",
    rsvpCount: 38,
    tags: ["Brunch", "Perks Card", "Dining", "Residents"],
    summary: "The Sunday Brunch Card perk gives residents brunch value at participating downtown dining partners, making a nearby weekend meal easier to choose and compare.",
  }),
  eventPlace({
    id: "morning-yoga-waterloo",
    name: "Morning Yoga at Waterloo Park",
    category: "Fitness",
    categoryKey: "fitness wellness waterloo",
    latitude: 30.27439,
    longitude: -97.73533,
    district: "Red River",
    address: "Waterloo Park, Austin, TX 78701",
    time: "Tue 18 · 7:30 AM",
    date: "2026-06-18T07:30:00-05:00",
    image: "/images/residents/downtown-rooftop-evening.png",
    rsvpCount: 28,
    tags: ["Waterloo Park", "Yoga", "Fitness", "Wellness"],
    summary: "Start your morning with a free community yoga session in Waterloo Park. All levels welcome. Bring a mat, water, and a neighbor.",
  }),
  eventPlace({
    id: "red-river-live-list",
    name: "Red River Live List",
    category: "Live Music",
    categoryKey: "live_music red_river",
    latitude: 30.26995,
    longitude: -97.7369,
    district: "Red River",
    address: "Red River Cultural District, Austin, TX 78701",
    time: "Tue 18 · 8:00 PM",
    date: "2026-06-18T20:00:00-05:00",
    image: "/images/partners/hospitality-rooftop-social.png",
    rsvpCount: 57,
    tags: ["Red River", "Live Music", "Tonight"],
    summary: "A quick look at what is actually worth catching tonight, grouped around places close enough to make the decision easy.",
  }),
  eventPlace({
    id: "monday-meetups-stay-put",
    name: "Monday Meetups at Stay Put",
    category: "Social",
    categoryKey: "social stay_put",
    latitude: 30.2589,
    longitude: -97.73805,
    district: "Rainey",
    address: "The Stay Put, Austin, TX 78701",
    time: "Thu 20 · 6:00 PM",
    date: "2026-06-20T18:00:00-05:00",
    image: "/images/imported/perks/stayput.png",
    rsvpCount: 64,
    tags: ["Stay Put", "Social", "Rainey", "Residents"],
    summary: "Start the week with something low-key, local, and easy to say yes to.",
  }),
];

const brandPartnerPlaces = [
  {
    id: "campaign-rivian-downtown-experience-layer",
    name: "Rivian Downtown Experience Layer",
    type: "campaign",
    kind: "brand-campaign-layer",
    partnerType: "brand",
    brand: "Rivian",
    pinKey: "rivian",
    category: "Brand Campaign / Mobility + Experiential",
    category_key: "brand_campaign rivian mobility experiential ev test_drive ride_request trail_coffee hotel_residential seaholm",
    latitude: 30.26972,
    longitude: -97.75382,
    district: "Seaholm",
    address: "Seaholm District, Austin, TX 78701",
    summary: "Bring the Rivian experience into everyday downtown life, from coffee and trail mornings to dinner plans after a test drive.",
    description: "Rivian appears on the map as a live mobility layer: residents can request a downtown test drive, ask for a ride to an event, unlock local activations, or follow where the Rivian is headed next.",
    deals_offers: "Request a Rivian test drive, ride, route, or local activation",
    primaryAction: "Request Rivian Experience",
    secondaryAction: "Save Campaign",
    campaignObjective: "Connect Rivian to daily downtown movement: brunch, workouts, errands, hotel stays, residential routines, concerts, rooftops, wellness events, and weekend plans.",
    partnerInsight: "Strongest when mobility is attached to a real plan: trail and coffee mornings, event rides, hotel guest routes, residential access, and test-drive windows between errands.",
    audience: "Downtown residents, hotel guests, wellness audiences, trail users, brunch groups, eventgoers, and visitors already moving through the city.",
    image: "/images/imported/perks/rivian.png",
    related: ["partner-rivian", "perk-rivian-waterfront-drive", "civic-waterloo-greenway", "partner-lululemon", "partner-jos-coffee", "priority-the-waterline"],
    tags: ["Rivian", "EV", "Mobility", "Experiential", "Test Drive", "Ride Request", "Trail Coffee", "Hotel Partnerships", "Residential Partnerships"],
    source: "Downtown Perks brand partner layer",
  },
  {
    id: "yeti-congress-district-activation",
    name: "YETI Congress Activation",
    type: "brand",
    partnerType: "brand",
    brand: "YETI",
    pinKey: "yeti",
    category: "Brand / Activation",
    category_key: "brand_activation yeti congress water_bottle events engraving",
    latitude: 30.26724,
    longitude: -97.74276,
    district: "Congress",
    address: "Congress Avenue, Austin, TX 78701",
    summary: "Outdoor gear, local movement, and everyday downtown routines.",
    description: "Outdoor gear, local movement, and everyday downtown routines.",
    deals_offers: "Resident engraving and event-day bottle offer",
    primaryAction: "Save Activation",
    secondaryAction: "View Campaign",
    campaignObjective: "Place YETI inside live downtown behavior and convert local attention into saves, scans, and event participation.",
    partnerInsight: "Best around event arrivals, civic programs, building QR placements, and weekend afternoon foot traffic.",
    audience: "Residents, visitors, eventgoers, trail users, and hotel guests.",
    image: "/images/map-entities/brand-yeti/yeti-flagship-interior.jpg",
    related: ["waterloo-greenway-campaign-hub", "downtown-austin-alliance-civic-layer", "four-seasons-congress-guest-dining-campaign"],
    mapLayer: "YETI",
    datasetLayer: "YETI",
    tags: ["YETI", "Austin Brand", "Congress", "Events", "QR", "Water Bottle", "Brand Activation"],
    source: "Downtown Perks brand partner layer",
  },
  {
    id: "topo-chico-downtown-hydration-activation",
    name: "Topo Chico Hydration Layer",
    type: "brand",
    partnerType: "brand",
    brand: "Topo Chico",
    category: "Brand / Hydration Activation",
    category_key: "brand_activation topo_chico hydration waterloo wellness nightlife recovery rainey",
    latitude: 30.27348,
    longitude: -97.73602,
    district: "Waterloo",
    address: "Waterloo Park, Austin, TX 78701",
    summary: "A downtown hydration launch tied to wellness events, nightlife recovery, hotel arrivals, and high-footfall partner stops.",
    description: "Topo Chico appears where it is useful: event tables, venue bars, recovery stops, and map moments when people are choosing what to do next.",
    deals_offers: "Hydration unlock at participating events and venues",
    primaryAction: "Unlock Activation",
    secondaryAction: "View Partners",
    campaignObjective: "Measure which event, venue, and corridor turns hydration intent into scans, saves, and product trial.",
    partnerInsight: "Strongest at Waterloo wellness events, Rainey nightlife windows, hotel welcome moments, and after-work outdoor programming.",
    audience: "Residents, eventgoers, runners, hotel guests, nightlife crowds, and wellness groups.",
    image: "/images/map-entities/brand-topo-chico/topo-chico-bottle-yellow.jpeg",
    related: ["event-waterloo-yoga", "waterloo-greenway-campaign-hub", "partner-hotel-van-zandt"],
    mapLayer: "Topo Chico",
    datasetLayer: "Topo Chico",
    tags: ["Topo Chico", "Hydration", "Waterloo", "Rainey", "Wellness", "Nightlife", "QR"],
    source: "Downtown Perks brand partner layer",
  },
  {
    id: "inspired-closets-austin-residential-services-activation",
    name: "Inspired Closets Austin",
    type: "service",
    kind: "service",
    entityType: "service",
    detailDrawerType: "service",
    partnerType: "brand",
    brand: "Inspired Closets Austin",
    pinKey: "service",
    category: "Service / Home Organization",
    category_key: "service inspired_closets home_organization closet_systems residential_services move_in congress",
    latitude: 30.26472,
    longitude: -97.74456,
    district: "Congress",
    address: "Congress Avenue residential core, Austin, TX 78701",
    summary: "Custom closet and home-organization service for Austin residents planning better storage, move-ins, or a home reset.",
    description: "This is the Inspired Closets Austin service listing. The resident consult perk is a separate map pin so the brand listing never borrows property content.",
    deals_offers: "Resident consult perk available",
    primaryAction: "View Consult Perk",
    secondaryAction: "Save Service",
    campaignObjective: "Keep the service listing clear while routing live resident offers to the dedicated consult perk.",
    partnerInsight: "Strongest around move-in packets, lobby QR placements, seasonal home resets, and premium tower audiences.",
    audience: "Downtown residents, relocation prospects, property teams, and homeowners planning a home upgrade.",
    image: "/images/imported/perks/prospective-residents-walking-through-the-neighborhood.png",
    related: ["perk-inspired-closets-move-in", "priority-the-waterline", "property-the-shore"],
    mapLayer: "Inspired Closets Austin",
    datasetLayer: "Inspired Closets Austin",
    tags: ["Inspired Closets Austin", "Residential Services", "Move-In", "Home Organization", "Closet Systems", "Congress"],
    source: "Downtown Perks brand partner layer",
  },
  {
    id: "lululemon-waterloo-run-club-activation",
    name: "Lululemon Waterloo Run Club",
    type: "brand",
    partnerType: "brand",
    brand: "Lululemon",
    pinKey: "lululemon",
    category: "Brand / Fitness Activation",
    category_key: "brand_activation lululemon fitness run_club waterloo",
    latitude: 30.27318,
    longitude: -97.73586,
    district: "Waterloo",
    address: "Waterloo Park, Austin, TX 78701",
    summary: "A real run-club activation anchored to Waterloo Park, nearby residents, and wellness-oriented downtown routines.",
    description: "Lululemon appears in the map as a fitness moment residents can actually join: run-club discovery, event saves, and nearby post-run offers.",
    deals_offers: "Resident run-club RSVP and recovery offer",
    campaignObjective: "Turn wellness intent into RSVPs, visits, and repeat downtown routines.",
    partnerInsight: "Best around weekday mornings, Saturday runs, and post-work wellness windows.",
    audience: "Residents, fitness users, hotel guests, and downtown workers.",
    image: "/images/imported/perks/running-on-trail.png",
    tags: ["Lululemon", "Run Club", "Waterloo", "Fitness", "Wellness"],
    source: "Downtown Perks brand partner layer",
  },
  {
    id: "four-seasons-congress-guest-dining-campaign",
    name: "Four Seasons Guest Dining Campaign",
    type: "hotel",
    partnerType: "hotel",
    brand: "Four Seasons",
    pinKey: "four-seasons",
    category: "Hotel / Guest Activation",
    category_key: "hotel_hospitality brand_activation four_seasons dining_spa_guest",
    latitude: 30.2607,
    longitude: -97.7414,
    district: "Congress",
    address: "98 San Jacinto Blvd, Austin, TX 78701",
    summary: "Guest orientation campaign that connects hotel stays to walkable dining, spa access, events, and downtown perks.",
    description: "Four Seasons is plotted as an in-situ hospitality activation so guests and nearby residents can discover what to do before dinner, after check-in, or around Congress Avenue events.",
    deals_offers: "Guest and resident dining-spa access",
    campaignObjective: "Extend the stay beyond the lobby and convert nearby intent into walkable plans.",
    partnerInsight: "Strongest after check-in, before dinner, and around Congress Avenue event nights.",
    audience: "Hotel guests, residents, visiting friends, and downtown event audiences.",
    image: "/images/imported/perks/four-seasons-resi.jpg",
    tags: ["Four Seasons", "Hotel", "Guest", "Dining", "Spa", "Congress"],
    source: "Downtown Perks brand partner layer",
  },
  {
    id: "stay-put-rainey-live-venue-layer",
    name: "The Stay Put Live Venue Layer",
    type: "venue",
    partnerType: "venues",
    brand: "The Stay Put",
    pinKey: "nightlife",
    category: "Venue / Live Activation",
    category_key: "brand_activation venue live_activation stay_put rainey happy_hour music trivia nightlife",
    latitude: 30.2592,
    longitude: -97.7382,
    district: "Rainey",
    address: "73 Rainey St, Austin, TX 78701",
    summary: "A real-time Rainey venue layer for happy hour, live programming, trivia nights, and where-to-go-next decisions.",
    description: "Stay Put appears when people nearby are choosing drinks, music, dinner, or the next stop. The venue can connect a live reason to visit with saves, directions, and redemptions.",
    deals_offers: "Resident happy hour and live-night offer",
    primaryAction: "Save Tonight",
    secondaryAction: "Get Directions",
    campaignObjective: "Turn nearby intent into visits by surfacing the right reason to go now.",
    partnerInsight: "Strongest after work, before nearby shows, after dinner, and later in the night when people are choosing one more stop.",
    audience: "Residents, hotel guests, live-music crowds, Rainey visitors, and nearby groups.",
    image: "/images/map-entities/rainey-bars/stay-put-jazz.jpeg",
    related: ["event-monday-meetups-stay-put", "partner-hotel-van-zandt", "partner-half-step", "partner-bangers"],
    mapLayer: "The Stay Put",
    datasetLayer: "The Stay Put",
    tags: ["The Stay Put", "Rainey", "Happy Hour", "Live Music", "Trivia", "Venue"],
    source: "Downtown Perks brand partner layer",
  },
  {
    id: "waterline-flagship-property-layer",
    name: "The Waterline",
    type: "property",
    partnerType: "property",
    brand: "The Waterline",
    pinKey: "property",
    category: "Property / Flagship Layer",
    category_key: "brand_activation property flagship waterline rainey arrival residential office hotel retail",
    latitude: 30.2598,
    longitude: -97.7394,
    district: "Rainey",
    address: "98 Red River St, Austin, TX 78701",
    summary: "A flagship property layer connecting arrival, resident value, nearby recommendations, and premium downtown context.",
    description: "The Waterline extends the building experience into the city around it: residents and guests can see what matters nearby, save plans, and move from the property into downtown activity.",
    deals_offers: "Resident and guest welcome layer",
    primaryAction: "Open Property Layer",
    secondaryAction: "Save Building",
    campaignObjective: "Use the property as a premium starting point for local discovery, QR entry, and measured resident engagement.",
    partnerInsight: "Strongest around arrival, resident onboarding, guest orientation, nearby dining, and Rainey district activity.",
    audience: "Residents, guests, prospects, property teams, office users, and hospitality partners.",
    image: "/images/imported/perks/waterline-hero.webp",
    related: ["event-waterline-preview", "partner-emmer-rye", "partner-hotel-van-zandt", "property-the-shore"],
    mapLayer: "The Waterline",
    datasetLayer: "The Waterline",
    tags: ["The Waterline", "Rainey", "Property", "Arrival", "Resident Value", "Hospitality"],
    source: "Downtown Perks brand partner layer",
  },
  {
    id: "inkind-downtown-dining-market",
    name: "inKind Downtown Dining Market",
    type: "brand",
    partnerType: "inkind",
    brand: "inKind",
    pinKey: "inkind",
    category: "Dining / inKind Market",
    category_key: "inkind dining market partner_activation restaurant_credit",
    latitude: 30.26678,
    longitude: -97.74492,
    district: "Warehouse District",
    address: "Downtown Austin, TX 78701",
    summary: "Dining value layer connecting restaurants, resident saves, happy hour moments, and payment-linked inKind utility.",
    description: "inKind is embedded as a downtown dining market, not a theoretical partner profile: residents discover nearby restaurant value and partners see where dining intent is clustering.",
    deals_offers: "Resident dining value at participating restaurants",
    campaignObjective: "Move dining intent into saves, visits, and restaurant value redemption.",
    partnerInsight: "Strongest before dinner, happy hour, and hotel guest dining decisions.",
    audience: "Residents, hotel guests, office workers, and dinner planners.",
    image: "/images/map-entities/dining/outdoor-dining-arrival.avif",
    tags: ["inKind", "Dining", "Restaurants", "Happy Hour", "Perks"],
    source: "Downtown Perks brand partner layer",
  },
  {
    id: "legends-real-estate-downtown-austin",
    name: "Legends Real Estate",
    type: "brand",
    partnerType: "brand",
    brand: "Legends Real Estate",
    pinKey: "legends",
    category: "Brand / Real Estate",
    category_key: "brand_real_estate legends listings mls",
    latitude: 30.2655,
    longitude: -97.74618,
    district: "2nd Street",
    address: "2nd Street District, Austin, TX 78701",
    summary: "Want to live here? Browse downtown listings, see what is nearby, and ask Legends Real Estate for showing options when an address feels like a fit.",
    description: "Legends is embedded as a real property-led downtown layer: listing views, building context, tour planning, neighborhood utility, and leasing story all connect through the map.",
    deals_offers: "MLS-backed downtown listing discovery",
    primaryAction: "View Listings",
    secondaryAction: "Ask Legends",
    campaignObjective: "Turn building and neighborhood interest into listing views, showing requests, and property-linked local discovery.",
    partnerInsight: "Best when prospects compare the building and the block together: nearby dining, events, perks, and daily utility.",
    audience: "Relocation prospects, downtown renters, buyers, residents, and hotel guests considering a move.",
    image: "/pins/downtown-perks/legends-logo-gold.svg",
    related: ["priority-the-waterline", "priority-the-independent", "priority-the-austonian", "property-the-shore"],
    mapLayer: "Legends",
    datasetLayer: "Legends",
    tags: ["Legends", "Listings", "MLS", "Real Estate"],
    source: "Downtown Perks brand partner layer",
  },
];

const civicLayerPlaces = [
  {
    id: "downtown-austin-alliance-civic-layer",
    name: "Downtown Austin Alliance",
    type: "civic",
    partnerType: "civic",
    category: "Civic / Downtown Austin Alliance",
    category_key: "civic daa downtown_austin_alliance art_walk public_realm activation",
    markerType: "standard",
    detailDrawerType: "civic",
    pinKey: "civic",
    latitude: 30.26798,
    longitude: -97.74734,
    district: "Republic Square",
    address: "Downtown Austin, TX 78701",
    summary: "Civic partner layer for downtown art walks, public realm stops, wayfinding, and district activations.",
    description: "The DAA layer connects Art & Parks Tour stops, plazas, public art, and downtown civic campaigns into the shared map.",
    offer: "Infrastructure & Public Realm Updates",
    perk: {
      title: "Infrastructure & Public Realm Updates",
      value: "Downtown civic updates",
      description: "The DAA perk gives residents a civic-update layer for public realm improvements, downtown routes, event context, bike lanes, and parks-connected mobility.",
      terms: "Save it to keep civic updates and downtown route context close by.",
      isActive: true,
    },
    tags: ["DAA", "Art Walk", "Civic", "Public Realm", "Downtown Austin Alliance"],
    videos: [
      { title: "DAA Art Walk", label: "Public art route", src: "/videos/partners/civic/daa-art-walk.mp4" },
      { title: "Welcome to Downtown", label: "Downtown event context", src: "/videos/partners/civic/daa-welcome-to-downtown-event.mp4" },
      { title: "Bike Lanes", label: "Mobility and public realm", src: "/videos/partners/civic/daa-bike-lanes.mp4" },
      { title: "Waterloo Loop", label: "Connected civic route", src: "/videos/partners/civic/daa-waterloo-loop.mp4" },
    ],
    image: "/images/imported/perks/daa-campaign.png",
    source: "Downtown Perks civic layer",
  },
  {
    id: "downtown-austin-neighborhood-association",
    name: "Downtown Austin Neighborhood Association",
    type: "civic",
    partnerType: "civic",
    category: "Civic / DANA",
    category_key: "civic dana downtown_austin_neighborhood_association resident_voice neighborhood",
    markerType: "standard",
    detailDrawerType: "civic",
    pinKey: "dana",
    latitude: 30.26672,
    longitude: -97.74418,
    district: "Downtown Core",
    address: "Downtown Austin, TX 78701",
    shortDescription: "DANA connects downtown residents, businesses, and civic partners around the issues that shape daily life in Austin's urban core.",
    fullDescription: "The Downtown Austin Neighborhood Association helps residents stay connected to what is happening downtown - from public space improvements and safety conversations to local events, neighborhood advocacy, and civic participation.",
    whyItMatters: "For residents, DANA is the civic layer behind a more useful downtown: better information, stronger neighborhood participation, and clearer ways to support the places and public spaces around them.",
    bestFor: "Neighborhood advocacy, civic participation, public-space updates, resident programs, and downtown storytelling.",
    residentAction: "Use DANA as a starting point for discovering nearby civic moments, neighborhood walks, public spaces, local events, and resident-facing programs.",
    partnerAction: "Pair DANA with campaigns that support resident engagement, downtown discovery, public space activation, neighborhood storytelling, and civic participation.",
    nearbyContext: "Nearby anchors such as Republic Square, Mexic-Arte Museum, Downtown Stories Walk, Truluck's, and inKind dining partners give DANA a strong resident discovery corridor in the Downtown Core.",
    campaignOpportunity: "Launch a resident civic discovery route that connects public spaces, local dining, cultural stops, and neighborhood participation moments.",
    suggestedPairings: ["Republic Square", "Mexic-Arte Museum", "Downtown Stories Walk", "Truluck's", "inKind dining partners"],
    reportingSummary: "Track saves, directions, civic route opens, event interest, and partner campaign engagement around DANA-connected downtown activity.",
    primaryCTA: "Explore nearby",
    secondaryCTA: "Create civic campaign",
    summary: "DANA connects downtown residents, businesses, and civic partners around the issues that shape daily life in Austin's urban core.",
    description: "The Downtown Austin Neighborhood Association helps residents stay connected to what is happening downtown - from public space improvements and safety conversations to local events, neighborhood advocacy, and civic participation.",
    tags: ["DANA", "Residents", "Civic", "Neighborhood", "Advocacy", "Public Space"],
    image: "/images/imported/perks/austin-downtown.jpg",
    source: "Downtown Perks civic layer",
  },
  {
    id: "waterloo-greenway-civic-campaign-hub",
    name: "Waterloo Greenway Campaign Hub",
    type: "civic",
    partnerType: "civic",
    category: "Civic / Waterloo Greenway",
    category_key: "civic waterloo_greenway campaign activation plot public_realm",
    markerType: "event",
    detailDrawerType: "civic-activation",
    pinKey: "civic",
    latitude: 30.27391,
    longitude: -97.73543,
    district: "Waterloo",
    address: "500 E 12th St, Austin, TX 78701",
    summary: "Waterloo Greenway campaign hub for activations, event zones, sponsor placements, and public realm programming.",
    description: "This layer combines Waterloo Greenway campaigns, activation plots, event zones, and civic programming opportunities in one map view.",
    tags: ["Waterloo Greenway", "Campaigns", "Activations", "Plots", "DAA"],
    image: "/images/map-entities/attached/civic/waterloo-park.jpeg",
    source: "Downtown Perks civic layer",
  },
  {
    id: "waterloo-greenway-activation-plot-great-lawn",
    name: "Waterloo Greenway Great Lawn Plot",
    type: "brand",
    partnerType: "civic",
    category: "Activation Plot / Waterloo Greenway",
    category_key: "civic waterloo_greenway activation_plot great_lawn campaign",
    markerType: "event",
    detailDrawerType: "civic-activation",
    pinKey: "civic",
    latitude: 30.27334,
    longitude: -97.73515,
    district: "Waterloo",
    address: "Waterloo Park Great Lawn, Austin, TX 78701",
    summary: "Activation plot for sponsor moments, public programming, food, music, and civic campaign visibility.",
    description: "A Waterloo Greenway plot that can host event-linked partner activations and public realm campaign moments.",
    tags: ["Waterloo Greenway", "Great Lawn", "Activation Plot", "Campaigns"],
    image: "/images/imported/perks/03-waterloo-park.jpg",
    source: "Downtown Perks civic layer",
  },
  {
    id: "waterloo-greenway-activation-plot-moody",
    name: "Moody Amphitheater Activation Plot",
    type: "brand",
    partnerType: "civic",
    category: "Activation Plot / Waterloo Greenway",
    category_key: "civic waterloo_greenway activation_plot moody_amphitheater event_campaign",
    markerType: "event",
    detailDrawerType: "civic-activation",
    pinKey: "civic",
    latitude: 30.27378,
    longitude: -97.73555,
    district: "Waterloo",
    address: "Moody Amphitheater, Austin, TX 78701",
    summary: "Event-adjacent activation plot for audiences arriving at concerts, civic events, and Waterloo programming.",
    description: "A campaign-ready activation plot connected to Moody Amphitheater audiences and Waterloo Greenway event flow.",
    tags: ["Moody Amphitheater", "Waterloo Greenway", "Activation Plot", "Events"],
    image: "/images/map-entities/perks/moody_theater_live_music_1779052684229.png",
    source: "Downtown Perks civic layer",
  },
];

const CORE_LOCATION_CATEGORY_KEYS = new Set([
  "bar_nightlife",
  "coffee_cafe",
  "hotel_hospitality",
  "other_relevant",
  "parking",
  "parking_lot",
  "parking_garage",
  "residential_property",
  "restaurant_food",
  "retail_business",
  "wellness_recreation",
]);

const EXCLUDED_MAP_LOCATION_OSM_IDS = new Set([
  134807223, // Lakeside Apartmments - removed from Downtown Perks map inventory.
]);

const WATERLOO_COORDS = {
  "waterloo-park": [30.27391, -97.73543],
  "moody-amphitheater": [30.27378, -97.73555],
  "great-lawn": [30.27334, -97.73515],
  "waller-creek-trail": [30.27412, -97.73475],
  "hill-country-garden": [30.27378, -97.73496],
  "family-pavilion": [30.27436, -97.73512],
  "waterloo-event-zones": [30.27356, -97.73568],
};

function resolveWaterlooImage(imageName, fallback = "/images/map-entities/attached/civic/waterloo-park.jpeg") {
  if (!imageName) return fallback;
  return String(imageName).startsWith("/") ? imageName : `/images/waterloo/${imageName}`;
}

function waterlooInventoryPlace(pin) {
  const coords = WATERLOO_COORDS[pin.id] || [pin.lat, pin.lng];
  const image = resolveWaterlooImage(pin.imageAssets.thumbnail || pin.imageAssets.heroImage);
  return {
    id: pin.id,
    name: pin.name,
    type: pin.kind === "destination" || pin.kind === "experience" ? "venue" : "event",
    partnerType: pin.kind === "partner-placement" ? "brands" : "venues",
    category: `${pin.category} / Waterloo Park`,
    category_key: ["waterloo park", pin.kind, pin.category, ...(pin.subCategories || []), ...(pin.tags || [])].join(" ").toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    markerType: pin.kind === "event" ? "event" : pin.category === "Parks" ? "standard" : "event",
    detailDrawerType: pin.kind,
    pinKey: pin.category === "Parks" ? "park" : pin.category === "Live Music" ? "event" : undefined,
    latitude: coords?.[0],
    longitude: coords?.[1],
    district: pin.district,
    address: pin.address || "Waterloo Park, Austin, TX 78701",
    summary: pin.description,
    description: pin.description,
    drawerCopy: pin.drawerCopy,
    tags: pin.tags,
    image,
    waterlooPin: pin,
    isWaterlooPark: true,
    source: "Downtown Perks Waterloo Park inventory",
  };
}

function waterlooCampaignPlace(pin, index) {
  const latOffset = (index % 5) * 0.00011;
  const lngOffset = (index % 4) * 0.00012;
  return {
    id: pin.id,
    name: pin.name,
    type: pin.kind === "event" ? "event" : "brand",
    partnerType: pin.kind === "event" ? "venues" : "brands",
    category: `${pin.category} / Waterloo Park`,
    category_key: ["waterloo park", pin.kind, pin.category, "campaign event partner placement"].join(" ").toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    markerType: pin.kind === "event" ? "event" : "brand",
    detailDrawerType: pin.kind,
    latitude: 30.2737 + latOffset,
    longitude: -97.7353 - lngOffset,
    district: pin.district,
    address: "Waterloo Park, Austin, TX 78701",
    summary: pin.description,
    description: pin.description,
    drawerCopy: pin.campaignCardCopy,
    tags: [pin.category, "Waterloo Park", "Events", "Partner Placement"],
    image: resolveWaterlooImage(pin.imageRequirement, "/images/imported/perks/waterlook-greenway.png"),
    waterlooCampaignPin: pin,
    isWaterlooPark: true,
    rsvp_count: pin.kind === "event" ? 42 + index : undefined,
    source: "Downtown Perks Waterloo Park campaign inventory",
  };
}

function daaTourStopPlace(stop) {
  return {
    id: stop.id,
    name: stop.displayName || stop.name,
    type: "civic",
    partnerType: "civic",
    category: `${stop.category} / DAA Art & Parks Tour`,
    category_key: ["civic", "daa", "art", "parks", "tour", stop.category, stop.district].join(" ").toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    markerType: "standard",
    detailDrawerType: "daa-art-parks-tour",
    pinKey: "civic",
    latitude: stop.coordinates.lat,
    longitude: stop.coordinates.lng,
    district: stop.district,
    address: stop.address,
    summary: stop.popupCopy,
    description: stop.description,
    drawerCopy: stop.daaIntro,
    image: stop.imageUrl,
    daaTourStop: stop,
    isDaaArtParksTour: true,
    source: "Downtown Austin Alliance Art & Parks Tour",
  };
}

function slugPart(value, fallback = "place") {
  const cleaned = String(value || fallback)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || fallback;
}

function stableRawLocationId(item, index) {
  if (item.id) return item.id;
  const name = slugPart(item.name, `place-${index}`);
  if (item.osm_id) return `${name}-${item.osm_type || "osm"}-${item.osm_id}`;
  const latitude = Number(item.latitude);
  const longitude = Number(item.longitude);
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return `${name}-${latitude.toFixed(5)}-${longitude.toFixed(5)}`;
  }
  return `${name}-${index}`;
}

function isCoreMapLocation(item) {
  const source = String(item.source || "").toLowerCase();

  if (!source.includes("openstreetmap")) return true;
  return CORE_LOCATION_CATEGORY_KEYS.has(String(item.category_key || "").toLowerCase());
}

function isExcludedMapLocation(item) {
  const osmId = Number(item.osm_id);
  if (Number.isFinite(osmId) && EXCLUDED_MAP_LOCATION_OSM_IDS.has(osmId)) return true;
  const name = String(item.name || item.title || "").trim().toLowerCase();
  if (name === "lakeside apartmments") return true;
  if (name === "the shore" && String(item.id || "").toLowerCase() !== "property-the-shore") return true;
  return false;
}

function normalizedLocationKey(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function coordinatesAreClose(a, b) {
  if (!a || !b) return false;
  const latDelta = Math.abs(Number(a.latitude) - Number(b.latitude));
  const lngDelta = Math.abs(Number(a.longitude) - Number(b.longitude));
  return latDelta <= 0.0014 && lngDelta <= 0.0014;
}

function dedupeNormalizedLocations(entities) {
  const accepted = [];
  const exactKeys = new Set();

  entities.forEach((entity) => {
    const nameKey = normalizedLocationKey(entity.name);
    const isDaaArtParksStop = String(entity.id || "").startsWith("daa-stop-") || Boolean(entity.isDaaArtParksTour || entity.daaTourStop);
    const exactKey = entity.portfolioEntityId || [
      nameKey,
      Number(entity.latitude).toFixed(5),
      Number(entity.longitude).toFixed(5),
      isDaaArtParksStop ? entity.id : "",
    ].join("|");
    const isRepublicImport = entity.raw?.source === "Republic Austin" || entity.source === "Republic Austin";

    if (exactKeys.has(exactKey)) return;

    if (
      isRepublicImport &&
      accepted.some((existing) => normalizedLocationKey(existing.name) === nameKey && coordinatesAreClose(existing, entity))
    ) {
      return;
    }

    exactKeys.add(exactKey);
    accepted.push(entity);
  });

  return accepted;
}

export function buildLocations() {
  const happyHourPlaces = getHappyHourPlaces();
  const waterlooPlaces = [
    ...waterlooParkInventory.map(waterlooInventoryPlace),
    ...waterlooParkCampaignPins.map(waterlooCampaignPlace),
  ];
  const daaPlaces = daaTourStops.map(daaTourStopPlace);
  const republicAustinPlaces = getRepublicAustinMapPlaces();
  const canonicalGoogleRegistryPlaces = getActiveMapEntityLocations();
  const parkingPlaces = downtownParkingItems.filter((item) => item.active).map(parkingBookingPlace);
  const attachedHappyHourPerkPlaces = ATTACHED_HAPPY_HOUR_PERK_LOCATIONS.map(attachedHappyHourPerkPlace);
  const attachedRailMigratedPlaces = ATTACHED_RAIL_MIGRATED_LOCATIONS
    .filter(isProductionReadyRailMigratedLocation)
    .map(attachedSupplementalPlace);
  const attachedSupplementalPlaces = ATTACHED_SUPPLEMENTAL_DOWNTOWN_LOCATIONS.map(attachedSupplementalPlace);
  const attachedLegendsPropertyPlaces = ATTACHED_LEGENDS_IMPORTED_PROPERTIES.map(attachedLegendsPropertyPlace);
  const attachedFeaturedBrandPlaces = ATTACHED_FEATURED_BRANDS.map(attachedFeaturedBrandPlace);
  const rentalPlaces = rentalListings.filter((item) => item.status === "active").map(rentalListingPlace);

  const coreOpenMapLocations = data.filter((item) => isCoreMapLocation(item) && !isExcludedMapLocation(item));

  const normalizedLocations = [...dunlapPortfolioEntities, ...hospitalityOperatorPortfolioEntities, ...larryAndGuyRestaurantLayer, ...coreOpenMapLocations, ...eventPlaces, ...mapNativeCampaigns, ...buildingAmenityNetworkEntities, ...brandPartnerPlaces, ...attachedFeaturedBrandPlaces, ...launchMapPinPlaces, ...civicDiscoveryEntities, ...civicLayerPlaces, ...luxuryPresenceBuildingPlaces, ...legendsListingPlaces, ...attachedLegendsPropertyPlaces, ...rentalPlaces, ...supplementalMapEntities, ...attachedSupplementalPlaces, ...attachedRailMigratedPlaces, ...canonicalGoogleRegistryPlaces, ...republicAustinPlaces, ...parkingPlaces, ...happyHourPlaces, ...attachedHappyHourPerkPlaces, ...waterlooPlaces, ...daaPlaces]
    .filter((item) => !isExcludedMapLocation(item))
    .filter((item) => item.launchMapPin || isDowntownAustin78701Entity(item) || item.source === "User-provided rail card migration" || item.isDaaArtParksTour || item.partnerType === "civic" || item.partnerType === "services" || item.pinKey === "civic")
    .map((item, i) => {
      const isVia313 = String(item.name || "").toLowerCase().includes("via 313");
      const isRoyalBlue = String(item.name || "").toLowerCase().includes("royal blue grocery");
      const isAntones = /\bantone'?s\b/i.test(`${item.name || ""} ${item.slug || item.id || ""}`);
      const isStAugustine = String(item.name || "").trim().toLowerCase() === "augustine";
      const downtownCoreRestaurantUpdate = getDowntownCoreRestaurantUpdate(item);
      const fourSeasonsExperienceUpdate = getFourSeasonsExperienceUpdate(item);
      const hospitalityCsvUpdate = getHospitalityCsvUpdate(item);
      const residentialMixedUseUpdate = getResidentialMixedUseUpdate(item);
      const normalizedItem = {
        ...item,
        ...(hospitalityCsvUpdate
          ? {
              ...hospitalityCsvUpdate,
              latitude: item.latitude ?? hospitalityCsvUpdate.latitude,
              longitude: item.longitude ?? hospitalityCsvUpdate.longitude,
              image: item.image || hospitalityCsvUpdate.image,
              heroImage: item.heroImage || item.image || hospitalityCsvUpdate.heroImage,
              raw: { ...(item.raw || {}), ...(hospitalityCsvUpdate.rawCsvRow || {}) },
            }
          : {}),
        ...(residentialMixedUseUpdate
          ? {
              ...residentialMixedUseUpdate,
              latitude: item.latitude ?? residentialMixedUseUpdate.latitude,
              longitude: item.longitude ?? residentialMixedUseUpdate.longitude,
              address: item.address || residentialMixedUseUpdate.address,
              image: residentialMixedUseUpdate.image || item.image,
              heroImage: residentialMixedUseUpdate.heroImage || residentialMixedUseUpdate.image || item.heroImage || item.image,
              raw: { ...(item.raw || {}), ...(residentialMixedUseUpdate.rawCsvRow || {}) },
            }
          : {}),
        id: stableRawLocationId(item, i),
        ...(isAntones
          ? {
              name: "Antone's Nightclub",
              title: "Antone's Nightclub",
              type: "venue",
              kind: "venue",
              partnerType: "venues",
              pinKey: "culture",
              category: "Live Music / Nightlife",
              category_key: "venue live_music nightlife bar_nightlife music_venue",
              district: "East Downtown",
              summary: "One of Austin's most recognized live music venues, with touring acts, local performances, and downtown nightlife.",
              alignment_to_downtown_perks: "Live music, late-night plans, and downtown show traffic for residents and visitors.",
              primaryAction: "Directions",
              secondaryAction: "Upcoming Events",
            }
          : {}),
        ...(isStAugustine
          ? {
              name: "St. Augustine",
              title: "St. Augustine",
              type: "venue",
              kind: "venue",
              partnerType: "venues",
              pinKey: "venue",
              category: "Venue / Nightlife",
              category_key: "venue nightlife bar_nightlife rainey",
              district: "Rainey",
              summary: "Rainey Street venue for drinks, patio time, and downtown night-out plans.",
              alignment_to_downtown_perks: "Rainey nightlife and walkable downtown discovery for residents, visitors, and event traffic.",
              primaryAction: "Directions",
              secondaryAction: "View Details",
            }
          : {}),
        ...(isVia313
          ? {
              category: "Pizza / Dining",
              category_key: "pizza_dining",
              summary: "Detroit-style pizza spot in downtown Austin.",
            }
          : {}),
        ...(isRoyalBlue
          ? {
              category: "Local Grocery",
              category_key: "local_grocery retail_business",
              summary: "Local downtown grocery stop for coffee, snacks, pantry basics, wine, and quick errands.",
              alignment_to_downtown_perks: "Resident grocery discounts and neighborhood shopping value for everyday downtown errands.",
              deals_offers: "Resident grocery discount when shopping in-store",
              specials: "Resident shopping value on groceries, coffee, snacks, pantry basics, wine, and quick downtown errands.",
            }
          : {}),
        ...(downtownCoreRestaurantUpdate || {}),
        ...(fourSeasonsExperienceUpdate || {}),
      };
      const governedItem = applyHospitalityOperatorGovernance(applyDunlapPortfolioGovernance(normalizedItem));
      const curatedItem = applyLaunchMapCuration(governedItem);
      const entity = normalizeEntity(enrichWithArchiveLocationContext(curatedItem), i);

      if (!entity) return null;

      return {
        ...entity,
        ...(curatedItem.amenityNetwork === "downtown-hospitality"
          ? {
              amenityNetwork: curatedItem.amenityNetwork,
              parentHotelId: curatedItem.parentHotelId,
              parentHotelName: curatedItem.parentHotelName,
              kind: curatedItem.kind,
              entityType: curatedItem.entityType,
              residentSummary: curatedItem.residentSummary,
              partnerSummary: curatedItem.partnerSummary,
              highlights: curatedItem.highlights,
              bestFor: curatedItem.bestFor,
              bookingUrl: curatedItem.bookingUrl,
              primaryAction: curatedItem.primaryAction,
              secondaryAction: curatedItem.secondaryAction,
              residentPanel: curatedItem.residentPanel,
              partnerPanel: curatedItem.partnerPanel,
              sourceUrl: curatedItem.sourceUrl,
              validThrough: curatedItem.validThrough,
              validThroughLabel: curatedItem.validThroughLabel,
              termsSummary: curatedItem.termsSummary,
              verificationStatus: curatedItem.verificationStatus,
              offerState: curatedItem.offerState,
              pinAssetPath: curatedItem.pinAssetPath,
            }
          : {}),
        ...(curatedItem.residentialContentSystem === "canonical-residential-mixed-use"
          ? {
              residentialContentSystem: curatedItem.residentialContentSystem,
              overview: curatedItem.overview,
              residentSummary: curatedItem.residentSummary,
              partnerSummary: curatedItem.partnerSummary,
              residentOverview: curatedItem.residentOverview,
              partnerOverview: curatedItem.partnerOverview,
              sharedAmenities: curatedItem.sharedAmenities,
              residentPerk: curatedItem.residentPerk,
              residentBenefits: curatedItem.residentBenefits,
              partnerValueNarrative: curatedItem.partnerValueNarrative,
              secretSauce: curatedItem.secretSauce,
              residentDifferentiator: curatedItem.residentDifferentiator,
              partnerDifferentiator: curatedItem.partnerDifferentiator,
              hiddenGems: curatedItem.hiddenGems,
              residentRoutines: curatedItem.residentRoutines,
              partnerActivationIdeas: curatedItem.partnerActivationIdeas,
              campaignAlignment: curatedItem.campaignAlignment,
              residentGoodFor: curatedItem.residentGoodFor,
              partnerCampaigns: curatedItem.partnerCampaigns,
              residentActions: curatedItem.residentActions,
              partnerActions: curatedItem.partnerActions,
              residentContextLabels: curatedItem.residentContextLabels,
              partnerContextLabels: curatedItem.partnerContextLabels,
              sourceUrl: curatedItem.sourceUrl,
              sourceLabel: curatedItem.sourceLabel,
              verificationStatus: curatedItem.verificationStatus,
              residentDisclosure: curatedItem.residentDisclosure,
              partnerDisclosure: curatedItem.partnerDisclosure,
              operatingStatus: curatedItem.operatingStatus,
              pinAssetPath: curatedItem.pinAssetPath,
              image: curatedItem.image,
              heroImage: curatedItem.heroImage,
              galleryImages: curatedItem.galleryImages,
            }
          : {}),
        ...(downtownCoreRestaurantUpdate
          ? {
              shortTitle: downtownCoreRestaurantUpdate.shortTitle,
              summary: downtownCoreRestaurantUpdate.summary,
              description: downtownCoreRestaurantUpdate.description,
              subcategory: downtownCoreRestaurantUpdate.subcategory,
              neighborhood: downtownCoreRestaurantUpdate.neighborhood,
              priceLabel: downtownCoreRestaurantUpdate.priceLabel,
              imageUrl: downtownCoreRestaurantUpdate.imageUrl,
              imageStrategy: downtownCoreRestaurantUpdate.imageStrategy,
              imageSourceUrl: downtownCoreRestaurantUpdate.imageSourceUrl,
              secondaryImageSourceUrl: downtownCoreRestaurantUpdate.secondaryImageSourceUrl,
              perk: downtownCoreRestaurantUpdate.perk,
              hasPerk: downtownCoreRestaurantUpdate.hasPerk,
              deals_offers: downtownCoreRestaurantUpdate.deals_offers,
              specials: downtownCoreRestaurantUpdate.specials,
              terms: downtownCoreRestaurantUpdate.terms,
              offer: downtownCoreRestaurantUpdate.offer,
              cardEyebrow: downtownCoreRestaurantUpdate.cardEyebrow,
              cardTitle: downtownCoreRestaurantUpdate.cardTitle,
              cardDescription: downtownCoreRestaurantUpdate.cardDescription,
              drawerHeadline: downtownCoreRestaurantUpdate.drawerHeadline,
              drawerBody: downtownCoreRestaurantUpdate.drawerBody,
              bestFor: downtownCoreRestaurantUpdate.bestFor,
              primaryAction: downtownCoreRestaurantUpdate.primaryAction,
              secondaryAction: downtownCoreRestaurantUpdate.secondaryAction,
              tags: downtownCoreRestaurantUpdate.tags,
              searchKeywords: downtownCoreRestaurantUpdate.searchKeywords,
              residentSearchIntents: downtownCoreRestaurantUpdate.residentSearchIntents,
              residentDrawer: downtownCoreRestaurantUpdate.residentDrawer,
              raw: {
                ...entity.raw,
                ...downtownCoreRestaurantUpdate,
              },
            }
          : {}),
        ...(fourSeasonsExperienceUpdate
          ? {
              shortTitle: fourSeasonsExperienceUpdate.shortTitle,
              summary: fourSeasonsExperienceUpdate.summary,
              description: fourSeasonsExperienceUpdate.description,
              subcategory: fourSeasonsExperienceUpdate.subcategory,
              neighborhood: fourSeasonsExperienceUpdate.neighborhood,
              imageUrl: fourSeasonsExperienceUpdate.imageUrl,
              cardEyebrow: fourSeasonsExperienceUpdate.cardEyebrow,
              cardTitle: fourSeasonsExperienceUpdate.cardTitle,
              cardDescription: fourSeasonsExperienceUpdate.cardDescription,
              drawerHeadline: fourSeasonsExperienceUpdate.drawerHeadline,
              whyResidentsSaveThis: fourSeasonsExperienceUpdate.whyResidentsSaveThis,
              whyItMatters: fourSeasonsExperienceUpdate.whyItMatters,
              includedExperiences: fourSeasonsExperienceUpdate.includedExperiences,
              whatYouMightUnlock: fourSeasonsExperienceUpdate.whatYouMightUnlock,
              includedCategories: fourSeasonsExperienceUpdate.includedCategories,
              goodToKnow: fourSeasonsExperienceUpdate.goodToKnow,
              bestFor: fourSeasonsExperienceUpdate.bestFor,
              localInsight: fourSeasonsExperienceUpdate.localInsight,
              nearbyHighlights: fourSeasonsExperienceUpdate.nearbyHighlights,
              residentQuestions: fourSeasonsExperienceUpdate.residentQuestions,
              relatedExperiences: fourSeasonsExperienceUpdate.relatedExperiences,
              included: fourSeasonsExperienceUpdate.included,
              primaryAction: fourSeasonsExperienceUpdate.primaryAction,
              secondaryAction: fourSeasonsExperienceUpdate.secondaryAction,
              tertiaryAction: fourSeasonsExperienceUpdate.tertiaryAction,
              tags: fourSeasonsExperienceUpdate.tags,
              searchKeywords: fourSeasonsExperienceUpdate.searchKeywords,
              residentSearchIntents: fourSeasonsExperienceUpdate.residentSearchIntents,
              analytics: fourSeasonsExperienceUpdate.analytics,
              raw: {
                ...entity.raw,
                ...fourSeasonsExperienceUpdate,
              },
            }
          : {}),
        ...(curatedItem.launchMapPin
          ? {
              sourceType: curatedItem.sourceType,
              markerType: curatedItem.markerType,
              detailDrawerType: curatedItem.detailDrawerType,
              detailEntityType: curatedItem.detailEntityType,
              portfolioId: curatedItem.portfolioId,
              portfolio: curatedItem.portfolio,
              operatingStatus: curatedItem.operatingStatus,
              verificationStatus: curatedItem.verificationStatus,
              publicationStatus: curatedItem.publicationStatus,
              mapVisibility: curatedItem.mapVisibility,
              pinKey: curatedItem.pinKey,
              partnerType: curatedItem.partnerType,
              category: curatedItem.category,
              summary: curatedItem.summary,
              description: curatedItem.description,
              alignment_to_downtown_perks: curatedItem.alignment_to_downtown_perks,
              deals_offers: curatedItem.deals_offers,
              specials: curatedItem.specials,
              hasPerk: curatedItem.hasPerk,
              hasPerkPotential: curatedItem.hasPerkPotential,
              perk: curatedItem.perk,
              offer: curatedItem.offer,
              campaignName: curatedItem.campaignName,
              campaignType: curatedItem.campaignType,
              campaignCopy: curatedItem.campaignCopy,
              collection: curatedItem.collection,
              mapCardCta: curatedItem.mapCardCta,
              qrPromptCopy: curatedItem.qrPromptCopy,
              proofMetrics: curatedItem.proofMetrics,
              primaryAction: curatedItem.primaryAction,
              secondaryAction: curatedItem.secondaryAction,
              tags: curatedItem.tags,
              searchKeywords: curatedItem.searchKeywords,
              launchMapPin: true,
              launchPinType: curatedItem.launchPinType,
              publicCategory: curatedItem.publicCategory,
              hasExactMarker: curatedItem.hasExactMarker,
              ...(curatedItem.hasExactMarker === false
                ? {
                    lat: undefined,
                    lng: undefined,
                    latitude: undefined,
                    longitude: undefined,
                    coords: [],
                  }
                : {}),
              raw: curatedItem.raw,
            }
          : {}),
        category_key: curatedItem.category_key,
      };
    })
    .filter(Boolean)
    .map((entity) => applyHospitalityOperatorGovernance(applyDunlapPortfolioGovernance(entity)))
    .filter((entity) => entity.portfolioId !== "dunlap-atx" || entity.kind === "portfolio" || entity.publicationStatus === "published");

  return dedupeNormalizedLocations(normalizedLocations);
}

export function useLocations() {
  const [happyHoursVersion, setHappyHoursVersion] = useState(0);

  useEffect(() => {
    function updateHappyHours() {
      setHappyHoursVersion((version) => version + 1);
    }

    window.addEventListener("storage", updateHappyHours);
    window.addEventListener("downtown-perks:happy-hours-updated", updateHappyHours);
    return () => {
      window.removeEventListener("storage", updateHappyHours);
      window.removeEventListener("downtown-perks:happy-hours-updated", updateHappyHours);
    };
  }, []);

  void happyHoursVersion;
  return buildLocations();
}
