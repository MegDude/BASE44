import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLocation } from "react-router-dom";
import { useCTAFlow } from "@/components/cta/CTAFlowProvider";

export function BrandSection({ label = "", title = "", children, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className={`py-16 md:py-20 px-6 border-t border-border/40 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {(label || title) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="mb-12"
          >
            {label && (
              <span className="dp-micro-label block mb-4">
                {label}
              </span>
            )}
            {title && (
              <h2 className="dp-display-section max-w-3xl text-[2rem] text-foreground md:text-[2.8rem]">
                {title}
              </h2>
            )}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}

export function SignalCard({ icon = null, label = "", value = "", sub = "", delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="dp-card rounded-[var(--radius)] p-6 transition-all hover:border-border"
    >
      {icon && <div className="text-primary mb-3 opacity-70">{icon}</div>}
      {value && (
        <div className="font-heading text-3xl font-medium text-foreground mb-1 tracking-tight">
          {value}
        </div>
      )}
      <div className="text-sm font-medium text-foreground mb-1">{label}</div>
      {sub && <div className="text-[12px] text-muted-foreground leading-relaxed">{sub}</div>}
    </motion.div>
  );
}

export function FlowCard({ step = "", title = "", desc = "", delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="flex gap-5 p-6 border-b border-border/40 last:border-b-0"
    >
      <div className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-primary font-heading font-medium text-[12px]">{step}</span>
      </div>
      <div>
        <div className="font-medium text-foreground text-sm mb-1.5">{title}</div>
        <div className="text-[13px] text-muted-foreground leading-relaxed">{desc}</div>
      </div>
    </motion.div>
  );
}

export function UseCaseCard({ title = "", detail = "", tag = "", delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="dp-card rounded-[var(--radius)] p-6 transition-all hover:border-primary/20"
    >
      {tag && (
        <span className="dp-micro-label mb-3 inline-block">
          {tag}
        </span>
      )}
      <h4 className="font-heading font-medium text-base mb-2.5 text-foreground">{title}</h4>
      <p className="text-[13px] text-muted-foreground leading-relaxed">{detail}</p>
    </motion.div>
  );
}

export function BrandCTA({ headline = "", sub = "", ctaLabel = "Get Your Card", ctaHref = "mailto:partners@downtownperks.com" }) {
  const location = useLocation();
  const { openFlow } = useCTAFlow();
  const isMailto = String(ctaHref || "").startsWith("mailto:");

  return (
    <section className="py-16 md:py-20 px-6 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="dp-display-section max-w-3xl text-[2rem] text-foreground md:text-[2.8rem]"
          >
            {headline}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-5"
          >
            {sub && (
              <p className="text-muted-foreground text-base leading-relaxed">{sub}</p>
            )}
            <div className="overflow-hidden rounded-[24px] border border-border/50 bg-[rgba(255,255,255,0.62)]">
              {[
                {
                  label: "Conversation starts here",
                  body: "The member sees the brand inside a useful downtown moment instead of through a cold ad or generic directory listing.",
                },
                {
                  label: "Intent gets captured",
                  body: "A scan, save, RSVP, or CTA start creates a cleaner signal than broad awareness because the action is attached to place, timing, and source.",
                },
                {
                  label: "Lead gets handed off",
                  body: "The partner sees which building, event, or corridor produced the response, so follow-up can happen with real context instead of guesswork.",
                },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={`grid gap-3 px-5 py-4 md:grid-cols-[170px_minmax(0,1fr)] ${
                    index < 2 ? "border-b border-border/50" : ""
                  }`}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/70">
                    {item.label}
                  </div>
                  <div className="text-[13px] leading-6 text-muted-foreground">{item.body}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isMailto) {
                    openFlow({
                      type: "brand_campaign",
                      source: `brand_cta_${location.pathname}`,
                      sourceComponent: "BrandCTA",
                      partnerType: "brands",
                      pageContext: {
                        campaignName: headline,
                        objective: sub,
                      },
                      successRoute: "/partners/brands",
                    });
                    return;
                  }
                  window.location.assign(ctaHref || "mailto:partners@downtownperks.com");
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--dp-gold)] px-7 py-3.5 text-sm font-semibold text-[var(--dp-navy)] transition-all duration-180 hover:bg-[var(--dp-gold-deep)]"
              >
                {ctaLabel || "Get Your Card"}
              </button>
              <a
                href="/downtown-perks/for-buildings"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--dp-border)] px-7 py-3.5 text-sm font-medium text-foreground/70 transition-all duration-180 hover:bg-white/70 hover:text-foreground"
              >
                See All Partnerships
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
