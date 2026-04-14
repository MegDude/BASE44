import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Star, Home, Coffee, ArrowRight } from "lucide-react";

const features = [
  "Restaurants, bars, coffee shops, and services nearby",
  "Events happening tonight, ready to RSVP",
  "Local perks from places you'd go anyway",
  "Places worth coming back to",
];

const howSteps = [
  { label: "Tap. Learn. Decide.", detail: "See what it is, why it matters, and how close you are." },
  { label: "Save it or go now.", detail: "Plan ahead — or decide in the moment." },
  { label: "Flash your card. Get the perk.", detail: "They scan. You save. Done." },
];

const filterTabs = ["All", "Places", "Offers", "Events", "Properties"];

export default function MapSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-20 px-6 border-t border-border/40">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">
              What You Can Do
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-medium leading-[1.15] tracking-tight">
              Everything works together —
              <br />
              <em className="text-primary">so you show up more.</em>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-muted-foreground text-[13px] leading-relaxed"
          >
            Spend less time searching and more time showing up. Everything you need to move through downtown is in one place.
          </motion.p>
        </div>

        {/* Map filter tabs preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-2 mb-8 overflow-x-auto pb-1"
        >
          {filterTabs.map((tab, i) => (
            <span
              key={i}
              className={`px-4 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all cursor-default ${
                i === 0
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </span>
          ))}
        </motion.div>

        {/* Two columns: features + how it works */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-border/40 rounded-lg overflow-hidden mb-12">

          {/* Find what you need */}
          <div className="p-8 md:border-r border-border/40">
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-6">Find What You Need</div>
              <ul className="space-y-3 mb-8">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-[13px] text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Sample venue card */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full border border-border/60 bg-muted/60 flex items-center justify-center shrink-0">
                    <Coffee className="w-3.5 h-3.5 text-primary/60" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">Jo's Coffee</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Coffee · 5-minute walk</div>
                    <div className="text-[11px] text-primary/70 mt-1">Nearby perk available</div>
                  </div>
                  <span className="text-[11px] font-medium text-primary border border-primary/30 px-2.5 py-1 rounded-full">
                    Show Card
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* How it works */}
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-6">How It Works</div>
              <div className="space-y-0 divide-y divide-border/40">
                {howSteps.map((s, i) => (
                  <div key={i} className="py-4 first:pt-0 last:pb-0">
                    <div className="font-medium text-sm text-foreground mb-1">{s.label}</div>
                    <div className="text-[13px] text-muted-foreground leading-relaxed">{s.detail}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border/40">
                <p className="font-heading text-base font-medium text-foreground italic mb-1">That's how friction dies.</p>
                <p className="text-[12px] text-muted-foreground">No extra steps. Just the shortest distance between "maybe" and "I'm going."</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Map sub-sections: Events / Properties / Perks Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Calendar, label: "Events Happening Now", detail: "See what's on. RSVP in one tap.", cta: "See events", to: "/downtown-perks/events" },
            { icon: Home, label: "Want to live here?", detail: "Browse properties nearby — not just listings online.", cta: "View properties", to: "/downtown-perks/explore" },
            { icon: Star, label: "Get Your Perks Card", detail: "Scan the QR code. Your card comes straight to your phone.", cta: "Sign me up", to: "/downtown-perks/card" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
              className="p-6 rounded-lg border border-border/50 bg-card/40 hover:border-primary/20 transition-all group"
            >
              <div className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center mb-4">
                <item.icon className="w-3.5 h-3.5 text-primary/60" />
              </div>
              <div className="font-heading font-medium text-sm text-foreground mb-1.5">{item.label}</div>
              <div className="text-[12px] text-muted-foreground leading-relaxed mb-4">{item.detail}</div>
              <Link to={item.to} className="inline-flex items-center gap-1 text-[12px] text-primary font-medium hover:underline underline-offset-4">
                {item.cta} <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap gap-3"
        >
          <Link to="/downtown-perks/explore" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all duration-300">
            <MapPin className="w-3.5 h-3.5" /> Explore Downtown
          </Link>
          <Link to="/downtown-perks/card" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground transition-all duration-300">
            Get a Perks Card
          </Link>
        </motion.div>
      </div>
    </section>
  );
}