export type EventHighlight = {
  id: string;
  title: string;
  venue: string;
  time: string;
  attendance: string;
  district: string;
  description: string;
};

export type PerkHighlight = {
  id: string;
  venue: string;
  offer: string;
  meta: string;
  summary: string;
};

export type BuildingHighlight = {
  id: string;
  name: string;
  district: string;
  year: string;
  summary: string;
  signals: string[];
};

export const residentStats = [
  ['Mapped venues', '1,600+', 'Coffee, restaurants, nightlife, wellness, and services in one layer.'],
  ['Active examples', '24', 'Perks and live offers residents can act on today.'],
  ['District coverage', '10', 'From Seaholm and 2nd Street to Rainey and Congress.'],
  ['Walk radius', '5 min', 'A practical neighborhood view instead of endless search results.'],
] as const;

export const partnerStats = [
  ['Buildings', '33', 'Residential and mixed-use properties represented inside the layer.'],
  ['Residences', '7,860+', 'A living audience tied to real addresses and daily routines.'],
  ['Venue touchpoints', '1,600+', 'What residents can actually use around each building.'],
  ['Pilot plans', '2', 'Venue and property pilots wired to the checkout flow.'],
] as const;

export const siteQuickLinks = [
  ['Resident app', '/resident-app', 'Open the live map, save perks, RSVP to events, and keep your card ready.'],
  ['Partner dashboard', '/partner-dashboard', 'Track what is driving activity near buildings and partner venues.'],
  ['Search', '/search', 'Ask the map direct questions and get grounded answers from the dataset.'],
  ['Events', '/events', 'See programming, timing, attendance, and what the neighborhood is doing next.'],
];

export const eventHighlights: EventHighlight[] = [
  {
    id: 'event-yoga',
    title: 'Morning Yoga at Waterloo Park',
    venue: 'Waterloo Park',
    time: 'Today · 7:30 AM',
    attendance: '28 / 40 going',
    district: 'Waterloo',
    description: 'A resident warm-up loop that turns nearby wellness into a simple daily habit.',
  },
  {
    id: 'event-rainey',
    title: 'Rainey Street Food + Drink Loop',
    venue: "Banger's Sausage House",
    time: 'Today · 5:00 PM',
    attendance: '45 / 80 going',
    district: 'Rainey Street',
    description: 'A walkable evening route across partner venues with timed offers and social pull.',
  },
  {
    id: 'event-vinyl',
    title: 'Rooftop Vinyl Night',
    venue: 'The Line Hotel',
    time: 'Tomorrow · 7:00 PM',
    attendance: '62 / 100 going',
    district: 'Congress Ave',
    description: 'Music-driven downtown programming with skyline context and easy member RSVP.',
  },
  {
    id: 'event-coffee',
    title: 'Downtown Coffee Crawl',
    venue: 'Merit Coffee',
    time: 'Thursday · 9:00 AM',
    attendance: '19 / 30 going',
    district: 'West Downtown',
    description: 'A guided morning route through the strongest coffee anchors in the district.',
  },
];

export const perkHighlights: PerkHighlight[] = [
  {
    id: 'perk-jos',
    venue: "Jo's Coffee",
    offer: 'Free pastry with any drink',
    meta: '2nd Street · 4 min walk · 4.6',
    summary: 'A reliable morning anchor that rewards the walk instead of making you hunt for codes.',
  },
  {
    id: 'perk-roosevelt',
    venue: 'The Roosevelt Room',
    offer: 'Complimentary appetizer',
    meta: 'West Downtown · 4 min walk · 4.7',
    summary: 'The kind of evening perk that converts a saved plan into an actual visit.',
  },
  {
    id: 'perk-castle-hill',
    venue: 'Castle Hill Fitness',
    offer: 'Free 7-day pass',
    meta: 'West Downtown · 10 min walk · 4.6',
    summary: 'A wellness trial tied to where residents already live and move through downtown.',
  },
  {
    id: 'perk-vanzandt',
    venue: 'Hotel Van Zandt',
    offer: 'Resident rate',
    meta: 'Rainey Street · 9 min walk',
    summary: 'Staycation logic and local hosting value inside the same resident card flow.',
  },
  {
    id: 'perk-bookpeople',
    venue: 'BookPeople',
    offer: '15% off + free events',
    meta: 'West Downtown · 6 min walk · 4.8',
    summary: 'A culture perk that feels like belonging, not just a coupon mechanic.',
  },
  {
    id: 'perk-antones',
    venue: "Antone's Nightclub",
    offer: '$5 off tickets + priority entry',
    meta: 'East Downtown · 5 min walk · 4.7',
    summary: 'A nightlife perk that works because timing, place, and identity all line up.',
  },
];

export const buildingHighlights: BuildingHighlight[] = [
  {
    id: 'building-independent',
    name: 'The Independent',
    district: 'Seaholm',
    year: '2018',
    summary: 'A west downtown anchor where the daily value comes from what is downstairs and within a few blocks.',
    signals: ['370 units', 'Coffee + retail nearby', 'Strong leasing context'],
  },
  {
    id: 'building-austonian',
    name: 'Austonian',
    district: 'Congress Ave',
    year: '2010',
    summary: 'High-visibility tower living paired with walkable dining, nightlife, and event access.',
    signals: ['188 units', 'Congress core', 'Hospitality adjacency'],
  },
  {
    id: 'building-bowie',
    name: 'The Bowie',
    district: 'West Downtown',
    year: '2016',
    summary: 'Residential density connected directly to the nearby leisure and amenity layer.',
    signals: ['240 units', 'Retail proximity', 'Partner-ready'],
  },
  {
    id: 'building-shore',
    name: 'The Shore',
    district: 'Rainey Street',
    year: '2023',
    summary: 'A Rainey-linked property where timing, nightlife, and venue flow matter more than brochure copy.',
    signals: ['386 units', 'Rainey foot traffic', 'Evening demand'],
  },
];

export const updateFeed = [
  ['New venue', 'The Roosevelt Room joined Downtown Perks with an operator-visible perk and performance loop.'],
  ['Product', 'Walk-radius logic is back so the map answers practical proximity questions again.'],
  ['Neighborhood', 'Rainey Street weekend routes now surface perks, venue signals, and live event timing together.'],
];

export const operatorSignals = [
  ['Map-first insight', 'Operators can see what a building actually unlocks nearby instead of guessing from a static radius.'],
  ['Redemption proof', 'Perk scans, RSVPs, and pilot checkout flows now live inside the same hardened app.'],
  ['Leasing context', 'Buildings, listings, and nearby venues sit on one surface so the neighborhood does persuasive work.'],
];

export const integrationCards = [
  ['Listings sync', 'Group property and unit data by building so the map can explain where someone would really live.'],
  ['Events feed', 'Bring downtown programming into the same layer residents use for everyday decisions.'],
  ['Offer engine', 'Schedule perks by district, venue, time of day, or pilot plan.'],
  ['Operations loop', 'Track SMS links, redemptions, RSVPs, checkouts, and admin review in one hardened flow.'],
];

export const redemptionRows = [
  ['Jo\'s Coffee', 'Free pastry with any drink', '41', '29', 'Morning'],
  ['Via 313 Pizza', '$5 off', '34', '21', 'Lunch'],
  ['Comedy Mothership', '2 for $30', '58', '31', 'Evening'],
  ['BookPeople', '15% off + free events', '19', '11', 'All day'],
] as const;

export const searchPrompts = [
  'coffee near Seaholm',
  'dinner tonight on Rainey',
  'best building for walkable errands',
  'which offers convert near Congress',
];
