import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Map, Sparkles, UserRound } from "lucide-react";
import { useCTAFlow } from "@/components/cta/CTAFlowProvider";

const ENTRY_OPTIONS = [
  {
    id: "resident",
    eyebrow: "Resident mode",
    title: "Open the live map, saved places, and your perks card.",
    body: "Browse first, then save, RSVP, unlock perks, and use the QR card when intent is clear.",
    to: "/resident-app",
    icon: UserRound,
  },
  {
    id: "partner",
    eyebrow: "Partner / property mode",
    title: "Run the operating layer behind downtown activity.",
    body: "Manage residents, campaigns, amenities, maintenance, reports, partners, map activity, perks, and events from one intelligence hub.",
    to: "/dashboard/partner",
    icon: Building2,
  },
];

export default function DashboardHub() {
  const [userName] = useState("");
  const { openFlow } = useCTAFlow();

  return (
    <div className="min-h-screen bg-[#f7f9fc] pt-[68px] text-[var(--dp-navy,#0B1B2A)]">
      <section className="border-b border-[rgba(19,36,67,0.08)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--dp-gold-muted,#B79B56)]">
            Dashboard
          </p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-foreground md:text-6xl">
                Choose your layer in the downtown system.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                {userName
                  ? `Signed in as ${userName}. Continue into the resident surface or the partner/property intelligence hub.`
                  : "Residents get the live map and card. Partners and properties get the backend operating layer: residents, campaigns, amenities, maintenance, reports, partners, and map intelligence."}
              </p>
            </div>

            <Link
              to="/downtown-perks/explore"
              className="inline-flex h-12 items-center gap-2 rounded-[12px] border border-[rgba(13,27,42,0.10)] bg-white px-5 text-sm font-semibold uppercase tracking-[0.14em] text-foreground transition-all hover:bg-[#fbfcfe]"
            >
              Open live map
              <Map className="h-4 w-4 text-[var(--dp-gold-muted,#B79B56)]" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-8 md:py-12">
        <div className="mx-auto max-w-6xl divide-y divide-[rgba(19,36,67,0.08)] border-y border-[rgba(19,36,67,0.08)]">
          {ENTRY_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <div key={option.id} className="grid gap-5 py-7 transition hover:bg-white/24 md:grid-cols-[120px_1fr_auto] md:items-start">
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[rgba(11,31,51,0.06)] text-[hsl(218,42%,14%)]">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(19,36,67,0.46)]">
                    {option.eyebrow}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">{option.title}</h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{option.body}</p>
                </div>

                <div>
                  <Link
                    to={option.to}
                    className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-[hsl(218,42%,14%)] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(42,24%,96%)] transition-all hover:bg-[hsl(218,42%,12%)]"
                  >
                    Enter
                    <ArrowRight className="h-4 w-4 text-[hsl(40,62%,46%)]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl border-t border-[rgba(19,36,67,0.08)] pt-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--dp-gold-muted,#B79B56)]">
                Shared system
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-foreground">
                One map, one data layer, two clean ways in.
              </h2>
            </div>

            <div className="space-y-4">
              {[
                "Resident search and Ask the map both feed the live explore route.",
                "Partner/property teams manage residents, campaigns, amenities, maintenance, reports, partner content, and conversion without leaving the product system.",
                "Pricing, dashboard, map, card, workspace, and partner routes now describe one operating layer instead of separate brochures.",
              ].map((line) => (
                <div key={line} className="flex items-start gap-3 border-b border-[rgba(19,36,67,0.08)] pb-4">
                  <Sparkles className="mt-1 h-4 w-4 text-[var(--dp-gold-muted,#B79B56)]" />
                  <p className="text-base leading-7 text-muted-foreground">{line}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                openFlow({
                  type: "start_here",
                  source: "dashboard_hub_start_here",
                  sourceComponent: "DashboardHub",
                  successRoute: "/partners",
                })
              }
              className="inline-flex h-12 items-center gap-2 rounded-[12px] bg-[var(--dp-navy,#0D1B2A)] px-5 text-sm font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-[rgba(13,27,42,0.92)]"
            >
              Start here
              <ArrowRight className="h-4 w-4 text-[var(--dp-gold-muted,#B79B56)]" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
