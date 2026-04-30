import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Hotel,
  Landmark,
  Megaphone,
  Utensils,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";

const ROLE_CARDS = [
  {
    id: "residential",
    badge: "Residential",
    title: "Make your address more useful.",
    body: "Connect residents to nearby places, events, and perks that make downtown easier to use.",
    proof: "1,284 property views · 342 resident actions",
    href: ROUTES.partnerProperties,
    cta: "Open residential view",
    icon: Building2,
  },
  {
    id: "hospitality",
    badge: "Hospitality",
    title: "Extend the stay beyond the lobby.",
    body: "Give guests one live map for dining, events, wellness, and nightlife in real time.",
    proof: "612 guest opens · 74 attributed visits",
    href: ROUTES.partnerHospitality,
    cta: "Open hospitality view",
    icon: Hotel,
  },
  {
    id: "venues",
    badge: "Venues",
    title: "Show up when intent is real.",
    body: "Appear in the map when people nearby are already deciding where to go next.",
    proof: "1,942 map opens · 143 visits",
    href: ROUTES.partnerVenues,
    cta: "Open venue view",
    icon: Utensils,
  },
  {
    id: "brands",
    badge: "Brands",
    title: "Buy context, not broad reach.",
    body: "Run campaigns in the right corridor, at the right time, with measurable action afterward.",
    proof: "28k map opens · 1,140 source scans",
    href: ROUTES.partnerBrands,
    cta: "Open brand view",
    icon: Megaphone,
  },
  {
    id: "civic",
    badge: "Civic",
    title: "Make participation visible.",
    body: "Surface district events and initiatives where people are already looking and deciding.",
    proof: "184 RSVPs · 22% repeat participation",
    href: ROUTES.partnerCivic,
    cta: "Open civic view",
    icon: Landmark,
  },
];

export default function PartnerSlides() {
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => setActiveIndex((current) => (current - 1 + ROLE_CARDS.length) % ROLE_CARDS.length);
  const next = () => setActiveIndex((current) => (current + 1) % ROLE_CARDS.length);

  return (
    <section className="border-t border-[rgba(10,20,40,0.08)] bg-white px-4 py-14 md:px-6 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-[1.05fr_0.95fr] md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
          >
            <span className="dp-micro-label mb-3 block">Partner roles</span>
            <h2 className="dp-display-section max-w-3xl text-[2.15rem] text-foreground md:text-[3rem]">
              One downtown layer. Five partner roles.
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-muted-foreground">
              Swipe through the role that fits, compare the operating logic, and move into the right partner view without scrolling through stacked sales blocks.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-[20px] border border-[rgba(10,20,40,0.08)] bg-[#f7f9fc] px-5 py-4 text-[13px] leading-6 text-muted-foreground"
          >
            Start with the partner type, then move into map intelligence, rollout, and the right entry model.
          </motion.div>
        </div>

        <div>
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:-mx-6 md:px-6">
            {ROLE_CARDS.map((card, index) => {
              const Icon = card.icon;
              const isActive = index === activeIndex;
              return (
                <div key={card.id} data-rail-card="true" className="w-[88%] shrink-0 snap-start sm:w-[72%] lg:w-[46%] xl:w-[36%]">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                    className={`h-full rounded-[24px] border p-5 shadow-[0_10px_24px_rgba(11,26,43,0.05)] transition-all ${
                      isActive ? "border-primary/18 bg-white" : "border-[rgba(10,20,40,0.08)] bg-[#fbfcfe]"
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
                    <h3 className="mt-5 text-[1.35rem] font-semibold tracking-[-0.03em] text-foreground">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-[13px] leading-6 text-muted-foreground">{card.body}</p>
                    <div className="mt-4 rounded-[14px] border border-[rgba(10,20,40,0.08)] bg-[#f7f9fc] px-3.5 py-3 text-[12px] font-medium text-foreground/80">
                      {card.proof}
                    </div>
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
            <div className="flex items-center gap-1.5">
              {ROLE_CARDS.map((card, index) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Go to card ${index + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    index === activeIndex ? "w-6 bg-[var(--dp-gold-muted)]" : "w-2 bg-[rgba(11,26,43,0.18)]"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(11,26,43,0.10)] bg-white text-[var(--dp-navy)]"
                aria-label="Previous card"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(11,26,43,0.10)] bg-white text-[var(--dp-navy)]"
                aria-label="Next card"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
