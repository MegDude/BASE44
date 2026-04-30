import type { ReactNode } from "react";
import clsx from "clsx";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: "default" | "subtle" | "dark";
};

const toneMap = {
  default: "bg-transparent",
  subtle: "bg-white/30",
  dark: "bg-slate-900 text-white",
};

export function Section({
  id,
  children,
  className,
  tone = "default",
}: SectionProps) {
  return (
    <section
      id={id}
      className={clsx("relative py-16 md:py-24", toneMap[tone], className)}
    >
      {children}
    </section>
  );
}
