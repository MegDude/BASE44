import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";

export default function HeroSection({ heroImage }) {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      {/* Background image — full cover */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Downtown Austin"
          className="w-full h-full object-cover"
        />
        {/* Multi-layer gradient for editorial elegance */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
      </div>

      {/* Content — bottom-anchored editorial layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-24 pt-40">
        <div className="max-w-2xl">

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="flex items-center gap-2 mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pin-pulse" />
            <span className="text-[11px] font-medium text-primary/80 uppercase tracking-[0.16em]">
              Austin, TX — Downtown
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="font-heading text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.05] tracking-tight mb-6 text-foreground"
          >
            Where downtown
            <br />
            <em className="text-primary not-italic">starts working</em>
            <br />
            like a system.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed mb-10 font-body"
          >
            A live neighborhood layer for downtown residents — connecting your building, local venues, and community into one real-time map experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-start gap-3"
          >
            <Link
              to="/downtown-perks/explore"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20"
            >
              <MapPin className="w-4 h-4" />
              Open the Map
            </Link>
            <Link
              to="/downtown-perks/card"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border/80 text-foreground/80 font-medium text-sm hover:text-foreground hover:border-foreground/30 transition-all duration-300"
            >
              Get Your Perks Card
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Subtle bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}