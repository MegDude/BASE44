import React from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  soft: "bg-white/58 border-white/55 shadow-[0_18px_60px_rgba(15,23,42,0.08)]",
  elevated: "bg-white/70 border-white/70 shadow-[0_24px_90px_rgba(15,23,42,0.14)]",
  dense: "bg-slate-950/78 border-white/10 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)]",
  floating: "bg-white/64 border-white/70 shadow-[0_16px_50px_rgba(15,23,42,0.12)]",
  modal: "bg-white/82 border-white/80 shadow-[0_32px_120px_rgba(15,23,42,0.22)]",
};

const radiusClasses = {
  sm: "rounded-2xl",
  md: "rounded-[1.35rem]",
  lg: "rounded-[1.75rem]",
  xl: "rounded-[2rem]",
};

export default function GlassPanel({
  as: Component = "section",
  variant = "soft",
  radius = "lg",
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        "relative overflow-hidden border backdrop-blur-2xl supports-[backdrop-filter]:bg-white/55",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(255,255,255,0.55),rgba(255,255,255,0.08))] before:opacity-70",
        variantClasses[variant] || variantClasses.soft,
        radiusClasses[radius] || radiusClasses.lg,
        className
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
