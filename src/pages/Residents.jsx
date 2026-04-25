import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Heart,
  Map,
  MapPin,
  QrCode,
  Sparkles,
  Ticket,
  UserRound,
} from "lucide-react";
import ResidentWalkingMap from "@/components/resident/ResidentWalkingMap";
import PricingGlanceSection from "@/components/shared/PricingGlanceSection";
import { useCTAFlow } from "@/components/cta/CTAFlowProvider";

const APP_TABS = [
  {
    id: "now",
    title: "Now",
    href: "/resident-app",
    icon: Map,
    summary: "Live map, nearby places, events, perks, buildings, and neighborhood activity.",
  },
  {
    id: "saved",
    title: "Saved",
    href: "/resident-app/saved",
    icon: Heart,
    summary: "Keep places, perks, and events you want to come back to.",
  },
  {
    id: "plan",
    title: "Plan",
    href: "/resident-app/plan",
    icon: Calendar,
    summary: "Line up later plans, tonight options, and things worth bookmarking.",
  },
  {
    id: "card",
    title: "Card",
    href: "/resident-app/card",
    icon: QrCode,
    summary: "Resident QR card, nearby unlocks, and perk-ready entry.",
  },
  {
    id: "you",
    title: "You",
    href: "/resident-app/you",
    icon: UserRound,
    summary: "Resident identity, history, and personal activity inside the same system.",
  },
];

const CAPABILITIES = [
  {
    title: "Open the map first",
    body: "The resident app starts with the live downtown layer, not a login wall or a buried menu tree.",
    icon: MapPin,
  },
  {
    title: "See what is happening tonight",
    body: "Events, RSVP moments, and nearby movement stay in the same product surface as places and perks.",
    icon: Calendar,
  },
  {
    title: "Save what matters",
    body: "People can save places, perks, and events without losing context or starting the search over.",
    icon: Heart,
  },
  {
    title: "Use the card when needed",
    body: "The card is there for scans, unlocks, and redemption. It does not block basic browsing.",
    icon: Ticket,
  },
];

function ResidentPhonePreview() {
  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <div className="rounded-[36px] border border-[rgba(255,255,255,0.14)] bg-[linear-gradient(180deg,rgba(7,17,29,0.98),rgba(11,31,51,0.94))] p-3 shadow-[0_30px_80px_rgba(11,31,51,0.28)]">
        <div className="rounded-[30px] bg-[linear-gradient(180deg,#0D1C30_0%,#132941_100%)] p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/46">
                Resident App
              </div>
              <div className="mt-1 text-[1.8rem] font-semibold leading-none tracking-[-0.05em]">
                Downtown, In One Place
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(207,175,90,0.16)] text-[var(--dp-gold,#CFAF5A)]">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 rounded-[22px] border border-white/10 bg-white/8 p-3 backdrop-blur-md">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/52">
              Ask The Map
            </div>
            <div className="mt-2 rounded-[16px] bg-[rgba(255,255,255,0.08)] px-3 py-3 text-[14px] text-white/90">
              Drinks after work
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-[rgba(207,175,90,0.16)] px-3 py-1.5 text-[11px] font-medium text-[var(--dp-gold,#CFAF5A)]">
                Coffee Nearby
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/78">
                Happening Tonight
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/78">
                Perks
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-[20px] border border-white/10 bg-white/8 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[13px] font-semibold">Banger&apos;s Sausage House</div>
                  <div className="mt-1 text-[11px] text-white/56">Rainey · 8 min walk · Open now</div>
                </div>
                <span className="rounded-full bg-[rgba(207,175,90,0.16)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
                  Save
                </span>
              </div>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/8 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[13px] font-semibold">Waterloo Park Resident Yoga</div>
                  <div className="mt-1 text-[11px] text-white/56">Tonight · RSVP live · Resident event</div>
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80">
                  RSVP
                </span>
              </div>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/8 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[13px] font-semibold">Perks Card Ready</div>
                  <div className="mt-1 text-[11px] text-white/56">Scan at partner venues when access matters</div>
                </div>
                <span className="rounded-full bg-[rgba(207,175,90,0.16)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
                  QR
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2 rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-3 py-3 text-center text-[10px] text-white/60">
            {APP_TABS.map((tab, index) => (
              <div key={tab.id} className={index === 0 ? "text-[var(--dp-gold,#CFAF5A)]" : ""}>
                <div className="font-semibold">{tab.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResidentQrPanel() {
  const targetUrl = useMemo(() => {
    if (typeof window === "undefined") return "http://127.0.0.1:4174/resident-app";
    return `${window.location.origin}/resident-app`;
  }, []);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(targetUrl)}`;

  return (
    <div className="rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,#0B1F33_0%,#112A44_100%)] p-5 text-white shadow-[0_24px_56px_rgba(11,31,51,0.18)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--dp-gold,#CFAF5A)]">
        Scan To Open
      </div>
      <h2 className="mt-3 text-[2rem] font-semibold leading-[0.96] tracking-[-0.05em]">
        Resident App QR
      </h2>
      <p className="mt-3 max-w-md text-[14px] leading-6 text-white/74">
        Put this on lobby signage, welcome packets, resident emails, or building QR cards. It opens the live resident app directly.
      </p>

      <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-center">
        <div className="rounded-[24px] bg-white p-3 shadow-[0_20px_46px_rgba(6,14,26,0.24)]">
          <img src={qrUrl} alt="Resident app QR code" className="h-[220px] w-[220px] rounded-[18px]" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="rounded-[18px] border border-white/10 bg-white/8 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/48">
              Opens
            </div>
            <div className="mt-2 text-[15px] font-medium text-white">
              `/resident-app`
            </div>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-white/8 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/48">
              Best uses
            </div>
            <div className="mt-2 text-[13px] leading-6 text-white/74">
              Building welcome kits, concierge desks, event posters, partner venue counters, and resident onboarding.
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link to="/resident-app" className="dp-cta-primary bg-white text-[var(--dp-navy)]">
              Open Resident App
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/resident-app/card" className="dp-cta-secondary border-white/12 bg-white/10 text-white">
              Open Card View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResidentLiveEmbed() {
  const residentAppUrl = useMemo(() => {
    if (typeof window === "undefined") return "/resident-app";
    return `${window.location.origin}/resident-app`;
  }, []);

  return (
    <section className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white shadow-[0_18px_44px_rgba(11,31,51,0.08)]">
      <div className="border-b border-[rgba(11,31,51,0.08)] px-5 py-5 md:px-6">
        <div className="dp-micro-label">Live Resident App</div>
        <h2 className="mt-3 text-[2rem] font-semibold leading-[0.98] tracking-[-0.05em] text-foreground md:text-[3rem]">
          Use the map here without leaving the page.
        </h2>
        <p className="mt-3 max-w-3xl text-[14px] leading-7 text-[rgba(11,31,51,0.68)]">
          The live resident route is mounted inside this standalone page so the map, search, results, and resident flows stay in one product surface. Scan the QR below when you want the dedicated app route directly.
        </p>
      </div>

      <div className="bg-[linear-gradient(180deg,#f7f9fc_0%,#edf2f7_100%)] p-2 md:p-3">
        <iframe
          title="Downtown Perks resident app"
          src={residentAppUrl}
          className="block h-[980px] w-full rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white"
        />
      </div>
    </section>
  );
}

export default function Residents() {
  const { openFlow } = useCTAFlow();

  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)] pt-[68px] text-[var(--dp-navy,#0B1A2B)]">
      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="dp-kicker">Resident App</div>
              <h1 className="dp-display-hero mt-4 text-[2.6rem] md:text-[4.5rem]">
                Your Downtown, In One Map.
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[rgba(11,31,51,0.68)]">
                This is the standalone resident product surface for Downtown Perks. Residents can open the map, see what is nearby, save what matters, RSVP to events, and use the card when access matters.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    openFlow({
                      type: "resident_card",
                      source: "residents_page_hero",
                      sourceComponent: "Residents",
                      partnerType: "resident",
                      successRoute: "/resident-app/card",
                    })
                  }
                  className="dp-cta-primary"
                >
                  Request resident access
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link to="/resident-app" className="dp-cta-primary">
                  Open Resident App
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/resident-app/card" className="dp-cta-secondary">
                  Open Card
                </Link>
                <Link to="/explore" className="dp-cta-secondary">
                  Open Map
                </Link>
              </div>
              <div className="mt-3 text-[13px] leading-6 text-[rgba(11,31,51,0.64)]">
                Direct resident access is $25 per year and refunded if your building signs up later.
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {CAPABILITIES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/82 p-4 shadow-[0_14px_34px_rgba(11,31,51,0.05)]">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(207,175,90,0.14)] text-[var(--dp-gold-deep,#A97816)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="mt-3 text-[15px] font-semibold text-foreground">{item.title}</div>
                      <div className="mt-2 text-[13px] leading-6 text-muted-foreground">{item.body}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <ResidentPhonePreview />
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell">
          <ResidentLiveEmbed />
        </div>
      </section>

      <PricingGlanceSection
        eyebrow="Resident access"
        title="Join directly, or stay free through your building."
        intro="Residents can request access for $25 per year now. If your building signs up later, that resident fee is refunded."
        includeResident
        source="residents_page_pricing"
      />

      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell">
          <div className="mb-6 max-w-3xl">
            <div className="dp-micro-label">App Structure</div>
            <h2 className="dp-display-section mt-4 text-[2.2rem] md:text-[3.8rem]">
              One Resident Product. Five Working Surfaces.
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-[rgba(11,31,51,0.68)]">
              The resident app is already live as a working route. This page packages it as a clearer standalone unit on the public site so people understand what it includes before they open it.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {APP_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  to={tab.href}
                  className="group rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white/84 p-5 shadow-[0_16px_36px_rgba(11,31,51,0.05)] transition-all hover:-translate-y-[1px] hover:bg-white"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(11,31,51,0.06)] text-[var(--dp-navy)]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="mt-4 text-[1.1rem] font-semibold tracking-[-0.03em] text-foreground">
                    {tab.title}
                  </div>
                  <div className="mt-2 text-[13px] leading-6 text-muted-foreground">{tab.summary}</div>
                  <div className="mt-4 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-deep,#A97816)]">
                    Open
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell">
          <div className="mb-6 max-w-3xl">
            <div className="dp-micro-label">Walkable Layer</div>
            <h2 className="dp-display-section mt-4 text-[2.2rem] md:text-[3.8rem]">
              Show Downtown The Way Residents Actually Use It.
            </h2>
          </div>
          <ResidentWalkingMap />
        </div>
      </section>

      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell">
          <ResidentQrPanel />
        </div>
      </section>
    </div>
  );
}
