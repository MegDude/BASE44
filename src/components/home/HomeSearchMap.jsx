import { useMemo, useState } from "react";
import SectionShell from "@/components/shared/SectionShell";
import MapSearchBar from "@/components/map/MapSearchBar";
import HomeMapPreview from "@/components/home/HomeMapPreview";
import { useMapData } from "@/features/map/useMapData";

const FILTER_TO_CATEGORY = {
  Venues: "venue",
  Events: "event",
  Perks: "perk",
  "5 min walk": "all",
};

export default function HomeSearchMap({ searchCopy, mapCopy }) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(searchCopy.filterChips[0]?.label || "Nearby");
  const [showFilters, setShowFilters] = useState(false);
  const { items } = useMapData({
    query: submittedQuery,
    activeCategory: FILTER_TO_CATEGORY[activeFilter] || "all",
    limit: 36,
  });

  const previewItems = useMemo(() => (Array.isArray(items) ? items.slice(0, 24) : []), [items]);

  function handleSubmit(nextQuery) {
    setSubmittedQuery(String(nextQuery || query).trim());
    setShowFilters(false);
  }

  return (
    <SectionShell className="pt-0">
      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div>
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
            {searchCopy.eyebrowItems.map((item, index) => (
              <span key={item} className="inline-flex items-center gap-2">
                {index > 0 ? <span className="text-[var(--dp-gold,#CFAF5A)]">•</span> : null}
                {item}
              </span>
            ))}
          </div>
          <h2 className="mt-3 font-heading text-[2rem] font-semibold tracking-[-0.04em] text-[var(--dp-navy,#111827)] md:text-[3rem]">
            {searchCopy.title}
          </h2>
          <div className="mt-5">
            <MapSearchBar
              value={query}
              onChange={setQuery}
              onSubmit={handleSubmit}
              onOpenFilters={() => setShowFilters((current) => !current)}
              placeholder={searchCopy.placeholder}
              eyebrow={searchCopy.label}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {searchCopy.promptChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setQuery(chip);
                  setSubmittedQuery(chip);
                }}
                className="inline-flex min-h-[44px] items-center rounded-full border border-[rgba(15,23,42,0.10)] bg-white px-4 py-2 text-[12px] font-semibold text-[var(--dp-navy,#111827)]"
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="relative mt-4">
            {showFilters ? (
              <div className="absolute z-10 w-full max-w-[360px] rounded-[22px] border border-[rgba(15,23,42,0.10)] bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
                  Search filters
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {searchCopy.filterChips.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      aria-label={chip.ariaLabel}
                      onClick={() => {
                        setActiveFilter(chip.label);
                        setShowFilters(false);
                      }}
                      className={`inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 text-[12px] font-semibold ${
                        activeFilter === chip.label
                          ? "border-[rgba(207,175,90,0.28)] bg-[rgba(207,175,90,0.12)] text-[var(--dp-navy,#111827)]"
                          : "border-[rgba(15,23,42,0.10)] bg-[rgba(247,247,251,0.9)] text-[rgba(71,85,105,0.94)]"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {searchCopy.filterChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  aria-label={chip.ariaLabel}
                  onClick={() => setActiveFilter(chip.label)}
                  className={`inline-flex min-h-[42px] items-center rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                    activeFilter === chip.label
                      ? "border-[rgba(207,175,90,0.28)] bg-[rgba(207,175,90,0.12)] text-[var(--dp-navy,#111827)]"
                      : "border-[rgba(15,23,42,0.10)] bg-white text-[rgba(71,85,105,0.94)]"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <HomeMapPreview copy={mapCopy} items={previewItems} />
      </div>
    </SectionShell>
  );
}
