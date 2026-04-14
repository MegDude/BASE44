import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function BrandSection({ label, title, children, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className={`py-24 px-6 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {(label || title) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="mb-14"
          >
            {label && (
              <span className="text-primary text-xs font-medium uppercase tracking-widest block mb-3">
                {label}
              </span>
            )}
            {title && (
              <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight max-w-3xl">
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
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
    >
      {icon && <div className="text-primary mb-3">{icon}</div>}
      {value && <div className="font-heading text-3xl font-bold text-foreground mb-1">{value}</div>}
      <div className="font-semibold text-sm text-foreground mb-1">{label}</div>
      {sub && <div className="text-xs text-muted-foreground leading-relaxed">{sub}</div>}
    </motion.div>
  );
}

export function FlowCard({ step, title, desc, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="flex gap-5 p-6 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all"
    >
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-primary font-heading font-bold text-sm">{step}</span>
      </div>
      <div>
        <div className="font-semibold text-foreground mb-1.5">{title}</div>
        <div className="text-sm text-muted-foreground leading-relaxed">{desc}</div>
      </div>
    </motion.div>
  );
}

export function UseCaseCard({ title, detail, tag, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="p-7 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group"
    >
      {tag && (
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
          {tag}
        </span>
      )}
      <h4 className="font-heading font-bold text-lg mb-3 group-hover:text-primary transition-colors">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{detail}</p>
    </motion.div>
  );
}

export function BrandCTA({ headline, sub, ctaLabel, ctaHref }) {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="relative max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-heading text-4xl md:text-5xl font-bold mb-6 leading-tight"
        >
          {headline}
        </motion.h2>
        {sub && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-muted-foreground text-lg mb-10"
          >
            {sub}
          </motion.p>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href={ctaHref || "mailto:partners@downtownperks.com"}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30"
          >
            {ctaLabel || "Start the Conversation"}
          </a>
          <a
            href="/downtown-perks/for-buildings"
            className="px-8 py-4 rounded-full border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-all"
          >
            See All Partnerships
          </a>
        </motion.div>
      </div>
    </section>
  );
}