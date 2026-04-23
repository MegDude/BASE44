import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Hotel,
  Landmark,
  Megaphone,
  Utensils,
} from "lucide-react";
import SwipeRail from "@/components/home/SwipeRail";

const slides = [
  {
    id: "properties",
    icon: Building2,
    label: "Residential",
    headline: "Make your address more useful.",
    sentence: "Connect residents to nearby places, events, and perks that make downtown easier to use.",
    proof: "1,284 property views · 342 resident actions",
    cta: "Open residential view",
    href: "/partners/properties",
  },
  {
    id: "hotels",
    icon: Hotel,
    label: "Hospitality",
    headline: "Extend the stay beyond the lobby.",
    sentence: "Give guests one live map for dining, events, wellness, and nightlife in real time.",
    proof: "612 guest opens · 74 attributed visits",
    cta: "Open hospitality view",
    href: "/partners/hotels",
  },
  {
    id: "venues",
    icon: Utensils,
    label: "Venues",
    headline: "Show up when intent is real.",
    sentence: "Appear in the map when people nearby are already deciding where to go next.",
    proof: "1,942 map opens · 143 visits",
    cta: "Open venue view",
    href: "/partners/venues",
  },
  {
    id: "brands",
    icon: Megaphone,
    label: "Brands",
    headline: "Buy context, not broad reach.",
    sentence: "Run campaigns in the right corridor, at the right time, with measurable action afterward.",
    proof: "28k map opens · 1,140 source scans",
    cta: "Open brand view",
    href: "/partners/brands",
  },
  {
    id: "civic",
    icon: Landmark,
    label: "Civic",
    headline: "Make participation visible.",
    sentence: "Surface district events and initiatives where people are already looking and deciding.",
    proof: "184 RSVPs · 22% repeat participation",
    cta: "Open civic view",
    href: "/partners/civic",
  },
];

export default function PartnerSlides() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-[var(--dp-surface-base)] px-4 py-10 md:px-6 md:py-12">
      <div className="dp-page-shell">
        <div className="dp-band grid grid-cols-1 gap-8 p-6 md:grid-cols-[1.05fr_0.95fr] md:items-end md:p-8 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
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
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-[24px] bg-[linear-gradient(180deg,rgba(11,26,43,0.98),rgba(18,36,60,0.95))] px-5 py-5 text-[13px] leading-6 text-white/74 shadow-[0_20px_48px_rgba(11,26,43,0.16)]"
          >
            Start with the partner type, then move into map intelligence, rollout, and the right entry model.
          </motion.div>
        </div>

        <div className="mt-5">
          <SwipeRail
            items={slides}
            getKey={(item) => item.id}
            cardClassName="w-[88%] sm:w-[72%] lg:w-[46%] xl:w-[36%]"
            renderItem={(slide, index, isActive) => {
              const Icon = slide.icon;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.08 * index }}
                  className={`h-full rounded-[28px] p-5 shadow-[0_18px_42px_rgba(11,26,43,0.08)] transition-all ${
                    isActive
                      ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,245,238,0.96))] ring-1 ring-[rgba(198,168,90,0.22)]"
                      : "bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(255,255,255,0.94))]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[rgba(11,26,43,0.06)] text-primary">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="rounded-full bg-[rgba(198,168,90,0.10)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--dp-gold-muted)]">
                      {slide.label}
                    </div>
                  </div>

                  <h3 className="mt-5 font-heading text-[1.45rem] font-semibold tracking-[-0.03em] text-foreground">
                    {slide.headline}
                  </h3>
                  <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
                    {slide.sentence}
                  </p>
                  <div className="mt-5 rounded-[18px] bg-[rgba(11,26,43,0.04)] px-4 py-3 text-[12px] font-medium text-foreground/80">
                    {slide.proof}
                  </div>

                  <Link
                    to={slide.href}
                    className="mt-5 inline-flex items-center gap-2 text-[12px] font-semibold text-primary hover:underline"
                  >
                    {slide.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              );
            }}
          />
        </div>
      </div>
    </section>
  );
}
