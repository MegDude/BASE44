
'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { stats, dataset } from '@/lib/data';
import { rankEntities } from '@/lib/ranking';
import type { Mode, SearchEntity } from '@/lib/types';
import { ModeSwitch } from './ModeSwitch';

const DynamicMap = dynamic(() => import('./MapClient').then((m) => m.MapClient), { ssr: false });

const residentPrompts = ['coffee near Seaholm', 'where should I go tonight', 'events this evening', 'perks near Rainey'];
const partnerPrompts = ['which buildings are most active', 'what offers convert near Rainey', 'what is driving evening traffic', 'what does this building unlock nearby'];

const residentFeatures = [
  ['Map-first', 'Everything starts with geography. Buildings, venues, perks, and events live on a real map.'],
  ['Resident-focused', 'Built around the routines of people who actually live downtown.'],
  ['Clear decisions', 'Every signal should lead to something useful, not just something visible.'],
  ['Calm by default', 'No spam. No noise. Just relevant timing and simple actions.'],
];

const partnerFeatures = [
  ['Perk management', 'Create and schedule resident offers by building, district, and time of day.'],
  ['Venue data', 'See which nearby venues get the most engagement from building residents.'],
  ['Building overview', 'Amenities, nearby partners, listing counts, and price ranges in one place.'],
  ['Leasing context', 'Show the daily texture around each building, not just the unit itself.'],
];

export function DowntownPerksExplorer({
  initialMode = 'resident' as Mode,
  initialQuery = '',
}: {
  initialMode?: Mode;
  initialQuery?: string;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [query, setQuery] = useState(initialQuery);
  const localRanked = useMemo(() => rankEntities(query, mode, dataset).slice(0, 12), [query, mode]);
  const [ranked, setRanked] = useState<SearchEntity[]>(localRanked);
  const visible = ranked.slice(0, 4);
  const [selected, setSelected] = useState<SearchEntity | undefined>(visible[0]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setRanked(localRanked);
  }, [localRanked]);

  useEffect(() => {
    setSelected(visible[0]);
    try { localStorage.setItem('dp-mode', mode); } catch {}
  }, [mode, ranked]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setMessage('');
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const res = await fetch('/api/ask-map', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: trimmedQuery, mode }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error('Search request failed');
        }

        const data = await res.json();

        if (controller.signal.aborted) return;

        if (Array.isArray(data.results) && data.results.length > 0) {
          setRanked(data.results);
        }

        setMessage(typeof data.message === 'string' ? data.message : '');
      } catch {
        if (!controller.signal.aborted) {
          setMessage('Using local map results right now.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, mode]);

  async function postAction(url: string) {
    if (!selected) return;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: selected.id, itemTitle: selected.title, mode }),
    });
    const data = await res.json();
    setMessage(data.message || 'Saved.');
  }

  async function startCheckout(plan: string) {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan,
        successUrl: typeof window !== 'undefined' ? `${window.location.origin}/partner-dashboard?checkout=success` : '',
        cancelUrl: typeof window !== 'undefined' ? `${window.location.origin}/partner-dashboard?checkout=cancelled` : '',
      }),
    });
    const data = await res.json();
    if (data.checkoutUrl && typeof window !== 'undefined') window.open(data.checkoutUrl, '_blank');
    setMessage(data.provider === 'stripe' ? 'Stripe checkout created.' : 'Mock checkout created. Add Stripe env vars for live payments.');
  }

  return (
    <div>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <div className="kicker">{mode === 'resident' ? 'Downtown Perks' : 'For operators'}</div>
              <h1 className="h1">{mode === 'resident' ? 'Where downtown meets you.' : 'Your buildings. Your neighborhood. Measurable.'}</h1>
              <p className="lead">
                {mode === 'resident'
                  ? 'One card. Every perk, event, and place in the 5-minute neighborhood. Open the map, see what is happening, and go.'
                  : 'The operator dashboard puts buildings, walking-distance partners, and resident activity on one map. See how the neighborhood drives value for your properties — proximity and timing, not ad placement.'}
              </p>
              <div className="actions">
                <a href="#map-layer" className="btn">{mode === 'resident' ? 'Explore the Map' : 'Open the Operator Map'}</a>
                <a href="#contact" className="btn-ghost">{mode === 'resident' ? 'Get the Text Link' : 'Start a Pilot'}</a>
              </div>
              <ModeSwitch mode={mode} setMode={setMode} />
            </motion.div>
          </div>

          <motion.div className="card card-pad" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.48 }}>
            <div className="kicker">Ask the Map</div>
            <h2 className="section-title section-title--compact">One product. Two points of view.</h2>
            <p className="section-copy">
              {mode === 'resident'
                ? 'Resident mode answers where to go, what is happening, and what perk to use.'
                : 'Partner mode answers what is working, which buildings and venues are active, and what is driving value.'}
            </p>
            <div className="searchbar">
              <span>⌕</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={(mode === 'resident' ? residentPrompts : partnerPrompts)[0]} />
            </div>
            <div className="chips">
              {(mode === 'resident' ? residentPrompts : partnerPrompts).map((prompt) => (
                <button key={prompt} className="btn-chip active" onClick={() => setQuery(prompt)}>{prompt}</button>
              ))}
            </div>
            {isLoading && <p className="small" aria-live="polite">Refreshing AI map recommendations…</p>}
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container stats-grid">
          {(mode === 'resident'
            ? [
                ['Perks active now', '36', 'Offers residents can actually use today.'],
                ['Events nearby', '18', 'Programming, loops, mixers, and timely plans.'],
                ['Walkable places', String(stats.mappedVenues), 'Curated nearby stops inside the resident layer.'],
                ['No extra app required', 'SMS', 'Text-link entry keeps access light.'],
              ]
            : [
                ['Listings tracked', String(stats.listingsTracked), '4 extracted into the building layer.'],
                ['Mapped venues', String(stats.mappedVenues), 'Bars, restaurants, coffee shops, and wellness spots.'],
                ['Nightlife venues', String(stats.nightlifeVenues), 'Evening venues across downtown.'],
                ['Buildings', String(stats.buildingAnchors), 'Rental buildings and grouped property listings.'],
              ]).map(([label, value, detail]) => (
            <motion.div key={label} className="card card-pad kpi-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="kicker">{label}</div>
              <div className="kpi-value">{value}</div>
              <div className="small">{detail}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section" id="map-layer">
        <div className="container">
          <div className="kicker">The map is the product</div>
          <h2 className="section-title">A live decision layer for downtown.</h2>
          <p className="section-copy">Find places. See events. Unlock perks. Understand buildings. Show partner value without breaking the product into separate systems.</p>
          <div className="map-shell">
            <div className="card card-pad map-card">
              <DynamicMap entities={ranked} selected={selected} onSelect={setSelected} />
            </div>
            <div className="result-stack">
              {visible.map((entity, index) => (
                <motion.button
                  key={entity.id}
                  className={`result-card ${selected?.id === entity.id ? 'active' : ''}`}
                  onClick={() => setSelected(entity)}
                  whileHover={{ y: -3 }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="result-label">{index === 0 ? (mode === 'resident' ? 'Top pick near you' : 'Featured insight') : 'Nearby option'}</div>
                  <h3>{entity.title}</h3>
                  <p>{entity.summary}</p>
                  <div className="result-meta">
                    {entity.signals.slice(0, 3).map((signal) => <span key={signal} className="meta-pill">{signal}</span>)}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container cards-4">
          {(mode === 'resident' ? residentFeatures : partnerFeatures).map(([title, body], index) => (
            <motion.article key={title} className="card card-pad" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}>
              <div className="kicker">Downtown Perks</div>
              <h3 className="feature-title">{title}</h3>
              <p className="section-copy feature-copy">{body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <motion.aside
        className={`detail-drawer ${selected ? 'open' : ''}`}
        initial={false}
        animate={{ y: selected ? 0 : 20, opacity: selected ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        {selected && (
          <div className="drawer-inner">
            <div className="kicker">Best next move</div>
            <h3 className="drawer-title">{selected.title}</h3>
            <p className="drawer-copy">{selected.detail || selected.summary}</p>
            <div className="result-meta">
              {selected.signals.map((signal) => <span key={signal} className="meta-pill">{signal}</span>)}
            </div>
            <div className="actions">
              <button className="btn-ghost" onClick={() => postAction('/api/rsvp')}>RSVP</button>
              <button className="btn-ghost" onClick={() => postAction('/api/redeem')}>Use perk</button>
            </div>
            {mode === 'partner' && (
              <div className="actions">
                <button className="btn" onClick={() => startCheckout('venue-pilot')}>Venue pilot</button>
                <button className="btn-ghost" onClick={() => startCheckout('property-pilot')}>Property pilot</button>
              </div>
            )}
            {message && <p className="small drawer-message">{message}</p>}
          </div>
        )}
      </motion.aside>
    </div>
  );
}
