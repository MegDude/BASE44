import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Compass,
  LayoutDashboard,
  MapPinned,
  Megaphone,
  ShieldCheck,
} from "lucide-react";

const operatingAreas = [
  {
    title: "Organization Workspace",
    eyebrow: "Workspace",
    copy: "Manage your organization profile, locations, team members, permissions, plans, and account settings.",
    href: "/partner-workspace/overview",
    cta: "Open Workspace",
    icon: LayoutDashboard,
  },
  {
    title: "Campaign Manager",
    eyebrow: "Campaigns",
    copy: "Create and manage offers, events, broadcasts, featured placements, and local activations. Launch something new or improve an existing campaign.",
    href: "/partner-workspace/campaigns",
    cta: "Manage Campaigns",
    icon: Megaphone,
  },
  {
    title: "Live Partner Map",
    eyebrow: "Discovery",
    copy: "See exactly where your listings, offers, events, and experiences appear. View Downtown Perks the same way residents and guests experience it.",
    href: null,
    cta: "Open Partner Map",
    icon: MapPinned,
  },
  {
    title: "Reporting & Analytics",
    eyebrow: "Reporting",
    copy: "Track visibility, saves, scans, directions, RSVPs, redemptions, and participation. Understand what is working and where to focus next.",
    href: "/partner-workspace/reports",
    cta: "View Reports",
    icon: BarChart3,
  },
];

const includedCapabilities = [
  ["Listings", "Appear on the map and maintain an accurate public profile."],
  ["Offers & Perks", "Create promotions, resident offers, QR redemptions, and limited-time campaigns."],
  ["Events", "Publish events, manage RSVPs, and promote participation."],
  ["Featured Visibility", "Run sponsored placements, broadcasts, and district campaigns."],
  ["Surveys & Feedback", "Collect responses, understand local sentiment, and export results."],
  ["Team Management", "Manage members, permissions, invitations, and organization access."],
];

const readinessSteps = [
  ["Complete Workspace Setup", "Finish organization profile, locations, and team access."],
  ["Launch Your First Campaign", "Create a perk, event, featured placement, or promotion."],
  ["Generate QR Access", "Create QR experiences for properties, hotels, events, campaigns, or venues."],
  ["Invite Your Team", "Give the right people access to the workspace."],
];

const operatingWorkflow = [
  ["Get Discovered", "Residents, guests, and visitors discover places, offers, events, and experiences through the map."],
  ["Create Participation", "Offers, events, QR experiences, and campaigns turn attention into action."],
  ["Measure Results", "Track scans, saves, RSVPs, redemptions, and engagement."],
  ["Improve Performance", "Use reporting to refine campaigns, offers, events, and placements."],
  ["Repeat What Works", "Keep the experiences people use and expand the ones driving results."],
];

const performanceLoop = [
  ["Discovery", "People find you through the map, listings, recommendations, events, and perks."],
  ["Participation", "People save, scan, RSVP, redeem, visit, and engage."],
  ["Measurement", "Every meaningful action becomes something your team can review."],
  ["Reporting", "Those actions become practical reporting."],
  ["Action", "Use those insights to improve the next campaign, offer, event, or experience."],
];

function buildMapHref(mode, searchParams) {
  const params = new URLSearchParams({
    mode,
    tab: "map",
    filter: searchParams.get("filter") || "All",
  });
  const entityId = searchParams.get("entityId");
  const district = searchParams.get("district");
  if (entityId) params.set("entityId", entityId);
  if (district) params.set("district", district);
  return `/map?${params.toString()}`;
}

function PartnerPageShell({ children }) {
  return (
    <main className="dp-partner-dashboard-page dp-dashboard-page min-h-screen bg-white text-[#0B1F33]">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 px-4 pb-8 pt-5 sm:gap-10 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        {children}
      </div>
    </main>
  );
}

function Eyebrow({ children }) {
  return (
    <p className="m-0 font-body text-[#BFA46A] dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">
      {children}
    </p>
  );
}

function SectionHeader({ eyebrow, title, copy }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(260px,0.72fr)] sm:items-end">
      <div>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className="mt-2 font-heading text-[28px] font-medium leading-[1.05] text-[#0B1F33] sm:text-[38px]">
          {title}
        </h2>
      </div>
      {copy ? <p className="font-body text-[14px] leading-[1.55] text-[rgba(11,31,51,.66)] sm:text-[15px]">{copy}</p> : null}
    </div>
  );
}

function Surface({ children, className = "" }) {
  return (
    <div className={`bg-white shadow-[0_18px_48px_rgba(11,31,51,.045),0_0_34px_rgba(191,164,106,.05)] ${className}`}>
      {children}
    </div>
  );
}

function ActionLink({ to, children, variant = "primary" }) {
  const base = "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[4px] px-4 font-body text-[12px] font-semibold leading-none transition-colors sm:w-auto";
  const styles =
    variant === "primary"
      ? "bg-[#0B1F33] text-white hover:bg-[#132238] focus-visible:bg-[#132238]"
      : "bg-white text-[#0B1F33] shadow-[0_8px_22px_rgba(11,31,51,.05)] hover:text-[#8F7438] focus-visible:text-[#8F7438]";

  return (
    <Link to={to} className={`${base} ${styles}`}>
      <span>{children}</span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#BFA46A]" aria-hidden="true" />
    </Link>
  );
}

function OperatingAreaCard({ area, mapHref }) {
  const Icon = area.icon;
  const href = area.href || mapHref;

  return (
    <Surface className="grid gap-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Eyebrow>{area.eyebrow}</Eyebrow>
          <h3 className="mt-2 font-body text-[18px] font-semibold leading-tight text-[#0B1F33]">{area.title}</h3>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] bg-[#0B1F33] text-white">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="font-body text-[14px] leading-[1.55] text-[rgba(11,31,51,.66)]">{area.copy}</p>
      <ActionLink to={href} variant={area.eyebrow === "Workspace" ? "primary" : "secondary"}>
        {area.cta}
      </ActionLink>
    </Surface>
  );
}

export default function PartnersDashboard() {
  const [searchParams] = useSearchParams();
  const partnerMapHref = buildMapHref("partner", searchParams);
  const residentMapHref = buildMapHref("resident", searchParams);

  return (
    <PartnerPageShell>
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-stretch">
        <div className="grid content-center">
          <Eyebrow>Partner Workspace</Eyebrow>
          <h1 className="mt-3 max-w-[780px] font-heading text-[38px] font-medium leading-[1] text-[#0B1F33] sm:text-[56px] lg:text-[64px]">
            Partner Workspace
          </h1>
          <p className="mt-4 max-w-[700px] font-body text-[15px] leading-[1.58] text-[rgba(11,31,51,.70)] sm:text-[17px]">
            Understand what is happening around your business, publish experiences people can discover, and measure the actions that follow.
          </p>
          <p className="mt-3 max-w-[700px] font-body text-[14px] font-semibold leading-[1.45] text-[#0B1F33] sm:text-[16px]">
            Track visibility. Drive participation. Measure results.
          </p>
          <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <ActionLink to="/partner-workspace/overview">Open Workspace</ActionLink>
            <ActionLink to="/partner-workspace/campaigns" variant="secondary">Launch Campaign</ActionLink>
            <ActionLink to={partnerMapHref} variant="secondary">Open Partner Map</ActionLink>
          </div>
        </div>

        <Surface className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Eyebrow>Workspace</Eyebrow>
              <h2 className="mt-2 font-body text-[20px] font-semibold leading-tight text-[#0B1F33]">Ready to launch</h2>
            </div>
            <ShieldCheck className="h-6 w-6 text-[#BFA46A]" aria-hidden="true" />
          </div>
          <p className="mt-4 font-body text-[14px] leading-[1.55] text-[rgba(11,31,51,.66)]">
            Your workspace is active and ready to manage campaigns, offers, events, listings, QR experiences, and reporting. If setup is incomplete, we'll show the next recommended action.
          </p>
          <div className="mt-5 grid gap-3">
            {readinessSteps.slice(0, 3).map(([title, copy]) => (
              <div key={title} className="grid grid-cols-[22px_1fr] gap-3">
                <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 text-[#BFA46A]" aria-hidden="true" />
                <div>
                  <p className="font-body text-[14px] font-semibold text-[#0B1F33]">{title}</p>
                  <p className="mt-1 font-body text-[13px] leading-[1.45] text-[rgba(11,31,51,.62)]">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </Surface>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {operatingAreas.map((area) => (
          <OperatingAreaCard key={area.title} area={area} mapHref={partnerMapHref} />
        ))}
      </section>

      <Surface className="p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(280px,0.7fr)] lg:items-center">
          <div>
            <Eyebrow>Live Map Access</Eyebrow>
            <h2 className="mt-2 font-heading text-[28px] font-medium leading-[1.05] text-[#0B1F33] sm:text-[38px]">
              See what residents see.
            </h2>
            <p className="mt-3 font-body text-[14px] leading-[1.55] text-[rgba(11,31,51,.66)]">
              Open directly into the live map experience. Partner links preserve districts, categories, selected entities, and campaign context.
            </p>
          </div>
          <div className="grid gap-2 sm:flex sm:flex-wrap lg:justify-end">
            <ActionLink to={partnerMapHref}>Partner map</ActionLink>
            <ActionLink to={residentMapHref} variant="secondary">Resident map</ActionLink>
          </div>
        </div>
      </Surface>

      <section className="space-y-5">
        <SectionHeader
          eyebrow="Included Capabilities"
          title="Everything connects to performance."
          copy="Listings, offers, events, visibility, feedback, and team access all support the same daily rhythm: create participation, measure what happened, then improve the next move."
        />
        <div className="grid gap-0 bg-white p-5 shadow-[0_18px_48px_rgba(11,31,51,.04),0_0_34px_rgba(191,164,106,.045)] sm:p-6 lg:grid-cols-2">
          {includedCapabilities.map(([title, copy], index) => (
            <div key={title} className={`grid gap-2 py-4 ${index > 1 ? "lg:border-t lg:border-[rgba(11,31,51,.06)]" : ""} ${index % 2 === 1 ? "lg:pl-6" : "lg:pr-6"} ${index > 0 ? "border-t border-[rgba(11,31,51,.06)] lg:border-t-0" : ""}`}>
              <p className="font-body text-[15px] font-semibold text-[#0B1F33]">{title}</p>
              <p className="font-body text-[13px] leading-[1.5] text-[rgba(11,31,51,.64)]">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.75fr)]">
        <Surface className="p-5 sm:p-6">
          <SectionHeader eyebrow="Operating Workflow" title="How it works." />
          <div className="mt-5 grid gap-4">
            {operatingWorkflow.map(([title, copy], index) => (
              <div key={title} className="grid grid-cols-[34px_1fr] gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-white font-body text-[12px] font-semibold text-[#BFA46A] shadow-[0_8px_20px_rgba(11,31,51,.055)]">
                  {index + 1}
                </span>
                <div>
                  <p className="font-body text-[15px] font-semibold text-[#0B1F33]">{title}</p>
                  <p className="mt-1 font-body text-[13px] leading-[1.48] text-[rgba(11,31,51,.64)]">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </Surface>

        <Surface className="p-5 sm:p-6">
          <SectionHeader eyebrow="Performance Loop" title="Discovery to action." />
          <div className="mt-5 grid gap-3">
            {performanceLoop.map(([title, copy]) => (
              <div key={title} className="grid grid-cols-[26px_1fr] gap-3">
                <Compass className="mt-0.5 h-4.5 w-4.5 text-[#BFA46A]" aria-hidden="true" />
                <div>
                  <p className="font-body text-[15px] font-semibold text-[#0B1F33]">{title}</p>
                  <p className="mt-1 font-body text-[13px] leading-[1.48] text-[rgba(11,31,51,.64)]">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </Surface>
      </section>

      <Surface className="p-5 sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Eyebrow>Ready to launch something?</Eyebrow>
            <h2 className="mt-2 font-heading text-[30px] font-medium leading-[1.04] text-[#0B1F33] sm:text-[44px]">
              Ready to launch something?
            </h2>
            <p className="mt-3 max-w-[720px] font-body text-[15px] leading-[1.58] text-[rgba(11,31,51,.66)]">
              Your workspace gives you everything needed to manage visibility, participation, and reporting across Downtown Perks.
            </p>
          </div>
          <div className="grid gap-2 sm:flex sm:flex-wrap lg:justify-end">
            <ActionLink to="/partner-workspace/overview">Open Workspace</ActionLink>
            <ActionLink to="/partner-workspace/campaigns" variant="secondary">Launch Campaign</ActionLink>
            <ActionLink to={partnerMapHref} variant="secondary">Open Partner Map</ActionLink>
          </div>
        </div>
      </Surface>
    </PartnerPageShell>
  );
}
