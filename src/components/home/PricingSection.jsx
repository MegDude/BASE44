import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const tiers = [
  {
    emoji: "🏢",
    label: "Properties",
    sub: "Multifamily, condos, apartments",
    price: "Free · $39 · $99 / yr",
    note: "Management pays. Residents stay.",
    detail: "Your address is your key to downtown.",
  },
  {
    emoji: "🏨",
    label: "Hotels",
    sub: "Hotels, boutiques, extended stays",
    price: "$99–$149 / yr",
    note: "Extend the stay beyond your lobby.",
    detail: "One scan. Every option nearby.",
  },
  {
    emoji: "🍽️",
    label: "Venues",
    sub: "Restaurants, bars, fitness, wellness",
    price: "Free for 12 months",
    note: "Show up in the moment that counts.",
    detail: "Not reach. Relevance. Not impressions. Intent.",
  },
  {
    emoji: "📢",
    label: "Brands",
    sub: "Activations, campaigns, sponsorships",
    price: "$99–$149 / yr",
    note: "Buy the moment, not the impression.",
    detail: "Context beats scale. Timing beats frequency.",
  },
  {
    emoji: "🏛️",
    label: "Civic",
    sub: "Cities, districts, chambers",
    price: "$49–$79 / yr",
    note: "Turn attendance into participation.",
    detail: "Discovery drives turnout.",
  },
];

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-20 px-6 border-t border-[hsl(218,20%,88%)] bg-[hsl(42,24%,96%)]">
      <div className="max-w-5xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[11px] font-medium text-primary/80 uppercase tracking-[0.16em] block mb-4">
              Pricing
            </span>
            <h2 className="font-heading text-3xl md:text-[38px] font-medium leading-[1.1] tracking-tight text-foreground">
              Spend less.
              <br />
              <em className="text-primary">Do more.</em>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-foreground/60 text-[13px] leading-relaxed"
          >
            Start with a pilot. Decide with real data. No setup. No long-term commitment. You go live, people use it, you see what happens.
            <span className="block mt-2 text-[12px] text-muted-foreground/60 italic">
              Final pricing reflects footprint, visibility, and activation.
            </span>
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.07 }}
              className="p-5 rounded-lg border border-[hsl(218,20%,88%)] bg-white hover:border-primary/30 hover:shadow-[0_4px_14px_rgba(14,28,54,.06)] transition-all shadow-[0_1px_4px_rgba(14,28,54,.04)]"
            >
              <div className="text-xl mb-3">{tier.emoji}</div>
              <div className="font-heading font-medium text-sm text-foreground mb-0.5">{tier.label}</div>
              <div className="text-[11px] text-foreground/45 mb-3">{tier.sub}</div>
              <div className="font-heading font-medium text-primary text-[13px] mb-1">{tier.price}</div>
              <div className="text-[11px] text-foreground/60 leading-relaxed mb-2">{tier.note}</div>
              <div className="text-[11px] text-foreground/45 italic leading-relaxed">{tier.detail}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 flex flex-wrap items-center gap-4"
        >
          <Link
            to="/downtown-perks/for-buildings"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all duration-300"
          >
            See how it works for you <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-[12px] text-foreground/45">No setup fee. No long-term commitment.</span>
        </motion.div>
      </div>
    </section>
  );
}