import { useEffect, useState } from "react";
import data from "../data/locations.json";
import { luxuryPresenceBuildingPlaces } from "../data/luxuryPresenceInventory";
import { supplementalMapEntities } from "../data/supplementalMapEntities";
import { getRepublicAustinMapPlaces } from "../data/imports/republicAustinPins";
import { downtownParkingItems } from "../data/parkingBookings";
import { waterlooParkInventory } from "../data/waterlooParkInventory";
import { waterlooParkCampaignPins } from "../data/waterlooParkCampaignPins";
import { daaTourStops } from "../data/daaArtParksTour";
import { legendsListingPlaces } from "../data/legendsListings";
import { rentalListings } from "../data/rentalListings";
import { mapNativeCampaigns } from "../data/mapNativeCampaigns";
import { civicDiscoveryEntities } from "../data/civicDiscoveryNetwork";
import { getActiveMapEntityLocations } from "../data/map/mapEntityRegistry";
import { getDowntownCoreRestaurantUpdate } from "../data/downtownCoreRestaurantPerks";
import { getFourSeasonsExperienceUpdate } from "../data/fourSeasonsExperience";
import { getLegendsResidentialExperience } from "../data/legendsResidentialExperience";
import { getHappyHourPlaces } from "./happyHours";
import { enrichWithArchiveLocationContext } from "./archiveLocationContext";
import { isDowntownAustin78701Entity } from "./map/downtownAustinScope";
import { normalizeEntity } from "./map/normalizeEntity";

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
}) {
  return {
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
    category: "Legends Residential / Rental",
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

const eventPlaces = [
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
    image: "/images/imported/perks/hotel-van-zandt-2560x1570.webp",
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
    image: "/images/imported/perks/geraldine-s.jpg",
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
    summary: "Use your card at participating brunch spots and keep the plan simple: pick what is close, show the card, and sit down.",
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
    id: "rivian-downtown-austin-activation",
    name: "Rivian Seaholm Test Drive Activation",
    type: "brand",
    partnerType: "brand",
    brand: "Rivian",
    pinKey: "rivian",
    category: "Brand / Activation",
    category_key: "brand_activation rivian mobility ev test_drive seaholm",
    latitude: 30.26972,
    longitude: -97.75382,
    district: "Seaholm",
    address: "Seaholm District, Austin, TX 78701",
    summary: "In-situ EV test-drive moment for residents moving between Seaholm, Whole Foods, Trader Joe's, and the trail.",
    description: "Rivian appears on the map as a real downtown mobility activation: capture nearby intent, route residents to short test-drive windows, and connect interest to walkable lifestyle stops.",
    deals_offers: "Resident priority test-drive window",
    campaignObjective: "Convert nearby mobility interest into scheduled test drives.",
    partnerInsight: "Best around weekend mornings, after-work errands, and trail-adjacent movement near Seaholm.",
    audience: "Residents, hotel guests, weekend trail users, and EV-curious downtown workers.",
    image: "/images/imported/perks/rivian.png",
    tags: ["Rivian", "EV", "Mobility", "Seaholm", "Test Drive", "Brand Activation"],
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
    image: "/images/imported/perks/yeti-store.png",
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
    image: "/images/map-entities/brand-topo-chico/31tw6IrHhQS9baRQFmr48o0-yinZqraJtqI973LtxE3ZIBxLWF9vJgw2oWDFlUsRT0l4aSY-lcUuyykKFMQ4bT0hptW2DH7cW7WMVSSend9s0Jt-e3U8tO-bZO7j08bEDvsEdbf5dgWn04n83k7DxX2kwCou6pmD2AkYWxR0zKyHFAaRxkU0pSQ3MecifzGj.jpeg",
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
    partnerType: "brand",
    brand: "Inspired Closets Austin",
    pinKey: "service",
    category: "Service / Residential Activation",
    category_key: "service brand_activation inspired_closets home_organization move_in residential_services congress",
    latitude: 30.26472,
    longitude: -97.74456,
    district: "Congress",
    address: "Congress Avenue residential core, Austin, TX 78701",
    summary: "A residential services layer for move-in, storage, organization, and home-upgrade moments inside downtown buildings.",
    description: "Inspired Closets Austin is mapped where the need is real: high-rise living, move-ins, home resets, and premium residential routines.",
    deals_offers: "Resident design consult request",
    primaryAction: "Request Consult",
    secondaryAction: "Save Brand",
    campaignObjective: "Turn building-linked home-organization interest into qualified resident project requests.",
    partnerInsight: "Strongest around move-in packets, lobby QR placements, seasonal home resets, and premium tower audiences.",
    audience: "Downtown residents, relocation prospects, property teams, and homeowners planning a home upgrade.",
    image: "/images/imported/perks/prospective-residents-walking-through-the-neighborhood.png",
    related: ["priority-the-austonian", "property-the-shore", "priority-the-bowie", "priority-the-waterline"],
    mapLayer: "Inspired Closets Austin",
    datasetLayer: "Inspired Closets Austin",
    tags: ["Inspired Closets Austin", "Residential Services", "Move-In", "Home Organization", "Congress", "Property"],
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
    image: "/pins/downtown-perks/legends-logo.png",
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
    tags: ["DAA", "Art Walk", "Civic", "Public Realm", "Downtown Austin Alliance"],
    image: "/images/imported/perks/republic-square.jpg",
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
    summary: "Resident civic layer for neighborhood priorities, resident voice, and useful downtown feedback moments.",
    description: "DANA appears as a civic pin so residents can connect neighborhood needs, saved places, and everyday downtown movement.",
    tags: ["DANA", "Residents", "Civic", "Neighborhood", "Feedback"],
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
    description: "Use this layer to see Waterloo Greenway campaigns, activation plots, event zones, and civic programming opportunities together.",
    tags: ["Waterloo Greenway", "Campaigns", "Activations", "Plots", "DAA"],
    image: "/images/imported/perks/waterlook-trail.png",
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
    image: "/images/imported/perks/waterlook-greenway.png",
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
    image: "/images/imported/perks/hotel-van-zandt-first-thiursdays.png",
    source: "Downtown Perks civic layer",
  },
];

const CORE_LOCATION_CATEGORY_KEYS = new Set([
  "bar_nightlife",
  "coffee_cafe",
  "hotel_hospitality",
  "other_relevant",
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

function waterlooInventoryPlace(pin) {
  const coords = WATERLOO_COORDS[pin.id] || [pin.lat, pin.lng];
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
    image: `/images/waterloo/${pin.imageAssets.thumbnail || pin.imageAssets.heroImage || "waterloo-hero-aerial.jpg"}`,
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
    image: `/images/waterloo/${pin.imageRequirement}`,
    waterlooCampaignPin: pin,
    isWaterlooPark: true,
    rsvp_count: pin.kind === "event" ? 42 + index : undefined,
    source: "Downtown Perks Waterloo Park campaign inventory",
  };
}

function daaTourStopPlace(stop) {
  return {
    id: stop.id,
    name: stop.name,
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
    const exactKey = [
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

  const happyHourPlaces = getHappyHourPlaces();
  const waterlooPlaces = [
    ...waterlooParkInventory.map(waterlooInventoryPlace),
    ...waterlooParkCampaignPins.map(waterlooCampaignPlace),
  ];
  const daaPlaces = daaTourStops.map(daaTourStopPlace);
  const republicAustinPlaces = getRepublicAustinMapPlaces();
  const canonicalGoogleRegistryPlaces = getActiveMapEntityLocations();
  const parkingPlaces = downtownParkingItems.filter((item) => item.active).map(parkingBookingPlace);
  const rentalPlaces = rentalListings.filter((item) => item.status === "active").map(rentalListingPlace);
  void happyHoursVersion;

  const coreOpenMapLocations = data.filter((item) => isCoreMapLocation(item) && !isExcludedMapLocation(item));

  const normalizedLocations = [...coreOpenMapLocations, ...eventPlaces, ...mapNativeCampaigns, ...brandPartnerPlaces, ...civicDiscoveryEntities, ...civicLayerPlaces, ...luxuryPresenceBuildingPlaces, ...legendsListingPlaces, ...rentalPlaces, ...supplementalMapEntities, ...canonicalGoogleRegistryPlaces, ...republicAustinPlaces, ...parkingPlaces, ...happyHourPlaces, ...waterlooPlaces, ...daaPlaces]
    .filter((item) => !isExcludedMapLocation(item))
    .filter((item) => isDowntownAustin78701Entity(item) || item.isDaaArtParksTour || item.partnerType === "civic" || item.pinKey === "civic")
    .map((item, i) => {
      const isVia313 = String(item.name || "").toLowerCase().includes("via 313");
      const isRoyalBlue = String(item.name || "").toLowerCase().includes("royal blue grocery");
      const isStandardProof = String(item.name || "").toLowerCase().includes("standard proof whiskey");
      const isAntones = /\bantone'?s\b/i.test(`${item.name || ""} ${item.slug || item.id || ""}`);
      const isStAugustine = String(item.name || "").trim().toLowerCase() === "augustine";
      const downtownCoreRestaurantUpdate = getDowntownCoreRestaurantUpdate(item);
      const fourSeasonsExperienceUpdate = getFourSeasonsExperienceUpdate(item);
      const normalizedItem = {
        ...item,
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
              specials: "Show your Downtown Perks Card at checkout for resident shopping value.",
            }
          : {}),
        ...(isStandardProof
          ? {
              name: "Standard Proof Whiskey Co.",
              category: "Bar & Nightlife",
              category_key: "bar_nightlife whiskey_flights craft_cocktails rainey_legacy",
              type: "venue",
              partnerType: "venues",
              district: "Rainey",
              address: "51 Rainey Street, Austin, TX 78701",
              summary: "Whiskey, cocktails, and a slower pace at the edge of Rainey Street.",
              description: "A whiskey tasting room and cocktail lounge designed for people who appreciate good drinks, good conversation, and a slightly slower pace than the rest of Rainey Street.",
              neighborhood_narrative: "At the southern end of Rainey Street, Standard Proof sat between downtown's high-rise residential district and Lady Bird Lake. Residents could stop in for a cocktail before dinner, meet friends before a concert, or start a night out without the crowds often associated with the center of Rainey Street.",
              alignment_to_downtown_perks: "A quieter side of Rainey for date nights, after-work drinks, small group gatherings, and discovering something new before heading out downtown.",
              deals_offers: "Complimentary Whiskey Flight Upgrade",
              specials: "Purchase any whiskey flight and receive a premium flight upgrade or featured seasonal pour.",
              terms: "Subject to availability and partner participation.",
              perk: {
                title: "Complimentary Whiskey Flight Upgrade",
                value: "Premium flight upgrade or featured seasonal pour",
                description: "Purchase any whiskey flight and receive a premium flight upgrade or featured seasonal pour.",
                isActive: true,
              },
              knownFor: [
                "Whiskey flights",
                "Signature infused rye whiskies",
                "Craft cocktails",
                "Small group gatherings",
                "Pre-event drinks",
                "Date nights",
                "Resident meetups",
              ],
              nearby: ["Lady Bird Lake", "Hotel Van Zandt", "Rainey Street", "Convention Center", "Downtown Trail Network"],
              inventory_status: "Legacy Venue / Previously Featured Partner",
              inventory_status_note: "Standard Proof's Rainey Street tasting room is marked as a legacy venue because the company shifted focus to broader brand growth after the downtown location closed.",
              website: "https://www.standardproofwhiskey.com/rainey-street",
            }
          : {}),
        ...(downtownCoreRestaurantUpdate || {}),
        ...(fourSeasonsExperienceUpdate || {}),
      };
      const entity = normalizeEntity(enrichWithArchiveLocationContext(normalizedItem), i);

      if (!entity) return null;

      return {
        ...entity,
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
        category_key: normalizedItem.category_key,
      };
    })
    .filter(Boolean);

  return dedupeNormalizedLocations(normalizedLocations);
}
