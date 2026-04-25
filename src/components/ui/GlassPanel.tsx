import type { ElementType, ReactNode } from "react";
import clsx from "clsx";

type GlassPanelProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  padding?: "sm" | "md" | "lg";
};

const paddingMap = {
  sm: "p-4",
  md: "p-5 md:p-6",
  lg: "p-6 md:p-8",
};

export function GlassPanel({
  as: Comp = "div",
  children,
  className,
  interactive = false,
  padding = "md",
}: GlassPanelProps) {
  return (
    <Comp
      className={clsx(
        "rounded-3xl border border-white/40 bg-white/65 backdrop-blur-xl shadow-[0_8px_30px_rgba(15,23,42,0.08)]",
        paddingMap[padding],
        interactive &&
          "transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(15,23,42,0.12)]",
        className
      )}
    >
      {children}
    </Comp>
  );
}
