import { useState } from "react";
import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";
import { getSharedCta } from "@/components/shared/CTARegistry";

export default function HomePartnerFit({ copy }) {
  const [activeRole, setActiveRole] = useState(copy.roles[0]);
  const fitCta = getSharedCta("seePartnerFit");
  const pilotCta = getSharedCta("startPilot");

  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-col lg:overflow-visible">
          {copy.roles.map((role) => {
            const active = activeRole.label === role.label;
            return (
              <button
                key={role.label}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveRole(role)}
                className={`rounded-full border px-4 py-3 text-left text-sm font-semibold lg:rounded-[20px] ${
                  active
                    ? "border-[rgba(207,175,90,0.28)] bg-[rgba(207,175,90,0.12)] text-[var(--dp-navy,#111827)]"
                    : "border-[rgba(15,23,42,0.10)] bg-white text-[rgba(71,85,105,0.94)]"
                }`}
              >
                {role.label}
              </button>
            );
          })}
        </div>
        <div className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
            {activeRole.price}
          </div>
          <h3 className="mt-3 text-[1.4rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">{activeRole.title}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{activeRole.atAGlance}</p>
          <p className="mt-3 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{activeRole.body}</p>
          <div className="mt-5 rounded-[20px] bg-[rgba(247,247,251,0.9)] p-4 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">
            {copy.note}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={activeRole.href} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-5 py-3 text-sm font-semibold text-white">
              {activeRole.cta}
            </Link>
            <Link to={fitCta.href} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.10)] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]">
              {copy.primaryCta || fitCta.label}
            </Link>
            <Link to={pilotCta.href} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.10)] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]">
              {copy.secondaryCta || pilotCta.label}
            </Link>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
