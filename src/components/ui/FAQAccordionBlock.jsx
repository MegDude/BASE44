import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
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
    ? "bg-[#0B1F33] text-[#F7F8FB]"
    : "bg-background";

  const AccordionList = (
    <div className="divide-y divide-[#0B1F33]/10">
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
      <div className="max-w-6xl mx-auto">
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
              <h2 className={`font-heading text-3xl font-semibold leading-[1.02] tracking-[-0.02em] md:text-[42px] mb-5 ${isDark ? "text-[#F7F8FB]" : "text-[#0B1F33]"}`}>
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
                <h2 className={`font-heading text-3xl font-semibold leading-[1.02] tracking-[-0.02em] md:text-[42px] ${isDark ? "text-[#F7F8FB]" : "text-[#0B1F33]"}`}>
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

  const qColor = isDark
    ? isOpen ? "text-[#B38F4F]" : "text-[#F7F8FB]"
    : isOpen ? "text-[#0B1F33]" : "text-[#0B1F33]/78";

  const numColor = isDark ? "text-[#B38F4F]/70" : "text-[#B38F4F]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="transition-colors"
    >
      <button
        onClick={onToggle}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
        aria-expanded={isOpen}
        className="dp-faq-trigger group flex w-full items-center gap-4 bg-transparent px-0 py-4 text-left transition-colors"
      >
        {/* Number badge */}
        {showNumber && (
          <span className={`w-7 shrink-0 font-body text-[12px] font-semibold tabular-nums tracking-normal ${numColor}`}>
            {numLabel}.
          </span>
        )}

        {/* Tag badge */}
        {item.tag && (
          <span className="shrink-0 text-[11px] font-medium tracking-normal text-[#B38F4F]">
            {item.tag}
          </span>
        )}

        {/* Question */}
        <span className={`flex-1 text-[14px] font-medium leading-snug tracking-normal transition-colors duration-200 ${qColor}`}>
          {item.question}
        </span>

        {/* Icon */}
        <span className={`flex h-5 w-5 shrink-0 items-center justify-center transition-colors duration-300 ${
          isDark ? "text-[#B38F4F]" : "text-[#B38F4F]"
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
            <div className={`pb-4 ${showNumber ? "pl-11" : ""}`}>
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
  const cls = `inline-flex items-center gap-2 border-b py-1 text-[13px] font-medium tracking-normal transition-colors ${
    isDark
      ? "border-[#B38F4F]/55 text-[#F7F8FB] hover:text-[#B38F4F]"
      : "border-[#B38F4F]/55 text-[#0B1F33]/72 hover:text-[#0B1F33]"
  }`;
  if (isExternal) return <a href={href} className={cls}>{label}</a>;
  return <Link to={href} className={cls}>{label}</Link>;
}
