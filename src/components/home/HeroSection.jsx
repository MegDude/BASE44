import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AskTheMap from "@/components/map/AskTheMap";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import { createMarker } from "@/components/map/markers/MarkerFactory";
import { useSharedMapFeed } from "@/lib/map/useSharedMapFeed";
import { APPROVED_HOME_COPY } from "@/lib/approvedCopy";
import { ROUTES } from "@/lib/routes";
import { getPrimaryPresetDefinition } from "@/lib/map/searchUiConfig";

const AUSTIN_CENTER = [30.267, -97.743];

const ASK_FILTERS = [
  { id: "all", label: "All" },
  { id: "coffee", label: "Coffee" },
  { id: "dining", label: "Dining" },
  { id: "nightlife", label: "Nightlife" },
  { id: "wellness", label: "Wellness" },
  { id: "shopping", label: "Shopping" },
  { id: "perks", label: "Perks" },
  { id: "5min", label: "5 min walk" },
];

const QUICK_PROMPTS = ["Coffee nearby", "Happy hour now", "Events tonight"];
const PROOF_POINTS = [
  { title: "One map", body: "Places, events, and perks in one live view." },
  { title: "No friction", body: "No downloads. No logins. Just open and use." },
  { title: "Act immediately", body: "Decide and move without switching apps." },
];

function normalizePinType(item) {
  const type = String(item?.type || item?.entity_type || "").toLowerCase();
  if (["building", "property", "hotel"].includes(type)) return "building";
  if (type === "perk") return "perk";
  if (type === "event") return "event";
  return "venue";
}

function matchesFilter(item, filterId) {
  if (!item || filterId === "all") return true;
  const category = String(item?.category || item?.subcategory || "").toLowerCase();
  const type = normalizePinType(item);
  const walkMinutes = Number(item?.metadata?.walkMinutes ?? 999);

  if (filterId === "perks") return type === "perk" || Boolean(item?.perk?.value || item?.perk_value);
  if (filterId === "5min") return walkMinutes <= 5;
  if (filterId === "dining") return ["restaurant", "bar", "dining"].includes(category);
  if (filterId === "nightlife") return ["bar", "entertainment", "nightlife"].includes(category) || type === "event";
  if (filterId === "wellness") return ["wellness", "fitness", "beauty"].includes(category);
  if (filterId === "shopping") return ["retail", "shopping", "market"].includes(category);
  return category === filterId;
}

function getPreviewMeta(item) {
  const walkMinutes = item?.metadata?.walkMinutes;
  return {
    title: item?.title || item?.name || "Downtown pick",
    detail: Number.isFinite(walkMinutes) ? `${walkMinutes} min walk` : item?.district || "Downtown Austin",
    summary: item?.perk?.value || item?.perk_value || item?.description || item?.category || "Nearby now",
  };
}

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const preset = getPrimaryPresetDefinition(activeFilter);
  const searchQuery = String(query || "").trim() || preset.query || "";
  const { items } = useSharedMapFeed({ query: searchQuery, activeCategory: "all", limit: 180 });

  const visibleItems = useMemo(() => {
    return (items || []).filter((item) => matchesFilter(item, activeFilter)).slice(0, 60);
  }, [activeFilter, items]);

  const selected = selectedEntity || visibleItems[0];
  const selectedMeta = selected ? getPreviewMeta(selected) : null;
  const mapCenter = selected?.location
    ? [selected.location.latitude, selected.location.longitude]
    : AUSTIN_CENTER;

  function handleSubmit(nextQuery) {
    setQuery(String(nextQuery || query || "").trim());
    setShowResults(true);
  }

  function handleFilterChange(nextFilter) {
    setActiveFilter(nextFilter);
    const nextPreset = getPrimaryPresetDefinition(nextFilter);
    if (nextPreset.query) setQuery(nextPreset.query);
  }

  return (
    <section id="home-map-entry" className="bg-[var(--dp-bg-primary)] bg-[image:var(--dp-bg-pearl)] pt-[84px] text-[var(--dp-navy)]">
      <div className="dp-page-shell">
        <div className="relative overflow-hidden rounded-[34px] border border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.72)] shadow-[var(--dp-shadow-soft)]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(180deg,rgba(246,247,251,0.52),rgba(246,247,251,0.94)), url('/media/austin-hero-correct.png')",
            }}
          />
          <div className="relative grid gap-6 px-6 py-8 md:px-8 md:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
                {APPROVED_HOME_COPY.hero.eyebrow || "Downtown Perks"}
              </div>
              <h1 className="mt-4 max-w-[12ch] font-heading text-[2.9rem] font-semibold leading-[0.94] tracking-[-0.055em] text-[var(--dp-navy)] md:text-[5rem]">
                {APPROVED_HOME_COPY.hero.title || "Where downtown meets you"}
              </h1>
              <p className="mt-4 max-w-xl text-[1.1rem] font-medium tracking-[-0.02em] text-[rgba(11,31,51,0.82)] md:text-[1.3rem]">
                Everything nearby — in one map.
              </p>
            </div>

            <AskTheMap
              value={query}
              onChange={setQuery}
              onSubmit={handleSubmit}
              quickPrompts={QUICK_PROMPTS}
              filters={ASK_FILTERS}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              mode="hero"
              placeholder="Search places, events, or perks"
              secondaryAction={{ label: "See what's nearby", href: ROUTES.explore }}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {PROOF_POINTS.map((point) => (
            <div key={point.title} className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.62)] p-5 shadow-[var(--dp-shadow-soft)] backdrop-blur-xl">
              <h3 className="text-[15px] font-semibold text-[var(--dp-navy)]">{point.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-[rgba(11,31,51,0.64)]">{point.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="dp-page-shell py-5 md:py-6">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">Nearby now</div>
            <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.035em] text-[var(--dp-navy)]">Search, select, and move through one map surface.</h2>
          </div>
          <Link to={ROUTES.partners} className="dp-cta-secondary">Partner platform</Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.72)] shadow-[var(--dp-shadow-soft)]">
            <div className="h-[420px] md:h-[560px]">
              <UnifiedMapShell
                items={visibleItems}
                markerIcon={(item, active) => createMarker(item, { isSelected: active })}
                onMarkerSelect={setSelectedEntity}
                mapCenter={mapCenter}
                mapZoom={13.25}
                selectedId={selected?.id}
                className="h-full w-full"
                enableClustering={false}
              />
            </div>
          </div>

          <aside className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.72)] shadow-[var(--dp-shadow-soft)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3 px-4 py-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.46)]">Nearby results</div>
                <div className="mt-1 text-[15px] font-semibold text-[var(--dp-navy)]">{visibleItems.length} live results nearby now</div>
              </div>
              <button type="button" onClick={() => setShowResults((current) => !current)} className="dp-cta-secondary min-h-0 px-3 py-2 text-[12px] normal-case tracking-normal">
                {showResults ? "Hide list" : "Show list"}
              </button>
            </div>

            <div className="border-t border-[rgba(11,31,51,0.08)] px-4 py-4">
              {selected ? (
                <div className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/80 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.46)]">Selected</div>
                  <div className="mt-2 text-[16px] font-semibold text-[var(--dp-navy)]">{selectedMeta.title}</div>
                  <div className="mt-2 text-[13px] leading-6 text-[rgba(11,31,51,0.66)]">{selectedMeta.summary}</div>
                  <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[rgba(11,31,51,0.52)]">{selectedMeta.detail}</div>
                </div>
              ) : (
                <p className="text-[13px] leading-6 text-[rgba(11,31,51,0.64)]">Search the map to see nearby results.</p>
              )}

              {showResults ? (
                <div className="mt-4 divide-y divide-[rgba(11,31,51,0.08)] rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/72">
                  {visibleItems.slice(0, 8).map((item) => {
                    const meta = getPreviewMeta(item);
                    return (
                      <button key={item.id} type="button" onClick={() => setSelectedEntity(item)} className="w-full px-4 py-3 text-left transition-colors hover:bg-[rgba(11,31,51,0.03)]">
                        <div className="text-[13px] font-semibold text-[var(--dp-navy)]">{meta.title}</div>
                        <div className="mt-1 text-[12px] leading-5 text-[rgba(11,31,51,0.62)]">{meta.summary}</div>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
