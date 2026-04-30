import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";

export default function AskMapCTA() {
  return (
    <div className="rounded-[28px] border border-[rgba(17,24,39,0.08)] bg-[var(--dp-navy,#111827)] px-6 py-8 text-white shadow-[0_18px_44px_rgba(17,24,39,0.12)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
        Final CTA
      </div>
      <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">
        Downtown answers should be live.
      </h2>
      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/78">
        Ask the Map connects search, location, perks, events, scans, and partner insights into one operating layer.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to={ROUTES.explore}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]"
        >
          Open the Map
        </Link>
        <Link
          to={ROUTES.partnerDashboard}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/16 bg-white/8 px-5 py-3 text-sm font-semibold text-white"
        >
          Book Partner Demo
        </Link>
      </div>
    </div>
  );
}

