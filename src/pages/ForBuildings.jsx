import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Building2, Users, BarChart3, MessageSquare, ArrowRight, CheckCircle, Zap } from "lucide-react";

const tiers = [
  {
    name: "Pilot",
    price: "Free",
    period: "90 days",
    features: [
      "Downtown Perks for all residents",
      "QR card activation",
      "Map listing for your building",
      "Top-line automated reports",
    ],
    highlight: false,
  },
  {
    name: "Connected",
    price: "$39.99",
    period: "/month",
    features: [
      "Everything in Pilot",
      "Resident engagement dashboard",
      "Direct messaging channel",
      "Monthly insights reports",
      "Priority venue partnerships",
    ],
    highlight: true,
  },
  {
    name: "Intelligence",
    price: "$99.99",
    period: "/month",
    features: [
      "Everything in Connected",
      "Advanced analytics",
      "Behavioral insights",
      "Custom event programming",
      "Real estate lead routing",
      "Dedicated account manager",
    ],
    highlight: false,
  },
];

const benefits = [
  {
    icon: Users,
    title: "Modern Resident Amenity",
    description: "Give your residents something no other building offers — a citywide perks and community system.",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description: "Reach residents through a channel they actually use — beyond clunky emails and outdated tools.",
  },
  {
    icon: BarChart3,
    title: "Resident Insights",
    description: "Understand what your residents actually do, care about, and engage with across downtown.",
  },
  {
    icon: Zap,
    title: "Real Estate Leads",
    description: "Turn map visitors into warm leads — 'Want to live here?' routes directly to your leasing team.",
  },
];

export default function ForBuildings() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div className="pt-24 pb-20 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20 max-w-3xl mx-auto"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-widest">
            For Buildings & Developers
          </span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mt-4 mb-6 leading-tight">
            Subscribe to a better
            <br />
            <span className="text-primary">version of downtown</span>
            <br />
            for your residents.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Downtown Perks gives your building a modern amenity that connects
            residents to the neighborhood, drives foot traffic to local
            businesses, and surfaces high-intent real estate leads — all for
            less than $5 per unit per year.
          </p>
        </motion.div>

        {/* Benefits */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <b.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold mb-2">{b.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {b.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Pricing */}
        <div className="mb-24">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
            Simple, Building-Level Pricing
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
            Start free for 90 days. After that, choose the level of insights
            that works for your team.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`rounded-2xl border p-8 ${
                  tier.highlight
                    ? "border-primary bg-primary/5 relative"
                    : "border-border bg-card"
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    Most Popular
                  </span>
                )}
                <h3 className="font-heading text-xl font-bold mb-2">{tier.name}</h3>
                <div className="mb-6">
                  <span className="font-heading text-4xl font-bold text-primary">
                    {tier.price}
                  </span>
                  <span className="text-muted-foreground text-sm ml-1">
                    {tier.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-secondary-foreground">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                    tier.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {tier.price === "Free" ? "Start Pilot" : "Get Started"}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Business pitch */}
        <div className="rounded-3xl border border-border bg-card/50 p-8 md:p-12 text-center max-w-3xl mx-auto">
          <Building2 className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="font-heading text-2xl font-bold mb-4">
            For Local Businesses
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            "You don't pay to join. Your only 'cost' is the value of the perk
            you offer our resident members. In exchange, we send you curated,
            hyper-local, likely-to-convert customers and promote you on the map
            and content."
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
          >
            See the Map <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}