import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function BrandHero({ eyebrow, headline, support, ctaLabel, ctaHref, demoPanel, bgAccent = "from-primary/10" }) {
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${bgAccent} via-transparent to-transparent pointer-events-none`} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Link to="/brands" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Partners
          </Link>
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium tracking-wider uppercase mb-6">
            {eyebrow}
          </div>
          <h1 className="font-heading text-5xl md:text-7xl font-bold leading-none tracking-tight mb-6 max-w-4xl">
            {headline}
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            {support}
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link
              to={ctaHref || "/downtown-perks/card"}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/25"
            >
              {ctaLabel || "Get Started"} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/downtown-perks/for-buildings"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-all"
            >
              View Partnership Details
            </Link>
          </div>
        </motion.div>

        {demoPanel && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20"
          >
            {demoPanel}
          </motion.div>
        )}
      </div>
    </section>
  );
}