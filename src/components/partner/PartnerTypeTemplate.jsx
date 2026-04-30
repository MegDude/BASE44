import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import PartnerHeaderStage from "@/components/partner/PartnerHeaderStage";
import PartnerInsightMap from "@/components/partner/PartnerInsightMap";
import PartnerCTASection from "@/components/partner/PartnerCTASection";
import WorkflowVisualizer from "@/components/partner/WorkflowVisualizer";
import PartnerStoryCarousel from "@/components/partner/PartnerStoryCarousel";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import PricingGlanceSection from "@/components/shared/PricingGlanceSection";
import { useCTAFlow } from "@/components/cta/CTAFlowProvider";
import { getPartnerFlowForType } from "@/lib/cta/partnerFlowHelpers";
import {
  FAQ_RESIDENTIAL,
  FAQ_BRANDS,
  FAQ_CIVIC,
  FAQ_HOSPITALITY,
  FAQ_VENUES,
} from "@/lib/faq-partner-data";
import { PARTNER_TYPE_CONTENT, PARTNER_TYPE_ORDER } from "@/lib/partnerContent";
import { ROUTES, getPartnerDashboardRoute } from "@/lib/routes";

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
  const { openFlow } = useCTAFlow();
  const Icon = content.icon;
  const dashboardRoute = getPartnerDashboardRoute(content.id);
  const pageFlow = getPartnerFlowForType(content.id, {
    source: `partner_page_${content.id}`,
    sourceComponent: "PartnerTypeTemplate",
    successRoute: content.route,
    pageContext: {
      objective: content.description,
      organization: content.label,
      district: "Downtown Austin",
    },
  });

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

          <div className="flex flex-wrap gap-2">
            {PARTNER_TYPE_ORDER.map((key) => (
              <Link
                key={key}
                to={PARTNER_TYPE_CONTENT[key].route}
                className={`rounded-full px-4 py-2 text-[12px] font-medium transition ${
                  content.id === key
                    ? "bg-[var(--dp-navy,#0B1F33)] text-white"
                    : "border border-[rgba(11,31,51,0.08)] bg-white text-[rgba(11,31,51,0.68)] hover:text-[var(--dp-navy,#0B1F33)]"
                }`}
              >
                {PARTNER_TYPE_CONTENT[key].label}
              </Link>
            ))}
            <Link
              to={dashboardRoute}
              className="rounded-full border border-[rgba(11,31,51,0.08)] bg-white px-4 py-2 text-[12px] font-medium text-[rgba(11,31,51,0.68)] transition hover:text-[var(--dp-navy,#0B1F33)]"
            >
              Dashboard
            </Link>
            <Link
              to={ROUTES.partnerWorkspace}
              className="rounded-full border border-[rgba(11,31,51,0.08)] bg-white px-4 py-2 text-[12px] font-medium text-[rgba(11,31,51,0.68)] transition hover:text-[var(--dp-navy,#0B1F33)]"
            >
              Workspace
            </Link>
            <Link
              to={ROUTES.partnerApply}
              className="rounded-full border border-[rgba(11,31,51,0.08)] bg-white px-4 py-2 text-[12px] font-medium text-[rgba(11,31,51,0.68)] transition hover:text-[var(--dp-navy,#0B1F33)]"
            >
              Apply
            </Link>
          </div>

          <PartnerHeaderStage
            eyebrow={content.eyebrow}
            title={content.headline}
            description={content.description}
            metrics={content.metrics.slice(0, 4)}
            actions={
              <>
                <Link to="/partners" className="dp-cta-secondary">
                  Partner overview
                </Link>
                <Link to={dashboardRoute} className="dp-cta-primary">
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            }
          />

          <section className="grid gap-6 border-t border-[rgba(11,31,51,0.08)] pt-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="max-w-2xl">
              <SectionLabel>Role fit</SectionLabel>
              <h2 className="dp-heading-modern mt-4 text-[2rem] md:text-[2.7rem]">
                One downtown layer, adapted for {content.label.toLowerCase()}.
              </h2>
              {content.audienceSummary ? (
                <p className="mt-4 text-[14px] leading-7 text-[rgba(11,31,51,0.68)]">
                  {content.audienceSummary}
                </p>
              ) : null}

              <div className="mt-6 space-y-4">
                {content.outcomes.map((item, index) => (
                  <div
                    key={item}
                    className="grid gap-3 border-t border-[rgba(11,31,51,0.08)] pt-4 md:grid-cols-[44px_minmax(0,1fr)]"
                  >
                    <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="flex gap-3">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--dp-gold-muted)]" strokeWidth={2} />
                      <p className="text-[14px] leading-7 text-[rgba(11,31,51,0.74)]">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-[30px] border border-[rgba(11,31,51,0.08)] bg-white shadow-[0_18px_40px_rgba(11,31,51,0.05)]"
            >
              <div className="grid gap-0 border-b border-[rgba(11,31,51,0.08)] p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:p-7">
                <div>
                  <p className="dp-micro-label">At a glance</p>
                  <h3 className="mt-4 text-[1.5rem] font-semibold tracking-[-0.04em] text-foreground">
                    {content.shortLabel}
                  </h3>
                  <p className="mt-3 max-w-xl text-[14px] leading-7 text-muted-foreground">
                    {content.description}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[rgba(11,31,51,0.05)] text-[var(--dp-navy)]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
              </div>

              <div className="grid gap-0 md:grid-cols-2">
                {content.metrics.map((metric, index) => (
                  <div
                    key={metric.label}
                    className={`px-6 py-5 md:px-7 ${
                      index % 2 === 0 ? "md:border-r md:border-[rgba(11,31,51,0.08)]" : ""
                    } ${index < content.metrics.length - 2 ? "border-b border-[rgba(11,31,51,0.08)]" : ""}`}
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.44)]">
                      {metric.label}
                    </div>
                    <div className="mt-2 text-[1.55rem] font-semibold tracking-[-0.05em] text-[var(--dp-navy,#0B1F33)]">
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[rgba(11,31,51,0.08)] px-6 py-5 md:px-7">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.44)]">
                  Best next move
                </div>
                <p className="mt-2 text-[14px] leading-7 text-[rgba(11,31,51,0.7)]">
                  Start with the map and the dashboard together. Let people browse openly first, then measure what they actually open, save, visit, RSVP to, and redeem.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to={ROUTES.partnerWorkspace} className="dp-cta-secondary">
                    Manage workspace
                  </Link>
                  <button
                    type="button"
                    onClick={() => openFlow(pageFlow)}
                    className="dp-cta-primary"
                  >
                    Start pilot
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </section>

      <PartnerStoryCarousel
        eyebrow="In practice"
        title={`How the ${content.shortLabel.toLowerCase()} works in real life.`}
        intro="These examples show how the same live map, access flow, and reporting layer adapt to this partner type without turning the page into a generic sales wall."
        items={content.storySlides || []}
      />

      <PartnerInsightMap
        partnerType={content.mapMode}
        title={content.intelligenceTitle}
        description={content.intelligenceDescription}
      />

      <PricingGlanceSection
        eyebrow="Sign up"
        title="Start with the pricing that fits."
        intro="Apply now, launch on a 90-day pilot, and move to paid only after the rollout is live enough to judge."
        includeResident
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
                    {content.moduleReason || "This module stays inside the same operating surface, so the partner team is not bouncing between tools just to understand what to do next."}
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
          ...pageFlow,
          source: `partner_cta_section_${content.id}`,
          sourceComponent: "PartnerCTASection",
          pageContext: {
            ...(pageFlow.pageContext || {}),
            objective: content.description,
          },
        }}
        secondaryLink={{ label: "Back to partner landing", href: "/partners" }}
      />
    </div>
  );
}
