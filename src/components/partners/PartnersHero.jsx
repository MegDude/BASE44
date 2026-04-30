import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";
import { ROUTES } from "@/lib/routes";

export default function PartnersHero({ copy }) {
  return (
    <SectionShell
      id="partner-hero"
      eyebrow={copy.eyebrow}
      title={copy.title}
      body={copy.body}
      className="pt-[116px] md:pt-[132px]"
    >
      <div className="flex flex-wrap gap-3">
        <a
          href="#partner-platform"
          className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-5 py-3 text-sm font-semibold text-white"
        >
          {copy.primaryCta}
        </a>
        <Link
          to={ROUTES.partnerDashboard}
          className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.10)] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]"
        >
          {copy.secondaryCta}
        </Link>
      </div>
    </SectionShell>
  );
}
