import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bike,
  Building2,
  CircleParking,
  Hotel,
  Landmark,
  MapPin,
  ShoppingBag,
  Trees,
  Utensils,
} from "lucide-react";
import { DOWNTOWN_RESIDENTIAL_BUILDINGS } from "@/data/downtownResidentialBuildings";

const DESTINATION_POINTS = [
  { id: "waterloo-park", name: "Waterloo Park", type: "park", latitude: 30.2713, longitude: -97.7366, area: "North edge", detail: "Big green space for events, walks, and easy meet-ups." },
  { id: "republic-square", name: "Republic Square", type: "park", latitude: 30.2676, longitude: -97.7476, area: "West downtown", detail: "A central open square for markets, breaks, and downtown gatherings." },
  { id: "contemporary", name: "The Contemporary Austin", type: "culture", latitude: 30.269272, longitude: -97.742824, area: "Congress", detail: "Art and museum programming right in the middle of downtown." },
  { id: "long-center", name: "Long Center", type: "culture", latitude: 30.2602, longitude: -97.7495, area: "South shore", detail: "A major arts and performance anchor just over the river." },
  { id: "palmer-center", name: "Palmer Events Center", type: "culture", latitude: 30.2592, longitude: -97.7465, area: "South shore", detail: "A large event venue that drives nearby movement and destination traffic." },
];

const AMENITY_KEY = [
  { id: "dining", label: "Dining", icon: Utensils, color: "bg-[rgba(194,143,84,0.14)] text-[var(--dp-gold-deep,#A8733C)]" },
  { id: "shopping", label: "Shopping", icon: ShoppingBag, color: "bg-[rgba(11,31,51,0.08)] text-[var(--dp-navy,#0B1F33)]" },
  { id: "hotels", label: "Hotels", icon: Hotel, color: "bg-[rgba(11,31,51,0.08)] text-[var(--dp-navy,#0B1F33)]" },
  { id: "parks", label: "Parks", icon: Trees, color: "bg-[rgba(46,139,136,0.14)] text-[var(--dp-teal,#2E8B88)]" },
  { id: "parking", label: "Parking", icon: CircleParking, color: "bg-[rgba(11,31,51,0.08)] text-[var(--dp-navy,#0B1F33)]" },
  { id: "bike", label: "Bike Share", icon: Bike, color: "bg-[rgba(11,31,51,0.08)] text-[var(--dp-navy,#0B1F33)]" },
];

const WALKING_TIMES = [
  { label: "Waterloo Park", value: "5 min" },
  { label: "Texas State Capitol", value: "12 min" },
  { label: "South Congress", value: "15 min" },
  { label: "UT Austin", value: "20 min" },
];

const MAP_BOUNDS = {
  north: 30.2722,
  south: 30.2552,
  west: -97.7558,
  east: -97.7318,
};

function projectPoint(latitude, longitude) {
  const x = ((longitude - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100;
  const y = ((MAP_BOUNDS.north - latitude) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100;

  return {
    x: Math.min(91, Math.max(11, x)),
    y: Math.min(90, Math.max(10, y)),
  };
}

function getPointVisual(type) {
  if (type === "park") return { Icon: Trees, accent: "text-[var(--dp-gold,#CFAF5A)]" };
  if (type === "culture") return { Icon: Landmark, accent: "text-[var(--dp-gold,#CFAF5A)]" };
  return { Icon: Building2, accent: "text-[var(--dp-gold,#CFAF5A)]" };
}

export default function ResidentWalkingMap() {
  const [activeId, setActiveId] = useState("the-shore");
  const [showResidential, setShowResidential] = useState(true);
  const [showDestinations, setShowDestinations] = useState(true);
  const [showAllPlaces, setShowAllPlaces] = useState(false);

  const residentialPoints = useMemo(
    () =>
      DOWNTOWN_RESIDENTIAL_BUILDINGS.map((building) => ({
        id: building.id,
        name: building.buildingName,
        type: "residential",
        area: building.cluster,
        detail: building.description,
        units: building.unitCount,
        estimatedResidents: building.estimatedResidents,
        sourceStatus: building.sourceStatus,
        latitude: building.latitude,
        longitude: building.longitude,
        district: building.district,
        ...projectPoint(building.latitude, building.longitude),
      })),
    []
  );

  const destinationPoints = useMemo(
    () =>
      DESTINATION_POINTS.map((point) => ({
        ...point,
        ...projectPoint(point.latitude, point.longitude),
      })),
    []
  );

  const visiblePoints = useMemo(() => {
    return [
      ...(showResidential ? residentialPoints : []),
      ...(showDestinations ? destinationPoints : []),
    ];
  }, [destinationPoints, residentialPoints, showDestinations, showResidential]);

  const activePoint = visiblePoints.find((point) => point.id === activeId) || visiblePoints[0];
  const visiblePlaceRows = useMemo(() => {
    if (showAllPlaces) return visiblePoints;

    const preview = visiblePoints.slice(0, 6);
    if (!activePoint) return preview;
    if (preview.some((point) => point.id === activePoint.id)) return preview;

    return [...preview.slice(0, 5), activePoint];
  }, [activePoint, showAllPlaces, visiblePoints]);

  return (
    <section className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white shadow-[0_16px_42px_rgba(11,31,51,0.06)]">
      <div className="grid gap-0 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
        <div className="border-b border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,#fbfcfe_0%,#f4f7fa_100%)] p-5 xl:border-b-0 xl:border-r">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
            Downtown walking map
          </div>
          <h3 className="mt-2 font-heading text-[2rem] font-semibold leading-[0.96] tracking-[-0.045em] text-foreground">
            Downtown Austin, made easier to read
          </h3>
          <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
            This view shows downtown the way residents actually use it: homes, parks, landmarks, and the places that shape a normal day within walking distance.
          </p>

          <div className="mt-5 space-y-2">
            <button
              type="button"
              onClick={() => setShowResidential((value) => !value)}
              className={`flex w-full items-center justify-between rounded-[16px] border px-3 py-3 text-left text-[13px] font-medium ${
                showResidential
                  ? "border-[rgba(11,31,51,0.08)] bg-white text-foreground"
                  : "border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] text-muted-foreground"
              }`}
            >
              <span>Show homes and towers</span>
              <span className="text-[11px] uppercase tracking-[0.14em]">{showResidential ? "On" : "Off"}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDestinations((value) => !value)}
              className={`flex w-full items-center justify-between rounded-[16px] border px-3 py-3 text-left text-[13px] font-medium ${
                showDestinations
                  ? "border-[rgba(11,31,51,0.08)] bg-white text-foreground"
                  : "border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] text-muted-foreground"
              }`}
            >
              <span>Show parks and destinations</span>
              <span className="text-[11px] uppercase tracking-[0.14em]">{showDestinations ? "On" : "Off"}</span>
            </button>
          </div>

          <div className="mt-5 rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
              Walking times
            </div>
            <div className="mt-3 space-y-2">
              {WALKING_TIMES.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="text-foreground/82">{item.label}</span>
                  <span className="font-semibold text-[var(--dp-navy,#0B1F33)]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative min-h-[640px] overflow-hidden bg-[#eef3f1]">
          <img
            src="/media/downtown-walking-map-reference.png"
            alt="Illustrated downtown Austin walking map"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.08))]" />

          <div className="absolute left-4 top-4 z-20 rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.82)] px-4 py-3 backdrop-blur-md">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
              Downtown Perks view
            </div>
            <div className="mt-1 text-[13px] font-medium text-foreground">
              Homes, parks, and daily-use places in one downtown layer
            </div>
          </div>

          {visiblePoints.map((point) => {
            const { Icon, accent } = getPointVisual(point.type);
            const isActive = activePoint?.id === point.id;
            return (
              <button
                key={point.id}
                type="button"
                onClick={() => setActiveId(point.id)}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              >
                <motion.span
                  animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={isActive ? { duration: 1.9, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full border text-[12px] font-semibold shadow-[0_10px_24px_rgba(11,31,51,0.18)] ${
                    isActive
                      ? "border-[rgba(207,175,90,0.78)] bg-[var(--dp-navy,#0B1F33)]"
                      : "border-[rgba(194,143,84,0.28)] bg-[rgba(255,255,255,0.98)]"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-[var(--dp-gold,#CFAF5A)]" : accent}`} strokeWidth={1.85} />
                  {isActive ? (
                    <span className="absolute inset-[-6px] rounded-full border border-[rgba(194,143,84,0.42)]" />
                  ) : null}
                </motion.span>
              </button>
            );
          })}

          <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-2">
            {AMENITY_KEY.map((item) => {
              const Icon = item.icon;
              return (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.86)] px-3 py-2 text-[11px] font-medium text-foreground shadow-[0_6px_16px_rgba(11,31,51,0.06)] backdrop-blur-md"
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full ${item.color}`}>
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </span>
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="border-t border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,#fbfcfe_0%,#f6f8fb_100%)] p-5 xl:border-t-0 xl:border-l">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
              Key places
            </div>
            {visiblePoints.length > 6 ? (
              <button
                type="button"
                onClick={() => setShowAllPlaces((value) => !value)}
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy,#0B1F33)]"
              >
                {showAllPlaces ? "Show fewer" : `Show all ${visiblePoints.length}`}
              </button>
            ) : null}
          </div>
          <div className="mt-3 space-y-2">
            {visiblePlaceRows.map((point) => {
              const active = activePoint?.id === point.id;
              return (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => setActiveId(point.id)}
                  className={`flex w-full items-start gap-3 rounded-[16px] border px-3 py-3 text-left transition ${
                    active
                      ? "border-[rgba(194,143,84,0.36)] bg-white shadow-[0_10px_22px_rgba(11,31,51,0.06)]"
                      : "border-transparent bg-transparent hover:bg-white/72"
                  }`}
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[rgba(194,143,84,0.26)] bg-white text-[var(--dp-gold,#CFAF5A)]">
                    {(() => {
                      const { Icon } = getPointVisual(point.type);
                      return <Icon className="h-3.5 w-3.5" strokeWidth={1.85} />;
                    })()}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-foreground">{point.name}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[rgba(11,31,51,0.46)]">{point.area}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {activePoint ? (
            <motion.div
              key={activePoint.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white p-4 shadow-[0_10px_24px_rgba(11,31,51,0.05)]"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(11,31,51,0.08)] text-[var(--dp-navy,#0B1F33)]">
                  <MapPin className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
                    Active point
                  </div>
                  <div className="mt-1 text-[18px] font-semibold tracking-[-0.03em] text-foreground">{activePoint.name}</div>
                  <div className="mt-1 text-[12px] font-medium text-[var(--dp-gold-deep,#A8733C)]">
                    {activePoint.area}
                    {activePoint.sourceStatus ? ` · ${activePoint.sourceStatus}` : ""}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[13px] leading-6 text-muted-foreground">{activePoint.detail}</p>
              {activePoint.units ? (
                <div className="mt-4 grid grid-cols-3 gap-3 rounded-[16px] border border-[rgba(11,31,51,0.08)] bg-[#fbfcfe] px-3 py-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.44)]">Units</div>
                    <div className="mt-1 text-[13px] font-semibold text-foreground">{activePoint.units}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.44)]">Residents</div>
                    <div className="mt-1 text-[13px] font-semibold text-foreground">{activePoint.estimatedResidents}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.44)]">District</div>
                    <div className="mt-1 text-[13px] font-semibold text-foreground">{activePoint.district || activePoint.area}</div>
                  </div>
                </div>
              ) : null}
              <div className="mt-4 rounded-[16px] bg-[#f7f9fc] px-3 py-3 text-[12px] leading-5 text-foreground/78">
                Downtown Perks uses this same structure to show what is close by, what is useful, and which parts of downtown fit real day-to-day life.
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
