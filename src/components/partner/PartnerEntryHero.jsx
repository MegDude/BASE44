import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * PartnerEntryHero — Special hero for the unified partner entry point
 * Explains the system as one, then routes to roles
 */
export default function PartnerEntryHero() {
  return (
    <section className="py-16 md:py-24 border-b border-border/70 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="text-[11px] font-bold uppercase tracking-[.16em] text-[#B7934E] mb-4">
            Partner Program
          </div>

          <h1 className="text-[38px] md:text-[56px] font-bold text-foreground leading-[1.02] tracking-tight mb-5">
            One downtown system.
            <br />
            Five ways to grow.
          </h1>

          <p className="text-[16px] text-foreground/72 leading-7 mb-6 max-w-2xl">
            Downtown Perks is a unified map-native operating layer for downtown. Whether you're a residential building, hotel, venue, brand, or civic organization—you use the same system differently. Show up on the map. Connect your people. Measure what matters.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#partners"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-primary text-primary-foreground font-semibold text-[14px] hover:bg-primary/92"
            >
              Find your role
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/downtown-perks/explore"
              className="inline-flex items-center h-11 px-5 rounded-full border border-border bg-white text-foreground font-semibold text-[14px] hover:bg-accent"
            >
              Explore the map
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}