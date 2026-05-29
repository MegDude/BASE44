import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * PartnerEntryHero — Special hero for the unified partner entry point
 * Explains the system as one, then routes to roles
 */
export default function PartnerEntryHero() {
  return (
    <section className="py-24 md:py-2.52 border-b border-[#0B1F33]/8">
      <div className="max-w-7xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="text-[12px] font-bold uppercase tracking-[.12em] text-[#0B1F33]/50 mb-6">
            Partner Program
          </div>

          <h1 className="text-[48px] md:text-[64px] font-bold text-[#0B1F33] leading-tight tracking-normal mb-6">
            One downtown system.
            <br />
            Five ways to grow.
          </h1>

          <p className="text-[18px] text-[#6f6b65] leading-relaxed mb-8 max-w-2xl">
            Downtown Perks is a unified map-native operating layer for downtown. Whether you're a residential building, hotel, venue, brand, or civic organization—you use the same system differently. Show up on the map. Connect your people. Measure what matters.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#partners"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#0B1F33] text-white font-semibold text-[14px] hover:bg-[#081521] transition-colors"
            >
              Find your role
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/map?mode=resident&tab=map"
              className="inline-flex items-center h-10 px-5 rounded-lg border border-[#0B1F33]/8 bg-white text-[#0B1F33] font-semibold text-[14px] hover:bg-[#F7F8FB] transition-colors"
            >
              Explore the map
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}