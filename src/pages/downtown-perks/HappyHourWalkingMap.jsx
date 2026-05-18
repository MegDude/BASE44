import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Clock3,
  ExternalLink,
  GlassWater,
  Hotel,
  MapPin,
  Search,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import { createMarker } from "@/components/map/markers/MarkerFactory";
import happyHourCatalog from "@/data/generated/happyHourCatalog.json";
import { ROUTES } from "@/lib/routes";

const DOWNTOWN_CENTER = [30.267, -97.743];

const TYPE_FILTERS = [
  { id: "all", label: "All downtown", icon: Sparkles },
  { id: "bar", label: "Bars", icon: GlassWater },
  { id: "restaurant", label: "Restaurants", icon: UtensilsCrossed },
  { id: "hotel", label: "Hotels", icon: Hotel },
  { id: "speakeasy", label: "Speakeasies", icon: Building2 },
  { id: "specials", label: "With specials", icon: Clock3 },
];

const DISTRICT_ORDER = ["Rainey", "6th Street", "Red River", "Congress", "Seaholm", "Waterloo", "Downtown Core"];

function toMapEntity(item) {
  return {
    id: item.id,
    name: item.name,
    title: item.name,
    type: item.kind === "hotel" ? "hotel" : "venue",
    category:
      item.kind === "restaurant"
        ? "restaurant"
        : item.kind === "hotel"
          ? "hotel"
          : "bar",
    description: item.specialLabel,
    address: item.address,
    district: item.district,
    location: {
      latitude: item.latitude,
      longitude: item.longitude,
      valid: true,
    },
    isOpenNow: false,
    isPlotted: true,
    isVisibleInResults: true,
    markerType: item.kind === "hotel" ? "building" : "standard",
    iconType:
      item.kind === "restaurant"
        ? "restaurant"
        : item.kind === "hotel"
          ? "hotel"
          : item.kind === "speakeasy"
            ? "nightlife"
            : "nightlife",
    metadata: {
      walkMinutes: null,
      popularity: item.hasPublicSpecial ? 72 : 48,
      tags: [item.kind, item.category, item.district].filter(Boolean),
      searchKeywords: [item.name, item.address, item.specialLabel, item.operatingHours, item.kind].filter(Boolean),
    },
  };
}

function buildResidentCardHref(item) {
  const params = new URLSearchParams();
  params.set("query", item.name);
  params.set("chip", "venue");
  return `${ROUTES.residentAppCard}?${params.toString()}`;
}

export default function HappyHourWalkingMap() {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [activeDistrict, setActiveDistrict] = useState("all");
  const [selectedId, setSelectedId] = useState(happyHourCatalog[0]?.id || null);
  const [mapCenter, setMapCenter] = useState(DOWNTOWN_CENTER);
  const [mapZoom, setMapZoom] = useState(14.1);

  const districts = useMemo(() => {
    const counts = happyHourCatalog.reduce((acc, item) => {
      acc[item.district] = Number(acc[item.district] || 0) + 1;
      return acc;
    }, {});
    return DISTRICT_ORDER.filter((district) => counts[district]).map((district) => ({
      id: district,
      label: district,
      count: counts[district],
    }));
  }, []);

  const filteredItems = useMemo(() => {
    const text = String(query || "").trim().toLowerCase();
    return happyHourCatalog.filter((item) => {
      if (activeType === "bar" && item.kind !== "bar") return false;
      if (activeType === "restaurant" && item.kind !== "restaurant") return false;
      if (activeType === "hotel" && item.kind !== "hotel") return false;
      if (activeType === "speakeasy" && !item.isSpeakeasy) return false;
      if (activeType === "specials" && !item.hasPublicSpecial) return false;
      if (activeDistrict !== "all" && item.district !== activeDistrict) return false;

      if (!text) return true;
      return `${item.name} ${item.address} ${item.specialLabel} ${item.operatingHours} ${item.kind} ${item.district}`
        .toLowerCase()
        .includes(text);
    });
  }, [activeDistrict, activeType, query]);

  const mapItems = useMemo(() => filteredItems.map(toMapEntity), [filteredItems]);
  const selectedItem =
    filteredItems.find((item) => item.id === selectedId) || filteredItems[0] || null;

  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)] pt-[68px] text-[var(--dp-navy)]">
      <section className="px-4 py-6 md:px-6 md:py-8">
        <div className="dp-page-shell">
          <div className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,#0B1F33_0%,#112A44_100%)] p-5 text-white shadow-[0_20px_48px_rgba(11,31,51,0.16)] md:p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <div className="dp-kicker">Happy hour walking map</div>
                <h1 className="mt-3 text-[2rem] font-semibold leading-[0.96] tracking-[-0.05em] text-white md:text-[3rem]">
                  Every downtown bar, restaurant, hotel, and speakeasy in one map.
                </h1>
                <p className="mt-3 max-w-2xl text-[14px] leading-6 text-white/72">
                  Use one route to compare downtown happy-hour options fast: location, hours, public specials, and the places that still need live offer details.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link to={ROUTES.events} className="dp-cta-secondary border-white/12 bg-white/10 text-white">
                  Events calendar
                </Link>
                <Link to={ROUTES.residentAppCard} className="dp-cta-primary bg-white text-[var(--dp-navy)]">
                  Open perks card
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="flex items-center gap-3 rounded-[18px] bg-white/10 px-4 py-3">
                <Search className="h-4 w-4 text-white/64" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search happy hour by name, district, or special"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/44"
                />
              </div>
              <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/78">
                {filteredItems.length} mapped spots
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {TYPE_FILTERS.map((filter) => {
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveType(filter.id)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                      activeType === filter.id
                        ? "bg-white text-[var(--dp-navy)]"
                        : "bg-white/10 text-white/76 hover:bg-white/14"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveDistrict("all")}
                className={`shrink-0 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                  activeDistrict === "all"
                    ? "bg-[var(--dp-gold)] text-[var(--dp-navy)]"
                    : "bg-white/10 text-white/76 hover:bg-white/14"
                }`}
              >
                All districts
              </button>
              {districts.map((district) => (
                <button
                  key={district.id}
                  type="button"
                  onClick={() => setActiveDistrict(district.id)}
                  className={`shrink-0 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                    activeDistrict === district.id
                      ? "bg-[var(--dp-gold)] text-[var(--dp-navy)]"
                      : "bg-white/10 text-white/76 hover:bg-white/14"
                  }`}
                >
                  {district.label} · {district.count}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-6 md:px-6 md:pb-8">
        <div className="dp-page-shell">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white" style={{ height: "calc(100vh - 280px)" }}>
              <UnifiedMapShell
                items={mapItems}
                selectedId={selectedItem?.id}
                markerIcon={(entity, isSelected) => createMarker(entity, { isSelected })}
                onMarkerSelect={(entity) => {
                  setSelectedId(entity.id);
                  if (entity.location) {
                    setMapCenter([entity.location.latitude, entity.location.longitude]);
                    setMapZoom(15.1);
                  }
                }}
                mapCenter={mapCenter}
                mapZoom={mapZoom}
                onMapCenterChange={setMapCenter}
                onMapZoomChange={setMapZoom}
                className="h-full w-full"
              />
            </div>

            <div className="space-y-4">
              {selectedItem ? (
                <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_16px_36px_rgba(11,26,43,0.06)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                        {selectedItem.kind}
                      </div>
                      <div className="mt-1 text-[1.25rem] font-semibold leading-[1.02] text-[var(--dp-navy)]">
                        {selectedItem.name}
                      </div>
                    </div>
                    {selectedItem.hasPublicSpecial ? (
                      <span className="rounded-full bg-[rgba(207,175,90,0.16)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--dp-navy)]">
                        Public special
                      </span>
                    ) : (
                      <span className="rounded-full bg-[rgba(11,31,51,0.05)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[rgba(11,31,51,0.56)]">
                        Needs offer
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid gap-2 text-[13px] text-[rgba(11,31,51,0.68)]">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--dp-gold-muted)]" />
                      <span>{selectedItem.address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--dp-gold-muted)]" />
                      <span>{selectedItem.operatingHours}</span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[18px] border border-[rgba(194,143,84,0.22)] bg-[var(--dp-gold-soft)] p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                      Happy hour or current offer
                    </div>
                    <div className="mt-2 text-[13px] font-medium leading-5 text-foreground">
                      {selectedItem.specialLabel}
                    </div>
                  </div>

                  {selectedItem.eventsAvailable ? (
                    <div className="mt-4 rounded-[16px] bg-[#f7f9fc] p-4">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                        Event tie-in
                      </div>
                      <div className="mt-2 text-[13px] leading-5 text-foreground">
                        {selectedItem.eventsAvailable}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-2">
                    <Link
                      to={buildResidentCardHref(selectedItem)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--dp-navy)] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white"
                    >
                      Save to perks card
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    {selectedItem.website ? (
                      <a
                        href={selectedItem.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(11,31,51,0.08)] bg-white px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--dp-navy)]"
                      >
                        Open venue site
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-4 shadow-[0_16px_36px_rgba(11,26,43,0.06)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                    Downtown list
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {filteredItems.length} spots
                  </div>
                </div>

                <div className="mt-3 max-h-[46vh] space-y-2 overflow-y-auto pr-1">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(item.id);
                        setMapCenter([item.latitude, item.longitude]);
                        setMapZoom(15.1);
                      }}
                      className={`w-full rounded-[16px] border px-3 py-3 text-left transition ${
                        selectedItem?.id === item.id
                          ? "border-[rgba(207,175,90,0.48)] bg-[rgba(255,249,236,0.95)]"
                          : "border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-foreground">{item.name}</div>
                          <div className="mt-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                            {item.district} · {item.kind}
                          </div>
                        </div>
                        {item.hasPublicSpecial ? (
                          <span className="rounded-full bg-[rgba(207,175,90,0.16)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--dp-navy)]">
                            Special
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 text-[12px] leading-5 text-foreground/72">
                        {item.specialLabel}
                      </div>
                      <div className="mt-2 text-[11px] text-muted-foreground">
                        {item.operatingHours}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
