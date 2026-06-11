import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function BrandHero({ eyebrow, headline, support, ctaLabel, ctaHref, demoPanel }) {
  return (
    <section className="dp-editorial-page-section dp-editorial-hero relative overflow-hidden">
      <div className="dp-editorial-rail relative">

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/brands" className="dp-editorial-back group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            Partner Directory
          </Link>
        </motion.div>

        <div className={`grid grid-cols-1 ${demoPanel ? "md:grid-cols-[minmax(0,0.92fr)_minmax(280px,0.72fr)]" : ""} gap-10 md:gap-16 items-start`}>
          {/* Left — copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <span className="dp-editorial-kicker">
                {eyebrow}
              </span>
              <h1 className="dp-editorial-hero-title">
                {headline}
              </h1>
              <p className="dp-editorial-meaning mb-8 max-w-xl">
                {support}
              </p>
              <div className="dp-editorial-actions">
                <a
                  to={ctaHref || "/downtown-perks/card"}
                  href={ctaHref || "/downtown-perks/card"}
                  className="dp-editorial-action"
                >
                  {ctaLabel || "Open Downtown Perks"} <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  to="/downtown-perks/for-buildings"
                  className="dp-editorial-action is-muted"
                >
                  Partnership Details
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right — demo panel */}
          {demoPanel && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {demoPanel}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
