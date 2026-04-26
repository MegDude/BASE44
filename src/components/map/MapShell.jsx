import { useMemo, useState } from "react";
import SkylineEngine from "@/components/skyline/SkylineEngine";
import SkylineSignals from "@/components/skyline/SkylineSignals";
import SkylineFocus from "@/components/skyline/SkylineFocus";
import { useSkylineState } from "@/lib/useSkylineState";
import { useThemeMode } from "@/lib/useThemeMode";
import { trackEvent } from "@/lib/trackEvent";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "venue", label: "Places" },
  { key: "perk", label: "Offers" },
  { key: "event", label: "Events" },
  { key: "property", label: "Properties" }
];

const DEMO_RESULTS = [
  {
    id: "merit-coffee",
    type: "venue",
    name: "Merit Coffee",
    category: "Coffee",
    district: "Seaholm",
    lat: 30.2661,
    lng: -97.7524,
    distance: "0.2 mi",
    offer: "15% off espresso drinks",
    description: "Quick stop, daily ritual, nearby perk."
  },
  {
    id: "line-hotel",
    type: "hotel",
    name: "The LINE Hotel",
    category: "Hotel",
    district: "CBD",
    lat: 30.2638,
    lng: -97.7431,
    distance: "0.3 mi",
    offer: "20% off spa services",
    description: "Hospitality layer with guest discovery."
  },
  {
    id: "easy-tiger",
    type: "venue",
    name: "Easy Tiger",
    category: "Dining",
    district: "CBD",
    lat: 30.2655,
    lng: -97.7438,
    distance: "0.1 mi",
    offer: "Complimentary pretzel with drink",
    description: "Dining and happy hour visibility."
  },
  {
    id: "waterline",
    type: "property",
    name: "The Waterline",
    category: "Residential",
    district: "Rainey",
    lat: 30.259,
    lng: -97.739,
    distance: "5 min",
    offer: "Resident amenity layer",
    description: "Property discovery, leasing context, nearby perks."
  }
];

export default function MapShell({
  mode = "resident",
  compact = false,
  initialQuery = "",
  showSkyline = true,
  className = ""
}) {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const skyline = useSkylineState({ query, intent: activeFilter, enabled: showSkyline });
  const theme = useThemeMode({ activityLevel: skyline.activityLevel, intent: query || activeFilter });

  const results = useMemo(() => {
    if (activeFilter === "all") return DEMO_RESULTS;
    return DEMO_RESULTS.filter((item) => item.type === activeFilter || item.category.toLowerCase() === activeFilter);
  }, [activeFilter]);

  async function handleSearch(event) {
    event.preventDefault();
    setDrawerOpen(true);

    await trackEvent("search_submit", {
      source: `${mode}_map`,
      metadata: { query, filter: activeFilter }
    });
  }

  async function selectResult(item) {
    setSelected(item);
    setDrawerOpen(true);

    await trackEvent("result_open", {
      entityId: item.id,
      entityType: item.type,
      district: item.district,
      lat: item.lat,
      lng: item.lng,
      source: `${mode}_map`
    });
  }

  return (
    <section
      className={`relative overflow-hidden ${compact ? "min-h-[640px]" : "min-h-screen"} ${theme === "dark" ? "dark" : ""} ${className}`}
    >
      {showSkyline && (
        <>
          <SkylineEngine mode={skyline.mode} />
          <SkylineSignals signals={skyline.signals} />
          <SkylineFocus focus={skyline.focus} />
        </>
      )}

      <div className="relative z-20 flex min-h-screen flex-col">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-4 pt-20 md:px-6">
          <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
            <div className="flex flex-col justify-end pb-4 text-white">
              <p className="dp-kicker w-fit">Real-time downtown</p>
              <h1 className="mt-5 dp-display-hero text-[clamp(3.25rem,8vw,7.5rem)]">
                Where downtown meets you.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/82 md:text-lg">
                A live map for perks, events, places, properties, and neighborhood activity across downtown Austin.
              </p>

              <form onSubmit={handleSearch} className="mt-6 max-w-xl rounded-[24px] border border-white/15 bg-white/12 p-2 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Ask the map: coffee, dinner, rooftop bars, events tonight..."
                    className="min-h-[52px] flex-1 bg-transparent px-4 text-sm font-medium text-white outline-none placeholder:text-white/54"
                  />
                  <button className="rounded-[18px] bg-[var(--dp-gold)] px-4 py-3 text-sm font-bold text-[#07111f]">
                    Search
                  </button>
                </div>
              </form>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 dp-no-scrollbar">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => {
                      setActiveFilter(filter.key);
                      setDrawerOpen(true);
                    }}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-xl transition ${
                      activeFilter === filter.key
                        ? "border-[var(--dp-gold)] bg-[var(--dp-gold)] text-[#07111f]"
                        : "border-white/14 bg-white/10 text-white/82 hover:bg-white/16"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative min-h-[520px] overflow-hidden rounded-[32px] border border-white/16 bg-[#07111f]/72 shadow-2xl backdrop-blur-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_64%,rgba(207,175,90,0.30),transparent_18rem),linear-gradient(135deg,rgba(255,255,255,0.08),transparent)]" />

              <div className="absolute left-4 top-4 rounded-2xl border border-white/12 bg-black/24 px-4 py-3 text-white backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--dp-gold)]">
                  {skyline.focus?.label || "Downtown Austin"}
                </p>
                <p className="mt-1 text-sm text-white/78">
                  {skyline.activityLevel > 160 ? "High activity" : "Live activity"}
                </p>
              </div>

              <div className="absolute inset-6 rounded-[28px] border border-white/10 bg-black/18">
                <div className="absolute left-[15%] top-[25%] h-2 w-2 rounded-full bg-white/70" />
                <div className="absolute left-[42%] top-[48%] h-3 w-3 rounded-full bg-[var(--dp-gold)] shadow-[0_0_26px_rgba(207,175,90,0.72)]" />
                <div className="absolute left-[72%] top-[68%] h-4 w-4 rounded-full bg-[var(--dp-gold)] shadow-[0_0_32px_rgba(207,175,90,0.88)]" />
                <div className="absolute bottom-5 left-5 right-5 h-[1px] bg-white/14" />
                <div className="absolute bottom-10 left-10 h-[1px] w-2/3 rotate-[-8deg] bg-[var(--dp-gold)]/40" />
              </div>

              {drawerOpen && (
                <div className="absolute bottom-0 left-0 right-0 max-h-[58%] rounded-t-[28px] border-t border-white/12 bg-[#07111f]/88 p-4 text-white shadow-2xl backdrop-blur-xl md:left-auto md:right-4 md:top-4 md:h-[calc(100%-2rem)] md:max-h-none md:w-[320px] md:rounded-[24px] md:border">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--dp-gold)]">Results</p>
                      <p className="mt-1 text-sm text-white/68">{results.length} nearby signals</p>
                    </div>
                    <button
                      onClick={() => setDrawerOpen(false)}
                      className="rounded-full border border-white/12 px-3 py-1 text-sm text-white/70"
                      aria-label="Close results"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-2 overflow-y-auto pr-1">
                    {results.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => selectResult(item)}
                        className={`w-full rounded-2xl border p-3 text-left transition ${
                          selected?.id === item.id
                            ? "border-[var(--dp-gold)] bg-[var(--dp-gold)]/12"
                            : "border-white/10 bg-white/[0.06] hover:bg-white/[0.10]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="mt-1 text-xs text-white/60">{item.category} · {item.distance}</p>
                          </div>
                          <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/70">
                            {item.district}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-white/72">{item.offer || item.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selected && (
                <div className="absolute bottom-4 left-4 hidden max-w-[360px] rounded-[24px] border border-white/12 bg-black/34 p-4 text-white backdrop-blur-xl lg:block">
                  <button
                    onClick={() => setSelected(null)}
                    className="absolute right-3 top-3 text-white/60"
                    aria-label="Close detail"
                  >
                    ×
                  </button>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--dp-gold)]">
                    Selected
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">{selected.name}</h3>
                  <p className="mt-2 text-sm text-white/72">{selected.description}</p>
                  <div className="mt-4 flex gap-2">
                    <button className="rounded-2xl bg-[var(--dp-gold)] px-4 py-2 text-sm font-bold text-[#07111f]">
                      Save
                    </button>
                    <button className="rounded-2xl border border-white/14 px-4 py-2 text-sm font-bold text-white">
                      Show card
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
