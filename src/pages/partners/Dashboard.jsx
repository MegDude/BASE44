import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Radio,
  Sparkles,
} from "lucide-react";

const liveSummary = [
  ["142", "Saves"],
  ["89", "Offer Views"],
  ["34", "Event RSVPs"],
  ["18", "Redemptions"],
];

const trendingRails = [
  {
    title: "Trending Places",
    items: [
      ["Hotel Van Zandt", "Rooftop and music content is getting opened before dinner."],
      ["Comedor", "Modern Mexican and date-night searches are rising near Congress."],
      ["The Independent", "Residential interest is pairing with coffee and trail searches."],
    ],
  },
  {
    title: "Trending Events",
    items: [
      ["Waterloo Greenway Weekend", "Weekend planning activity is building earlier in the week."],
      ["Live Music Before Dinner", "Visitors are saving pre-show food and drink options."],
      ["Waterfront Wellness Morning", "Residents are opening wellness plans near the trail."],
    ],
  },
  {
    title: "Trending Offers",
    items: [
      ["Resident Dining Access", "Dinner benefits are being saved near hotel and office corridors."],
      ["Rooftop Happy Hour", "After-work activity is strongest Thursday through Saturday."],
      ["Downtown Card Check-In", "Partners are seeing more resident verification requests."],
    ],
  },
];

const attentionSignals = [
  {
    entity: "Hotel Van Zandt",
    reason: "Guests are opening rooftop content.",
    signal: "67 views this week.",
  },
  {
    entity: "Waterloo Greenway",
    reason: "Weekend event pages are being saved earlier.",
    signal: "34 RSVPs started.",
  },
  {
    entity: "Second Street Dining",
    reason: "Residents are comparing dinner, drinks, and walkable events.",
    signal: "52 saves nearby.",
  },
];

const actionSignals = [
  ["Offer saves", "Residents are saving dining and happy-hour benefits before leaving home."],
  ["Perk redemptions", "Card verification is most active around dinner and event windows."],
  ["Event RSVPs", "Waterfront and live-music events are converting attention into plans."],
  ["Venue visits", "Directions starts are strongest when offers and events appear together."],
];

const opportunities = [
  {
    name: "Waterloo Greenway",
    reason: "Event engagement rising.",
    action: "Launch weekend partnership.",
    timing: "Thursday-Sunday",
  },
  {
    name: "Downtown dining partners",
    reason: "Dinner saves are increasing near hotel corridors.",
    action: "Create resident dining offer.",
    timing: "4-8 PM",
  },
  {
    name: "Rooftop venues",
    reason: "After-work searches are moving from drinks to events.",
    action: "Feature rooftop experience.",
    timing: "Wednesday-Saturday",
  },
];

const campaignRows = [
  ["Downtown Sushi Week", "Active", "4.8k nearby", "Reservations and saves rising", "Keep promoting date-night recommendations."],
  ["Four Seasons Downtown Experience", "Draft", "2.1k nearby", "Hotel and waterfront interest active", "Add seasonal dining and spa access."],
  ["Waterfront Wellness Morning", "Scheduled", "1.7k nearby", "Trail activity increasing", "Open RSVP reminder on Friday."],
];

const recommendedActions = [
  {
    title: "Launch dining offer",
    why: "Dinner interest is rising near hotel and residential corridors.",
    outcome: "More saves, card checks, and directions starts.",
  },
  {
    title: "Promote upcoming event",
    why: "Weekend planning is starting earlier than usual.",
    outcome: "More RSVPs before the day-of rush.",
  },
  {
    title: "Create resident perk",
    why: "Partners with clear resident access are getting more repeat opens.",
    outcome: "More saved places and clearer return behavior.",
  },
  {
    title: "Run visitor survey",
    why: "Hotel and event traffic is active but still choosing what to do next.",
    outcome: "Better timing, offer, and district guidance.",
  },
];

function PartnerPageShell({ children }) {
  return (
    <main className="min-h-screen bg-[#F7F8FB] text-[#0B1F33]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-16 px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        {children}
      </div>
    </main>
  );
}

function Eyebrow({ children }) {
  return (
    <p className="m-0 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-[#B8963E]">
      {children}
    </p>
  );
}

function SectionHeader({ title, copy }) {
  return (
    <div className="max-w-[760px]">
      <h2 className="m-0 font-heading text-[34px] font-medium leading-[1.02] tracking-[-0.03em] text-[#0B1F33] sm:text-[44px]">
        {title}
      </h2>
      {copy ? <p className="mt-3 max-w-[680px] font-body text-[16px] leading-[1.55] text-[rgba(11,31,51,.68)] sm:text-[17px]">{copy}</p> : null}
    </div>
  );
}

function Surface({ children, className = "" }) {
  return (
    <div className={`border border-[rgba(11,31,51,.08)] bg-white ${className}`}>
      {children}
    </div>
  );
}

function ActionLink({ to, children, variant = "primary" }) {
  const base = "inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] px-5 font-body text-[12px] font-bold uppercase tracking-[0.11em] transition-colors";
  const styles =
    variant === "primary"
      ? "bg-[#0B1F33] text-white hover:bg-[#132238]"
      : "border border-[rgba(11,31,51,.12)] bg-transparent text-[#0B1F33] hover:border-[#C8A96A] hover:text-[#B8963E]";

  return (
    <Link to={to} className={`${base} ${styles}`}>
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

function HorizontalRail({ title, items }) {
  return (
    <section>
      <h3 className="mb-4 font-body text-[11px] font-bold uppercase tracking-[0.13em] text-[rgba(11,31,51,.54)]">
        {title}
      </h3>
      <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
        {items.map(([name, copy]) => (
          <Surface key={name} className="min-w-[260px] rounded-[22px] p-5 sm:min-w-[300px]">
            <p className="m-0 font-body text-[15px] font-semibold text-[#0B1F33]">{name}</p>
            <p className="mt-3 font-body text-[14px] leading-[1.5] text-[rgba(11,31,51,.68)]">{copy}</p>
          </Surface>
        ))}
      </div>
    </section>
  );
}

function SignalCard({ entity, reason, signal }) {
  return (
    <Surface className="rounded-[22px] p-5">
      <p className="font-body text-[15px] font-semibold text-[#0B1F33]">{entity}</p>
      <p className="mt-3 font-body text-[14px] leading-[1.5] text-[rgba(11,31,51,.68)]">{reason}</p>
      <p className="mt-4 border-t border-[rgba(11,31,51,.08)] pt-4 font-body text-[12px] font-bold uppercase tracking-[0.11em] text-[#B8963E]">
        {signal}
      </p>
    </Surface>
  );
}

export default function PartnersDashboard() {
  return (
    <PartnerPageShell>
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div className="max-w-[760px]">
          <Eyebrow>Partner Workspace</Eyebrow>
          <h1 className="mt-4 max-w-[760px] font-heading text-[42px] font-medium leading-[1] tracking-[-0.04em] text-[#0B1F33] sm:text-[58px] lg:text-[64px]">
            See what people are paying attention to.
          </h1>
          <p className="mt-5 max-w-[680px] font-body text-[16px] leading-[1.55] text-[rgba(11,31,51,.70)] sm:text-[17px]">
            A simple view of what nearby residents, guests, and visitors are noticing, saving, attending, and returning to.
          </p>
        </div>

        <Surface className="rounded-[28px] p-5">
          <div className="flex items-center justify-between gap-4 border-b border-[rgba(11,31,51,.08)] pb-4">
            <div>
              <p className="font-body text-[11px] font-bold uppercase tracking-[0.13em] text-[#B8963E]">Live Activity Summary</p>
              <p className="mt-2 font-body text-[14px] text-[rgba(11,31,51,.66)]">Nearby activity right now.</p>
            </div>
            <Radio className="h-5 w-5 text-[#C8A96A]" aria-hidden="true" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4">
            {liveSummary.map(([value, label]) => (
              <div key={label}>
                <p className="font-body text-[30px] font-semibold leading-none tracking-[-0.03em] text-[#0B1F33]">{value}</p>
                <p className="mt-2 font-body text-[11px] font-bold uppercase tracking-[0.13em] text-[rgba(11,31,51,.54)]">{label}</p>
              </div>
            ))}
          </div>
        </Surface>
      </section>

      <section className="space-y-8">
        <SectionHeader title="Downtown Right Now" copy="What people nearby are actively engaging with." />
        <div className="space-y-8">
          {trendingRails.map((rail) => (
            <HorizontalRail key={rail.title} title={rail.title} items={rail.items} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader title="What people are noticing." copy="Places, events, perks, and experiences attracting attention." />
        <div className="grid gap-4 md:grid-cols-3">
          {attentionSignals.map((item) => (
            <SignalCard key={item.entity} {...item} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader title="What people are doing." copy="The moments where interest becomes action." />
        <Surface className="rounded-[28px] p-2">
          {actionSignals.map(([label, copy], index) => (
            <div key={label} className={`grid gap-3 p-4 sm:grid-cols-[220px_1fr] ${index === actionSignals.length - 1 ? "" : "border-b border-[rgba(11,31,51,.08)]"}`}>
              <p className="font-body text-[15px] font-semibold text-[#0B1F33]">{label}</p>
              <p className="font-body text-[14px] leading-[1.5] text-[rgba(11,31,51,.68)]">{copy}</p>
            </div>
          ))}
        </Surface>
      </section>

      <section className="space-y-6">
        <SectionHeader title="What deserves attention next." copy="Suggested actions based on recent activity." />
        <div className="grid gap-4 lg:grid-cols-3">
          {opportunities.map((item) => (
            <Surface key={item.name} className="rounded-[22px] p-5">
              <Sparkles className="h-5 w-5 text-[#C8A96A]" aria-hidden="true" />
              <h3 className="mt-4 font-body text-[18px] font-semibold tracking-[-0.02em] text-[#0B1F33]">{item.name}</h3>
              <p className="mt-3 font-body text-[14px] leading-[1.5] text-[rgba(11,31,51,.68)]">{item.reason}</p>
              <p className="mt-4 font-body text-[14px] font-semibold text-[#0B1F33]">{item.action}</p>
              <p className="mt-4 border-t border-[rgba(11,31,51,.08)] pt-4 font-body text-[11px] font-bold uppercase tracking-[0.13em] text-[rgba(11,31,51,.54)]">
                Best timing: <span className="text-[#B8963E]">{item.timing}</span>
              </p>
            </Surface>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader title="Recent Campaign Activity" />
        <Surface className="overflow-hidden rounded-[28px]">
          {campaignRows.map(([campaign, status, reach, activity, next], index) => (
            <div key={campaign} className={`grid gap-3 p-5 lg:grid-cols-[1.2fr_.7fr_.8fr_1.2fr_1.3fr] ${index === campaignRows.length - 1 ? "" : "border-b border-[rgba(11,31,51,.08)]"}`}>
              <p className="font-body text-[15px] font-semibold text-[#0B1F33]">{campaign}</p>
              <p className="font-body text-[12px] font-bold uppercase tracking-[0.11em] text-[#B8963E]">{status}</p>
              <p className="font-body text-[14px] text-[rgba(11,31,51,.68)]">{reach}</p>
              <p className="font-body text-[14px] text-[rgba(11,31,51,.68)]">{activity}</p>
              <p className="font-body text-[14px] text-[#0B1F33]">{next}</p>
            </div>
          ))}
        </Surface>
      </section>

      <section className="space-y-6">
        <SectionHeader title="What should you do next?" />
        <div className="grid gap-4 md:grid-cols-2">
          {recommendedActions.map((item) => (
            <Surface key={item.title} className="rounded-[22px] p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#C8A96A]" aria-hidden="true" />
                <div>
                  <h3 className="font-body text-[17px] font-semibold tracking-[-0.02em] text-[#0B1F33]">{item.title}</h3>
                  <p className="mt-3 font-body text-[14px] leading-[1.5] text-[rgba(11,31,51,.68)]">Why now: {item.why}</p>
                  <p className="mt-2 font-body text-[14px] leading-[1.5] text-[rgba(11,31,51,.68)]">Expected outcome: {item.outcome}</p>
                  <Link to="/partners/campaigns" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-[12px] bg-[#0B1F33] px-4 font-body text-[11px] font-bold uppercase tracking-[0.11em] text-white hover:bg-[#132238]">
                    Launch
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </Surface>
          ))}
        </div>
      </section>

      <Surface className="rounded-[30px] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Eyebrow>Next Step</Eyebrow>
            <h2 className="mt-3 font-heading text-[34px] font-medium leading-[1.03] tracking-[-0.03em] text-[#0B1F33] sm:text-[44px]">
              Keep your next move clear.
            </h2>
            <p className="mt-3 max-w-[700px] font-body text-[16px] leading-[1.55] text-[rgba(11,31,51,.68)]">
              Use campaigns, reports, and activity signals to stay connected to what people are responding to downtown.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <ActionLink to="/partners/campaigns">Open Campaigns</ActionLink>
            <ActionLink to="/partners/reports" variant="secondary">View Reports</ActionLink>
            <ActionLink to="/map?mode=partner&tab=map&filter=All" variant="secondary">Open Map</ActionLink>
          </div>
        </div>
      </Surface>
    </PartnerPageShell>
  );
}
