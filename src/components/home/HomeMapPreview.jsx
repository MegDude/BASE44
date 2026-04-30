import { Link } from "react-router-dom";
import GlassPanel from "@/components/shared/GlassPanel";
import MetricPill from "@/components/shared/MetricPill";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import { ROUTES } from "@/lib/routes";

export default function HomeMapPreview({ copy, items = [] }) {
  return (
    <GlassPanel className="relative overflow-hidden p-3">
      <div className="relative min-h-[440px] overflow-hidden rounded-[24px] bg-[#edf2f7]">
        <UnifiedMapShell items={items} className="h-[440px] w-full" />

        <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap gap-2">
          {copy.categoryChips.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-[rgba(255,255,255,0.92)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy,#111827)] shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="pointer-events-none absolute left-3 top-16 flex max-w-[260px] flex-wrap gap-2">
          {copy.districts.map((district) => (
            <span
              key={district}
              className="rounded-full border border-[rgba(15,23,42,0.10)] bg-[rgba(255,255,255,0.82)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]"
            >
              {district}
            </span>
          ))}
        </div>

        <div className="absolute inset-x-3 bottom-3 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <GlassPanel className="p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
              {copy.subtitle}
            </div>
            <h3 className="mt-2 text-[1.1rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">
              {copy.selectedResult.title}
            </h3>
            <p className="mt-1 text-[12px] uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
              {copy.selectedResult.meta}
            </p>
            <p className="mt-3 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">
              {copy.selectedResult.body}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to={ROUTES.explore} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-4 py-3 text-sm font-semibold text-white">
                {copy.selectedResult.primaryCta}
              </Link>
              <Link to={ROUTES.residentAppCard} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.10)] bg-white px-4 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]">
                {copy.selectedResult.secondaryCta}
              </Link>
            </div>
          </GlassPanel>
          <div className="flex flex-wrap gap-2 lg:max-w-[250px] lg:justify-end">
            {copy.metrics.map((metric) => (
              <MetricPill key={metric.label} value={metric.value} label={metric.label} />
            ))}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
