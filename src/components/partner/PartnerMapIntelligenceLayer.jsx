import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Hotel,
  MapPin,
  Megaphone,
  Store,
} from "lucide-react";

const KIND_ICONS = {
  brand: Megaphone,
  civic: Megaphone,
  hotel: Hotel,
  property: Building2,
  venue: Store,
};

const VISUAL_SETS = {
  civic: [
    "/images/map-entities/perks/civic_republic_square_1779052838327.png",
    "/images/splash/walkable-map.png",
    "/images/map-entities/perks/civic_lake_trail_1779052853070.png",
  ],
  brand: [
    "/images/splash/walkable-map.png",
    "/images/imported/perks/scanning-downtown-perks-in-a-cafe.png",
    "/images/residents/downtown-rooftop-evening.png",
  ],
  hotel: [
    "/images/imported/perks/hotel-van-zandt-entrance.jpg",
    "/images/partners/hospitality-rooftop-social.png",
    "/images/splash/walkable-map.png",
  ],
  property: [
    "/images/buildings/lobby-to-street-arrival.png",
    "/images/splash/resident-access.jpeg",
    "/images/splash/walkable-map.png",
  ],
  venue: [
    "/images/map-entities/dining/outdoor-dining-arrival.avif",
    "/images/restaurants/bangers-bar.webp",
    "/images/imported/perks/daydreamer-coffee-at-paseo-tower.jpg",
  ],
};

const STORY_BY_KIND = {
  civic: {
    eyebrow: "Public participation",
    headline: "See participation take shape.",
    body: "Public moments, district activity, and event interest become easier to see while people are already exploring downtown.",
  },
  brand: {
    eyebrow: "Campaign results",
    headline: "See what worked downtown.",
    body: "Placements, QR scans, resident saves, and redemptions become visible by location and moment.",
  },
  hotel: {
    eyebrow: "Guest activity",
    headline: "See what guests used nearby.",
    body: "Lobby access, saved plans, RSVPs, and local recommendations become clearer across the stay.",
  },
  property: {
    eyebrow: "Resident activity",
    headline: "See how residents use downtown.",
    body: "Building scans, saved places, nearby perks, and event activity show which parts of the neighborhood are working.",
  },
  venue: {
    eyebrow: "Nearby activity",
    headline: "See nearby demand in motion.",
    body: "Offers, walkable searches, saves, visits, and redemptions show up in the same context people use to decide.",
  },
};

function getBounds(items) {
  const valid = items.filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));
  if (!valid.length) return { minLat: 30.255, maxLat: 30.275, minLng: -97.755, maxLng: -97.735 };

  const lats = valid.map((item) => item.lat);
  const lngs = valid.map((item) => item.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latPad = Math.max((maxLat - minLat) * 0.2, 0.003);
  const lngPad = Math.max((maxLng - minLng) * 0.2, 0.003);

  return {
    minLat: minLat - latPad,
    maxLat: maxLat + latPad,
    minLng: minLng - lngPad,
    maxLng: maxLng + lngPad,
  };
}

function positionFor(item, bounds) {
  const x = ((item.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y = (1 - (item.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
  return {
    left: `${Math.min(92, Math.max(8, x))}%`,
    top: `${Math.min(88, Math.max(10, y))}%`,
  };
}

function getVisualKind(kind, caption, insight) {
  const text = `${kind} ${caption || ""} ${insight || ""}`.toLowerCase();
  if (text.includes("civic") || text.includes("public") || text.includes("district")) return "civic";
  return VISUAL_SETS[kind] ? kind : "brand";
}

export default function PartnerMapIntelligenceLayer({
  activeId,
  caption = "Live downtown layer",
  insight,
  kind = "property",
  nearby = [],
  onSelect,
  points = [],
}) {
  const safePoints = points.length ? points : [];
  const allPoints = [...safePoints, ...nearby];
  const bounds = useMemo(() => getBounds(allPoints), [allPoints]);
  const selectedIndex = Math.max(
    safePoints.findIndex((point) => point.id === activeId),
    0,
  );
  const selected = safePoints[selectedIndex];
  const visualKind = getVisualKind(kind, caption, insight);
  const visuals = VISUAL_SETS[visualKind] || VISUAL_SETS.brand;
  const visual = visuals[selectedIndex % visuals.length];
  const story = STORY_BY_KIND[visualKind] || STORY_BY_KIND.brand;
  const SelectedIcon = KIND_ICONS[visualKind] || KIND_ICONS[kind] || MapPin;
  const progress =
    safePoints.length > 1 ? (selectedIndex / (safePoints.length - 1)) * 100 : 100;

  return (
    <div className="relative h-full min-h-[430px] overflow-hidden rounded-[18px] bg-white text-[#0B1F33] shadow-[0_24px_80px_rgba(11,31,51,0.08),inset_0_0_0_1px_rgba(11,31,51,0.06)]">
      <AnimatePresence mode="wait">
        <motion.img
          key={visual}
          src={visual}
          alt=""
          className="absolute inset-0 h-full w-full object-cover brightness-[1.04] contrast-[1.02] saturate-[0.92]"
          initial={{ opacity: 0, scale: 1.025 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.015 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.94),rgba(255,255,255,0.50)_42%,rgba(255,255,255,0.18)),linear-gradient(180deg,rgba(255,255,255,0.10),rgba(11,31,51,0.16))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_24%,rgba(179,143,79,0.10),transparent_30%),radial-gradient(circle_at_74%_70%,rgba(11,31,51,0.08),transparent_32%)]" />

      <div className="absolute left-5 right-5 top-5 z-20 max-w-[24rem] bg-white/72 p-4 text-[#0B1F33] shadow-[0_16px_44px_rgba(11,31,51,0.08),inset_0_1px_0_rgba(255,255,255,0.74)] backdrop-blur-[18px] sm:left-6 sm:right-auto sm:top-6">
        <span className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[#A98B4A]">
          {caption || story.eyebrow}
        </span>
        <h3 className="mt-3 font-heading text-[34px] font-bold leading-[0.96] tracking-[-0.03em] text-[#0B1F33] md:text-[48px]">
          {story.headline}
        </h3>
        <p className="mt-4 max-w-sm font-body text-[14px] leading-relaxed text-[#425466] md:text-[15px]">
          {insight || story.body}
        </p>
      </div>

      {nearby.map((item) => (
        <div
          key={item.name}
          className="absolute z-[4] h-2 w-2 -translate-x-1/2 -translate-y-1/2 bg-[#A98B4A] shadow-[0_0_0_5px_rgba(179,143,79,0.10),0_0_18px_rgba(179,143,79,0.10)]"
          style={positionFor(item, bounds)}
          title={item.name}
        />
      ))}

      {selected && (
        <motion.div
          key={selected.id}
          className="absolute bottom-[5.35rem] left-5 right-5 z-20 max-w-xl sm:left-6 sm:right-auto sm:w-[min(32rem,calc(100%-3rem))]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bg-white/76 p-4 text-[#0B1F33] shadow-[0_16px_44px_rgba(11,31,51,0.09),inset_0_1px_0_rgba(255,255,255,0.74)] backdrop-blur-[18px]">
            <div className="flex items-start gap-3">
              {selected.logo ? (
                <img src={selected.logo} alt="" className="h-10 w-10 shrink-0 bg-white object-cover" />
              ) : (
                <SelectedIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#A98B4A]" />
              )}
              <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold text-[#0B1F33]">{selected.name}</div>
                <div className="mt-1 text-[12px] leading-5 text-[#425466]">
                  {selected.signal ||
                    selected.trigger ||
                    selected.top ||
                    selected.type ||
                    selected.dist ||
                    "Showing what people nearby can use right now."}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {!!safePoints.length && (
        <div className="absolute bottom-5 left-5 right-5 z-30">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-[#0B1F33]/12" />
            <div
              className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-[#A98B4A] transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
            {safePoints.map((point, index) => {
              const active = point.id === selected?.id;
              const Icon = KIND_ICONS[visualKind] || KIND_ICONS[kind] || MapPin;
              return (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => onSelect?.(point)}
                  className={`relative z-10 grid h-9 w-9 place-items-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A98B4A] sm:h-10 sm:w-10 ${
                    active || index <= selectedIndex
                      ? "bg-[#0B1F33] text-[#A98B4A] shadow-[0_10px_24px_rgba(11,31,51,0.12)]"
                      : "bg-white/84 text-[#0B1F33]/42 shadow-[0_8px_20px_rgba(11,31,51,0.05)] backdrop-blur-[18px] hover:bg-white hover:text-[#0B1F33]"
                  }`}
                  aria-label={`Show ${point.name}`}
                  aria-pressed={active}
                  title={point.name}
                >
                  {point.logo ? (
                    <img src={point.logo} alt="" className="h-5 w-5 bg-white object-cover" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
