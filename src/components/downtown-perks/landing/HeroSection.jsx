import { motion } from "framer-motion";
import { ArrowDown, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroSection({ heroImage }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Downtown Austin skyline at night"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
      </div>

      {/* Animated grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent w-full"
            style={{ top: `${20 + i * 15}%` }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, delay: i * 0.5, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary tracking-wide uppercase">
              Austin, TX — Members Only
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tight mb-6"
        >
          <span className="text-foreground">Where downtown</span>
          <br />
          <span className="text-primary">starts working</span>
          <br />
          <span className="text-foreground">like a system.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          A members-only digital layer that connects residents, buildings, and
          local businesses into a single, real-time neighborhood — so you don't
          just live downtown, you move through it together.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/downtown-perks/explore"
            className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30"
          >
            Explore the Map
          </Link>
          <Link
            to="/downtown-perks/card"
            className="px-8 py-4 rounded-full border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-all"
          >
            Get Your Perks Card
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ArrowDown className="w-5 h-5 text-muted-foreground" />
      </motion.div>
    </section>
  );
}