import { ROUTES } from "@/lib/routes";

export const homeEventsPreview = [
  {
    id: "waterloo-yoga",
    date: "Apr 13",
    time: "7:30 AM",
    category: "fitness",
    title: "Morning Yoga at Waterloo Park",
    location: "Waterloo Park",
    going: "28 going",
    body: "Start your Sunday with a free community yoga session in Waterloo Park. All levels welcome.",
  },
  {
    id: "rainey-loop",
    date: "Apr 18",
    time: "5:00 PM",
    category: "food",
    title: "Rainey Street Food + Drink Loop",
    location: "Banger's Sausage House & Beer Garden",
    going: "84 going",
    body: "A walkable Rainey route with partner stops and card perks.",
  },
  {
    id: "lustre-pearl-mixer",
    date: "Apr 25",
    time: "7:00 PM",
    category: "social",
    title: "Resident Mixer Night at Lustre Pearl",
    location: "Lustre Pearl Rainey",
    going: "47 going",
    body: "A casual resident night built around nearby connection and easy entry.",
  },
];

export const homeFaqItems = [
  { question: "Does the map work before login?", answer: "Yes. Browsing stays open. You can look around first and only add the card when you want to save, RSVP, redeem, or unlock member access." },
  { question: "Do I need to download an app?", answer: "No. Downtown Perks works through the web, QR, and mobile-friendly routes. No app download is required." },
  { question: "What makes the card different?", answer: "The card is access, not the whole product. Use the map first. The card helps with saves, RSVPs, resident perks, and redemptions." },
  { question: "Does it cost anything for residents?", answer: "Residents can browse the map for free. Direct resident card access is $25 per year until a building joins. If your building joins later, that fee is refunded." },
  { question: "Do venues pay to join?", answer: "Venues can start with a pilot. Ongoing pricing depends on fit, visibility, activity, and whether the venue keeps the layer live after review." },
  { question: "What do buildings pay?", answer: "Buildings can start with a 90-day pilot. Ongoing pricing depends on unit count, resident access, QR placement, activation scope, and reporting needs." },
  { question: "What gets tracked?", answer: "Downtown Perks tracks useful activity signals such as map opens, searches, saves, RSVPs, scans, route clicks, and redemptions. The goal is proof of use, not invasive tracking." },
  { question: "How fast can a partner launch?", answer: "A simple pilot can launch once the partner profile, locations, QR entry points, and first offer or event are ready." },
  { question: "Who can join?", answer: "Residents, buildings, property managers, venues, hotels, brands, civic groups, and selected downtown partners can join after fit review." },
];

export const featuredNearbyExample = {
  title: "Jo’s Coffee",
  subtitle: "Coffee · Quick stops · Daily rituals",
  detail: "Nearby perk · 5-minute walk",
  body: "A fast answer when you want something walkable, useful, and easy to revisit later.",
  ctaLabel: "Show Card",
  href: ROUTES.residentAppCard,
};

export const propertyPreview = {
  title: "The Shore",
  location: "Rainey / Waterfront",
  body: "A residential address tied to nearby dining, lake access, events, and everyday coffee stops in the same downtown layer.",
  ctaLabel: "Open Properties",
  href: ROUTES.partnerProperties,
};

export const nearbyDiscoveryGroups = [
  {
    label: "Daily use",
    items: ["Coffee", "Dinner", "Groceries", "Parks"],
  },
  {
    label: "Plan tonight",
    items: ["Happy hour", "Live events", "Perks", "Walkable now"],
  },
  {
    label: "Stay connected",
    items: ["Buildings", "Hotels", "Saved places", "Card-ready stops"],
  },
];

export const partnerTabPanels = [
  {
    label: "Properties",
    title: "Turn the neighborhood into a resident amenity.",
    body: "Give residents a useful map of nearby places, events, perks, and services tied to where they live.",
    proof: "Lobby QR entry · resident card access · building-level proof",
    href: ROUTES.partnerProperties,
    cta: "Open Properties",
  },
  {
    label: "Hotels",
    title: "Give guests one live downtown layer beyond the lobby.",
    body: "Replace static recommendation lists with a live map of nearby dining, events, wellness, and local perks.",
    proof: "Front desk QR · nearby recommendations · guest activity signals",
    href: ROUTES.partnerHotels,
    cta: "Open Hotels",
  },
  {
    label: "Venues",
    title: "Show up when nearby intent is already forming.",
    body: "Restaurants, bars, cafes, fitness, retail, and experiences can appear while people are already nearby and deciding.",
    proof: "Live map placement · offers and events · redemption tracking",
    href: ROUTES.partnerVenues,
    cta: "Open Venues",
  },
  {
    label: "Brands",
    title: "Activate the right corridor at the right time.",
    body: "Run corridor, event, and sponsor moments inside real downtown behavior instead of broad generic reach.",
    proof: "District placement · source scans · proof of response",
    href: ROUTES.partnerBrands,
    cta: "Open Brands",
  },
  {
    label: "Civic",
    title: "Make district participation easier to see and measure.",
    body: "Bring public events, programs, and community activity into the same live layer people already use.",
    proof: "Program visibility · participation signals · district coverage",
    href: ROUTES.partnerCivic,
    cta: "Open Civic",
  },
];

export const pricingCards = [
  {
    label: "Properties",
    audience: "Multifamily, condos, apartments, and residential buildings",
    price: "Free pilot · $39 · $99 / year",
    value: "Turn the neighborhood into a measurable resident amenity.",
    href: ROUTES.partnerProperties,
  },
  {
    label: "Hotels",
    audience: "Hotels, boutiques, extended stays, and hospitality teams",
    price: "$99–$149 / year",
    value: "Give guests a better downtown starting point than a static lobby guide.",
    href: ROUTES.partnerHotels,
  },
  {
    label: "Venues",
    audience: "Restaurants, bars, cafes, fitness, wellness, and experiences",
    price: "Free for 12 months · then $49–$99 / year",
    value: "Show up while nearby intent is forming and track what happened next.",
    href: ROUTES.partnerVenues,
  },
  {
    label: "Brands",
    audience: "Brand activations, sponsorships, and campaign partners",
    price: "$99–$149 / year",
    value: "Activate the right corridor at the right time with measurable response.",
    href: ROUTES.partnerBrands,
  },
  {
    label: "Civic",
    audience: "Districts, chambers, public spaces, and community partners",
    price: "$49–$79 / year",
    value: "Turn event visibility into clearer participation and district proof.",
    href: ROUTES.partnerCivic,
  },
];

export const getStartedFields = [
  { name: "partnerType", label: "Partner Type", type: "text" },
  { name: "businessName", label: "Building / Business Name", type: "text" },
  { name: "nameRole", label: "Name & Role", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "units", label: "Number of Units", type: "number" },
  { name: "goals", label: "Goals", type: "text" },
];
