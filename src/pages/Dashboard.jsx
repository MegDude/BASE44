import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileText, Mail, Table } from "lucide-react";
import { downtownPerksEntityImages } from "@/data/downtownPerksEntityImages";

const periodOptions = ["Last 7 Days", "Last 30 Days", "Last Quarter", "Custom"];

const summaryMetrics = [
  ["35", "Active Partners", "↑18%"],
  ["1", "Campaigns", "↑22%"],
  ["1,284", "Residents", "↑5%"],
  ["1", "Events", "↑12%"],
  ["2", "Perks", "↑9%"],
  ["333,054", "Impressions", ""],
  ["81,904", "Views", ""],
  ["414,958", "Reach", ""],
  ["31,511", "Discovery", ""],
];

const keyReadouts = [
  {
    eyebrow: "Key readout",
    headline: "What to do next",
    rows: [
      ["What we're seeing", "Map visibility is strongest when nearby context is clear."],
      ["Why it matters", "Views only matter when someone knows what to do next."],
      ["Recommended action", "Pair high-visibility places with the right timing, nearby audience, and one clear offer."],
    ],
  },
  {
    eyebrow: "Intent readout",
    headline: "People save before they visit.",
    metrics: [
      ["13,742", "Saved Intent"],
      ["6,780", "Visit Intent"],
      ["22%", "Response Rate"],
    ],
    rows: [
      ["What we're seeing", "Saves are outpacing clicks in the strongest locations."],
      ["Why it matters", "People are deciding before they leave home, work, or the hotel."],
      ["Recommended action", "Add nearby context, directions, and one clear action so saved interest can turn into visits."],
    ],
  },
];

const propertyPerformance = {
  image: downtownPerksEntityImages["the-independent"],
  headline: "The Independent is getting the most attention this week.",
  rows: [
    ["What changed", "Activity is strongest around a specific place, timing window, and nearby context."],
    ["Why it matters", "People respond better to useful local prompts than broad promotion."],
    ["Recommended action", "Use the same placement, timing, and card action pattern on the next campaign."],
  ],
};

const campaignReadout = {
  campaign: "First Thursday Visibility",
  partner: "Hotel Van Zandt",
  description: "A focused Rainey Street campaign built around after-work discovery and nearby planning.",
  whyNow: "Nearby intent is strong enough to support a short campaign window.",
  bestTiming: "After work, early evening, and before nearby events.",
  results: [
    ["1,880", "Views"],
    ["248", "Saves"],
    ["396", "Clicks"],
  ],
  image: downtownPerksEntityImages["first-thursday-visibility"],
};

const attentionSignals = [
  ["Rainey Street", "After-work saves increased around hotel, venue, and dining content."],
  ["Seaholm", "Residential and listing activity clustered around walkable daily routines."],
  ["Lady Bird Lake", "Waterfront context helped hotel and residential content perform together."],
];

const peopleNearby = [
  ["Residents", "Opening places before evening plans."],
  ["Hotel guests", "Using dining and event context to decide where to go next."],
  ["Visitors", "Comparing recognizable venues with nearby walkable options."],
];

const topHotels = [
  {
    name: "Hotel Van Zandt",
    description: "Rainey Street hotel with music, dining, and easy access to downtown events.",
    image: downtownPerksEntityImages["hotel-van-zandt"],
  },
  {
    name: "Four Seasons Austin",
    description: "Lady Bird Lake hotel connecting guests with dining, events, and downtown experiences.",
    video: "/images/map/videos/four-seasons-lakefront-arrival.mp4",
    image: downtownPerksEntityImages["four-seasons"],
  },
  {
    name: "Austin Proper",
    description: "Seaholm hotel known for rooftop dining, design, and neighborhood access.",
    image: downtownPerksEntityImages["austin-proper"],
  },
];

const topVenues = [
  {
    name: "Stay Put",
    description: "Rainey Street gathering spot with strong evening activity.",
    image: downtownPerksEntityImages["stay-put"],
  },
  {
    name: "Home Slice",
    description: "South Congress pizza spot people know by name.",
    image: downtownPerksEntityImages["home-slice"],
  },
  {
    name: "Geraldine's",
    description: "Hotel Van Zandt restaurant with live music and strong evening traffic.",
    image: downtownPerksEntityImages.geraldines,
  },
];

const topProperties = [
  {
    name: "The Independent",
    description: "Seaholm residential tower generating strong discovery activity.",
    image: downtownPerksEntityImages["the-independent"],
  },
  {
    name: "The Shore",
    description: "Lady Bird Lake residential building with strong weekend activity.",
    image: downtownPerksEntityImages["the-shore"],
  },
  {
    name: "44 East",
    description: "Rainey Street tower with growing resident engagement.",
    image: downtownPerksEntityImages["44-east"],
  },
];

const listingActivity = [
  ["301 West Ave — The Independent", "Strongest listing activity", "Send traffic back to the map so people can understand Seaholm, not just the unit."],
  ["222 West Ave — Seaholm Residences", "Seaholm comparison activity", "Attach nearby grocery, dining, lake, and workday context."],
  ["360 Nueces ST", "High downtown routine interest", "Connect the listing to 2nd Street, restaurants, and Lady Bird Lake."],
  ["44 East Ave", "Rainey and lake interest", "Frame the listing around walkable dining, hotels, drinks, and trail access."],
  ["200 Congress Ave", "Core downtown attention", "Tie views to Congress Avenue, civic spaces, offices, and everyday movement."],
];

const recommendedActions = [
  ["Repeat the strongest placement pattern", "The highest response came from specific places with clear nearby context.", "Launch next campaign"],
  ["Move listing interest back to the map", "People need to understand the neighborhood before they decide if a listing fits.", "Open map"],
  ["Use timing windows, not broad promotion", "After-work, early evening, and event-adjacent moments are easier to act on.", "Plan campaign"],
];

function cx(...values) {
  return values.filter(Boolean).join(" ");
}

function slugPeriod(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function ReportLabel({ children, muted = false }) {
  return (
    <p className={cx(
      "m-0 font-body text-[10.5px] font-semibold uppercase tracking-[0.14em]",
      muted ? "text-[#0B1F33]/50" : "text-[#C8A96A]",
    )}>
      {children}
    </p>
  );
}

function SectionTitle({ label, title, copy }) {
  return (
    <header className="max-w-[760px]">
      {label ? <ReportLabel>{label}</ReportLabel> : null}
      <h2 className="mt-3 font-heading text-3xl font-medium leading-[1.08] tracking-normal text-[#0B1F33] md:text-[42px]">
        {title}
      </h2>
      {copy ? (
        <p className="mt-3 max-w-[680px] font-body text-[14px] leading-relaxed text-[#0B1F33]/64 md:text-[16px]">
          {copy}
        </p>
      ) : null}
    </header>
  );
}

function TextRows({ rows }) {
  return (
    <div className="divide-y divide-[rgba(11,31,51,.08)]">
      {rows.map(([label, copy]) => (
        <div key={label} className="grid gap-2 py-4 md:grid-cols-[170px_minmax(0,1fr)] md:gap-6">
          <ReportLabel muted>{label}</ReportLabel>
          <p className="m-0 font-body text-[14px] leading-relaxed text-[#0B1F33]/68 md:text-[15px]">{copy}</p>
        </div>
      ))}
    </div>
  );
}

function ReportMedia({ item, className = "" }) {
  if (item.video) {
    return (
      <video
        className={cx("aspect-[16/10] w-full object-cover", className)}
        src={item.video}
        poster={item.image?.src}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  if (!item.image) return null;
  return (
    <img
      src={item.image.src}
      alt={item.image.alt}
      className={cx("aspect-[16/10] w-full object-cover", className)}
      loading="lazy"
      decoding="async"
    />
  );
}

function ReportButton({ to, children, variant = "secondary", onClick, icon: Icon }) {
  const classes = cx(
    "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-[2px] px-3.5 font-body text-[11px] font-medium uppercase tracking-normal transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]",
    variant === "primary"
      ? "bg-[#0B1F33] text-white"
      : "bg-white/72 text-[#0B1F33] shadow-[0_8px_24px_rgba(11,31,51,0.045)] hover:bg-white",
  );

  const content = (
    <>
      {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      {children}
      {to ? <ArrowRight className="h-3.5 w-3.5 text-[#C8A96A]" aria-hidden="true" /> : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}

export default function Dashboard() {
  const [period, setPeriod] = useState("Last 30 Days");
  const navigate = useNavigate();

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/partners/dashboard");
  }

  async function downloadReport(format) {
    const rows = [
      ["Period", period],
      ...summaryMetrics.map(([value, label, trend]) => [label, value, trend]),
      [],
      ["Readout", "Signal", "Next step"],
      ...keyReadouts.flatMap((item) => item.rows.map(([label, copy]) => [item.headline, label, copy])),
      ...propertyPerformance.rows.map(([label, copy]) => [propertyPerformance.headline, label, copy]),
      [],
      ["Campaign", "Partner", "Why now", "Best timing"],
      [campaignReadout.campaign, campaignReadout.partner, campaignReadout.whyNow, campaignReadout.bestTiming],
      [],
      ["Listing activity", "Signal", "Recommended action"],
      ...listingActivity,
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
      doc.save(`downtown-perks-report-${slugPeriod(period)}.pdf`);
      return;
    }

    const body = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `downtown-perks-report-${slugPeriod(period)}.csv`;
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
        ...summaryMetrics.map(([value, label, trend]) => `${label}: ${value}${trend ? ` ${trend}` : ""}`),
        "",
        "Recommended next steps:",
        ...recommendedActions.map(([title, reason]) => `${title}: ${reason}`),
      ].join("\n"),
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <main className="min-h-screen bg-white text-[#0B1F33]">
      <div className="mx-auto w-full max-w-[1180px] px-5 pb-28 pt-10 sm:px-8 lg:px-10 lg:pb-32 lg:pt-16">
        <button
          type="button"
          onClick={goBack}
          className="mb-8 inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-white/72 px-3.5 font-body text-[11px] font-medium uppercase tracking-normal text-[#0B1F33]/58 shadow-[0_8px_24px_rgba(11,31,51,0.045)] transition hover:-translate-y-px hover:bg-white hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]"
          aria-label="Return to previous partner page"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#C8A96A]" aria-hidden="true" />
          Back
        </button>

        <section className="grid gap-8 border-b border-[rgba(11,31,51,.08)] pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div id="partner-readout" className="max-w-[780px] scroll-mt-8">
            <ReportLabel>Reports</ReportLabel>
            <h1 className="mt-4 max-w-[820px] font-heading text-[40px] font-medium leading-[1.02] tracking-normal text-[#0B1F33] md:text-[64px]">
              What changed nearby.
            </h1>
            <p className="mt-5 max-w-[660px] font-body text-[15px] leading-[1.75] text-[#0B1F33]/68">
              A simple look at what people opened, saved, visited, redeemed, and came back to this week.
            </p>
          </div>

          <div className="flex w-full gap-3 overflow-x-auto border-y border-[#0B1F33]/[0.06] py-2 [scrollbar-width:none] sm:w-auto [&::-webkit-scrollbar]:hidden">
            {periodOptions.map((option) => {
              const active = period === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPeriod(option)}
                  aria-pressed={active}
                  className={cx(
                    "h-8 flex-none px-0 font-body text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
                    active ? "text-[#C8A96A]" : "text-[#0B1F33]/50 hover:text-[#0B1F33]",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </section>

        <section className="border-b border-[#0B1F33]/[0.06] py-8">
          <div className="flex snap-x gap-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {summaryMetrics.map(([value, label, trend]) => (
              <div key={label} className="min-w-[154px] snap-start border-r border-[rgba(11,31,51,.08)] pr-8 last:border-r-0">
                <p className="m-0 whitespace-nowrap font-body text-[26px] font-semibold leading-none text-[#0B1F33] md:text-[30px]">{value}</p>
                <p className="mt-2 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/50">{label}</p>
                {trend ? <p className="mt-2 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C8A96A]">{trend}</p> : null}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-10 border-b border-[#0B1F33]/[0.06] py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionTitle
            label="Readout"
            title="What happened, why it matters, and what should happen next."
            copy="Reports stays focused on interpretation. Inventory and listing browsing stay in the map."
          />
          <div className="grid gap-10">
            {keyReadouts.map((item) => (
              <article key={item.headline} className="border-t border-[#0B1F33]/[0.06] pt-5 first:border-t-0 first:pt-0">
                <ReportLabel>{item.eyebrow}</ReportLabel>
                <h3 className="mt-2 font-heading text-2xl font-medium leading-tight tracking-normal text-[#0B1F33] md:text-3xl">
                  {item.headline}
                </h3>
                {item.metrics ? (
                  <div className="mt-5 grid grid-cols-3 gap-4 border-y border-[#0B1F33]/[0.06] py-4">
                    {item.metrics.map(([value, label]) => (
                      <div key={label}>
                        <p className="m-0 font-body text-[20px] font-semibold text-[#0B1F33]">{value}</p>
                        <p className="mt-1 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/50">{label}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                <TextRows rows={item.rows} />
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-10 border-b border-[#0B1F33]/[0.06] py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <img
            src={propertyPerformance.image.src}
            alt={propertyPerformance.image.alt}
            className="aspect-[16/10] w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div>
            <ReportLabel>Property performance</ReportLabel>
            <h2 className="mt-3 font-heading text-3xl font-medium leading-[1.08] tracking-normal text-[#0B1F33] md:text-[42px]">
              {propertyPerformance.headline}
            </h2>
            <TextRows rows={propertyPerformance.rows} />
            <div className="mt-6">
              <ReportButton to="/map?mode=partner&tab=map&filter=Properties" variant="secondary">View property activity</ReportButton>
            </div>
          </div>
        </section>

        <section className="grid gap-10 border-b border-[#0B1F33]/[0.06] py-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
          <div>
            <ReportLabel>Campaign performance</ReportLabel>
            <h2 className="mt-3 font-heading text-3xl font-medium leading-[1.08] tracking-normal text-[#0B1F33] md:text-[42px]">
              {campaignReadout.campaign}
            </h2>
            <p className="mt-2 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/50">{campaignReadout.partner}</p>
            <p className="mt-4 max-w-[640px] font-body text-[14px] leading-relaxed text-[#0B1F33]/68">{campaignReadout.description}</p>
            <TextRows rows={[["Why now", campaignReadout.whyNow], ["Best timing", campaignReadout.bestTiming]]} />
            <div className="mt-5 grid grid-cols-3 gap-4 border-y border-[#0B1F33]/[0.06] py-4">
              {campaignReadout.results.map(([value, label]) => (
                <div key={label}>
                  <p className="m-0 font-body text-[22px] font-semibold text-[#0B1F33]">{value}</p>
                  <p className="mt-1 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/50">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <ReportButton to="/partners/campaigns" variant="secondary">View campaign</ReportButton>
            </div>
          </div>
          <img
            src={campaignReadout.image.src}
            alt={campaignReadout.image.alt}
            className="aspect-[16/10] w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </section>

        <section className="grid gap-10 border-b border-[#0B1F33]/[0.06] py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionTitle
            label="What's getting attention"
            title="Places gaining useful attention."
            copy="These are signals from the week, not a directory of every place on the map."
          />
          <div className="divide-y divide-[#0B1F33]/[0.06]">
            {attentionSignals.map(([name, signal]) => (
              <article key={name} className="py-5 first:pt-0">
                <h3 className="font-body text-[17px] font-semibold tracking-[-0.01em] text-[#0B1F33]">{name}</h3>
                <p className="mt-2 font-body text-[14px] leading-relaxed text-[#0B1F33]/68">{signal}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-10 border-b border-[#0B1F33]/[0.06] py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionTitle
            label="People nearby"
            title="Who responded this week."
            copy="Reports should explain nearby behavior without becoming a dashboard wall."
          />
          <div className="divide-y divide-[#0B1F33]/[0.06]">
            {peopleNearby.map(([audience, behavior]) => (
              <article key={audience} className="grid gap-2 py-5 first:pt-0 md:grid-cols-[170px_minmax(0,1fr)] md:gap-6">
                <h3 className="font-body text-[15px] font-semibold leading-snug text-[#0B1F33]">{audience}</h3>
                <p className="font-body text-[14px] leading-relaxed text-[#0B1F33]/68">{behavior}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 border-b border-[#0B1F33]/[0.06] py-12 md:grid-cols-3">
          {[
            ["Top hotels", topHotels],
            ["Top venues", topVenues],
            ["Top properties", topProperties],
          ].map(([title, items]) => (
            <div key={title}>
              <ReportLabel>{title}</ReportLabel>
              <div className="mt-4 divide-y divide-[#0B1F33]/[0.06]">
                {items.map((item) => (
                  <article key={item.name} className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 py-4 first:pt-0">
                    <ReportMedia item={item} />
                    <div>
                      <h3 className="font-body text-[15px] font-semibold leading-snug text-[#0B1F33]">{item.name}</h3>
                      <p className="mt-2 font-body text-[13px] leading-relaxed text-[#0B1F33]/64">{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-10 border-b border-[#0B1F33]/[0.06] py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionTitle
            label="Listing activity summary"
            title="Listing interest is active, but it needs context."
            copy="People opened available listings near Seaholm, Rainey, Congress, and the Downtown Core. That belongs here as insight, not as an inventory wall."
          />
          <div className="divide-y divide-[#0B1F33]/[0.06]">
            {listingActivity.map(([listing, signal, action]) => (
              <article key={listing} className="grid gap-2 py-5 first:pt-0 md:grid-cols-[190px_minmax(0,1fr)] md:gap-6">
                <h3 className="font-body text-[15px] font-semibold leading-snug text-[#0B1F33]">{listing}</h3>
                <div>
                  <p className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-[#C8A96A]">{signal}</p>
                  <p className="mt-2 font-body text-[14px] leading-relaxed text-[#0B1F33]/68">{action}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionTitle
            label="Next actions"
            title="Keep the next move clear."
            copy="The report should end with a practical decision: where to focus, when to act, and which surface should carry the work."
          />
          <div className="divide-y divide-[#0B1F33]/[0.06]">
            {recommendedActions.map(([title, reason, cta]) => (
              <article key={title} className="grid gap-4 py-5 first:pt-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div>
                  <h3 className="font-body text-[17px] font-semibold tracking-[-0.01em] text-[#0B1F33]">{title}</h3>
                  <p className="mt-2 font-body text-[14px] leading-relaxed text-[#0B1F33]/64">{reason}</p>
                </div>
                <span className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C8A96A]">{cta}</span>
              </article>
            ))}
          </div>
        </section>
      </div>

      <footer className="sticky bottom-0 z-30 border-t border-[#0B1F33]/[0.06] bg-white">
        <div className="mx-auto grid w-full max-w-[1180px] gap-3 px-5 py-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:px-8 lg:px-10">
          <p className="m-0 hidden font-body text-[12px] font-semibold text-[#0B1F33]/58 sm:block">
            Share this briefing or keep working from the partner map.
          </p>
          <ReportButton onClick={() => downloadReport("pdf")} icon={FileText} variant="primary">Export Snapshot</ReportButton>
          <ReportButton onClick={() => downloadReport("csv")} icon={Table}>CSV</ReportButton>
          <ReportButton onClick={emailReport} icon={Mail}>Share Readout</ReportButton>
        </div>
      </footer>
    </main>
  );
}
