import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ChevronRight, MapPin, Save, Send, Sparkles } from "lucide-react";
import BrandNetworkShowcase from "@/components/marketing/BrandNetworkShowcase";
import TwoSidedFAQHub from "@/components/marketing/TwoSidedFAQHub";

const campaignTypes = {
  Perks: {
    headline: "Give people a reason to stop by.",
    body: "Create a local offer that appears nearby when residents are deciding where to go. Perfect for restaurants, coffee shops, wellness businesses, retail, and services.",
    examples: ["Free coffee with breakfast.", "Complimentary appetizer.", "Priority access.", "Resident-only specials."],
    price: "Starting at $30",
    cta: "Create a Perk Campaign",
  },
  Events: {
    headline: "Fill the room.",
    body: "Promote events while people are making plans. Appear inside the map, event discovery surfaces, and nearby recommendation flows.",
    examples: ["Live music", "Networking", "Fitness", "Community events"],
    price: "Starting at $20",
    cta: "Promote an Event",
  },
  Visibility: {
    headline: "Stay visible between visits.",
    body: "Appear throughout downtown discovery experiences even when people are not actively searching for you.",
    examples: ["Featured listing", "Weekend spotlight", "Neighborhood feature"],
    price: "Starting at $49",
    cta: "Start Visibility",
  },
  Property: {
    headline: "Turn the neighborhood into an amenity.",
    body: "Connect residents to nearby perks, events, local businesses, and neighborhood recommendations from one shared map.",
    examples: ["Move-in week", "Resident guide", "Nearby perks"],
    price: "Property options",
    cta: "Explore Property Campaigns",
  },
  Hotel: {
    headline: "Extend the stay beyond the lobby.",
    body: "Connect guests to local experiences, partner offers, and neighborhood recommendations.",
    examples: ["Guest guide", "Dinner tonight", "Weekend plans"],
    price: "Hotel options",
    cta: "Explore Hotel Campaigns",
  },
  Brand: {
    headline: "Better timing beats louder advertising.",
    body: "Reach people while they are nearby and actively making decisions.",
    examples: ["Local launch", "Event tie-in", "Sampling moment"],
    price: "Brand options",
    cta: "Explore Brand Campaigns",
  },
};

const moments = [
  ["Coffee before work", "/images/imported/perks/coffee-before-work.png"],
  ["Lunch between meetings", "/images/map-entities/perks/partner_dining_patio_1779052819620.png"],
  ["Happy hour nearby", "/images/imported/perks/cocktails.avif"],
  ["Dinner plans", "/images/imported/perks/downtown-dining-patio.png"],
  ["Weekend plans", "/images/imported/perks/yeti-event.jpeg"],
];

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

export default function CampaignsPage() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState("Perks");
  const [openFaq, setOpenFaq] = useState(0);
  const [previewSaved, setPreviewSaved] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ goal: "", campaignType: "Perks", place: "", message: "" });
  const active = campaignTypes[activeType];
  const draftSummary = useMemo(() => [form.goal, form.campaignType, form.place].filter(Boolean).join(" · "), [form]);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event) => {
    event.preventDefault();
    if (!form.goal.trim() || !form.place.trim() || !form.message.trim()) {
      setSuccess("Add a goal, place, and what people should see before launching.");
      return;
    }
    setSuccess("Campaign draft created. You can review it on the partner map.");
    window.localStorage.setItem("dp-campaign-draft", JSON.stringify({ ...form, createdAt: new Date().toISOString() }));
  };

  return (
    <main className="dp-campaigns-page">
      <header className="dp-campaigns-header">
        <Link to="/map?mode=resident&tab=map&filter=All" className="dp-campaigns-brand">Downtown Perks</Link>
        <nav aria-label="Campaign page navigation">
          <Link to="/partners/campaigns">Campaigns</Link>
          <Link to="/map?mode=partner&tab=campaigns">Map</Link>
          <Link to="/map?mode=resident&tab=map&filter=Events">Events</Link>
          <Link to="/map?mode=resident&tab=map&filter=Perks">Perks</Link>
          <Link to="/partners">Partners</Link>
        </nav>
        <div>
          <button type="button" onClick={() => scrollToLaunch()} className="dp-campaigns-primary">Launch a Campaign</button>
          <Link to="/map?mode=partner&tab=campaigns" className="dp-campaigns-secondary">Open Map</Link>
        </div>
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
          <img src="/images/imported/perks/live-map-listing.png" alt="Downtown campaign map preview" loading="lazy" decoding="async" />
          <figcaption>
            <strong>Nearby decision moment</strong>
            <span>Coffee before work · Lunch nearby · Happy hour tonight</span>
          </figcaption>
        </figure>
      </section>

      <section className="dp-campaigns-section">
        <p className="dp-campaigns-eyebrow">The moments that matter</p>
        <h2>Downtown runs on moments.</h2>
        <p>Coffee before work. Lunch between meetings. Happy hour before a show. A last-minute dinner plan. A rooftop on a Saturday afternoon.</p>
        <div className="dp-moment-scroller">
          {moments.map(([title, image]) => (
            <article key={title}>
              <img src={image} alt={title} loading="lazy" decoding="async" />
              <strong>{title}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="dp-campaigns-section dp-campaigns-how">
        <div>
          <p className="dp-campaigns-eyebrow">How campaigns work</p>
          <h2>Simple by design.</h2>
          <p>Keep the first step clear, then let the map carry the offer into the places people already use.</p>
        </div>
        <ol>
          {["Choose a goal|Decide what you want people to do.", "Select an audience|Choose who should see your offer.", "Create an offer|Make it clear, simple, and local.", "Launch|Go live in just a few minutes.", "See what happened|Track saves, visits, and redemptions."].map((step, index) => {
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
            <button key={type} type="button" role="tab" aria-selected={activeType === type} onClick={() => setActiveType(type)}>{type}</button>
          ))}
        </div>
        <article className="dp-campaign-type-panel">
          <div>
            <h3>{active.headline}</h3>
            <p>{active.body}</p>
            <strong>{active.price}</strong>
          </div>
          <ul>{active.examples.map((example) => <li key={example}><Check size={16} /> {example}</li>)}</ul>
          <button type="button" onClick={() => scrollToLaunch(activeType)} className="dp-campaigns-primary">{active.cta}</button>
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
            <button type="button" onClick={() => { setPreviewSaved(true); setSuccess("Saved to campaign preview."); }}><Save size={16} /> Save</button>
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
        <p className="dp-campaigns-eyebrow">Outcome proof</p>
        <h2>Clear results, plain language.</h2>
        <div className="dp-proof-grid">
          {[
            ["People saved this.", "They wanted to keep the offer, event, or place close enough to come back to.", "/images/imported/perks/map-and-qr.png"],
            ["People visited here.", "They were nearby, understood the reason to go, and decided to make the stop.", "/images/imported/perks/downtown-dining-patio.png"],
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
          <label>Goal<input value={form.goal} onChange={(event) => updateForm("goal", event.target.value)} placeholder="Example: Bring people in after work" /></label>
          <label>Campaign type<select value={form.campaignType} onChange={(event) => updateForm("campaignType", event.target.value)}>{Object.keys(campaignTypes).map((type) => <option key={type}>{type}</option>)}</select></label>
          <label>Place or event<input value={form.place} onChange={(event) => updateForm("place", event.target.value)} placeholder="Business, property, or event name" /></label>
          <label>What should people see?<textarea value={form.message} onChange={(event) => updateForm("message", event.target.value)} placeholder="Example: Happy hour available today from 4 PM to 7 PM." /></label>
          <div className="dp-campaigns-cta-row">
            <button type="submit" className="dp-campaigns-primary"><Send size={16} /> Launch a Campaign</button>
            <Link to="/partners?intent=walkthrough" className="dp-campaigns-secondary">Schedule a Walkthrough</Link>
          </div>
          {success && <p role="status" className="dp-campaign-success">{success}</p>}
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

      <section className="dp-final-campaign-cta">
        <h2>Show up when it counts.</h2>
        <p>People are already downtown. Campaigns help you appear when they are deciding what to do next.</p>
        <button type="button" onClick={() => scrollToLaunch()} className="dp-campaigns-gold">Launch Your First Campaign</button>
      </section>

      <footer className="dp-campaign-footer">
        <span>Downtown Perks</span>
        <Link to="/map?mode=partner&tab=campaigns">Open partner map</Link>
      </footer>
    </main>
  );
}
