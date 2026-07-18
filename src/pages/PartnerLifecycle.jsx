import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Camera,
  Check,
  CreditCard,
  Hotel,
  Landmark,
  Megaphone,
  MapPin,
  QrCode,
  Receipt,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { ANNUAL_PLANS, PRICING_MODULES, formatCurrency } from "@/config/pricingRegistry";
import { resolveCheckoutTarget } from "@/config/checkoutLinks";

const PARTNER_SETUP_KEY = "dp_partner_lifecycle_setup";

const partnerTypes = [
  {
    id: "property",
    label: "Property",
    eyebrow: "Property",
    icon: Building2,
    template: "Resident amenity workspace",
    plan: "Resident Plus",
    price: "$99 annually",
    outcome: "The neighborhood becomes part of your amenity.",
    overview: "Best for buildings that want residents to regularly discover local businesses, events, and neighborhood experiences.",
    includes: ["Building profile", "Interactive map listing", "Resident welcome QR", "Unlimited perks", "Unlimited events", "Campaign reporting", "Priority support"],
  },
  {
    id: "hotel",
    label: "Hotel",
    eyebrow: "Hotels",
    icon: Hotel,
    template: "Guest experience workspace",
    plan: "Hotel Starter",
    price: "$149 annually",
    outcome: "Help guests experience more than the lobby.",
    overview: "Recommended for hotels that want a polished local guide, QR handoff, and measurable guest engagement.",
    includes: ["Hotel profile", "Guest QR path", "Nearby recommendations", "Event visibility", "Guest activity reporting", "Concierge-ready links"],
  },
  {
    id: "venue",
    label: "Venue",
    eyebrow: "Venues",
    icon: Store,
    template: "Local discovery workspace",
    plan: "Venue Basic",
    price: "$99 annually",
    outcome: "Become tonight's decision.",
    overview: "A clean fit for restaurants, cafes, nightlife, music, and cultural venues that want to turn nearby intent into visits.",
    includes: ["Venue profile", "Offer publishing", "Event publishing", "Directions activity", "Resident saves", "Campaign reporting"],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    eyebrow: "Restaurants",
    icon: Store,
    template: "Dining and offer workspace",
    plan: "Venue Basic",
    price: "$99 annually",
    outcome: "Give nearby residents a clear reason to choose you.",
    overview: "Recommended for restaurants and cafes that want perks, events, and moments to appear when people are deciding what is nearby.",
    includes: ["Dining profile", "Perk campaigns", "Happy hour placement", "QR redemption", "Resident saves", "Performance reporting"],
  },
  {
    id: "brand",
    label: "Brand",
    eyebrow: "Brands",
    icon: Sparkles,
    template: "Campaign workspace",
    plan: "Brand Starter",
    price: "$249 annually",
    outcome: "Meet people while they're already downtown.",
    overview: "Built for sponsors and destination brands that want to support experiences residents already choose.",
    includes: ["Brand profile", "Sponsored campaigns", "District targeting", "QR moments", "Activation reporting", "Audience signals"],
  },
  {
    id: "civic",
    label: "Civic",
    eyebrow: "Civic",
    icon: Landmark,
    template: "District and program workspace",
    plan: "Civic Community",
    price: "Custom",
    outcome: "Help more people discover their city.",
    overview: "For organizations coordinating public spaces, events, wayfinding, community participation, and district-level storytelling.",
    includes: ["Civic profile", "Public programming", "Event publishing", "Wayfinding", "Participation reporting", "Community prompts"],
  },
  {
    id: "real-estate",
    label: "Real Estate",
    eyebrow: "Real estate",
    icon: MapPin,
    template: "Listing intelligence workspace",
    plan: "Real Estate Starter",
    price: "$199 annually",
    outcome: "Show the neighborhood before the showing.",
    overview: "For leasing, sales, and development teams that need the surrounding district to help tell the property story.",
    includes: ["Listing profile", "Neighborhood context", "Map visibility", "Inquiry path", "Tour requests", "Performance reporting"],
  },
  {
    id: "retail",
    label: "Retail",
    eyebrow: "Retail",
    icon: Store,
    template: "Shopping and campaign workspace",
    plan: "Venue Growth",
    price: "$149 annually",
    outcome: "Turn nearby browsing into a reason to stop in.",
    overview: "Recommended for shops and service businesses that want local discovery, resident saves, and offer-driven visits.",
    includes: ["Retail profile", "Offer publishing", "QR redemption", "Resident saves", "Directions activity", "Campaign reporting"],
  },
];

const trustPartners = ["Toast", "BuildingLink", "SevenRooms", "OpenTable", "Eventbrite", "Stripe", "Square", "HubSpot", "Salesforce", "Google", "Shopify", "Zapier"];

const impactGroups = [
  {
    title: "Bring in more customers",
    items: [
      ["Perk Campaign", "For offers residents can use this week.", "Use when traffic needs a clear next step.", "More saves, directions, and redemptions.", "$49"],
      ["Featured Campaign", "For moments that should lead the map.", "Use during launches, weekends, or seasonal pushes.", "Higher visibility in nearby discovery.", "$99"],
      ["Sponsored Campaign", "For district-level attention.", "Use when the audience should extend beyond one listing.", "Broader reach with reporting.", "$249"],
    ],
  },
  {
    title: "Promote an event",
    items: [
      ["Featured Event", "For events that need resident attention.", "Use before a planned activation.", "More RSVPs and detail views.", "$49"],
      ["Sponsored Event", "For larger moments or destination events.", "Use when event discovery should be amplified.", "More map impressions and saves.", "$149"],
      ["Event Boost", "For same-week momentum.", "Use when attendance needs one more push.", "Better timing around nearby intent.", "$79"],
    ],
  },
  {
    title: "Learn from your community",
    items: [
      ["Survey", "For direct resident feedback.", "Use when you need a simple answer quickly.", "Clearer planning signals.", "$99"],
      ["Survey Series", "For recurring insight.", "Use across launches, seasons, or campaigns.", "Better trend visibility.", "$249"],
      ["Research", "For custom audience questions.", "Use when decisions need deeper context.", "A more useful resident view.", "Custom"],
    ],
  },
  {
    title: "Increase visibility",
    items: [
      ["Featured Placement", "For stronger map presence.", "Use when discovery matters most.", "More high-intent views.", "$99"],
      ["District Sponsorship", "For supporting a broader downtown area.", "Use when the brand should be tied to place.", "District-level attribution.", "Custom"],
      ["Homepage Placement", "For major moments.", "Use when a campaign deserves front-door visibility.", "A clearer path from awareness to action.", "$299"],
    ],
  },
];

const professionalServices = [
  ["Launch Kit", QrCode, "QR setup, welcome materials, and publishing support."],
  ["Photography", Camera, "Polished images for profiles, offers, events, and listings."],
  ["Creative", Megaphone, "Campaign copy, offer framing, and resident-facing messaging."],
  ["Resident Activation", Users, "Launch communication that helps people understand what to do."],
  ["Street Team", MapPin, "On-site support for QR placement and event activation."],
  ["Training", BadgeCheck, "A practical workspace handoff for your team."],
  ["Research", Sparkles, "Resident feedback, survey setup, and insight packaging."],
  ["Custom Campaign", CalendarDays, "A tailored launch or district activation plan."],
];

const integrationPartners = [
  {
    id: "toast",
    name: "Toast",
    category: "Hospitality",
    logo: "/images/integrations/toast.svg",
    headline: "Connect discovery to restaurant operations.",
    copy: "Keep menus, offer links, and redemption references aligned while Downtown Perks helps nearby residents decide where to go.",
    signals: ["Location details", "Offer links", "Redemption references"],
  },
  {
    id: "buildinglink",
    name: "BuildingLink",
    category: "Property",
    logo: "/images/integrations/buildinglink.png",
    headline: "Extend resident communication into the neighborhood.",
    copy: "Connect building touchpoints with nearby perks, events, and welcome paths without replacing the resident systems your team already uses.",
    signals: ["Resident welcome paths", "Property access", "Location context"],
  },
  {
    id: "sevenrooms",
    name: "SevenRooms",
    category: "Hospitality",
    logo: "/images/integrations/sevenrooms.svg",
    headline: "Move from discovery to a guest relationship.",
    copy: "Pair nearby intent with reservation and guest-experience workflows so the path from map discovery to a visit stays clear.",
    signals: ["Reservation links", "Venue details", "Campaign attribution"],
  },
  {
    id: "opentable",
    name: "OpenTable",
    category: "Hospitality",
    logo: "/images/integrations/opentable.svg",
    headline: "Make a nearby dining decision bookable.",
    copy: "Surface reservation links directly from relevant listings, perks, and map moments while keeping booking activity in OpenTable.",
    signals: ["Reservation links", "Dining profiles", "Visit intent"],
  },
  {
    id: "eventbrite",
    name: "Eventbrite",
    category: "Marketing",
    logo: "/images/integrations/eventbrite.svg",
    headline: "Carry event interest through to registration.",
    copy: "Connect Downtown Perks event discovery with the registration workflow your team already manages in Eventbrite.",
    signals: ["Event links", "Schedule details", "Registration handoff"],
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "Commerce",
    logo: "/images/integrations/stripe.svg",
    headline: "Keep partner billing secure and familiar.",
    copy: "Use Stripe-backed checkout and billing references while Downtown Perks manages membership context and workspace access.",
    signals: ["Checkout", "Membership status", "Billing references"],
  },
  {
    id: "square",
    name: "Square",
    category: "Commerce",
    logo: "/images/integrations/square.svg",
    headline: "Connect local offers with existing commerce.",
    copy: "Keep commerce in Square while Downtown Perks provides the nearby discovery, directions, and redemption path.",
    signals: ["Offer links", "Location details", "Redemption references"],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "Marketing",
    logo: "/images/integrations/hubspot.svg",
    headline: "Carry qualified partner interest into your CRM.",
    copy: "Route partner and campaign context into HubSpot so follow-up begins with the organization, location, and intent already understood.",
    signals: ["Partner leads", "Campaign context", "Lifecycle stage"],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    category: "Marketing",
    logo: "/images/integrations/salesforce.svg",
    headline: "Connect downtown activity with account context.",
    copy: "Share governed partner, campaign, and location references with Salesforce without turning the public experience into a CRM dashboard.",
    signals: ["Account references", "Campaign context", "Location ownership"],
  },
  {
    id: "google",
    name: "Google",
    category: "Google",
    logo: "/images/integrations/google.svg",
    headline: "Keep place, calendar, and map context connected.",
    copy: "Use Business Profile, Calendar, and Maps data where appropriate while Downtown Perks remains the resident-facing discovery layer.",
    signals: ["Business Profile", "Calendar", "Maps"],
  },
  {
    id: "shopify",
    name: "Shopify",
    category: "Commerce",
    logo: "/images/integrations/shopify.svg",
    headline: "Connect product moments to a local visit.",
    copy: "Link relevant products and campaigns without duplicating catalog or checkout workflows inside Downtown Perks.",
    signals: ["Product links", "Campaign context", "Checkout handoff"],
  },
  {
    id: "zapier",
    name: "Zapier",
    category: "Marketing",
    logo: "/images/integrations/zapier.svg",
    headline: "Automate the handoffs around your workflow.",
    copy: "Trigger governed follow-up between Downtown Perks and the tools your team already uses, without exposing technical setup to residents.",
    signals: ["Workflow triggers", "Notifications", "Record handoff"],
  },
];

const integrationCatalog = [
  {
    category: "Hospitality",
    tools: ["Toast", "SevenRooms", "OpenTable", "Resy", "inKind"],
    headline: "Keep discovery connected to the guest journey.",
    copy: "Reservations, loyalty, and restaurant operations remain in the hospitality tools your team already uses.",
    signals: ["Location details", "Reservation links", "Offer and loyalty context"],
  },
  {
    category: "Property",
    tools: ["BuildingLink", "Entrata", "Yardi", "ActiveBuilding"],
    headline: "Extend resident systems into the neighborhood.",
    copy: "Property platforms remain the operational source while Downtown Perks connects residents with nearby places, events, and benefits.",
    signals: ["Resident welcome paths", "Property context", "Neighborhood access"],
  },
  {
    category: "Marketing",
    tools: ["HubSpot", "Mailchimp", "Salesforce", "Zapier"],
    headline: "Carry useful context into follow-up.",
    copy: "Keep customer and campaign workflows in your marketing stack while Downtown Perks provides governed location and intent context.",
    signals: ["Campaign context", "Lifecycle handoff", "Workflow triggers"],
  },
  {
    category: "Commerce",
    tools: ["Stripe", "Square", "Shopify", "Clover"],
    headline: "Connect intent without duplicating checkout.",
    copy: "Commerce remains in the system built to manage it while Downtown Perks supports discovery, offers, and the path to purchase.",
    signals: ["Checkout handoff", "Offer links", "Redemption references"],
  },
  {
    category: "Google",
    tools: ["Business Profile", "Calendar", "Maps"],
    headline: "Keep place and schedule information aligned.",
    copy: "Use Google services for governed business, calendar, and navigation context while Downtown Perks remains the resident-facing discovery layer.",
    signals: ["Business Profile", "Calendar", "Maps"],
  },
];

const integrationLogoAliases = {
  inKind: "/pins/brands/inkind-logo.png",
  "Business Profile": "/images/integrations/google.svg",
  Calendar: "/images/integrations/google.svg",
  Maps: "/images/integrations/google.svg",
};

const timelineSteps = [
  "Choose your membership",
  "Create your workspace",
  "Connect your existing software",
  "Publish your first offer or event",
  "Reach nearby residents",
  "Track visits and results",
];

const faqItems = [
  ["Can I connect Toast?", "Yes. Downtown Perks works alongside Toast and related hospitality tools."],
  ["Can residents keep existing rewards?", "Yes. Existing loyalty programs stay in place while Downtown Perks helps residents find and use them."],
  ["Do residents need an app?", "No. Residents can use the map, QR codes, and their card without downloading another app."],
  ["Can I cancel?", "Yes. Review standard memberships before renewal. Custom programs include clear terms before launch."],
  ["Can multiple locations share one account?", "Yes. One workspace can manage multiple locations while keeping each location's results clear."],
  ["Can buildings invite residents automatically?", "Yes. Property teams can use welcome links, QR codes, and connected communication tools."],
];

const setupModules = [
  "Live Map",
  "Campaigns",
  "Reporting",
  "Offers",
  "Events",
  "Team",
  "Billing",
  "QR Experiences",
  "Connections",
  "Map Assistant",
];

const workspacePreviewRows = [
  ["Business profile", "Keep your business details, photos, hours, and links up to date on the map."],
  ["Offers", "Create discounts and perks that residents can save and use."],
  ["Events", "Add upcoming events and share the details people need to attend."],
  ["QR codes", "Create QR codes for signs, menus, front desks, staff, and events."],
  ["Promotions", "Give an offer, event, or location more visibility when it matters."],
  ["Results", "See views, saves, directions, redemptions, and RSVPs in one place."],
  ["Connected tools", "Link the booking, payment, property, and marketing tools you already use."],
  ["Plan and billing", "View your membership, payment details, and invoices."],
];

const provisioningSteps = [
  "Organization",
  "Workspace",
  "Owner access",
  "Team access",
  "Public profile",
  "Activity view",
  "Reports",
  "Campaign tools",
  "Offers",
  "Events",
  "Map presence",
  "QR materials",
  "Billing",
  "Membership",
  "Map assistant",
];

function getStoredSetup() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(PARTNER_SETUP_KEY) || "{}");
  } catch {
    return {};
  }
}

function normalizePartnerType(value) {
  const raw = String(value || "").trim().toLowerCase();
  return partnerTypes.find((type) => type.id === raw || type.label.toLowerCase() === raw || type.label.toLowerCase().replace(/\s+/g, "-") === raw);
}

function hydrateSetupFromParams(search) {
  const params = new URLSearchParams(search);
  const selectedType = normalizePartnerType(params.get("partnerType") || params.get("partnerLabel") || params.get("type"));
  const planId = params.get("plan") || params.get("sku");
  const selectedPlan = ANNUAL_PLANS.find((plan) => plan.id === planId);
  const moduleIds = (params.get("modules") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const selectedModules = PRICING_MODULES.filter((module) => moduleIds.includes(module.id));
  const checkoutKey = selectedPlan?.checkoutKey || params.get("checkoutKey");
  const checkoutTarget = checkoutKey && checkoutKey !== "custom" ? resolveCheckoutTarget(checkoutKey) : null;

  return {
    ...(selectedType
      ? {
          organizationType: selectedType.id,
          partnerType: selectedType.label,
          workspaceTemplate: selectedType.template,
          plan: selectedPlan?.label || selectedType.plan,
        }
      : {}),
    ...(selectedPlan
      ? {
          plan: selectedPlan.label,
          sku: selectedPlan.id,
          checkoutKey: selectedPlan.checkoutKey,
          annualTotal: selectedPlan.annualPrice == null ? "custom" : selectedPlan.annualPrice,
        }
      : {}),
    ...(moduleIds.length
      ? {
          modules: moduleIds,
          moduleLabels: selectedModules.map((module) => module.label),
        }
      : {}),
    ...(params.has("annualTotal") ? { annualTotal: params.get("annualTotal") } : {}),
    ...(params.has("oneTimeTotal") ? { oneTimeTotal: params.get("oneTimeTotal") } : {}),
    ...(params.has("annualAddOnTotal") ? { annualAddOnTotal: params.get("annualAddOnTotal") } : {}),
    ...(params.has("locationCount") ? { locationCount: params.get("locationCount") } : {}),
    ...(params.has("campaignInterest") ? { campaignInterest: params.get("campaignInterest") } : {}),
    ...(params.has("reportingNeeds") ? { reportingNeeds: params.get("reportingNeeds") } : {}),
    ...(checkoutTarget ? { checkoutTarget } : {}),
    source: params.get("intent") === "partner-registration" ? "marketing_pricing" : undefined,
  };
}

function saveSetup(nextSetup) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PARTNER_SETUP_KEY, JSON.stringify(nextSetup));
}

function trackLifecycleEvent(eventName, payload = {}) {
  if (typeof window === "undefined") return;
  const event = {
    event: eventName,
    timestamp: new Date().toISOString(),
    source: "partner_lifecycle",
    ...payload,
  };
  window.dispatchEvent(new CustomEvent("dp:analytics", { detail: event }));
  window.dataLayer?.push(event);
}

function getStage(pathname) {
  if (pathname.includes("/tools")) return "tools";
  if (pathname.includes("/sign-up")) return "start";
  if (pathname.includes("/start")) return "start";
  if (pathname.includes("/register")) return "register";
  if (pathname.includes("/checkout")) return "checkout";
  if (pathname.includes("/provision")) return "provision";
  return "start";
}

function getSelectedPartnerType(setup = {}) {
  return normalizePartnerType(setup.organizationType || setup.partnerType || setup.industry) || partnerTypes[0];
}

function formatPlanTotal(setup, fallback = "$99") {
  if (setup?.annualTotal && setup.annualTotal !== "custom") return formatCurrency(Number(setup.annualTotal));
  return fallback;
}

function LifecycleShell({ stage, children }) {
  const isTools = stage === "tools";
  return (
    <main className={`dp-partner-lifecycle-page dp-partner-lifecycle-page-${stage} ${isTools ? "dp-partner-lifecycle-page-start" : ""}`}>
      <header className="dp-partner-lifecycle-hero">
        <div>
          <p>{isTools ? "Partner platform" : "For partners"}</p>
          <h1>{isTools ? "One clear workspace for your downtown presence." : "Turn residents into regulars."}</h1>
          <span>
            {isTools
              ? "Publish perks and events, preview your listing on the map, and understand what residents respond to—without replacing the systems that already run your business."
              : "Publish offers and events, appear on the map, and see what people use."}
          </span>
          <div className="dp-partner-lifecycle-hero-actions">
            <Link to={stage === "register" ? "#partner-signup" : isTools ? "/partner-workspace/overview" : stage === "start" ? "/partners/register" : "/partners/pricing"}>
              {isTools ? "Open workspace" : stage === "register" ? "Continue to signup" : "Join Downtown Perks"}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link to={isTools ? "/partners#partners" : "/partners/tools#platform-tools"}>{isTools ? "View membership" : "View partner tools"}</Link>
          </div>
        </div>
        <Link className="dp-partner-lifecycle-utility-link" to={isTools ? "/partners/register" : "/partner-workspace/overview"}>
          {isTools ? "Create partner account" : "Partner sign in"}
          <ArrowRight aria-hidden="true" />
        </Link>
      </header>

      {!isTools ? (
        <section className="dp-partner-trust-strip" aria-label="Connected tools">
          <span>Works with</span>
          <div>
            {trustPartners.map((partner) => <strong key={partner}>{partner}</strong>)}
          </div>
        </section>
      ) : null}

      {children}
    </main>
  );
}

function ChooseBusinessSection({ setup, setSetup }) {
  const selectedType = getSelectedPartnerType(setup);

  function selectType(type) {
    const nextSetup = {
      ...setup,
      organizationType: type.id,
      partnerType: type.label,
      workspaceTemplate: type.template,
      plan: setup.plan || type.plan,
      defaultModules: setup.defaultModules || setupModules.slice(0, 6),
    };
    setSetup(nextSetup);
    saveSetup(nextSetup);
    trackLifecycleEvent("partner_type_selected", { partnerType: type.label, source: "membership_journey" });
  }

  return (
    <section id="partners" className="dp-partner-lifecycle-section dp-partner-business-section">
      <div className="dp-partner-lifecycle-section-head">
        <h2>Choose your business</h2>
        <span>Choose the closest match. We’ll recommend the right membership.</span>
      </div>
      <div className="dp-partner-lifestyle-grid">
        {partnerTypes.slice(0, 7).map((type) => {
          const isSelected = selectedType.id === type.id;
          const TypeIcon = type.icon;
          return (
            <button
              key={type.id}
              type="button"
              className={isSelected ? "is-selected" : ""}
              aria-pressed={isSelected}
              onClick={() => selectType(type)}
            >
              <span className="dp-partner-business-icon" aria-hidden="true"><TypeIcon /></span>
              <span className="dp-partner-business-copy">
                <strong>{type.eyebrow}</strong>
                <small>{type.outcome}</small>
              </span>
              <span className="dp-partner-business-state">{isSelected ? "Selected" : "Select"}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RecommendedMembership({ setup }) {
  const selectedType = getSelectedPartnerType(setup);
  const total = formatPlanTotal(setup, selectedType.price?.replace(" annually", "") || "$99");
  const pricingHref = `/pricing?intent=partner-registration&partnerType=${encodeURIComponent(selectedType.id)}`;

  return (
    <section className="dp-partner-lifecycle-section dp-partner-recommendation-section">
      <div className="dp-partner-lifecycle-section-head">
        <h2>Your membership</h2>
        <span>Based on your selected business type.</span>
      </div>
      <div className="dp-partner-recommendation-grid">
        <article className="dp-partner-recommended-plan">
          <span>Recommended</span>
          <h3>{selectedType.plan}</h3>
          <p>{selectedType.overview}</p>
          <strong>{total === "Custom" ? "Custom setup" : `${total} annually`}</strong>
          <div>
            {selectedType.includes.map((item) => (
              <span key={item}><Check aria-hidden="true" />{item}</span>
            ))}
          </div>
          <Link to={pricingHref}>
            Choose plan
            <ArrowRight aria-hidden="true" />
          </Link>
        </article>
        <details className="dp-partner-plan-comparison">
          <summary>View all memberships</summary>
          <div>
            {partnerTypes.slice(0, 7).map((type) => (
              <Link key={type.id} to={`/pricing?intent=partner-registration&partnerType=${encodeURIComponent(type.id)}`}>
                <span>{type.label}</span>
                <strong>{type.plan}</strong>
                <em>{type.price}</em>
              </Link>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}

function PlatformToolsSection() {
  return (
    <section id="platform-tools" className="dp-partner-lifecycle-section dp-partner-tools-section">
      <div className="dp-partner-lifecycle-section-head">
        <p>Platform tools</p>
        <h2>Everything follows the same simple workflow.</h2>
        <span>Create, preview, publish, and measure from one consistent workspace.</span>
      </div>
      <div className="dp-partner-tools-list">
        {impactGroups.map((group) => (
          <article key={group.title}>
            <h3>{group.title}</h3>
            <p>{group.items[0][3]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function GrowthProgramsSection() {
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const activeGroup = impactGroups[activeGroupIndex];
  const allPrograms = impactGroups.flatMap((group) => group.items);
  const selectedItems = allPrograms.filter(([headline]) => selectedPrograms.includes(headline));
  const estimatedTotal = selectedItems.reduce((total, item) => {
    const amount = Number(String(item[4]).replace(/[^0-9.]/g, ""));
    return total + (Number.isFinite(amount) ? amount : 0);
  }, 0);
  const customCount = selectedItems.filter((item) => item[4] === "Custom").length;

  function toggleProgram(headline) {
    setSelectedPrograms((current) => (
      current.includes(headline)
        ? current.filter((item) => item !== headline)
        : [...current, headline]
    ));
  }

  return (
    <section id="growth-programs" className="dp-partner-lifecycle-section dp-partner-growth-section">
      <div className="dp-partner-lifecycle-section-head">
        <p>Pricing builder</p>
        <h2>Estimate the programs you need.</h2>
        <span>Select add-ons across each outcome. Your estimate updates as you build, while custom programs remain clearly marked for review.</span>
      </div>
      <div className="dp-growth-programs">
        <div className="dp-growth-program-tabs" role="tablist" aria-label="Add-on categories">
          {impactGroups.map((group, index) => (
            <button
              key={group.title}
              id={`growth-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={activeGroupIndex === index}
              aria-controls="growth-program-panel"
              className={activeGroupIndex === index ? "is-active" : ""}
              onClick={() => setActiveGroupIndex(index)}
            >
              {group.title}
            </button>
          ))}
        </div>
        <div
          id="growth-program-panel"
          className="dp-growth-program-panel"
          role="tabpanel"
          aria-labelledby={`growth-tab-${activeGroupIndex}`}
        >
          <div className="dp-growth-program-panel-head">
            <h3>{activeGroup.title}</h3>
          </div>
          <div className="dp-growth-program-list">
            {activeGroup.items.map(([headline, who, , outcome, price]) => {
              const isSelected = selectedPrograms.includes(headline);
              return (
                <label key={headline} className={isSelected ? "is-selected" : ""}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleProgram(headline)}
                  />
                  <span>
                    <strong>{headline}</strong>
                    <small>{who} {outcome}</small>
                  </span>
                  <b>{price}</b>
                </label>
              );
            })}
          </div>
        </div>
        <aside className="dp-growth-estimate" aria-live="polite">
          <div>
            <span>Estimated add-ons</span>
            <strong>{`${estimatedTotal}`}</strong>
          </div>
          <p>
            {selectedPrograms.length
              ? `${selectedPrograms.length} selected${customCount ? ` · ${customCount} custom quote` : ""}`
              : "Select programs to build an estimate."}
          </p>
          <Link to={`/pricing?intent=partner-registration&modules=${encodeURIComponent(selectedPrograms.join(","))}`}>
            Continue with estimate
            <ArrowRight aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </section>
  );
}

function ProfessionalServicesSection() {
  return (
    <section className="dp-partner-lifecycle-section dp-partner-services-section">
      <div className="dp-partner-lifecycle-section-head">
        <p>Professional launch services</p>
        <h2>Want us to help?</h2>
        <span>
          Whether you need photography, campaign planning, QR installation, or a complete launch, our team can help you get everything live quickly.
        </span>
      </div>
      <div className="dp-professional-service-list">
        {professionalServices.map(([title, , copy]) => (
          <article key={title}>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
      <Link className="dp-partner-section-action" to="/contact">
        Discuss launch support
        <ArrowRight aria-hidden="true" />
      </Link>
    </section>
  );
}

function IntegrationsSection() {
  const [activeCategory, setActiveCategory] = useState(integrationCatalog[0].category);
  const [selectedTool, setSelectedTool] = useState(integrationCatalog[0].tools[0]);
  const activeGroup = integrationCatalog.find((group) => group.category === activeCategory) || integrationCatalog[0];
  const selectedPartner = integrationPartners.find((partner) => partner.name === selectedTool);
  const selectedLogo = selectedPartner?.logo || integrationLogoAliases[selectedTool];
  const detail = selectedPartner || {
    name: selectedTool,
    category: activeGroup.category,
    headline: activeGroup.headline,
    copy: activeGroup.copy,
    signals: activeGroup.signals,
  };

  function selectCategory(group) {
    setActiveCategory(group.category);
    setSelectedTool(group.tools[0]);
  }

  return (
    <section id="integrations" className="dp-partner-lifecycle-section dp-partner-integrations-section">
      <div className="dp-partner-lifecycle-section-head">
        <p>Integrations</p>
        <h2>One connected operating layer.</h2>
        <span>Select a category, then a platform. Every supported tool now lives in this single integration matrix.</span>
      </div>
      <div className="dp-integration-category-tabs" role="tablist" aria-label="Integration categories">
        {integrationCatalog.map((group) => (
          <button
            key={group.category}
            type="button"
            role="tab"
            aria-selected={activeCategory === group.category}
            className={activeCategory === group.category ? "is-active" : ""}
            onClick={() => selectCategory(group)}
          >
            <span>{group.category}</span>
            <small>{group.tools.length}</small>
          </button>
        ))}
      </div>
      <div className="dp-integration-matrix-layout">
        <div className="dp-integration-logo-matrix" role="list" aria-label={`${activeGroup.category} integrations`}>
          {activeGroup.tools.map((tool) => {
            const partner = integrationPartners.find((item) => item.name === tool);
            const logo = partner?.logo || integrationLogoAliases[tool];
            const isSelected = selectedTool === tool;
            return (
              <button
                key={tool}
                type="button"
                role="listitem"
                className={isSelected ? "is-selected" : ""}
                aria-pressed={isSelected}
                onClick={() => setSelectedTool(tool)}
              >
                {logo ? <img src={logo} alt={`${tool} logo`} loading="lazy" /> : <b aria-hidden="true">{tool.slice(0, 2)}</b>}
                <span>{tool}</span>
              </button>
            );
          })}
        </div>
        <article className="dp-integration-detail" aria-live="polite">
          <p>{activeGroup.category}</p>
          <h3>{detail.name}</h3>
          <strong>{detail.headline}</strong>
          <span>{detail.copy}</span>
          <div>
            {detail.signals.map((signal) => <small key={signal}>{signal}</small>)}
          </div>
          <Link to="/contact">
            Discuss this integration
            <ArrowRight aria-hidden="true" />
          </Link>
        </article>
      </div>
    </section>
  );
}

function TimelineSection() {
  return (
    <section className="dp-partner-lifecycle-section dp-partner-timeline-section">
      <div className="dp-partner-lifecycle-section-head">
        <h2>How launch works</h2>
        <span>Most partners can publish within a few days.</span>
      </div>
      <ol className="dp-partner-timeline" aria-label="Partner launch timeline">
        {timelineSteps.map((step, index) => (
          <li key={step}>
            <b>0{index + 1}</b>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="dp-partner-lifecycle-section dp-partner-faq-section">
      <div className="dp-partner-lifecycle-section-head">
        <h2>Questions</h2>
      </div>
      <div className="dp-partner-faq-list">
        {faqItems.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="dp-partner-lifecycle-section dp-partner-final-cta">
      <h2>Ready to join?</h2>
      <span>Choose a membership and bring your business into the downtown map.</span>
      <div>
        <Link to="/partners/register">Join Downtown Perks</Link>
        <Link to="/contact">Contact us</Link>
      </div>
    </section>
  );
}

function StartStage({ setup, setSetup }) {
  return (
    <>
      <ChooseBusinessSection setup={setup} setSetup={setSetup} />
      <RecommendedMembership setup={setup} />
      <TimelineSection />
      <FinalCtaSection />
      <FaqSection />
    </>
  );
}

function ToolsStage() {
  return (
    <>
      <PlatformToolsSection />
      <GrowthProgramsSection />
      <IntegrationsSection />
      <ProfessionalServicesSection />
      <FinalCtaSection />
    </>
  );
}

function RegisterStage({ setup, setSetup }) {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    organization: setup.organization || "",
    website: setup.website || "",
    address: setup.address || "",
    contact: setup.contact || "",
    phone: setup.phone || "",
    email: setup.email || "",
    manager: setup.manager || "",
    industry: setup.industry || setup.partnerType || "",
    googleBusiness: setup.googleBusiness || "",
    description: setup.description || "",
  });

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    if (!form.organization.trim() || !form.contact.trim() || !form.email.trim()) {
      trackLifecycleEvent("registration_validation_failed", {
        partnerType: setup.partnerType,
        missing: ["organization", "contact", "email"].filter((field) => !form[field]?.trim()),
      });
      return;
    }
    const nextSetup = { ...setup, ...form };
    setSetup(nextSetup);
    saveSetup(nextSetup);
    trackLifecycleEvent("registration_completed", {
      partnerType: nextSetup.partnerType,
      plan: nextSetup.plan,
      organization: nextSetup.organization,
    });
    navigate("/partners/checkout");
  }

  const businessFields = [
    ["organization", "Organization"],
    ["website", "Website"],
    ["address", "Address"],
    ["industry", "Industry"],
    ["googleBusiness", "Google Business profile"],
  ];
  const contactFields = [
    ["contact", "Primary contact"],
    ["email", "Email"],
    ["phone", "Phone"],
    ["manager", "Manager or owner"],
  ];
  const requiredFields = ["organization", "contact", "email"];
  const renderField = ([field, label]) => (
    <label key={field}>
      <span>{label}{requiredFields.includes(field) ? " *" : ""}</span>
      <input
        value={form[field]}
        type={field === "email" ? "email" : field === "website" ? "url" : "text"}
        required={requiredFields.includes(field)}
        aria-invalid={submitted && requiredFields.includes(field) && !form[field]?.trim() ? "true" : "false"}
        onChange={(event) => updateField(field, event.target.value)}
      />
    </label>
  );

  return (
    <section id="partner-signup" className="dp-partner-lifecycle-section dp-partner-register-intake">
      <div className="dp-partner-lifecycle-section-head">
        <p>Signup details</p>
        <h2>Create the workspace around your business.</h2>
        <span>Add the details your team needs for the public profile, launch tools, checkout handoff, and workspace setup.</span>
      </div>

      <div className="dp-partner-register-layout">
        <form className="dp-partner-register-form" onSubmit={handleSubmit}>
          <fieldset className="dp-partner-register-group">
            <legend>Business profile</legend>
            <div className="dp-partner-register-fields">
              {businessFields.map(renderField)}
            </div>
          </fieldset>

          <fieldset className="dp-partner-register-group">
            <legend>Contact</legend>
            <div className="dp-partner-register-fields">
              {contactFields.map(renderField)}
            </div>
          </fieldset>

          <fieldset className="dp-partner-register-group">
            <legend>Launch notes</legend>
            <label className="dp-partner-register-form-wide">
              <span>Profile notes, categories, amenities, hours, images, or launch priorities</span>
              <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} />
            </label>
          </fieldset>

          <div className="dp-partner-register-submit">
            <button type="submit">
              Continue to checkout
              <ArrowRight aria-hidden="true" />
            </button>
            {submitted && (!form.organization.trim() || !form.contact.trim() || !form.email.trim()) ? (
              <p className="dp-partner-form-error" role="alert">Please complete the highlighted fields to continue.</p>
            ) : null}
          </div>
        </form>

        <aside className="dp-workspace-preview-card">
          <p>Workspace preview</p>
          <h3>What you can do after signup.</h3>
          <div className="dp-workspace-preview-list">
            {workspacePreviewRows.map(([title, description]) => (
              <article key={title}>
                <Check aria-hidden="true" />
                <span>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function CheckoutStage({ setup, setSetup }) {
  const navigate = useNavigate();
  const [checkoutError, setCheckoutError] = useState("");
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const selectedPlan = setup.plan || "Venue Basic";
  const checkoutTarget = setup.checkoutTarget || (setup.checkoutKey ? resolveCheckoutTarget(setup.checkoutKey) : null);
  const isStripeReady = checkoutTarget && checkoutTarget.type !== "lead";
  const moduleLabels = Array.isArray(setup.moduleLabels) ? setup.moduleLabels : [];
  const annualTotal = setup.annualTotal && setup.annualTotal !== "custom" ? Number(setup.annualTotal) : null;
  const oneTimeTotal = Number(setup.oneTimeTotal || 0);

  async function handleCheckout() {
    setCheckoutError("");

    const nextSetup = {
      ...setup,
      checkoutStatus: isStripeReady ? "stripe_ready_confirmed" : "registration_confirmed",
      subscription: selectedPlan,
      invoiceMode: isStripeReady ? "Secure checkout available" : "Team-assisted checkout",
    };
    setSetup(nextSetup);
    saveSetup(nextSetup);

    if (isStripeReady && (checkoutTarget.priceId || checkoutTarget.productId)) {
      setIsSubmittingCheckout(true);
      try {
        const response = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId: checkoutTarget.priceId,
            productId: checkoutTarget.productId,
            mode: checkoutTarget.mode,
            metadata: {
              source: "partner_lifecycle",
              setupVersion: "workspace_activation_v1",
              registrationComplete: "true",
              partnerType: nextSetup.partnerType || "",
              organization: nextSetup.organization || "",
              contact: nextSetup.contact || "",
              email: nextSetup.email || "",
              plan: selectedPlan,
              sku: nextSetup.sku || "",
              modules: Array.isArray(nextSetup.modules) ? nextSetup.modules.join(",") : "",
            },
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.checkoutUrl) {
          throw new Error(data.error || "Checkout session could not be created.");
        }
        trackLifecycleEvent("stripe_checkout_started", {
          partnerType: nextSetup.partnerType,
          plan: selectedPlan,
          checkoutTargetType: checkoutTarget.type,
        });
        window.location.assign(data.checkoutUrl);
        return;
      } catch (error) {
        setCheckoutError(error.message || "Checkout could not start. The setup is still saved.");
      } finally {
        setIsSubmittingCheckout(false);
      }
      return;
    }

    trackLifecycleEvent("checkout_confirmed", {
      partnerType: nextSetup.partnerType,
      plan: selectedPlan,
      checkoutStatus: nextSetup.checkoutStatus,
      checkoutTargetType: checkoutTarget?.type || "lead",
    });
    navigate("/partners/provision?checkout=confirmed");
  }

  return (
    <>
      <ProfessionalServicesSection />
      <section className="dp-partner-lifecycle-section dp-partner-checkout-section">
        <div className="dp-partner-lifecycle-section-head">
          <p>Checkout</p>
          <h2>Review your membership before payment.</h2>
          <span>Your selected plan, add-ons, account details, and workspace launch path stay together.</span>
        </div>
        <div className="dp-checkout-grid">
          <article>
            <Receipt aria-hidden="true" />
            <h3>{selectedPlan}</h3>
            <p>{setup.partnerType || "Partner"} workspace membership</p>
            <dl>
              <div><dt>Organization</dt><dd>{setup.organization || "Add during setup"}</dd></div>
              <div><dt>Contact</dt><dd>{setup.email || "Add during setup"}</dd></div>
              <div><dt>Billing</dt><dd>{isStripeReady ? "Secure checkout available" : "Team-assisted checkout"}</dd></div>
              <div><dt>Annual total</dt><dd>{annualTotal == null ? "Custom" : formatCurrency(annualTotal)}</dd></div>
              <div><dt>One-time total</dt><dd>{formatCurrency(oneTimeTotal)}</dd></div>
            </dl>
            {moduleLabels.length ? (
              <div className="dp-checkout-module-list" aria-label="Selected modules">
                {moduleLabels.map((module) => <span key={module}>{module}</span>)}
              </div>
            ) : null}
          </article>
          <article>
            <CreditCard aria-hidden="true" />
            <h3>Payment path</h3>
            <p>{isStripeReady
              ? "Continue through secure checkout. Your workspace details stay connected to the selected plan."
              : "This plan needs a quick review before payment. Your setup details stay saved for the next step."}</p>
            <button type="button" onClick={handleCheckout} disabled={isSubmittingCheckout}>
              {isSubmittingCheckout ? "Opening checkout..." : isStripeReady ? "Continue to checkout" : "Continue with setup"}
            </button>
            {checkoutError ? <p className="dp-partner-form-error" role="alert">{checkoutError}</p> : null}
            <Link to="/partner-workspace/billing?checkout=1">Open billing</Link>
          </article>
        </div>
      </section>
    </>
  );
}

function ProvisionStage({ setup }) {
  const navigate = useNavigate();
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setComplete(true), 1200);
    const redirectId = window.setTimeout(() => navigate("/partner-workspace/overview?provisioned=1"), 2600);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(redirectId);
    };
  }, [navigate]);

  return (
    <section className="dp-partner-lifecycle-section dp-partner-provision-section">
      <div className="dp-partner-lifecycle-section-head">
        <p>Workspace setup</p>
        <h2>{complete ? "Workspace is ready." : "Preparing your workspace."}</h2>
        <span>{setup.organization || "Your organization"} is being connected to profile tools, offers, events, reports, billing, and map visibility.</span>
      </div>
      <div className="dp-provision-list">
        {provisioningSteps.map((step, index) => (
          <div key={step} className={complete || index < 9 ? "is-complete" : ""}>
            <BadgeCheck aria-hidden="true" />
            <span>{step}</span>
          </div>
        ))}
      </div>
      <Link to="/partner-workspace/overview?provisioned=1">
        Open workspace
        <ArrowRight aria-hidden="true" />
      </Link>
    </section>
  );
}

export default function PartnerLifecycle() {
  const location = useLocation();
  const stage = getStage(location.pathname);
  const [setup, setSetup] = useState(() => {
    return {
      ...getStoredSetup(),
      ...hydrateSetupFromParams(location.search),
    };
  });

  useEffect(() => {
    const querySetup = hydrateSetupFromParams(location.search);
    const hasQuerySetup = Object.values(querySetup).some((value) => value !== undefined && value !== "");
    if (!hasQuerySetup) return;
    setSetup((current) => {
      const nextSetup = { ...current, ...querySetup };
      saveSetup(nextSetup);
      return nextSetup;
    });
  }, [location.search]);

  const content = useMemo(() => {
    if (stage === "tools") return <ToolsStage />;
    if (stage === "register") return <RegisterStage setup={setup} setSetup={setSetup} />;
    if (stage === "checkout") return <CheckoutStage setup={setup} setSetup={setSetup} />;
    if (stage === "provision") return <ProvisionStage setup={setup} />;
    return <StartStage setup={setup} setSetup={setSetup} />;
  }, [stage, setup]);

  return <LifecycleShell stage={stage}>{content}</LifecycleShell>;
}
