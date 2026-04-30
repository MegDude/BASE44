import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Hotel,
  Landmark,
  Mail,
  Megaphone,
  Route,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCTAFlow } from "@/components/cta/CTAFlowProvider";
import { ROUTES } from "@/lib/routes";

const PARTNER_FIT = [
  {
    title: "Residential",
    badge: "Free · $39 · $99 / year",
    sublabel: "Multifamily, condos, apartments, and residential buildings",
    body: "90-day pilot. Then choose your level. Management pays. Residents stay.",
    cta: "See how it works for properties",
    href: ROUTES.partnerProperties,
    icon: Building2,
    active: true,
  },
  {
    title: "Hospitality",
    badge: "$99-$149 / year",
    sublabel: "Hotels, boutiques, extended stays, and hospitality",
    body: "90-day pilot. Then choose your level. Extend the stay beyond your lobby.",
    cta: "See how it works for hospitality",
    href: ROUTES.partnerHospitality,
    icon: Hotel,
  },
  {
    title: "Venues",
    badge: "Free for 12 months",
    sublabel: "Restaurants, bars, cafes, fitness, wellness, and experiences",
    body: "Then $49-$99 / year. Show up in the moment that counts.",
    cta: "See how it works for venues",
    href: ROUTES.partnerVenues,
    icon: UtensilsCrossed,
  },
  {
    title: "Brands",
    badge: "$99-$149 / year",
    sublabel: "Brands, activations, campaigns, and corridor sponsorships",
    body: "Buy the moment, not the impression. Context beats scale.",
    cta: "See how it works for brands",
    href: ROUTES.partnerBrands,
    icon: Megaphone,
  },
  {
    title: "Civic",
    badge: "$49-$79 / year",
    sublabel: "Cities, districts, chambers, and community partners",
    body: "Turn attendance into participation. Discovery drives turnout.",
    cta: "See how it works for civic",
    href: ROUTES.partnerCivic,
    icon: Landmark,
  },
];

const ROLLOUT = [
  {
    step: "Launch",
    title: "Launch",
    body: "Set up QR entry points and map visibility so people can find you immediately.",
    icon: Route,
  },
  {
    step: "Measure",
    title: "Measure",
    body: "Track scans, saves, RSVPs, and redemptions - real behavior, not assumptions.",
    icon: CircleCheck,
  },
  {
    step: "Decide",
    title: "Decide",
    body: "Keep it, scale it, or adjust based on what actually works.",
    icon: ArrowRight,
  },
];

const INCLUDED = [
  {
    title: "Map visibility",
    body: "Appear in the live downtown layer where decisions are forming.",
  },
  {
    title: "Source access",
    body: "QR or source-node entry points tied back to actual partner origins.",
  },
  {
    title: "Analytics",
    body: "Track visits, saves, RSVPs, redemptions, and return behavior.",
  },
  {
    title: "Partner workspace",
    body: "Manage offers, events, profile, and visibility in one control surface.",
  },
];

const ONBOARDING_FORMS = [
  {
    id: "buildings",
    label: "Buildings",
    headline: "90-day free pilot.",
    sub: "See what residents actually do.",
    summary: "Launch a building-linked downtown layer with QR entry, resident card access, measurable neighborhood use, and invoice review after the pilot.",
    bullets: ["Resident amenity layer", "Lobby QR + card access", "Building-level activation"],
    route: ROUTES.partnerProperties,
    flowType: "pilot_request",
    partnerType: "properties",
    fields: [
      { name: "property", label: "Building Name & Address", type: "text", span: 2 },
      { name: "name", label: "Your Name & Role", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "units", label: "Number of Units", type: "number" },
      { name: "goals", label: "Any specific goals? (Optional)", type: "text", span: 2 },
    ],
    icon: Building2,
    cta: "Start the Pilot",
  },
  {
    id: "hospitality",
    label: "Hospitality",
    headline: "Extend the stay beyond your lobby.",
    sub: "90-day pilot. Extend the stay beyond your lobby.",
    summary: "One scan and guests know where to go for coffee, dinner, and tonight. Better orientation, zero extra friction.",
    bullets: ["Guest map handoff", "Event-linked stays", "Attributed local visits"],
    route: ROUTES.partnerHospitality,
    flowType: "hospitality_onboarding",
    partnerType: "hospitality",
    fields: [
      { name: "property", label: "Hotel / Property Name", type: "text", span: 2 },
      { name: "name", label: "Your Name & Role", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "rooms", label: "Number of Rooms", type: "number" },
      { name: "goals", label: "Guest or activation goals", type: "text", span: 2 },
    ],
    icon: Hotel,
    cta: "Open Hospitality Flow",
  },
  {
    id: "venues",
    label: "Venues",
    headline: "Free for 12 months.",
    sub: "Zero sign-up fees.",
    summary: "Show up when nearby intent is real, then turn map visibility into visits, RSVPs, and redemptions.",
    bullets: ["Live map visibility", "Offer and event routing", "Repeat local use"],
    route: ROUTES.partnerVenues,
    flowType: "venue_onboarding",
    partnerType: "venues",
    fields: [
      { name: "business", label: "Business Name", type: "text", span: 2 },
      { name: "name", label: "Your Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "address", label: "Street Address", type: "text" },
      { name: "perk", label: "What perk or offer will you run?", type: "text", span: 2 },
    ],
    icon: UtensilsCrossed,
    cta: "Discuss Activation",
  },
  {
    id: "brands",
    label: "Brands",
    headline: "Buy the moment, not the impression.",
    sub: "Appear inside real downtown decisions.",
    summary: "Run district-aware brand visibility and card-ready campaigns through the same map people already use.",
    bullets: ["District activations", "Sponsor-ready placement", "Measured post-action proof"],
    route: ROUTES.partnerBrands,
    flowType: "brand_campaign",
    partnerType: "brands",
    fields: [
      { name: "brand", label: "Brand / Company Name", type: "text", span: 2 },
      { name: "name", label: "Your Name & Role", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "goals", label: "Campaign focus", type: "text", span: 2 },
    ],
    icon: Megaphone,
    cta: "Start a Conversation",
  },
  {
    id: "civic",
    label: "Civic",
    headline: "Turn attendance into participation.",
    sub: "Make what is happening easier to find.",
    summary: "Support public-facing navigation, event visibility, and local business discovery without turning it into a generic dashboard pitch.",
    bullets: ["District context", "Event participation", "Privacy-safe civic reporting"],
    route: ROUTES.partnerCivic,
    flowType: "civic_onboarding",
    partnerType: "civic",
    fields: [
      { name: "org", label: "Organization Name", type: "text", span: 2 },
      { name: "name", label: "Your Name & Role", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "focus", label: "Geographic Focus", type: "text", span: 2 },
    ],
    icon: Landmark,
    cta: "Talk to Us",
  },
  {
    id: "realestate",
    label: "Real Estate",
    headline: "Turn foot traffic into qualified leads.",
    sub: "Use live neighborhood context as the pitch.",
    summary: "Pair listings and building context with the same downtown decision layer residents are already using.",
    bullets: ["Listing context", "Walkable neighborhood proof", "Lead-ready discovery"],
    route: ROUTES.partnerProperties,
    flowType: "availability_check",
    partnerType: "properties",
    fields: [
      { name: "brokerage", label: "Brokerage", type: "text", span: 2 },
      { name: "name", label: "Your Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "listings", label: "Active Downtown Listings", type: "number" },
    ],
    icon: Building,
    cta: "Discuss Lead Integration",
  },
  {
    id: "residents",
    label: "Residents",
    headline: "Check if your building is part of Downtown Perks.",
    sub: "Browse first, then add the card when access matters.",
    summary: "Residents can browse first, then add the card when saves, RSVP, or redemption actually matter.",
    bullets: ["Browse first", "$25 annual direct access", "Refunded if your building joins"],
    route: ROUTES.residentAppCard,
    flowType: "resident_card",
    partnerType: "resident",
    fields: [
      { name: "name", label: "Your Name", type: "text" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "email", label: "Email", type: "email" },
      { name: "building", label: "Building Address", type: "text", span: 2 },
    ],
    icon: Users,
    cta: "Request Resident Access",
  },
];

function RailDots({ count, activeIndex, onSelect }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(index)}
          aria-label={`Go to card ${index + 1}`}
          className={`h-2 rounded-full transition-all ${
            activeIndex === index ? "w-6 bg-[var(--dp-gold-muted)]" : "w-2 bg-[rgba(11,26,43,0.18)]"
          }`}
        />
      ))}
    </div>
  );
}

function RailControls({ onPrev, onNext }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onPrev}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(11,26,43,0.10)] bg-white text-[var(--dp-navy)]"
        aria-label="Previous card"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onNext}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(11,26,43,0.10)] bg-white text-[var(--dp-navy)]"
        aria-label="Next card"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function PricingSection() {
  const { openFlow } = useCTAFlow();
  const [fitIndex, setFitIndex] = useState(0);
  const [rolloutIndex, setRolloutIndex] = useState(0);
  const [includedIndex, setIncludedIndex] = useState(0);
  const [formIndex, setFormIndex] = useState(0);
  const [formValues, setFormValues] = useState({});
  const currentForm = ONBOARDING_FORMS[formIndex];
  const CurrentFormIcon = currentForm.icon;

  function submitForm(event) {
    event.preventDefault();
    openFlow({
      type: currentForm.flowType,
      source: `pricing_section_${currentForm.id}`,
      sourceComponent: "PricingSection",
      partnerType: currentForm.partnerType,
      initialValues: formValues,
      successRoute: currentForm.route,
    });
  }

  return (
    <section id="start-here" className="border-t border-[rgba(10,20,40,0.08)] bg-[#f7f9fc] px-4 py-14 md:px-6 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-[1.05fr_0.95fr] md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
          >
              <span className="dp-micro-label mb-3 block">A smarter way to activate downtown</span>
              <h2 className="dp-display-section max-w-3xl text-[2.15rem] text-foreground md:text-[3rem]">
                Start with a pilot. Decide with real data.
              </h2>
              <p className="mt-3 max-w-2xl text-[14px] leading-6 text-muted-foreground">
                No setup. No long-term commitment. Just a live test. You go live. People use it. You see what actually happens.
              </p>
            </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-[20px] border border-[rgba(10,20,40,0.08)] bg-white px-5 py-4 text-[13px] leading-6 text-muted-foreground shadow-[0_8px_24px_rgba(11,26,43,0.04)]"
          >
            Spend less. Do more. Start small. Prove it fast. Keep it if it works. Most partners start here.
          </motion.div>
        </div>

        <div className="space-y-10">
          <div>
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Pricing at a glance
            </div>
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:-mx-6 md:px-6">
              {PARTNER_FIT.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} data-rail-card="true" className="w-[88%] shrink-0 snap-start sm:w-[72%] lg:w-[40%] xl:w-[31%]">
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.35, delay: index * 0.04 }}
                      className={`h-full rounded-[24px] border p-5 shadow-[0_8px_20px_rgba(11,26,43,0.04)] ${
                        card.active ? "border-primary/18 bg-white" : "border-[rgba(10,20,40,0.08)] bg-[#fbfcfe]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#f1f4f8] text-primary">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="rounded-full bg-[rgba(198,168,90,0.10)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--dp-gold-muted)]">
                          {card.badge}
                        </div>
                      </div>
                      <div className="mt-5 text-[1.2rem] font-semibold tracking-[-0.03em] text-foreground">{card.title}</div>
                      <div className="mt-1 text-[12px] text-muted-foreground">{card.sublabel}</div>
                      <p className="mt-3 text-[13px] leading-6 text-muted-foreground">{card.body}</p>
                      <Link to={card.href} className="mt-5 inline-flex items-center gap-2 text-[12px] font-semibold text-primary hover:underline">
                        {card.cta}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </motion.div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <RailDots count={PARTNER_FIT.length} activeIndex={fitIndex} onSelect={setFitIndex} />
              <RailControls
                onPrev={() => setFitIndex((current) => (current - 1 + PARTNER_FIT.length) % PARTNER_FIT.length)}
                onNext={() => setFitIndex((current) => (current + 1) % PARTNER_FIT.length)}
              />
            </div>
          </div>

          <div>
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              How it works
            </div>
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:-mx-6 md:px-6">
              {ROLLOUT.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} data-rail-card="true" className="w-[84%] shrink-0 snap-start sm:w-[66%] lg:w-[30%] xl:w-[24%]">
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.35, delay: index * 0.04 }}
                      className="h-full rounded-[22px] border border-[rgba(10,20,40,0.08)] bg-white p-5 shadow-[0_8px_20px_rgba(11,26,43,0.04)]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                          {card.step}
                        </div>
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="mt-4 text-[1.15rem] font-semibold tracking-[-0.03em] text-foreground">{card.title}</div>
                      <p className="mt-3 text-[13px] leading-6 text-muted-foreground">{card.body}</p>
                    </motion.div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <RailDots count={ROLLOUT.length} activeIndex={rolloutIndex} onSelect={setRolloutIndex} />
              <RailControls
                onPrev={() => setRolloutIndex((current) => (current - 1 + ROLLOUT.length) % ROLLOUT.length)}
                onNext={() => setRolloutIndex((current) => (current + 1) % ROLLOUT.length)}
              />
            </div>
          </div>

          <div>
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Included
            </div>
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:-mx-6 md:px-6">
              {INCLUDED.map((card, index) => (
                <div key={card.title} data-rail-card="true" className="w-[82%] shrink-0 snap-start sm:w-[62%] lg:w-[28%] xl:w-[22%]">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                    className="h-full rounded-[20px] border border-[rgba(10,20,40,0.08)] bg-white p-5 shadow-[0_8px_20px_rgba(11,26,43,0.04)]"
                  >
                    <div className="text-sm font-semibold text-foreground">{card.title}</div>
                    <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{card.body}</p>
                  </motion.div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <RailDots count={INCLUDED.length} activeIndex={includedIndex} onSelect={setIncludedIndex} />
              <RailControls
                onPrev={() => setIncludedIndex((current) => (current - 1 + INCLUDED.length) % INCLUDED.length)}
                onNext={() => setIncludedIndex((current) => (current + 1) % INCLUDED.length)}
              />
            </div>
          </div>
        </div>

        <div id="get-started" className="mt-10 border-t border-[rgba(10,20,40,0.08)] pt-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4 }}
            >
              <span className="dp-micro-label mb-3 block">Get started</span>
              <h2 className="dp-display-section max-w-3xl text-[2.15rem] text-foreground md:text-[3rem]">
                Ready when you are.
              </h2>
              <p className="mt-3 max-w-2xl text-[14px] leading-6 text-muted-foreground">
                Pick the role, see the setup, and open the right onboarding flow without leaving the page.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {ONBOARDING_FORMS.map((form, index) => {
                  const Icon = form.icon;
                  const active = index === formIndex;
                  return (
                    <button
                      key={form.id}
                      type="button"
                      onClick={() => {
                        setFormIndex(index);
                        setFormValues({});
                      }}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all ${
                        active
                          ? "border-primary/18 bg-[rgba(207,175,90,0.12)] text-foreground"
                          : "border-[rgba(11,31,51,0.08)] bg-white/80 text-foreground/58 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {form.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-[22px] border border-[rgba(10,20,40,0.08)] bg-white p-5 shadow-[0_8px_20px_rgba(11,26,43,0.04)]">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[rgba(11,31,51,0.05)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/58">
                  <CurrentFormIcon className="h-3.5 w-3.5" />
                  {currentForm.label}
                </div>
                <h3 className="text-[1.6rem] font-semibold tracking-[-0.04em] text-foreground">
                  {currentForm.headline}
                </h3>
                <p className="mt-2 text-[14px] leading-7 text-muted-foreground">{currentForm.sub}</p>
                <p className="mt-4 text-[13px] leading-6 text-foreground/76">{currentForm.summary}</p>
                <div className="mt-4 space-y-3">
                  {currentForm.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-start gap-3 text-[13px] leading-6 text-foreground/76">
                      <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[var(--dp-gold,#CFAF5A)]" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-[12px] leading-5 text-muted-foreground">
                  No payment is taken here. We review the request first, then send invoice or payment instructions after follow-up.
                </p>
              </div>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: 0.04 }}
              onSubmit={submitForm}
              className="rounded-[24px] border border-[rgba(10,20,40,0.08)] bg-white p-5 shadow-[0_8px_20px_rgba(11,26,43,0.04)] md:p-6"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {currentForm.fields.map((field) => (
                  <div key={`${currentForm.id}-${field.name}`} className={field.span === 2 ? "md:col-span-2" : undefined}>
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.1em] text-foreground/52">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={formValues[field.name] || ""}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, [field.name]: event.target.value }))
                      }
                      className="dp-input"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button type="submit" className="dp-cta-primary">
                  {currentForm.cta}
                </button>
                <a
                  href="mailto:hello@downtownperks.com"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgba(11,31,51,0.1)] px-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/72 transition-colors hover:text-foreground"
                >
                  <Mail className="h-3.5 w-3.5" />
                  hello@downtownperks.com
                </a>
              </div>

              <div className="mt-8 border-t border-[rgba(10,20,40,0.08)] pt-5">
                <div className="dp-micro-label">Ready when you are</div>
                <h3 className="mt-3 text-[1.65rem] font-semibold leading-[1] tracking-[-0.04em] text-foreground md:text-[2.2rem]">
                  People don't choose the best option. They choose the one they notice.
                </h3>
                <p className="mt-4 max-w-2xl text-[14px] leading-7 text-muted-foreground">
                  What's close. What's clear. What's easy.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to={ROUTES.explore} className="dp-cta-primary">
                    Explore Downtown
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to={ROUTES.partners} className="dp-cta-secondary">
                    Become a Partner
                  </Link>
                  <a href="mailto:hello@downtownperks.com" className="dp-cta-secondary">
                    Contact us
                  </a>
                </div>
              </div>
            </motion.form>
          </div>
        </div>
      </div>
    </section>
  );
}
