const METRICS = [
  { label: "Impressions", value: "128,540", delta: "+18.4%" },
  { label: "Clicks", value: "4,732", delta: "+12.7%" },
  { label: "Redemptions", value: "782", delta: "+9.3%" },
  { label: "Engagement rate", value: "3.68%", delta: "+0.6%" }
];

export default function DashboardMetricGrid() {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {METRICS.map((metric) => (
        <div key={metric.label} className="dp-card-compact p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--dp-text-soft)]">
            {metric.label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-[var(--dp-navy)]">{metric.value}</p>
          <p className="mt-1 text-sm font-medium text-emerald-700">{metric.delta} vs last 30 days</p>
        </div>
      ))}
    </div>
  );
}
