export default function MetricPill({ value, label }) {
  return (
    <div className="rounded-full border border-[rgba(15,23,42,0.10)] bg-white px-4 py-2">
      <div className="text-[13px] font-semibold text-[var(--dp-navy,#111827)]">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">{label}</div>
    </div>
  );
}
