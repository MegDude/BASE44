import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  Mail,
  Table,
  TrendingUp,
} from "lucide-react";

const periodOptions = ["Last 7 Days", "Last 30 Days", "Last Quarter", "Custom"];

const summaryMetrics = [
  ["48.2k", "Views"],
  ["1,284", "Saves"],
  ["418", "RSVPs"],
  ["296", "Redemptions"],
  ["22%", "Returns"],
];

const responseRows = [
  ["Dining", "Dinner and date-night searches led the period.", "+18%"],
  ["Events", "Waterfront and live-music RSVPs increased.", "+14%"],
  ["Wellness", "Trail and reset-focused plans gained traction.", "+9%"],
  ["Happy Hour", "After-work saves grew Thursday through Saturday.", "+21%"],
  ["Live Music", "Pre-show dining and drink planning moved earlier.", "+12%"],
  ["Rooftops", "Hotel and visitor interest stayed strong.", "+16%"],
];

const placesPerforming = [
  ["Comedor", "Activity +24%", "Strong event interest."],
  ["Waterloo Greenway", "Activity +19%", "Weekend programming brought earlier saves."],
  ["Hotel Van Zandt", "Activity +17%", "Rooftop and music content opened before dinner."],
  ["Uchiba", "Activity +15%", "Date-night and Second Street searches overlapped."],
];

const campaignResults = [
  {
    campaign: "Downtown Sushi Week",
    reach: "8.4k",
    views: "2,180",
    saves: "312",
    actions: "94 reservations started",
    outcome: "Residents compared sushi options by occasion instead of browsing one restaurant at a time.",
  },
  {
    campaign: "Four Seasons Downtown Experience",
    reach: "5.1k",
    views: "1,420",
    saves: "188",
    actions: "46 event and dining opens",
    outcome: "Hotel and resident activity connected to waterfront, dining, and wellness choices nearby.",
  },
  {
    campaign: "Waterfront Wellness Morning",
    reach: "3.7k",
    views: "920",
    saves: "141",
    actions: "38 RSVPs started",
    outcome: "Trail-adjacent programming gave residents a simple reason to plan a morning downtown.",
  },
];

const trendNotes = [
  "Dining interest increased around Congress and Second Street.",
  "Event attendance rose when reminders appeared before the weekend.",
  "Resident activity shifted east around Rainey and waterfront programming.",
  "Weekend engagement expanded into Thursday planning windows.",
];

const recommendations = [
  {
    title: "Repeat rooftop campaign.",
    reason: "Rooftop saves and directions starts stayed strong after work.",
    outcome: "More Thursday-Saturday visits.",
    confidence: "High",
  },
  {
    title: "Expand dining offer.",
    reason: "Dinner comparisons created the most saved places.",
    outcome: "More resident card checks and repeat opens.",
    confidence: "High",
  },
  {
    title: "Promote weekend events.",
    reason: "People began saving weekend plans earlier in the week.",
    outcome: "More RSVPs before day-of traffic.",
    confidence: "Medium",
  },
  {
    title: "Increase resident visibility.",
    reason: "Saved places were strongest near residential and hotel corridors.",
    outcome: "More repeat discovery from nearby residents.",
    confidence: "Medium",
  },
];

function ReportsShell({ children }) {
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

export default function Dashboard() {
  const [period, setPeriod] = useState("Last 30 Days");

  async function downloadReport(format) {
    const rows = [
      ["Period", period],
      ...summaryMetrics.map(([value, label]) => [label, value]),
      [],
      ["Recommendation", "Reason", "Expected outcome", "Confidence"],
      ...recommendations.map((item) => [item.title, item.reason, item.outcome, item.confidence]),
    ];
    if (format === "pdf") {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Downtown Perks Report", 18, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Period: ${period}`, 18, 30);
      let y = 44;
      rows.filter((row) => row.length && row[0] !== "Period").forEach((row) => {
        if (y > 276) {
          doc.addPage();
          y = 20;
        }
        doc.text(row.join("  |  ").slice(0, 100), 18, y);
        y += 8;
      });
      doc.save(`downtown-perks-report-${period.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`);
      return;
    }
    const body = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `downtown-perks-report-${period.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function emailReport() {
    const subject = encodeURIComponent(`Downtown Perks report — ${period}`);
    const body = encodeURIComponent(
      [
        `Downtown Perks report: ${period}`,
        "",
        "At a glance:",
        ...summaryMetrics.map(([value, label]) => `${label}: ${value}`),
        "",
        "Recommended next steps:",
        ...recommendations.map((item) => `${item.title}: ${item.reason} Expected outcome: ${item.outcome}`),
      ].join("\n"),
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <ReportsShell>
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-[760px]">
          <Eyebrow>Reports</Eyebrow>
          <h1 className="mt-4 max-w-[760px] font-heading text-[42px] font-medium leading-[1] tracking-[-0.04em] text-[#0B1F33] sm:text-[58px] lg:text-[64px]">
            Understand what happened.
          </h1>
          <p className="mt-5 max-w-[640px] font-body text-[16px] leading-[1.55] text-[rgba(11,31,51,.70)] sm:text-[17px]">
            A simple review of activity, engagement, and response across downtown.
          </p>
        </div>

        <div className="inline-flex w-full gap-1 rounded-full border border-[rgba(11,31,51,.08)] bg-white p-1 sm:w-auto">
          {periodOptions.map((option) => {
            const active = period === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setPeriod(option)}
                aria-pressed={active}
                className={`min-h-10 flex-1 rounded-full px-4 font-body text-[11px] font-bold uppercase tracking-[0.11em] transition-colors sm:flex-none ${
                  active ? "bg-[#0B1F33] text-white" : "text-[rgba(11,31,51,.62)] hover:text-[#0B1F33]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader title="At a glance." />
        <Surface className="rounded-[28px] p-5">
          <div className="grid gap-5 sm:grid-cols-5">
            {summaryMetrics.map(([value, label]) => (
              <div key={label} className="border-b border-[rgba(11,31,51,.08)] pb-4 last:border-b-0 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-5 sm:last:border-r-0">
                <p className="font-body text-[34px] font-semibold leading-none tracking-[-0.03em] text-[#0B1F33]">{value}</p>
                <p className="mt-2 font-body text-[11px] font-bold uppercase tracking-[0.13em] text-[rgba(11,31,51,.54)]">{label}</p>
              </div>
            ))}
          </div>
        </Surface>
      </section>

      <section className="space-y-6">
        <SectionHeader title="What people responded to." />
        <Surface className="overflow-hidden rounded-[28px]">
          {responseRows.map(([category, activity, trend], index) => (
            <div key={category} className={`grid gap-3 p-5 sm:grid-cols-[180px_1fr_90px] ${index === responseRows.length - 1 ? "" : "border-b border-[rgba(11,31,51,.08)]"}`}>
              <p className="font-body text-[15px] font-semibold text-[#0B1F33]">{category}</p>
              <p className="font-body text-[14px] leading-[1.5] text-[rgba(11,31,51,.68)]">{activity}</p>
              <p className="font-body text-[12px] font-bold uppercase tracking-[0.11em] text-[#B8963E]">{trend}</p>
            </div>
          ))}
        </Surface>
      </section>

      <section className="space-y-6">
        <SectionHeader title="Places gaining attention." />
        <div className="grid gap-4 md:grid-cols-2">
          {placesPerforming.map(([place, increase, reason]) => (
            <Surface key={place} className="rounded-[22px] p-5">
              <p className="font-body text-[17px] font-semibold tracking-[-0.02em] text-[#0B1F33]">{place}</p>
              <p className="mt-3 font-body text-[12px] font-bold uppercase tracking-[0.11em] text-[#B8963E]">{increase}</p>
              <p className="mt-3 font-body text-[14px] leading-[1.5] text-[rgba(11,31,51,.68)]">{reason}</p>
            </Surface>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader title="Campaign performance." />
        <div className="space-y-4">
          {campaignResults.map((item) => (
            <Surface key={item.campaign} className="rounded-[24px] p-5">
              <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
                <div>
                  <p className="font-body text-[18px] font-semibold tracking-[-0.02em] text-[#0B1F33]">{item.campaign}</p>
                  <p className="mt-3 font-body text-[14px] leading-[1.5] text-[rgba(11,31,51,.68)]">{item.outcome}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    ["Reach", item.reach],
                    ["Views", item.views],
                    ["Saves", item.saves],
                    ["Actions", item.actions],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="font-body text-[15px] font-semibold text-[#0B1F33]">{value}</p>
                      <p className="mt-2 font-body text-[10px] font-bold uppercase tracking-[0.13em] text-[rgba(11,31,51,.54)]">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Surface>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader title="What changed." />
        <Surface className="rounded-[28px] p-2">
          {trendNotes.map((note, index) => (
            <div key={note} className={`flex items-start gap-4 p-4 ${index === trendNotes.length - 1 ? "" : "border-b border-[rgba(11,31,51,.08)]"}`}>
              <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-[#C8A96A]" aria-hidden="true" />
              <p className="font-body text-[15px] leading-[1.5] text-[#0B1F33]">{note}</p>
            </div>
          ))}
        </Surface>
      </section>

      <section className="space-y-6">
        <SectionHeader title="What to do next." />
        <div className="grid gap-4 md:grid-cols-2">
          {recommendations.map((item) => (
            <Surface key={item.title} className="rounded-[22px] p-5">
              <p className="font-body text-[17px] font-semibold tracking-[-0.02em] text-[#0B1F33]">{item.title}</p>
              <p className="mt-3 font-body text-[14px] leading-[1.5] text-[rgba(11,31,51,.68)]">Reason: {item.reason}</p>
              <p className="mt-2 font-body text-[14px] leading-[1.5] text-[rgba(11,31,51,.68)]">Expected outcome: {item.outcome}</p>
              <p className="mt-4 border-t border-[rgba(11,31,51,.08)] pt-4 font-body text-[11px] font-bold uppercase tracking-[0.13em] text-[rgba(11,31,51,.54)]">
                Confidence: <span className="text-[#B8963E]">{item.confidence}</span>
              </p>
            </Surface>
          ))}
        </div>
      </section>

      <Surface className="rounded-[30px] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Eyebrow>Export</Eyebrow>
            <h2 className="mt-3 font-heading text-[34px] font-medium leading-[1.03] tracking-[-0.03em] text-[#0B1F33] sm:text-[44px]">
              Share the report.
            </h2>
            <p className="mt-3 max-w-[680px] font-body text-[16px] leading-[1.55] text-[rgba(11,31,51,.68)]">
              Send a simple Downtown Perks summary with the activity, changes, and recommended next steps that matter.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={() => downloadReport("pdf")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0B1F33] px-5 font-body text-[12px] font-bold uppercase tracking-[0.11em] text-white hover:bg-[#132238]">
              <FileText className="h-4 w-4" aria-hidden="true" />
              PDF
            </button>
            <button type="button" onClick={() => downloadReport("csv")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[rgba(11,31,51,.12)] bg-transparent px-5 font-body text-[12px] font-bold uppercase tracking-[0.11em] text-[#0B1F33] hover:border-[#C8A96A] hover:text-[#B8963E]">
              <Table className="h-4 w-4" aria-hidden="true" />
              CSV
            </button>
            <button type="button" onClick={emailReport} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[rgba(11,31,51,.12)] bg-transparent px-5 font-body text-[12px] font-bold uppercase tracking-[0.11em] text-[#0B1F33] hover:border-[#C8A96A] hover:text-[#B8963E]">
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email Summary
            </button>
          </div>
        </div>
      </Surface>

      <div className="flex flex-col gap-3 sm:flex-row">
        <ActionLink to="/partners/dashboard">Open Dashboard</ActionLink>
        <ActionLink to="/partners/campaigns" variant="secondary">Open Campaigns</ActionLink>
        <ActionLink to="/map?mode=partner&tab=map&filter=All" variant="secondary">Open Map</ActionLink>
      </div>
    </ReportsShell>
  );
}
