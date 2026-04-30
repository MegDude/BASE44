import { useEffect, useMemo, useState } from "react";
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
import { ROUTES } from "@/lib/routes";
import { getHappyHourEntities } from "@/lib/map/happyHourEntities";

const DOWNTOWN_CENTER = [30.267, -97.743];
const TYPE_FILTERS = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "bar", label: "Bars", icon: GlassWater },
  { id: "restaurant", label: "Restaurants", icon: UtensilsCrossed },
  { id: "hotel", label: "Hotels", icon: Hotel },
  { id: "speakeasy", label: "Speakeasies", icon: Building2 },
  { id: "specials", label: "With specials", icon: Clock3 },
];
const DISTRICT_ORDER = [
  "All districts",
  "Rainey",
  "6th Street",
  "Red River",
  "Congress",
  "Downtown Core",
  "Seaholm",
  "Market District",
  "West End",
  "East Austin edge",
  "Waterloo / Capitol edge",
];

function buildResidentCardHref(item) {
  const params = new URLSearchParams();
  params.set("query", item.name);
  params.set("chip", "venue");
  return `${ROUTES.residentAppCard}?${params.toString()}`;
}

export default function HappyHourWalkingMap({ residentMode = false }) {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [activeDistrict, setActiveDistrict] = useState("All districts");
  const [selectedId, setSelectedId] = useState(null);
  const [mapCenter, setMapCenter] = useState(DOWNTOWN_CENTER);
  const [mapZoom, setMapZoom] = useState(14.1);
  const dedupedCatalog = useMemo(() => getHappyHourEntities(), []);

  const filteredItems = useMemo(() => {
    const text = String(query || "").trim().toLowerCase();
    return dedupedCatalog.filter((item) => {
      if (activeType === "bar" && item.kind !== "bar") return false;
      if (activeType === "restaurant" && item.kind !== "restaurant") return false;
      if (activeType === "hotel" && item.kind !== "hotel") return false;
      if (activeType === "speakeasy" && !item.isSpeakeasy) return false;
      if (activeType === "specials" && !item.hasPublicSpecial) return false;
      if (activeDistrict !== "All districts" && item.district !== activeDistrict) return false;

      if (!text) return true;
      return `${item.name} ${item.address} ${item.specialLabel} ${item.operatingHours} ${item.kind} ${item.district}`
        .toLowerCase()
        .includes(text);
    });
  }, [activeDistrict, activeType, dedupedCatalog, query]);

  const mapItems = useMemo(() => filteredItems.slice(0, 40), [filteredItems]);

  const selectedItem =
    filteredItems.find((item) => item.id === selectedId) ||
    filteredItems[0] ||
    null;

  const districtOptions = useMemo(() => {
    const available = new Set(dedupedCatalog.map((item) => item.district).filter(Boolean));
    return DISTRICT_ORDER.filter((item) => item === "All districts" || available.has(item));
  }, [dedupedCatalog]);

  useEffect(() => {
    if (!selectedItem?.location) return;
    setMapCenter([selectedItem.location.latitude, selectedItem.location.longitude]);
  }, [selectedItem]);

  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)] pt-[68px] text-[var(--dp-navy)]">
      <section className="px-4 py-6 md:px-6 md:py-8">
        <div className="dp-page-shell">
          {residentMode ? (
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {[
                { to: ROUTES.residents, label: "Residents" },
                { to: ROUTES.explore, label: "Explore Map" },
                { to: ROUTES.residentWalkingHappyHour, label: "Walking Happy Hour" },
                { to: ROUTES.events, label: "Events" },
                { to: ROUTES.card, label: "Perks Card" },
                { to: ROUTES.about, label: "About" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                    item.to === ROUTES.residentWalkingHappyHour
                      ? "bg-[var(--dp-navy)] text-white"
                      : "bg-white text-[rgba(11,31,51,0.68)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}

          <div className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,#0B1F33_0%,#112A44_100%)] p-5 text-white shadow-[0_20px_48px_rgba(11,31,51,0.16)] md:p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <div className="dp-kicker">Happy hour walking map</div>
                <h1 className="mt-3 text-[2rem] font-semibold leading-[0.96] tracking-[-0.05em] text-white md:text-[3rem]">
                  Every downtown bar, restaurant, hotel, and speakeasy in one map.
                </h1>
                <p className="mt-3 max-w-2xl text-[14px] leading-6 text-white/72">
                  Use one route to compare downtown happy-hour options fast: location, hours, public specials, and places that still need live offer details.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link to={ROUTES.residentAppCard} className="dp-cta-primary bg-white text-[var(--dp-navy)]">
                  Open perks card
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to={ROUTES.events} className="dp-cta-secondary border-white/12 bg-white/10 text-white">
                  Events calendar
                </Link>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="flex items-center gap-3 rounded-[18px] bg-white/10 px-4 py-3">
                <Search className="h-4 w-4 text-white/64" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by place, district, or special"
                  aria-label="Search by place, district, or special"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/44"
                />
              </div>
              <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/78">
                Showing {mapItems.length} of {filteredItems.length}
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {TYPE_FILTERS.map((filter) => {
                const Icon = filter.icon;
                const active = activeType === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveType(filter.id)}
                    aria-pressed={active}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                      active ? "bg-white text-[var(--dp-navy)]" : "bg-white/10 text-white/76 hover:bg-white/14"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {districtOptions.map((district) => (
                <button
                  key={district}
                  type="button"
                  onClick={() => setActiveDistrict(district)}
                  aria-pressed={activeDistrict === district}
                  className={`shrink-0 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                    activeDistrict === district
                      ? "bg-[var(--dp-gold)] text-[var(--dp-navy)]"
                      : "bg-white/10 text-white/76 hover:bg-white/14"
                  }`}
                >
                  {district}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-6 md:px-6 md:pb-8">
        <div className="dp-page-shell">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="relative overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white" style={{ height: "calc(100vh - 280px)" }}>
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

              <div className="absolute bottom-4 left-4 z-[420] hidden rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-white/94 px-4 py-3 shadow-[0_10px_30px_rgba(11,31,51,0.10)] backdrop-blur md:block">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.46)]">
                  Walking times
                </div>
                <div className="mt-2 space-y-1 text-[13px] text-[rgba(11,31,51,0.68)]">
                  <div>Waterloo Park: 5 min</div>
                  <div>Texas State Capitol: 12 min</div>
                  <div>South Congress: 15 min</div>
                  <div>UT Austin Main Campus: 20 min</div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 z-[420] rounded-full border border-[rgba(11,31,51,0.08)] bg-white/94 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] shadow-[0_10px_30px_rgba(11,31,51,0.10)] backdrop-blur md:hidden">
                Walking time
              </div>
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
                        Active special
                      </span>
                    ) : (
                      <span className="rounded-full bg-[rgba(11,31,51,0.05)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[rgba(11,31,51,0.56)]">
                        Needs details
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-3 text-[13px] leading-6 text-[rgba(11,31,51,0.66)]">
                    <div>{selectedItem.specialLabel || "Special details still being verified."}</div>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-1 h-4 w-4 shrink-0 text-[rgba(11,31,51,0.42)]" />
                      <span>{selectedItem.address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock3 className="mt-1 h-4 w-4 shrink-0 text-[rgba(11,31,51,0.42)]" />
                      <span>{selectedItem.operatingHours || "Hours not listed"}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link to={buildResidentCardHref(selectedItem)} className="dp-cta-primary">
                      Open perks card
                    </Link>
                    {selectedItem.website ? (
                      <a
                        href={selectedItem.website}
                        target="_blank"
                        rel="noreferrer"
                        className="dp-cta-secondary"
                      >
                        Website
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-4 shadow-[0_16px_36px_rgba(11,26,43,0.06)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                  Happy hour spots
                </div>
                <div className="mt-2 text-[13px] text-[rgba(11,31,51,0.6)]">
                  Showing {mapItems.length} of {filteredItems.length}
                </div>
                <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto">
                  {filteredItems.slice(0, 20).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full rounded-[18px] border px-4 py-3 text-left transition ${
                        selectedItem?.id === item.id
                          ? "border-[var(--dp-navy)] bg-[rgba(11,31,51,0.04)]"
                          : "border-[rgba(11,31,51,0.08)] bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[14px] font-semibold text-foreground">{item.name}</div>
                          <div className="mt-1 text-[12px] text-[rgba(11,31,51,0.52)]">
                            {item.kind} · {item.district}
                          </div>
                        </div>
                        <Sparkles className={`h-4 w-4 ${item.hasPublicSpecial ? "text-[var(--dp-gold-deep,#A97816)]" : "text-[rgba(11,31,51,0.32)]"}`} />
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
