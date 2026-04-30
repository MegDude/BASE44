import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";
import { getSharedCta } from "@/components/shared/CTARegistry";

export default function HomePartnerSummary({ copy }) {
  const overview = getSharedCta("partnerOverview");
  const dashboard = getSharedCta("openDashboard");

  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} variant="navy" className="border-t border-[rgba(15,23,42,0.08)]">
      <p className="max-w-3xl text-[14px] leading-7 text-white/76">{copy.proofLine}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {copy.partnerTypes.map((partner) => (
          <Link
            key={partner.label}
            to={partner.href}
            className="rounded-[24px] border border-white/12 bg-white/8 p-5 transition hover:bg-white/12"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
              {partner.label}
            </div>
            <p className="mt-3 text-[14px] leading-7 text-white/82">{partner.body}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={overview.href} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]">
          {copy.primaryCta || overview.label}
        </Link>
        <Link to={dashboard.href} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] border border-white/16 bg-white/10 px-5 py-3 text-sm font-semibold text-white">
          {copy.secondaryCta || dashboard.label}
        </Link>
      </div>
    </SectionShell>
  );
}
