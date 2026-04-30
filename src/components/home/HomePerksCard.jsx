import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";
import GlassPanel from "@/components/shared/GlassPanel";
import { getSharedCta } from "@/components/shared/CTARegistry";

export default function HomePerksCard({ copy }) {
  const primary = getSharedCta("getCard");
  const secondary = getSharedCta("openMap");

  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="flex flex-wrap gap-3">
            <Link to={primary.href} className="inline-flex min-h-[46px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-5 py-3 text-sm font-semibold text-white">
              {copy.primaryCta || primary.label}
            </Link>
            <Link to={secondary.href} className="inline-flex min-h-[46px] items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.10)] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]">
              {copy.secondaryCta || secondary.label}
            </Link>
          </div>
        </div>
        <GlassPanel className="p-5">
          <div className="rounded-[24px] bg-[var(--dp-navy,#111827)] p-6 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/58">Downtown Perks</div>
                <div className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em]">Resident Card</div>
              </div>
              <div className="rounded-full bg-[rgba(207,175,90,0.18)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
                Active
              </div>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {["Saved places", "Live RSVPs", "Perk access", "Simple QR entry"].map((item) => (
                <div key={item} className="rounded-[16px] border border-white/10 bg-white/6 p-4 text-[13px] text-white/76">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      </div>
    </SectionShell>
  );
}
