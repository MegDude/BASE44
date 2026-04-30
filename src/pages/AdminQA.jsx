import { useEffect, useState } from "react";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import { CTA_REGISTRY } from "@/config/ctaRegistry";
import { ROUTE_INVENTORY } from "@/config/routes";

const analyticsEvents = [
  "map_open",
  "search_submit",
  "entity_view",
  "save",
  "card_open",
  "redemption",
  "partner_overlay_view",
  "campaign_click",
];

export default function AdminQA() {
  const ctas = Object.values(CTA_REGISTRY);
  const deadCtas = ctas.filter((cta) => !cta.href && !cta.onClick && !cta.apiAction && !cta.modal);
  const [buildingReport, setBuildingReport] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const response = await fetch("/api/admin/buildings/quality-report");
        if (!response.ok) return;
        const data = await response.json();
        if (mounted) setBuildingReport(data);
      } catch (error) {
        console.error("building quality report fetch failed", error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PageShell>
      <main className="pt-[88px]">
        <Section>
          <SectionHeader
            title="Admin QA"
            subtitle="Use this page to catch route drift, CTA gaps, and state coverage issues before they leak into public pages."
          />
        </Section>

        <Section className="border-t border-[rgba(16,24,39,0.08)] pt-12">
          <SectionHeader title="CTA audit" subtitle="Every visible action should route, open, save, redeem, or update state." />
          <div className="grid gap-4 md:grid-cols-2">
            {ctas.map((cta) => (
              <div key={cta.id} className="border-t border-[rgba(16,24,39,0.08)] pt-4">
                <div className="text-sm font-semibold text-[#0B1F33]">{cta.label}</div>
                <div className="mt-1 text-sm text-slate-500">{cta.id}</div>
                <div className="mt-2 text-sm text-slate-600">
                  {cta.href || cta.apiAction || cta.modal || cta.onClick || "Missing action"}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-sm text-slate-600">
            Dead CTAs: <span className="font-semibold text-[#0B1F33]">{deadCtas.length}</span>
          </div>
        </Section>

        <Section className="border-t border-[rgba(16,24,39,0.08)] pt-12">
          <SectionHeader title="Route audit" subtitle="Canonical public and partner routes only." />
          <div className="space-y-4">
            {ROUTE_INVENTORY.map((item) => (
              <div key={item.route} className="border-t border-[rgba(16,24,39,0.08)] pt-4">
                <div className="text-sm font-semibold text-[#0B1F33]">{item.route}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {item.shell} · {item.job}
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  Primary CTA: {item.primaryCta} · Data: {item.dataDependency}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section className="border-t border-[rgba(16,24,39,0.08)] pt-12">
          <SectionHeader title="State and analytics coverage" subtitle="These checks should stay visible even if the underlying data is incomplete." />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border-t border-[rgba(16,24,39,0.08)] pt-4 text-sm text-slate-600">
              Loading, empty, and error states should exist for map, card, events, saved items, and partner actions.
            </div>
            <div className="border-t border-[rgba(16,24,39,0.08)] pt-4">
              <div className="space-y-2">
                {analyticsEvents.map((item) => (
                  <div key={item} className="text-sm text-slate-600">
                    - {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section className="border-t border-[rgba(16,24,39,0.08)] pt-12">
          <SectionHeader
            title="Building quality report"
            subtitle="Seed and enrichment health for the downtown building layer."
          />
          {buildingReport ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border-t border-[rgba(16,24,39,0.08)] pt-4 text-sm text-slate-600">
                Total buildings: <span className="font-semibold text-[#0B1F33]">{buildingReport.totalBuildings}</span>
              </div>
              <div className="border-t border-[rgba(16,24,39,0.08)] pt-4 text-sm text-slate-600">
                Verified buildings: <span className="font-semibold text-[#0B1F33]">{buildingReport.verifiedBuildings}</span>
              </div>
              <div className="border-t border-[rgba(16,24,39,0.08)] pt-4 text-sm text-slate-600">
                Missing coordinates: <span className="font-semibold text-[#0B1F33]">{buildingReport.buildingsMissingCoordinates}</span>
              </div>
              <div className="border-t border-[rgba(16,24,39,0.08)] pt-4 text-sm text-slate-600">
                Missing unit counts: <span className="font-semibold text-[#0B1F33]">{buildingReport.buildingsMissingUnitCounts}</span>
              </div>
              <div className="border-t border-[rgba(16,24,39,0.08)] pt-4 text-sm text-slate-600">
                Missing management company: <span className="font-semibold text-[#0B1F33]">{buildingReport.buildingsMissingManagementCompany}</span>
              </div>
              <div className="border-t border-[rgba(16,24,39,0.08)] pt-4 text-sm text-slate-600">
                Missing contact records: <span className="font-semibold text-[#0B1F33]">{buildingReport.buildingsMissingContactRecords}</span>
              </div>
            </div>
          ) : (
            <div className="border-t border-[rgba(16,24,39,0.08)] pt-4 text-sm text-slate-600">
              Building quality report is loading.
            </div>
          )}
        </Section>
      </main>
    </PageShell>
  );
}
