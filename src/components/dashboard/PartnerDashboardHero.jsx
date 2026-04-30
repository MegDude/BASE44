import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";

export default function PartnerDashboardHero({ copy }) {
  return (
    <section className="px-4 pb-10 pt-[116px] md:px-6 md:pt-[132px]">
      <div className="mx-auto max-w-[1180px]">
        <div className="max-w-3xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold,#CFAF5A)]">
            {copy.eyebrow}
          </div>
          <h1 className="mt-3 font-heading text-[clamp(2.6rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--dp-navy,#111827)]">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-8 text-[rgba(71,85,105,0.94)]">
            {copy.body}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={ROUTES.explore} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-5 py-3 text-sm font-semibold text-white">
              {copy.primaryCta}
            </Link>
            <Link to={ROUTES.partners} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.10)] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]">
              {copy.secondaryCta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
