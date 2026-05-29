import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-28 px-5 border-t border-border/40">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">
              Your Neighborhood
            </span>
            <h2 className="font-heading text-4xl md:text-4xl font-medium leading-[1.1] tracking-normal">
              Everything around you
              <br />
              <em className="text-primary">is already alive.</em>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6"
          >
            <p className="text-muted-foreground text-[14px] leading-relaxed">
              Stop scrolling. Start moving. Your neighborhood is waiting — and Downtown Perks is the layer that makes it legible.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3 pt-2">
              <Link
                to="/downtown-perks/card"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all duration-300 shadow-md shadow-primary/15"
              >
                Get Your Perks Card
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/brands"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/70 text-foreground/70 font-medium text-[13px] hover:text-foreground hover:border-border transition-all duration-300"
              >
                See Partner Brands
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}