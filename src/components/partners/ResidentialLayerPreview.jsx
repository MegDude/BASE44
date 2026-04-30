import { useState } from "react";
import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";

export default function ResidentialLayerPreview({ copy, properties, details }) {
  const [selectedProperty, setSelectedProperty] = useState(properties[0]);
  const selectedDetail = details[selectedProperty];

  return (
    <SectionShell id="residential-layer" eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
              {copy.mapTitle}
            </div>
            <div className="rounded-full bg-[rgba(207,175,90,0.12)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
              {copy.countLabel}
            </div>
          </div>
          <p className="mt-3 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{copy.mapBody}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {properties.map((property) => {
              const isActive = selectedProperty === property;
              return (
                <button
                  key={property}
                  type="button"
                  onClick={() => setSelectedProperty(property)}
                  aria-pressed={isActive}
                  className={`inline-flex min-h-[44px] items-center rounded-full border px-3 py-2 text-[12px] font-semibold transition ${
                    isActive
                      ? "border-[rgba(207,175,90,0.28)] bg-[rgba(207,175,90,0.12)] text-[var(--dp-navy,#111827)]"
                      : "border-[rgba(15,23,42,0.10)] bg-[rgba(247,247,251,0.9)] text-[rgba(71,85,105,0.94)]"
                  }`}
                >
                  {property}
                </button>
              );
            })}
          </div>
        </div>
        <div className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white p-6">
          {selectedDetail ? (
            <>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
                Active property
              </div>
              <h3 className="mt-3 text-[1.4rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">
                {selectedProperty}
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-[rgba(71,85,105,0.94)]">{selectedDetail.district}</p>
              <p className="mt-4 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{selectedDetail.body}</p>
              <div className="mt-5">
                <Link
                  to={selectedDetail.href}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-5 py-3 text-sm font-semibold text-white"
                >
                  View property context
                </Link>
              </div>
            </>
          ) : (
            <p className="text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{copy.detailPlaceholder}</p>
          )}
        </div>
      </div>
    </SectionShell>
  );
}
