import clsx from "clsx";

type BadgePillProps = {
  label: string;
  variant?: "gold" | "navy" | "soft";
};

const variantMap = {
  gold: "bg-amber-100 text-amber-700 border border-amber-200/70",
  navy: "bg-slate-900 text-white border border-slate-900",
  soft: "bg-slate-100 text-slate-700 border border-slate-200",
};

export function BadgePill({ label, variant = "soft" }: BadgePillProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variantMap[variant]
      )}
    >
      {label}
    </span>
  );
}
