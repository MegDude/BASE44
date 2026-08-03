import type { HappyHourVenue } from "@/data/happyHourInventory";
import { isHappyHourLiveNow, isHappyHourStartingSoon } from "@/utils/happyHourTime";
import HappyHourCard from "./HappyHourCard";

type HappyHourRailProps = {
  venues: HappyHourVenue[];
};

export default function HappyHourRail({ venues }: HappyHourRailProps) {
  const groups = [
    { label: "Live Now", items: venues.filter((venue) => isHappyHourLiveNow(venue.happyHours)) },
    { label: "Starting Soon", items: venues.filter((venue) => isHappyHourStartingSoon(venue.happyHours)) },
    { label: "Featured", items: venues.filter((venue) => venue.featured) },
    { label: "Nearby", items: venues },
  ];

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.label}>
          <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-normal text-[#BFA46A]">{group.label}</h3>
          <div className="dp-chip-row flex gap-3 overflow-x-auto pb-2">
            {group.items.slice(0, 8).map((venue) => <HappyHourCard key={`${group.label}-${venue.id}`} venue={venue} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
