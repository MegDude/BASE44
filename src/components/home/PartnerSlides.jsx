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
    badge: "Slide 01 — Properties",
    title: "Here's the thing nobody tells you about renting apartments.",
    body: "You're not selling square footage. You're selling everything around it. The coffee shop where your barista knows your order. The bar that feels like your living room. The Thai place that's open late. That's what people pay for. That's the real value. Give people a way to see it — not a laminated list from 2019.",
    proof: "90-day pilot · Free forever · $39/year analytics · $99/year full stack",
    href: ROUTES.partnerProperties,
    cta: "Bring this to your property",
    icon: Building2,
    includes: [
      "QR access across lobby, leasing, and welcome flow",
      "Live map of nearby places, events, and perks",
      "Your property inside the same experience",
      "Real engagement, not passive info",
    ],
  },
  {
    id: "hospitality",
    badge: "Slide 02 — Hotels",
    title: "Hotels spend fortunes on lobbies. Then hand guests a photocopied restaurant list.",
    body: "You nail the arrival. Then leave the rest to chance. Guests don't want recommendations. They want orientation. What if instead, you gave them something that actually works? One scan — and they know where to go. Coffee. Dinner. Tonight. Now you're not just a stay. You're their north star.",
    proof: "90-day pilot · From $99/year",
    href: ROUTES.partnerHospitality,
    cta: "Use this for guests",
    icon: Hotel,
    includes: [
      "QR access in rooms, lobby, and guest flow",
      "Live map of nearby venues, events, and perks",
      "Better experience, zero extra friction",
      "Discovery tied to actual location",
    ],
  },
  {
    id: "venues",
    badge: "Slide 03 — Venues",
    title: "Most restaurants obsess over Instagram. Then wonder why nobody walks in.",
    body: "People don't remember ads. They remember what's nearby when they're hungry. The place they passed. The bar they noticed. The coffee that showed up at the right moment. That's not branding. That's timing.",
    proof: "Free for 12 months · From $49/year after",
    href: ROUTES.partnerVenues,
    cta: "Discuss activation",
    icon: Utensils,
    includes: [
      "Map placement based on proximity",
      "Perks and offers that actually get used",
      "Events surfaced in the right moment",
      "Save → show → scan → done",
    ],
  },
  {
    id: "brands",
    badge: "Slide 04 — Brands / Sponsors",
    title: "The best advertising doesn't feel like advertising.",
    body: "It feels like something useful that arrived at the right time. You're not interrupting. You're appearing inside a decision already happening. Coffee. Lunch. Drinks. Tonight. That's where brands belong.",
    proof: "From $149/year",
    href: ROUTES.partnerBrands,
    cta: "Start a conversation",
    icon: Megaphone,
    includes: [
      "Corridor-based visibility across downtown",
      "Placement tied to location and timing",
      "Event and campaign integration",
      "Trackable actions, not vague impressions",
    ],
  },
  {
    id: "civic",
    badge: "Slide 05 — Civic",
    title: "Cities work better when people know what's happening.",
    body: "Right now, finding a local event takes effort. Too much effort. What if it didn't? One place. One map. Everything visible. More people show up. More things actually happen.",
    proof: "Start with 90 days · From $49/year",
    href: ROUTES.partnerCivic,
    cta: "Talk to us",
    icon: Landmark,
    includes: [
      "Community events in one visible layer",
      "District-wide discovery",
      "Shared map for participation",
      "Clear access to what's happening nearby",
    ],
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
            <span className="dp-micro-label mb-3 block">Turn residents into regulars</span>
            <h2 className="dp-display-section max-w-3xl text-[2.15rem] text-foreground md:text-[3rem]">
              Be the place people choose next
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-muted-foreground">
              People are already downtown. Already walking. Already deciding. You do not need more attention. You need better timing. Downtown Perks puts you in front of them when it matters.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-[20px] border border-[rgba(10,20,40,0.08)] bg-[#f7f9fc] px-5 py-4 text-[13px] leading-6 text-muted-foreground"
          >
            Swipe to see how Downtown Perks can serve you.
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
                    <div className="mt-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80">
                        What this includes
                      </div>
                      <div className="mt-3 space-y-2">
                        {card.includes.map((item) => (
                          <div key={item} className="flex items-start gap-3 text-[12px] leading-5 text-foreground/76">
                            <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[var(--dp-gold-muted)]" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
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
