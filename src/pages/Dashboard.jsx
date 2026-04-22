import { Link } from "react-router-dom";
import { ArrowRight, Building2, Calendar, LineChart, Sparkles } from "lucide-react";
import PartnerInsightMap from "@/components/partner/PartnerInsightMap";

const ENTRY_MODULES = [
  {
    title: "Map-first intelligence",
    body: "Performance, demand, source attribution, and recommended actions now live directly on the map instead of behind a separate dashboard workflow.",
    icon: LineChart,
  },
  {
    title: "One system, multiple partner lenses",
    body: "Properties, hotels, venues, brands, and civic partners use the same shell. The metrics, insights, and actions adapt by entity type.",
    icon: Building2,
  },
  {
    title: "Live activity in context",
    body: "Recent redemptions, active events, peak windows, and conversion signals appear in the summary strip, results, and detail panels.",
    icon: Sparkles,
  },
  {
    title: "Event and perk visibility",
    body: "Events, offers, zones, and partner locations all carry performance state so the map answers what is happening and what to do next.",
    icon: Calendar,
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] pt-[68px] text-[var(--dp-navy,#0B1A2B)]">
      <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(40,62%,42%)]">
              Partner intelligence
            </p>
            <h1 className="dp-display-hero mt-5 max-w-4xl text-5xl md:text-7xl">
              The map is the dashboard now.
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-muted-foreground">
              Overview metrics, live activity, conversions, audience sources, events, and recommendations should not require a second analytics destination. They belong inside the same map surface where partners make decisions.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/partners"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[var(--dp-navy,#0B1F33)] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[rgba(11,31,51,0.9)]"
              >
                Partner overview
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/partner-workspace"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-[rgba(11,31,51,0.08)] bg-white px-5 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy,#0B1F33)] transition hover:bg-[#fbfcff]"
              >
                Manage workspace
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {ENTRY_MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.title}
                  className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_10px_24px_rgba(11,31,51,0.04)]"
                >
                  <Icon className="h-5 w-5 text-[hsl(40,62%,42%)]" strokeWidth={1.75} />
                  <div className="mt-4 text-lg font-semibold tracking-[-0.03em]">{module.title}</div>
                  <div className="mt-2 text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">{module.body}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PartnerInsightMap
        partnerType="dashboard"
        title="One live map for visibility, conversion, and next actions"
        description="This route stays available as an entry point, but the intelligence layer now lives in the map itself: summary strip, activity feed, ranked results, and detail tabs all pull from the same partner system."
      />
    </div>
  );
}
