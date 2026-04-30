import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Building2, Users, BarChart3, MessageSquare, ArrowRight } from "lucide-react";
import PricingGlanceSection from "@/components/shared/PricingGlanceSection";

const benefits = [
  {
    icon: Users,
    title: "A more useful resident amenity",
    description: "Give residents an easier way to find nearby places, local offers, and what is happening around them in daily downtown life.",
  },
  {
    icon: MessageSquare,
    title: "A better way to use the neighborhood",
    description: "Help people get more out of where they live by making it simpler to discover what is worth walking to, using, or joining nearby.",
  },
  {
    icon: BarChart3,
    title: "A touchpoint people come back to",
    description: "Create a resident-facing layer that feels more useful than another building email because it connects updates with real neighborhood value.",
  },
  {
    icon: Building2,
    title: "Stronger visibility for your team",
    description: "See what residents are opening, saving, and using while turning neighborhood interest into warmer leasing conversations.",
  },
];

export default function ForBuildings() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)]">

      {/* Hero */}
      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="dp-band p-6 md:p-10"
          >
            <span className="dp-micro-label block mb-4">
              For Buildings
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
              <h1 className="dp-display-hero text-[2.5rem] md:text-[4rem]">
                A Smarter
                <br />
                <em className="text-[var(--dp-gold-muted)] not-italic">Building Amenity</em>
              </h1>
              <p className="text-[rgba(11,31,51,0.68)] text-[15px] leading-7 md:pb-1">
                Downtown Perks gives residents a better way to use the neighborhood around them while giving your property a stronger amenity, clearer communication, and added leasing value.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section ref={ref} className="py-10 px-6 border-t border-border/40">
        <div className="dp-page-shell">
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-7"
          >
            What You Get
          </motion.div>
          <div className="grid grid-cols-1 overflow-hidden rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white/86 shadow-[0_16px_38px_rgba(11,31,51,0.06)] md:grid-cols-2 md:divide-x divide-[rgba(11,31,51,0.08)] divide-y md:divide-y-0">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08 }}
                className={`p-8 ${i >= 2 ? "border-t border-border/40" : ""}`}
              >
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.84)]">
                  <b.icon className="w-4 h-4 text-[var(--dp-navy)]" />
                </div>
                <h3 className="font-heading text-lg font-medium mb-2">{b.title}</h3>
                <p className="text-[rgba(11,31,51,0.64)] text-[13px] leading-relaxed">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingGlanceSection
        eyebrow="Pricing"
        title="Pricing at a glance"
        intro="Start with the pilot, compare the levels, and apply when your building, property, or development team is ready."
        includeResident
        source="for_buildings_pricing"
      />

      {/* Business pitch */}
      <section className="py-10 px-6 border-t border-border/40">
        <div className="dp-page-shell">
          <div className="dp-band p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="dp-micro-label block mb-4">
                  For Local Businesses
                </span>
                <h3 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] mb-4">
                  No cost to join.
                  <br />
                  <em className="font-normal text-[rgba(11,31,51,0.56)]">The offer is the entry point.</em>
                </h3>
              </div>
              <div>
                <p className="mb-6 text-[13px] leading-relaxed text-[rgba(11,31,51,0.64)]">
                  Local businesses join by offering a perk to resident members. In return, they appear on the map at the moment nearby residents are deciding where to go.
                </p>
                <Link
                  to="/buildings/the-waterline"
                  className="inline-flex items-center gap-2 text-[var(--dp-navy)] font-medium text-sm hover:underline underline-offset-4"
                >
                  Open building intelligence <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
