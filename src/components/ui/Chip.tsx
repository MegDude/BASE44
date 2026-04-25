import clsx from "clsx";

type ChipProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
};

export function Chip({ label, selected = false, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex h-9 items-center rounded-full border px-3 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20",
        selected
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-100",
        className
      )}
    >
      {label}
    </button>
  );
}
