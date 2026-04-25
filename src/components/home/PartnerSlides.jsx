import { motion, useInView } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Hotel,
  Landmark,
  Megaphone,
  Sparkles,
  Utensils,
} from "lucide-react";

const ROLES = [
  {
    id: "properties",
    icon: Building2,
    label: "Residential",
    shortLabel: "For buildings",
    title: "Help residents use downtown more easily.",
    body:
      "Residents open one map, see what is nearby, and use your building as the starting point instead of figuring it out alone.",
    gets: [
      "A better resident amenity",
      "Nearby places and events tied to the building",
      "A simple view of what residents actually use",
    ],
    proof: "1,284 property views · 342 resident actions",
    cta: "Open residential view",
    href: "/partners/properties",
  },
  {
    id: "hotels",
    icon: Hotel,
    label: "Hospitality",
    shortLabel: "For hotels",
    title: "Give guests a better answer than a front-desk list.",
    body:
      "Guests see one live downtown map for food, drinks, wellness, and events, already matched to where they are staying.",
    gets: [
      "A better guest experience",
      "Local places and moments around the hotel",
      "A clear read on where guests actually go",
    ],
    proof: "612 guest opens · 74 attributed visits",
    cta: "Open hospitality view",
    href: "/partners/hospitality",
  },
  {
    id: "venues",
    icon: Utensils,
    label: "Venues",
    shortLabel: "For bars and restaurants",
    title: "Show up when someone nearby is deciding.",
    body:
      "Your venue appears at the moment a person is choosing where to go, with the offer, event, or reason to visit already visible.",
    gets: [
      "Map visibility when intent is real",
      "Offer and event placement",
      "A simple read on visits, saves, and redemptions",
    ],
    proof: "1,942 map opens · 143 visits",
    cta: "Open venue view",
    href: "/partners/venues",
  },
  {
    id: "brands",
    icon: Megaphone,
    label: "Brands",
    shortLabel: "For sponsors and campaigns",
    title: "Show up inside real downtown behavior.",
    body:
      "Instead of broad reach, brands enter the map where people are already moving, deciding, and showing up.",
    gets: [
      "District and venue placement",
      "Campaign visibility tied to real movement",
      "Proof of scans, visits, and response",
    ],
    proof: "28k map opens · 1,140 source scans",
    cta: "Open brand view",
    href: "/partners/brands",
  },
  {
    id: "civic",
    icon: Landmark,
    label: "Civic",
    shortLabel: "For downtown groups",
    title: "Make local activity easier to find and easier to support.",
    body:
      "District events, public programming, and local business support all show up where people are already looking.",
    gets: [
      "Better visibility for local activity",
      "Support for district events and businesses",
      "A clearer view of what is getting attention",
    ],
    proof: "184 RSVPs · 22% repeat participation",
    cta: "Open civic view",
    href: "/partners/civic",
  },
];

const FLOW_STEPS = [
  {
    id: "show-up",
    title: "You show up on the map",
    body: "Your building, venue, brand, or district appears in the same downtown layer people already use.",
  },
  {
    id: "choose",
    title: "People choose what is nearby",
    body: "They see what is close, what is open, and what gives them a reason to go.",
  },
  {
    id: "learn",
    title: "You see what worked",
    body: "The dashboard shows visits, saves, RSVPs, scans, and redemptions without turning it into a reporting maze.",
  },
];

export default function PartnerSlides() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeRoleId, setActiveRoleId] = useState(ROLES[0].id);

  const activeRole = useMemo(
    () => ROLES.find((role) => role.id === activeRoleId) || ROLES[0],
    [activeRoleId]
  );

  const ActiveIcon = activeRole.icon;

  return (
    <section ref={ref} className="bg-[var(--dp-surface-base)] px-4 py-10 md:px-6 md:py-12">
      <div className="dp-page-shell">
        <div className="overflow-hidden">
          <div className="px-5 py-6 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45 }}
            >
              <span className="dp-micro-label">Who this helps</span>
              <h2 className="dp-display-section mt-3 max-w-3xl text-[2rem] text-foreground md:text-[2.8rem]">
                Turn residents into regulars.
              </h2>
              <p className="mt-3 max-w-2xl text-[14px] leading-6 text-muted-foreground">
                People are already downtown, already walking, and already deciding. The point is not more attention. It is better timing, clearer context, and proof of what happened next.
              </p>
            </motion.div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {FLOW_STEPS.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.06 * index }}
                  className="border-t border-[rgba(11,31,51,0.08)] px-1 py-4"
                >
                  <div className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[var(--dp-navy)] px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
                    {index + 1}
                  </div>
                  <div className="mt-3 text-[15px] font-semibold text-foreground">
                    {step.title}
                  </div>
                  <div className="mt-2 text-[13px] leading-6 text-muted-foreground">
                    {step.body}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="border-t border-[rgba(11,31,51,0.08)] px-5 py-5 md:px-6 md:py-6">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const active = role.id === activeRoleId;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setActiveRoleId(role.id)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                      active
                        ? "border-[var(--dp-navy)] bg-[var(--dp-navy)] text-white"
                        : "border-[rgba(11,31,51,0.08)] bg-white text-[rgba(11,31,51,0.66)] hover:bg-[#f7f9fc]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {role.label}
                  </button>
                );
              })}
            </div>

            <motion.div
              key={activeRole.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]"
            >
              <div className="bg-[linear-gradient(180deg,rgba(247,249,252,0.96),rgba(255,255,255,1))] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[rgba(11,26,43,0.06)] text-primary">
                    <ActiveIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                      {activeRole.shortLabel}
                    </div>
                    <div className="mt-1 text-[1.35rem] font-semibold leading-[1.02] tracking-[-0.03em] text-foreground">
                      {activeRole.title}
                    </div>
                  </div>
                </div>

                <div className="mt-4 max-w-2xl text-[14px] leading-6 text-muted-foreground">
                  {activeRole.body}
                </div>

                <div className="mt-5 grid gap-2">
                  {activeRole.gets.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2 border-t border-[rgba(11,31,51,0.08)] px-1 py-3 text-[13px] leading-5 text-foreground/84"
                    >
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--dp-gold-muted)]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,#0B1F33_0%,#112A44_100%)] p-5 text-white">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/72">
                  What this looks like
                </div>
                <div className="mt-3 rounded-[18px] bg-white/10 p-4">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/72">
                    Simple proof
                  </div>
                  <div className="mt-2 text-[15px] font-semibold text-white">
                    {activeRole.proof}
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-[13px] leading-5 text-white/88">
                  <div className="rounded-[16px] bg-white/10 px-4 py-3">
                    People nearby open the map.
                  </div>
                  <div className="rounded-[16px] bg-white/10 px-4 py-3">
                    They see your building, place, brand, or district in context.
                  </div>
                  <div className="rounded-[16px] bg-white/10 px-4 py-3">
                    The system shows what got attention and what to do next.
                  </div>
                </div>

                <Link
                  to={activeRole.href}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-[12px] font-semibold text-[var(--dp-navy)] transition-colors hover:bg-white/92"
                >
                  {activeRole.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
