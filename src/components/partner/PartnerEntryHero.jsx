import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * PartnerEntryHero — Special hero for the unified partner entry point
 * Explains the system as one, then routes to roles
 */
export default function PartnerEntryHero() {
  return (
    <section className="px-4 py-8 md:px-6 md:py-10">
      <div className="dp-page-shell">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="dp-band max-w-4xl p-6 md:p-10"
        >
          <div className="dp-micro-label mb-4">
            Partner Program
          </div>

          <h1 className="dp-display-hero mb-5 max-w-3xl text-[2.5rem] md:text-[4rem]">
            One downtown system.
            <br />
            Five ways to grow.
          </h1>

          <p className="max-w-2xl text-[15px] leading-7 text-[rgba(11,31,51,0.68)]">
            Downtown Perks is a unified map-native operating layer for downtown. Whether you're a residential building, hotel, venue, brand, or civic organization—you use the same system differently. Show up on the map. Connect your people. Measure what matters.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#partners"
              className="dp-cta-primary"
            >
              Find your role
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/explore"
              className="dp-cta-secondary"
            >
              Explore the map
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
