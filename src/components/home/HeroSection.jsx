import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      {/* Subtle grid bg */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: "linear-gradient(hsl(222 18% 40%) 1px, transparent 1px), linear-gradient(90deg, hsl(222 18% 40%) 1px, transparent 1px)",
          backgroundSize: "56px 56px"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-24 pt-40">
        {/* Location pill */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-2 mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pin-pulse" />
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em]">
            Austin, TX — Downtown
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
          {/* Headline */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="font-heading text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.05] tracking-tight mb-6"
            >
              Where downtown
              <br />
              <em className="text-primary">meets you.</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-muted-foreground text-base leading-relaxed mb-10 max-w-md"
            >
              Built for people who actually live here — and the places that make it feel like home. Coffee to dinner, live events, and the perks you didn't know you had. All in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                to="/downtown-perks/explore"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all duration-300 shadow-md shadow-primary/15"
              >
                <MapPin className="w-4 h-4" /> Explore Downtown
              </Link>
              <Link
                to="/downtown-perks/card"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground hover:border-border transition-all duration-300"
              >
                Get Your Perks Card
              </Link>
              <Link
                to="/downtown-perks/for-buildings"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border/40 text-muted-foreground font-medium text-sm hover:text-foreground transition-all duration-300"
              >
                Become a Partner
              </Link>
            </motion.div>
          </div>

          {/* Search intent cards */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-3"
          >
            {[
              { q: "Where do you want to go?", a: "Coffee. Dinner. Fitness. Drinks. Within walking distance." },
              { q: "What do you want to do?", a: "See what's on tonight. Find something worth showing up for." },
              { q: "Who do you want to meet?", a: "See who's going. Join in. Make a plan." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                className="p-5 rounded-lg border border-border/50 bg-card/50 hover:border-primary/20 transition-all group cursor-default"
              >
                <div className="text-[11px] font-medium text-primary/60 uppercase tracking-[0.12em] mb-1.5">{item.q}</div>
                <div className="text-[13px] text-muted-foreground leading-relaxed">{item.a}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}