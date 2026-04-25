type StatPillProps = {
  label: string;
};

export function StatPill({ label }: StatPillProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm text-slate-700">
      {label}
    </span>
  );
}
