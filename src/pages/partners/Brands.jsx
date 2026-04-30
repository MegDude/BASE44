import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, ChevronRight, MapPin, Megaphone, QrCode, Sparkles } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import FAQAccordion from "@/components/FAQAccordion";
import { ROUTES } from "@/lib/routes";

const proofStats = [
  { label: "Campaigns live", value: "12" },
  { label: "Total scans", value: "2.4K" },
  { label: "Visits", value: "840" },
  { label: "Redemptions", value: "340" },
];

const extendedMetrics = [
  { label: "Districts active", value: "4" },
  { label: "Venue partners", value: "28" },
  { label: "Building access points", value: "9" },
  { label: "Scan-to-visit", value: "68%" },
];

const campaignFormats = [
  {
    key: "founding",
    name: "Founding Downtown Partner",
    short: "Always-on visibility across the map, buildings, venues, and district activity.",
    detail:
      "Best for brands that want steady presence in downtown behavior instead of a short sponsorship burst.",
    placements: ["Map pins in core districts", "Building lobby QR touchpoints", "Venue discovery moments", "District activity modules"],
    metrics: ["Scans", "Visits", "Saves", "Redemptions"],
  },
  {
    key: "launch",
    name: "Launch Campaign",
    short: "Best for openings, seasonal pushes, and time-sensitive offers.",
    detail:
      "Built for brands that need a tighter window, clearer urgency, and strong visibility around a specific opening or launch moment.",
    placements: ["Launch-week pins", "Timed venue placement", "District countdown moments", "QR-triggered offer entry"],
    metrics: ["Scans", "Visits", "Offer opens", "Conversion lift"],
  },
  {
    key: "resident",
    name: "Resident Activation",
    short: "Built for buildings, move-ins, resident perks, and local access.",
    detail:
      "Use this when the goal is to turn resident access into real visits, redemptions, and repeated local behavior.",
    placements: ["Building welcome QR", "Resident card offers", "Lobby placement", "Move-in campaign moments"],
    metrics: ["Card opens", "Scans", "Redemptions", "Repeat visits"],
  },
  {
    key: "event",
    name: "Event-Led Campaign",
    short: "Best for RSVPs, sponsorships, district weekends, and venue traffic.",
    detail:
      "Built for campaigns that need to ride the timing of a downtown event, district weekend, or live crowd moment.",
    placements: ["Event pins", "District weekend modules", "Venue-led RSVP moments", "Sponsor placement around programming"],
    metrics: ["RSVPs", "Scans", "Visits", "Participation"],
  },
  {
    key: "utility",
    name: "Utility-Led Campaign",
    short: "Service-driven campaigns that help people do something nearby.",
    detail:
      "Best when the brand is useful in the moment: rides, eyewear, health, essentials, local services, or last-minute convenience.",
    placements: ["Contextual search placements", "Nearby utility pins", "QR help entry points", "Problem-solving map prompts"],
    metrics: ["Scans", "Helpful actions", "Visits", "Service conversions"],
  },
];

const scenarios = [
  {
    key: "new-location",
    label: "New location",
    recommendedFormat: "launch",
    placements: ["The Paseo", "Congress corridor", "Map launch pins", "QR at entry touchpoints"],
    metrics: ["Scans", "Visits", "Redemptions", "Launch-week lift"],
  },
  {
    key: "resident-perk",
    label: "Resident perk",
    recommendedFormat: "resident",
    placements: ["Building lobbies", "Resident card moments", "Move-in flows", "Partner venue pairing"],
    metrics: ["Card opens", "Scans", "Redemptions", "Repeat visits"],
  },
  {
    key: "district-weekend",
    label: "District weekend",
    recommendedFormat: "event",
    placements: ["District modules", "Event pins", "Venue weekend rails", "QR sponsor touchpoints"],
    metrics: ["RSVPs", "Scans", "Visits", "Participation"],
  },
  {
    key: "always-on",
    label: "Always-on presence",
    recommendedFormat: "founding",
    placements: ["Core map visibility", "Venue network", "Building network", "District activity layers"],
    metrics: ["Scans", "Saves", "Visits", "Redemptions"],
  },
];

const caseStudies = [
  {
    title: "Fine Eyewear × Downtown Perks",
    placement: "The Paseo + Map",
    type: "Launch campaign for new location with QR integration",
    scans: "340",
    visits: "210",
    redemptions: "58",
    trend: "+12% this week",
  },
  {
    title: "Hotel Welcome Campaign",
    placement: "Hotel Van Zandt + Resident Buildings",
    type: "Building-led resident activation with exclusive offer",
    scans: "620",
    visits: "410",
    redemptions: "180",
    trend: "+24% this week",
  },
  {
    title: "Downtown Weekend Activation",
    placement: "Multi-venue + District",
    type: "Event-tied campaign across venues and outdoor spaces",
    scans: "890",
    visits: "520",
    redemptions: "245",
    trend: "+18% this week",
  },
];

const liveActivity = [
  "Resident scanned at The Quincy — Downtown Welcome — Trending — 2 min ago",
  "Guest opened campaign from Hotel Van Zandt — Hotel Welcome — 5 min ago",
  "Visit recorded near Congress Avenue — Launch Campaign — 8 min ago",
  "Redemption completed in-store — Resident Activation — 12 min ago",
  "QR scanned at The Paseo building — Founding Partner — Top venue — 15 min ago",
  "Event RSVP from downtown location — Event-led Campaign — 18 min ago",
];

const faqItems = [
  {
    question: "What kind of brand campaigns fit here?",
    answer:
      "Launches, resident activations, event-led weekends, utility-driven campaigns, and steady downtown presence all fit well when the goal is measurable local action.",
  },
  {
    question: "How is this different from sponsorship placement?",
    answer:
      "This is tied to real downtown behavior. Brands show up in map context, QR entry points, buildings, venues, and timed moments people can actually act on.",
  },
  {
    question: "Can a brand connect to buildings and residents?",
    answer:
      "Yes. Resident activations can run through buildings, move-ins, card moments, and building-linked access points.",
  },
  {
    question: "Can campaigns tie into events and districts?",
    answer:
      "Yes. Event-led and district-led campaigns are one of the strongest use cases because timing and local context are already doing part of the work.",
  },
  {
    question: "What makes the Brands page the highest-fidelity page?",
    answer:
      "It shows the full campaign system clearly: placement types, touchpoints, measurement, live signals, and the path from downtown visibility to real action.",
  },
  {
    question: "What should a brand be able to measure?",
    answer:
      "Scans, visits, saves, redemptions, building response, district activity, RSVP behavior, and campaign lift by format or placement.",
  },
  {
    question: "How does Downtown Perks work with inKind?",
    answer:
      "It can support offer logic, QR entry, and redemption-led measurement around hospitality and venue moments while keeping the downtown placement and reporting layer consistent.",
  },
];

function scrollToRef(ref) {
  ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function BrandsPartner() {
  const navigate = useNavigate();
  const placementRef = useRef(null);
  const formRef = useRef(null);
  const finalCtaRef = useRef(null);
  const [selectedFormat, setSelectedFormat] = useState("founding");
  const [selectedScenario, setSelectedScenario] = useState("new-location");
  const [recommendedFormat, setRecommendedFormat] = useState("launch");
  const selectedFormatDetail = useMemo(
    () => campaignFormats.find((format) => format.key === selectedFormat) || campaignFormats[0],
    [selectedFormat]
  );
  const selectedScenarioDetail = useMemo(
    () => scenarios.find((scenario) => scenario.key === selectedScenario) || scenarios[0],
    [selectedScenario]
  );
  const recommendedFormatDetail = useMemo(
    () => campaignFormats.find((format) => format.key === recommendedFormat) || campaignFormats[0],
    [recommendedFormat]
  );

  const handleScenarioSelect = (scenarioKey) => {
    const scenario = scenarios.find((item) => item.key === scenarioKey);
    if (!scenario) return;
    setSelectedScenario(scenarioKey);
    setSelectedFormat(scenario.recommendedFormat);
    setRecommendedFormat(scenario.recommendedFormat);
  };

  const handleUseFormat = (formatKey) => {
    setSelectedFormat(formatKey);
    setRecommendedFormat(formatKey);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate(
      `${ROUTES.partnerApply}?partner=brand&format=${recommendedFormatDetail.key}&scenario=${selectedScenarioDetail.key}`
    );
  };

  return (
    <PageShell>
      <main className="pt-[88px]">
        <Section className="pb-10 md:pb-14">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(7,27,46,0.56)]">
                <Megaphone className="h-3.5 w-3.5 text-[var(--dp-gold,#C7A24A)]" />
                Brand Partner Layer
              </div>
              <h1 className="mt-4 font-heading text-[clamp(2.8rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--dp-navy,#071B2E)]">
                Put your brand where downtown is already moving.
              </h1>
              <p className="mt-4 max-w-2xl text-[17px] leading-8 text-[var(--dp-text-secondary,#3B4A63)]">
                Downtown Perks helps brands show up inside real local behavior through buildings, venues, map moments,
                district activity, and timed campaigns people can actually act on.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => scrollToRef(formRef)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#071B2E)] px-5 py-3 text-sm font-semibold text-white"
                >
                  Plan a campaign
                </button>
                <button
                  type="button"
                  onClick={() => scrollToRef(placementRef)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] border border-[rgba(11,31,51,0.10)] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#071B2E)]"
                >
                  See placement map
                </button>
              </div>
            </div>

            <div className="rounded-[28px] border border-[rgba(11,31,51,0.10)] bg-[rgba(251,252,254,0.78)] p-5 shadow-[0_20px_50px_rgba(7,27,46,0.08)] backdrop-blur-[18px]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                Campaign preview
              </div>
              <div className="mt-4 rounded-[22px] bg-[var(--dp-navy,#071B2E)] p-5 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.14em] text-white/56">Recommended right now</div>
                    <div className="mt-2 text-xl font-semibold">{recommendedFormatDetail.name}</div>
                  </div>
                  <div className="rounded-full bg-[rgba(199,162,74,0.16)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold,#C7A24A)]">
                    Active
                  </div>
                </div>
                <p className="mt-4 text-[14px] leading-7 text-white/76">{recommendedFormatDetail.detail}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {recommendedFormatDetail.placements.slice(0, 4).map((item) => (
                    <div key={item} className="rounded-[16px] border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white/84">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {proofStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(7,27,46,0.05)]"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                  {stat.label}
                </div>
                <div className="mt-2 text-[1.7rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#071B2E)]">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section className="border-t border-[rgba(11,31,51,0.08)] py-12 md:py-16">
          <SectionHeader
            title="Choose the format that fits the moment."
            subtitle="Some campaigns need steady presence. Some need a launch window. Some work best through buildings, events, or useful local behavior."
          />
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="space-y-3">
              {campaignFormats.map((format) => {
                const active = format.key === selectedFormat;
                return (
                  <button
                    key={format.key}
                    type="button"
                    onClick={() => setSelectedFormat(format.key)}
                    className={`w-full rounded-[20px] border px-4 py-4 text-left transition ${
                      active
                        ? "border-[rgba(199,162,74,0.38)] bg-white shadow-[0_14px_34px_rgba(7,27,46,0.06)]"
                        : "border-[rgba(11,31,51,0.08)] bg-[rgba(251,252,254,0.72)] hover:border-[rgba(11,31,51,0.14)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[15px] font-semibold text-[var(--dp-navy,#071B2E)]">{format.name}</div>
                        <div className="mt-2 text-[13px] leading-6 text-[var(--dp-text-secondary,#3B4A63)]">
                          {format.short}
                        </div>
                      </div>
                      {active ? <CheckCircle2 className="mt-1 h-4 w-4 text-[var(--dp-gold,#C7A24A)]" /> : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[26px] border border-[rgba(11,31,51,0.10)] bg-white p-6 shadow-[0_18px_44px_rgba(7,27,46,0.06)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                    Format detail
                  </div>
                  <h3 className="mt-2 text-[1.8rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#071B2E)]">
                    {selectedFormatDetail.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleUseFormat(selectedFormatDetail.key)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#071B2E)] px-4 py-2 text-sm font-semibold text-white"
                >
                  Use this format
                </button>
              </div>
              <p className="mt-4 text-[15px] leading-7 text-[var(--dp-text-secondary,#3B4A63)]">
                {selectedFormatDetail.detail}
              </p>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                    Likely placements
                  </div>
                  <div className="mt-3 space-y-2">
                    {selectedFormatDetail.placements.map((placement) => (
                      <div key={placement} className="flex items-start gap-3 text-[14px] leading-6 text-[var(--dp-text-secondary,#3B4A63)]">
                        <MapPin className="mt-1 h-4 w-4 text-[var(--dp-gold,#C7A24A)]" />
                        <span>{placement}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                    Tracked metrics
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedFormatDetail.metrics.map((metric) => (
                      <span
                        key={metric}
                        className="inline-flex rounded-full border border-[rgba(11,31,51,0.08)] bg-[rgba(244,247,251,0.88)] px-3 py-2 text-[12px] font-semibold text-[var(--dp-navy,#071B2E)]"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section ref={placementRef} className="border-t border-[rgba(11,31,51,0.08)] py-12 md:py-16">
          <SectionHeader
            title="See where campaigns actually run."
            subtitle="Every touchpoint is tied to a real place: a building lobby, a venue, a live map pin, a district moment, or a QR-triggered entry point."
          />
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] border border-[rgba(11,31,51,0.10)] bg-[linear-gradient(180deg,rgba(251,252,254,0.94),rgba(244,247,251,0.92))] p-6 shadow-[0_18px_44px_rgba(7,27,46,0.06)]">
              <div className="flex flex-wrap gap-2">
                {["Map moment", "Building lobby", "Venue pin", "District weekend", "QR entry"].map((label, index) => (
                  <span
                    key={label}
                    className={`inline-flex rounded-full px-3 py-2 text-[12px] font-semibold ${
                      index === 0
                        ? "bg-[rgba(199,162,74,0.18)] text-[var(--dp-navy,#071B2E)]"
                        : "border border-[rgba(11,31,51,0.08)] bg-white text-[var(--dp-text-secondary,#3B4A63)]"
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  { title: "The Paseo", body: "QR-triggered launch placement at the building entry." },
                  { title: "Hotel Van Zandt", body: "Guest-facing welcome moment tied to local activation." },
                  { title: "Congress corridor", body: "Timed map visibility around evening intent." },
                  { title: "District weekend", body: "Event-linked campaign moments across multiple venues." },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white/84 px-4 py-4"
                  >
                    <div className="text-[14px] font-semibold text-[var(--dp-navy,#071B2E)]">{item.title}</div>
                    <div className="mt-2 text-[13px] leading-6 text-[var(--dp-text-secondary,#3B4A63)]">{item.body}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white px-5 py-5">
                <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                  Campaign surface
                </div>
                <div className="mt-4 space-y-3">
                  {["Buildings", "Venues", "Map moments", "District activity", "QR touchpoints"].map((item) => (
                    <div key={item} className="flex items-center justify-between gap-3 text-[14px] text-[var(--dp-text-secondary,#3B4A63)]">
                      <span>{item}</span>
                      <ChevronRight className="h-4 w-4 text-[var(--dp-gold,#C7A24A)]" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-[var(--dp-navy,#071B2E)] px-5 py-5 text-white">
                <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/56">
                  Placement logic
                </div>
                <p className="mt-3 text-[14px] leading-7 text-white/78">
                  Brands can activate through steady presence, timed launches, resident access, event windows, or useful
                  local prompts. The format follows the moment.
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section className="border-t border-[rgba(11,31,51,0.08)] py-12 md:py-16">
          <SectionHeader
            title="How a downtown campaign turns into action."
            subtitle="Define placement → Launch touchpoints → Show up in context → People scan, save, and go → See what converted"
          />
          <div className="grid gap-4 md:grid-cols-5">
            {[
              "Define placement",
              "Launch touchpoints",
              "Show up in context",
              "People scan, save, and go",
              "See what converted",
            ].map((step, index) => (
              <div key={step} className="border-t border-[rgba(11,31,51,0.08)] pt-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                  Step {index + 1}
                </div>
                <div className="mt-2 text-[15px] font-semibold leading-7 text-[var(--dp-navy,#071B2E)]">{step}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section className="border-t border-[rgba(11,31,51,0.08)] py-12 md:py-16">
          <SectionHeader
            title="See how campaigns come to life."
            subtitle="Brands should feel like active participants in downtown behavior, not passive ads sitting beside it."
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {caseStudies.map((study) => (
              <div
                key={study.title}
                className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white px-5 py-5 shadow-[0_12px_30px_rgba(7,27,46,0.05)]"
              >
                <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                  {study.placement}
                </div>
                <h3 className="mt-3 text-[1.3rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#071B2E)]">
                  {study.title}
                </h3>
                <p className="mt-3 text-[14px] leading-7 text-[var(--dp-text-secondary,#3B4A63)]">{study.type}</p>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">Scans</div>
                    <div className="mt-1 text-lg font-semibold text-[var(--dp-navy,#071B2E)]">{study.scans}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">Visits</div>
                    <div className="mt-1 text-lg font-semibold text-[var(--dp-navy,#071B2E)]">{study.visits}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">Redeem</div>
                    <div className="mt-1 text-lg font-semibold text-[var(--dp-navy,#071B2E)]">{study.redemptions}</div>
                  </div>
                </div>
                <div className="mt-5 inline-flex rounded-full bg-[rgba(199,162,74,0.16)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-navy,#071B2E)]">
                  {study.trend}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section className="border-t border-[rgba(11,31,51,0.08)] py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <SectionHeader
                title="Proof that goes beyond impressions."
                subtitle="Brand campaigns inside Downtown Perks are measured by what people actually do: scans, visits, saves, redemptions, building response, and event-linked activity."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {extendedMetrics.map((metric) => (
                  <div key={metric.label} className="border-t border-[rgba(11,31,51,0.08)] pt-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                      {metric.label}
                    </div>
                    <div className="mt-2 text-[1.5rem] font-semibold text-[var(--dp-navy,#071B2E)]">{metric.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] border border-[rgba(11,31,51,0.10)] bg-[rgba(251,252,254,0.80)] p-6 shadow-[0_18px_44px_rgba(7,27,46,0.06)] backdrop-blur-[18px]">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--dp-gold,#C7A24A)]" />
                Live activity feed
              </div>
              <div className="mt-4 space-y-3">
                {liveActivity.map((item) => (
                  <div
                    key={item}
                    className="rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-white px-4 py-4 text-[13px] leading-6 text-[var(--dp-text-secondary,#3B4A63)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section ref={formRef} className="border-t border-[rgba(11,31,51,0.08)] py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <SectionHeader
                title="Plan the campaign around the downtown moment."
                subtitle="Tell us what you want to achieve, where you want to show up, and what kind of response matters most. We will map the right format, placements, and measurement plan."
              />
              <div className="mt-6">
                <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                  Scenario buttons
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {scenarios.map((scenario) => (
                    <button
                      key={scenario.key}
                      type="button"
                      onClick={() => handleScenarioSelect(scenario.key)}
                      className={`inline-flex min-h-[44px] items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                        selectedScenario === scenario.key
                          ? "bg-[var(--dp-navy,#071B2E)] text-white"
                          : "border border-[rgba(11,31,51,0.08)] bg-white text-[var(--dp-navy,#071B2E)]"
                      }`}
                    >
                      {scenario.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white px-5 py-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                  Form recommendation
                </div>
                <div className="mt-2 text-[1.35rem] font-semibold text-[var(--dp-navy,#071B2E)]">
                  {recommendedFormatDetail.name}
                </div>
                <div className="mt-4">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                    Likely placements
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedScenarioDetail.placements.map((placement) => (
                      <span
                        key={placement}
                        className="inline-flex rounded-full border border-[rgba(11,31,51,0.08)] bg-[rgba(244,247,251,0.88)] px-3 py-2 text-[12px] font-semibold text-[var(--dp-navy,#071B2E)]"
                      >
                        {placement}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                    Tracked metrics
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedScenarioDetail.metrics.map((metric) => (
                      <span
                        key={metric}
                        className="inline-flex rounded-full bg-[rgba(199,162,74,0.14)] px-3 py-2 text-[12px] font-semibold text-[var(--dp-navy,#071B2E)]"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-[28px] border border-[rgba(11,31,51,0.10)] bg-white p-6 shadow-[0_18px_44px_rgba(7,27,46,0.06)]"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                    Brand / company
                  </span>
                  <input className="mt-2 h-12 w-full rounded-[14px] border border-[rgba(11,31,51,0.10)] bg-[rgba(244,247,251,0.68)] px-4 text-sm outline-none" />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                    Your name
                  </span>
                  <input className="mt-2 h-12 w-full rounded-[14px] border border-[rgba(11,31,51,0.10)] bg-[rgba(244,247,251,0.68)] px-4 text-sm outline-none" />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                    Email
                  </span>
                  <input type="email" className="mt-2 h-12 w-full rounded-[14px] border border-[rgba(11,31,51,0.10)] bg-[rgba(244,247,251,0.68)] px-4 text-sm outline-none" />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                    Recommended scenario
                  </span>
                  <input
                    value={selectedScenarioDetail.label}
                    readOnly
                    className="mt-2 h-12 w-full rounded-[14px] border border-[rgba(11,31,51,0.10)] bg-[rgba(244,247,251,0.68)] px-4 text-sm outline-none"
                  />
                </label>
              </div>

              <label className="mt-4 block">
                <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                  Recommendation snapshot
                </span>
                <textarea
                  rows={4}
                  readOnly
                  className="mt-2 w-full rounded-[14px] border border-[rgba(11,31,51,0.10)] bg-[rgba(244,247,251,0.68)] px-4 py-3 text-sm outline-none"
                  value={`Recommended format: ${recommendedFormatDetail.name}\nLikely placements: ${selectedScenarioDetail.placements.join(", ")}\nTracked metrics: ${selectedScenarioDetail.metrics.join(", ")}`}
                />
              </label>

              <label className="mt-4 block">
                <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                  What response matters most?
                </span>
                <textarea
                  rows={4}
                  className="mt-2 w-full rounded-[14px] border border-[rgba(11,31,51,0.10)] bg-[rgba(244,247,251,0.68)] px-4 py-3 text-sm outline-none"
                  placeholder="Visits, redemptions, building response, district visibility, event turnout, or something more specific."
                />
              </label>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#071B2E)] px-5 py-3 text-sm font-semibold text-white"
                >
                  Plan a campaign
                </button>
                <button
                  type="button"
                  onClick={() => scrollToRef(finalCtaRef)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] border border-[rgba(11,31,51,0.10)] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#071B2E)]"
                >
                  Review final pitch
                </button>
              </div>
            </form>
          </div>
        </Section>

        <Section className="border-t border-[rgba(11,31,51,0.08)] py-12 md:py-16">
          <SectionHeader
            title="Brand FAQs"
            subtitle="The campaign system should feel clear before anyone commits to a format."
          />
          <FAQAccordion items={faqItems} />
        </Section>

        <Section ref={finalCtaRef} className="border-t border-[rgba(11,31,51,0.08)] py-12 md:py-16">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(7,27,46,0.48)]">
                Final CTA
              </div>
              <h2 className="mt-3 font-heading text-[clamp(2.1rem,4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[var(--dp-navy,#071B2E)]">
                Build the campaign around the downtown moment.
              </h2>
              <p className="mt-4 max-w-3xl text-[16px] leading-8 text-[var(--dp-text-secondary,#3B4A63)]">
                Downtown Perks gives brands a way to show up inside live local behavior instead of sitting beside it.
                Start with the format that fits the objective, then connect placements, offer logic, and measurement into one campaign system.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <button
                type="button"
                onClick={() => scrollToRef(formRef)}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[14px] bg-[var(--dp-navy,#071B2E)] px-5 py-3 text-sm font-semibold text-white"
              >
                Plan a campaign
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollToRef(placementRef)}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[14px] border border-[rgba(11,31,51,0.10)] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#071B2E)]"
              >
                See placement map
                <QrCode className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Section>
      </main>
    </PageShell>
  );
}
