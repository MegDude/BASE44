'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  Layers3,
  MapPinned,
  Radar,
  ScanLine,
  Sparkles,
  Store,
  Ticket,
  Users,
  Zap,
} from 'lucide-react';
import { TextLinkForm } from '@/components/TextLinkForm';
import SimulatorPanel from '@/components/SimulatorPanel';
import {
  audienceSignals,
  dashboardStats,
  discoverySources,
  eventImpact,
  funnelSteps,
  liveActivityFeed,
  partnerActions,
  partnerLenses,
  perkPerformance,
  redemptionLog,
  rentalBuildingSignals,
  searchEntities,
  stationAnalytics,
  whyThisMatters,
} from '@/lib/ecosystem-data';
import type { PartnerTypeKey } from '@/lib/ecosystem-data';
import type { SearchEntity } from '@/lib/types';

const DynamicMap = dynamic(() => import('./MapClient').then((module) => module.MapClient), { ssr: false });

type PartnerPage = 'overview' | 'map' | 'partner' | 'redemptions' | 'explorer' | 'about';

const nav = [
  { href: '/partner-dashboard', label: 'Overview', icon: Radar },
  { href: '/partner-dashboard/map', label: 'Map', icon: MapPinned },
  { href: '/partner-dashboard/partner', label: 'Partner', icon: Store },
  { href: '/partner-dashboard/redemptions', label: 'Redemptions', icon: Ticket },
  { href: '/partner-dashboard/explorer', label: 'Integrations', icon: ScanLine },
  { href: '/partner-dashboard/about', label: 'About', icon: Sparkles },
] as const;

const overviewTabs = ['Overview', 'Visibility', 'Conversion', 'Perks', 'Audience', 'Events', 'Actions'] as const;

function clampPercent(value: number, max: number) {
  if (!max) return 0;
  return Math.max(12, Math.round((value / max) * 100));
}

function partnerHref(page: PartnerPage, type: PartnerTypeKey) {
  const base =
    page === 'overview'
      ? '/partner-dashboard'
      : page === 'map'
        ? '/partner-dashboard/map'
        : page === 'partner'
          ? '/partner-dashboard/partner'
          : page === 'redemptions'
            ? '/partner-dashboard/redemptions'
            : page === 'explorer'
              ? '/partner-dashboard/explorer'
              : '/partner-dashboard/about';
  return `${base}?type=${type}`;
}

export function PartnerDashboardShell({
  page = 'overview',
  partnerType = 'venues',
}: {
  page?: PartnerPage;
  partnerType?: PartnerTypeKey;
}) {
  const pathname = usePathname();
  const lens = partnerLenses[partnerType];
  const [activeTab, setActiveTab] = useState<(typeof overviewTabs)[number]>('Overview');
  const [message, setMessage] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(searchEntities[0]?.id);
  const [layerState, setLayerState] = useState({
    venues: true,
    events: true,
    properties: true,
    moments: false,
  });

  const mapEntities = useMemo(() => {
    return searchEntities.filter((entity) => {
      if (entity.type === 'venue') return layerState.venues;
      if (entity.type === 'event') return layerState.events;
      if (entity.type === 'property' || entity.type === 'building') return layerState.properties;
      if (entity.type === 'moment') return layerState.moments;
      return true;
    });
  }, [layerState]);

  useEffect(() => {
    if (!mapEntities.some((entity) => entity.id === selectedId)) {
      setSelectedId(mapEntities[0]?.id);
    }
  }, [mapEntities, selectedId]);

  const selectedEntity = mapEntities.find((entity) => entity.id === selectedId) || mapEntities[0];

  const venueBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    redemptionLog.forEach((row) => {
      counts.set(row.venueName, (counts.get(row.venueName) || 0) + 1);
    });
    return [...counts.entries()].sort((left, right) => right[1] - left[1]);
  }, []);

  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    redemptionLog.forEach((row) => {
      counts.set(row.category, (counts.get(row.category) || 0) + 1);
    });
    return [...counts.entries()].sort((left, right) => right[1] - left[1]);
  }, []);

  async function startCheckout(plan: 'venue-pilot' | 'property-pilot') {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    const data = await response.json();
    if (data.checkoutUrl) window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer');
    setMessage(
      data.provider === 'stripe'
        ? 'Checkout opened in a new tab.'
        : 'Pilot request recorded. Add Stripe env vars for live checkout.',
    );
  }

  function toggleLayer(key: keyof typeof layerState) {
    setLayerState((current) => ({ ...current, [key]: !current[key] }));
  }

  function renderOverviewPanel() {
    if (activeTab === 'Visibility') {
      const max = Math.max(...discoverySources.map((item) => item.value));
      return (
        <article className="surface-card">
          <div className="stack">
            <div className="kicker">Discovery sources</div>
            <h3 className="feature-title">How the venue is being found</h3>
            <div className="progress-list">
              {discoverySources.map((item) => (
                <div className="progress-list__row" key={item.label}>
                  <div className="list-card__title">
                    <strong>{item.label}</strong>
                    <span className="small">{item.value}%</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${clampPercent(item.value, max)}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </article>
      );
    }

    if (activeTab === 'Conversion') {
      const max = Math.max(...funnelSteps.map((step) => step.value));
      return (
        <article className="surface-card">
          <div className="stack">
            <div className="kicker">Conversion path</div>
            <h3 className="feature-title">From map impression to real arrival</h3>
            <div className="progress-list">
              {funnelSteps.map((step) => (
                <div className="progress-list__row" key={step.label}>
                  <div className="list-card__title">
                    <div>
                      <strong>{step.label}</strong>
                      <p className="small">{step.detail}</p>
                    </div>
                    <span className="small">{step.value.toLocaleString()}</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${clampPercent(step.value, max)}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </article>
      );
    }

    if (activeTab === 'Perks') {
      return (
        <article className="surface-card">
          <div className="stack">
            <div className="kicker">Perk performance</div>
            <h3 className="feature-title">What is converting versus merely visible</h3>
            <div className="data-list">
              {perkPerformance.map((item) => (
                <div className="data-row" key={item.name}>
                  <div>
                    <strong>{item.name}</strong>
                    <p className="small">{item.signal}</p>
                  </div>
                  <div className="stack" style={{ justifyItems: 'end' }}>
                    <span className="meta-pill">{item.status}</span>
                    <span className="small">{item.saveRate} save · {item.redemptionRate} redeem</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      );
    }

    if (activeTab === 'Audience') {
      return (
        <div className="cards-2">
          {audienceSignals.map((item) => (
            <article className="surface-card" key={item.label}>
              <div className="stack">
                <div className="kicker">Audience signal</div>
                <h3 className="feature-title">{item.label}</h3>
                <div className="metric-card__value">{item.value}</div>
                <p className="section-copy">{item.note}</p>
              </div>
            </article>
          ))}
        </div>
      );
    }

    if (activeTab === 'Events') {
      return (
        <div className="cards-2">
          {eventImpact.map((item) => (
            <article className="surface-card" key={item.label}>
              <div className="stack">
                <div className="kicker">Events impact</div>
                <h3 className="feature-title">{item.label}</h3>
                <div className="metric-card__value">{item.value}</div>
                <p className="section-copy">Events are not a side module. They change where the district moves next.</p>
              </div>
            </article>
          ))}
        </div>
      );
    }

    if (activeTab === 'Actions') {
      return (
        <div className="cards-2">
          <article className="surface-card">
            <div className="stack">
              <div className="kicker">Next best actions</div>
              <h3 className="feature-title">What to do next</h3>
              <div className="data-list">
                {partnerActions.map((item) => (
                  <div className="data-row" key={item.title}>
                    <div>
                      <strong>{item.title}</strong>
                      <p className="small">{item.body}</p>
                    </div>
                    <span className="meta-pill">{item.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
          <article className="surface-card">
            <div className="stack">
              <div className="kicker">Why this matters</div>
              <h3 className="feature-title">The reason the dashboard exists</h3>
              <div className="data-list">
                {whyThisMatters.map((item) => (
                  <div className="data-row" key={item}>
                    <div>
                      <strong>{item}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      );
    }

    return (
      <div className="grid-2">
        <article className="surface-card">
          <div className="stack">
            <div className="kicker">Live activity</div>
            <h3 className="feature-title">What just happened</h3>
            <div className="data-list">
              {liveActivityFeed.map((item) => (
                <div className="data-row" key={item.title}>
                  <div>
                    <strong>{item.title}</strong>
                    <p className="small">{item.meta}</p>
                  </div>
                  <span className="meta-pill">{item.stamp}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="surface-card">
          <div className="stack">
            <div className="kicker">Partner fit</div>
            <h3 className="feature-title">{lens.headline}</h3>
            <p className="section-copy">{lens.sub}</p>
            <div className="result-meta">
              {lens.metrics.map((metric) => (
                <span className="meta-pill" key={metric.label}>{metric.value} · {metric.label}</span>
              ))}
            </div>
          </div>
        </article>
      </div>
    );
  }

  function renderMapPanel() {
    return (
      <>
        <section className="partner-toolbar">
          <div className="toolbar-row">
            <div className="kicker">Layers</div>
            <div className="pill-row">
              {[
                ['venues', 'Venues'],
                ['events', 'Events'],
                ['properties', 'Buildings'],
                ['moments', 'Moments'],
              ].map(([key, label]) => (
                <button
                  className={`pill-button ${layerState[key as keyof typeof layerState] ? 'active' : ''}`}
                  key={key}
                  onClick={() => toggleLayer(key as keyof typeof layerState)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="toolbar-row">
            {lens.mapFeatures.map((item) => (
              <span className="meta-pill" key={item}>{item}</span>
            ))}
          </div>
        </section>

        <section className="partner-map-layout">
          <article className="card map-panel">
            <DynamicMap entities={mapEntities} onSelect={(entity) => setSelectedId(entity.id)} selected={selectedEntity} />
          </article>
          <div className="partner-results">
            {selectedEntity ? (
              <article className="surface-card">
                <div className="stack">
                  <div className="kicker">Selected layer</div>
                  <h3 className="feature-title">{selectedEntity.title}</h3>
                  <p className="section-copy">{selectedEntity.summary}</p>
                  <div className="result-meta">
                    {selectedEntity.signals.map((signal) => (
                      <span className="meta-pill" key={signal}>{signal}</span>
                    ))}
                  </div>
                  <Link className="btn-ghost" href={selectedEntity.href || '/resident-app'}>Open linked surface</Link>
                </div>
              </article>
            ) : null}

            {mapEntities.slice(0, 4).map((entity) => (
              <button
                className={`result-card ${selectedEntity?.id === entity.id ? 'active' : ''}`}
                key={entity.id}
                onClick={() => setSelectedId(entity.id)}
                type="button"
              >
                <div className="result-label">Map surface</div>
                <h3>{entity.title}</h3>
                <p>{entity.detail}</p>
                <div className="result-meta">
                  {entity.signals.slice(0, 3).map((signal) => (
                    <span className="meta-pill" key={signal}>{signal}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>
      </>
    );
  }

  function renderPartnerPanel() {
    return (
      <div className="stack-lg">
        <section className="surface-hero">
          <div className="surface-eyebrow">{lens.eyebrow}</div>
          <h1 className="surface-heading">{lens.headline}</h1>
          <p className="surface-subtitle">{lens.sub}</p>
          <div className="hero-meta-grid">
            {lens.metrics.map((metric) => (
              <div className="metric-card" key={metric.label}>
                <div className="metric-card__value">{metric.value}</div>
                <p className="small">{metric.label}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="cards-2">
          <article className="surface-card">
            <div className="stack">
              <div className="kicker">Capabilities</div>
              <h3 className="feature-title">What this partner sees</h3>
              <div className="data-list">
                {lens.capabilities.map((item) => (
                  <div className="data-row" key={item.title}>
                    <div>
                      <strong>{item.title}</strong>
                      <p className="small">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="surface-card">
            <div className="stack">
              <div className="kicker">Why it works</div>
              <h3 className="feature-title">The product logic</h3>
              <div className="data-list">
                {lens.whyItWorks.map((item) => (
                  <div className="data-row" key={item.title}>
                    <div>
                      <strong>{item.title}</strong>
                      <p className="small">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>

        <div className="cards-2">
          <article className="surface-card">
            <div className="stack">
              <div className="kicker">Map features</div>
              <h3 className="feature-title">What shows up in the layer</h3>
              <div className="data-list">
                {lens.mapFeatures.map((item) => (
                  <div className="data-row" key={item}>
                    <div><strong>{item}</strong></div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="surface-card">
            <div className="stack">
              <div className="kicker">How onboarding works</div>
              <h3 className="feature-title">From listing to live proof</h3>
              <div className="data-list">
                {lens.steps.map((item, index) => (
                  <div className="data-row" key={item}>
                    <div>
                      <strong>Step {index + 1}</strong>
                      <p className="small">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  function renderRedemptionsPanel() {
    const venueMax = venueBreakdown[0]?.[1] || 1;
    const categoryMax = categoryBreakdown[0]?.[1] || 1;
    return (
      <div className="stack-lg">
        <div className="cards-3">
          <article className="metric-card"><div className="kicker">Scans</div><div className="metric-card__value">{redemptionLog.length}</div><p className="small">Proof events captured</p></article>
          <article className="metric-card"><div className="kicker">Venues</div><div className="metric-card__value">{venueBreakdown.length}</div><p className="small">Locations with measurable movement</p></article>
          <article className="metric-card"><div className="kicker">Categories</div><div className="metric-card__value">{categoryBreakdown.length}</div><p className="small">Perk types across the district</p></article>
        </div>

        <div className="cards-2">
          <article className="surface-card">
            <div className="stack">
              <div className="kicker">By venue</div>
              <h3 className="feature-title">Who is converting</h3>
              <div className="progress-list">
                {venueBreakdown.map(([label, value]) => (
                  <div className="progress-list__row" key={label}>
                    <div className="list-card__title"><strong>{label}</strong><span className="small">{value}</span></div>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${clampPercent(value, venueMax)}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="surface-card">
            <div className="stack">
              <div className="kicker">By category</div>
              <h3 className="feature-title">What type of offer is working</h3>
              <div className="progress-list">
                {categoryBreakdown.map(([label, value]) => (
                  <div className="progress-list__row" key={label}>
                    <div className="list-card__title"><strong>{label}</strong><span className="small">{value}</span></div>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${clampPercent(value, categoryMax)}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>

        <article className="surface-card table-shell">
          <div className="stack">
            <div className="kicker">Redemption log</div>
            <h3 className="feature-title">Every proof point in one table</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Venue</th>
                  <th>Offer</th>
                  <th>Member</th>
                  <th>District</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {redemptionLog.map((row) => (
                  <tr key={row.id}>
                    <td>{row.venueName}</td>
                    <td>{row.perkName}</td>
                    <td>{row.memberName}</td>
                    <td>{row.district}</td>
                    <td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    );
  }

  function renderExplorerPanel() {
    return (
      <div className="stack-lg">
        <section className="surface-hero">
          <div className="surface-eyebrow">Stations</div>
          <h1 className="surface-heading">The prompt layer feeds the dashboard.</h1>
          <p className="surface-subtitle">
            Lobby prompts, venue QR flows, and on-site questions are how the product captures what residents actually want. Those signals return here as better perk design and better operator decisions.
          </p>
        </section>

        <div className="cards-2">
          {stationAnalytics.map((station) => (
            <article className="surface-card" key={station.id}>
              <div className="stack">
                <div className="list-card__title">
                  <div>
                    <div className="kicker">Station {station.id}</div>
                    <h3 className="feature-title">{station.name}</h3>
                  </div>
                  <span className="meta-pill">{station.theme}</span>
                </div>
                <p className="small">{station.location} · {station.question}</p>
                <div className="result-meta">
                  <span className="meta-pill">{station.scans} scans</span>
                  <span className="meta-pill">{station.completionRate}% completion</span>
                  <span className="meta-pill">{station.topResponse}</span>
                </div>
                <p className="section-copy">{station.insight}</p>
                <p className="small">{station.partnerBenefit}</p>
                <div className="actions">
                  <Link className="btn-ghost" href={station.ctaHref}>Preview station</Link>
                  <Link className="btn" href="/resident-app/station">Resident flow</Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <TextLinkForm
          description="Use the hardened Twilio route to hand the resident surface to someone standing in the lobby or at the venue."
          source="partner-explorer"
          title="Send the resident app during the pilot"
        />
      </div>
    );
  }

  function renderAboutPanel() {
    return (
      <div className="stack-lg">
        <section className="surface-hero surface-hero--navy">
          <div className="surface-eyebrow">How it works</div>
          <h1 className="surface-heading">Connect the property. Turn on the neighborhood.</h1>
          <p className="surface-subtitle">
            Onboarding is meant to be operational, not theatrical: connect the building or venue, hand people the map, let the district start producing proof.
          </p>
          <div className="actions">
            <button className="btn" onClick={() => startCheckout(partnerType === 'properties' ? 'property-pilot' : 'venue-pilot')} type="button">
              Start {partnerType === 'properties' ? 'property' : 'venue'} pilot
            </button>
            <Link className="btn-ghost" href="/sign-in">Open admin sign-in</Link>
          </div>
        </section>

        {message ? <div className="notice-banner">{message}</div> : null}

        <div className="cards-2">
          <article className="surface-card">
            <div className="stack">
              <div className="kicker">Property layer</div>
              <h3 className="feature-title">Buildings already tracked</h3>
              <div className="data-list">
                {rentalBuildingSignals.slice(0, 4).map((building) => (
                  <div className="data-row" key={building.name}>
                    <div>
                      <strong>{building.name}</strong>
                      <p className="small">{building.district} · ${building.price.toLocaleString()}</p>
                    </div>
                    <span className="meta-pill">{building.nearbyPerks[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="surface-card">
            <div className="stack">
              <div className="kicker">FAQ</div>
              <h3 className="feature-title">Questions the partner surface answers</h3>
              <div className="data-list">
                {lens.faq.map((item) => (
                  <div className="data-row" key={item.q}>
                    <div>
                      <strong>{item.q}</strong>
                      <p className="small">{item.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  const pageHeading: Record<PartnerPage, { eyebrow: string; title: string; body: string }> = {
    overview: {
      eyebrow: 'Partner dashboard',
      title: 'Overview',
      body: 'Visibility, conversion, perk performance, audience signals, and next actions in one operator-grade surface.',
    },
    map: {
      eyebrow: 'Partner dashboard',
      title: 'Map',
      body: 'The operator side still centers the same downtown layer. Layers change by lens, not by separate product.',
    },
    partner: {
      eyebrow: 'Partner dashboard',
      title: lens.label,
      body: 'A partner-specific framing without breaking the shared ecosystem model underneath it.',
    },
    redemptions: {
      eyebrow: 'Partner dashboard',
      title: 'Redemptions',
      body: 'Real proof, not summary boxes. Every scan should point back to a place, a perk, and a district pattern.',
    },
    explorer: {
      eyebrow: 'Partner dashboard',
      title: 'Integrations',
      body: 'Station prompts, QR flows, and handoff tools that feed better neighborhood intelligence.',
    },
    about: {
      eyebrow: 'Partner dashboard',
      title: 'About',
      body: 'Onboarding, building context, and pilot mechanics for a clean Vercel-ready deployment.',
    },
  };

  const heading = pageHeading[page];

  return (
    <main className="ecosystem-main">
      <div className="container stack-lg">
        <div className="partner-shell">
          <aside className="partner-sidebar sidebar-surface">
            <div className="stack">
              <div className="surface-eyebrow">Partner</div>
              <h2 className="feature-title">Proof lives in the same map.</h2>
              <p className="small">Overview, map, partner type, redemptions, integrations, and pilot context all belong to one dashboard.</p>
            </div>
            <nav className="sidebar-nav" aria-label="Partner navigation">
              {nav.map(({ href, icon: Icon, label }) => (
                <Link className={pathname === href ? 'nav-active' : ''} href={`${href}?type=${partnerType}`} key={href}>
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="surface-divider stack">
              <div className="kicker">Partner type</div>
              <div className="pill-row">
                {(Object.keys(partnerLenses) as PartnerTypeKey[]).map((type) => (
                  <Link className={`pill-button ${partnerType === type ? 'active' : ''}`} href={partnerHref(page, type)} key={type}>
                    {partnerLenses[type].label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <div className="partner-content">
            <section className="surface-card">
              <div className="stack">
                <div className="surface-eyebrow">{heading.eyebrow}</div>
                <h1 className="surface-heading">{heading.title}</h1>
                <p className="surface-subtitle">{heading.body}</p>
              </div>
            </section>

            {page === 'overview' ? (
              <>
                <div className="metric-grid">
                  {dashboardStats.map((stat) => (
                    <article className="metric-card" key={stat.label}>
                      <div className="kicker">{stat.label}</div>
                      <div className="metric-card__value">{stat.value}</div>
                      <div className="metric-card__delta">{stat.delta}</div>
                      <p className="small">{stat.note}</p>
                    </article>
                  ))}
                </div>
                <SimulatorPanel />
                <div className="pill-nav">
                  {overviewTabs.map((tab) => (
                    <button className={`pill-button ${activeTab === tab ? 'active' : ''}`} key={tab} onClick={() => setActiveTab(tab)} type="button">
                      {tab}
                    </button>
                  ))}
                </div>
                {renderOverviewPanel()}
              </>
            ) : null}

            {page === 'map' && renderMapPanel()}
            {page === 'partner' && renderPartnerPanel()}
            {page === 'redemptions' && renderRedemptionsPanel()}
            {page === 'explorer' && renderExplorerPanel()}
            {page === 'about' && renderAboutPanel()}
          </div>
        </div>
      </div>
    </main>
  );
}
