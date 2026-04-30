import { useMemo, useState } from "react";
import {
  Building2,
  Calendar,
  Clock3,
  MapPin,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { Link } from "react-router-dom";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import { usePartnerInsights } from "@/lib/map/partnerInsights";
import MapSearchRail from "@/components/map/MapSearchRail";

const RADIUS_DISTRICTS = ["West 6th", "Rainey", "Congress", "Seaholm", "Waterloo"];

function toMarkerEntity(item) {
  const typeMap = {
    venue: "venue",
    building: "building",
    hotel: "hotel",
    district: "civic",
    campaign: "brand",
    zone: "moment",
    event: "event",
  };

  return {
    ...item,
    type: typeMap[item.entityType] || "venue",
    markerType: typeMap[item.entityType] || "venue",
  };
}

export default function PartnerPlatformMapPreview({
  partnerType = "property",
  route,
  ctaPrimaryHref,
  ctaPrimaryLabel,
  ctaSecondaryHref,
  ctaSecondaryLabel,
  label,
}) {
  const [selected, setSelected] = useState(null);
  const [railType, setRailType] = useState("all");
  const [timeWindow, setTimeWindow] = useState("5min");
  const [openNowOnly, setOpenNowOnly] = useState(false);

  const { items: allItems, loading } = usePartnerInsights(partnerType);

  const filteredItems = useMemo(() => {
    const byRailType = allItems.filter((item) => {
      if (railType === "all") return true;
      if (railType === "venues") return item.entityType === "venue" || item.entityType === "hotel";
      if (railType === "perks") {
        const text = `${item.title} ${item.summary} ${item.shortInsight} ${(item.tags || []).join(" ")}`.toLowerCase();
        return Number(item.metrics?.activePerks || 0) > 0 || text.includes("perk") || text.includes("offer");
      }
      if (railType === "events") return item.entityType === "event" || (item.relatedEvents || []).length > 0;
      if (railType === "buildings") return item.entityType === "building";
      return true;
    });

    const byOpenNow = openNowOnly
      ? byRailType.filter((item) => Number(item.metrics?.visits || 0) > 0 || Number(item.metrics?.redemptions || 0) > 0)
      : byRailType;

    if (timeWindow === "5min") return byOpenNow.filter((item) => RADIUS_DISTRICTS.includes(item.district));
    if (timeWindow === "10min") {
      return byOpenNow.filter((item) =>
        ["West 6th", "Rainey", "Congress", "Seaholm", "Waterloo", "Red River", "Market District"].includes(item.district)
      );
    }
    return byOpenNow;
  }, [allItems, openNowOnly, railType, timeWindow]);

  const mapItems = useMemo(() => filteredItems.map(toMarkerEntity), [filteredItems]);
  const selectedDetail = selected && selected.metadata?.clusterItems?.length ? selected.metadata.clusterItems[0] : selected;

  const railPrimaryItems = [
    { id: "all", label: "All", icon: MapPin, active: railType === "all", onClick: () => setRailType("all") },
    { id: "places", label: "Places", icon: UtensilsCrossed, active: railType === "venues", onClick: () => setRailType("venues") },
    { id: "perks", label: "Perks", icon: Sparkles, active: railType === "perks", onClick: () => setRailType("perks") },
    { id: "events", label: "Events", icon: Calendar, active: railType === "events", onClick: () => setRailType("events") },
    { id: "buildings", label: "Buildings", icon: Building2, active: railType === "buildings", onClick: () => setRailType("buildings") },
    { id: "open", label: "Open now", icon: Clock3, active: openNowOnly, onClick: () => setOpenNowOnly((current) => !current) },
  ];

  const railUtilityItems = [
    { id: "live", label: "Live", active: timeWindow === "live", accent: true, onClick: () => setTimeWindow("live") },
    { id: "5min", label: "5 min", active: timeWindow === "5min", onClick: () => setTimeWindow("5min") },
    { id: "10min", label: "10 min", active: timeWindow === "10min", onClick: () => setTimeWindow("10min") },
  ];

  return (
    <div className="overflow-hidden rounded-[24px] border border-[rgba(11,31,51,0.05)] bg-[rgba(248,250,252,0.88)]">
      <div className="border-b border-[rgba(11,31,51,0.06)] px-4 py-3 md:px-5">
        <MapSearchRail primaryItems={railPrimaryItems} utilityItems={railUtilityItems} />
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div className="relative min-h-[420px]">
          <div className="absolute inset-0">
            <UnifiedMapShell
              items={mapItems}
              onMarkerSelect={setSelected}
              selectedId={selected?.id}
              className="h-full w-full"
            />
          </div>
          {loading ? (
            <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/92 px-3 py-2 text-[11px] font-medium text-foreground/60 shadow-[0_10px_24px_rgba(11,31,51,0.06)]">
              Loading map…
            </div>
          ) : null}
        </div>

        <div className="flex flex-col border-t border-[rgba(11,31,51,0.06)] bg-white/82 lg:border-l lg:border-t-0">
          <div className="border-b border-[rgba(11,31,51,0.06)] px-4 py-4 md:px-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/42">
              {label} live map
            </div>
            <div className="mt-2 text-[13px] leading-6 text-muted-foreground">
              {selected
                ? "Tap through clustered areas or single pins to inspect what residents or guests would actually see."
                : "The map is the product surface. Click a pin to inspect the live downtown context."}
            </div>
          </div>

          <div className="flex-1 px-4 py-4 md:px-5">
            {selectedDetail ? (
              <div>
                <div className="text-[14px] font-semibold text-foreground">
                  {selected.title || selectedDetail.title}
                </div>
                <div className="mt-1 text-[11px] text-foreground/46">
                  {selected.metadata?.clusterCount ? `${selected.metadata.clusterCount} grouped pins` : selectedDetail.district || selected.district || "Downtown Austin"}
                </div>
                <div className="mt-3 text-[12px] leading-6 text-muted-foreground">
                  {selectedDetail.shortInsight || selectedDetail.summary || selected.summary || "Live nearby context, walkable options, and the places most likely to matter next."}
                </div>

                {selected.metadata?.clusterItems?.length ? (
                  <div className="mt-4 space-y-2">
                    {selected.metadata.clusterItems.slice(0, 4).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelected(item)}
                        className="flex w-full items-start justify-between rounded-[16px] border border-[rgba(11,31,51,0.06)] bg-[rgba(248,250,252,0.74)] px-3 py-2.5 text-left"
                      >
                        <span className="min-w-0">
                          <span className="block text-[12px] font-semibold text-foreground">{item.title}</span>
                          <span className="mt-0.5 block text-[11px] text-muted-foreground">{item.district || "Downtown Austin"}</span>
                        </span>
                        <span className="ml-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold-muted)]">
                          Open
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-[18px] bg-[rgba(248,250,252,0.72)] px-4 py-4 text-[12px] leading-6 text-muted-foreground">
                Click into a building, venue, event, or grouped neighborhood area to inspect the live downtown layer.
              </div>
            )}
          </div>

          <div className="border-t border-[rgba(11,31,51,0.06)] px-4 py-4 md:px-5">
            <div className="flex flex-wrap gap-3">
              <Link to={ctaPrimaryHref} className="dp-cta-primary">
                {ctaPrimaryLabel}
              </Link>
              <Link to={route} className="dp-cta-secondary">
                Open {label} page
              </Link>
              <Link to={ctaSecondaryHref} className="dp-cta-secondary">
                {ctaSecondaryLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
