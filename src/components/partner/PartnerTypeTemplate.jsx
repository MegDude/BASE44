import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import PartnerHeaderStage from "@/components/partner/PartnerHeaderStage";
import PartnerInsightMap from "@/components/partner/PartnerInsightMap";
import PartnerCTASection from "@/components/partner/PartnerCTASection";
import WorkflowVisualizer from "@/components/partner/WorkflowVisualizer";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import PricingGlanceSection from "@/components/shared/PricingGlanceSection";
import { getPartnerDashboardRoute } from "@/lib/routes";
import { useCTAFlow } from "@/components/cta/CTAFlowProvider";
import {
  FAQ_RESIDENTIAL,
  FAQ_BRANDS,
  FAQ_CIVIC,
  FAQ_HOSPITALITY,
  FAQ_VENUES,
} from "@/lib/faq-partner-data";

function SectionLabel({ children }) {
  return <p className="dp-micro-label">{children}</p>;
}

const FAQ_BY_PARTNER_ID = {
  properties: FAQ_RESIDENTIAL,
  hospitality: FAQ_HOSPITALITY,
  venues: FAQ_VENUES,
  brands: FAQ_BRANDS,
  civic: FAQ_CIVIC,
};

export default function PartnerTypeTemplate({ content, extraSection = null }) {
  const Icon = content.icon;
  const { openFlow } = useCTAFlow();
  const dashboardRoute = getPartnerDashboardRoute(content.id);

  const flowTypeByMapMode = {
    property: "residential_onboarding",
    hospitality: "hospitality_onboarding",
    venue: "venue_onboarding",
    brand: "brand_campaign",
    civic: "civic_onboarding",
  };

  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)] pt-[68px] text-[var(--dp-navy,#0B1A2B)]">
      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell grid gap-8">
          <Link
            to="/partners"
            className="inline-flex items-center gap-2 text-[12px] text-[rgba(11,31,51,0.52)] transition hover:text-[var(--dp-navy,#0B1F33)]"
          >
            <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            Back to partners
          </Link>

          <PartnerHeaderStage
            eyebrow={content.eyebrow}
            title={content.headline}
            description={content.description}
            metrics={content.metrics.slice(0, 3)}
            actions={
              <>
                <Link to={dashboardRoute} className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[var(--dp-navy)] px-6 text-[13px] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_8px_20px_rgba(15,23,42,0.14)] transition-colors hover:bg-[var(--dp-navy-soft)]">
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    openFlow({
                      type: flowTypeByMapMode[content.mapMode] || "start_here",
                      source: `partner_type_template_${content.id}`,
                      sourceComponent: "PartnerTypeTemplate",
                      partnerType: content.id,
                      pageContext: {
                        objective: content.description,
                      },
                      successRoute: content.route,
                    })
                  }
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[var(--dp-border)] bg-transparent px-6 text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--dp-navy)] transition-colors hover:bg-white/70"
                >
                  Start pilot
                </button>
              </>
            }
          />

          <motion.section
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="overflow-hidden rounded-[30px] border border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,rgba(11,31,51,0.98),rgba(16,39,62,0.96))] text-white"
          >
            <div className="grid gap-0 lg:grid-cols-[0.86fr_1.14fr]">
              <div className="border-b border-white/10 px-6 py-6 lg:border-b-0 lg:border-r lg:border-white/10 lg:px-8 lg:py-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="dp-micro-label text-[var(--dp-gold)]">What you get</p>
                    <h2 className="dp-heading-modern-light mt-4 text-3xl">{content.shortLabel}</h2>
                  </div>
                  <Icon className="h-6 w-6 text-[var(--dp-gold)]" strokeWidth={1.75} />
                </div>
                <p className="mt-4 max-w-sm text-[14px] leading-7 text-white/72">
                  One live operating surface for visibility, action, and proof instead of a page full of separate widgets.
                </p>
              </div>

              <div>
                {content.outcomes.map((item, index) => (
                  <div
                    key={item}
                    className={`grid gap-3 px-6 py-5 md:grid-cols-[48px_minmax(0,1fr)] md:px-8 ${
                      index < content.outcomes.length - 1 ? "border-b border-white/10" : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/14 text-[12px] font-semibold text-[var(--dp-gold)]">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="flex gap-3">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--dp-gold)]" strokeWidth={2} />
                      <p className="text-sm leading-7 text-white/76">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        </div>
      </section>

      <PartnerInsightMap
        partnerType={content.mapMode}
        title={content.intelligenceTitle}
        description={content.intelligenceDescription}
      />

      <PricingGlanceSection
        eyebrow="Sign up"
        title="Start with the pricing that fits."
        intro="Apply now, launch on a 90-day pilot, and move to paid only after the rollout is live enough to judge."
        source={`partner_page_${content.id}_pricing`}
      />

      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell">
          <div className="mb-8 max-w-3xl">
            <SectionLabel>Included</SectionLabel>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="dp-heading-modern mt-4 max-w-3xl text-[2rem] md:text-[2.8rem]"
            >
              What is included.
            </motion.h2>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white">
            {content.modules.map((module, index) => (
              <div
                key={module.title}
                className={`grid gap-5 px-5 py-5 md:grid-cols-[180px_minmax(0,1fr)_220px] md:px-8 md:py-7 ${
                  index < content.modules.length - 1 ? "border-b border-[rgba(11,31,51,0.08)]" : ""
                }`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold-muted)]">
                  Module {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="dp-heading-modern text-[1.2rem]">
                    {module.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-7 text-[rgba(11,31,51,0.68)]">
                    {module.body}
                  </p>
                </div>
                <div className="border-t border-[rgba(11,31,51,0.08)] pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                  <div className="dp-micro-label text-[rgba(11,31,51,0.48)]">Why it matters</div>
                  <p className="mt-3 text-[13px] leading-6 text-[rgba(11,31,51,0.72)]">
                    This module stays inside the same operating surface, so the partner team is not bouncing between tools just to understand what to do next.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <SectionLabel>Rollout path</SectionLabel>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="dp-heading-modern mt-4 max-w-3xl text-[2rem] md:text-[2.8rem]"
            >
              From launch to real results.
            </motion.h2>
            <WorkflowVisualizer
              steps={content.workflow}
              title="How it works"
              className="mt-6"
              compact
            />
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white">
              {content.metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className={`grid gap-2 px-5 py-5 md:grid-cols-[minmax(0,1fr)_140px] md:px-6 ${
                    index < content.metrics.length - 1 ? "border-b border-[rgba(11,31,51,0.08)]" : ""
                  }`}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.46)]">
                    {metric.label}
                  </div>
                  <div className="font-heading text-3xl font-semibold tracking-[-0.055em] text-[var(--dp-gold-muted)] md:text-right">
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[28px] bg-[linear-gradient(180deg,rgba(11,31,51,0.98),rgba(22,49,73,0.96))] p-5 text-white shadow-[0_20px_40px_rgba(11,31,51,0.12)]">
              <div className="dp-micro-label text-[var(--dp-gold)]">
                Key KPIs
              </div>
              <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10">
                {content.kpis.map((kpi, index) => (
                  <div
                    key={kpi}
                    className={`grid gap-3 px-4 py-3 md:grid-cols-[44px_minmax(0,1fr)] ${
                      index < content.kpis.length - 1 ? "border-b border-white/10" : ""
                    }`}
                  >
                    <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold)]">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="text-[13px] leading-6 text-white/76">{kpi}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {extraSection}

      {FAQ_BY_PARTNER_ID[content.id]?.length ? (
        <FAQAccordionBlock
          sectionEyebrow="FAQ"
          sectionTitle={`${content.shortLabel} questions, answered.`}
          sectionIntro="These cover the core rollout, usage, and measurement questions for this partner type."
          items={FAQ_BY_PARTNER_ID[content.id]}
          styleVariant="default"
          defaultOpenIndex={0}
          allowMultipleOpen={false}
          pageType={content.id}
          ctaLabel="Open partner overview"
          ctaHref="/partners"
        />
      ) : null}

      <PartnerCTASection
        headline={`Build the ${content.shortLabel.toLowerCase()} inside Downtown Perks.`}
        description="Use one shared system for nearby discovery, clear visibility, and measurable results."
        primaryCTA="Start pilot"
        primaryFlow={{
          type: flowTypeByMapMode[content.mapMode] || "start_here",
          source: `partner_cta_section_${content.id}`,
          sourceComponent: "PartnerCTASection",
          partnerType: content.id,
          pageContext: {
            objective: content.description,
          },
          successRoute: content.route,
        }}
        secondaryLink={{ label: "Back to partner landing", href: "/partners" }}
      />
    </div>
  );
}
