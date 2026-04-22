import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import PartnerInsightMap from "@/components/partner/PartnerInsightMap";
import PartnerCTASection from "@/components/partner/PartnerCTASection";
import PlanningForm from "@/components/partner/PlanningForm";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import PartnerSourceTable from "@/components/partner/PartnerSourceTable";
import { getPartnerLayerMeta } from "@/lib/partnerLayerConfig";
import { ensurePartnerSessionId, trackPartnerEvent } from "@/lib/client/trackPartnerEvent";

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(40,62%,42%)]">
      {children}
    </p>
  );
}

function MetricCard({ label, value, detail = null, compact = false }) {
  return (
    <div className={`rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white ${compact ? "p-4" : "p-5"}`}>
      <div className={`${compact ? "text-2xl" : "text-3xl"} font-semibold tracking-[-0.05em] text-[var(--dp-navy,#0B1F33)]`}>
        {value}
      </div>
      <div className="mt-1 text-[11px] text-[rgba(11,31,51,0.52)]">
        {label}
        {detail ? ` · ${detail}` : ""}
      </div>
    </div>
  );
}

function formatUpdatedAt(value) {
  if (!value) return "Updated recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Updated recently";
  return `Updated ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

export default function PartnerLayerPage({ content, extraSection = null }) {
  const meta = getPartnerLayerMeta(content.id);
  const [sessionId, setSessionId] = useState(null);
  const [heroMetrics, setHeroMetrics] = useState({ primary: content.heroStats || [], proof: content.proofStrip || [], lastUpdatedAt: null });
  const [partners, setPartners] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [selectedMetrics, setSelectedMetrics] = useState(null);
  const [activityRows, setActivityRows] = useState([]);
  const [sourceRows, setSourceRows] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const nextSessionId = ensurePartnerSessionId();
      setSessionId(nextSessionId);

      const [heroRes, listRes, activityRes] = await Promise.all([
        fetch(`/api/partners/hero-metrics?partnerType=${meta.apiType}`, { cache: "no-store" }),
        fetch(`/api/partners/list?partnerType=${meta.apiType}`, { cache: "no-store" }),
        fetch(`/api/partners/activity?partnerType=${meta.apiType}`, { cache: "no-store" }),
      ]);

      const [heroJson, listJson, activityJson] = await Promise.all([
        heroRes.json(),
        listRes.json(),
        activityRes.json(),
      ]);

      if (cancelled) return;
      setHeroMetrics(heroJson);
      setPartners(listJson.rows || []);
      setActivityRows(activityJson.rows || []);

      const firstId = listJson.rows?.[0]?.id || null;
      setSelectedPartnerId(firstId);

      if (nextSessionId) {
        trackPartnerEvent({
          session_id: nextSessionId,
          event_type: "map_open",
          partner_id: firstId || meta.apiType,
          source_partner_id: firstId || meta.apiType,
          metadata: {
            page: content.route,
            partner_type: meta.apiType,
          },
        });
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [content.route, meta.apiType]);

  useEffect(() => {
    let cancelled = false;
    if (!selectedPartnerId) return undefined;

    const loadSelected = async () => {
      const [metricsRes, sourcesRes, activityRes] = await Promise.all([
        fetch(`/api/partners/metrics?partnerType=${meta.apiType}&partnerId=${selectedPartnerId}`, { cache: "no-store" }),
        fetch(`/api/partners/sources?partnerType=${meta.apiType}&partnerId=${selectedPartnerId}`, { cache: "no-store" }),
        fetch(`/api/partners/activity?partnerType=${meta.apiType}&partnerId=${selectedPartnerId}`, { cache: "no-store" }),
      ]);

      const [metricsJson, sourcesJson, activityJson] = await Promise.all([
        metricsRes.json(),
        sourcesRes.json(),
        activityRes.json(),
      ]);

      if (cancelled) return;
      setSelectedMetrics(metricsJson);
      setSourceRows(sourcesJson.rows || []);
      setActivityRows(activityJson.rows || []);
    };

    loadSelected();
    return () => {
      cancelled = true;
    };
  }, [meta.apiType, selectedPartnerId]);

  const selectedPartner = useMemo(
    () => partners.find((item) => item.id === selectedPartnerId) || partners[0] || null,
    [partners, selectedPartnerId]
  );

  const proofCards = heroMetrics.proof?.length
    ? heroMetrics.proof
    : (content.proofStrip || []).map((item) => ({ label: item.label, value: item.value }));

  return (
    <div className="min-h-screen bg-[#f6f2ea] pt-[68px] text-[var(--dp-navy,#0B1F33)]">
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to="/partners"
              className="inline-flex items-center gap-2 text-[12px] text-[rgba(11,31,51,0.52)] transition hover:text-[var(--dp-navy,#0B1F33)]"
            >
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              Partner Directory
            </Link>
            <SectionLabel>{content.eyebrow}</SectionLabel>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] md:text-6xl">
              {content.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[rgba(11,31,51,0.66)]">
              {content.heroDescription}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to={content.heroPrimaryCta.href}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[var(--dp-navy,#0B1F33)] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[rgba(11,31,51,0.9)]"
              >
                {content.heroPrimaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={content.heroSecondaryCta.href}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-[rgba(11,31,51,0.08)] bg-white/72 px-5 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy,#0B1F33)] transition hover:bg-white"
              >
                {content.heroSecondaryCta.label}
              </Link>
            </div>

            <div className="mt-6 text-[13px] font-medium text-[rgba(11,31,51,0.68)]">
              {content.heroTrustRow || formatUpdatedAt(heroMetrics.lastUpdatedAt)}
            </div>

            {content.heroBullets?.length ? (
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {content.heroBullets.map((item) => (
                  <div key={item} className="text-[13px] text-[rgba(11,31,51,0.62)]">
                    {item}
                  </div>
                ))}
              </div>
            ) : null}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
            <PlanningForm partnerType={{ ...content.form, label: content.label, variant: "embedded", partnerTypeKey: meta.apiType }} />
          </motion.div>
        </div>
      </section>

      <section className="border-y border-[rgba(11,31,51,0.08)] px-6 py-8">
        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-4">
          {(proofCards || []).slice(0, 4).map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} compact />
          ))}
        </div>
      </section>

      <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <SectionLabel>{content.mapPreviewTitle}</SectionLabel>
            <div className="mt-6 overflow-hidden rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white">
              <PartnerInsightMap
                partnerType={content.mapMode}
                title={content.mapPreviewTitle}
                description={content.mapPreviewDescription}
              />
            </div>
          </div>

          <div className="space-y-4">
            <SectionLabel>{content.mapStoryTitle || "Partner performance"}</SectionLabel>
            <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-6">
              <div className="mb-4 text-sm font-semibold text-[var(--dp-navy,#0B1F33)]">
                {meta.listLabel}
              </div>

              <div className="space-y-2">
                {partners.slice(0, 6).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedPartnerId(item.id);
                      if (sessionId) {
                        trackPartnerEvent({
                          session_id: sessionId,
                          event_type: "map_recenter",
                          partner_id: item.id,
                          source_partner_id: item.id,
                          metadata: {
                            page: content.route,
                            partner_type: meta.apiType,
                            trigger: "partner_select",
                          },
                        });
                      }
                    }}
                    className={`w-full rounded-[16px] border px-4 py-3 text-left transition ${
                      selectedPartnerId === item.id
                        ? "border-[rgba(200,151,58,0.45)] bg-[rgba(200,151,58,0.10)]"
                        : "border-[rgba(11,31,51,0.08)] bg-[rgba(11,31,51,0.02)] hover:bg-white"
                    }`}
                  >
                    <div className="font-medium text-[var(--dp-navy,#0B1F33)]">{item.name}</div>
                    <div className="mt-1 text-[13px] text-[rgba(11,31,51,0.58)]">{item.summary}</div>
                  </button>
                ))}
              </div>

              {selectedPartner ? (
                <div className="mt-5 rounded-[18px] bg-[rgba(11,31,51,0.03)] p-4">
                  <div className="text-[11px] uppercase tracking-[0.14em] text-[hsl(40,62%,42%)]">
                    Selected node
                  </div>
                  <div className="mt-2 text-[15px] font-semibold text-[var(--dp-navy,#0B1F33)]">
                    {selectedPartner.name}
                  </div>
                  <div className="mt-2 text-[13px] text-[rgba(11,31,51,0.68)]">
                    {selectedPartner.summary}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <SectionLabel>{content.measurementTitle || "What this partner layer can track"}</SectionLabel>
            <p className="mt-4 text-sm leading-6 text-[rgba(11,31,51,0.62)]">
              {content.measurementIntro || content.stepsIntro}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard label={meta.viewsLabel} value={selectedMetrics?.views ?? 0} />
            <MetricCard label={meta.actionsLabel} value={selectedMetrics?.actions ?? 0} />
            <MetricCard label="Saves" value={selectedMetrics?.saves ?? 0} />
            <MetricCard label={meta.unlocksLabel} value={selectedMetrics?.unlocks ?? 0} />
            <MetricCard label={meta.accessLabel} value={selectedMetrics?.accessPoints ?? 0} />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <MetricCard label="Visits" value={selectedMetrics?.visits ?? 0} compact />
            <MetricCard label="Return rate" value={`${selectedMetrics?.returnRate ?? 0}%`} compact />
            <MetricCard label="Self-serve discovery" value={`${selectedMetrics?.selfServeRate ?? 0}%`} compact />
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionLabel>{content.liveMomentsTitle || content.liveActivityTitle || "Live activity"}</SectionLabel>
            <div className="mt-6 space-y-3">
              {activityRows.length ? (
                activityRows.map((item) => (
                  <div key={item.id} className="rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-white p-4">
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="mt-1 text-[13px] text-[rgba(11,31,51,0.62)]">{item.sourceName}</div>
                    <div className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[hsl(40,62%,42%)]">{item.relativeTime}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-white p-4 text-[13px] text-[rgba(11,31,51,0.58)]">
                  No live activity available yet.
                </div>
              )}
            </div>
          </div>

          <div>
            <SectionLabel>{content.stepsTitle}</SectionLabel>
            <div className="mt-6 rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-6">
              <p className="text-sm leading-6 text-[rgba(11,31,51,0.62)]">{content.stepsIntro}</p>
              <div className="mt-5 space-y-4">
                {(content.workflow || []).map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(11,31,51,0.10)] bg-white/54 text-[12px] font-semibold">
                      {index + 1}
                    </div>
                    <div className="text-sm leading-6 text-[rgba(11,31,51,0.66)]">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <PartnerSourceTable
            title={meta.sourceLabel}
            intro="This is the working proof layer for partner entry points, placements, and source performance."
            rows={sourceRows}
          />
        </div>
      </section>

      {extraSection}

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
