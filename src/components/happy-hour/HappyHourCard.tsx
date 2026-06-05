import type { HappyHourVenue } from "@/data/happyHourInventory";
import { isHappyHourLiveNow, isHappyHourStartingSoon } from "@/utils/happyHourTime";
import HappyHourBadge from "./HappyHourBadge";

type HappyHourCardProps = {
  venue: HappyHourVenue;
  onSave?: (venue: HappyHourVenue) => void;
  onDirections?: (venue: HappyHourVenue) => void;
};

function badgeFor(venue: HappyHourVenue) {
  if (venue.needsReview) return "Needs Review" as const;
  if (isHappyHourLiveNow(venue.happyHours)) return "Live Now" as const;
  if (isHappyHourStartingSoon(venue.happyHours)) return "Starting Soon" as const;
  if (venue.featured) return "Featured" as const;
  return "Tonight" as const;
}

export default function HappyHourCard({ venue, onSave, onDirections }: HappyHourCardProps) {
  const first = venue.happyHours[0];
  return (
    <article className="min-w-[260px] rounded-[8px] border border-[#0B1F33]/[0.08] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-[#0B1F33]">{venue.name}</h3>
          <p className="mt-1 text-[12px] text-[#0B1F33]/58">{venue.district}</p>
        </div>
        <HappyHourBadge state={badgeFor(venue)} />
      </div>
      {first && (
        <div className="mt-4 space-y-2 text-[12.5px] leading-5 text-[#0B1F33]/68">
          <p className="font-medium text-[#0B1F33]">{first.days} · {first.startTime || "Time"}-{first.endTime || "TBD"}</p>
          <p>{first.specials}</p>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => onSave?.(venue)} className="h-9 rounded-[6px] border border-[#0B1F33]/[0.08] text-[12px] font-medium text-[#0B1F33]">
          Save
        </button>
        <button type="button" onClick={() => onDirections?.(venue)} className="h-9 rounded-[6px] bg-[#0B1F33] text-[12px] font-medium text-white">
          Directions
        </button>
      </div>
    </article>
  );
}
