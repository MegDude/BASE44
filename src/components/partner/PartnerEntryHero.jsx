import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * PartnerEntryHero — Special hero for the unified partner entry point
 * Explains the system as one, then routes to roles
 */
export default function PartnerEntryHero() {
  return (
    <section className="py-24 md:py-32 border-b border-[#e8e5df]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="text-[12px] font-bold uppercase tracking-[.12em] text-[#8d887f] mb-6">
            Partner Program
          </div>

          <h1 className="text-[48px] md:text-[64px] font-bold text-[#111] leading-tight tracking-tight mb-6">
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
              className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-[#111] text-white font-semibold text-[14px] hover:bg-[#2a2a2a] transition-colors"
            >
              Find your role
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/downtown-perks/explore"
              className="inline-flex items-center h-12 px-6 rounded-2xl border border-[#e8e5df] bg-white text-[#111] font-semibold text-[14px] hover:bg-[#f5f4f2] transition-colors"
            >
              Explore the map
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}