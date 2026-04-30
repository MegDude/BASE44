import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";
import { getSharedCta } from "@/components/shared/CTARegistry";

export default function HomeFinalCTA({ copy }) {
  const explore = getSharedCta("explore");
  const buildings = getSharedCta("openBuildings");
  const contact = getSharedCta("contact");

  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="rounded-[32px] bg-[var(--dp-navy,#111827)] px-6 py-8 text-white md:px-8 md:py-10">
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
          <Link to={explore.href} className="inline-flex min-h-[46px] items-center justify-center rounded-[14px] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]">
            {copy.ctas[0] || explore.label}
          </Link>
          <Link to={buildings.href} className="inline-flex min-h-[46px] items-center justify-center rounded-[14px] border border-white/16 bg-white/10 px-5 py-3 text-sm font-semibold text-white">
            {copy.ctas[1] || buildings.label}
          </Link>
          <a href={contact.href} className="inline-flex min-h-[46px] items-center justify-center rounded-[14px] border border-white/16 bg-white/10 px-5 py-3 text-sm font-semibold text-white">
            {copy.ctas[2] || contact.label}
          </a>
        </div>
        <p className="mt-5 text-sm text-white/70">{copy.email}</p>
      </div>
    </SectionShell>
  );
}
