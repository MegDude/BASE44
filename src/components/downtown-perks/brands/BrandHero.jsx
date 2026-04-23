import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useCTAFlow } from "@/components/cta/CTAFlowProvider";

export default function BrandHero({ eyebrow = "", headline = "", support = "", ctaLabel = "Get Started", ctaHref = "/downtown-perks/card", demoPanel = null, bgAccent = "from-primary/5" }) {
  const location = useLocation();
  const { openFlow } = useCTAFlow();
  const isMailto = String(ctaHref || "").startsWith("mailto:");

  return (
    <section className="relative pt-36 pb-20 px-6 overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-64 bg-gradient-to-b ${bgAccent} to-transparent pointer-events-none`} />
      <div className="relative max-w-6xl mx-auto">

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/brands" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary transition-colors mb-10 group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            Partner Directory
          </Link>
        </motion.div>

        <div className={`grid grid-cols-1 ${demoPanel ? "md:grid-cols-2" : ""} gap-16 items-start`}>
          {/* Left — copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">
                {eyebrow}
              </span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1] tracking-tight mb-6 text-foreground">
                {headline}
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed mb-10 max-w-lg">
                {support}
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-3">
                {isMailto ? (
                  <button
                    type="button"
                    onClick={() =>
                      openFlow({
                        type: "brand_campaign",
                        source: `brand_hero_${location.pathname}`,
                        sourceComponent: "BrandHero",
                        partnerType: "brands",
                        pageContext: {
                          campaignName: headline,
                          objective: support,
                        },
                        successRoute: "/partners/brands",
                      })
                    }
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all duration-300 shadow-md shadow-primary/15"
                  >
                    {ctaLabel || "Get Started"} <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                <Link
                  to={ctaHref || "/downtown-perks/card"}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all duration-300 shadow-md shadow-primary/15"
                >
                  {ctaLabel || "Get Started"} <ArrowRight className="w-4 h-4" />
                </Link>
                )}
                <Link
                  to="/downtown-perks/for-buildings"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground hover:border-border transition-all duration-300"
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
