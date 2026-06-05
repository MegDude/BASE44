import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import Footer from "@/components/Footer";

const partnerTypes = [
  {
    id: "venues",
    label: "Venues",
    summary: "Restaurants, bars, coffee shops, retail, fitness, wellness and local businesses.",
    use: "Use Downtown Perks to appear on the map, publish perks, promote events and attract nearby residents.",
  },
  {
    id: "properties",
    label: "Properties",
    summary: "Apartments, condominiums, mixed-use developments and leasing teams.",
    use: "Use Downtown Perks to provide resident benefits, building visibility and local engagement.",
  },
  {
    id: "hotels",
    label: "Hotels",
    summary: "Hotels, hospitality groups and visitor accommodations.",
    use: "Use Downtown Perks to connect guests with nearby experiences and local businesses.",
  },
  {
    id: "brands",
    label: "Brands",
    summary: "Consumer brands, sponsorships and experiential campaigns.",
    use: "Use Downtown Perks to reach residents and visitors where decisions are actually being made.",
  },
  {
    id: "civic",
    label: "Civic",
    summary: "Community organizations, neighborhood groups, nonprofits and public initiatives.",
    use: "Use Downtown Perks to increase participation, awareness and attendance.",
  },
];

const pricingPlans = {
  venues: [
    {
      name: "Free Forever",
      price: "$0",
      description: "Perfect for businesses that simply want to be discoverable and give residents a reason to visit.",
      includes: ["Live map listing", "Business profile", "Photos", "Website link", "Hours", "Category placement", "One active resident perk", "Basic activity reporting"],
      examples: ["Free coffee upgrade", "10% off weekday lunch", "Free appetizer", "Resident special", "Welcome drink", "Event-day perk"],
      note: "No monthly fee. No contract.",
    },
    {
      name: "Basic",
      price: "$30/month",
      description: "For businesses that want to actively participate.",
      includes: ["Everything in Free Forever", "Up to 5 active perks", "Event publishing", "Save tracking", "Click tracking", "Redemption tracking", "Basic campaign tools"],
    },
    {
      name: "Growth",
      price: "$79/month",
      description: "For businesses running regular promotions, events or resident offers.",
      includes: ["Everything in Basic", "Featured placement credits", "Broadcast access", "Campaign builder", "Enhanced reporting", "Audience insights", "Event promotion tools"],
    },
    {
      name: "Pro",
      price: "$199/month",
      description: "For businesses using Downtown Perks as an active growth channel.",
      includes: ["Everything in Growth", "Unlimited campaigns", "Priority placement", "Advanced analytics", "Benchmark reporting", "Heatmaps", "Resident behavior insights", "Quarterly strategy review"],
    },
  ],
  properties: [
    {
      name: "Building Starter",
      price: "$49/month",
      description: "For a single building that wants resident perks and local visibility.",
      includes: ["Building profile", "Resident perks access", "Building placement", "Resident engagement reporting"],
    },
    {
      name: "Resident Plus",
      price: "$99/month",
      description: "For active resident communities that want to use the platform as an amenity layer.",
      includes: ["Everything in Building Starter", "Resident communications", "Property campaigns", "Building events", "Survey access"],
    },
    {
      name: "Property Pro",
      price: "$199/month",
      description: "For premium buildings, mixed-use developments and property portfolios.",
      includes: ["Everything in Resident Plus", "Portfolio reporting", "Advanced analytics", "Resident insights", "Building benchmarking", "Property intelligence dashboard"],
    },
  ],
  hotels: [
    {
      name: "Hotel Starter",
      price: "$99/month",
      description: "For hotels that want guests to discover what is nearby.",
      includes: ["Hotel profile", "Guest guide", "Guest perks", "Guest map access", "Partner offers"],
    },
    {
      name: "Hotel Pro",
      price: "$199/month",
      description: "For hotels that want campaigns, visitor insights and concierge-friendly local programming.",
      includes: ["Everything in Hotel Starter", "Guest campaigns", "Visitor analytics", "Broadcast access", "Enhanced reporting"],
    },
  ],
  brands: [
    {
      name: "Brand Access",
      price: "$99/month",
      description: "For brands that want local presence, access to downtown moments and participation in resident-facing campaigns.",
      includes: ["Brand profile", "Campaign access", "Event participation", "Placement eligibility"],
    },
    {
      name: "Brand Campaigns",
      price: "$199/month",
      description: "For brands running sponsorships or audience campaigns.",
      includes: ["Campaign management", "Analytics", "Broadcasts", "Support for real-world moments"],
    },
  ],
  civic: [
    {
      name: "Civic Basic",
      price: "Free",
      description: "For community groups, neighborhood initiatives and public information.",
      includes: ["Civic profile", "Event listings", "Community visibility", "Public information"],
    },
    {
      name: "Civic Plus",
      price: "$30/month",
      description: "For organizations that want to promote programs, events or participation moments.",
      includes: ["Featured community events", "Community reporting", "Survey access"],
    },
    {
      name: "Civic Pro",
      price: "$99/month",
      description: "For organizations that need engagement tracking and participation reporting.",
      includes: ["Community engagement reporting", "Broadcast tools", "Participation analytics"],
    },
  ],
};

const modules = [
  ["Live map listing", "Included", "A real place on the downtown map with category, district and nearby context."],
  ["QR entry points", "Included", "Put a code in a lobby, venue, room, event, menu, poster, storefront or card."],
  ["Perks card connection", "Included", "Residents can save, show, redeem and come back without downloading an app."],
  ["Event placement", "Included where relevant", "Add events to the map so people can RSVP or decide in the moment."],
  ["Partner dashboard", "Included", "See scans, saves, RSVPs, redemptions and nearby activity in plain English."],
  ["AI insight notes", "Included", "The system explains what happened, where it happened and what to try next."],
  ["Monthly reporting", "Included", "A simple readout of what people did, which placements worked and where demand showed up."],
].map(([name, status, description]) => ({ name, status, description }));

const addOns = [
  ["Survey Pulse", "From $49", "3-6 questions, QR or text entry, audience summary and plain-English takeaways"],
  ["Campaign Launch Kit", "From $99", "Offer setup, QR surfaces, placement logic and launch checklist"],
  ["Building Placement Pack", "From $99", "Lobby, leasing, resident welcome and move-in QR placements"],
  ["Custom Partner Report", "From $79", "Cleaner reporting for leadership, owners, sponsors or property groups"],
].map(([name, price, description]) => ({ name, price, description }));

const campaignModules = [
  { name: "Perk Campaign", price: "$30", description: "Single 30-day resident perk campaign." },
  { name: "Featured Campaign", price: "$49", description: "Category placement, homepage placement or enhanced visibility." },
  { name: "Sponsored Campaign", price: "$99", description: "District-wide placement and premium exposure." },
];

const eventModules = [
  { name: "Event Boost", price: "$20", description: "Featured event placement." },
  { name: "Featured Event", price: "$49", description: "Enhanced visibility and priority discovery." },
  { name: "Sponsored Event", price: "$99", description: "District-wide event promotion." },
];

const nearbyBroadcasts = [
  ["5 minute walk radius", "$20"],
  ["10 minute walk radius", "$30"],
  ["District wide", "$40"],
  ["Downtown wide", "$75"],
].map(([name, price]) => ({ name, price }));

const smsBroadcasts = [
  ["Up to 500 recipients", "$30"],
  ["Up to 2,500 recipients", "$79"],
  ["Up to 5,000 recipients", "$149"],
].map(([name, price]) => ({ name, price }));

const surveyModules = [
  { name: "Single Survey", price: "$30", description: "One survey, response dashboard and exportable results." },
  { name: "Survey Series", price: "$79", description: "Monthly surveys and trend reporting." },
  { name: "Custom Research Project", price: "$199", description: "Audience targeting, custom reporting and insights summary." },
];

const analyticsModules = [
  { name: "Analytics Plus", price: "$30/month", includes: ["Peak times", "Top-performing offers", "Audience insights", "Engagement trends"] },
  { name: "Analytics Pro", price: "$79/month", includes: ["Heatmaps", "Movement patterns", "Benchmarking", "Audience segmentation", "Campaign attribution"] },
];

const realWorldModules = [
  { name: "In-Venue Activation", price: "$99", description: "Single venue setup." },
  { name: "Property Activation", price: "$99", description: "Single property setup." },
  { name: "Multi-Location Activation", price: "$199", description: "Cross-partner setup." },
  { name: "Street Team Activation", price: "Half Day: $199 / Full Day: $399", description: "In-person support." },
];

const sponsorships = [
  { name: "District Sponsor", price: "$199/month", includes: ["Category ownership", "Featured visibility", "Campaign credits", "Reporting"] },
  { name: "Seasonal Sponsor", price: "$499", includes: ["30-day district takeover", "Featured placement", "Campaign support"] },
];

const surveySteps = [
  ["01", "Scan or text", "A resident, guest, customer or event attendee scans a QR code or texts a short keyword."],
  ["02", "Answer quickly", "They answer a few everyday questions. No app, no account, no long form."],
  ["03", "Signals connect", "Answers connect to district, timing, offer, event or placement context."],
  ["04", "Engine explains", "The insight layer turns responses into plain-English audience notes and next steps."],
].map(([step, title, description]) => ({ step, title, description }));

const placementOptions = [
  ["Be part of the map", "Appear when people nearby are looking for somewhere to go, something to do or a place worth saving for later."],
  ["In the real world", "Connect people through a QR code placed in a lobby, venue, guest room, event, storefront, building or shared space."],
  ["Through an offer", "Offer something useful: a local perk, exclusive access, event benefit, resident discount or reason to come back."],
  ["Around a neighborhood", "Highlight a district, neighborhood, event or local moment where people are already spending time."],
  ["Through a question", "Ask a few simple questions and understand what brought people in, what caught their attention and what they would like to see next."],
  ["See what happened next", "Understand what people responded to and where momentum is building. Track visits, saves, responses, redemptions and activity in one place."],
].map(([title, description]) => ({ title, description }));

const primaryCta =
  "inline-flex h-10 items-center justify-center gap-2 rounded-[6px] bg-[#0B1F33] px-5 text-[13px] font-medium text-white transition hover:bg-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]";
const secondaryCta =
  "inline-flex h-10 items-center justify-center gap-2 rounded-[6px] border border-[#0B1F33]/[0.08] bg-white px-5 text-[13px] font-medium text-[#0B1F33] shadow-[0_8px_22px_rgba(11,31,51,0.045)] transition hover:border-[#C8A96A]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]";

const partnerPricingSections = [
  {
    id: "partner-types",
    label: "Partner types",
    eyebrow: "Start here",
    copy: "Choose the setup that fits your place.",
    image: "/images/partners/pricing/rail/resident-map-phone.jpg",
    icon: "users",
  },
  {
    id: "pricing",
    label: "Pricing",
    eyebrow: "Simple plans",
    copy: "Clear options. No mystery fees.",
    image: "/images/partners/pricing/rail/lobby-qr-tabletop.jpg",
    icon: "tag",
  },
  {
    id: "modules",
    label: "Modules",
    eyebrow: "Core tools",
    copy: "Perks, redemptions, scans, and reporting.",
    image: "/images/partners/pricing/rail/cafe-perk-redemption.jpg",
    icon: "boxes",
  },
  {
    id: "add-ons",
    label: "Add-ons",
    eyebrow: "Go further",
    copy: "Extra tools for campaigns and reporting.",
    image: "/images/partners/pricing/rail/partner-dashboard.jpg",
    icon: "plus",
  },
  {
    id: "surveys",
    label: "Surveys",
    eyebrow: "Ask better",
    copy: "Learn what people actually want.",
    image: "/images/partners/pricing/rail/survey-qr-phone.jpg",
    icon: "clipboard",
  },
  {
    id: "placements",
    label: "Placements",
    eyebrow: "Real places",
    copy: "QR codes, signs, and prompts where people already are.",
    image: "/images/partners/pricing/rail/rainey-street-placement.jpg",
    icon: "map-pin",
  },
  {
    id: "contact",
    label: "Contact",
    eyebrow: "Talk to us",
    copy: "Get help choosing the right setup.",
    image: "/images/partners/pricing/rail/cafe-thank-you-card.jpg",
    icon: "mail",
  },
];

function Section({ id, eyebrow, title, subhead, children, className = "" }) {
  return (
    <section id={id} className={`px-5 py-12 md:py-16 ${className}`}>
      <div className="mx-auto max-w-6xl">
        {(eyebrow || title || subhead) && (
          <div className="mb-8 max-w-3xl">
            {eyebrow && <span className="dp-label mb-3 block">{eyebrow}</span>}
            {title && <h2 className="font-heading text-3xl font-medium leading-[1.08] text-[#0B1F33] md:text-4xl">{title}</h2>}
            {subhead && <p className="mt-4 text-[14px] leading-7 text-[#0B1F33]/66">{subhead}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function PartnerPricingSectionRail({ activeSection, onSectionChange }) {
  return (
    <nav
      className="mt-8 border-y border-dp-navy/10 py-5"
      aria-label="Partner pricing sections"
    >
      <div className="-mx-6 overflow-x-auto px-6 md:mx-0 md:px-0">
        <div className="flex min-w-max gap-4 lg:grid lg:min-w-0 lg:grid-cols-7">
          {partnerPricingSections.map((section) => {
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSectionChange(section.id)}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "group relative w-[178px] shrink-0 overflow-hidden rounded-[18px] border bg-white text-left",
                  "shadow-[0_18px_48px_rgba(11,31,51,0.08)] transition-all duration-300",
                  "hover:-translate-y-0.5 hover:border-dp-gold/45 hover:shadow-[0_24px_60px_rgba(11,31,51,0.11)]",
                  "focus:outline-none focus:ring-2 focus:ring-dp-gold/35 focus:ring-offset-2",
                  "md:w-[206px] lg:w-auto",
                  isActive
                    ? "border-dp-gold/70 bg-white shadow-[0_24px_64px_rgba(11,31,51,0.13)]"
                    : "border-dp-navy/10",
                ].join(" ")}
              >
                <span className="relative block h-[138px] overflow-hidden bg-dp-navy md:h-[152px]">
                  <img
                    src={section.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover opacity-95 transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                  />

                  <span className="absolute inset-0 bg-gradient-to-t from-dp-navy/82 via-dp-navy/18 to-transparent" />

                  <span
                    className={[
                      "absolute bottom-0 left-0 h-[2px] bg-dp-gold transition-all duration-300",
                      isActive ? "w-full" : "w-0 group-hover:w-full",
                    ].join(" ")}
                  />
                </span>

                <span className="relative block min-h-[152px] px-4 pb-5 pt-9">
                  <span className="absolute -top-8 left-4 flex h-16 w-16 items-center justify-center rounded-full border border-dp-gold bg-dp-navy text-dp-gold shadow-[0_14px_34px_rgba(11,31,51,0.24)]">
                    <PartnerRailIcon name={section.icon} />
                  </span>

                  <span className="block text-[10px] font-semibold uppercase leading-none tracking-[0.18em] text-dp-gold/90">
                    {section.eyebrow}
                  </span>

                  <span className="mt-3 block font-heading text-[26px] leading-[0.95] text-dp-navy md:text-[30px]">
                    {section.label}
                  </span>

                  <span className="mt-3 block text-[13px] leading-[1.45] text-dp-navy/66">
                    {section.copy}
                  </span>

                  <span className="mt-5 block h-px w-10 bg-dp-gold" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function PartnerRailIcon({ name }) {
  const className = "h-7 w-7";

  switch (name) {
    case "users":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    case "tag":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M20.59 13.41 11 3.83A2.83 2.83 0 0 0 9 3H4v5a2.83 2.83 0 0 0 .83 2l9.58 9.59a2 2 0 0 0 2.83 0l3.35-3.35a2 2 0 0 0 0-2.83Z" />
          <circle cx="7.5" cy="6.5" r="1" />
        </svg>
      );

    case "boxes":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="m12 2 7 4v8l-7 4-7-4V6l7-4Z" />
          <path d="m5 6 7 4 7-4" />
          <path d="M12 10v8" />
          <path d="M5 14 2 16v4l4 2 4-2v-2" />
          <path d="M19 14l3 2v4l-4 2-4-2v-2" />
        </svg>
      );

    case "plus":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );

    case "clipboard":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M9 3h6l1 2h3v16H5V5h3l1-2Z" />
          <path d="m8 11 2 2 4-4" />
          <path d="m8 17 2 2 4-4" />
        </svg>
      );

    case "map-pin":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );

    case "mail":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 6h16v12H4z" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );

    default:
      return null;
  }
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-[6px] border border-[#0B1F33]/[0.08] bg-white p-5 shadow-[0_14px_34px_rgba(11,31,51,0.04)] ${className}`}>
      {children}
    </div>
  );
}

function FeatureList({ items }) {
  return (
    <ul className="mt-4 space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-[12.5px] leading-5 text-[#0B1F33]/66">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C8A96A]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CompactTable({ rows, leftLabel = "Item", rightLabel = "Price" }) {
  return (
    <div className="overflow-hidden rounded-[6px] border border-[#0B1F33]/[0.08] bg-white">
      <table className="w-full text-left">
        <thead className="border-b border-[#0B1F33]/[0.06] text-[10.5px] uppercase tracking-[0.12em] text-[#C8A96A]">
          <tr>
            <th className="px-4 py-3 font-semibold">{leftLabel}</th>
            <th className="px-4 py-3 text-right font-semibold">{rightLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-[#0B1F33]/[0.045] last:border-b-0">
              <td className="px-4 py-3 text-[12.5px] text-[#0B1F33]/66">{row.name}</td>
              <td className="px-4 py-3 text-right text-[12.5px] font-semibold text-[#0B1F33]">{row.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Pricing() {
  const [activeType, setActiveType] = useState("venues");
  const [activeSection, setActiveSection] = useState("partner-types");
  const activePartner = useMemo(() => partnerTypes.find((type) => type.id === activeType) || partnerTypes[0], [activeType]);
  const activePlans = pricingPlans[activeType] || pricingPlans.venues;

  function handleSectionChange(id) {
    setActiveSection(id);

    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth",
      });
    }
  }

  return (
    <div className="dp-partner-page min-h-screen bg-white pt-[68px] text-[#0B1F33]">
      <section className="relative overflow-hidden px-5 py-14 md:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(200,169,106,0.14),transparent)]" />
        <div className="relative mx-auto max-w-6xl">
          <span className="dp-label mb-4 block">Partner pricing</span>
          <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <h1 className="font-heading text-[38px] font-medium leading-[1.03] md:text-[56px]">
                Simple pricing for partners who want downtown action.
              </h1>
              <div className="mt-5 max-w-2xl space-y-3 text-[15px] leading-[1.75] text-[#0B1F33]/68">
                <p>Downtown Perks is built around simple participation.</p>
                <p>Show up on the map. Add a perk. Reach nearby residents. Run a campaign when it matters. See what happened.</p>
                <p className="font-medium text-[#0B1F33]">No contracts. No setup fees. No long onboarding process.</p>
              </div>
              <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:gap-5">
                <a href="#partner-types" className={primaryCta}>
                  Find your partner type
                  <ArrowRight className="h-3.5 w-3.5 text-[#C8A96A]" />
                </a>
                <a href="#contact" className={secondaryCta}>
                  Discuss activation
                </a>
              </div>
            </div>
            <Card>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">Quick read</p>
              <ul className="mt-4 space-y-3 text-[13px] leading-6 text-[#0B1F33]/68">
                <li><strong className="text-[#0B1F33]">Free Forever</strong> venue listings include one active resident perk.</li>
                <li>Paid plans start at <strong className="text-[#0B1F33]">$30/month</strong>.</li>
                <li>Recurring partner plans stay capped at <strong className="text-[#0B1F33]">$199/month</strong>.</li>
                <li>Campaigns, broadcasts, surveys, placements, analytics, sponsorships and real-world support are add-ons.</li>
              </ul>
            </Card>
          </div>
          <PartnerPricingSectionRail activeSection={activeSection} onSectionChange={handleSectionChange} />
        </div>
      </section>

      <Section id="why-free" eyebrow="Why free exists" title="Why a free plan exists.">
        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <p className="text-[14px] leading-7 text-[#0B1F33]/68">
              The best downtown map is the one that actually reflects downtown. Every venue can appear on Downtown Perks for free. Every free listing includes one active resident perk.
            </p>
          </Card>
          <Card>
            <div className="grid gap-2 text-[13px] leading-6 text-[#0B1F33]/70 sm:grid-cols-2">
              {["A free coffee upgrade.", "A welcome drink.", "10% off lunch.", "A resident special.", "Something worth saving.", "Something worth using."].map((item) => (
                <div key={item} className="border-b border-[#0B1F33]/[0.06] pb-2">{item}</div>
              ))}
            </div>
            <p className="mt-5 text-[13px] leading-6 text-[#0B1F33]/64">
              More businesses on the map creates more reasons for residents to open it. More resident usage creates more visibility for everyone.
            </p>
          </Card>
        </div>
      </Section>

      <Section id="partner-types" eyebrow="Partner types" title="Choose the type that fits you.">
        <div className="grid gap-3 md:grid-cols-5">
          {partnerTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setActiveType(type.id)}
              className={`rounded-[6px] border p-4 text-left transition ${
                activeType === type.id ? "border-[#C8A96A]/60 bg-white shadow-[0_12px_28px_rgba(11,31,51,0.06)]" : "border-[#0B1F33]/[0.08] bg-white hover:border-[#C8A96A]/40"
              }`}
            >
              <span className="text-[13px] font-semibold text-[#0B1F33]">{type.label}</span>
              <span className="mt-2 block text-[11.5px] leading-5 text-[#0B1F33]/58">{type.summary}</span>
            </button>
          ))}
        </div>
        <Card className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">{activePartner.label}</p>
          <p className="mt-3 text-[15px] leading-7 text-[#0B1F33]/72">{activePartner.use}</p>
        </Card>
      </Section>

      <Section id="pricing" eyebrow="Pricing matrix" title="Plans by partner type." subhead="Start free. Add more only when there is a reason.">
        <span id="pricing-matrix" className="block scroll-mt-24" aria-hidden="true" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {activePlans.map((plan) => (
            <Card key={plan.name} className="flex flex-col">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/48">{plan.name}</div>
              <div className="mt-3 font-heading text-3xl font-medium text-[#0B1F33]">{plan.price}</div>
              <p className="mt-4 text-[12.5px] leading-6 text-[#0B1F33]/64">{plan.description}</p>
              <FeatureList items={plan.includes} />
              {plan.examples && (
                <div className="mt-5 border-t border-[#0B1F33]/[0.06] pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C8A96A]">Example perks</p>
                  <FeatureList items={plan.examples} />
                </div>
              )}
              {plan.note && <p className="mt-5 text-[12px] font-medium text-[#0B1F33]">{plan.note}</p>}
            </Card>
          ))}
        </div>
      </Section>

      <Section id="modules" eyebrow="Platform modules" title="What the platform offers.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Card key={module.name}>
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-[15px] font-semibold text-[#0B1F33]">{module.name}</h3>
                <span className="text-[11px] font-semibold text-[#C8A96A]">{module.status}</span>
              </div>
              <p className="mt-3 text-[12.5px] leading-6 text-[#0B1F33]/64">{module.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="add-ons" eyebrow="Add-ons and campaigns" title="Start with what matters. Add what works." subhead="Add-ons are intentionally small. The point is to test real behavior quickly, then expand only when the data supports it.">
        <span id="addons" className="block scroll-mt-24" aria-hidden="true" />
        <div className="grid gap-4 lg:grid-cols-2">
          {addOns.map((item) => (
            <Card key={item.name}>
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-[15px] font-semibold text-[#0B1F33]">{item.name}</h3>
                <span className="text-[13px] font-semibold text-[#0B1F33]">{item.price}</span>
              </div>
              <p className="mt-3 text-[12.5px] leading-6 text-[#0B1F33]/64">{item.description}</p>
            </Card>
          ))}
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <Card><h3 className="text-[16px] font-semibold">Campaign modules</h3><div className="mt-4 space-y-3">{campaignModules.map((item) => <MiniRow key={item.name} {...item} />)}</div></Card>
          <Card><h3 className="text-[16px] font-semibold">Event promotion</h3><div className="mt-4 space-y-3">{eventModules.map((item) => <MiniRow key={item.name} {...item} />)}</div></Card>
          <Card><h3 className="text-[16px] font-semibold">Survey modules</h3><div className="mt-4 space-y-3">{surveyModules.map((item) => <MiniRow key={item.name} {...item} />)}</div></Card>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Card>
            <h3 className="text-[16px] font-semibold">Reach people when timing matters.</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <CompactTable rows={nearbyBroadcasts} leftLabel="Nearby broadcast" />
              <CompactTable rows={smsBroadcasts} leftLabel="SMS broadcast" />
            </div>
          </Card>
          <Card>
            <h3 className="text-[16px] font-semibold">Analytics, real-world support and sponsorships</h3>
            <div className="mt-5 grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">{analyticsModules.map((item) => <ModulePriceCard key={item.name} item={item} />)}</div>
              <CompactTable rows={realWorldModules} leftLabel="Real-world support" />
              <div className="grid gap-3 sm:grid-cols-2">{sponsorships.map((item) => <ModulePriceCard key={item.name} item={item} />)}</div>
            </div>
          </Card>
        </div>
      </Section>

      <Section id="surveys" eyebrow="Survey engine" title="Ask a question. Learn something useful.">
        <div className="max-w-3xl space-y-4 text-[14px] leading-7 text-[#0B1F33]/68">
          <p>Ask a few good questions at the exact right moment.</p>
          <p>Surveys work through a QR code or text prompt. A brand, venue, hotel, property or civic partner can ask people what they want, why they came, what they noticed, what they would come back for or what would make the experience better.</p>
          <p>The partner does not need an app rollout or complicated software. People answer in a simple flow. The engine groups responses with scans, district, timing, event, placement and audience context.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {surveySteps.map((step) => (
            <Card key={step.step}>
              <div className="text-[14px] font-semibold text-[#C8A96A]">{step.step}</div>
              <h3 className="mt-3 text-[15px] font-semibold text-[#0B1F33]">{step.title}</h3>
              <p className="mt-3 text-[12.5px] leading-6 text-[#0B1F33]/64">{step.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="placements" eyebrow="Placement opportunities" title="How partners show up." subhead="Different goals call for different ways to show up. Start with the option that fits what you are trying to accomplish.">
        <div className="grid gap-4 md:grid-cols-2">
          {placementOptions.map((option) => (
            <Card key={option.title}>
              <h3 className="text-[16px] font-semibold text-[#0B1F33]">{option.title}</h3>
              <p className="mt-3 text-[13px] leading-6 text-[#0B1F33]/64">{option.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section eyebrow="What partners pay for" title="Visibility is free. Activation is optional.">
        <div className="max-w-4xl space-y-4 text-[14px] leading-7 text-[#0B1F33]/68">
          <p>Most partners start with a listing and a perk.</p>
          <p>When they want more attention, more reach, deeper reporting or audience insight, they add campaigns, broadcasts, surveys, placements, analytics or activations.</p>
          <p>Downtown Perks is priced so partners can begin with the right plan, learn what people actually do, then add only when there is a clear reason.</p>
        </div>
      </Section>

      <Section eyebrow="Enterprise and custom" title="Enterprise and custom partnerships.">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <p className="text-[14px] leading-7 text-[#0B1F33]/68">
            For major developments, destination brands, downtown-wide initiatives and strategic partnerships, custom pricing is available.
          </p>
          <Card>
            <FeatureList items={["Major mixed-use developments", "Multi-property portfolios", "Destination campaigns", "Civic partnerships", "District-wide sponsorships", "Large brand activations"]} />
          </Card>
        </div>
      </Section>

      <Section id="contact" eyebrow="Final CTA" title="Do less. Learn more.">
        <div className="max-w-3xl text-[14px] leading-7 text-[#0B1F33]/68">
          <p>Start with the right plan.</p>
          <p>Learn what people actually do.</p>
          <p>Add campaigns, placements, surveys, broadcasts or reporting only when there is a clear reason.</p>
        </div>
        <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:gap-5">
          <a href="#partner-types" className={primaryCta}>
            Choose partner type
            <ArrowRight className="h-3.5 w-3.5 text-[#C8A96A]" />
          </a>
          <Link to="/contact" className={secondaryCta}>
            Start a conversation
          </Link>
        </div>
      </Section>

      <Footer />
    </div>
  );
}

function MiniRow({ name, price, description }) {
  return (
    <div className="border-b border-[#0B1F33]/[0.06] pb-3 last:border-b-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <span className="text-[13px] font-semibold text-[#0B1F33]">{name}</span>
        <span className="text-[13px] font-semibold text-[#0B1F33]">{price}</span>
      </div>
      <p className="mt-1 text-[12px] leading-5 text-[#0B1F33]/60">{description}</p>
    </div>
  );
}

function ModulePriceCard({ item }) {
  return (
    <div className="rounded-[6px] border border-[#0B1F33]/[0.06] p-4">
      <div className="flex items-start justify-between gap-4">
        <span className="text-[13px] font-semibold text-[#0B1F33]">{item.name}</span>
        <span className="text-[13px] font-semibold text-[#0B1F33]">{item.price}</span>
      </div>
      {item.includes && <FeatureList items={item.includes} />}
    </div>
  );
}
