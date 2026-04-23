import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Hotel,
  Landmark,
  Megaphone,
  Route,
  UtensilsCrossed,
} from "lucide-react";
import SwipeRail from "@/components/home/SwipeRail";
import { useCTAFlow } from "@/components/cta/CTAFlowProvider";

const partnerCards = [
  {
    id: "residential",
    label: "Residential",
    audience: "Buildings, multifamily, condos",
    price: "Free pilot · annual plan",
    value: "Connect residents to nearby places, events, and perks.",
    cta: "Start residential",
    href: "/partners/properties",
    icon: Building2,
  },
  {
    id: "hospitality",
    label: "Hospitality",
    audience: "Hotels, boutiques, extended stay",
    price: "Annual plan",
    value: "Extend the guest experience beyond the lobby.",
    cta: "Start hospitality",
    href: "/partners/hotels",
    icon: Hotel,
  },
  {
    id: "venues",
    label: "Venues",
    audience: "Restaurants, bars, fitness, wellness",
    price: "Free launch period",
    value: "Show up when nearby intent is already forming.",
    cta: "Start venue rollout",
    href: "/partners/venues",
    icon: UtensilsCrossed,
  },
  {
    id: "brands",
    label: "Brands",
    audience: "Campaigns, activations, sponsorships",
    price: "Campaign pricing",
    value: "Buy the moment, not the broad impression.",
    cta: "Start brand planning",
    href: "/partners/brands",
    icon: Megaphone,
  },
  {
    id: "civic",
    label: "Civic",
    audience: "Districts, chambers, public initiatives",
    price: "District / initiative pricing",
    value: "Make participation easier to find and easier to join.",
    cta: "Start civic rollout",
    href: "/partners/civic",
    icon: Landmark,
  },
];

const rolloutSteps = [
  {
    id: "launch",
    title: "Launch",
    copy: "Choose the partner type, set the entry points, and go live quickly with the right map visibility.",
    icon: Route,
  },
  {
    id: "measure",
    title: "Measure",
    copy: "Track scans, saves, visits, RSVPs, redemptions, and source performance in the same system.",
    icon: CheckCircle2,
  },
  {
    id: "adjust",
    title: "Adjust",
    copy: "Tune placement, offers, timing, and activation windows based on what is actually working.",
    icon: ArrowRight,
  },
  {
    id: "scale",
    title: "Scale",
    copy: "Keep the pilot, expand the footprint, and move into a wider annual model with real data behind it.",
    icon: Building2,
  },
];

const includeCards = [
  { id: "map", title: "Map visibility", copy: "Appear in the live downtown layer where decisions are forming." },
  { id: "source", title: "Source access", copy: "QR or source-node entry points tied back to actual partner origins." },
  { id: "analytics", title: "Analytics", copy: "Track visits, saves, RSVPs, redemptions, and return behavior." },
  { id: "workspace", title: "Partner workspace", copy: "Manage offers, events, profile, and visibility in one control surface." },
];

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { openFlow } = useCTAFlow();

  return (
    <section
      id="start-here"
      ref={ref}
      className="border-t border-[rgba(10,20,40,0.08)] bg-[#f7f9fc] px-4 py-14 md:px-6 md:py-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-[1.05fr_0.95fr] md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="dp-micro-label mb-3 block">Start Here</span>
            <h2 className="dp-display-section max-w-3xl text-[2.15rem] text-foreground md:text-[3rem]">
              Pick the role, understand the rollout, and see what is included.
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-muted-foreground">
              Start with the partner model that fits, launch with a pilot, and scale what works with real measurement behind it.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-[20px] border border-[rgba(10,20,40,0.08)] bg-white px-5 py-4 text-[13px] leading-6 text-muted-foreground shadow-[0_8px_24px_rgba(11,26,43,0.04)]"
          >
            Start with a pilot, go live quickly, measure what happens, then decide whether to expand the footprint.
          </motion.div>
        </div>

        <div className="space-y-10">
          <div>
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Partner fit
            </div>
            <SwipeRail
              items={partnerCards}
              getKey={(item) => item.id}
              cardClassName="w-[88%] sm:w-[72%] lg:w-[40%] xl:w-[31%]"
              renderItem={(card, index, isActive) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.45, delay: 0.06 * index }}
                    className={`h-full rounded-[24px] border p-5 shadow-[0_8px_20px_rgba(11,26,43,0.04)] ${
                      isActive
                        ? "border-primary/18 bg-white"
                        : "border-[rgba(10,20,40,0.08)] bg-[#fbfcfe]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#f1f4f8] text-primary">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="rounded-full bg-[rgba(198,168,90,0.10)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--dp-gold-muted)]">
                        {card.price}
                      </div>
                    </div>
                    <div className="mt-5 text-[1.2rem] font-semibold tracking-[-0.03em] text-foreground">
                      {card.label}
                    </div>
                    <div className="mt-1 text-[12px] text-muted-foreground">{card.audience}</div>
                    <p className="mt-3 text-[13px] leading-6 text-muted-foreground">{card.value}</p>
                    <Link
                      to={card.href}
                      className="mt-5 inline-flex items-center gap-2 text-[12px] font-semibold text-primary hover:underline"
                    >
                      {card.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </motion.div>
                );
              }}
            />
          </div>

          <div>
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Rollout path
            </div>
            <SwipeRail
              items={rolloutSteps}
              getKey={(item) => item.id}
              cardClassName="w-[84%] sm:w-[66%] lg:w-[30%] xl:w-[24%]"
              renderItem={(step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.45, delay: 0.05 * index }}
                    className="h-full rounded-[22px] border border-[rgba(10,20,40,0.08)] bg-white p-5 shadow-[0_8px_20px_rgba(11,26,43,0.04)]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                        Step {index + 1}
                      </div>
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="mt-4 text-[1.15rem] font-semibold tracking-[-0.03em] text-foreground">
                      {step.title}
                    </div>
                    <p className="mt-3 text-[13px] leading-6 text-muted-foreground">{step.copy}</p>
                  </motion.div>
                );
              }}
            />
          </div>

          <div>
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Included
            </div>
            <SwipeRail
              items={includeCards}
              getKey={(item) => item.id}
              cardClassName="w-[82%] sm:w-[62%] lg:w-[28%] xl:w-[22%]"
              renderItem={(item, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.04 * index }}
                  className="h-full rounded-[20px] border border-[rgba(10,20,40,0.08)] bg-white p-5 shadow-[0_8px_20px_rgba(11,26,43,0.04)]"
                >
                  <div className="text-sm font-semibold text-foreground">{item.title}</div>
                  <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{item.copy}</p>
                </motion.div>
              )}
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Link
            to="/partners"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            Explore partner types
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/partner-workspace"
            onClick={(event) => {
              event.preventDefault();
              openFlow({
                type: "pilot_request",
                source: "pricing_section_start_pilot",
                sourceComponent: "PricingSection",
                successRoute: "/partners",
              });
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(10,20,40,0.12)] px-6 py-3 text-sm font-medium text-foreground/70 transition-all hover:text-foreground"
          >
            Start a pilot
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
