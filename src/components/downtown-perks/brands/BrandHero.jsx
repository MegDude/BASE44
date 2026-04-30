import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useCTAFlow } from "@/components/cta/CTAFlowProvider";

export default function BrandHero({ eyebrow = "", headline = "", support = "", ctaLabel = "Get Started", ctaHref = "/card", demoPanel = null, bgAccent = "from-primary/5" }) {
  const location = useLocation();
  const { openFlow } = useCTAFlow();
  const isMailto = String(ctaHref || "").startsWith("mailto:");

  return (
    <section className="px-4 py-8 md:px-6 md:py-10">
      <div className="dp-page-shell">

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/brands" className="inline-flex items-center gap-1.5 text-[12px] text-[rgba(11,31,51,0.56)] hover:text-[var(--dp-navy)] transition-colors mb-6 group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            Partner Directory
          </Link>
        </motion.div>

        <div className={`dp-band grid grid-cols-1 ${demoPanel ? "md:grid-cols-2" : ""} gap-10 items-start p-6 md:p-10`}>
          {/* Left — copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <span className="dp-micro-label block mb-4">
                {eyebrow}
              </span>
              <h1 className="dp-display-hero mb-6 text-[2.5rem] md:text-[4rem] text-[var(--dp-navy)]">
                {headline}
              </h1>
              <p className="mb-10 max-w-lg text-[15px] leading-7 text-[rgba(11,31,51,0.68)]">
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
                    className="dp-cta-primary"
                  >
                    {ctaLabel || "Get Started"} <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                <Link
                  to={ctaHref || "/card"}
                  className="dp-cta-primary"
                >
                  {ctaLabel || "Get Started"} <ArrowRight className="w-4 h-4" />
                </Link>
                )}
                <Link
                  to="/partners/properties"
                  className="dp-cta-secondary"
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
