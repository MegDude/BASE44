import { motion } from "framer-motion";
import { SURFACES } from "@/lib/design-system";

/**
 * PremiumCard — Unified card surface for consistent content modules
 * Variants: primary (default), muted (secondary), glass (overlays)
 */
export default function PremiumCard({
  children,
  variant = "primary",
  hover = true,
  className = "",
  ...props
}) {
  const variants = {
    primary: SURFACES.cardPrimary,
    muted: SURFACES.cardMuted,
    glass: SURFACES.glassLight,
    glassDark: SURFACES.glassDark,
    brutalist: SURFACES.brutalistDark,
  };

  const variantClass = variants[variant] || variants.primary;
  const hoverClass = hover ? "hover:shadow-md transition-shadow duration-200" : "";

  return (
    <motion.div
      whileHover={hover ? { y: -2 } : {}}
      transition={{ duration: 0.2 }}
      className={`${variantClass} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}