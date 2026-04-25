import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bike,
  Building2,
  Coffee,
  Hotel,
  Landmark,
  MapPin,
  ParkingCircle,
  ShoppingBag,
  TentTree,
  Trees,
  Utensils,
} from "lucide-react";

const DESTINATION_POINTS = [
  { id: 1, name: "Waterloo Park", type: "park", x: 26.5, y: 18.5, area: "North edge", detail: "Big green space for events, walks, and easy meet-ups." },
  { id: 2, name: "Republic Square", type: "park", x: 17.2, y: 29.4, area: "West downtown", detail: "A central open square for markets, breaks, and downtown gatherings." },
  { id: 3, name: "The Contemporary Austin", type: "culture", x: 58.3, y: 11.4, area: "Congress", detail: "Art and museum programming right in the middle of downtown." },
  { id: 4, name: "530 West Sixth", type: "building", x: 43.8, y: 47.1, area: "West 6th", detail: "Residential and office presence close to everyday downtown use." },
  { id: 5, name: "Sixth and Guadalupe", type: "building", x: 36.1, y: 41.9, area: "CBD", detail: "One of the largest new towers in the core." },
  { id: 6, name: "Seven Nueces", type: "building", x: 29.8, y: 51.4, area: "West downtown", detail: "A newer residential point in the west side of downtown." },
  { id: 7, name: "600 Congress", type: "building", x: 45.3, y: 46.3, area: "Congress", detail: "A known office address and landmark in the center of downtown." },
  { id: 8, name: "8th and Congress", type: "building", x: 42.4, y: 22.4, area: "Congress", detail: "A strong mid-core development point with high foot traffic nearby." },
  { id: 9, name: "118 East 7th", type: "building", x: 50.7, y: 38.4, area: "East side", detail: "An east-core building node close to culture, dining, and events." },
  { id: 10, name: "The Bowie", type: "building", x: 16.8, y: 52.1, area: "Seaholm / West end", detail: "A residential tower with daily-use access to groceries, coffee, and the trail." },
  { id: 11, name: "Austin Convention Center Expansion", type: "building", x: 76.1, y: 66.7, area: "East edge", detail: "A major convention and visitor anchor that affects nearby traffic and stays." },
  { id: 12, name: "601 W 2nd", type: "building", x: 19.8, y: 50.1, area: "Seaholm", detail: "A mixed downtown address near the lake and west-side daily amenities." },
  { id: 13, name: "5th and Brodie", type: "building", x: 31.9, y: 55.8, area: "Seaholm", detail: "A mid-downtown development point close to errands and daily routines." },
  { id: 14, name: "River South", type: "building", x: 52.8, y: 74.7, area: "Rainey edge", detail: "A mixed-use point near the waterfront and the southern downtown crossings." },
  { id: 15, name: "44 East", type: "residential", x: 67.9, y: 74.1, area: "Rainey / Waterfront", detail: "Residential tower with direct trail access and strong lake-facing location." },
  { id: 16, name: "70 Rainey", type: "residential", x: 72.1, y: 84.5, area: "Rainey / Waterfront", detail: "A major Rainey residential address connected to nightlife and the lake." },
  { id: 17, name: "Rainey Street East", type: "residential", x: 75.6, y: 88.4, area: "Rainey", detail: "The eastern Rainey housing cluster tied to food, drinks, and trail movement." },
  { id: 18, name: "Long Center", type: "culture", x: 65.9, y: 84.8, area: "South shore", detail: "A major arts and performance anchor just over the river." },
  { id: 19, name: "Palmer Events Center", type: "building", x: 56.4, y: 72.6, area: "South shore", detail: "A large event venue that drives nearby movement and destination traffic." },
  { id: 20, name: "Waterfront Tower", type: "residential", x: 70.2, y: 89.3, area: "Rainey / Waterfront", detail: "A waterfront residential point at the southern end of the district." },
];

const AMENITY_KEY = [
  { id: "dining", label: "Dining", icon: Utensils, color: "bg-[rgba(194,143,84,0.14)] text-[var(--dp-gold-deep,#A8733C)]" },
  { id: "shopping", label: "Shopping", icon: ShoppingBag, color: "bg-[rgba(11,31,51,0.08)] text-[var(--dp-navy,#0B1F33)]" },
  { id: "hotels", label: "Hotels", icon: Hotel, color: "bg-[rgba(11,31,51,0.08)] text-[var(--dp-navy,#0B1F33)]" },
  { id: "parks", label: "Parks", icon: Trees, color: "bg-[rgba(46,139,136,0.14)] text-[var(--dp-teal,#2E8B88)]" },
  { id: "parking", label: "Parking", icon: ParkingCircle, color: "bg-[rgba(11,31,51,0.08)] text-[var(--dp-navy,#0B1F33)]" },
  { id: "bike", label: "Bike Share", icon: Bike, color: "bg-[rgba(11,31,51,0.08)] text-[var(--dp-navy,#0B1F33)]" },
];

const WALKING_TIMES = [
  { label: "Waterloo Park", value: "5 min" },
  { label: "Texas State Capitol", value: "12 min" },
  { label: "South Congress", value: "15 min" },
  { label: "UT Austin", value: "20 min" },
];

function getPointVisual(type) {
  if (type === "residential") return { Icon: Building2, tone: "bg-[var(--dp-navy,#0B1F33)] text-white border-white/90" };
  if (type === "park") return { Icon: TentTree, tone: "bg-[#2E8B88] text-white border-white/90" };
  if (type === "culture") return { Icon: Landmark, tone: "bg-white text-[var(--dp-navy,#0B1F33)] border-[rgba(11,31,51,0.14)]" };
  return { Icon: Building2, tone: "bg-white text-[var(--dp-navy,#0B1F33)] border-[rgba(11,31,51,0.14)]" };
}

export default function ResidentWalkingMap() {
  const [activeId, setActiveId] = useState(16);
  const [showResidential, setShowResidential] = useState(true);
  const [showDestinations, setShowDestinations] = useState(true);

  const visiblePoints = useMemo(() => {
    return DESTINATION_POINTS.filter((point) => {
      if (point.type === "residential") return showResidential;
      return showDestinations;
    });
  }, [showResidential, showDestinations]);

  const activePoint = visiblePoints.find((point) => point.id === activeId) || visiblePoints[0];

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
            const { Icon, tone } = getPointVisual(point.type);
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
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full border text-[12px] font-semibold shadow-[0_10px_24px_rgba(11,31,51,0.18)] ${tone}`}
                >
                  {point.type === "residential" ? <Icon className="h-4 w-4" strokeWidth={1.8} /> : point.id}
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
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
            Key places
          </div>
          <div className="mt-3 space-y-2">
            {DESTINATION_POINTS.map((point) => {
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
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--dp-navy,#0B1F33)] text-[11px] font-semibold text-white">
                    {point.id}
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
                  <div className="mt-1 text-[12px] font-medium text-[var(--dp-gold-deep,#A8733C)]">{activePoint.area}</div>
                </div>
              </div>
              <p className="mt-4 text-[13px] leading-6 text-muted-foreground">{activePoint.detail}</p>
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
