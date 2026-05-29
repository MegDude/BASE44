import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Plus, Minus, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * FAQAccordionBlock — reusable Downtown Perks FAQ module
 *
 * Props:
 *   sectionTitle      string
 *   sectionEyebrow    string
 *   sectionIntro      string
 *   items             Array<{ id, question, answer, linkLabel?, linkHref?, tag? }>
 *   styleVariant      "default" | "card" | "split" | "dark-panel"
 *   showNumbers       boolean
 *   allowMultipleOpen boolean
 *   defaultOpenIndex  number | null
 *   pageType          "homepage" | "partners" | "residential" | "hospitality" | "venues" | "brands" | "civic"
 *   backgroundVariant "light" | "dark"
 *   ctaLabel          string
 *   ctaHref           string
 */

export default function FAQAccordionBlock({
  sectionTitle = "Questions, answered simply",
  sectionEyebrow = "FAQ",
  sectionIntro = "",
  items = [],
  styleVariant = "default",
  showNumbers = false,
  allowMultipleOpen = false,
  defaultOpenIndex = null,
  pageType = "homepage",
  backgroundVariant = "light",
  ctaLabel,
  ctaHref,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const [openSet, setOpenSet] = useState(() => {
    if (defaultOpenIndex !== null && defaultOpenIndex !== undefined) {
      return new Set([defaultOpenIndex]);
    }
    return new Set();
  });

  function toggle(i) {
    setOpenSet(prev => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        if (!allowMultipleOpen) next.clear();
        next.add(i);
      }
      return next;
    });
  }

  const isDark = styleVariant === "dark-panel";
  const isCard = styleVariant === "card";
  const isSplit = styleVariant === "split";

  const sectionBg = isDark
    ? "bg-[#081521] text-[#F7F8FB]"
    : "bg-background";

  const AccordionList = (
    <div className={isCard ? "space-y-2" : "divide-y divide-border/40"}>
      {items.map((item, i) => {
        const isOpen = openSet.has(i);
        return (
          <FAQItem
            key={item.id || i}
            item={item}
            index={i}
            isOpen={isOpen}
            onToggle={() => toggle(i)}
            showNumber={showNumbers}
            isDark={isDark}
            isCard={isCard}
            isInView={isInView}
            delay={i * 0.06}
          />
        );
      })}
    </div>
  );

  return (
    <section
      ref={ref}
      className={`py-14 px-5 border-t border-border/40 ${sectionBg}`}
    >
      <div className="max-w-5xl mx-auto">
        {isSplit ? (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-10 items-start">
            {/* Left: intro */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="md:sticky md:top-28"
            >
              {sectionEyebrow && (
                <span className={`text-[11px] font-medium uppercase tracking-[0.16em] block mb-4 ${isDark ? "text-primary/70" : "text-primary/70"}`}>
                  {sectionEyebrow}
                </span>
              )}
              <h2 className={`font-heading text-3xl md:text-4xl font-medium leading-[1.1] tracking-normal mb-5 ${isDark ? "text-[#F7F8FB]" : "text-foreground"}`}>
                {sectionTitle}
              </h2>
              {sectionIntro && (
                <p className={`text-[13px] leading-relaxed mb-8 ${isDark ? "text-[rgba(255,255,255,0.70)]" : "text-muted-foreground"}`}>
                  {sectionIntro}
                </p>
              )}
              {ctaLabel && ctaHref && (
                <CTAButton label={ctaLabel} href={ctaHref} isDark={isDark} />
              )}
            </motion.div>
            {/* Right: accordion */}
            <div>{AccordionList}</div>
          </div>
        ) : (
          <>
            {/* Stacked header */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="mb-10"
            >
              {sectionEyebrow && (
                <span className={`text-[11px] font-medium uppercase tracking-[0.16em] block mb-4 ${isDark ? "text-primary/70" : "text-primary/70"}`}>
                  {sectionEyebrow}
                </span>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <h2 className={`font-heading text-3xl md:text-4xl font-medium leading-[1.1] tracking-normal ${isDark ? "text-[#F7F8FB]" : "text-foreground"}`}>
                  {sectionTitle}
                </h2>
                {sectionIntro && (
                  <p className={`text-[13px] leading-relaxed ${isDark ? "text-[rgba(255,255,255,0.65)]" : "text-muted-foreground"}`}>
                    {sectionIntro}
                  </p>
                )}
              </div>
            </motion.div>

            {AccordionList}

            {ctaLabel && ctaHref && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <CTAButton label={ctaLabel} href={ctaHref} isDark={isDark} />
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ─── FAQ ITEM ────────────────────────────────────────────────────────────────

function FAQItem({ item, index, isOpen, onToggle, showNumber, isDark, isCard, isInView, delay }) {
  const numLabel = String(index + 1).padStart(2, "0");

  const wrapClass = isCard
    ? `rounded-xl border transition-all duration-300 overflow-hidden ${
        isOpen
          ? isDark
            ? "border-white/10 bg-[#0B1F33] shadow-[0_16px_44px_rgba(11,31,51,0.16)]"
            : "border-[#0B1F33]/8 bg-card shadow-[0_12px_40px_rgba(11,31,51,0.05)]"
          : isDark
            ? "border-white/10 bg-[#0B1F33]/72"
            : "border-border/50 bg-card/60 hover:border-border"
      }`
    : `transition-colors ${isOpen && !isDark ? "bg-muted/30 rounded-lg" : ""}`;

  const qColor = isDark
    ? isOpen ? "text-[#B38F4F]" : "text-[#F7F8FB]"
    : isOpen ? "text-primary" : "text-foreground";

  const numColor = isDark ? "text-primary/50" : "text-primary/40";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className={wrapClass}
    >
      <button
        onClick={onToggle}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
        aria-expanded={isOpen}
        className={`w-full flex items-center gap-4 text-left transition-colors ${
          isCard ? "px-5 py-4" : "px-2 py-4"
        } group`}
      >
        {/* Number badge */}
        {showNumber && (
          <span className={`font-heading text-[13px] font-medium w-7 shrink-0 tabular-nums ${numColor}`}>
            {numLabel}.
          </span>
        )}

        {/* Tag badge */}
        {item.tag && (
          <span className="text-[10px] font-medium text-primary/60 border border-primary/20 px-2 py-0.5 rounded-full shrink-0 uppercase tracking-[0.1em]">
            {item.tag}
          </span>
        )}

        {/* Question */}
        <span className={`flex-1 font-medium text-[14px] leading-snug transition-colors duration-200 ${qColor}`}>
          {item.question}
        </span>

        {/* Icon */}
        <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? isDark ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
            : isDark ? "bg-white/10 text-[rgba(255,255,255,0.55)]" : "bg-muted text-muted-foreground"
        }`}>
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <Plus className="w-3.5 h-3.5" />
          </motion.div>
        </span>
      </button>

      {/* Answer */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <div className={`${isCard ? "px-5 pb-4" : "px-2 pb-4"} ${showNumber ? "pl-11" : ""}`}>
              <p className={`text-[13px] leading-relaxed ${isDark ? "text-[rgba(255,255,255,0.65)]" : "text-muted-foreground"}`}>
                {item.answer}
              </p>
              {item.linkLabel && item.linkHref && (
                <a
                  href={item.linkHref}
                  className="inline-flex items-center gap-1.5 mt-4 text-[12px] font-medium text-primary hover:underline underline-offset-4 transition-colors"
                >
                  {item.linkLabel} →
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── CTA BUTTON ──────────────────────────────────────────────────────────────

function CTAButton({ label, href, isDark }) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto");
  const cls = `inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-[13px] transition-all ${
    isDark
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-border/70 text-foreground/70 hover:text-foreground hover:border-border"
  }`;
  if (isExternal) return <a href={href} className={cls}>{label}</a>;
  return <Link to={href} className={cls}>{label}</Link>;
}
