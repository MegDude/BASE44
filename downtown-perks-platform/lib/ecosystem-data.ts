import venueSeed from '@/data/downtown_austin_filtered.json';
import propertySeed from '@/data/property_listings.json';
import rentalSeed from '@/data/downtown_perks_rental_map_data.json';
import type { SearchEntity } from './types';

export type PartnerTypeKey = 'properties' | 'hotels' | 'venues' | 'brands' | 'civic';
export type ResidentFilterKey = 'all' | 'places' | 'offers' | 'events' | 'buildings' | 'open';

export type MemberProfile = {
  name: string;
  memberId: string;
  tier: string;
  points: number;
  pointsToNext: number;
  nextTier: string;
  district: string;
  initials: string;
};

export type ResidentPerk = {
  id: string;
  venueName: string;
  category: string;
  offer: string;
  description: string;
  district: string;
  distance: string;
  hours: string;
  rating: number;
  lat: number;
  lng: number;
  signals: string[];
  cta: string;
};

export type ResidentEvent = {
  id: string;
  title: string;
  venue: string;
  district: string;
  time: string;
  attendance: string;
  description: string;
  lat: number;
  lng: number;
  tag: string;
};

export type ResidentProperty = {
  id: string;
  name: string;
  district: string;
  address: string;
  summary: string;
  priceBand: string;
  signals: string[];
  nearby: string[];
  lat: number;
  lng: number;
};

export type ResidentMoment = {
  id: string;
  title: string;
  place: string;
  district: string;
  freshness: string;
  offer: string;
  lat: number;
  lng: number;
  energy: 'live' | 'trending' | 'calm';
};

export type StationPrompt = {
  id: number;
  name: string;
  location: string;
  question: string;
  responseType: 'choice' | 'text';
  choices?: string[];
  thankYou: string;
  cta: string;
  ctaButton: string;
  ctaHref: string;
};

export type DashboardStat = {
  label: string;
  value: string;
  delta: string;
  note: string;
};

export type DiscoverySource = {
  label: string;
  value: number;
};

export type FunnelStep = {
  label: string;
  value: number;
  detail: string;
};

export type PerkPerformance = {
  name: string;
  status: 'Top performer' | 'Growing' | 'Needs revision';
  saveRate: string;
  redemptionRate: string;
  bestWindow: string;
  signal: string;
};

export type AudienceSignal = {
  label: string;
  value: string;
  note: string;
};

export type LiveFeedItem = {
  title: string;
  meta: string;
  stamp: string;
};

export type PartnerAction = {
  title: string;
  body: string;
  tag: 'High impact' | 'Needs attention' | 'Opportunity';
};

export type StationAnalytics = {
  id: number;
  name: string;
  location: string;
  theme: string;
  question: string;
  scans: number;
  completionRate: number;
  topResponse: string;
  insight: string;
  partnerBenefit: string;
  ctaHref: string;
};

export type RedemptionRow = {
  id: string;
  venueName: string;
  perkName: string;
  category: string;
  memberName: string;
  scannedAt: string;
  status: string;
  district: string;
};

export type PartnerLens = {
  label: string;
  eyebrow: string;
  headline: string;
  sub: string;
  metrics: { value: string; label: string }[];
  capabilities: { title: string; desc: string }[];
  mapFeatures: string[];
  whyItWorks: { title: string; desc: string }[];
  steps: string[];
  faq: { q: string; a: string }[];
};

type VenueSeed = {
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  operating_hours?: string;
  website?: string;
  category?: string;
  category_key?: string;
  alignment_to_downtown_perks?: string;
  deals_offers?: string;
  specials?: string;
};

type PropertySeed = {
  id: string;
  address: string;
  buildingKey: string;
  price: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  lat: number;
  lng: number;
};

const venues = venueSeed as VenueSeed[];
const properties = propertySeed as PropertySeed[];
const rentals = rentalSeed as {
  search: { totalVisibleSearchResults: number };
  listings: Array<{
    building: string;
    district: string;
    price: number;
    topline: string[];
    buildingAmenities: string[];
    nearbyPerks: string[];
  }>;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function findVenue(match: string) {
  const lowered = match.toLowerCase();
  return venues.find((venue) => venue.name.toLowerCase().includes(lowered));
}

function findProperty(match: string) {
  const lowered = match.toLowerCase();
  return properties.find((property) => property.address.toLowerCase().includes(lowered) || property.buildingKey.toLowerCase().includes(lowered));
}

function categoryFromSeed(seed?: VenueSeed) {
  const key = (seed?.category_key || '').toLowerCase();
  if (key.includes('coffee')) return 'coffee';
  if (key.includes('restaurant')) return 'food';
  if (key.includes('wellness')) return 'wellness';
  if (key.includes('civic')) return 'arts';
  if (key.includes('retail')) return 'retail';
  if (key.includes('hotel')) return 'hotel';
  if (key.includes('nightlife')) return 'nightlife';
  return 'food';
}

const curatedVenueConfigs = [
  {
    nameMatch: 'Houndstooth',
    offer: 'Resident drip + pastry pairing',
    description: 'A steady coffee anchor for quick solo resets, laptop mornings, and post-walk regrouping.',
    district: 'West Downtown',
    distance: '0.2 mi',
    hours: 'Open until 6 PM',
    rating: 4.8,
    signals: ['Open now', 'Calm seating', 'Perk active today'],
    cta: 'Redeem at counter',
  },
  {
    nameMatch: "Jo's Coffee",
    offer: 'Free pastry with any large coffee',
    description: 'Fast neighborhood coffee without losing the sense that you are still in downtown.',
    district: '2nd Street',
    distance: '0.3 mi',
    hours: 'Open until 5 PM',
    rating: 4.7,
    signals: ['Morning favorite', 'Quick stop', 'Perk active today'],
    cta: 'Use morning perk',
  },
  {
    nameMatch: 'Halcyon',
    offer: 'Late-afternoon espresso tonic on the house',
    description: 'The in-between space for coffee, coworking, and an easy shift into evening plans.',
    district: 'Warehouse District',
    distance: '0.4 mi',
    hours: 'Open until 11 PM',
    rating: 4.6,
    signals: ['Day-to-night', 'Good for work', 'Popular right now'],
    cta: 'Save for later',
  },
  {
    nameMatch: 'Caroline',
    offer: 'Members-only happy hour flight',
    description: 'Reliable downtown dinner energy with an easy handoff from office, hotel, or building lobby.',
    district: 'Congress Ave',
    distance: '0.5 mi',
    hours: 'Open until midnight',
    rating: 4.8,
    signals: ['Dinner tonight', 'Strong conversion', 'Walkable from towers'],
    cta: 'Start happy hour',
  },
  {
    nameMatch: 'Arlo Grey',
    offer: 'Lakefront dessert course with card',
    description: 'A premium dinner anchor when the night needs to feel planned, not improvised.',
    district: 'Waterfront',
    distance: '0.7 mi',
    hours: 'Open until 10 PM',
    rating: 4.9,
    signals: ['Dinner pick', 'Premium night out', 'Date-night ready'],
    cta: 'Plan dinner',
  },
  {
    nameMatch: "Banger",
    offer: 'Patio pretzel + first round pairing',
    description: 'A Rainey mainstay for groups, guests, and anything that starts casual and stays out late.',
    district: 'Rainey Street',
    distance: '0.6 mi',
    hours: 'Open until 1 AM',
    rating: 4.7,
    signals: ['Group-friendly', 'Nightlife edge', 'Perk active tonight'],
    cta: 'Claim tonight',
  },
  {
    nameMatch: 'Black Swan Yoga',
    offer: 'Resident drop-in class',
    description: 'The wellness reset inside a downtown routine built around screens, meetings, and late nights.',
    district: 'West Downtown',
    distance: '0.8 mi',
    hours: 'Classes all day',
    rating: 4.9,
    signals: ['Wellness nearby', 'Class seats open', 'Morning momentum'],
    cta: 'Book class',
  },
  {
    nameMatch: 'Comedy Mothership',
    offer: 'Priority RSVP release for members',
    description: 'A cultural anchor with enough downtown gravity to change where the night begins and ends.',
    district: 'East Downtown',
    distance: '0.5 mi',
    hours: 'Shows tonight',
    rating: 4.9,
    signals: ['Event live', 'Trending tonight', 'High demand'],
    cta: 'RSVP tonight',
  },
  {
    nameMatch: 'Mexic-Arte Museum',
    offer: 'Free member gallery hour',
    description: 'A civic and cultural stop that fits between work, dinner, and a spontaneous afternoon reset.',
    district: 'Congress Ave',
    distance: '0.4 mi',
    hours: 'Open until 6 PM',
    rating: 4.8,
    signals: ['Arts nearby', 'Free access window', 'Easy midday stop'],
    cta: 'Open gallery pass',
  },
  {
    nameMatch: 'Wanderlust Yoga',
    offer: 'Evening class unlock',
    description: 'A softer landing for residents who want the neighborhood to feel restorative, not only busy.',
    district: 'West Downtown',
    distance: '0.9 mi',
    hours: 'Evening classes',
    rating: 4.7,
    signals: ['Evening wellness', 'Book ahead', 'Calm pick'],
    cta: 'Reserve class',
  },
] as const;

export const memberProfile: MemberProfile = {
  name: 'Meg Dude',
  memberId: 'DP-2026-5590',
  tier: 'Local',
  points: 1240,
  pointsToNext: 760,
  nextTier: 'Insider',
  district: 'Rainey Street',
  initials: 'MD',
};

export const residentPerks: ResidentPerk[] = curatedVenueConfigs
  .map((config) => {
    const seed = findVenue(config.nameMatch);
    if (!seed) return null;
    return {
      id: `perk-${slugify(seed.name)}`,
      venueName: seed.name,
      category: categoryFromSeed(seed),
      offer: config.offer,
      description: config.description,
      district: config.district,
      distance: config.distance,
      hours: config.hours || seed.operating_hours || 'Hours vary',
      rating: config.rating,
      lat: seed.latitude,
      lng: seed.longitude,
      signals: [...config.signals],
      cta: config.cta,
    };
  })
  .filter(Boolean) as ResidentPerk[];

const propertyConfigs = [
  {
    name: 'The Independent',
    match: '301 West Ave',
    district: 'West Downtown',
    summary: 'High-rise living with daily coffee, trail access, and dinner density inside a five-minute walk.',
    priceBand: '$4.8k entry point',
    signals: ['5-minute neighborhood', 'Resident-heavy usage', 'Coffee and dining corridor'],
    nearby: ['Houndstooth', 'Black Swan Yoga', 'Whole Foods loop'],
  },
  {
    name: '360 Nueces',
    match: '360 Nueces',
    district: 'Seaholm',
    summary: 'A resident anchor with fast access to coffee, groceries, trail time, and west downtown dining.',
    priceBand: '$2.8k entry point',
    signals: ['Amenity lift', 'High repeat traffic', 'Trail adjacency'],
    nearby: ['Jo’s Coffee', 'Seaholm retail', 'Waterfront walk'],
  },
  {
    name: 'Rainey Residences',
    match: '603 Davis',
    district: 'Rainey Street',
    summary: 'Social-density living with nightlife, event energy, and lake-edge movement all inside the same walk.',
    priceBand: '$3.9k entry point',
    signals: ['Event spillover', 'Strong evening usage', 'Hotel crossover'],
    nearby: ["Banger's", 'Comedy Mothership', 'Trail social loop'],
  },
  {
    name: 'Sabine Street Residences',
    match: '507 Sabine',
    district: 'Convention Edge',
    summary: 'Convention and East Downtown access with nightlife, culture, and walk-up dining inside a compact radius.',
    priceBand: '$3.7k entry point',
    signals: ['Visitor overlap', 'Music district reach', 'Dining density'],
    nearby: ['Caroline', 'Mexic-Arte', 'East 5th venues'],
  },
  {
    name: 'West 7th Lofts',
    match: '506 W 7th',
    district: 'West Downtown',
    summary: 'A boutique west downtown base for residents who use the city as their real amenity package.',
    priceBand: '$3.8k entry point',
    signals: ['Boutique scale', 'Walkable errands', 'Strong lunch circuit'],
    nearby: ['Houndstooth', 'Halcyon', 'BookPeople edge'],
  },
] as const;

export const residentProperties: ResidentProperty[] = propertyConfigs
  .map((config) => {
    const seed = findProperty(config.match);
    if (!seed) return null;
    return {
      id: `property-${slugify(config.name)}`,
      name: config.name,
      district: config.district,
      address: seed.address,
      summary: config.summary,
      priceBand: config.priceBand,
      signals: [...config.signals],
      nearby: [...config.nearby],
      lat: seed.lat,
      lng: seed.lng,
    };
  })
  .filter(Boolean) as ResidentProperty[];

function perkByName(name: string) {
  return residentPerks.find((perk) => perk.venueName.toLowerCase().includes(name.toLowerCase()));
}

function propertyByName(name: string) {
  return residentProperties.find((property) => property.name === name);
}

export const residentEvents: ResidentEvent[] = [
  {
    id: 'event-waterloo-yoga',
    title: 'Morning Yoga at Waterloo Park',
    venue: 'Waterloo Park',
    district: 'East Downtown',
    time: 'Today · 7:30 AM',
    attendance: '84 going',
    description: 'A resident-friendly sunrise reset before the city moves into work mode.',
    lat: 30.2649,
    lng: -97.7356,
    tag: 'Morning',
  },
  {
    id: 'event-happy-hour-loop',
    title: 'Rainey Social Loop',
    venue: "Banger's Patio",
    district: 'Rainey Street',
    time: 'Today · 5:30 PM',
    attendance: '112 going',
    description: 'A soft-launch evening route that turns one venue into a walkable downtown sequence.',
    lat: perkByName('Banger')?.lat || 30.2598,
    lng: perkByName('Banger')?.lng || -97.7387,
    tag: 'Tonight',
  },
  {
    id: 'event-members-night',
    title: 'Members Night at Mexic-Arte',
    venue: 'Mexic-Arte Museum',
    district: 'Congress Ave',
    time: 'Thursday · 6:00 PM',
    attendance: '56 RSVPs',
    description: 'A civic and culture moment designed to make downtown feel owned by the people who live in it.',
    lat: perkByName('Mexic-Arte')?.lat || 30.2673,
    lng: perkByName('Mexic-Arte')?.lng || -97.7428,
    tag: 'Culture',
  },
  {
    id: 'event-comedy-drop',
    title: 'Late Show Queue Drop',
    venue: 'Comedy Mothership',
    district: 'East Downtown',
    time: 'Friday · 9:00 PM',
    attendance: '146 watching',
    description: 'A night-out anchor that changes the district energy for every nearby venue.',
    lat: perkByName('Comedy')?.lat || 30.2671,
    lng: perkByName('Comedy')?.lng || -97.7395,
    tag: 'High demand',
  },
];

export const residentMoments: ResidentMoment[] = [
  {
    id: 'moment-coffee-now',
    title: 'Coffee right now',
    place: 'Houndstooth',
    district: 'West Downtown',
    freshness: 'Happening now',
    offer: 'Fast coffee stop with card perk',
    lat: perkByName('Houndstooth')?.lat || 30.267,
    lng: perkByName('Houndstooth')?.lng || -97.7466,
    energy: 'calm',
  },
  {
    id: 'moment-dinner-tonight',
    title: 'Dinner tonight',
    place: 'Arlo Grey',
    district: 'Waterfront',
    freshness: 'Tonight at 7 PM',
    offer: 'Member dessert course',
    lat: perkByName('Arlo')?.lat || 30.2646,
    lng: perkByName('Arlo')?.lng || -97.7419,
    energy: 'trending',
  },
  {
    id: 'moment-after-work',
    title: 'Drinks after work',
    place: 'Caroline',
    district: 'Congress Ave',
    freshness: 'In 35 min',
    offer: 'Members-only happy hour flight',
    lat: perkByName('Caroline')?.lat || 30.2675,
    lng: perkByName('Caroline')?.lng || -97.7417,
    energy: 'live',
  },
  {
    id: 'moment-night-show',
    title: 'Late-night set',
    place: 'Comedy Mothership',
    district: 'East Downtown',
    freshness: 'Seats moving fast',
    offer: 'Priority RSVP release',
    lat: perkByName('Comedy')?.lat || 30.2671,
    lng: perkByName('Comedy')?.lng || -97.7395,
    energy: 'trending',
  },
];

export const residentAskPrompts = [
  'Coffee right now',
  'Dinner tonight on Rainey',
  'Best happy hour nearby',
  'Something to do right now',
  'Quiet spot to work',
  'Wellness near Congress',
];

export const residentFilters: { key: ResidentFilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'places', label: 'Places' },
  { key: 'offers', label: 'Perks' },
  { key: 'events', label: 'Events' },
  { key: 'buildings', label: 'Buildings' },
  { key: 'open', label: 'Open now' },
];

export const stationPrompts: StationPrompt[] = [
  {
    id: 1,
    name: 'Welcome Check-In',
    location: 'Entry Table',
    question: "What's your favorite thing about this neighborhood right now?",
    responseType: 'choice',
    choices: ['The walkability', 'The food scene', 'The people', 'The energy', "I'm still learning it"],
    thankYou: 'Welcome to the neighborhood. Your answer just shaped what comes next around here.',
    cta: "See what's happening around you right now.",
    ctaButton: 'Explore nearby',
    ctaHref: '/resident-app/explore',
  },
  {
    id: 2,
    name: 'Neighborhood Favorites',
    location: 'Main Bar',
    question: 'What is one spot in this neighborhood everyone should know about?',
    responseType: 'text',
    thankYou: 'Noted. Real recommendations from real neighbors beat static guides every time.',
    cta: 'Check out what your neighbors are saving and using most.',
    ctaButton: 'See saved plans',
    ctaHref: '/resident-app/saved',
  },
  {
    id: 3,
    name: "What's Next Downtown",
    location: 'Lounge Area',
    question: 'If you could add one thing to downtown, what would it be?',
    responseType: 'choice',
    choices: ['More patios', 'Live music spaces', 'Late-night food', 'Dog-friendly rooms', 'Creative workshop space'],
    thankYou: 'That signal now belongs in the product roadmap, not a forgotten survey folder.',
    cta: 'See the events and venue moments already building that energy.',
    ctaButton: 'View events',
    ctaHref: '/resident-app/events',
  },
  {
    id: 4,
    name: 'Partner Spotlight',
    location: 'Featured Table',
    question: 'Which kind of perk gets you to try a new place fastest?',
    responseType: 'choice',
    choices: ['Free first try', 'Straight dollar amount off', 'BOGO', 'Members-only access', 'Something unusual'],
    thankYou: 'That preference flows directly into the perk mix partners see on their side.',
    cta: 'Browse the offers that match what you just told us.',
    ctaButton: 'Browse perks',
    ctaHref: '/resident-app/perks',
  },
];

export const dashboardStats: DashboardStat[] = [
  { label: 'Map impressions', value: '12.4k', delta: '+16%', note: 'Seen by nearby people deciding where to go' },
  { label: 'Pin clicks', value: '1,284', delta: '+9%', note: 'Visibility turning into active interest' },
  { label: 'Saves to card', value: '386', delta: '+22%', note: 'Strong intent signal before visit' },
  { label: 'Redemptions', value: '94', delta: '+11%', note: 'Measured movement, not ad reach' },
];

export const liveActivityFeed: LiveFeedItem[] = [
  { title: '6 saves in the last hour', meta: 'Perks Card activity is up 18% from yesterday', stamp: 'Now' },
  { title: '3 new RSVPs for tonight', meta: 'Most interest is still inside a 0.7 mi radius', stamp: '4 min ago' },
  { title: '2 redemptions just landed', meta: 'Happy hour perk is strongest between 5–7 PM', stamp: '9 min ago' },
  { title: 'Map visibility is climbing', meta: 'Nearby and coffee filters are pulling the most discovery', stamp: '14 min ago' },
];

export const discoverySources: DiscoverySource[] = [
  { label: 'Nearby', value: 38 },
  { label: 'Search', value: 22 },
  { label: 'Category', value: 18 },
  { label: 'Events', value: 12 },
  { label: 'Recommended', value: 10 },
];

export const funnelSteps: FunnelStep[] = [
  { label: 'Seen', value: 12400, detail: 'Map plus listing impressions' },
  { label: 'Clicked', value: 1284, detail: 'Pin taps plus card opens' },
  { label: 'Saved', value: 386, detail: 'Perks Card saves' },
  { label: 'Showed up', value: 94, detail: 'Redeemed or tapped directions' },
];

export const perkPerformance: PerkPerformance[] = [
  {
    name: 'Happy Hour Pairing',
    status: 'Top performer',
    saveRate: '12.8%',
    redemptionRate: '6.2%',
    bestWindow: '5:00–7:00 PM',
    signal: 'People nearby convert fastest after work.',
  },
  {
    name: 'Weekend Coffee Drop',
    status: 'Growing',
    saveRate: '9.4%',
    redemptionRate: '4.1%',
    bestWindow: '9:00–11:30 AM',
    signal: 'High browse rate and strong return behavior.',
  },
  {
    name: 'Late Night Bonus',
    status: 'Needs revision',
    saveRate: '4.2%',
    redemptionRate: '1.3%',
    bestWindow: 'After 9:00 PM',
    signal: 'Seen often, but the framing is not closing the gap.',
  },
];

export const audienceSignals: AudienceSignal[] = [
  { label: 'Nearby members', value: '61%', note: 'Primary demand base' },
  { label: 'Visitors', value: '24%', note: 'Higher on weekends and show nights' },
  { label: 'Repeat users', value: '43%', note: 'Returning from prior engagement' },
  { label: 'New users', value: '57%', note: 'Fresh discovery from the map' },
];

export const eventImpact = [
  { label: 'Event views', value: '842' },
  { label: 'RSVPs', value: '118' },
  { label: 'Attendance signals', value: '74' },
  { label: 'Post-event redemptions', value: '31' },
];

export const partnerActions: PartnerAction[] = [
  {
    title: 'Launch the strongest perk before 5 PM',
    body: 'Your best redemption window starts in late afternoon. Move the offer earlier and capture more after-work traffic.',
    tag: 'High impact',
  },
  {
    title: 'Replace the late-night perk framing',
    body: 'This offer is visible enough. The problem looks like positioning, not reach.',
    tag: 'Needs attention',
  },
  {
    title: 'Add a second weekend offer',
    body: 'Saturday morning discovery is climbing. There is room to turn coffee traffic into repeat visits.',
    tag: 'Opportunity',
  },
];

export const whyThisMatters = [
  'The same spend performs better when visibility is tied to timing and proximity.',
  'People who already live downtown behave differently from one-time visitors. The product is built for that repeat pattern.',
  'A stronger neighborhood layer turns buildings into measurable amenities and venues into repeat choices.',
];

export const stationAnalytics: StationAnalytics[] = [
  {
    id: 1,
    name: 'Welcome Check-In',
    location: 'Property lobby',
    theme: 'Community pulse',
    question: "What's your favorite thing about this neighborhood right now?",
    scans: 47,
    completionRate: 94,
    topResponse: 'The energy',
    insight: 'Most people describe downtown through walkability, food, or immediate atmosphere.',
    partnerBenefit: 'That tells operators what should lead the resident story and tells venues what kind of perk framing converts.',
    ctaHref: '/station?station=1',
  },
  {
    id: 2,
    name: 'Neighborhood Favorites',
    location: 'Venue counter',
    theme: 'Discovery plus loyalty',
    question: 'What is the best-kept secret nearby?',
    scans: 42,
    completionRate: 88,
    topResponse: 'Coffee and patios',
    insight: 'The same venues keep being named together, which exposes natural cross-promotion pairs.',
    partnerBenefit: 'It reveals which businesses already share an audience instead of forcing partnerships from the outside.',
    ctaHref: '/station?station=2',
  },
  {
    id: 3,
    name: "What's Next Downtown",
    location: 'Event lounge',
    theme: 'Future priorities',
    question: 'If you could add one thing to downtown, what would it be?',
    scans: 39,
    completionRate: 91,
    topResponse: 'Late-night food',
    insight: 'Residents are telling you where the neighborhood still drops the handoff.',
    partnerBenefit: 'That informs event programming, perk design, and the next venue gaps to solve.',
    ctaHref: '/station?station=3',
  },
  {
    id: 4,
    name: 'Partner Spotlight',
    location: 'Membership table',
    theme: 'Perk fit',
    question: 'What kind of perk gets you to try a new place fastest?',
    scans: 58,
    completionRate: 96,
    topResponse: 'Free first try',
    insight: 'Low-friction first-visit offers still outperform most discount structures.',
    partnerBenefit: 'Operators can adjust promotion design before wasting inventory on the wrong offer style.',
    ctaHref: '/station?station=4',
  },
];

export const redemptionLog: RedemptionRow[] = [
  {
    id: 'redemption-1',
    venueName: 'Houndstooth',
    perkName: 'Resident drip + pastry pairing',
    category: 'coffee',
    memberName: 'M. Dude',
    scannedAt: '2026-04-09T08:18:00.000Z',
    status: 'Redeemed',
    district: 'West Downtown',
  },
  {
    id: 'redemption-2',
    venueName: 'Caroline',
    perkName: 'Members-only happy hour flight',
    category: 'food',
    memberName: 'J. Rivera',
    scannedAt: '2026-04-08T17:42:00.000Z',
    status: 'Redeemed',
    district: 'Congress Ave',
  },
  {
    id: 'redemption-3',
    venueName: 'Black Swan Yoga',
    perkName: 'Resident drop-in class',
    category: 'wellness',
    memberName: 'S. Tran',
    scannedAt: '2026-04-08T07:11:00.000Z',
    status: 'Redeemed',
    district: 'West Downtown',
  },
  {
    id: 'redemption-4',
    venueName: "Banger's Sausage House and Beer Garden",
    perkName: 'Patio pretzel + first round pairing',
    category: 'nightlife',
    memberName: 'A. Cole',
    scannedAt: '2026-04-07T18:33:00.000Z',
    status: 'Redeemed',
    district: 'Rainey Street',
  },
  {
    id: 'redemption-5',
    venueName: 'Mexic-Arte Museum',
    perkName: 'Free member gallery hour',
    category: 'arts',
    memberName: 'K. James',
    scannedAt: '2026-04-07T15:04:00.000Z',
    status: 'Redeemed',
    district: 'Congress Ave',
  },
];

export const partnerLenses: Record<PartnerTypeKey, PartnerLens> = {
  properties: {
    label: 'Properties',
    eyebrow: 'For properties',
    headline: 'The neighborhood becomes the amenity.',
    sub: 'Residents at connected buildings see nearby coffee, dining, wellness, events, and perks in one live surface. This turns location into something measurable instead of something implied.',
    metrics: [
      { value: '14', label: 'Buildings connected' },
      { value: '78701', label: 'District coverage' },
      { value: '5 min', label: 'Average walk radius' },
    ],
    capabilities: [
      { title: 'Neighborhood layer', desc: 'A live walk radius centered on every connected building.' },
      { title: 'Resident engagement', desc: 'Track which venues and perks residents actually use.' },
      { title: 'Amenity lift', desc: 'Increase perceived value without adding physical square footage.' },
      { title: 'Event visibility', desc: 'What is happening tonight surfaces automatically.' },
    ],
    mapFeatures: [
      '5-minute neighborhood view around each building',
      'Nearby coffee, dining, wellness, and evening plans',
      'Perks Card access tied to building membership',
      'Live event visibility for what is happening now',
    ],
    whyItWorks: [
      { title: 'Nearby value', desc: 'Position the building as connected to a stronger downtown lifestyle.' },
      { title: 'Daily utility', desc: 'Simpler discovery makes nearby businesses part of routine behavior.' },
      { title: 'Retention signal', desc: 'Residents who use the neighborhood as an amenity renew more often.' },
    ],
    steps: [
      'Connect the property to the Downtown Perks network.',
      'Resident access activates through address verification or invite.',
      'The map builds a live neighborhood layer around the building.',
      'Track engagement, foot traffic, and perk usage from the dashboard.',
    ],
    faq: [
      { q: 'How does this help my buildings?', a: 'Prospective and current residents see what surrounds the property before they make a decision. The map turns location into measurable value.' },
      { q: 'What data will I actually see?', a: 'You see which perks, venues, and districts your people actually use and what that implies for resident engagement and retention.' },
      { q: 'How is this different from a resident portal?', a: 'Resident portals manage the building. Downtown Perks connects your people to the neighborhood itself.' },
    ],
  },
  hotels: {
    label: 'Hotels',
    eyebrow: 'For hotels',
    headline: 'The neighborhood becomes the concierge.',
    sub: 'Guests see what is nearby with real walk-time context, timed recommendations, and a live downtown layer instead of a static brochure rack.',
    metrics: [
      { value: '8', label: 'Hotels in district' },
      { value: '180+', label: 'Venues mapped' },
      { value: '24/7', label: 'Live availability' },
    ],
    capabilities: [
      { title: 'Walk-time guidance', desc: 'Guests see what is nearby with distance context, not guesswork.' },
      { title: 'Time-aware curation', desc: 'Morning coffee, afternoon shopping, evening dining, tonight’s events.' },
      { title: 'Guest satisfaction', desc: 'Better local answers without front-desk repetition.' },
      { title: 'Staycation value', desc: 'Drive local booking behavior with neighborhood-aware offers.' },
    ],
    mapFeatures: [
      'Walk-time guidance from the hotel entrance',
      'Venues sorted by timing and relevance',
      'Events and nightlife for the same evening',
      'Hotel-specific offers and local rate framing',
    ],
    whyItWorks: [
      { title: 'Guest experience', desc: 'Better answers faster, especially for visitors who do not want to research.' },
      { title: 'Local advantage', desc: 'The hotel feels embedded in downtown instead of isolated from it.' },
      { title: 'Staycation reach', desc: 'Nearby residents discover the property through a premium channel.' },
    ],
    steps: [
      'Connect the hotel to the downtown map.',
      'Guest access activates through QR at check-in or in-room.',
      'The map surfaces walkable venues and events by time of day.',
      'Track guest engagement and local discovery from the dashboard.',
    ],
    faq: [
      { q: 'Do guests need to download anything?', a: 'No. The neighborhood map opens in the browser through a QR or text link.' },
      { q: 'What data will I see?', a: 'Recommendation follow-through, event interest, and what kinds of local plans lead to real guest movement.' },
      { q: 'How does this help beyond a rate offer?', a: 'It turns the surrounding district into part of the stay itself.' },
    ],
  },
  venues: {
    label: 'Venues',
    eyebrow: 'For venues',
    headline: 'Visible at the moment someone nearby decides where to go.',
    sub: 'Timing and proximity replace ads and algorithms. The venue appears when a nearby resident or guest is already deciding on coffee, lunch, happy hour, dinner, or what to do next.',
    metrics: [
      { value: '180+', label: 'Venues mapped' },
      { value: '10', label: 'Categories covered' },
      { value: '3x', label: 'Average repeat rate' },
    ],
    capabilities: [
      { title: 'Decision-moment visibility', desc: 'Appear when nearby intent is already forming.' },
      { title: 'Proximity context', desc: 'Walk-time from current location stays visible.' },
      { title: 'Repeat traffic', desc: 'Nearby residents matter because they come back.' },
      { title: 'Live perks', desc: 'Offers show inline instead of being buried across channels.' },
    ],
    mapFeatures: [
      'Appears in nearby results and guided recommendations',
      'Perk visibility tied to place and category',
      'Walk-time context from current location',
      'Event adjacency and district relevance',
    ],
    whyItWorks: [
      { title: 'Timing', desc: 'Relevance matters more when someone is already ready to go.' },
      { title: 'Repeat behavior', desc: 'Nearby residents are high-value because they form habits.' },
      { title: 'Offer clarity', desc: 'The best perk feels immediate and worth acting on now.' },
    ],
    steps: [
      'List the venue on the Downtown Perks map.',
      'Set an active perk or time-aware offer.',
      'Members discover the venue through search, map, or live recommendations.',
      'Track visits, redemptions, and repeat traffic in real time.',
    ],
    faq: [
      { q: 'How is this different from Yelp or Google?', a: 'Those tools rank by reviews or SEO. Downtown Perks ranks by proximity, timing, and whether the person is already nearby.' },
      { q: 'What will I actually see?', a: 'A path from map visibility to save to redemption, plus the hours and formats that perform best.' },
      { q: 'Do I need to manage content constantly?', a: 'No. Set your offer and your hours. The map handles the matching logic.' },
    ],
  },
  brands: {
    label: 'Brands',
    eyebrow: 'For brands',
    headline: 'Present inside the flow people are already moving through.',
    sub: 'Brand presence sits inside actual neighborhood movement: discovery, events, cross-venue traffic, and time-aware downtown behavior.',
    metrics: [
      { value: '4', label: 'Activation zones' },
      { value: '22k', label: 'Monthly impressions' },
      { value: '78701', label: 'Hyper-local reach' },
    ],
    capabilities: [
      { title: 'Contextual visibility', desc: 'Appear within real neighborhood movement and decisions.' },
      { title: 'Campaign alignment', desc: 'Placements can align to place, timing, and district patterns.' },
      { title: 'Non-intrusive format', desc: 'Presence feels additive, not disruptive.' },
      { title: 'Measured utility', desc: 'Track engagement tied to real foot traffic and event lift.' },
    ],
    mapFeatures: [
      'Sponsored placements tied to district or category',
      'Event adjacency and partner-layer integration',
      'Timed moments tied to foot-traffic windows',
      'Visibility that feels useful instead of loud',
    ],
    whyItWorks: [
      { title: 'Context', desc: 'The same message performs better in the right moment.' },
      { title: 'Association', desc: 'Appear next to trusted local use cases and venues.' },
      { title: 'Relevance', desc: 'Presence is tied to real downtown behavior instead of generic audience buckets.' },
    ],
    steps: [
      'Define the activation zone or district moment.',
      'Place the brand into the map, event, and partner layers where it fits.',
      'Members encounter it during relevant downtown decisions.',
      'Track impressions, engagement, and foot-traffic attribution.',
    ],
    faq: [
      { q: 'How is this different from digital ads?', a: 'This does not interrupt. It integrates into a decision layer people are already using.' },
      { q: 'Can I target districts or events?', a: 'Yes. The platform can align placements to districts, categories, time windows, and event types.' },
      { q: 'What metrics matter?', a: 'Movement, engagement, and lift tied to real behavior instead of vanity reach.' },
    ],
  },
  civic: {
    label: 'Civic',
    eyebrow: 'For civic partners',
    headline: 'Public programming, easier to find and harder to miss.',
    sub: 'Events, activations, and community programming appear inside the same surface people already use to decide what to do tonight.',
    metrics: [
      { value: '22', label: 'Active members' },
      { value: 'Weekly', label: 'Engagement cycle' },
      { value: '4', label: 'District zones' },
    ],
    capabilities: [
      { title: 'Discoverability', desc: 'Public events are placed into a live discovery layer.' },
      { title: 'Proximity-based reach', desc: 'Nearby activity surfaces when and where it matters.' },
      { title: 'Better turnout', desc: 'Proximity awareness drives more attendance.' },
      { title: 'District energy', desc: 'Visible public activity makes downtown feel more alive.' },
    ],
    mapFeatures: [
      'Event pins with district visibility',
      'Walk-time context from current location',
      'RSVP and save behavior where it matters',
      'Programming inside everyday downtown movement',
    ],
    whyItWorks: [
      { title: 'Visibility', desc: 'People attend more often when they see programming in the same context as dinner and nightlife choices.' },
      { title: 'Access', desc: 'Participation feels nearby, timely, and easy.' },
      { title: 'District energy', desc: 'The more visible public activity is, the more alive downtown feels.' },
    ],
    steps: [
      'Submit programming to the Downtown Perks layer.',
      'Events appear on the map next to venues and perks.',
      'Nearby members see them surfaced by proximity and timing.',
      'Track attendance signals and district engagement.',
    ],
    faq: [
      { q: 'How does this bring people to our events?', a: 'The map puts programming in front of people within walking distance who are already deciding what to do.' },
      { q: 'What data will we see?', a: 'Discovery, RSVP, attendance, and what categories of events pull the strongest district response.' },
      { q: 'Is attendee data private?', a: 'Partners see aggregated patterns, not individual profiles.' },
    ],
  },
};

export const crossAppLinks = [
  { href: '/', label: 'Home', description: 'Ecosystem overview' },
  { href: '/resident-app', label: 'Resident App', description: 'Map-first resident surface' },
  { href: '/partner-dashboard', label: 'Partner Dashboard', description: 'Operator view and proof layer' },
  { href: '/search', label: 'Search', description: 'Ask the map from either side' },
];

export const ecosystemHighlights = [
  {
    title: 'Resident App',
    body: 'Mobile-first discovery with a central map, time-aware decisions, a perks card, saved plans, and a living profile tied to downtown routines.',
    href: '/resident-app',
  },
  {
    title: 'Partner Dashboard',
    body: 'A real operator surface with visibility, conversion, perk performance, station prompts, redemption proof, and building context.',
    href: '/partner-dashboard',
  },
  {
    title: 'Map Layer',
    body: 'One downtown data model powers venues, events, moments, buildings, and partner proof instead of splitting them into disconnected pages.',
    href: '/search',
  },
  {
    title: 'Pilot Layer',
    body: 'Station prompts, QR access, text links, checkout, and admin persistence stay wired for live Vercel deployment.',
    href: '/partner-dashboard/explorer',
  },
];

export const searchEntities: SearchEntity[] = [
  ...residentPerks.map((perk) => ({
    id: perk.id,
    type: 'venue' as const,
    title: perk.venueName,
    lat: perk.lat,
    lng: perk.lng,
    summary: perk.description,
    detail: `${perk.offer} · ${perk.hours}`,
    district: perk.district,
    category: perk.category,
    offer: perk.offer,
    distance: perk.distance,
    hours: perk.hours,
    rating: perk.rating,
    signals: perk.signals,
    href: '/resident-app',
  })),
  ...residentEvents.map((event) => ({
    id: event.id,
    type: 'event' as const,
    title: event.title,
    lat: event.lat,
    lng: event.lng,
    summary: event.description,
    detail: `${event.time} · ${event.venue}`,
    district: event.district,
    category: 'event',
    signals: [event.tag, event.attendance, 'RSVP open'],
    href: '/resident-app/events',
  })),
  ...residentProperties.map((property) => ({
    id: property.id,
    type: 'property' as const,
    title: property.name,
    lat: property.lat,
    lng: property.lng,
    summary: property.summary,
    detail: `${property.address} · ${property.priceBand}`,
    district: property.district,
    buildingKey: property.name,
    signals: property.signals,
    href: '/resident-app/properties',
  })),
  ...residentMoments.map((moment) => ({
    id: moment.id,
    type: 'moment' as const,
    title: moment.title,
    lat: moment.lat,
    lng: moment.lng,
    summary: `${moment.place} · ${moment.offer}`,
    detail: `${moment.freshness} · ${moment.district}`,
    district: moment.district,
    category: 'moment',
    signals: [moment.freshness, moment.energy, 'Live moment'],
    href: '/resident-app',
  })),
];

export const ecosystemStats = {
  mappedVenues: residentPerks.length,
  nightlifeVenues: residentPerks.filter((perk) => perk.category === 'nightlife').length,
  listingsTracked: rentals.search.totalVisibleSearchResults,
  buildingAnchors: residentProperties.length,
};

export const rentalBuildingSignals = rentals.listings.map((listing) => ({
  name: listing.building,
  district: listing.district,
  price: listing.price,
  topline: listing.topline,
  buildingAmenities: listing.buildingAmenities,
  nearbyPerks: listing.nearbyPerks,
}));
