import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, MapPin, Save, Send, Sparkles } from "lucide-react";
import BrandNetworkShowcase from "@/components/marketing/BrandNetworkShowcase";
import TwoSidedFAQHub from "@/components/marketing/TwoSidedFAQHub";

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
};

const faqs = [
  ["How much does a campaign cost?", "Campaigns start at $20 for event boosts and $30 for perks. Larger visibility campaigns can be added when you want broader placement."],
  ["How long does a campaign run?", "Most campaigns run for 30 days, but event promotions can be shorter depending on the event date."],
  ["Can I edit a campaign?", "Yes. You can update the offer, timing, and campaign details before or during the campaign."],
  ["Do I need to be a partner?", "You can start with a simple campaign. Partner plans unlock more visibility, reporting, and placement options."],
  ["Can I promote an event?", "Yes. Events can appear inside the map, event discovery, and nearby recommendation moments."],
  ["Can I target residents?", "Yes. Campaigns can be shown to nearby residents and downtown users based on context, location, and timing."],
];

function scrollToLaunch(type) {
  const url = new URL(window.location.href);
  if (type) url.searchParams.set("campaignType", type);
  window.history.replaceState({}, "", `${url.pathname}${url.search}#launch-campaign`);
  document.getElementById("launch-campaign")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState("Perks");
  const [openFaq, setOpenFaq] = useState(0);
  const [previewSaved, setPreviewSaved] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    goal: "",
    campaignType: "Perks",
    place: "",
    message: "",
    name: "",
    email: "",
    organization: "",
  });
  const active = campaignTypes[activeType];
  const draftSummary = useMemo(() => [form.goal, form.campaignType, form.place].filter(Boolean).join(" · "), [form]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedType = params.get("campaignType");
    if (requestedType && campaignTypes[requestedType]) {
      setActiveType(requestedType);
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
      setForm({ goal: "", campaignType: activeType, place: "", message: "", name: "", email: "", organization: "" });
    } catch {
      setStatus({ type: "error", message: "We couldn’t submit this yet. Please check the form and try again." });
    }
  };

  return (
    <main className="dp-campaigns-page">
      <header className="dp-campaigns-header">
        <button type="button" className="dp-campaigns-back" aria-label="Go back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <Link to="/partners" className="dp-campaigns-brand">Downtown Perks Partners</Link>
        <details className="dp-campaigns-menu">
          <summary>Partner menu</summary>
          <nav aria-label="Partner navigation">
            <Link to="/partners">Partner Home</Link>
            <Link to="/partners/campaigns">Campaigns</Link>
            <Link to="/map?mode=partner&tab=campaigns">Partner Map</Link>
            <Link to="/partners/dashboard">Dashboard</Link>
            <Link to="/partners/sign-in">Sign In</Link>
          </nav>
        </details>
      </header>

      <section className="dp-campaigns-hero">
        <div>
          <p className="dp-campaigns-eyebrow">Campaigns</p>
          <h1>Show up when people are already making plans.</h1>
          <p>People are already downtown. Already walking. Already looking for somewhere to go. Campaigns help your business appear at the moment those decisions are happening.</p>
          <div className="dp-campaigns-cta-row">
            <button type="button" onClick={() => scrollToLaunch()} className="dp-campaigns-primary">Launch a Campaign</button>
            <Link to="/map?mode=partner&tab=campaigns" className="dp-campaigns-secondary">Open the Map</Link>
          </div>
        </div>
        <figure className="dp-campaigns-visual">
          <img
            src={new URLSearchParams(window.location.search).get("entityId")?.includes("heritage-boots") ? "/images/imported/perks/boot-wars.jpg" : "/images/imported/perks/featured-campaign-2.png"}
            alt="Downtown partner campaign preview"
            loading="lazy"
            decoding="async"
          />
          <figcaption>
            <strong>{new URLSearchParams(window.location.search).get("entityId")?.includes("heritage-boots") ? "Heritage Boots campaign" : "Partner campaign placement"}</strong>
            <span>{new URLSearchParams(window.location.search).get("entityId")?.includes("heritage-boots") ? "Retail offer · Congress · partner map" : "Offer · event · nearby map"}</span>
          </figcaption>
        </figure>
      </section>

      <section className="dp-campaigns-section dp-campaigns-how dp-campaigns-moment-process">
        <div>
          <p className="dp-campaigns-eyebrow">How campaigns work</p>
          <h2>Start with the moment, then make the next step clear.</h2>
          <p>Coffee before work, lunch between meetings, happy hour before a show, or a last-minute dinner plan. Pick one real downtown moment and give people one useful reason to act.</p>
        </div>
        <ol>
          {["Choose a goal|Decide what you want people to do.", "Choose who it helps|Focus on residents, guests, visitors, or people near an event.", "Create the offer|Make it clear, simple, and local.", "Launch|Place it on the partner map and nearby surfaces.", "Review what happened|See what people saved, used, and asked for next."].map((step, index) => {
            const [title, body] = step.split("|");
            return <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><p>{body}</p></li>;
          })}
        </ol>
      </section>

      <section className="dp-campaigns-section">
        <p className="dp-campaigns-eyebrow">Campaign types</p>
        <h2>Different moments. Different opportunities.</h2>
        <p>Choose the way your business can participate, then keep the offer simple enough for someone nearby to act on.</p>
        <div className="dp-campaign-type-tabs" role="tablist" aria-label="Campaign types">
          {Object.keys(campaignTypes).map((type) => (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={activeType === type}
              onClick={() => {
                setActiveType(type);
                updateForm("campaignType", type);
              }}
            >
              {type}
            </button>
          ))}
        </div>
        <article className="dp-campaign-type-panel">
          <div>
            <h3>{active.headline}</h3>
            <p>{active.body}</p>
            <strong>{active.price}</strong>
          </div>
          <div className="dp-campaign-example-rail" aria-label={`${activeType} campaign examples`}>
            {active.examples.map(([title, copy]) => (
              <article key={title}>
                <span>{title}</span>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              updateForm("campaignType", activeType);
              scrollToLaunch(activeType);
            }}
            className="dp-campaigns-primary"
          >
            {active.cta}
          </button>
        </article>
      </section>

      <section className="dp-campaigns-section dp-campaigns-preview">
        <div>
          <p className="dp-campaigns-eyebrow">What residents see</p>
          <h2>Campaigns appear naturally.</h2>
          <p>Residents never browse a campaign directory. Campaigns appear where they make sense: inside the map, inside recommendations, inside nearby experiences, and inside event discovery.</p>
        </div>
        <article>
          <p>Nearby Now</p>
          <h3>Welcome Coffee</h3>
          <span>Two blocks away · available until 2 PM</span>
          <div>
            <button type="button" onClick={() => { setPreviewSaved(true); setStatus({ type: "idle", message: "Saved to campaign preview." }); }}><Save size={16} /> Save</button>
            <button type="button" onClick={() => navigate("/map?mode=resident&intent=directions")}><MapPin size={16} /> Directions</button>
          </div>
          {previewSaved && <small>Saved to campaign preview.</small>}
        </article>
      </section>

      <section className="dp-campaigns-section">
        <p className="dp-campaigns-eyebrow">What partners learn</p>
        <h2>Understand what happened.</h2>
        <p>Campaigns are connected directly to activity inside downtown. See what people saved, what they redeemed, what they visited, and where attention is growing.</p>
        <div className="dp-metric-chip-row">
          {["Saves", "Visits", "Redemptions", "Direction taps", "Time-of-day response", "Nearby activity"].map((metric) => <span key={metric}>{metric}</span>)}
        </div>
      </section>

      <section className="dp-campaigns-section">
        <p className="dp-campaigns-eyebrow">What the report shows</p>
        <h2>Useful proof from real use.</h2>
        <div className="dp-proof-grid">
          {[
            ["People saved this.", "They wanted to keep the offer, event, or place close enough to come back to.", "/images/imported/perks/map-and-qr.png"],
            ["People visited here.", "They were nearby, understood the reason to go, and decided to make the stop.", "/images/map-entities/dining/outdoor-dining-arrival.avif"],
            ["People redeemed this.", "The offer was clear enough to use in the real world, not just notice on a screen.", "/images/imported/perks/perks-offers-jpg-coffee-counter-qr-offer-redemption.png"],
          ].map(([title, body, image]) => <article key={title}><img src={image} alt={title} loading="lazy" decoding="async" /><Sparkles size={18} /><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className="dp-campaigns-section">
        <p className="dp-campaigns-eyebrow">Brand network</p>
        <h2>Local examples with real context.</h2>
        <BrandNetworkShowcase />
      </section>

      <section id="launch-campaign" className="dp-campaigns-section dp-launch-section">
        <div>
          <p className="dp-campaigns-eyebrow">Launch a campaign</p>
          <h2>Downtown Campaign Builder</h2>
          <p>Launch local campaigns across the map, perks, events, properties, hotels, resident discovery, and partner reporting from one workflow.</p>
          {draftSummary && <small>{draftSummary}</small>}
        </div>
        <form onSubmit={submit}>
          <label>Goal<input value={form.goal} onChange={(event) => updateForm("goal", event.target.value)} aria-invalid={Boolean(errors.goal)} placeholder="Example: Bring people in after work" />{errors.goal && <small className="dp-campaign-form-error">{errors.goal}</small>}</label>
          <label>Campaign type<select value={form.campaignType} onChange={(event) => updateForm("campaignType", event.target.value)} aria-invalid={Boolean(errors.campaignType)}>{Object.keys(campaignTypes).map((type) => <option key={type}>{type}</option>)}</select>{errors.campaignType && <small className="dp-campaign-form-error">{errors.campaignType}</small>}</label>
          <label>Place or event<input value={form.place} onChange={(event) => updateForm("place", event.target.value)} aria-invalid={Boolean(errors.place)} placeholder="Business, property, or event name" />{errors.place && <small className="dp-campaign-form-error">{errors.place}</small>}</label>
          <label>Campaign message<textarea value={form.message} onChange={(event) => updateForm("message", event.target.value)} aria-invalid={Boolean(errors.message)} placeholder="Example: Happy hour available today from 4 PM to 7 PM." />{errors.message && <small className="dp-campaign-form-error">{errors.message}</small>}</label>
          <label>Name<input value={form.name} onChange={(event) => updateForm("name", event.target.value)} aria-invalid={Boolean(errors.name)} placeholder="Your name" />{errors.name && <small className="dp-campaign-form-error">{errors.name}</small>}</label>
          <label>Email<input type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} aria-invalid={Boolean(errors.email)} placeholder="you@example.com" />{errors.email && <small className="dp-campaign-form-error">{errors.email}</small>}</label>
          <label>Organization<input value={form.organization} onChange={(event) => updateForm("organization", event.target.value)} aria-invalid={Boolean(errors.organization)} placeholder="Business, property, brand, or organization" />{errors.organization && <small className="dp-campaign-form-error">{errors.organization}</small>}</label>
          <div className="dp-campaigns-cta-row">
            <button type="submit" disabled={status.type === "submitting"} className="dp-campaigns-primary"><Send size={16} /> {status.type === "submitting" ? "Submitting..." : "Launch a Campaign"}</button>
            <Link to="/marketing/contact?intent=partner-registration" className="dp-campaigns-secondary">Schedule a Walkthrough</Link>
          </div>
          {status.message && <p role={status.type === "error" ? "alert" : "status"} className={`dp-campaign-success is-${status.type}`}>{status.message}</p>}
        </form>
      </section>

      <section className="dp-campaigns-section dp-campaign-faq">
        <div>
          <p className="dp-campaigns-eyebrow">FAQ</p>
          <h2>Questions people usually ask.</h2>
          <p>Keep the first campaign simple enough to try, then build from what people actually use.</p>
          <TwoSidedFAQHub />
        </div>
        <div>
          {faqs.map(([question, answer], index) => (
            <article key={question}>
              <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                <span>{question}</span><ChevronRight size={18} />
              </button>
              {openFaq === index && <p>{answer}</p>}
            </article>
          ))}
        </div>
      </section>

    </main>
  );
}
