import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";
import GlassPanel from "@/components/shared/GlassPanel";
import MetricPill from "@/components/shared/MetricPill";
import { getSharedCta } from "@/components/shared/CTARegistry";
import { ROUTES } from "@/lib/routes";

export default function HomeHero({ copy, metrics = [] }) {
  const primary = getSharedCta("explore");
  const secondary = getSharedCta("getCard");

  return (
    <section className="relative overflow-hidden border-b border-[rgba(15,23,42,0.08)] bg-[var(--dp-bg,#f7f8fb)] pt-[88px]">
      <div className="absolute inset-0">
        <img
          src="/media/austin-skyline-dusk.jpeg"
          alt="Downtown Austin skyline at dusk"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,27,47,0.76)_0%,rgba(7,27,47,0.60)_42%,rgba(247,248,251,0.18)_100%)]" />
      </div>
      <SectionShell eyebrow={copy.eyebrow} title="" body="" className="relative py-10 md:py-16">
        <div className="grid min-h-[calc(100vh-120px)] gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold,#CFAF5A)]">
              {copy.eyebrow}
            </div>
            <h1 className="mt-3 font-heading text-[clamp(2.7rem,7vw,5.4rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-white">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-2xl text-[1.02rem] leading-7 text-white/84">{copy.subtitle}</p>
            <p className="mt-4 max-w-2xl text-[15px] leading-8 text-white/74">{copy.body}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to={primary.href} className="inline-flex min-h-[46px] items-center justify-center rounded-[14px] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]">
                {copy.primaryCta || primary.label}
              </Link>
              <Link to={secondary.href} className="inline-flex min-h-[46px] items-center justify-center rounded-[14px] border border-white/14 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-[8px]">
                {copy.secondaryCta || secondary.label}
              </Link>
            </div>
            <div className="mt-4">
              <Link to={ROUTES.askMap} className="inline-flex min-h-[44px] items-center justify-center text-sm font-semibold text-white/88">
                {copy.tertiaryCta}
              </Link>
            </div>
          </div>
          <GlassPanel className="self-end p-6">
            <div className="rounded-[24px] bg-[var(--dp-navy,#111827)] p-6 text-white">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
                Map. Card. Dashboard.
              </div>
              <h2 className="mt-3 font-heading text-[1.8rem] font-semibold tracking-[-0.04em]">
                Downtown, made simple.
              </h2>
              <p className="mt-3 text-[14px] leading-7 text-white/76">
                Find what is close. See what is happening. Use your card when access matters.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {metrics.map((metric) => (
                  <MetricPill key={metric.label} value={metric.value} label={metric.label} />
                ))}
              </div>
            </div>
          </GlassPanel>
        </div>
      </SectionShell>
    </section>
  );
}
