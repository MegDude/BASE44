import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import PartnerInsightMap from "@/components/partner/PartnerInsightMap";
import PartnerCTASection from "@/components/partner/PartnerCTASection";
import ResponsiveScrollSection from "@/components/partner/ResponsiveScrollSection";
import PlanningForm from "@/components/partner/PlanningForm";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import PartnerPricingSection from "@/components/partner/PartnerPricingSection";

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(40,62%,42%)]">
      {children}
    </p>
  );
}

function renderMetric(item) {
  return (
    <div className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white/60 p-5">
      <div className="text-3xl font-semibold tracking-[-0.05em] text-[var(--dp-navy,#0B1F33)]">
        {item.value}
      </div>
      <div className="mt-1 text-[11px] text-[rgba(11,31,51,0.52)]">
        {item.label}
        {item.detail ? ` · ${item.detail}` : ""}
      </div>
    </div>
  );
}

export default function PartnerTypeTemplate({ content, extraSection = null }) {
  return (
    <div className="min-h-screen bg-[#f6f2ea] pt-[68px] text-[var(--dp-navy,#0B1F33)]">
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.92fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to="/partners"
              className="inline-flex items-center gap-2 text-[12px] text-[rgba(11,31,51,0.52)] transition hover:text-[var(--dp-navy,#0B1F33)]"
            >
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              Partner Directory
            </Link>
            <SectionLabel>{content.eyebrow}</SectionLabel>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.065em] md:text-7xl">
              {content.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[rgba(11,31,51,0.66)]">
              {content.heroDescription}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={content.heroPrimaryCta.href}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[var(--dp-navy,#0B1F33)] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[rgba(11,31,51,0.9)]"
              >
                {content.heroPrimaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {content.heroSecondaryCta ? (
                <Link
                  to={content.heroSecondaryCta.href}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-white/42 px-5 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy,#0B1F33)] transition hover:bg-white/68"
                >
                  {content.heroSecondaryCta.label}
                </Link>
              ) : null}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {content.heroStats.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[24px] border border-[rgba(11,31,51,0.10)] bg-white p-5 shadow-[0_10px_24px_rgba(11,31,51,0.04)]"
                >
                  <div className="text-3xl font-semibold tracking-[-0.05em]">
                    {metric.value}
                  </div>
                  <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <PartnerInsightMap
        partnerType={content.mapMode}
        title={content.mapPreviewTitle}
        description={content.mapPreviewDescription}
      />

      {content.liveMoments?.length || content.venueList?.length ? (
        <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <SectionLabel>{content.liveMomentsTitle || "Live activity"}</SectionLabel>
              <div className="mt-6 space-y-3">
                {(content.liveMoments || []).map((item) => (
                  <div key={`${item.title}-${item.meta}`} className="rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-white p-4">
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="mt-1 text-[13px] text-[rgba(11,31,51,0.62)]">{item.meta}</div>
                    {item.stamp ? (
                      <div className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[hsl(40,62%,42%)]">{item.stamp}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {content.venueList?.length ? (
              <div>
                <SectionLabel>{content.venueListTitle}</SectionLabel>
                <div className="mt-6 rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-4">
                  <div className="space-y-3">
                    {content.venueList.map((item) => (
                      <div key={item.name} className="flex items-center justify-between rounded-[16px] bg-[rgba(11,31,51,0.03)] px-4 py-3">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-[13px] text-[rgba(11,31,51,0.54)]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {content.modules?.length ? (
        <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <SectionLabel>{content.modulesTitle || "How it works"}</SectionLabel>
            </div>
            <ResponsiveScrollSection
              items={content.modules}
              desktopClassName="md:grid-cols-3"
              mobileCardClassName="w-[84%]"
              getKey={(item) => item.title}
              renderItem={(item) => (
                <div className="h-full rounded-[22px] border border-[rgba(11,31,51,0.10)] bg-white p-5 shadow-[0_10px_24px_rgba(11,31,51,0.04)]">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-[hsl(40,62%,42%)]">
                    {item.metric}
                  </div>
                  <div className="mt-3 text-lg font-semibold tracking-[-0.03em]">{item.title}</div>
                  <div className="mt-3 text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">{item.body}</div>
                </div>
              )}
            />
          </div>
        </section>
      ) : null}

      {content.secondaryStats?.length ? (
        <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {content.secondaryStats.map((item) => (
                <div key={`${item.label}-${item.value}`}>{renderMetric(item)}</div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {content.workflow?.length ? (
        <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <SectionLabel>{content.stepsTitle || "How it works"}</SectionLabel>
              {content.stepsIntro ? (
                <p className="mt-5 text-sm leading-6 text-[rgba(11,31,51,0.62)]">
                  {content.stepsIntro}
                </p>
              ) : null}
            </div>
            <div className="space-y-4">
              {content.workflow.map((step, index) => (
                <div key={step} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(11,31,51,0.10)] bg-white/54 text-[12px] font-semibold">
                    {index + 1}
                  </div>
                  <div className="text-sm leading-6 text-[rgba(11,31,51,0.66)]">{step}</div>
                </div>
              ))}
              {content.stepMetrics?.length ? (
                <div className="pt-4 flex flex-wrap gap-2">
                  {content.stepMetrics.map((item) => (
                    <span key={item} className="rounded-full border border-[rgba(11,31,51,0.10)] bg-white px-3 py-2 text-[12px] text-[rgba(11,31,51,0.64)]">
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {content.useCases?.length ? (
        <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <SectionLabel>{content.useCasesTitle || "Use cases"}</SectionLabel>
              {content.useCasesIntro ? (
                <p className="mt-4 text-sm leading-6 text-[rgba(11,31,51,0.62)]">
                  {content.useCasesIntro}
                </p>
              ) : null}
            </div>
            <ResponsiveScrollSection
              items={content.useCases}
              desktopClassName="md:grid-cols-2 lg:grid-cols-4"
              mobileCardClassName="w-[84%]"
              getKey={(item) => item.title}
              renderItem={(item) => (
                <div className="h-full rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white p-5">
                  <div className="text-lg font-semibold tracking-[-0.03em]">{item.title}</div>
                  <div className="mt-3 text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">{item.detail}</div>
                  {item.meta ? (
                    <div className="mt-4 text-[11px] uppercase tracking-[0.14em] text-[hsl(40,62%,42%)]">
                      {item.meta}
                    </div>
                  ) : null}
                </div>
              )}
            />
          </div>
        </section>
      ) : null}

      {content.liveActivity?.length ? (
        <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 max-w-3xl">
              <SectionLabel>{content.liveActivityTitle || "Live activity"}</SectionLabel>
              {content.liveActivityIntro ? (
                <p className="mt-4 text-sm leading-6 text-[rgba(11,31,51,0.62)]">{content.liveActivityIntro}</p>
              ) : null}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {content.liveActivity.map((item) => (
                <div key={`${item.title}-${item.stamp}`} className="rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-white p-4">
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="mt-1 text-[13px] text-[rgba(11,31,51,0.62)]">{item.meta}</div>
                  <div className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[hsl(40,62%,42%)]">{item.stamp}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <PlanningForm partnerType={{ ...content.form, label: content.label }} />

      {content.faqs?.length ? (
        <FAQAccordionBlock
          sectionEyebrow={content.faqTitle}
          sectionTitle={content.faqTitle}
          sectionIntro={content.faqIntro}
          items={content.faqs}
          styleVariant="split"
          pageType="partners"
        />
      ) : null}

      <PartnerPricingSection
        title={`${content.label} pricing`}
        intro="Pricing is part of the partner system, not a detached marketing tab."
      />

      {extraSection}

      <PartnerCTASection
        headline={content.closing.title}
        description={content.closing.description}
        primaryCTA={content.closing.primary.label}
        primaryHref={content.closing.primary.href}
        secondaryLink={{
          label: content.closing.secondary.label,
          href: content.closing.secondary.href,
        }}
        footerText={content.closing.footer}
      />
    </div>
  );
}
