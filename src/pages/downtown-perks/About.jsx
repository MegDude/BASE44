import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CreditCard,
  MapPinned,
  Megaphone,
  Sparkles,
  Users,
} from "lucide-react";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import { FAQ_HOME, FAQ_PARTNER, FAQ_PROPERTY, FAQ_RESIDENT } from "@/lib/faq-data";

const coreSections = [
  {
    label: "What it is",
    title: "A live downtown map, not another content feed.",
    body:
      "Downtown Perks brings places, events, perks, buildings, and local context into one working layer. The goal is simple: help people decide what to do based on what is actually nearby, relevant, and usable now.",
    icon: MapPinned,
  },
  {
    label: "Why it matters",
    title: "Density without connection is still friction.",
    body:
      "Downtown already has the places, events, and people. The missing layer is the one that makes those things easier to discover and easier to act on without switching between tabs, feeds, and apps.",
    icon: Sparkles,
  },
  {
    label: "How it behaves",
    title: "The map is the product. The card is access.",
    body:
      "People browse openly first. Then, when a save, RSVP, member perk, or redemption matters, the card appears as the access layer. That keeps the experience useful before it becomes transactional.",
    icon: CreditCard,
  },
];

const workflow = [
  {
    step: "1",
    title: "Open the map",
    body:
      "Start with one live downtown surface for restaurants, bars, coffee, services, buildings, perks, and events.",
  },
  {
    step: "2",
    title: "See what is actually relevant",
    body:
      "Nearby places, walk time, open-now context, event timing, and district relevance all resolve into one clearer decision.",
  },
  {
    step: "3",
    title: "Take the next action",
    body:
      "Save a place, RSVP to an event, use a perk, show the card, or move into a partner path. The point is fewer dead ends and faster decisions.",
  },
];

const audienceLenses = [
  {
    title: "Residents",
    body:
      "Residents get one downtown layer for nearby places, local perks, events, and card-ready access without needing another app.",
    icon: Users,
    to: "/residents",
    cta: "Resident view",
  },
  {
    title: "Properties",
    body:
      "Buildings use Downtown Perks as a resident amenity that is measurable, current, and easier to use than a static neighborhood guide.",
    icon: Building2,
    to: "/partners/properties",
    cta: "Property view",
  },
  {
    title: "Partners",
    body:
      "Venues, hospitality groups, brands, and civic organizations show up where nearby intent is already forming instead of buying generic awareness.",
    icon: Megaphone,
    to: "/partners",
    cta: "Partner view",
  },
];

const platformTruths = [
  "One canonical map product instead of disconnected landing pages.",
  "Browse first behavior with the card only when access matters.",
  "One system with role-specific entry for residents, properties, hotels, venues, brands, and civic partners.",
  "A measurable commercial layer built on scans, saves, RSVPs, visits, and redemptions.",
];

const useCases = [
  {
    title: "Resident utility",
    body:
      "Find somewhere to go, see what is happening tonight, save a place for later, and use the card when a perk or entry point matters.",
    icon: MapPinned,
  },
  {
    title: "Property amenity",
    body:
      "Turn the surrounding neighborhood into something residents can actually use and measure what is driving engagement around the building.",
    icon: Building2,
  },
  {
    title: "Event and nightlife coordination",
    body:
      "Surface events, perks, and happy hour context in one place so people can choose faster and partners can measure what worked.",
    icon: CalendarDays,
  },
];

const combinedFaq = [
  FAQ_HOME[0],
  FAQ_HOME[5],
  FAQ_RESIDENT[0],
  FAQ_PROPERTY[0],
  FAQ_PARTNER[0],
  FAQ_PARTNER[2],
];

export default function About() {
  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)] pb-14 pt-[84px]">
      <div className="dp-page-shell space-y-4">
        <section className="dp-band p-6 md:p-8 lg:p-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="dp-micro-label mb-4">About</div>
            <h1 className="dp-display-section max-w-4xl text-[2.6rem] text-foreground md:text-[4.4rem]">
              Downtown Perks is the live neighborhood layer for downtown Austin.
            </h1>
            <p className="mt-5 max-w-3xl text-[15px] leading-7 text-muted-foreground md:text-[16px]">
              It is built to make downtown easier to use for the people already here and more measurable
              for the partners shaping what happens next. One map. One access layer. One operating system
              behind it.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/downtown-perks/explore" className="dp-cta-primary">
                Open Map
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/partners" className="dp-cta-secondary">
                View Partner Types
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {coreSections.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="dp-band p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[rgba(11,31,51,0.05)] text-[var(--dp-navy)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {item.label}
                </div>
                <h2 className="mt-3 font-heading text-[1.55rem] font-semibold tracking-[-0.04em] text-foreground">
                  {item.title}
                </h2>
                <p className="mt-3 text-[14px] leading-7 text-foreground/68">{item.body}</p>
              </motion.div>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="dp-band p-6 md:p-8">
            <div className="dp-micro-label">How it works</div>
            <h2 className="dp-display-section mt-4 max-w-3xl text-[2rem] text-foreground md:text-[2.8rem]">
              People should be able to ask the map a question and get a usable answer.
            </h2>
            <p className="mt-4 max-w-2xl text-[14px] leading-7 text-muted-foreground">
              The product is strongest when it behaves like a decision layer, not a brochure. Nearby,
              relevant, and usable now is the standard.
            </p>
          </div>

          <div className="dp-band dp-band-muted p-6 md:p-8">
            <div className="space-y-5">
              {workflow.map((item) => (
                <div key={item.step} className="grid gap-3 border-b border-[rgba(11,31,51,0.08)] pb-5 last:border-b-0 last:pb-0 md:grid-cols-[56px_1fr]">
                  <div className="text-[2rem] font-semibold tracking-[-0.05em] text-[var(--dp-gold-muted)]">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-[1.2rem] font-semibold tracking-[-0.03em] text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-7 text-foreground/68">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dp-band p-6 md:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="dp-micro-label">Who it serves</div>
              <h2 className="dp-display-section mt-4 max-w-3xl text-[2rem] text-foreground md:text-[2.8rem]">
                One system, with role-specific entry.
              </h2>
              <p className="mt-4 max-w-2xl text-[14px] leading-7 text-muted-foreground">
                The experience changes by role, but the product truth stays the same. The map remains the
                main interface. The dashboard remains the measurable layer behind it.
              </p>
            </div>

            <div className="grid gap-4">
              {audienceLenses.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white/84 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[rgba(11,31,51,0.05)] text-[var(--dp-navy)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Link to={item.to} className="dp-link-action shrink-0">
                        {item.cta}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    <h3 className="mt-4 text-[1.25rem] font-semibold tracking-[-0.03em] text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-7 text-foreground/68">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="dp-band dp-band-dark p-6 md:p-8">
            <div className="dp-micro-label text-[var(--dp-gold-muted)]">Product truth</div>
            <h2 className="dp-display-section mt-4 max-w-3xl text-[2rem] text-white md:text-[2.8rem]">
              The map is the interface. The analytics stay in the wiring until they are useful.
            </h2>
            <div className="mt-6 space-y-3">
              {platformTruths.map((line) => (
                <div key={line} className="flex items-start gap-3 border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                  <Sparkles className="mt-1 h-4 w-4 shrink-0 text-[var(--dp-gold-muted)]" />
                  <p className="text-[14px] leading-7 text-white/74">{line}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {useCases.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="dp-band p-5 md:p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[rgba(11,31,51,0.05)] text-[var(--dp-navy)]">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="mt-4 text-[1.25rem] font-semibold tracking-[-0.03em] text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-7 text-foreground/68">{item.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <FAQAccordionBlock
          sectionEyebrow="About"
          sectionTitle="Questions people ask first"
          sectionIntro="These are the core questions the product needs to answer clearly: what it is, who it is for, how it works, what it costs, and why the map is central."
          items={combinedFaq}
          styleVariant="split"
          showNumbers={false}
          allowMultipleOpen={false}
          defaultOpenIndex={0}
          pageType="about"
          backgroundVariant="light"
          ctaLabel="Open the Map"
          ctaHref="/downtown-perks/explore"
        />

        <section className="dp-band p-6 md:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="dp-micro-label">Bottom line</div>
              <h2 className="dp-display-section mt-4 max-w-3xl text-[2rem] text-foreground md:text-[2.8rem]">
                Downtown Perks should feel like one working downtown layer, not a stack of separate products.
              </h2>
              <p className="mt-4 max-w-2xl text-[14px] leading-7 text-muted-foreground">
                Resident utility comes first. The card follows when access matters. Partner value is sold
                through measurable outcomes on top of the same map people already use.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/downtown-perks/explore" className="dp-cta-primary">
                Open Map
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/partners" className="dp-cta-secondary">
                Apply to Be a Partner
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
