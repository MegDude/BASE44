export const partnerRoles = [
  {
    id: "properties",
    label: "Properties",
    href: "/partners/properties",
    eyebrow: "For properties",
    title: "The neighborhood becomes the amenity.",
    body: "Residents at connected buildings see nearby coffee, dining, events, wellness, and perks in a single live surface. No printed welcome packets, no forgotten app tabs. Just the real downtown, organized around their front door.",
    metrics: [
      { value: "14", label: "Buildings connected" },
      { value: "78701", label: "District coverage" },
      { value: "5 min", label: "Average walk radius" },
    ],
    proofQuestion: "Are residents using downtown more easily because of this building?",
    benefits: [
      {
        title: "Neighborhood layer",
        body: "Each connected building gets a live downtown layer centered on the property and tuned to what residents actually use nearby.",
      },
      {
        title: "Resident engagement",
        body: "See how residents interact with nearby places, events, saves, card opens, and redemptions.",
      },
      {
        title: "Amenity lift",
        body: "Give residents a practical neighborhood benefit that feels useful day to day.",
      },
      {
        title: "Event visibility",
        body: "Surface nearby events and programming without relying on scattered calendars and social feeds.",
      },
    ],
    workflow: [
      { number: "1", title: "Connect", body: "Entry points" },
      { number: "2", title: "Residents", body: "Open and use" },
      { number: "3", title: "Map", body: "Nearby and live" },
      { number: "4", title: "Dashboard", body: "See what worked" },
    ],
    whyTabs: [
      { label: "Nearby value", body: "Position the building as connected to a stronger downtown lifestyle." },
      { label: "Daily utility", body: "Give residents something they can use on an ordinary weekday, not only during move-in." },
      { label: "Retention signal", body: "Show how the neighborhood experience contributes to resident value over time." },
    ],
    mapMode: "property",
  },
  {
    id: "hotels",
    label: "Hotels",
    href: "/partners/hotels",
    eyebrow: "For hotels",
    title: "Give guests one live downtown layer beyond the lobby.",
    body: "Guests can find nearby dining, events, wellness, and local perks without relying on a static guide or scattered recommendations.",
    metrics: [
      { value: "Guest", label: "QR entry" },
      { value: "Live", label: "Local guide" },
      { value: "5 min", label: "Walkable radius" },
    ],
    proofQuestion: "Are guests using the hotel as a better starting point for downtown?",
    benefits: [
      { title: "Guest orientation", body: "Replace static lists with a working live map tied to where a guest actually is." },
      { title: "Concierge handoff", body: "Give front desk and concierge teams something current, simple, and trackable." },
      { title: "Nearby lift", body: "Turn local discovery into measurable partner visits and event interest." },
    ],
    workflow: [
      { number: "1", title: "Scan", body: "Guest opens the hotel layer" },
      { number: "2", title: "Browse", body: "Nearby dining, events, and wellness" },
      { number: "3", title: "Go", body: "Routes, saves, and RSVP moments" },
      { number: "4", title: "Measure", body: "Guest activity by source" },
    ],
    whyTabs: [
      { label: "Arrival", body: "Guests want orientation right away, not a static brochure." },
      { label: "Local value", body: "The stay improves when the city around it becomes easier to use." },
      { label: "Proof", body: "Measure which guest prompts drive actual downtown behavior." },
    ],
    mapMode: "hospitality",
  },
  {
    id: "venues",
    label: "Venues",
    href: "/partners/venues",
    eyebrow: "For venues",
    title: "Show up when nearby intent is already forming.",
    body: "Restaurants, bars, cafes, fitness, wellness, retail, and local experiences appear while people are already nearby and deciding what to do next.",
    metrics: [
      { value: "Views", label: "Venue attention" },
      { value: "Routes", label: "Go intent" },
      { value: "Scans", label: "Redemption proof" },
    ],
    proofQuestion: "Is this venue showing up when nearby residents are deciding?",
    benefits: [
      { title: "Live map placement", body: "Appear while someone is still deciding, not after they already chose somewhere else." },
      { title: "Offer timing", body: "Tie happy hour, events, and limited-time value to the moment it matters." },
      { title: "Repeat use", body: "Measure saves, route clicks, scans, RSVPs, and repeat neighborhood behavior." },
    ],
    workflow: [
      { number: "1", title: "Publish", body: "Listing, offer, or event" },
      { number: "2", title: "Appear", body: "Map, nearby results, and cards" },
      { number: "3", title: "Convert", body: "Go, save, RSVP, redeem" },
      { number: "4", title: "Learn", body: "See what moved" },
    ],
    whyTabs: [
      { label: "Nearby intent", body: "People choose what they notice when they are already close." },
      { label: "Clear actions", body: "Save, go, RSVP, and redeem are stronger than vague awareness." },
      { label: "Proof", body: "Track whether the listing led to visits and redemptions." },
    ],
    mapMode: "venue",
  },
  {
    id: "brands",
    label: "Brands",
    href: "/partners/brands",
    eyebrow: "For brands",
    title: "Activate the right corridor at the right time.",
    body: "Brands can sponsor useful local moments, events, offers, and routes that fit naturally into downtown life.",
    metrics: [
      { value: "Reach", label: "Map layer views" },
      { value: "Scans", label: "Campaign entry" },
      { value: "Lift", label: "Partner impact" },
    ],
    proofQuestion: "Did this brand create useful local action?",
    benefits: [
      { title: "Corridor placement", body: "Buy context, not broad reach. Show up where downtown behavior is already happening." },
      { title: "Campaign logic", body: "Tie brand visibility to buildings, venues, districts, and timed downtown moments." },
      { title: "Proof", body: "Track scans, visits, redemptions, and partner lift instead of passive impressions." },
    ],
    workflow: [
      { number: "1", title: "Plan", body: "Choose a format and corridor" },
      { number: "2", title: "Launch", body: "Map, venue, district, and QR touchpoints" },
      { number: "3", title: "Act", body: "Scans, visits, redemptions" },
      { number: "4", title: "Measure", body: "Proof by placement" },
    ],
    whyTabs: [
      { label: "Useful moments", body: "Brands work best when they help someone do something nearby." },
      { label: "District timing", body: "Timed downtown windows matter more than broad generic reach." },
      { label: "Measured action", body: "Tie campaign performance back to real local behavior." },
    ],
    mapMode: "brand",
  },
  {
    id: "civic",
    label: "Civic",
    href: "/partners/civic",
    eyebrow: "For civic",
    title: "Make participation easier to see and easier to join.",
    body: "District teams, public spaces, and civic groups can put events, programs, and community activity in the same layer people already use.",
    metrics: [
      { value: "RSVPs", label: "Participation" },
      { value: "Programs", label: "Public activity" },
      { value: "Districts", label: "Coverage" },
    ],
    proofQuestion: "Is participation easier to see and measure?",
    benefits: [
      { title: "District visibility", body: "Put civic programs in the same map layer as everyday decisions and routes." },
      { title: "Public activity", body: "Make events, spaces, and community moments easier to discover and join." },
      { title: "Measurement", body: "Track public participation without turning it into a generic dashboard pitch." },
    ],
    workflow: [
      { number: "1", title: "Publish", body: "Events, spaces, and programming" },
      { number: "2", title: "Surface", body: "Map, prompts, and QR entry" },
      { number: "3", title: "Participate", body: "Views, saves, RSVP moments" },
      { number: "4", title: "Report", body: "District proof" },
    ],
    whyTabs: [
      { label: "Public good", body: "Put useful civic activity where people already look." },
      { label: "District clarity", body: "Make downtown easier to read and easier to join." },
      { label: "Measured participation", body: "Track turnout and repeat engagement with less friction." },
    ],
    mapMode: "civic",
  },
];

export const operatingRules = [
  {
    label: "Access",
    title: "Let people look around first",
    body: "Open first. Ask for commitment later.",
  },
  {
    label: "Map",
    title: "Show up when someone is deciding",
    body: "Be visible in the decision window. Your place, offer, or event should appear while someone is already downtown and already deciding what to do next.",
  },
  {
    label: "Dashboard",
    title: "Make the numbers easy to use",
    body: "Give partners a clear read on what worked and what to do next.",
  },
];

export const infrastructureModules = [
  {
    title: "Progressive-access resident flow",
    label: "Entry flow",
    body: "Let people browse first, then unlock saves, RSVP, the card, and redemption when they need it.",
    trigger: "Someone opens the map, scans a QR, or saves a place.",
    response: "The shared layer updates what shows up next and what the partner sees in the dashboard.",
  },
  {
    title: "Dynamic QR infrastructure",
    label: "Tracking layer",
    body: "Create QR entry points for buildings, venues, events, hotels, civic programs, table tents, mailers, and brand activations.",
    trigger: "Someone scans a QR from a lobby, venue, event, hotel, or campaign surface.",
    response: "The scan opens the right map context and creates a source signal for the dashboard.",
  },
  {
    title: "Partner offer manager",
    label: "Offer controls",
    body: "Let partners create offers, perks, happy hours, event offers, and sponsor moments without rebuilding the map.",
    trigger: "A partner publishes or updates an offer.",
    response: "The offer appears in the map, card, partner dashboard, and relevant nearby recommendations.",
  },
  {
    title: "Attribution and loyalty signals",
    label: "Measurement layer",
    body: "Connect saves, RSVPs, scans, route clicks, redemptions, and visits into a practical proof model.",
    trigger: "A resident or guest takes an action from the map or card.",
    response: "The action updates partner metrics and recommended next moves.",
  },
];

export const partnerEvents = [
  { title: "Rainey Street Food + Drink Loop", date: "Apr 18", category: "food", location: "Banger's Sausage House & Beer Garden", going: "84 residents going", time: "5:00 PM", cta: "RSVP" },
  { title: "Resident Mixer Night at Lustre Pearl", date: "Apr 25", category: "social", location: "Lustre Pearl Rainey", going: "47 residents going", time: "7:00 PM", cta: "RSVP" },
  { title: "Contemporary Austin Gallery Members Night", date: "Apr 30", category: "arts", location: "The Contemporary Austin — Jones Center", going: "35 residents going", time: "6:00 PM", cta: "RSVP" },
  { title: "Morning Yoga at Waterloo Park", date: "Apr 13", category: "fitness", location: "Waterloo Park", going: "28 residents going", time: "7:30 AM", cta: "RSVP" },
  { title: "Stand-Up Showcase at Comedy Mothership", date: "May 2", category: "nightlife", location: "Comedy Mothership", going: "62 residents going", time: "8:00 PM", cta: "RSVP" },
];

export const featuredProperties = [
  "The Shore",
  "The Independent",
  "70 Rainey",
  "Austonian",
  "The Residences at W Austin",
  "Four Seasons Residences",
  "Plaza Lofts",
  "360 Condos",
];

export const residentialPropertyDetails = {
  "The Shore": { district: "Rainey / Waterfront", body: "A residential tower tied closely to Rainey Street activity and lakefront access.", href: "/brands/the-shore" },
  "The Independent": { district: "West Downtown", body: "A landmark residential tower with strong walkability into the west end and downtown core.", href: "/partners/properties" },
  "70 Rainey": { district: "Rainey / Waterfront", body: "A major Rainey residential address connected to nightlife and the lake.", href: "/partners/properties" },
  Austonian: { district: "Congress", body: "A core downtown residential tower close to Congress, dining, and central business district activity.", href: "/partners/properties" },
  "The Residences at W Austin": { district: "2nd Street", body: "A hospitality-linked residential tower inside a strong shopping, dining, and nightlife loop.", href: "/partners/properties" },
  "Four Seasons Residences": { district: "Waterfront", body: "A luxury residential address connected to the lake, hospitality, and premium local activity.", href: "/brands/four-seasons-residences" },
  "Plaza Lofts": { district: "Warehouse District", body: "A smaller downtown residential point with quick access to daily-use places and cultural destinations.", href: "/partners/properties" },
  "360 Condos": { district: "West Downtown", body: "A central downtown residential point tied to walkable dining, parks, and daily routines.", href: "/partners/properties" },
};

export const partnerExamples = [
  { type: "Residential", name: "The Shore", href: "/brands/the-shore" },
  { type: "Mixed-Use Property", name: "The Paseo", href: "/brands/the-paseo" },
  { type: "Premium Residential", name: "The Waterline", href: "/brands/the-waterline" },
  { type: "Venue", name: "Banger's", href: "/brands/bangers" },
  { type: "Local Bar", name: "Stay Put", href: "/brands/the-stay-put" },
  { type: "Civic Wellness", name: "Fine Eyewear", href: "/brands/fine-eyewear" },
  { type: "Retail Campaign", name: "Heritage Boots", href: "/brands/heritage-boots" },
  { type: "Launch Hospitality", name: "Dottie May", href: "/brands/dottie-may" },
  { type: "Launch Beverage", name: "Topo Chico", href: "/brands/topo-chico" },
  { type: "Hospitality", name: "Hotel Van Zandt", href: "/brands/hotel-van-zandt" },
  { type: "Hospitality", name: "Four Seasons", href: "/brands/four-seasons" },
  { type: "Residential", name: "Four Seasons Residences", href: "/brands/four-seasons-residences" },
  { type: "Residential Services", name: "Inspired Closets Austin", href: "/brands/inspired-closets-austin" },
  { type: "Brand Campaign", name: "YETI", href: "/brands/yeti" },
  { type: "Mobility", name: "Rivian", href: "/brands/rivian" },
  { type: "Retail Wellness", name: "lululemon", href: "/brands/lululemon" },
  { type: "Fitness", name: "Equinox", href: "/brands/equinox" },
  { type: "Civic Entertainment", name: "Austin FC", href: "/brands/austin-fc" },
  { type: "Dining", name: "Fabi & Rosi", href: "/brands/fabi-and-rosi" },
];

export const showcaseExamples = [
  { name: "The Paseo", href: "/brands/the-paseo", body: "Residential-linked campaign surface with building entry and nearby perk visibility." },
  { name: "Hotel Van Zandt", href: "/brands/hotel-van-zandt", body: "Hospitality-led activation showing guest flow into local venues and events." },
  { name: "YETI", href: "/brands/yeti", body: "Branded downtown activation with timing, source tracking, and event tie-ins." },
  { name: "Inspired Closets Austin", href: "/brands/inspired-closets-austin", body: "Home-services brand tied to downtown move-ins, upgrades, and everyday resident needs." },
];

export const partnerFaqs = [
  { question: "Are these separate products or one shared system?", answer: "It is one shared system. Properties, hotels, venues, brands, and civic groups all use the same map and the same action flow." },
  { question: "How are properties handled?", answer: "Properties can launch building-linked map entry, lobby QR access, resident cards, nearby perks, event visibility, and building-level reporting." },
  { question: "What does each partner type get?", answer: "Every partner type gets a relevant map layer, QR entry points, offer or event controls, and a dashboard view built around the actions that matter for that role." },
  { question: "What actions can users take?", answer: "Users can browse, search, save, RSVP, open directions, scan QR codes, use the card, and redeem offers." },
  { question: "How do examples work?", answer: "Examples show how different partner types can use the same map, card, and dashboard system in different ways." },
  { question: "Why does the Brands page go deeper?", answer: "Brand partnerships often need campaign context, sponsorship logic, and example activations, so that page carries more pitch-specific proof." },
  { question: "What makes this credible?", answer: "The system connects visible map placement to measurable action: views, saves, RSVPs, scans, visits, and redemptions." },
  { question: "What should this feel like?", answer: "It should feel like how downtown already works — just easier to use and easier to measure." },
];
