import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import PartnerInsightMap from "@/components/partner/PartnerInsightMap";
import PartnerCTASection from "@/components/partner/PartnerCTASection";
import ResponsiveScrollSection from "@/components/partner/ResponsiveScrollSection";
import { PARTNER_DASHBOARD_LINK } from "@/lib/partnerContent";

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(40,62%,42%)]">
      {children}
    </p>
  );
}

export default function PartnerTypeTemplate({ content, extraSection = null }) {
  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-[#f6f2ea] pt-[68px] text-[var(--dp-navy,#0B1F33)]">
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to="/partners"
              className="inline-flex items-center gap-2 text-[12px] text-[rgba(11,31,51,0.52)] transition hover:text-[var(--dp-navy,#0B1F33)]"
            >
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              Back to partners
            </Link>
            <SectionLabel>{content.eyebrow}</SectionLabel>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.065em] md:text-7xl">
              {content.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[rgba(11,31,51,0.66)]">
              {content.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={PARTNER_DASHBOARD_LINK}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[var(--dp-navy,#0B1F33)] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[rgba(11,31,51,0.9)]"
              >
                Open intelligence hub
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/partner-workspace"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-white/46 px-5 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy,#0B1F33)] transition hover:bg-white/70"
              >
                Manage offers and events
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="rounded-[30px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_20px_40px_rgba(11,31,51,0.06)]">
            <div className="rounded-[24px] bg-[var(--dp-navy,#0B1F33)] p-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(40,62%,62%)]">
                    Partner outcomes
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em]">{content.shortLabel}</h2>
                </div>
                <Icon className="h-6 w-6 text-[hsl(40,62%,62%)]" strokeWidth={1.75} />
              </div>
              <div className="mt-6 space-y-3">
                {content.outcomes.map((item) => (
                  <div key={item} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(40,62%,62%)]" strokeWidth={2} />
                    <div className="text-sm leading-6 text-white/74">{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <PartnerInsightMap
        partnerType={content.mapMode}
        title={content.intelligenceTitle}
        description={content.intelligenceDescription}
      />

      <section className="border-y border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <SectionLabel>Operating model</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] md:text-5xl">
              What this partner layer actually does.
            </h2>
          </div>

          <ResponsiveScrollSection
            items={content.modules}
            desktopClassName="md:grid-cols-3"
            getKey={(module) => module.title}
            renderItem={(module) => (
              <div
                className="h-full rounded-[22px] border border-[rgba(11,31,51,0.10)] bg-white p-5 shadow-[0_10px_24px_rgba(11,31,51,0.04)]"
              >
                <div className="text-lg font-semibold tracking-[-0.03em]">{module.title}</div>
                <div className="mt-3 text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">{module.body}</div>
              </div>
            )}
          />
        </div>
      </section>

      <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <SectionLabel>Workflow</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] md:text-5xl">
              From launch to measurable local behavior.
            </h2>
            <div className="mt-6 space-y-4">
              {content.workflow.map((step, index) => (
                <div key={step} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(11,31,51,0.10)] bg-white/54 text-[12px] font-semibold">
                    {index + 1}
                  </div>
                  <div className="text-sm leading-6 text-[rgba(11,31,51,0.66)]">{step}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <ResponsiveScrollSection
              items={content.metrics}
              desktopClassName="md:grid-cols-2"
              mobileCardClassName="w-[72%]"
              getKey={(metric) => metric.label}
              renderItem={(metric) => (
                <div className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white/52 p-5">
                  <div className="font-heading text-3xl font-semibold tracking-[-0.055em] text-[hsl(40,62%,42%)]">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-[11px] text-[rgba(11,31,51,0.52)]">{metric.label}</div>
                </div>
              )}
            />

            <div className="rounded-[22px] bg-[var(--dp-navy,#0B1F33)] p-5 text-white">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(40,62%,62%)]">
                Key KPIs
              </div>
              <ResponsiveScrollSection
                items={content.kpis}
                desktopClassName="md:grid-cols-2"
                mobileCardClassName="w-[70%]"
                getKey={(kpi) => kpi}
                renderItem={(kpi) => (
                  <div className="rounded-[14px] bg-white/8 px-4 py-3 text-[13px] text-white/76">
                    {kpi}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </section>

      {extraSection}

      <PartnerCTASection
        headline={`Build the ${content.shortLabel.toLowerCase()} inside Downtown Perks.`}
        description="The partner section should read as one system: open discovery for residents, measured visibility for businesses, and a clear intelligence layer for decisions."
        primaryCTA="Open the partner dashboard"
        primaryHref={PARTNER_DASHBOARD_LINK}
        secondaryLink={{ label: "Back to partner landing", href: "/partners" }}
      />
    </div>
  );
}
