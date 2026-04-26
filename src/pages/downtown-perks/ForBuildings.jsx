/**
 * For Buildings - Clean value prop, no card grids
 * Three beats: Amenity, Visibility, Leasing
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Building2, Users, BarChart3, ArrowRight, Check } from "lucide-react";

const tiers = [
  {
    name: "Pilot",
    price: "Free",
    period: "90 days",
    features: [
      "Resident access for the whole building",
      "QR card activation",
      "Map listing",
      "Top-line usage reports",
    ],
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
      "Behavioral segmentation",
      "Leasing lead routing",
    ],
  },
];

export default function ForBuildings() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero - Clean, no boxes */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-xs font-medium text-primary uppercase tracking-widest mb-4 block">
              For Buildings
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-6">
              A smarter
              <br />
              <span className="text-primary">building amenity.</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mb-8">
              Give residents a better way to use the neighborhood while gaining visibility into what they actually engage with.
            </p>
            <Link
              to="/downtown-perks/explore"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              See the Map
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Value Props - Simple rows, no cards */}
      <section className="py-16 px-6 border-t border-border/40">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex gap-6"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold mb-2">
                  A more useful resident amenity
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Give residents an easier way to find nearby places, local offers, and what is happening around them in daily downtown life.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex gap-6"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold mb-2">
                  Visibility into what works
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  See what residents are opening, saving, and using. Turn neighborhood interest into actionable property insights.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex gap-6"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold mb-2">
                  Stronger leasing conversations
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Show prospects a live neighborhood layer that makes your building feel more connected to what matters nearby.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing - Compact */}
      <section className="py-16 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-2xl font-bold text-center mb-10">
            Simple pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-xl ${
                  tier.highlight
                    ? "bg-primary/5 ring-1 ring-primary/20"
                    : "bg-muted/30"
                }`}
              >
                <h3 className="font-heading text-lg font-semibold mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                </div>
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-border/40">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-heading text-xl font-bold mb-3">
            Ready to add Downtown Perks?
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Start with a free pilot and see how residents engage.
          </p>
          <Link
            to="/downtown-perks/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
