import type {
  ChipItem,
  CapabilityItem,
  PreviewResult,
  RouteCardData,
  StepItem,
  ValueCardItem,
  PricingPlan,
  FooterGroup,
  LinkAction,
} from "@/types/homepage";

export const navLinks: LinkAction[] = [
  { label: "Explore", href: "/explore" },
  { label: "For Buildings", href: "/downtown-perks/for-buildings" },
  { label: "Partners", href: "/partners" },
  { label: "Pricing", href: "/pricing" },
];

export const navCta: LinkAction = {
  label: "Get Started",
  href: "/downtown-perks/for-buildings",
};

export const heroChips: ChipItem[] = [
  { id: "places", label: "Places" },
  { id: "events", label: "Events" },
  { id: "perks", label: "Perks" },
  { id: "buildings", label: "Buildings" },
];

export const heroPrimaryAction: LinkAction = {
  label: "Explore the Map",
  href: "/explore",
};

export const heroSecondaryAction: LinkAction = {
  label: "For Buildings",
  href: "/downtown-perks/for-buildings",
};

export const capabilityTabs: ChipItem[] = [
  { id: "all", label: "All" },
  { id: "places", label: "Places" },
  { id: "offers", label: "Offers" },
  { id: "events", label: "Events" },
  { id: "properties", label: "Properties" },
];

export const capabilityItems: CapabilityItem[] = [
  {
    id: "places-1",
    tab: "places",
    title: "Live venue discovery",
    description:
      "Restaurants, bars, shops, and services pinned on a live map — updated as new places open or close.",
  },
  {
    id: "offers-1",
    tab: "offers",
    title: "Resident-only perks",
    description:
      "Exclusive deals and offers from downtown businesses, visible only to verified downtown residents.",
  },
  {
    id: "events-1",
    tab: "events",
    title: "Neighborhood events",
    description:
      "Local happenings — markets, concerts, pop-ups — surfaced in one feed so nothing gets missed.",
  },
  {
    id: "properties-1",
    tab: "properties",
    title: "Building intelligence",
    description:
      "Property managers see aggregated resident engagement, helping them demonstrate neighborhood value.",
  },
];

export const previewResults: PreviewResult[] = [
  {
    id: "r1",
    type: "place",
    title: "Bangers Sausage House",
    subtitle: "Rainey Street",
    distanceLabel: "0.3 mi",
    offerLabel: "10% off lunch",
    badge: "Perk",
  },
  {
    id: "r2",
    type: "event",
    title: "Sunday Market at Republic Square",
    subtitle: "This Sunday 9am – 2pm",
    distanceLabel: "0.5 mi",
  },
  {
    id: "r3",
    type: "place",
    title: "The Paseo",
    subtitle: "2nd Street District",
    distanceLabel: "0.2 mi",
    offerLabel: "Happy hour 4–7pm",
    badge: "Featured",
  },
];

export const featuredRoute: RouteCardData = {
  title: "The Waterline",
  description:
    "Luxury residences on the banks of Lady Bird Lake with direct access to downtown Austin's best dining and nightlife.",
  address: "70 Rainey St, Austin TX 78701",
  badge: "Featured Building",
  primaryAction: { label: "View on Map", href: "/explore" },
  secondaryAction: { label: "Learn More", href: "/brands/the-waterline" },
};

export const howItWorksSteps: StepItem[] = [
  {
    id: "step-1",
    number: 1,
    title: "Your building joins",
    description:
      "A property manager or operator enrolls the building and sets up the resident layer.",
  },
  {
    id: "step-2",
    number: 2,
    title: "Residents get access",
    description:
      "Residents receive a link or QR code to activate their free Downtown Perks membership.",
  },
  {
    id: "step-3",
    number: 3,
    title: "Explore downtown",
    description:
      "Residents use the live map to find places, claim perks, and discover what's happening nearby.",
  },
  {
    id: "step-4",
    number: 4,
    title: "Insights flow back",
    description:
      "Buildings and partners see engagement data — helping everyone improve the downtown experience.",
  },
];

export const residentValueCards: ValueCardItem[] = [
  {
    id: "v1",
    title: "Everything nearby, on one map",
    description:
      "Find places to eat, drink, shop, and explore without jumping between five different apps.",
    action: { label: "Open the map", href: "/explore" },
  },
  {
    id: "v2",
    title: "Perks just for living here",
    description:
      "Exclusive resident discounts and offers from participating downtown businesses.",
    action: { label: "See perks", href: "/perks" },
  },
  {
    id: "v3",
    title: "Never miss what's on",
    description:
      "Local events, pop-ups, and neighborhood happenings surfaced automatically.",
    action: { label: "Browse events", href: "/events" },
  },
];

export const partnerPreviews: ValueCardItem[] = [
  {
    id: "p1",
    title: "Residential buildings",
    description:
      "Offer residents a neighborhood layer that strengthens community and demonstrates property value.",
    action: { label: "For buildings", href: "/downtown-perks/for-buildings" },
  },
  {
    id: "p2",
    title: "Local businesses",
    description:
      "Reach verified downtown residents at the exact moment they're deciding where to go.",
    action: { label: "For partners", href: "/partners" },
  },
  {
    id: "p3",
    title: "Hotels & hospitality",
    description:
      "Give guests a concierge-quality downtown guide from the moment they check in.",
    action: { label: "For hotels", href: "/partners/hotels" },
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    id: "resident",
    title: "Resident",
    audience: "For downtown residents",
    price: "Free",
    description:
      "Full access to the live map, perks, and events. Activated through your building.",
    action: { label: "Explore the map", href: "/explore" },
  },
  {
    id: "building",
    title: "Building",
    audience: "For property managers",
    price: "Starting at $299/mo",
    description:
      "Resident layer, building intelligence dashboard, and engagement reporting.",
    action: { label: "Start a pilot", href: "/downtown-perks/for-buildings" },
    featured: true,
  },
  {
    id: "partner",
    title: "Partner",
    audience: "For local businesses",
    price: "Starting at $99/mo",
    description:
      "List your venue, publish offers and events, and reach verified downtown residents.",
    action: { label: "Become a partner", href: "/partners" },
  },
];

export const footerGroups: FooterGroup[] = [
  {
    id: "explore",
    title: "Explore",
    links: [
      { label: "Live Map", href: "/explore" },
      { label: "Events", href: "/events" },
      { label: "Perks", href: "/perks" },
      { label: "About", href: "/downtown-perks/about" },
    ],
  },
  {
    id: "partners",
    title: "For Partners",
    links: [
      { label: "Buildings", href: "/downtown-perks/for-buildings" },
      { label: "Businesses", href: "/partners" },
      { label: "Hotels", href: "/partners/hotels" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    id: "company",
    title: "Company",
    links: [
      { label: "About", href: "/downtown-perks/about" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
];
