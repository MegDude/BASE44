import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Building2, Users, BarChart3, MessageSquare, ArrowRight, CheckCircle } from "lucide-react";

const tiers = [
  {
    name: "Pilot",
    price: "Free",
    period: "90 days",
    features: [
      "Resident access for the whole building",
      "QR card activation",
      "Map listing and neighborhood layer",
      "Top-line usage reports",
    ],
    highlight: false,
  },
  {
    name: "Connected",
    price: "$39.99",
    period: "/month",
    features: [
      "Everything in Pilot",
      "Resident activity dashboard",
      "Building communication channel",
      "Monthly engagement reports",
      "Priority partner access",
    ],
    highlight: true,
  },
  {
    name: "Intelligence",
    price: "$99.99",
    period: "/month",
    features: [
      "Everything in Connected",
      "Advanced usage analytics",
      "Behavioral and segmentation data",
      "Custom event programming",
      "Leasing lead routing",
      "Dedicated account manager",
    ],
    highlight: false,
  },
];

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
    description: "See what residents are opening, saving, and using while turning neighborhood interest into clearer leasing conversations.",
  },
];

export default function ForBuildings() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="pt-32 pb-12 px-5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">
              For Buildings
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
              <h1 className="font-heading text-4xl md:text-4xl font-medium leading-[1.08] tracking-normal">
                A Smarter
                <br />
                <em className="text-primary">Building Amenity</em>
              </h1>
              <p className="text-muted-foreground text-[15px] leading-relaxed md:pb-1">
                Downtown Perks gives residents a better way to use the neighborhood around them while giving your property a stronger amenity, clearer communication, and added leasing value.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section ref={ref} className="py-10 px-5 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-7"
          >
            What You Get
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border/40 border border-border/40 rounded-lg overflow-hidden">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08 }}
                className={`p-8 ${i >= 2 ? "border-t border-border/40" : ""}`}
              >
                <div className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center mb-5">
                  <b.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-medium mb-2">{b.title}</h3>
                <p className="text-muted-foreground text-[13px] leading-relaxed">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-10 px-5 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <div className="mb-7">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] block mb-4">
              Pricing
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <h2 className="font-heading text-3xl md:text-4xl font-medium leading-[1.15] tracking-normal">
                Simple pricing. Start with a pilot.
              </h2>
              <p className="text-muted-foreground text-[13px] leading-relaxed">
                90 days free. After that, choose the level that fits your team's communication and reporting needs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className={`rounded-lg border p-7 relative ${
                  tier.highlight
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/60 bg-card/40"
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-medium tracking-wide">
                    Most Popular
                  </span>
                )}
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-4">
                  {tier.name}
                </div>
                <div className="mb-6">
                  <span className="font-heading text-4xl font-medium text-foreground tracking-normal">
                    {tier.price}
                  </span>
                  <span className="text-muted-foreground text-[13px] ml-1.5">{tier.period}</span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-primary/60 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2.5 rounded-full text-[13px] font-medium transition-all duration-300 ${
                    tier.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border/70 text-foreground/70 hover:text-foreground hover:border-border"
                  }`}
                >
                  {tier.price === "Free" ? "Start Free Pilot" : "Get Started"}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business pitch */}
      <section className="py-10 px-5 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <div className="border border-border/60 rounded-lg p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.12em] block mb-4">
                  For Local Businesses
                </span>
                <h3 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] mb-4">
                  No cost to join.
                  <br />
                  <em className="text-muted-foreground font-normal">The offer is the entry point.</em>
                </h3>
              </div>
              <div>
                <p className="text-muted-foreground text-[13px] leading-relaxed mb-6">
                  Local businesses join by offering a perk to resident members. In return, they appear on the map at the moment nearby residents are deciding where to go.
                </p>
                <Link
                  to="/map?mode=resident&tab=map"
                  className="inline-flex items-center gap-2 text-primary font-medium text-[13px] hover:underline underline-offset-4"
                >
                  See the Map <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
