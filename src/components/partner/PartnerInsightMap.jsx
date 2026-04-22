import { useMemo, useState } from "react";
import { Activity, BarChart3, MapPin, Radar, Target } from "lucide-react";
import MapExplorer from "@/components/partner/MapExplorer";
import ResponsiveScrollSection from "@/components/partner/ResponsiveScrollSection";
import {
  getPartnerInsightCards,
  getPartnerInsightPins,
  getPartnerInsightSummary,
} from "@/lib/map/partnerInsights";

const FILTERS = [
  { id: "all", label: "All insights" },
  { id: "engagement", label: "Engagement" },
  { id: "performance", label: "Performance" },
  { id: "opportunity", label: "Opportunity" },
  { id: "coverage", label: "Coverage" },
  { id: "campaign", label: "Campaign" },
];

const INSIGHT_ICONS = {
  engagement: Activity,
  performance: BarChart3,
  opportunity: Target,
  coverage: Radar,
  campaign: MapPin,
};

export default function PartnerInsightMap({
  partnerType = "dashboard",
  title = "Business insight map",
  description = "Partner mode shows activity, coverage, campaigns, and opportunity zones instead of resident discovery perks.",
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const allItems = useMemo(() => getPartnerInsightPins({ partnerType }), [partnerType]);
  const insightCards = useMemo(() => getPartnerInsightCards({ partnerType }), [partnerType]);
  const summary = useMemo(() => getPartnerInsightSummary({ partnerType }), [partnerType]);
  const items = useMemo(
    () =>
      activeFilter === "all"
        ? allItems
        : allItems.filter((item) => item.insightType === activeFilter),
    [activeFilter, allItems]
  );

  const activeItem = selected && items.some((item) => item.id === selected.id) ? selected : items[0];
  const visibleCards = useMemo(
    () =>
      activeFilter === "all"
        ? insightCards
        : insightCards.filter((item) => item.insightType === activeFilter),
    [activeFilter, insightCards]
  );

  return (
    <section className="border-y border-[rgba(11,31,51,0.08)] bg-[#f8f5ee]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          {[
            {
              label: "Active zones",
              value: summary.activeZones,
              tone: "text-[hsl(42,55%,42%)]",
            },
            {
              label: "Tracked interactions",
              value: summary.interactions?.toLocaleString?.() || summary.interactions,
              tone: "text-[var(--dp-navy,#0B1F33)]",
            },
            {
              label: "Top signal",
              value: summary.topInsight,
              tone: "text-[rgba(11,31,51,0.82)]",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_10px_24px_rgba(11,31,51,0.04)]"
            >
              <div className="text-[11px] uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
                {item.label}
              </div>
              <div className={`mt-3 text-3xl font-semibold tracking-[-0.05em] ${item.tone}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <MapExplorer
          mode="partner"
          items={items}
          selected={activeItem}
          onSelect={setSelected}
          filterChips={FILTERS}
          activeFilter={activeFilter}
          onFilterChange={(nextFilter) => {
            setActiveFilter(nextFilter);
            setSelected(null);
          }}
          title={title}
          description={description}
          height="h-[430px] md:h-[520px]"
        />

        <aside className="rounded-[24px] border border-[rgba(11,31,51,0.10)] bg-white p-4 shadow-[0_18px_42px_rgba(11,31,51,0.08)] lg:mt-[118px]">
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(40,62%,42%)]">
              Selected insight
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--dp-navy,#0B1F33)]">
              {activeItem?.title || "No insight selected"}
            </h3>
            <p className="mt-2 text-[13px] leading-5 text-[rgba(11,31,51,0.62)]">
              {activeItem?.summary || "Adjust the filters to inspect partner opportunity zones."}
            </p>
          </div>

          {activeItem ? (
            <div className="mb-4 rounded-[18px] bg-[var(--dp-navy,#0B1F33)] p-4 text-white">
              <div className="text-[11px] uppercase tracking-[0.16em] text-white/56">
                {activeItem.label || activeItem.insightType}
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-[-0.055em] text-[hsl(40,62%,62%)]">
                {activeItem.value?.toLocaleString?.() || activeItem.value || "Live"}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            {items.map((item) => {
              const Icon = INSIGHT_ICONS[item.insightType] || Activity;
              const isActive = activeItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item)}
                  className={`w-full rounded-[16px] border p-3 text-left transition ${
                    isActive
                      ? "border-[rgba(200,151,58,0.52)] bg-[rgba(200,151,58,0.10)]"
                      : "border-[rgba(11,31,51,0.08)] bg-white/52 hover:bg-white/78"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] bg-[rgba(11,31,51,0.06)]">
                      <Icon className="h-3.5 w-3.5 text-[var(--dp-navy,#0B1F33)]" strokeWidth={1.75} />
                    </span>
                    <span>
                      <span className="block text-[12px] font-semibold leading-4 text-[var(--dp-navy,#0B1F33)]">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-[11px] leading-4 text-[rgba(11,31,51,0.54)]">
                        {item.label || item.insightType}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
        </div>

        <div className="mt-5">
          <ResponsiveScrollSection
            items={visibleCards}
            desktopClassName="md:grid-cols-3"
            mobileCardClassName="w-[82%]"
            getKey={(card) => card.id}
            renderItem={(card) => (
              <button
                type="button"
                onClick={() => {
                  const next = items.find((item) => item.id === card.id);
                  if (next) setSelected(next);
                }}
                className="h-full w-full rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white p-5 text-left shadow-[0_10px_24px_rgba(11,31,51,0.04)] transition hover:border-[rgba(200,151,58,0.32)]"
              >
                <div className="text-[11px] uppercase tracking-[0.16em] text-[hsl(40,62%,42%)]">
                  {card.label}
                </div>
                <div className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[var(--dp-navy,#0B1F33)]">
                  {card.title}
                </div>
                <div className="mt-3 text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">
                  {card.summary}
                </div>
              </button>
            )}
          />
        </div>
      </div>
    </section>
  );
}
