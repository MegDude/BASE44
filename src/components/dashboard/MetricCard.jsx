import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetricCard({ label, value, unit, trend, trendValue, description, highlight = false }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? '#16a34a' : trend === 'down' ? '#dc2626' : 'var(--dp-slate)';

  return (
    <div
      className="p-5 rounded-xl border transition-shadow hover:shadow-md"
      style={{
        backgroundColor: highlight ? 'var(--dp-navy)' : 'var(--dp-card)',
        borderColor: highlight ? 'transparent' : 'var(--dp-border)',
        boxShadow: highlight ? '0 8px 32px rgba(17,31,61,0.15)' : undefined,
      }}
      role="article"
      aria-label={`${label}: ${value}${unit ?? ''}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: highlight ? 'rgba(207,175,90,0.85)' : 'var(--dp-slate)' }}>
        {label}
      </p>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-3xl font-semibold tracking-tight" style={{ color: highlight ? 'white' : 'var(--dp-navy)' }}>
            {value}{unit && <span className="text-lg ml-0.5 font-normal" style={{ color: highlight ? 'rgba(255,255,255,0.6)' : 'var(--dp-slate)' }}>{unit}</span>}
          </p>
          {description && <p className="text-xs mt-1" style={{ color: highlight ? 'rgba(255,255,255,0.5)' : 'var(--dp-slate)' }}>{description}</p>}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-medium" style={{ color: highlight ? 'rgba(207,175,90,0.9)' : trendColor }}>
            <TrendIcon className="h-4 w-4" aria-hidden="true" />
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
