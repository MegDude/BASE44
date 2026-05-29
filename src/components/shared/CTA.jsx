import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * CTA — Unified call-to-action button component
 * Variants: primary, secondary, tertiary
 * Handles both Link and anchor for internal/external routes
 */
export default function CTA({
  label,
  href = "#",
  variant = "primary",
  size = "standard",
  icon = true,
  external = false,
  onClick,
  disabled = false,
  ...props
}) {
  const variants = {
    primary: "border-b border-[#B38F4F]/55 text-[#0B1F33] hover:border-[#B38F4F]",
    secondary: "border-b border-[#0B1F33]/12 text-[#0B1F33]/68 hover:border-[#B38F4F]/55 hover:text-[#0B1F33]",
    tertiary: "text-[#0B1F33]/68 hover:text-[#0B1F33]",
  };

  const sizes = {
    small: "min-h-7 text-[11px]",
    standard: "min-h-8 text-[12px]",
    large: "min-h-8 text-[12px]",
  };

  const variantClass = variants[variant];
  const sizeClass = sizes[size];

  const classes = `inline-flex items-center justify-center gap-1.5 rounded-none bg-transparent px-0 font-semibold uppercase tracking-[0.09em] shadow-none transition-all duration-300 ${variantClass} ${sizeClass} ${
    disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
  }`;

  const content = (
    <>
      {label}
      {icon && <ArrowRight className="w-4 h-4" />}
    </>
  );

  if (external || href.startsWith("http") || href.startsWith("mailto")) {
    return (
      <motion.a
        href={href}
        className={classes}
        whileHover={!disabled ? { y: -1 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
        {...props}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div
      whileHover={!disabled ? { y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
    >
      <Link to={href} className={classes} onClick={onClick} {...props}>
        {content}
      </Link>
    </motion.div>
  );
}
