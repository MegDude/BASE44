import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";
import MapShell from "@/components/map/MapShell";
import { ROUTES } from "@/lib/routes";

export default function PartnerProofMap({ copy, activeRole }) {
  const mapMode =
    activeRole === "properties"
      ? "property"
      : activeRole === "hotels"
        ? "hospitality"
        : activeRole === "venues"
          ? "venue"
          : activeRole === "brands"
            ? "brand"
            : activeRole === "civic"
              ? "civic"
              : "partners";

  return (
    <SectionShell id="properties-proof" title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white p-5">
          <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
            Live filters
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {copy.filters.map((filter) => (
              <span
                key={filter}
                className="inline-flex min-h-[36px] items-center rounded-full border border-[rgba(15,23,42,0.10)] bg-[rgba(247,247,251,0.9)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]"
              >
                {filter}
              </span>
            ))}
          </div>
          <p className="mt-5 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{copy.helper}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={ROUTES.explore} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-5 py-3 text-sm font-semibold text-white">
              Open the map
            </Link>
            <Link to={ROUTES.partnerProperties} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.10)] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]">
              Open Properties page
            </Link>
            <a href="mailto:partners@downtownperks.com" className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.10)] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]">
              Get in touch
            </a>
          </div>
        </div>
        <div className="overflow-hidden rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <MapShell mode={mapMode} compact className="min-h-[620px]" />
        </div>
      </div>
    </SectionShell>
  );
}
