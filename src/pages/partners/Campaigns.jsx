import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Send } from "lucide-react";

const campaignTypes = {
  Perks: {
    headline: "Give people a reason to stop by.",
    body: "Create a local offer that appears nearby when residents are deciding where to go. Perfect for restaurants, coffee shops, wellness businesses, retail, and services.",
    examples: [
      ["Coffee or breakfast", "A morning perk people can use before work."],
      ["Dinner or drinks", "A simple add-on for people already choosing where to go."],
      ["Retail or service", "A useful resident reason to book, browse, or stop in."],
    ],
    price: "Starting at $30",
    cta: "Create a Perk Campaign",
  },
  Events: {
    headline: "Fill the room.",
    body: "Promote events while people are making plans. Appear inside the map, event discovery surfaces, and nearby recommendation flows.",
    examples: [
      ["Live music", "Help people find the show while they are making plans."],
      ["Wellness class", "Put the class near residents, hotels, and nearby routines."],
      ["Community event", "Make the event easier to save, share, and attend."],
    ],
    price: "Starting at $20",
    cta: "Promote an Event",
  },
  Visibility: {
    headline: "Stay visible between visits.",
    body: "Appear throughout downtown discovery experiences even when people are not actively searching for you.",
    examples: [
      ["Featured place", "Keep the business visible in the right nearby category."],
      ["Weekend spotlight", "Show up when people are deciding where to spend time."],
      ["Neighborhood guide", "Connect the place to the blocks around it."],
    ],
    price: "Starting at $49",
    cta: "Start Visibility",
  },
  Property: {
    headline: "Turn the neighborhood into an amenity.",
    body: "Connect residents to nearby perks, events, local businesses, and neighborhood recommendations from one shared map.",
    examples: [
      ["Move-in week", "Introduce residents to the useful places around the building."],
      ["Resident guide", "Make the neighborhood feel easier to use."],
      ["Nearby perks", "Connect building life to local offers and events."],
    ],
    price: "Property options",
    cta: "Explore Property Campaigns",
  },
  Hotel: {
    headline: "Extend the stay beyond the lobby.",
    body: "Connect guests to local experiences, partner offers, and neighborhood recommendations.",
    examples: [
      ["Guest guide", "Give the front desk a cleaner nearby recommendation path."],
      ["Dinner tonight", "Show walkable restaurants, drinks, and events."],
      ["Weekend plans", "Connect guests to easy downtown experiences."],
    ],
    price: "Hotel options",
    cta: "Explore Hotel Campaigns",
  },
  Venue: {
    headline: "Be visible when someone nearby is deciding where to go.",
    body: "Reach residents, guests, workers, and visitors while they are already making plans downtown.",
    examples: [
      ["Events", "Promote shows, pop-ups, classes, and one-night moments."],
      ["Happy hours", "Feature time-sensitive reasons to stop by."],
      ["Limited-time offers", "Give nearby people a clear reason to visit now."],
    ],
    price: "Events start at $20. Offers start at $30.",
    cta: "Create Venue Campaign",
  },
  Brand: {
    headline: "Better timing beats louder advertising.",
    body: "Reach people while they are nearby and actively making decisions.",
    examples: [
      ["Local launch", "Introduce the brand where people already spend time."],
      ["Event tie-in", "Pair the brand with a nearby crowd and clear reason to engage."],
      ["Sampling moment", "Turn a pop-up into a saved place, route, or request."],
    ],
    price: "Brand options",
    cta: "Explore Brand Campaigns",
  },
  Civic: {
    headline: "Turn public activity into measurable participation.",
    body: "Promote districts, cultural programs, public spaces, tours, events, and community experiences while tracking engagement.",
    examples: [
      ["Public events", "Make civic moments easier to find and attend."],
      ["Cultural tours", "Connect stops, routes, and downtown context."],
      ["Survey participation", "Invite feedback from people already downtown."],
    ],
    price: "Civic campaigns can support public programming, discovery, and participation reporting.",
    cta: "Create Civic Campaign",
  },
  "Real Estate": {
    headline: "Show listings inside the neighborhood context buyers care about.",
    body: "Connect available properties to nearby restaurants, hotels, parks, events, buildings, and walkable downtown activity.",
    examples: [
      ["Listings", "Show inventory with the places and routines around it."],
      ["Open houses", "Connect visits to neighborhood context."],
      ["Lead generation", "Turn discovery into qualified interest."],
    ],
    price: "Real estate campaigns can support listings, neighborhood visibility, and qualified interest.",
    cta: "Create Real Estate Campaign",
  },
};

const partnerRail = [
  {
    key: "properties",
    type: "Property",
    title: "Properties",
    headline: "Turn your building into a connected neighborhood amenity.",
    body: "Help residents discover nearby perks, events, services, and places while giving your leasing and resident teams measurable engagement data.",
    audience: "Residents, prospects, leasing teams, resident experience teams, and nearby local partners.",
    bestFor: ["Resident perks", "Lobby QR experiences", "Move-in guides", "Amenity programming", "Neighborhood engagement"],
    pricing: "Property campaigns can support resident offers, events, and local visibility.",
    primaryCta: "Create Property Campaign",
    secondaryCta: "Open Map",
    faq: ["Can this support resident events?", "Can we connect multiple buildings?", "What reporting will our team see?"],
  },
  {
    key: "hotels",
    type: "Hotel",
    title: "Hotels",
    headline: "Help guests find what is worth doing nearby.",
    body: "Give guests a live downtown guide connected to offers, events, restaurants, bars, cultural stops, and concierge-ready recommendations.",
    audience: "Guests, front desk teams, concierge teams, nearby restaurants, event partners, and visitor-facing programs.",
    bestFor: ["Lobby QR access", "Guest guides", "Concierge recommendations", "Nearby dining", "Event visibility"],
    pricing: "Hotel campaigns can support guest discovery, QR access, and nearby recommendations.",
    primaryCta: "Create Hotel Campaign",
    secondaryCta: "Open Map",
    faq: ["Can this work without an app download?", "Can guests scan from the lobby or room?", "Can concierge teams use this?"],
  },
  {
    key: "venues",
    type: "Venue",
    title: "Venues",
    headline: "Be visible when someone nearby is deciding where to eat, drink, meet, or go next.",
    body: "Reach residents, guests, workers, and visitors while they are already making plans downtown.",
    audience: "Residents, guests, workers, and visitors who are already deciding what to do nearby.",
    bestFor: ["Promote events", "Feature happy hours", "Publish limited-time offers", "Drive nearby visits"],
    pricing: "Events start at $20. Offers start at $30.",
    primaryCta: "Create Venue Campaign",
    secondaryCta: "Open Partner Map",
    faq: ["Can I promote an event?", "Can I add a happy hour?", "How quickly can this go live?"],
  },
  {
    key: "brands",
    type: "Brand",
    title: "Brands",
    headline: "Place your brand inside real downtown decisions.",
    body: "Connect activations, sponsorships, product moments, and local campaigns to people already moving through downtown.",
    audience: "Nearby audiences, event guests, shoppers, visitors, workers, residents, and district-level campaign moments.",
    bestFor: ["Brand activations", "Sponsored discovery", "Event tie-ins", "Retail moments", "Local audience reach"],
    pricing: "Brand campaigns can support visibility, activations, and sponsored placements.",
    primaryCta: "Create Brand Campaign",
    secondaryCta: "Open Map",
    faq: ["Can we sponsor a district or moment?", "Can this support an activation?", "What performance data is included?"],
  },
  {
    key: "civic",
    type: "Civic",
    title: "Civic",
    headline: "Turn public activity into measurable participation.",
    body: "Promote districts, cultural programs, public spaces, tours, events, and community experiences while tracking engagement.",
    audience: "Residents, workers, visitors, downtown stakeholders, civic groups, and public program audiences.",
    bestFor: ["Public events", "Cultural tours", "District wayfinding", "Community programs", "Survey participation"],
    pricing: "Civic campaigns can support public programming, discovery, and participation reporting.",
    primaryCta: "Create Civic Campaign",
    secondaryCta: "Open Map",
    faq: ["Can we promote public events?", "Can this support surveys?", "Can we track participation by area?"],
  },
  {
    key: "real-estate",
    type: "Real Estate",
    title: "Real Estate",
    headline: "Show listings inside the neighborhood context buyers care about.",
    body: "Connect available properties to nearby restaurants, hotels, parks, events, buildings, and walkable downtown activity.",
    audience: "Buyers, renters, brokers, leasing teams, listing agents, and people comparing downtown neighborhoods.",
    bestFor: ["Listings", "Buyer interest", "Neighborhood context", "Open houses", "Lead generation"],
    pricing: "Real estate campaigns can support listings, neighborhood visibility, and qualified interest.",
    primaryCta: "Create Real Estate Campaign",
    secondaryCta: "Open Map",
    faq: ["Can I promote listings?", "Can this support open houses?", "Can leads connect to our CRM?"],
  },
];

const campaignTypeBySlug = {
  properties: "Property",
  property: "Property",
  hotels: "Hotel",
  hotel: "Hotel",
  venues: "Venue",
  venue: "Venue",
  brands: "Brand",
  brand: "Brand",
  civic: "Civic",
  "real-estate": "Real Estate",
  real_estate: "Real Estate",
  realestate: "Real Estate",
  perks: "Perks",
  events: "Events",
  visibility: "Visibility",
};

function slugForCampaignType(type) {
  if (type === "Real Estate") return "real-estate";
  if (type === "Property") return "properties";
  if (type === "Hotel") return "hotels";
  if (type === "Venue") return "venues";
  if (type === "Brand") return "brands";
  return String(type || "venues").toLowerCase();
}

function scrollToLaunch(type) {
  const url = new URL(window.location.href);
  if (type) {
    url.searchParams.set("type", slugForCampaignType(type));
    url.searchParams.delete("campaignType");
  }
  window.history.replaceState({}, "", `${url.pathname}${url.search}#launch-campaign`);
  document.getElementById("launch-campaign")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function titleFromEntityId(entityId = "") {
  if (entityId.includes("emma-s-barrientos-mexican-american-cultural-center")) {
    return "Emma S. Barrientos Mexican American Cultural Center";
  }
  return entityId
    .replace(/^daa-stop-\d+-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Downtown partner";
}

function civicRouteContext(searchParams) {
  const entityId = searchParams.get("entityId") || "";
  const entityType = searchParams.get("entityType") || "";
  const district = searchParams.get("district") || "";
  const requestedSlug = searchParams.get("type") || searchParams.get("campaignType");
  const routeType = campaignTypeBySlug[String(requestedSlug || entityType || "").toLowerCase()] || "Visibility";
  const isCivic = routeType === "Civic" || entityType.toLowerCase() === "civic" || entityId.startsWith("daa-stop");
  const campaignType = isCivic ? "Civic" : routeType;
  const entity = titleFromEntityId(entityId);
  const cleanDistrict = district.replace(/\+/g, " ") || (isCivic ? "East Austin" : "Downtown Austin");

  return {
    entityId,
    entityType: entityType || (isCivic ? "civic" : campaignType.toLowerCase()),
    entity,
    district: cleanDistrict,
    campaignType,
    isCivic,
    status: "Draft",
    schedule: "Next programme window",
    channels: isCivic ? "Map, cultural guide, QR, nearby recommendations" : "Map, recommendations, QR, partner surfaces",
    audience: isCivic
      ? "Residents, visitors, students, artists, families, and cultural programme audiences"
      : "Nearby residents, visitors, workers, guests, and partner audiences",
    callToAction: isCivic ? "View programme details" : "Save or get directions",
  };
}

async function submitCampaignRequest(payload) {
  const response = await fetch("/api/campaign-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Campaign request failed");
  return result;
}

export default function CampaignsPage() {
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [errors, setErrors] = useState({});
  const routeContext = useMemo(
    () => civicRouteContext(new URLSearchParams(window.location.search)),
    []
  );
  const [form, setForm] = useState({
    goal: "",
    campaignType: routeContext.campaignType,
    place: routeContext.entity,
    message: "",
    name: "",
    email: "",
    organization: "",
  });
  const draftSummary = useMemo(() => [form.goal, form.campaignType, form.place].filter(Boolean).join(" · "), [form]);
  const activeCampaign = campaignTypes[form.campaignType] || campaignTypes.Visibility;
  const activeRail = partnerRail.find((item) => item.type === form.campaignType) || {
    audience: "Residents, workers, guests, and visitors already making a nearby decision.",
    headline: activeCampaign.headline,
    body: activeCampaign.body,
    pricing: activeCampaign.price,
  };
  const mapHref = `/map?mode=partner&tab=campaigns&entityId=${encodeURIComponent(routeContext.entityId)}&filter=Campaigns`;
  const isGenericCampaign = routeContext.entity === "Downtown partner";
  const displayEntity = isGenericCampaign ? "Your downtown presence" : routeContext.entity;
  const displaySchedule = isGenericCampaign ? "Choose a launch window" : routeContext.schedule;
  const campaignName = routeContext.isCivic
    ? `${routeContext.entity} Programme Spotlight`
    : isGenericCampaign
      ? `${form.campaignType} campaign`
      : `${routeContext.entity} Campaign`;
  const details = [
    ["Campaign Type", routeContext.isCivic ? "Civic programme" : form.campaignType],
    ["Audience", routeContext.isCivic ? routeContext.audience : activeRail.audience],
    ["District", routeContext.district],
    ["Schedule", displaySchedule],
    ["Channels", routeContext.channels],
    ["Call to Action", routeContext.callToAction],
  ];
  const reach = routeContext.isCivic
    ? [
        ["Expected audience", "People looking for galleries, performances, workshops, tours, and family-friendly cultural programming."],
        ["Where it appears", "Partner map, civic discovery cards, nearby recommendations, and QR entry points at the center or partner locations."],
        ["Suggested timing", "Publish before the programme window, then refresh copy on the day of the activity."],
        ["Nearby destinations", "Rainey Street Trailhead, Lady Bird Lake, Palm Park, the Convention Center, and eastside cultural stops."],
        ["Partner recommendations", "Pair with nearby transit, parking, dining, and public-art routes so attendance feels easier to plan."],
      ]
    : [
        ["Expected audience", activeRail.audience],
        ["Where it appears", "Downtown Perks map, nearby recommendations, QR links, and relevant discovery moments."],
        ["Suggested timing", "Publish before the strongest expected foot-traffic window."],
        ["Nearby destinations", "Connect the campaign to relevant places, events, and services nearby."],
        ["Partner recommendations", "Use one primary action and only the nearby context that helps someone decide."],
      ];
  const goals = routeContext.isCivic
    ? ["Saves", "Directions", "RSVPs", "Visits", "Repeat engagement"]
    : ["Saves", "Directions", "Redemptions", "Visits", "Repeat engagement"];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedSlug = params.get("type") || params.get("campaignType");
    const requestedType = campaignTypeBySlug[String(requestedSlug || "").toLowerCase()] || (window.location.hash === "#venues" ? "Venue" : "");
    if (requestedType && campaignTypes[requestedType]) {
      setForm((current) => ({ ...current, campaignType: requestedType }));
    }
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.goal.trim()) nextErrors.goal = "Goal is required.";
    if (!form.campaignType) nextErrors.campaignType = "Campaign type is required.";
    if (!form.place.trim()) nextErrors.place = "Place or event is required.";
    if (!form.message.trim()) nextErrors.message = "Campaign message is required.";
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!isValidEmail(form.email.trim())) nextErrors.email = "Use a valid email address.";
    if (!form.organization.trim()) nextErrors.organization = "Organization is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus({ type: "error", message: "We couldn’t submit this yet. Please check the form and try again." });
      return;
    }

    setStatus({ type: "submitting", message: "Submitting campaign request..." });
    try {
      const sourceUrl = typeof window !== "undefined" ? window.location.href : "";
      await submitCampaignRequest({
        ...form,
        source_page: "partners_campaigns",
        source_url: sourceUrl,
        submitted_at: new Date().toISOString(),
        status: "new",
      });
      setStatus({ type: "success", message: "Thanks — we received your request. We’ll follow up with the right partner setup path." });
      setForm({ goal: "", campaignType: routeContext.campaignType, place: routeContext.entity, message: "", name: "", email: "", organization: "" });
    } catch {
      setStatus({ type: "error", message: "We couldn’t submit this yet. Please check the form and try again." });
    }
  };

  return (
    <main className="dp-campaigns-page">
      <section className="dp-campaign-plan-shell">
        <div className="dp-campaign-plan-main">
          <section className="dp-campaign-plan-header" aria-label="Campaign header">
            <div>
              <p className="dp-campaigns-eyebrow">Campaign builder</p>
              <h1>{campaignName}</h1>
              <p className="dp-campaign-plan-intro">Choose the campaign that fits the outcome, review how it will appear, then send one complete brief for scheduling.</p>
            </div>
            <dl>
              <div><dt>Status</dt><dd>{routeContext.status}</dd></div>
              <div><dt>Entity</dt><dd>{displayEntity}</dd></div>
              <div><dt>District</dt><dd>{routeContext.district}</dd></div>
            </dl>
            <button type="button" onClick={() => scrollToLaunch(form.campaignType)} className="dp-campaigns-primary">
              Continue to brief <ArrowRight size={15} aria-hidden="true" />
            </button>
          </section>

          <section className="dp-campaign-type-selector" aria-labelledby="campaign-type-heading">
            <div>
              <p className="dp-campaigns-eyebrow">Choose a campaign type</p>
              <h2 id="campaign-type-heading">What do you want people to do?</h2>
              <p>Select one option. The plan, preview, audience, and recommended brief will update together.</p>
            </div>
            <div className="dp-campaign-type-rail" role="tablist" aria-label="Campaign types">
              {Object.keys(campaignTypes).map((type) => (
                <button
                  key={type}
                  type="button"
                  role="tab"
                  aria-selected={form.campaignType === type}
                  onClick={() => updateForm("campaignType", type)}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="dp-campaign-type-readout" aria-live="polite">
              <strong>{campaignTypes[form.campaignType].headline}</strong>
              <p>{campaignTypes[form.campaignType].body}</p>
              <span>{campaignTypes[form.campaignType].price}</span>
            </div>
          </section>

          <section className="dp-campaigns-section dp-campaign-detail-section" aria-label="Campaign details">
            <h2>Plan details</h2>
            <dl className="dp-campaign-detail-grid">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="dp-campaign-live-preview" aria-label="Live preview">
          <div className="dp-campaign-preview-head">
            <h2>Live preview</h2>
            <Link to={mapHref}><MapPin size={14} /> Map preview</Link>
          </div>
          <article className="dp-campaign-preview-desktop">
            <span>Desktop</span>
            <h3>{campaignName}</h3>
            <p>{routeContext.isCivic ? "Galleries, performances, educational programmes, and community gatherings near the waterfront." : activeRail.headline}</p>
            <button type="button">{routeContext.callToAction}</button>
          </article>
          <article className="dp-campaign-preview-mobile">
            <span>Mobile</span>
            <strong>{displayEntity}</strong>
            <p>{routeContext.district} · {displaySchedule}</p>
            <button type="button">{routeContext.callToAction}</button>
          </article>
          <article className="dp-campaign-preview-qr">
            <span>QR</span>
            <div aria-hidden="true">
              {Array.from({ length: 25 }).map((_, index) => <i key={index} />)}
            </div>
            <p>Scan to open this {routeContext.isCivic ? "programme" : "campaign"}.</p>
          </article>
          <article className="dp-campaign-preview-map">
            <span>Map</span>
            <strong>{routeContext.district}</strong>
            <p>{displayEntity}</p>
          </article>
        </aside>

        <div className="dp-campaign-plan-lower">
          <section className="dp-campaigns-section dp-campaign-reach" aria-label="Campaign reach">
            <h2>Reach plan</h2>
            <div>
              {reach.map(([label, value]) => (
                <article key={label}>
                  <span>{label}</span>
                  <p>{value}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="dp-campaigns-section dp-campaign-goals" aria-label="Performance goals">
            <h2>Performance goals</h2>
            <p>{routeContext.isCivic ? "Use these indicators to understand participation and programme discovery after publication." : "Start with five measurable actions. Add deeper reporting after the campaign establishes a baseline."}</p>
            <ul>
              {goals.map((goal) => <li key={goal}>{goal}</li>)}
            </ul>
          </section>

          <section id="launch-campaign" className="dp-campaigns-section dp-launch-section dp-campaign-next-step">
            <div>
              <p className="dp-campaigns-eyebrow">Recommended next step</p>
              <h2>{routeContext.isCivic ? "Review programme copy." : "Review campaign copy."}</h2>
              <p>{routeContext.isCivic ? "Confirm the programme focus, timing, and call to action before scheduling publication." : "Confirm the goal, placement, and primary action before scheduling."}</p>
              {draftSummary && <small>{draftSummary}</small>}
            </div>
            <form onSubmit={submit}>
              <label>Goal<input value={form.goal} onChange={(event) => updateForm("goal", event.target.value)} aria-invalid={Boolean(errors.goal)} placeholder={routeContext.isCivic ? "Example: Increase attendance for a gallery programme" : "Example: Bring people in after work"} />{errors.goal && <small className="dp-campaign-form-error">{errors.goal}</small>}</label>
              <label>Campaign type<select value={form.campaignType} onChange={(event) => updateForm("campaignType", event.target.value)} aria-invalid={Boolean(errors.campaignType)}>{Object.keys(campaignTypes).map((type) => <option key={type}>{type}</option>)}</select>{errors.campaignType && <small className="dp-campaign-form-error">{errors.campaignType}</small>}</label>
              <label>Place or event<input value={form.place} onChange={(event) => updateForm("place", event.target.value)} aria-invalid={Boolean(errors.place)} placeholder="Business, property, organization, or event name" />{errors.place && <small className="dp-campaign-form-error">{errors.place}</small>}</label>
              <label>Campaign message<textarea value={form.message} onChange={(event) => updateForm("message", event.target.value)} aria-invalid={Boolean(errors.message)} placeholder={routeContext.isCivic ? "Example: View this week’s galleries, performances, and educational programmes." : "Example: Happy hour available today from 4 PM to 7 PM."} />{errors.message && <small className="dp-campaign-form-error">{errors.message}</small>}</label>
              <label>Name<input value={form.name} onChange={(event) => updateForm("name", event.target.value)} aria-invalid={Boolean(errors.name)} placeholder="Your name" />{errors.name && <small className="dp-campaign-form-error">{errors.name}</small>}</label>
              <label>Email<input type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} aria-invalid={Boolean(errors.email)} placeholder="you@example.com" />{errors.email && <small className="dp-campaign-form-error">{errors.email}</small>}</label>
              <label>Organization<input value={form.organization} onChange={(event) => updateForm("organization", event.target.value)} aria-invalid={Boolean(errors.organization)} placeholder="Business, property, brand, or organization" />{errors.organization && <small className="dp-campaign-form-error">{errors.organization}</small>}</label>
              <div className="dp-campaigns-cta-row">
                <button type="submit" disabled={status.type === "submitting"} className="dp-campaigns-primary"><Send size={16} /> {status.type === "submitting" ? "Submitting..." : "Schedule publication"}</button>
                <Link to={mapHref} className="dp-campaigns-secondary">Check map context</Link>
              </div>
              {status.message && <p role={status.type === "error" ? "alert" : "status"} className={`dp-campaign-success is-${status.type}`}>{status.message}</p>}
            </form>
          </section>
        </div>
      </section>

    </main>
  );
}
