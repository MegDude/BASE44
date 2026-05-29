import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function BrandSection({ label, title, children, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className={`py-20 px-5 border-t border-border/40 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {(label || title) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="mb-12"
          >
            {label && (
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">
                {label}
              </span>
            )}
            {title && (
              <h2 className="font-heading text-3xl md:text-4xl font-medium leading-[1.15] tracking-normal max-w-2xl">
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

export function SignalCard({ icon, label, value, sub, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="p-6 rounded-lg border border-border/60 bg-card/60 hover:border-border transition-all"
    >
      {icon && <div className="text-primary mb-3 opacity-70">{icon}</div>}
      {value && (
        <div className="font-heading text-3xl font-medium text-foreground mb-1 tracking-normal">
          {value}
        </div>
      )}
      <div className="text-[13px] font-medium text-foreground mb-1">{label}</div>
      {sub && <div className="text-[12px] text-muted-foreground leading-relaxed">{sub}</div>}
    </motion.div>
  );
}

export function FlowCard({ step, title, desc, delay = 0 }) {
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
        <div className="font-medium text-foreground text-[13px] mb-1.5">{title}</div>
        <div className="text-[13px] text-muted-foreground leading-relaxed">{desc}</div>
      </div>
    </motion.div>
  );
}

export function UseCaseCard({ title, detail, tag, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="p-6 rounded-lg border border-border/60 bg-card/40 hover:border-primary/20 transition-all"
    >
      {tag && (
        <span className="inline-block text-[11px] font-medium text-primary/70 uppercase tracking-[0.12em] mb-3">
          {tag}
        </span>
      )}
      <h4 className="font-heading font-medium text-[14px] mb-2.5 text-foreground">{title}</h4>
      <p className="text-[13px] text-muted-foreground leading-relaxed">{detail}</p>
    </motion.div>
  );
}

export function BrandCTA({ headline, sub, ctaLabel, ctaHref }) {
  return (
    <section className="py-24 px-5 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-heading text-3xl md:text-4xl font-medium leading-[1.15] tracking-normal"
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
              <p className="text-muted-foreground text-[14px] leading-relaxed">{sub}</p>
            )}
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <a
                href={ctaHref || "mailto:partners@downtownperks.com"}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all duration-300"
              >
                {ctaLabel || "Start the Conversation"}
              </a>
              <a
                href="/downtown-perks/for-buildings"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/70 text-foreground/70 font-medium text-[13px] hover:text-foreground transition-all duration-300"
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