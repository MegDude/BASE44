import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div className="pt-24 pb-20 px-6 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-widest">
            The Vision
          </span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mt-4 mb-8 leading-tight">
            The operating system
            <br />
            <span className="text-primary">for downtown life.</span>
          </h1>
        </motion.div>

        {/* Narrative blocks */}
        <div ref={ref} className="space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-heading text-2xl font-bold mb-4">The Shift</h2>
            <p className="text-secondary-foreground leading-relaxed mb-4">
              Downtown Perks isn't a perks program. It isn't a map. It isn't a
              community app. It isn't a building amenity.
            </p>
            <p className="text-secondary-foreground leading-relaxed">
              It <em className="text-primary font-medium">uses</em> all of
              those. But the real idea is bigger:{" "}
              <strong className="text-foreground">
                Downtown Perks is the operating system for downtown life.
              </strong>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-heading text-2xl font-bold mb-4">
              The Real Problem
            </h2>
            <p className="text-secondary-foreground leading-relaxed mb-4">
              The issue isn't "people don't know what to do." The issue is:{" "}
              <strong className="text-foreground">
                downtown has density without connection.
              </strong>
            </p>
            <p className="text-secondary-foreground leading-relaxed">
              Thousands of people. Hundreds of places. Zero shared layer tying
              them together. Isolated residents. Underutilized businesses.
              Buildings that feel interchangeable.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-2xl border border-primary/20 bg-primary/5"
          >
            <p className="font-heading text-xl md:text-2xl font-bold leading-relaxed text-center">
              "A live, member-powered layer over the city that connects where you
              live to what you do —{" "}
              <span className="text-primary">in real time.</span>"
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            <h2 className="font-heading text-2xl font-bold mb-4">
              The Human Layer
            </h2>
            <p className="text-secondary-foreground leading-relaxed mb-4">
              This is not a social network. This is not a dating app. This is a
              system where people{" "}
              <strong className="text-foreground">
                naturally run into each other again
              </strong>
              .
            </p>
            <p className="text-secondary-foreground leading-relaxed">
              Familiar faces. Repeated interactions. Shared routines. That's
              what creates real community — without forcing it. Downtown Perks
              is a digital overlay that restores "village energy" to vertical
              urban living.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
          >
            <h2 className="font-heading text-2xl font-bold mb-4">
              The Product Truth
            </h2>
            <p className="text-secondary-foreground leading-relaxed mb-4">
              People don't want more options. More apps. More feeds. They want{" "}
              <strong className="text-foreground">
                confidence in what to do next.
              </strong>
            </p>
            <p className="text-secondary-foreground leading-relaxed">
              That's the wedge. Timing + proximity + membership in one system.
              That's what no one else has. The map is the interface. The system
              is the product.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
          >
            <h2 className="font-heading text-2xl font-bold mb-4">
              The Category
            </h2>
            <p className="text-secondary-foreground leading-relaxed mb-4">
              Downtown Perks is not Yelp. Not ClassPass. Not Eventbrite. Not
              BuildingLink. Not a loyalty app.
            </p>
            <p className="text-secondary-foreground leading-relaxed">
              It's{" "}
              <strong className="text-foreground">
                the real-time neighborhood layer for cities.
              </strong>{" "}
              The infrastructure for how people experience downtown.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7 }}
            className="p-8 rounded-2xl bg-card border border-border"
          >
            <h2 className="font-heading text-2xl font-bold mb-4">
              The Emotional Story
            </h2>
            <blockquote className="text-muted-foreground italic text-lg leading-relaxed mb-4">
              "You live in one of the most dense, vibrant parts of the city…
              and still feel like you're doing it alone."
            </blockquote>
            <p className="text-foreground font-medium text-lg">
              Downtown Perks flips that to: "Everything around you is alive,
              connected, and easier to step into."
            </p>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20 text-center"
        >
          <Link
            to="/downtown-perks/explore"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30"
          >
            Explore the System
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}