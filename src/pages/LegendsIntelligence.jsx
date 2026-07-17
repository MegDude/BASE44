import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Building2, MapPin, Search, TrendingUp } from "lucide-react";
import {
  buildLegendsFallbackAwareness,
  loadLegendsAwareness,
} from "@/services/legendsIntelligence";
import "@/styles/legends-intelligence.css";

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

const translationLayers = [
  {
    title: "Attention",
    copy: "See where Downtown Austin search demand is accumulating and which topics merit a closer look.",
  },
  {
    title: "Discovery",
    copy: "Separate people who already know Legends from people finding the firm through broader searches.",
  },
  {
    title: "Neighborhood interest",
    copy: "Translate neighborhood and property searches into listing, guide, map, and campaign priorities.",
  },
  {
    title: "Real-world activation",
    copy: "Turn the strongest signals into accountable Downtown Perks actions across content, listings, routes, and campaigns.",
  },
];

const keywordDefinitions = [
  {
    title: "Downtown Austin condos",
    patterns: [/downtown.*condo/i, /condo.*downtown/i],
    interpretation: "High-intent downtown housing demand should connect search pages to current listings, map pins, and showing paths.",
    action: "Content and SEO: strengthen the Downtown Austin condo page, schema, internal links, and live listing connections.",
  },
  {
    title: "East Austin",
    patterns: [/east austin/i],
    interpretation: "East Austin interest can reveal where neighborhood discovery overlaps with downtown lifestyle and relocation decisions.",
    action: "Marketing: validate demand in the next export before launching an East Austin campaign or guide.",
  },
  {
    title: "Tarrytown Austin homes",
    patterns: [/tarrytown/i],
    interpretation: "Transactional neighborhood demand is a strong signal for active inventory, market context, and a clear inquiry path.",
    action: "Owner: approve the Tarrytown listing-page priority and keep current inventory attached to the search experience.",
  },
  {
    title: "Legends real estate",
    patterns: [/legends? real (estate|ty)/i],
    interpretation: "Branded demand shows how reliably people who already know Legends can reach the correct firm and agent pages.",
    action: "Marketing: consolidate brand variants and keep homepage, agent profiles, canonical signals, and map identity aligned.",
  },
  {
    title: "Luxury home upgrades",
    patterns: [/luxury home (upgrade|improvement)/i],
    interpretation: "Editorial interest can support seller education when the advice stays Austin-specific and avoids unsupported ROI claims.",
    action: "Content and SEO: build a focused guide and connect it to relevant listings, agent expertise, and neighborhood pages.",
  },
];

function formatNumber(value, fallback = "Not available") {
  return Number.isFinite(Number(value)) ? numberFormatter.format(Number(value)) : fallback;
}

function formatPosition(value) {
  return Number.isFinite(Number(value)) ? decimalFormatter.format(Number(value)) : "Not available";
}

function getAttentionValue(data) {
  if (
    data.cumulativeImpressions !== null &&
    data.cumulativeImpressions !== undefined &&
    Number.isFinite(Number(data.cumulativeImpressions))
  ) {
    return { value: formatNumber(data.cumulativeImpressions), note: "Cumulative impressions" };
  }
  const latest = data.impressionsByMonth?.at(-1);
  if (latest) return { value: formatNumber(latest.impressions), note: latest.month };
  return { value: "Baseline", note: "Monthly export not connected" };
}

function findKeywordSignals(data, patterns) {
  const clicks = (data.topKeywordsByClicks || []).filter((row) =>
    patterns.some((pattern) => pattern.test(row.keyword)),
  );
  const impressions = (data.topKeywordsByImpressions || []).filter((row) =>
    patterns.some((pattern) => pattern.test(row.keyword)),
  );
  return {
    clicks: clicks.reduce((sum, row) => sum + Number(row.clicks || 0), 0),
    impressions: impressions.reduce((sum, row) => sum + Number(row.impressions || 0), 0),
    matched: clicks.length > 0 || impressions.length > 0,
  };
}

export default function LegendsIntelligence() {
  const [awareness, setAwareness] = useState(() => buildLegendsFallbackAwareness());
  const [isFallback, setIsFallback] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Legends Downtown Intelligence | Downtown Perks";
    const controller = new AbortController();
    loadLegendsAwareness({ signal: controller.signal })
      .then((result) => {
        setAwareness(result.data);
        setIsFallback(result.isFallback);
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);

  const attention = getAttentionValue(awareness);
  const sourceReportUrl =
    awareness.sourceReportUrl ||
    import.meta.env.VITE_LUXURY_PRESENCE_REPORT_URL ||
    "/partner-workspace/reports";
  const keywordInsights = useMemo(
    () => keywordDefinitions.map((definition) => ({
      ...definition,
      signal: findKeywordSignals(awareness, definition.patterns),
    })),
    [awareness],
  );

  const kpis = [
    {
      title: "People searching for Legends directly",
      value: formatNumber(awareness.brandedKeywordCount),
      note: "Branded keywords in the current source report",
      icon: Search,
    },
    {
      title: "People discovering Legends naturally",
      value: formatNumber(awareness.nonBrandedKeywordCount),
      note: "Non-branded keywords in the current source report",
      icon: MapPin,
    },
    {
      title: "Known-name position",
      value: formatPosition(awareness.brandedAveragePosition),
      note: "Average position for branded searches",
      icon: Building2,
    },
    {
      title: "Downtown attention over time",
      value: attention.value,
      note: attention.note,
      icon: TrendingUp,
    },
  ];

  return (
    <main className="dp-legends-intelligence">
      <div className="dp-legends-intelligence__shell">
        <header className="dp-legends-intelligence__hero">
          <div>
            <p className="dp-legends-intelligence__eyebrow">SEO Snapshot</p>
            <h1>Legends Downtown Intelligence</h1>
            <p className="dp-legends-intelligence__intro">
              A Downtown Perks operating view of search attention—translated into discovery,
              neighborhood interest, listing priorities, and real-world activation.
            </p>
          </div>
          <div className="dp-legends-intelligence__source">
            <span>Source: {awareness.source}</span>
            <a href={sourceReportUrl} target={sourceReportUrl.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              Open source report <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </header>

        <section className="dp-legends-intelligence__section" aria-labelledby="translation-heading">
          <div className="dp-legends-intelligence__section-heading">
            <p className="dp-legends-intelligence__eyebrow">Downtown Perks translation</p>
            <h2 id="translation-heading">From search signal to downtown action</h2>
            <p>The source report shows demand. This layer explains what each signal changes inside Downtown Perks.</p>
          </div>
          <div className="dp-legends-intelligence__translation-grid">
            {translationLayers.map((layer, index) => (
              <article key={layer.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{layer.title}</h3>
                <p>{layer.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="dp-legends-intelligence__section" aria-labelledby="signals-heading" aria-busy={isLoading}>
          <div className="dp-legends-intelligence__section-heading">
            <p className="dp-legends-intelligence__eyebrow">Current signals</p>
            <h2 id="signals-heading">How people are finding Legends</h2>
          </div>
          <div className="dp-legends-intelligence__kpi-grid">
            {kpis.map(({ title, value, note, icon: Icon }) => (
              <article key={title} className="dp-legends-intelligence__kpi">
                <Icon aria-hidden="true" />
                <p>{title}</p>
                <strong>{isLoading ? "Loading…" : value}</strong>
                <span>{note}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="dp-legends-intelligence__section" aria-labelledby="keywords-heading">
          <div className="dp-legends-intelligence__section-heading">
            <p className="dp-legends-intelligence__eyebrow">Keyword reads</p>
            <h2 id="keywords-heading">Where attention can become action</h2>
            <p>Each read separates the source signal from the next Downtown Perks operating step.</p>
          </div>
          <div className="dp-legends-intelligence__keyword-list">
            {keywordInsights.map((insight) => (
              <article key={insight.title}>
                <div className="dp-legends-intelligence__keyword-title">
                  <h3>{insight.title}</h3>
                  <span>
                    {insight.signal.matched
                      ? `${formatNumber(insight.signal.clicks, "0")} clicks · ${formatNumber(insight.signal.impressions, "0")} impressions`
                      : "Not present in current source export"}
                  </span>
                </div>
                <p>{insight.interpretation}</p>
                <p className="dp-legends-intelligence__next-step">{insight.action}</p>
              </article>
            ))}
          </div>
        </section>

        {isFallback ? (
          <section className="dp-legends-intelligence__fallback" aria-labelledby="fallback-heading">
            <p className="dp-legends-intelligence__eyebrow">Source-report fallback</p>
            <h2 id="fallback-heading">The verified snapshot is active.</h2>
            <p>
              The live API or structured export is not available, so this view is using the latest validated
              Luxury Presence snapshot. Monthly trend and cumulative impression fields remain unavailable rather
              than being estimated.
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
