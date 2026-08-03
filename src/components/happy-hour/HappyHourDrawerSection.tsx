import type { HappyHourVenue } from "@/data/happyHourInventory";
import HappyHourBadge from "./HappyHourBadge";

type HappyHourDrawerSectionProps = {
  venue: Pick<HappyHourVenue, "happyHours" | "needsReview" | "featured">;
};

export default function HappyHourDrawerSection({ venue }: HappyHourDrawerSectionProps) {
  return (
    <section className="rounded-[8px] border border-[#0B1F33]/[0.08] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[13px] font-semibold uppercase tracking-normal text-[#0B1F33]/56">Happy Hour</h3>
        {venue.needsReview ? <HappyHourBadge state="Needs Review" /> : venue.featured ? <HappyHourBadge state="Featured" /> : null}
      </div>
      <div className="mt-3 space-y-3">
        {venue.happyHours.map((item, index) => (
          <div key={`${item.days}-${index}`} className="border-t border-[#0B1F33]/[0.06] pt-3 first:border-t-0 first:pt-0">
            <p className="text-[13px] font-semibold text-[#0B1F33]">{item.days}</p>
            <p className="mt-1 text-[12px] text-[#0B1F33]/60">{item.startTime || "Time"}-{item.endTime || "TBD"}</p>
            <p className="mt-3 text-[11px] uppercase text-[#BFA46A] text-[11px] font-bold uppercase tracking-normal">What's on special</p>
            <p className="mt-1 text-[13px] leading-6 text-[#0B1F33]/68">{item.specials}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
