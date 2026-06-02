import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  MapPin,
  MessageSquareText,
  QrCode,
  Sparkles,
} from "lucide-react";

const PARTNER_TYPES = [
  {
    id: "properties",
    label: "Properties",
    price: "$199/year",
    bestFor: "Residential buildings, apartments, condos, leasing teams, and property groups.",
    promise: "Turn the building into the entry point for what is nearby.",
    includes: ["Basic map listing", "Lobby QR entry", "Resident perks card connection", "Building activity snapshot"],
    notes: "Includes the resident layer, building placement, reporting, and engagement tools for the full property experience.",
  },
  {
    id: "hotels",
    label: "Hotels",
    price: "$149/year",
    bestFor: "Hotels, boutique stays, extended stays, concierge teams, and hospitality groups.",
    promise: "Help guests and residents orient themselves beyond the lobby.",
    includes: ["Guest QR entry", "Nearby dining and events layer", "Local resident rate placement", "Monthly engagement report"],
    notes: "Pricing depends on room count, entry points, and how much placement is needed.",
  },
  {
    id: "venues",
    label: "Venues",
    price: "$79-$149/year",
    bestFor: "Restaurants, bars, coffee shops, wellness, retail, services, and experience venues.",
    promise: "Show up while people nearby are deciding where to go next.",
    includes: ["Venue listing", "Perk or offer", "Event placement", "Scan and redemption tracking"],
    notes: "Pricing depends on placement depth, offer support, event visibility, and reporting needs.",
  },
  {
    id: "brands",
    label: "Brands",
    price: "$149-$199/year",
    bestFor: "Sponsors, product launches, retail campaigns, corridor activations, and local brand moments.",
    promise: "Buy the moment, not the impression.",
    includes: ["Campaign placement", "District targeting", "QR or text entry", "Survey and audience signals"],
    notes: "Campaign pricing changes with district footprint, timing, number of placements, and reporting depth.",
  },
  {
    id: "civic",
    label: "Civic",
    price: "$49-$79/year",
    bestFor: "Districts, chambers, city partners, civic groups, public events, and community programming.",
    promise: "Turn attendance into participation.",
    includes: ["Event visibility", "District discovery layer", "Public QR entry", "Participation reporting"],
    notes: "Built for simple community visibility without a heavy software rollout.",
  },
];

const MODULES = [
  ["Live map listing", "Included", "A real place on the downtown map with category, district, and nearby context."],
  ["QR entry points", "Included", "Put a code in a lobby, venue, room, event, menu, poster, or card. People scan and land in the right place."],
  ["Perks card connection", "Included for venues and resident partners", "Residents can save, show, redeem, and come back without downloading an app."],
  ["Event placement", "Included where relevant", "Add events to the map so people can RSVP or decide in the moment."],
  ["Partner dashboard", "Included", "See scans, saves, RSVPs, redemptions, and nearby activity in plain English."],
  ["AI insight notes", "Included", "The system explains what happened, where it happened, and what to try next."],
  ["Survey capture", "Campaign add-on or brand module", "Ask short questions through QR or text and connect answers to district behavior."],
  ["Monthly report", "Included", "A simple readout of what people did, which placements worked, and where demand showed up."],
];

const ADD_ONS = [
  ["Survey pulse", "From $49 per pulse", "3-6 questions, QR or text entry, audience summary, and plain-English takeaways."],
  ["Campaign launch kit", "From $99", "Offer setup, QR surfaces, placement logic, and launch checklist."],
  ["District placement", "Quoted by footprint", "Featured visibility in a selected district, corridor, or event window."],
  ["Building placement pack", "From $99", "Lobby, leasing, resident welcome, and move-in QR placements."],
  ["Event activation", "From $149", "Campaign or sponsor placement tied to an event, RSVP flow, or live downtown moment."],
  ["Custom partner report", "From $79", "A cleaner reporting view for leadership, owners, sponsors, or property groups."],
];

const PLACEMENTS = [
  ["Be part of the map", "Appear when people nearby are looking for somewhere to go, something to do, or a place worth saving for later."],
  ["In the real world", "Connect people through a QR code placed in a lobby, venue, guest room, event, storefront, building, or shared space."],
  ["Through an offer", "Offer something useful - a local perk, exclusive access, event benefit, resident discount, or reason to come back."],
  ["Around a neighborhood", "Highlight a district, neighborhood, event, or local moment where people are already spending time."],
  ["Through a question", "Ask a few simple questions and understand what brought people in, what caught their attention, and what they'd like to see next."],
  ["See what happened next", "Understand what people responded to and where momentum is building. Track visits, saves, responses, redemptions, and activity in one place."],
];

const SURVEY_STEPS = [
  ["01", "Scan or text", "A resident, guest, customer, or event attendee scans a QR code or texts a short keyword."],
  ["02", "Answer quickly", "They answer a few everyday questions. No app, no account, no long form."],
  ["03", "Signals connect", "Answers connect to district, timing, offer, event, or placement context."],
  ["04", "Engine explains", "The AI-powered insight layer turns the responses into plain-English audience notes and next steps."],
];

function Section({ id, eyebrow, title, children, className = "" }) {
  return (
    <section id={id} className={`px-5 py-12 md:py-16 ${className}`}>
      <div className="mx-auto max-w-6xl">
        {(eyebrow || title) && (
          <div className="mb-8 max-w-[840px]">
            {eyebrow && <span className="dp-editorial-eyebrow mb-5 block">{eyebrow}</span>}
            {title && (
              <h2 className="dp-editorial-section-title max-w-[900px]">{title}</h2>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function PillLink({ href, children }) {
  return (
    <a href={href} className="dp-text-chip focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]">
      {children}
    </a>
  );
}

export default function Pricing() {
  const [activePartnerId, setActivePartnerId] = useState(PARTNER_TYPES[0].id);
  const activePartner = PARTNER_TYPES.find((type) => type.id === activePartnerId) ?? PARTNER_TYPES[0];

  return (
    <div className="dp-partner-page min-h-screen bg-[#F7F8FB] pt-[68px] text-[#0B1F33]">
      <section className="relative overflow-hidden px-5 py-14 md:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(179,143,79,0.12),transparent)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-7 flex flex-wrap gap-x-5 gap-y-2">
            <PillLink href="#partner-types">Partner types</PillLink>
            <PillLink href="#modules">Modules</PillLink>
            <PillLink href="#add-ons">Add-ons</PillLink>
            <PillLink href="#surveys">Surveys</PillLink>
            <PillLink href="#placements">Placements</PillLink>
          </div>
          <span className="dp-editorial-eyebrow mb-5 block">Partner Pricing</span>
          <div className="max-w-[1120px]">
            <h1 className="dp-editorial-display w-full max-w-[1120px]">
              <span>Simple Pricing For Partners</span>
              <span className="text-[#B38F4F]"> Who Want Downtown Action.</span>
            </h1>
            <p className="dp-editorial-copy mt-8 max-w-[790px]">
              Downtown Perks is built around easy entry points: scan a QR code, text a keyword, open the map, show the card, read the report. Dumb tech on the front end. A smart audience and analytics engine underneath.
            </p>
            <div className="mt-7 flex flex-row flex-wrap items-center gap-x-5 gap-y-3">
              <Link to="/partners#partner-types" className="dp-action-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]">
                Find your partner type
                <ArrowRight className="h-3.5 w-3.5 text-[#B38F4F]" />
              </Link>
              <Link to="/partners/brands#brand-form" className="dp-action-link dp-action-link-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]">
                Discuss activation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Section id="partner-types" eyebrow="Pricing Matrix" title="Plans by Partner Type.">
        <div className="mb-8 flex gap-5 overflow-x-auto py-2">
          {PARTNER_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              className={`dp-text-chip shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] ${
                activePartner.id === type.id ? "is-active" : ""
              }`}
              aria-current={activePartner.id === type.id ? "true" : undefined}
              onClick={() => setActivePartnerId(type.id)}
            >
              {type.label}
            </button>
          ))}
        </div>

        <article className="relative max-w-[920px] py-3">
          <div className="pointer-events-none absolute -left-8 top-1 h-32 w-32 bg-[#B38F4F]/[0.06] blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-6 md:grid-cols-[240px_1fr] md:gap-10">
            <div>
              <p className="dp-editorial-eyebrow mb-4 block">{activePartner.label}</p>
              <div className="font-heading text-[34px] font-semibold leading-[0.98] tracking-[-0.025em] text-[#0B1F33] md:text-[44px]">
                {activePartner.price}
              </div>
            </div>
            <div className="max-w-[690px] space-y-4">
              <p className="font-body text-[17px] font-light leading-[1.68] tracking-[-0.005em] text-[#6D7886] md:text-[22px] md:leading-[1.62]">
                {activePartner.bestFor}
              </p>
              <p className="font-body text-[18px] font-light leading-[1.58] tracking-[-0.005em] text-[#5F6B7A] md:text-[24px]">
                {activePartner.promise}
              </p>
              <p className="font-body text-[14px] font-light leading-[1.72] text-[#6D7886] md:text-[16px]">
                {activePartner.notes}
              </p>
            </div>
          </div>
        </article>
      </Section>

      <Section id="modules" eyebrow="Platform Modules" title="What the Platform Offers.">
        <div className="grid gap-3 md:grid-cols-2">
          {MODULES.map(([title, availability, body]) => (
            <article key={title} className="dp-glow-tile rounded-[6px] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0 text-[#B38F4F]">
                  {title.includes("QR") ? <QrCode className="h-[18px] w-[18px]" /> : title.includes("Survey") ? <ClipboardList className="h-[18px] w-[18px]" /> : title.includes("AI") ? <Sparkles className="h-[18px] w-[18px]" /> : title.includes("dashboard") || title.includes("report") ? <BarChart3 className="h-[18px] w-[18px]" /> : <MapPin className="h-[18px] w-[18px]" />}
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold">{title}</h3>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B38F4F]">{availability}</p>
                  <p className="mt-2 text-[12px] leading-5 text-[#0B1F33]/60">{body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="add-ons" eyebrow="Add-Ons And Campaign Additions" title="Start with what matters. Add what works." className="bg-white">
        <div className="dp-glow-surface overflow-hidden rounded-[6px]">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full border-collapse text-left">
              <thead className="bg-[#F7F8FB]">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/56">Add-on</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/56">Guide price</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/56">What partners can expect</th>
                </tr>
              </thead>
              <tbody>
                {ADD_ONS.map(([name, price, body]) => (
                  <tr key={name} className="shadow-[inset_0_1px_0_rgba(11,31,51,0.04)]">
                    <td className="px-4 py-4 text-[13px] font-semibold">{name}</td>
                    <td className="px-4 py-4 text-[13px] text-[#0B1F33]/72">{price}</td>
                    <td className="px-4 py-4 text-[12px] leading-5 text-[#0B1F33]/62">{body}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-4 text-[12px] leading-5 text-[#0B1F33]/58">
          Add-ons are intentionally small. The point is to test real behavior quickly, then expand only when the data supports it.
        </p>
      </Section>

      <Section id="surveys" eyebrow="Survey Engine" title="Ask a question. Learn something useful.">
        <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="dp-glow-surface rounded-[6px] p-5">
            <div className="flex items-start gap-4">
              <MessageSquareText className="mt-1 h-6 w-6 shrink-0 text-[#B38F4F]" />
              <h3 className="font-heading text-[22px] font-medium leading-[1.08] md:text-[26px] lg:whitespace-nowrap xl:text-[28px]">
                Ask a few good questions at the exact right moment.
              </h3>
            </div>
            <p className="mt-4 text-[13px] leading-6 text-[#0B1F33]/64">
              Surveys work through a QR code or text prompt. A brand, venue, hotel, property, or civic partner can ask people what they want, why they came, what they noticed, what they would come back for, or what would make the experience better.
            </p>
            <p className="mt-4 text-[13px] leading-6 text-[#0B1F33]/64">
              The partner does not need an app rollout or complicated software. People answer in a simple flow. The engine groups responses with scans, district, timing, event, placement, and audience context.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {SURVEY_STEPS.map(([num, title, body]) => (
              <article key={num} className="dp-glow-tile rounded-[6px] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B38F4F]">{num}</div>
                <h4 className="mt-4 text-[13px] font-semibold">{title}</h4>
                <p className="mt-2 text-[12px] leading-5 text-[#0B1F33]/60">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section id="placements" eyebrow="Placement Opportunities" title="How Partners Show Up">
        <p className="mb-8 max-w-[700px] font-body text-[16px] font-light leading-7 text-[#0B1F33]/64 md:text-[18px]">
          Different goals call for different ways to show up. Start with the option that fits what you're trying to accomplish.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {PLACEMENTS.map(([title, body]) => (
            <article key={title} className="dp-glow-tile rounded-[6px] p-4">
              <h3 className="text-[14px] font-semibold">{title}</h3>
              <p className="mt-2 text-[12px] leading-5 text-[#0B1F33]/60">{body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Next Step" title="Do less. Learn more." className="bg-white">
        <div className="max-w-3xl">
          <p className="text-[14px] leading-7 text-[#0B1F33]/68">
            Downtown Perks is priced so partners can begin with the right annual tier, learn what people actually do, then add campaigns, surveys, placements, or reporting when there is a clear reason.
          </p>
          <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:gap-5">
            <Link to="/partners#partner-types" className="dp-action-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]">
              Choose partner type
              <ArrowRight className="h-3.5 w-3.5 text-[#B38F4F]" />
            </Link>
            <Link to="/partners/brands#brand-form" className="dp-action-link dp-action-link-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]">
              Start a conversation
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
