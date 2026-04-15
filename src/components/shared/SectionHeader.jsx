import { motion } from "framer-motion";
import { TYPOGRAPHY, MOTION } from "@/lib/design-system";

/**
 * SectionHeader — Unified section entry component
 * Used for all major section breaks, narrative transitions, and group headers
 */
export default function SectionHeader({
  eyebrow,
  headline,
  intro,
  align = "left",
  size = "standard", // standard | large | small
}) {
  const headlineClass = {
    standard: TYPOGRAPHY.sectionHeadline,
    large: TYPOGRAPHY.heroHeadline,
    small: TYPOGRAPHY.subsectionHeadline,
  }[size];

  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align];

  return (
    <motion.div
      {...MOTION.sectionReveal}
      className={`${alignClass}`}
    >
      {eyebrow && (
        <span className={`${TYPOGRAPHY.uiTiny} text-primary/70 block mb-4`}>
          {eyebrow}
        </span>
      )}

      <h2 className={`${headlineClass} text-foreground mb-4`}>
        {headline}
      </h2>

      {intro && (
        <p className={`${TYPOGRAPHY.bodyLarge} text-muted-foreground max-w-2xl ${align === "center" ? "mx-auto" : ""}`}>
          {intro}
        </p>
      )}
    </motion.div>
  );
}