import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, MapPinned, QrCode, Radar, SlidersHorizontal, Sparkles } from "lucide-react";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import DowntownPerksHero from "@/components/shared/DowntownPerksHero";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1];

const pricingTiles = [
  {
    id: "properties",
    label: "Properties",
    audience: "For residential buildings, multifamily communities, condos, and apartments.",
    price: "$199/year",
    body: "Help residents discover what's nearby while making the neighborhood feel like part of the amenity.",
    includes: ["Building access", "Resident perks", "Property visibility", "Local events", "Neighborhood discovery"],
    line: "The neighborhood becomes part of the resident experience.",
    cta: "Explore Property Partners",
    href: "/partners/properties",
  },
  {
    id: "hotels",
    label: "Hotels",
    audience: "For hotels, boutique stays, extended stays, and hospitality groups.",
    price: "$149/year",
    body: "Help guests discover nearby restaurants, events, experiences, and local recommendations without leaving the property.",
    includes: ["Guest discovery", "QR touchpoints", "Local recommendations", "Event visibility", "Hospitality reporting"],
    line: "Extend the stay beyond your lobby.",
    cta: "Explore Hotel Partners",
    href: "/partners/hotels",
  },
  {
    id: "venues",
    label: "Venues",
    audience: "For restaurants, cafés, bars, fitness studios, wellness businesses, retailers, and local services.",
    price: "$79-$149/year",
    body: "Show up when people nearby are deciding where to go, what to do, or what to try next.",
    includes: ["Map visibility", "QR entry points", "Local offers", "Event participation", "Visit tracking"],
    line: "Be part of the moment people are already planning.",
    cta: "Explore Venue Partners",
    href: "/partners/venues",
  },
  {
    id: "brands",
    label: "Brands",
    audience: "For consumer brands, sponsors, activations, campaigns, and downtown partnerships.",
    price: "$149-$199/year",
    body: "Connect with people through places, events, neighborhoods, and experiences they already care about.",
    includes: ["District placements", "Event partnerships", "QR engagement", "Audience feedback", "Performance reporting"],
    line: "Show up in the right place at the right time.",
    cta: "Explore Brand Partners",
    href: "/partners/brands",
  },
  {
    id: "civic",
    label: "Civic",
    audience: "For districts, chambers, associations, downtown organizations, and community initiatives.",
    price: "$49-$79/year",
    body: "Help more people discover local programs, events, resources, and opportunities to participate.",
    includes: ["Community visibility", "Event promotion", "Public engagement", "Local discovery", "Participation reporting"],
    line: "Make it easier for people to get involved.",
    cta: "Explore Civic Partners",
    href: "/partners/civic",
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
    pricing: "$199/year for the full property tier, including resident access, building placement, reporting, and engagement tools.",
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
    pricing: "$149/year for the guest-facing neighborhood layer, QR entry points, and reporting.",
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
    pricing: "$79-$149/year depending on placement, offers, events, and reporting.",
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
    pricing: "$149-$199/year depending on district footprint, campaign depth, and reporting.",
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
    pricing: "$49-$79/year depending on district visibility and event support.",
  },
];

const partnerFaqs = [
  {
    id: "partner-faq-1",
    question: "Do venues pay to join?",
    answer: "Yes. Venue plans are $79-$149/year depending on placement, offers, events, and reporting needs.",
  },
  {
    id: "partner-faq-2",
    question: "What do buildings pay?",
    answer: "Properties use the $199/year annual tier, which includes resident access, building placement, reporting, and engagement tools.",
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
    promise: "$199/year property tier. See what residents actually do.",
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
    promise: "$79-$149/year based on placement, offers, and reporting.",
    prompts: [
      "We want to add a perk for downtown residents.",
      "How do we track scan and redemption data?",
      "We want to get listed on the resident map.",
      "Help us choose the right annual venue tier.",
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
  properties: "Start Property Plan",
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
          <div className="mb-8 max-w-[1100px]">
            {eyebrow && <span className="dp-label mb-3 block">{eyebrow}</span>}
            {title && <h2 className="font-heading text-3xl font-semibold leading-[1.02] tracking-[-0.02em] text-[#0B1F33] md:text-[42px]">{title}</h2>}
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
    : "border border-[#0B1F33]/10 bg-white text-[#0B1F33] hover:bg-white";

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
  const stages = [
    {
      icon: QrCode,
      title: "Open the door downtown",
      body: "One scan takes people from the lobby, room, event, or table tent into the places around them.",
      signals: ["QR access", "Right audience", "Live route"],
    },
    {
      icon: MapPinned,
      title: "Be the nearby choice",
      body: "You appear while someone is already looking for coffee, dinner, drinks, fitness, shopping, or something to do next.",
      signals: ["Map view", "Nearby intent", "Live listing"],
    },
    {
      icon: Radar,
      title: "See what moved",
      body: "Scans, saves, RSVPs, and redemptions show the difference between being noticed and being used.",
      signals: ["Saves", "RSVPs", "Redemptions"],
    },
    {
      icon: SlidersHorizontal,
      title: "Make the next call",
      body: "Keep what people use, scale what is working, and adjust the offer, event, or placement when the signal is quiet.",
      signals: ["Keep", "Scale", "Adjust"],
    },
  ];

  const mapPins = [
    { label: "Scan", className: "left-[14%] top-[28%]", delay: 0 },
    { label: "Save", className: "right-[18%] top-[22%]", delay: 0.55 },
    { label: "RSVP", className: "left-[28%] bottom-[24%]", delay: 1.1 },
    { label: "Redeem", className: "right-[12%] bottom-[30%]", delay: 1.65 },
  ];

  return (
    <div className="overflow-hidden rounded-[8px] border border-[#0B1F33]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,248,251,0.88))] shadow-[0_24px_60px_rgba(11,31,51,0.08)]">
      <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative min-h-[360px] border-b border-[#0B1F33]/10 bg-[#0B1F33] p-5 text-white lg:border-b-0 lg:border-r">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(179,143,79,0.2),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_48%)]" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B38F4F]">Partner signal loop</span>
              <h3 className="mt-2 font-heading text-2xl font-medium leading-tight tracking-normal text-white">From first scan to a real next move.</h3>
            </div>
            <motion.div
              animate={{ rotate: [0, 8, -5, 0], scale: [1, 1.04, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] border border-[#B38F4F]/35 bg-white/10 shadow-[0_0_26px_rgba(179,143,79,0.16)]"
            >
              <Sparkles className="h-5 w-5 text-[#B38F4F]" />
            </motion.div>
          </div>

          <div className="relative mt-8 h-[230px] overflow-hidden rounded-[8px] border border-white/12 bg-[#0B1F33] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
            <div className="absolute left-8 right-8 top-10 h-px rotate-[-16deg] bg-[#B38F4F]/35" />
            <div className="absolute bottom-12 left-10 right-8 h-px rotate-[13deg] bg-[#B38F4F]/30" />
            <motion.div
              className="absolute left-[18%] top-[34%] h-2 w-2 rounded-full bg-[#B38F4F] shadow-[0_0_22px_rgba(179,143,79,0.42)]"
              animate={{ x: [0, 84, 176, 236], y: [0, -34, 48, 16], opacity: [0.4, 1, 1, 0.5] }}
              transition={{ duration: 5.8, repeat: Infinity, ease }}
            />
            {mapPins.map((pin) => (
              <motion.div
                key={pin.label}
                className={cn("absolute", pin.className)}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.8, delay: pin.delay, repeat: Infinity, ease }}
              >
                <div className="rounded-[6px] border border-[#B38F4F]/28 bg-[#0B1F33]/82 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_12px_34px_rgba(0,0,0,0.2)] backdrop-blur-md">
                  {pin.label}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="relative mt-4 grid grid-cols-3 gap-2 text-[11px] font-medium text-white/76">
            {["Entry", "Intent", "Action"].map((label, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0.35 }}
                animate={{ opacity: [0.45, 1, 0.45] }}
                transition={{ duration: 3.4, delay: index * 0.5, repeat: Infinity, ease }}
                className="rounded-[6px] border border-white/10 bg-[#0B1F33]/70 px-3 py-2 text-center"
              >
                {label}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white/56 p-4 md:p-5">
          <div className="grid gap-3 md:grid-cols-2">
            {stages.map((stage, index) => {
              const Icon = stage.icon;

              return (
                <motion.div
                  key={stage.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.45, delay: index * 0.08, ease }}
                  className="group rounded-[8px] border border-[#0B1F33]/10 bg-white/78 p-4 shadow-[0_16px_36px_rgba(11,31,51,0.05)] backdrop-blur"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#B38F4F]/28 bg-white text-[#0B1F33] shadow-[0_0_22px_rgba(179,143,79,0.14)] transition-colors group-hover:bg-[#0B1F33] group-hover:text-[#B38F4F]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="h-px flex-1 bg-[#0B1F33]/10" />
                  </div>
                  <h3 className="font-heading text-xl font-medium leading-tight tracking-normal text-[#0B1F33]">{stage.title}</h3>
                  <p className="mt-2 min-h-[70px] text-[13px] leading-[1.65] text-[#0B1F33]/64">{stage.body}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {stage.signals.map((signal) => (
                      <span key={signal} className="rounded-[5px] border border-[#0B1F33]/8 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0B1F33]/58">
                        {signal}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-[8px] border border-[#0B1F33]/10 bg-white p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[13px] font-medium leading-5 text-[#0B1F33]">One downtown layer for residents, guests, visitors, venues, sponsors, and civic teams.</p>
              <p className="mt-1 text-[12px] leading-5 text-[#0B1F33]/58">Built around what people do nearby, not what they might remember later.</p>
            </div>
            <a href="#get-started" className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[5px] bg-[#0B1F33] px-4 text-[11px] font-semibold uppercase tracking-[0.13em] text-white shadow-[0_12px_24px_rgba(11,31,51,0.18)] transition-colors hover:bg-[#0B1F33]">
              Find your path
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartnerPromiseFlow() {
  const proofPoints = [
    {
      title: "Less setup",
      body: "We place you on the map, build the QR paths, and shape the launch so the experience is ready to use.",
      label: "Map + QR",
    },
    {
      title: "Insights you can use",
      body: "Scans, saves, RSVPs, and redemptions show what people actually did after they found you.",
      label: "Real actions",
    },
    {
      title: "Better timing",
      body: "You show up while people are close by, looking around, and choosing where to go next.",
      label: "Nearby intent",
    },
    {
      title: "A clear next move",
      body: "Keep what is working, scale what is moving, and adjust the parts people are not using.",
      label: "Tune live",
    },
  ];

  return (
    <div className="relative overflow-hidden py-2">
      <div className="pointer-events-none absolute left-1/2 top-10 h-44 w-44 -translate-x-1/2 bg-[#B38F4F]/10 blur-3xl" />
      <div className="relative">
        <h2 className="max-w-[980px] font-heading text-[28px] font-semibold leading-[1.02] tracking-[-0.02em] text-[#0B1F33] md:text-[42px]">
          A smarter way to show up when downtown decisions are happening.
        </h2>
        <p className="mt-5 max-w-3xl text-[14px] leading-[1.75] text-[#0B1F33]/66">
          No heavy buildout. Downtown Perks connects map visibility, QR paths, local intent, and clear next steps in one simple partner flow.
        </p>

        <div className="mt-9 flex snap-x gap-4 overflow-x-auto pb-4 pr-5 [-webkit-overflow-scrolling:touch]">
          {proofPoints.map((point, index) => (
            <motion.article
              key={point.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.46, delay: index * 0.06, ease }}
              className="min-w-[250px] snap-start bg-white/86 p-5 shadow-[0_16px_42px_rgba(11,31,51,0.055),0_0_28px_rgba(179,143,79,0.05)] backdrop-blur-md sm:min-w-[310px] lg:min-w-[340px]"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B38F4F]">{point.label}</span>
                <span className="h-px flex-1 bg-gradient-to-r from-[#B38F4F]/30 to-transparent" aria-hidden="true" />
              </div>
              <h3 className="font-body text-[16px] font-semibold leading-snug text-[#0B1F33]">{point.title}</h3>
              <p className="mt-3 text-[13px] font-light leading-6 text-[#0B1F33]/62">{point.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}

function PricingTiles() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {pricingTiles.map((tile) => (
        <article key={tile.id} className="bg-white p-5 shadow-[0_16px_42px_rgba(11,31,51,0.045),0_0_24px_rgba(179,143,79,0.035)]">
          <h3 className="font-body text-[15px] font-semibold text-[#0B1F33]">{tile.label}</h3>
          <p className="mt-3 text-[12px] leading-[1.65] text-[#0B1F33]/58">{tile.audience}</p>
          <div className="mt-5 font-body text-[18px] font-semibold text-[#0B1F33]">{tile.price}</div>
          <p className="mt-3 text-[13px] leading-6 text-[#0B1F33]/66">{tile.body}</p>
          <ul className="mt-5 space-y-2">
            {tile.includes.map((item) => (
              <li key={item} className="flex gap-2 text-[12px] leading-5 text-[#0B1F33]/64">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B38F4F]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[12px] font-medium leading-5 text-[#0B1F33]">{tile.line}</p>
          <Link to={tile.href} className="mt-5 inline-flex items-center gap-2 border-b border-[#B38F4F]/55 py-1 text-[12px] font-semibold tracking-normal text-[#0B1F33] transition-colors hover:text-[#B38F4F]">
            {tile.cta}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </article>
      ))}
    </div>
  );
}

function PartnerTypeTabs() {
  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-3 md:-mx-8 md:px-8">
      <div className="flex w-max gap-4 md:gap-5">
        {partnerTypes.map((type, index) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.34, delay: index * 0.04, ease }}
            className="flex min-h-[520px] w-[min(82vw,340px)] shrink-0 flex-col bg-white px-5 py-5 shadow-[0_16px_46px_rgba(11,31,51,0.055),0_0_34px_rgba(179,143,79,0.045)] md:w-[360px] md:px-6 md:py-6"
          >
            <div className="font-body text-[11px] font-bold uppercase tracking-normal text-[#B38F4F]">
              {type.label}
            </div>
            <h3 className="mt-4 font-body text-[25px] font-semibold leading-[1.12] tracking-normal text-[#0B1F33]">
              {type.truth}
            </h3>
            <p className="mt-4 text-[13px] font-light leading-[1.72] text-[#0B1F33]/64">{type.body}</p>

            <div className="mt-6">
              <div className="text-[11px] font-semibold uppercase tracking-normal text-[#B38F4F]">What this includes</div>
              <ul className="mt-3 space-y-2.5">
                {type.includes.map((item) => (
                  <li key={item} className="flex gap-2 text-[13px] font-light leading-[1.58] text-[#0B1F33]/68">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#B38F4F]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto pt-6">
              <div className="text-[11px] font-semibold uppercase tracking-normal text-[#B38F4F]">Pilot and pricing</div>
              <p className="mt-3 text-[13px] font-light leading-[1.65] text-[#0B1F33]/68">{type.pricing}</p>
              <a href="#get-started" className="mt-5 inline-flex items-center gap-2 border-b border-[#B38F4F]/55 py-1 text-[12px] font-semibold tracking-normal text-[#0B1F33] transition-colors hover:text-[#B38F4F]">
                {type.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>
        ))}
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
              active === tab.id ? "bg-[#0B1F33] text-white" : "bg-white text-[#0B1F33]/68 hover:text-[#0B1F33]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="grid gap-6 p-5 md:grid-cols-[0.85fr_1.15fr] md:p-7">
        <div>
          <span className="dp-label mb-3 block">Get started</span>
          <h3 className="font-heading text-3xl font-semibold leading-[1.02] tracking-[-0.02em] text-[#0B1F33]">{current.title}</h3>
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
                    prompt === item ? "border-[#B38F4F]/60 bg-[#0B1F33]/10 text-[#0B1F33]" : "border-[#0B1F33]/8 bg-white text-[#0B1F33]/62 hover:text-[#0B1F33]"
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
              <input className="h-10 rounded-[6px] border border-[#0B1F33]/10 bg-white px-3 text-[13px] outline-none focus:border-[#B38F4F]/60" />
            </label>
          ))}
          <label className="grid gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#0B1F33]/45">What are you trying to activate?</span>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="min-h-28 rounded-[6px] border border-[#0B1F33]/10 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#B38F4F]/60"
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
    <div className="dp-partner-page min-h-screen bg-white pt-[68px] text-[#0B1F33]">
      <DowntownPerksHero
        eyebrow="Partners"
        title="Turn residents into"
        titleAccent="regulars."
        lead="People are already downtown. Already walking. Already deciding."
        support={[
          "You don't need more attention. You need better timing. This is that moment. Downtown Perks puts you in front of them when it matters.",
          "Not broad advertising. Not hoping they remember. Just visibility when decisions happen.",
          "Show up when it counts.",
        ]}
        primary="See how it works for you"
        primaryHref="#get-started"
        secondary="Partner types"
        secondaryHref="#partner-types"
        image="/images/map-entities/perks/partner_dining_patio_1779052819620.png"
        imageAlt="Downtown Austin patio and partner hospitality moment"
        imageLabel="LOCAL VISIBILITY"
        className="py-16 md:py-24"
      />

      <Section id="how-it-works" eyebrow="How it works" title="Be the place people choose next.">
        <div className="max-w-[760px] space-y-5">
          <p className="font-body text-[17px] font-light leading-[1.68] tracking-[-0.005em] text-[#5F6B7A] md:text-[22px] md:leading-[1.62]">
            People don't always choose the best option. They choose what's nearby, what they notice, and what feels easiest in the moment.
          </p>
          <p className="text-[14px] font-light leading-7 text-[#0B1F33]/64 md:text-[15px]">
            Every day, people are deciding where to eat, where to meet, what to do, and where to spend their time. Most of those decisions happen in the moment.
          </p>
          <p className="text-[14px] font-light leading-7 text-[#0B1F33]/64 md:text-[15px]">
            Downtown Perks helps you show up while those decisions are happening through the map, local offers, QR touchpoints, events, and neighborhood placements.
          </p>
          <p className="text-[14px] font-light leading-7 text-[#0B1F33]/64 md:text-[15px]">
            Start where it makes sense. Learn what people respond to. Then do more of what works.
          </p>
        </div>
      </Section>

      <Section eyebrow="Partner promise" title="Spend less. Do more." className="bg-white">
        <PartnerPromiseFlow />
      </Section>

      <Section id="pricing" eyebrow="Partner pricing" title="Spend Less. Do More.">
        <div className="mb-10 max-w-[760px] space-y-5">
          <p className="font-body text-[17px] font-light leading-[1.68] tracking-[-0.005em] text-[#5F6B7A] md:text-[22px] md:leading-[1.62]">
            Start with what you need today and add more if it helps later.
          </p>
          <p className="text-[14px] font-light leading-7 text-[#0B1F33]/64 md:text-[15px]">
            Every partner is different. A residential building needs something different from a restaurant, hotel, brand, or community organization.
          </p>
          <p className="text-[14px] font-light leading-7 text-[#0B1F33]/64 md:text-[15px]">
            Choose the option that fits where you are today. You can always expand from there.
          </p>
        </div>
        <PricingTiles />
        <div className="mt-10 max-w-[760px]">
          <h3 className="font-body text-[16px] font-semibold text-[#0B1F33]">Not sure where to start?</h3>
          <p className="mt-3 text-[14px] font-light leading-7 text-[#0B1F33]/64 md:text-[15px]">
            Most partners begin with a single location, event, offer, or visibility placement and build from there.
          </p>
          <p className="mt-3 text-[14px] font-light leading-7 text-[#0B1F33]/64 md:text-[15px]">
            Bring Downtown Perks to your property, business, venue, hotel, organization, or district.
          </p>
        </div>
      </Section>

      <Section id="partner-types" eyebrow="Partner types" title="Choose the partner path that fits you." className="bg-white">
        <PartnerTypeTabs />
      </Section>

      <FAQAccordionBlock
        sectionEyebrow="Partner questions"
        sectionTitle="FAQs"
        sectionIntro="The partner system is built around pilots, simple setup, and real actions: scans, saves, RSVPs, and redemptions."
        items={partnerFaqs}
        styleVariant="split"
        showNumbers={false}
        allowMultipleOpen={false}
        defaultOpenIndex={0}
        pageType="partners"
        backgroundVariant="light"
      />

      <Section id="get-started" eyebrow="Get started" title="Ready when you are." className="bg-white">
        <PartnerForms />
      </Section>
    </div>
  );
}
