import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1];

const pricingTiles = [
  {
    id: "properties",
    label: "Properties",
    audience: "Multifamily, condos, apartments, and residential buildings.",
    price: "$199 / year",
    pilot: "90-day pilot. Then choose your level.",
    line: "Management pays. Residents stay.",
    detail: "Your address is your key to unlock downtown.",
  },
  {
    id: "hotels",
    label: "Hotels",
    audience: "Hotels, boutiques, extended stays, and hospitality.",
    price: "$149 / year",
    pilot: "90-day pilot. See what guests actually do.",
    line: "Extend the stay beyond your lobby.",
    detail: "One scan. Every option. Guests navigate. You benefit.",
  },
  {
    id: "venues",
    label: "Venues",
    audience: "Restaurants, bars, cafés, fitness, wellness, and experiences.",
    price: "$39–$149 / year",
    pilot: "Free for 12 months. Then decide.",
    line: "Show up in the moment that counts.",
    detail: "Not reach. Relevance. Not impressions. Intent.",
  },
  {
    id: "brands",
    label: "Brands · Sponsors",
    audience: "Brands, activations, campaigns, and corridor sponsorships.",
    price: "$99–$149 / year",
    pilot: "Test it. Measure it. Scale it.",
    line: "Buy the moment, not the impression.",
    detail: "Context beats scale. Timing beats frequency.",
  },
  {
    id: "civic",
    label: "Civic",
    audience: "Cities, districts, chambers, and community partners.",
    price: "$49–$79 / year",
    pilot: "Start with 90 days. Keep what works.",
    line: "Turn attendance into participation.",
    detail: "Discovery drives turnout. Access drives engagement.",
  },
];

const partnerTypes = [
  {
    id: "properties",
    label: "Properties",
    cta: "Bring this to your property",
    truth: "You're not selling square footage. You're selling everything around it.",
    body: "Here's the thing nobody tells you about renting apartments. You're selling the coffee shop where your barista knows your order, the bar that feels like your living room, and the Thai place that's open late. Give people a way to see it, not a laminated list from 2019.",
    includes: [
      "QR access across lobby, leasing, and welcome flow",
      "Live map of nearby places, events, and perks",
      "Your property inside the same experience",
      "Real engagement, not passive info",
    ],
    pricing: "90-day pilot. Free forever basic listing · $39/year analytics · $99/year full stack.",
  },
  {
    id: "hotels",
    label: "Hotels",
    cta: "Use this for guests",
    truth: "Hotels spend fortunes on lobbies. Then hand guests a photocopied restaurant list.",
    body: "You nail the arrival. Then leave the rest to chance. Guests don't want recommendations. They want orientation. One scan and they know where to go: coffee, dinner, tonight.",
    includes: [
      "QR access in rooms, lobby, and guest flow",
      "Live map of nearby venues, events, and perks",
      "Better experience, zero extra friction",
      "Discovery tied to actual location",
    ],
    pricing: "90-day pilot. From $99/year.",
  },
  {
    id: "venues",
    label: "Venues",
    cta: "Discuss activation",
    truth: "Most restaurants obsess over Instagram. Then wonder why nobody walks in.",
    body: "People don't remember ads. They remember what's nearby when they're hungry. The place they passed. The bar they noticed. The coffee that showed up at the right moment.",
    includes: [
      "Map placement based on proximity",
      "Perks and offers that actually get used",
      "Events surfaced in the right moment",
      "Save, show, scan, done",
      "Clear engagement at 30, 60, 90 days",
    ],
    pricing: "Free for 12 months. From $49/year after.",
  },
  {
    id: "brands",
    label: "Brands / Sponsors",
    cta: "Start a conversation",
    truth: "The best advertising doesn't feel like advertising.",
    body: "It feels like something useful that arrived at the right time. You're not interrupting. You're appearing inside a decision already happening: coffee, lunch, drinks, tonight.",
    includes: [
      "Corridor-based visibility across downtown",
      "Placement tied to location and timing",
      "Event and campaign integration",
      "Trackable actions, not vague impressions",
    ],
    pricing: "Test it. Measure it. Scale it. From $149/year.",
  },
  {
    id: "civic",
    label: "Civic",
    cta: "Talk to us",
    truth: "Cities work better when people know what's happening.",
    body: "Right now, finding a local event takes effort. Too much effort. What if it didn't? One place. One map. Everything visible.",
    includes: [
      "Community events in one visible layer",
      "District-wide discovery",
      "Shared map for participation",
      "Clear access to what's happening nearby",
    ],
    pricing: "Start with 90 days. From $49/year.",
  },
];

const partnerFaqs = [
  {
    id: "partner-faq-1",
    question: "Do venues pay to join?",
    answer: "Not at first. Venues get 12 months free to prove the value. After that, it's $49-$99/year if you keep it. No risk. No long-term commitment.",
  },
  {
    id: "partner-faq-2",
    question: "What do buildings pay?",
    answer: "90-day free pilot. After that, choose: stay free forever with basic reporting, $39/year for full analytics, or $99/year for premium tier.",
  },
  {
    id: "partner-faq-3",
    question: "How fast can a partner launch?",
    answer: "7-10 days. We handle setup, map placement, QR generation, and entry point coordination.",
  },
  {
    id: "partner-faq-4",
    question: "What gets tracked?",
    answer: "Scans, saves, RSVPs, and redemptions. You get reporting snapshots at 30, 60, and 90 days to see what's working.",
  },
  {
    id: "partner-faq-5",
    question: "What kind of perks?",
    answer: "Discounts on food and drinks, priority access to events, welcome offers, and members-only specials. Each business sets its own perks.",
  },
  {
    id: "partner-faq-6",
    question: "Can partners update listings?",
    answer: "Yes. Partners get a simple dashboard to update hours, add perks, post events, and adjust map presence. Changes go live immediately.",
  },
  {
    id: "partner-faq-7",
    question: "Where is this available?",
    answer: "Downtown Austin. We're starting with one district, proving the model, then expanding to other downtown corridors based on partner and resident demand.",
  },
];

const formTabs = [
  {
    id: "properties",
    label: "Property",
    title: "For Residential Buildings & Properties",
    promise: "90-day free pilot. See what residents actually do.",
    prompts: [
      "We want to add a neighborhood layer for our residents.",
      "Help us set up building access.",
      "We want to connect nearby offers and events to our building.",
      "Show us how the resident card works.",
    ],
  },
  {
    id: "hotels",
    label: "Hotel",
    title: "For Hotels & Hospitality",
    promise: "90-day pilot. Extend the stay beyond your lobby.",
    prompts: [
      "We want a simple neighborhood guide guests can open from the lobby.",
      "Help us set up QR access.",
      "We want guests to find dining and events nearby without asking staff.",
      "Show us how offers work for guests.",
    ],
  },
  {
    id: "venues",
    label: "Venue",
    title: "For Venues & Businesses",
    promise: "Free for 12 months. Zero sign-up fees.",
    prompts: [
      "We want to add a perk for downtown residents.",
      "How do we track scan and redemption data?",
      "We want to get listed on the resident map.",
      "Tell us about the 12-month free period.",
    ],
  },
  {
    id: "brands",
    label: "Brand",
    title: "For Brands & Sponsors",
    promise: "Buy the moment, not the impression.",
    prompts: [
      "We want to sponsor a district activation.",
      "We are looking for targeted placement in front of residents.",
      "How do your campaigns track real-world traffic?",
      "We'd love to see a case study similar to our brand.",
    ],
  },
  {
    id: "civic",
    label: "Civic",
    title: "For Civic Partners",
    promise: "Turn attendance into participation.",
    prompts: [
      "We're looking to promote a public downtown event.",
      "We want to create a district visibility layer.",
      "Can we use this for public wayfinding?",
      "Help us measure visits to our public space.",
    ],
  },
];

const formFieldsByType = {
  properties: ["Building Name and Address", "Your Name & Role", "Email", "Phone", "Number of Units", "What interests you?", "Any specific goals?"],
  hotels: ["Hotel/Property Name", "Your Name & Role", "Email", "Phone", "Number of Rooms", "Property Type", "What matters most?"],
  venues: ["Business Name", "Your Name", "Email", "Phone", "Business Type", "Street Address", "What perk will you offer?", "Hours of Operation"],
  brands: ["Brand/Company Name", "Your Name & Role", "Email", "Phone", "What are you activating?", "Target Audience", "Timeline"],
  civic: ["Organization Name", "Your Name & Role", "Email", "Phone", "Organization Type", "What do you want to activate?", "Geographic Focus"],
};

const formCtasByType = {
  properties: "Start Free Pilot",
  hotels: "Use This for Guests",
  venues: "Discuss Activation",
  brands: "Start a Conversation",
  civic: "Talk to Us",
};

function Section({ id, eyebrow, title, children, className = "" }) {
  return (
    <section id={id} className={cn("border-t border-[#0B1F33]/8 px-5 py-14 md:py-20", className)}>
      <div className="mx-auto max-w-6xl">
        {(eyebrow || title) && (
          <div className="mb-8 max-w-3xl">
            {eyebrow && <span className="dp-label mb-3 block">{eyebrow}</span>}
            {title && <h2 className="font-heading text-3xl font-medium leading-[1.08] tracking-normal text-[#0B1F33] md:text-4xl">{title}</h2>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function CTAButton({ to, children, variant = "primary" }) {
  const classes = variant === "primary"
    ? "bg-[#0B1F33] text-white hover:bg-[#081521]"
    : "border border-[#0B1F33]/10 bg-white text-[#0B1F33] hover:bg-[#F7F8FB]";

  const className = cn("inline-flex h-10 items-center justify-center gap-2 rounded-[4px] px-5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]", classes);

  if (to.includes("#")) {
    return (
      <a href={to} className={className}>
        {children}
        <ArrowRight className="h-4 w-4" />
      </a>
    );
  }

  return (
    <Link to={to} className={className}>
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

function PilotStepper() {
  const steps = [
    {
      label: "01",
      title: "Launch",
      body: "Set up QR entry points and map visibility so people can find you immediately.",
      metrics: ["QR entry", "Map visibility", "Live listing"],
    },
    {
      label: "02",
      title: "Measure",
      body: "Track scans, saves, RSVPs, and redemptions — real behavior, not assumptions.",
      metrics: ["Scans", "Saves", "RSVPs", "Redemptions"],
    },
    {
      label: "03",
      title: "Decide",
      body: "Keep it, scale it, or adjust based on what actually works.",
      metrics: ["Keep", "Scale", "Adjust"],
    },
  ];

  return (
    <div className="rounded-lg border border-[#0B1F33]/8 bg-white p-4 shadow-[0_14px_34px_rgba(11,31,51,0.04)]">
      <div className="grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08, ease }}
            className="rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] p-4"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-[#0B1F33] px-2 text-[11px] font-semibold text-[#B38F4F]">
                {step.label}
              </span>
              <span className="h-px flex-1 bg-[#0B1F33]/10" />
            </div>
            <h3 className="font-heading text-2xl font-medium text-[#0B1F33]">{step.title}</h3>
            <p className="mt-2 min-h-[64px] text-[13px] leading-[1.65] text-[#0B1F33]/64">{step.body}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {step.metrics.map((metric) => (
                <span key={metric} className="rounded-md border border-[#0B1F33]/8 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0B1F33]/58">
                  {metric}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2 rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] p-3 text-[13px] leading-5 text-[#0B1F33]/66 md:flex-row md:items-center md:justify-between">
        <span>You go live. People use it. You see what actually happens.</span>
        <a href="#get-started" className="inline-flex h-8 items-center justify-center rounded-md bg-[#0B1F33] px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
          Start pilot
        </a>
      </div>
    </div>
  );
}

function PricingTiles() {
  return (
    <div className="grid gap-3 md:grid-cols-5">
      {pricingTiles.map((tile) => (
        <div key={tile.id} className="rounded-[6px] border border-[#0B1F33]/8 bg-white p-5 shadow-[0_14px_34px_rgba(11,31,51,0.04)]">
          <h3 className="font-heading text-xl font-medium text-[#0B1F33]">{tile.label}</h3>
          <p className="mt-2 text-[12px] leading-[1.6] text-[#0B1F33]/58">{tile.audience}</p>
          <div className="mt-4 text-[16px] font-medium text-[#0B1F33]">{tile.price}</div>
          <p className="mt-2 text-[12px] leading-[1.55] text-[#0B1F33]/60">{tile.pilot}</p>
          <div className="mt-4 border-t border-[#0B1F33]/8 pt-3">
            <p className="text-[12px] font-medium text-[#0B1F33]">{tile.line}</p>
            <p className="mt-1 text-[11px] leading-[1.55] text-[#0B1F33]/50">{tile.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PartnerTypeTabs() {
  const [active, setActive] = useState(partnerTypes[0].id);
  const current = partnerTypes.find((type) => type.id === active) || partnerTypes[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
        {partnerTypes.map((type) => {
          const selected = type.id === active;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => setActive(type.id)}
              className={cn(
                "min-w-[170px] rounded-[6px] border px-4 py-2.5 text-left text-[13px] font-medium transition-colors lg:w-full lg:min-w-0",
                selected ? "border-[#0B1F33] bg-[#0B1F33] text-white" : "border-[#0B1F33]/8 bg-white text-[#0B1F33]/68 hover:border-[#B38F4F]/50"
              )}
            >
              {type.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-[10px] border border-[#0B1F33]/8 bg-white p-5 md:p-7">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease }}
          >
            <h3 className="font-heading text-3xl font-medium leading-tight text-[#0B1F33]">{current.label}</h3>
            <p className="mt-4 text-[15px] leading-[1.7] text-[#0B1F33]/76">{current.truth}</p>
            <p className="mt-4 text-[13px] leading-[1.7] text-[#0B1F33]/62">{current.body}</p>

            <div className="mt-6 grid gap-6 md:grid-cols-[1fr_0.8fr]">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#B38F4F]">What this includes</div>
                <ul className="mt-3 space-y-2.5">
                  {current.includes.map((item) => (
                    <li key={item} className="flex gap-2 text-[13px] leading-[1.6] text-[#0B1F33]/68">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#B38F4F]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[6px] border border-[#0B1F33]/8 bg-[#F7F8FB] p-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#B38F4F]">Pilot and pricing</div>
                <p className="mt-3 text-[13px] leading-[1.65] text-[#0B1F33]/68">{current.pricing}</p>
                <a href="#get-started" className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-[6px] bg-[#0B1F33] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#081521]">
                  {current.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function PartnerForms() {
  const [active, setActive] = useState(formTabs[0].id);
  const [prompt, setPrompt] = useState(formTabs[0].prompts[0]);
  const current = formTabs.find((tab) => tab.id === active) || formTabs[0];

  function selectTab(tab) {
    setActive(tab.id);
    setPrompt(tab.prompts[0]);
  }

  return (
    <div className="rounded-[10px] border border-[#0B1F33]/8 bg-white">
      <div className="flex gap-2 overflow-x-auto border-b border-[#0B1F33]/8 p-3">
        {formTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => selectTab(tab)}
            className={cn(
              "min-w-[120px] rounded-[6px] px-3 py-2 text-left text-[12px] font-medium transition-colors",
              active === tab.id ? "bg-[#0B1F33] text-white" : "bg-[#F7F8FB] text-[#0B1F33]/68 hover:text-[#0B1F33]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="grid gap-6 p-5 md:grid-cols-[0.85fr_1.15fr] md:p-7">
        <div>
          <span className="dp-label mb-3 block">Get started</span>
          <h3 className="font-heading text-3xl font-medium leading-tight text-[#0B1F33]">{current.title}</h3>
          <p className="mt-3 text-[14px] leading-[1.65] text-[#0B1F33]/64">{current.promise}</p>
          <div className="mt-6">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#0B1F33]/45">Quick prompts</div>
            <div className="mt-2 grid gap-2">
              {current.prompts.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPrompt(item)}
                  className={cn(
                    "rounded-[6px] border px-3 py-2 text-left text-[12px] leading-relaxed transition-colors",
                    prompt === item ? "border-[#B38F4F]/60 bg-[#0B1F33]/10 text-[#0B1F33]" : "border-[#0B1F33]/8 bg-[#F7F8FB] text-[#0B1F33]/62 hover:text-[#0B1F33]"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
        <form className="grid gap-3">
          {(formFieldsByType[current.id] || formFieldsByType.properties).map((label) => (
            <label key={label} className="grid gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#0B1F33]/45">{label}</span>
              <input className="h-10 rounded-[6px] border border-[#0B1F33]/10 bg-[#F7F8FB] px-3 text-[13px] outline-none focus:border-[#B38F4F]/60" />
            </label>
          ))}
          <label className="grid gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#0B1F33]/45">What are you trying to activate?</span>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="min-h-28 rounded-[6px] border border-[#0B1F33]/10 bg-[#F7F8FB] px-3 py-2.5 text-[13px] outline-none focus:border-[#B38F4F]/60"
            />
          </label>
          <button type="button" className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-[6px] bg-[#0B1F33] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#081521]">
            {formCtasByType[current.id] || "See how it works for you"}
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="text-center text-[12px] text-[#0B1F33]/52">Questions? partners@downtownperks.com</p>
        </form>
      </div>
    </div>
  );
}

export default function PartnersIndex() {
  return (
    <div className="min-h-screen bg-[#F7F8FB] pt-[68px] text-[#0B1F33]">
      <section className="px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <span className="dp-label mb-4 block">Partners</span>
            <h1 className="font-heading text-[30px] font-medium leading-[1.04] md:text-[42px]">Turn residents into regulars.</h1>
            <div className="mt-6 space-y-3 text-[15px] leading-[1.7] text-[#0B1F33]/70">
              <p>People are already downtown. Already walking. Already deciding.</p>
              <p>You don't need more attention. You need better timing. This is that moment. Downtown Perks puts you in front of them when it matters.</p>
              <p>Not broad advertising. Not hoping they remember. Just visibility when decisions happen.</p>
            </div>
            <p className="mt-5 font-heading text-xl italic text-[#0B1F33]">Show up when it counts.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CTAButton to="#get-started">See how it works for you</CTAButton>
              <CTAButton to="#partner-types" variant="secondary">Partner types</CTAButton>
            </div>
          </div>
        </div>
      </section>

      <Section eyebrow="Ready when you are." title="Be the place people choose next.">
        <p className="max-w-2xl text-[15px] leading-[1.7] text-[#0B1F33]/68">
          People don't choose the best option. They choose the one they notice. What's close. What's clear. What's easy.
        </p>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="Be the one they notice.">
        <p className="mb-8 max-w-2xl text-[14px] leading-[1.7] text-[#0B1F33]/64">Start with a pilot. Decide with real data.</p>
        <PilotStepper />
      </Section>

      <Section eyebrow="Partner promise" title="Spend less. Do more." className="bg-white">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="font-heading text-[28px] font-medium leading-[1.08] text-[#0B1F33] md:text-[38px]">
              A smarter way to show up when downtown decisions are happening.
            </p>
            <p className="mt-5 text-[14px] leading-[1.75] text-[#0B1F33]/66">
              No heavy campaign buildout. No long-term commitment. Downtown Perks gives partners one live test where QR access, map visibility, perks, events, and simple reporting work together from the start.
            </p>
          </div>
          <div className="rounded-lg border border-[#0B1F33]/8 bg-[#F7F8FB] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/50">What partners get</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                ["Less setup", "We handle map placement, QR entry points, and launch structure."],
                ["More useful signals", "See scans, saves, RSVPs, and redemptions instead of vague attention."],
                ["Better timing", "Reach people while they are nearby and deciding where to go next."],
                ["Clear next steps", "Keep it, scale it, or adjust based on what people actually do."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-md border border-[#0B1F33]/8 bg-white p-3">
                  <h3 className="text-[13px] font-semibold text-[#0B1F33]">{title}</h3>
                  <p className="mt-1 text-[12px] leading-5 text-[#0B1F33]/58">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-4">
          {[
            ["40+", "Active partners", "Properties, venues, hotels, brands, and civic groups in one downtown layer."],
            ["180k", "Monthly scans", "QR entry points turning lobby, venue, and event traffic into measurable action."],
            ["28%", "Redemption rate", "Perks tied to what people are already looking for nearby."],
            ["140+", "Integrated locations", "A connected local network residents can actually use in the moment."],
          ].map(([value, label, body]) => (
            <div key={label} className="rounded-md border border-[#0B1F33]/8 bg-white p-4 shadow-[0_10px_26px_rgba(11,31,51,0.04)]">
              <div className="font-heading text-3xl font-medium text-[#0B1F33]">{value}</div>
              <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]">{label}</div>
              <p className="mt-3 text-[12px] leading-5 text-[#0B1F33]/58">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="pricing" eyebrow="Partner pricing" title="Start with a pilot. Decide with real data.">
        <p className="mb-8 max-w-2xl text-[13px] italic leading-[1.7] text-[#0B1F33]/58">Final pricing reflects footprint, visibility, and activation.</p>
        <PricingTiles />
        <div className="mt-8">
          <CTAButton to="#partner-types" variant="secondary">Bring this to your property</CTAButton>
        </div>
      </Section>

      <Section id="partner-types" eyebrow="Partner types" title="Ready when you are." className="bg-white">
        <PartnerTypeTabs />
      </Section>

      <FAQAccordionBlock
        sectionEyebrow="FAQs"
        sectionTitle="Partner questions"
        sectionIntro="The partner system is built around pilots, simple setup, and real actions: scans, saves, RSVPs, and redemptions."
        items={partnerFaqs}
        styleVariant="split"
        showNumbers={false}
        allowMultipleOpen={false}
        defaultOpenIndex={0}
        pageType="partners"
        backgroundVariant="light"
      />

      <Section id="get-started" eyebrow="Get started" title="Choose the partner path that fits you." className="bg-white">
        <PartnerForms />
      </Section>

      <Section eyebrow="Final CTA" title="Turn residents into regulars.">
        <p className="mb-6 max-w-2xl text-[15px] leading-[1.7] text-[#0B1F33]/68">People are already downtown. Already walking. Already deciding. Downtown Perks puts you in front of them when it matters — not broad advertising, better timing.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <CTAButton to="#get-started">See how it works for you</CTAButton>
          <CTAButton to="#partner-types" variant="secondary">Properties · Hotels · Venues · Brands · Civic</CTAButton>
        </div>
      </Section>
    </div>
  );
}
