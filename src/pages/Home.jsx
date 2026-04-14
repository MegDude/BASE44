import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(hsl(222 18% 40%) 1px, transparent 1px), linear-gradient(90deg, hsl(222 18% 40%) 1px, transparent 1px)",
              backgroundSize: "64px 64px"
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-2 mb-8"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pin-pulse" />
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em]">
                Austin, TX
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="font-heading text-5xl md:text-7xl font-medium leading-[1.05] tracking-tight mb-6"
            >
              Welcome to
              <br />
              <em className="text-primary not-italic">Downtown Perks.</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-lg"
            >
              A live neighborhood layer for downtown Austin residents — map-first, membership-backed, and built around real behavior.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-start gap-3"
            >
              <Link
                to="/downtown-perks"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all duration-300 shadow-md shadow-primary/15"
              >
                <MapPin className="w-4 h-4" />
                Explore Downtown Perks
              </Link>
              <Link
                to="/brands"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground hover:border-border transition-all duration-300"
              >
                See Partners <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}