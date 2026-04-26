/**
 * About Page - Simplified narrative, no heavy blocks
 * Three sections: Shift, Problem, Solution
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function About() {
  return (
    <div className="pt-24 pb-20 px-6 min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <span className="text-xs font-medium text-primary uppercase tracking-widest mb-4 block">
            The Vision
          </span>
          <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight mb-4">
            The operating system
            <br />
            <span className="text-primary">for downtown life.</span>
          </h1>
        </motion.div>

        {/* Narrative */}
        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-lg font-semibold mb-3">The Shift</h2>
            <p className="text-muted-foreground leading-relaxed">
              Downtown Perks is not a perks program, a map, or a building amenity. 
              It uses all of those, but the real idea is bigger: a live, 
              member-powered layer over the city that connects where you live 
              to what you do.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-lg font-semibold mb-3">The Problem</h2>
            <p className="text-muted-foreground leading-relaxed">
              Downtown has density without connection. Thousands of people, 
              hundreds of places, and no shared layer tying them together. 
              Isolated residents. Underutilized businesses. Buildings that 
              feel interchangeable.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-lg font-semibold mb-3">The System</h2>
            <p className="text-muted-foreground leading-relaxed">
              The map is live. What you see is what is happening now. 
              Venues update in real time. Perks appear when they are active. 
              Events show up when they start. The whole thing moves with the city.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="pt-6 border-t border-border/40"
          >
            <p className="text-foreground font-medium text-lg italic text-center">
              "A live layer that connects where you live to what you do
              — in real time."
            </p>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link
            to="/downtown-perks/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Open the Map
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
