import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function BrandSection({ label, title, children, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className={`dp-editorial-page-section ${className}`}>
      <div className="dp-editorial-rail">
        {(label || title) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="dp-editorial-section-heading"
          >
            {label && (
              <span className="dp-editorial-kicker">
                {label}
              </span>
            )}
            {title && (
              <h2 className="dp-editorial-section-title">
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
      className="dp-editorial-row"
    >
      {icon && <div className="dp-editorial-row-icon">{icon}</div>}
      {value && (
        <div className="dp-editorial-row-value">
          {value}
        </div>
      )}
      <div className="dp-editorial-row-title">{label}</div>
      {sub && <div className="dp-editorial-row-copy">{sub}</div>}
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
      className="dp-editorial-step"
    >
      <span className="dp-editorial-step-number">{step}</span>
      <div>
        <div className="dp-editorial-row-title">{title}</div>
        <div className="dp-editorial-row-copy">{desc}</div>
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
      className="dp-editorial-row"
    >
      {tag && (
        <span className="dp-editorial-row-context">
          {tag}
        </span>
      )}
      <h4 className="dp-editorial-row-title">{title}</h4>
      <p className="dp-editorial-row-copy">{detail}</p>
    </motion.div>
  );
}

export function BrandCTA({ headline, sub, ctaLabel, ctaHref }) {
  return (
    <section className="dp-editorial-page-section">
      <div className="dp-editorial-rail">
        <div className="dp-editorial-contact">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="dp-editorial-section-title"
          >
            {headline}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="dp-editorial-contact-copy"
          >
            {sub && (
              <p className="dp-editorial-meaning">{sub}</p>
            )}
            <div className="dp-editorial-actions">
              <a
                href={ctaHref || "mailto:partners@downtownperks.com"}
                className="dp-editorial-action"
              >
                {ctaLabel || "Start the Conversation"} →
              </a>
              <a
                href="/downtown-perks/for-buildings"
                className="dp-editorial-action is-muted"
              >
                See All Partnerships →
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
