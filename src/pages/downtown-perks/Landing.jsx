/**
 * Downtown Perks Landing - Map-First Entry
 * Single screen with map CTA, three narrative beats, minimal copy
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Building2, Store, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero - Map First */}
      <section className="min-h-[85vh] flex flex-col justify-center px-6 pt-20">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
              <MapPin className="w-3.5 h-3.5" />
              Live downtown layer
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              Where downtown works
              <br />
              <span className="text-primary">like a system.</span>
            </h1>
            
            <p className="text-muted-foreground text-lg md:text-xl max-w-lg mx-auto mb-10 text-pretty">
              Open the live map, see what is useful nearby, and act in one tap.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/downtown-perks/explore"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors min-w-[180px] justify-center"
              >
                Open the Map
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/downtown-perks/for-buildings"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border text-foreground font-medium hover:bg-muted/50 transition-colors"
              >
                See Partner Value
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Three Beats - No Cards */}
      <section className="py-20 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center md:text-left"
            >
              <Users className="w-6 h-6 text-primary mb-4 mx-auto md:mx-0" />
              <h3 className="font-heading text-lg font-semibold mb-2">For Residents</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Find what is useful nearby. See live events, local perks, and places worth walking to.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center md:text-left"
            >
              <Building2 className="w-6 h-6 text-primary mb-4 mx-auto md:mx-0" />
              <h3 className="font-heading text-lg font-semibold mb-2">For Buildings</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                See what residents engage with. Turn neighborhood activity into a measurable amenity.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center md:text-left"
            >
              <Store className="w-6 h-6 text-primary mb-4 mx-auto md:mx-0" />
              <h3 className="font-heading text-lg font-semibold mb-2">For Partners</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Measure local demand. Reach residents who are already looking for what you offer.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-16 px-6 border-t border-border/40">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-heading text-2xl font-bold mb-4">Ready to explore?</h2>
          <p className="text-muted-foreground mb-6">
            The map shows what is happening right now.
          </p>
          <Link
            to="/downtown-perks/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Open the Map
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
