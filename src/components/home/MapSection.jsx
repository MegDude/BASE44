import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Home, Coffee, ArrowRight, QrCode } from "lucide-react";

const features = [
  "Restaurants, bars, coffee shops, and services nearby",
  "Events happening tonight, ready to RSVP",
  "Local perks from places you'd go anyway",
  "Places worth coming back to",
  "People around you, when you want to be social",
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
    <section ref={ref} className="py-20 px-5 border-t border-[#0B1F33]/8 bg-[#F7F8FB]">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14 items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[11px] font-medium text-primary/80 uppercase tracking-[0.16em] block mb-4">
              What You Can Do
            </span>
            <h2 className="font-heading text-3xl md:text-[38px] font-medium leading-[1.1] tracking-normal text-foreground">
              Everything works together —
              <br />
              <em className="text-primary">so you show up more.</em>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-foreground/60 text-[13px] leading-relaxed"
          >
            Spend less time searching and more time showing up. Everything you need to move through downtown is in one place.
          </motion.p>
        </div>

        {/* Map filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex gap-2 mb-8 overflow-x-auto pb-0.5"
        >
          {filterTabs.map((tab, i) => (
            <span key={i} className={`px-4 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap border cursor-default flex-shrink-0 ${
              i === 0 ? "border-primary/50 bg-primary/10 text-primary" : "border-border/40 text-muted-foreground"
            }`}>
              {tab}
            </span>
          ))}
        </motion.div>

        {/* Two-col: find + how */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[#0B1F33]/8 rounded-xl overflow-hidden mb-10 bg-white shadow-[0_12px_40px_rgba(11,31,51,0.05)]">

          {/* Find what you need */}
          <div className="p-8 md:border-r border-[#0B1F33]/8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-[11px] font-medium text-foreground/50 uppercase tracking-[0.12em] mb-5">Find What You Need</div>
              <ul className="space-y-3 mb-8">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-[13px] text-foreground/60">
                    <div className="w-1 h-1 rounded-full bg-primary/60 mt-2 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Sample venue card */}
              <div className="p-4 rounded-lg bg-[#F7F8FB] border border-[#0B1F33]/8 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full border border-border/60 bg-muted/60 flex items-center justify-center shrink-0">
                    <Coffee className="w-3.5 h-3.5 text-primary/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[13px] text-foreground">Jo's Coffee</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Coffee. Quick stops. Daily rituals.</div>
                    <div className="text-[11px] text-primary/70 mt-1">Nearby perk · 5-minute walk</div>
                  </div>
                  <span className="text-[11px] font-medium text-primary border border-primary/30 px-2.5 py-1 rounded-full shrink-0">
                    Show Card
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Link to="/map?mode=resident&tab=map" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[12px] hover:bg-primary/90 transition-all">
                  <MapPin className="w-3.5 h-3.5" /> Explore Downtown
                </Link>
                <Link to="/downtown-perks/card" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/60 text-foreground/70 font-medium text-[12px] hover:text-foreground transition-all">
                  Get a Perks Card
                </Link>
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
              <div className="text-[11px] font-medium text-foreground/50 uppercase tracking-[0.12em] mb-5">How It Works</div>
              <div className="divide-y divide-[#0B1F33]/8">
                {howSteps.map((s, i) => (
                  <div key={i} className="py-5 first:pt-0 last:pb-0">
                    <div className="font-medium text-[13px] text-foreground mb-1.5">{s.label}</div>
                    <div className="text-[13px] text-foreground/60 leading-relaxed">{s.detail}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-[#0B1F33]/8 space-y-1">
                <p className="font-heading text-[14px] font-medium text-foreground italic">That's how friction dies.</p>
                <p className="text-[12px] text-foreground/55 leading-relaxed">No extra steps. No guesswork. Just the shortest distance between "maybe" and "I'm going."</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Three sub-section cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            {
              icon: Calendar,
              label: "Events Happening Now",
              detail: "See what's on. RSVP in one tap. From happy hours to local programming — without leaving the map.",
              cta: "See events",
              to: "/downtown-perks/events",
            },
            {
              icon: Home,
              label: "Want to live here?",
              detail: "Browse properties nearby. Filter to Properties to view participating buildings, rentals, and homes for sale. Tap any building for availability and what's walkable.",
              cta: "View properties",
              to: "/map?mode=resident&tab=map",
            },
            {
              icon: QrCode,
              label: "Get Your Perks Card Now",
              detail: "Scan the QR code to get your Perks Card sent directly to your phone. Sign me up.",
              cta: "Sign me up",
              to: "/downtown-perks/card",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
              className="p-6 rounded-xl border border-[#0B1F33]/8 bg-white hover:border-[#0B1F33]/10 hover:shadow-[0_12px_40px_rgba(11,31,51,0.05)] transition-all group shadow-[0_8px_24px_rgba(11,31,51,0.035)]"
            >
              <div className="w-8 h-8 rounded-full border border-[#0B1F33]/8 flex items-center justify-center mb-4">
                <item.icon className="w-3.5 h-3.5 text-primary/70" />
              </div>
              <div className="font-heading font-medium text-[13px] text-foreground mb-2">{item.label}</div>
              <div className="text-[12px] text-foreground/60 leading-relaxed mb-4">{item.detail}</div>
              <Link to={item.to} className="inline-flex items-center gap-1 text-[12px] text-primary font-medium hover:underline underline-offset-4">
                {item.cta} <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* "What's around the corner" strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="border border-[#0B1F33]/8 rounded-xl p-8 bg-white shadow-[0_10px_34px_rgba(11,31,51,0.04)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-heading text-2xl font-medium leading-[1.1] mb-2 text-foreground">What's Around the Corner</h3>
              <p className="text-foreground/60 text-[13px] leading-relaxed">
                Everything you need, within walking distance. See what's close, decide quickly, and go.
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/map?mode=resident&tab=map" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all">
                <MapPin className="w-3.5 h-3.5" /> Open the Map
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
