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
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20",
    secondary: "border border-border/70 text-foreground/70 hover:text-foreground hover:border-border",
    tertiary: "text-primary hover:text-primary/70",
  };

  const sizes = {
    small: "px-4 py-2 text-[12px]",
    standard: "px-6 py-3 text-[14px]",
    large: "px-8 py-4 text-[15px]",
  };

  const variantClass = variants[variant];
  const sizeClass = sizes[size];

  const classes = `inline-flex items-center gap-2 rounded-full font-medium transition-all duration-200 ${variantClass} ${sizeClass} ${
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
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        {...props}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      <Link to={href} className={classes} onClick={onClick} {...props}>
        {content}
      </Link>
    </motion.div>
  );
}