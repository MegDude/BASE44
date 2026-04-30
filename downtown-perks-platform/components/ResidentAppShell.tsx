'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  Coffee,
  CreditCard,
  Footprints,
  Heart,
  MapPin,
  Palette,
  Settings2,
  Shield,
  Sparkles,
  Star,
  Ticket,
  User,
  Zap,
} from 'lucide-react';
import { TextLinkForm } from '@/components/TextLinkForm';
import {
  memberProfile,
  residentAskPrompts,
  residentEvents,
  residentFilters,
  residentMoments,
  residentPerks,
  residentProperties,
  searchEntities,
  stationPrompts,
} from '@/lib/ecosystem-data';
import type { SearchEntity } from '@/lib/types';

const DynamicMap = dynamic(() => import('./MapClient').then((module) => module.MapClient), { ssr: false });

type ResidentPage = 'now' | 'perks' | 'card' | 'events' | 'saved' | 'properties' | 'profile' | 'explore' | 'station';

const desktopNav = [
  { href: '/resident-app', label: 'Map', icon: MapPin },
  { href: '/resident-app/perks', label: 'Perks Card', icon: Ticket },
  { href: '/resident-app/events', label: 'Events', icon: Calendar },
  { href: '/resident-app/saved', label: 'Saved', icon: Bookmark },
  { href: '/resident-app/properties', label: 'Buildings', icon: Building2 },
  { href: '/resident-app/explore', label: 'Explore', icon: Sparkles },
  { href: '/resident-app/profile', label: 'Profile', icon: User },
] as const;

const mobileNav = [
  { href: '/resident-app', label: 'Now', icon: MapPin },
  { href: '/resident-app/saved', label: 'Plan', icon: Bookmark },
  { href: '/resident-app/card', label: 'Card', icon: CreditCard },
  { href: '/resident-app/profile', label: 'You', icon: User },
] as const;

const savedSegments = ['All', 'Places', 'Events', 'Moments', 'Properties'] as const;
const profilePrefs = ['Coffee', 'Nightlife', 'Food', 'Wellness', 'Arts'] as const;
const privacyModes = ['Show district only', 'Friends only', 'Appear offline'] as const;

function itemForEntity(entity: SearchEntity) {
  if (entity.type === 'venue') {
    const perk = residentPerks.find((item) => item.id === entity.id);
    return {
      title: entity.title,
      subtitle: perk ? `${perk.offer} · ${perk.distance}` : entity.detail,
      primary: 'Use perk',
      path: '/api/redeem',
    };
  }
  if (entity.type === 'event') {
    return {
      title: entity.title,
      subtitle: entity.detail,
      primary: 'RSVP',
      path: '/api/rsvp',
    };
  }
  return {
    title: entity.title,
    subtitle: entity.detail,
    primary: 'Save',
    path: '/api/rsvp',
  };
}

export function ResidentAppShell({
  page = 'now',
  stationId = 1,
}: {
  page?: ResidentPage;
  stationId?: number;
}) {
  const pathname = usePathname();
  const residentEntities = useMemo(
    () => searchEntities.filter((entity) => ['venue', 'event', 'property', 'moment'].includes(entity.type)),
    [],
  );

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<(typeof residentFilters)[number]['key']>('all');
  const [selectedId, setSelectedId] = useState<string | undefined>(residentEntities[0]?.id);
  const [savedIds, setSavedIds] = useState<Set<string>>(
    () => new Set(['perk-houndstooth', 'event-happy-hour-loop', 'property-the-independent', 'moment-coffee-now']),
  );
  const [redeemedIds, setRedeemedIds] = useState<Set<string>>(() => new Set(['perk-black-swan-yoga']));
  const [rsvpIds, setRsvpIds] = useState<Set<string>>(() => new Set(['event-members-night']));
  const [message, setMessage] = useState('');
  const [savedSegment, setSavedSegment] = useState<(typeof savedSegments)[number]>('All');
  const [prefSet, setPrefSet] = useState<Set<string>>(() => new Set(['Coffee', 'Food', 'Nightlife']));
  const [privacy, setPrivacy] = useState<(typeof privacyModes)[number]>('Show district only');
  const [district, setDistrict] = useState(memberProfile.district);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [stationStep, setStationStep] = useState<'question' | 'thanks'>('question');
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [typedAnswer, setTypedAnswer] = useState('');

  const selectedStation = stationPrompts.find((station) => station.id === stationId) || stationPrompts[0];

  const filteredEntities = useMemo(() => {
    return residentEntities.filter((entity) => {
      const haystack = `${entity.title} ${entity.summary} ${entity.detail} ${entity.district || ''} ${entity.category || ''}`.toLowerCase();
      const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
      const matchesFilter =
        activeFilter === 'all'
          ? true
          : activeFilter === 'places'
            ? entity.type === 'venue'
            : activeFilter === 'offers'
              ? entity.type === 'venue'
              : activeFilter === 'events'
                ? entity.type === 'event'
                : activeFilter === 'buildings'
                  ? entity.type === 'property'
                  : entity.signals.some((signal) => /open|live|happening/i.test(signal));
      return matchesQuery && matchesFilter;
    });
  }, [activeFilter, query, residentEntities]);

  useEffect(() => {
    if (!filteredEntities.some((entity) => entity.id === selectedId)) {
      setSelectedId(filteredEntities[0]?.id);
    }
  }, [filteredEntities, selectedId]);

  const selectedEntity = filteredEntities.find((entity) => entity.id === selectedId) || filteredEntities[0];

  const savedItems = useMemo(() => {
    return residentEntities
      .filter((entity) => savedIds.has(entity.id))
      .filter((entity) => {
        if (savedSegment === 'All') return true;
        if (savedSegment === 'Places') return entity.type === 'venue';
        if (savedSegment === 'Events') return entity.type === 'event';
        if (savedSegment === 'Moments') return entity.type === 'moment';
        return entity.type === 'property';
      });
  }, [residentEntities, savedIds, savedSegment]);

  const availablePerks = residentPerks.filter((perk) => !redeemedIds.has(perk.id));
  const usedPerks = residentPerks.filter((perk) => redeemedIds.has(perk.id));

  async function postAction(path: string, itemId: string, itemTitle: string) {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, itemTitle, mode: 'resident' }),
    });
    const data = await response.json();
    setMessage(data.message || 'Saved.');
  }

  async function handlePrimary(entity: SearchEntity) {
    const action = itemForEntity(entity);
    if (entity.type === 'venue') setRedeemedIds((current) => new Set(current).add(entity.id));
    if (entity.type === 'event') setRsvpIds((current) => new Set(current).add(entity.id));
    if (entity.type === 'property' || entity.type === 'moment') {
      setSavedIds((current) => new Set(current).add(entity.id));
    }
    await postAction(action.path, entity.id, action.title);
  }

  function toggleSaved(id: string) {
    setSavedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setMessage('Saved list updated.');
  }

  function togglePref(label: string) {
    setPrefSet((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function resetStation() {
    setStationStep('question');
    setSelectedChoice('');
    setTypedAnswer('');
  }

  const canSubmitStation =
    selectedStation.responseType === 'choice' ? Boolean(selectedChoice) : Boolean(typedAnswer.trim());

  function renderNowPage() {
    return (
      <>
        <section className="surface-hero">
          <div className="surface-eyebrow">Right now</div>
          <h1 className="surface-heading">The map is the front door.</h1>
          <p className="surface-subtitle">
            Nearby places, perks, events, and building context all sit in the same resident surface. Nothing is decorative. The map decides what matters next.
          </p>
          <div className="hero-meta-grid">
            <div className="metric-card">
              <div className="kicker">Perks live</div>
              <div className="metric-card__value">{residentPerks.length}</div>
              <p className="small">Card-ready offers with real walkable context.</p>
            </div>
            <div className="metric-card">
              <div className="kicker">Events tonight</div>
              <div className="metric-card__value">{residentEvents.length}</div>
              <p className="small">Programming that changes the route, not just the calendar.</p>
            </div>
            <div className="metric-card">
              <div className="kicker">Buildings</div>
              <div className="metric-card__value">{residentProperties.length}</div>
              <p className="small">Resident context anchored to downtown towers and blocks.</p>
            </div>
            <div className="metric-card">
              <div className="kicker">Tier</div>
              <div className="metric-card__value">{memberProfile.tier}</div>
              <p className="small">{memberProfile.points.toLocaleString()} points in the card layer.</p>
            </div>
          </div>
        </section>

        <section className="resident-toolbar">
          <div className="toolbar-row">
            <div className="kicker">Ask the map</div>
            <div className="chips">
              {residentAskPrompts.map((prompt) => (
                <button className="btn-chip" key={prompt} onClick={() => setQuery(prompt)} type="button">
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          <div className="toolbar-row">
            <input
              className="resident-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Coffee right now, quiet spot, rooftop dinner, yoga after work..."
              value={query}
            />
          </div>
          <div className="toolbar-row">
            {residentFilters.map((filter) => (
              <button
                className={`pill-button ${activeFilter === filter.key ? 'active' : ''}`}
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        {message ? <div className="notice-banner">{message}</div> : null}

        <section className="resident-map-layout">
          <article className="card map-panel">
            <DynamicMap entities={filteredEntities} onSelect={(entity) => setSelectedId(entity.id)} selected={selectedEntity} />
          </article>

          <div className="resident-results">
            {residentMoments.map((moment) => (
              <motion.article className="surface-card" key={moment.id} whileHover={{ y: -2 }}>
                <div className="stack">
                  <div className="list-card__title">
                    <div>
                      <div className="kicker">Right now</div>
                      <h3 className="feature-title">{moment.title}</h3>
                    </div>
                    <span className="meta-pill">{moment.freshness}</span>
                  </div>
                  <p className="section-copy">{moment.place} · {moment.offer}</p>
                </div>
              </motion.article>
            ))}

            {filteredEntities.slice(0, 4).map((entity, index) => {
              const action = itemForEntity(entity);
              const isSaved = savedIds.has(entity.id);
              return (
                <article
                  className={`result-card ${selectedEntity?.id === entity.id ? 'active' : ''}`}
                  key={entity.id}
                >
                  <div className="result-label">{index === 0 ? 'Best fit nearby' : 'Nearby option'}</div>
                  <h3>{entity.title}</h3>
                  <p>{entity.summary}</p>
                  <div className="result-meta">
                    {entity.signals.slice(0, 3).map((signal) => (
                      <span className="meta-pill" key={signal}>{signal}</span>
                    ))}
                  </div>
                  <div className="actions">
                    <button className="btn-ghost" onClick={() => setSelectedId(entity.id)} type="button">View on map</button>
                    <button className="btn" onClick={() => handlePrimary(entity)} type="button">{action.primary}</button>
                    <button className="btn-ghost" onClick={() => toggleSaved(entity.id)} type="button">
                      {isSaved ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </>
    );
  }

  function renderPerksPage() {
    return (
      <>
        <section className="surface-hero surface-hero--navy">
          <div className="surface-eyebrow">Your access</div>
          <h1 className="surface-heading">Perks Card</h1>
          <p className="surface-subtitle">
            The card is the resident identity layer. It unlocks nearby offers, gives partner staff a clean scan surface, and makes the map feel useful instead of merely visible.
          </p>
        </section>

        <div className="cards-2">
          <article className="member-card">
            <div className="member-card-top">
              <div>
                <div className="kicker">Member</div>
                <h3 className="feature-title">{memberProfile.name}</h3>
              </div>
              <div className="member-chip">{memberProfile.tier}</div>
            </div>
            <div className="member-id">{memberProfile.memberId}</div>
            <div className="member-meta">
              <span>{memberProfile.points.toLocaleString()} points</span>
              <span>{savedIds.size} saved items</span>
              <span>{memberProfile.district}</span>
            </div>
            <div className="qr-grid" aria-hidden="true">
              {Array.from({ length: 36 }).map((_, index) => (
                <span className={index % 2 === 0 || index % 5 === 0 || index % 7 === 0 ? 'on' : ''} key={index} />
              ))}
            </div>
          </article>

          <article className="surface-card">
            <div className="stack">
              <div className="kicker">Use the map</div>
              <h3 className="feature-title">Find perks near your building</h3>
              <p className="section-copy">The resident app ranks offers by timing, walkability, and whether the stop actually fits the moment.</p>
              <div className="actions">
                <Link className="btn" href="/resident-app">Open map</Link>
                <Link className="btn-ghost" href="/resident-app/card">View full card</Link>
              </div>
            </div>
          </article>
        </div>

        <section className="cards-2">
          <article className="surface-card">
            <div className="stack">
              <div className="kicker">Available</div>
              <h3 className="feature-title">{availablePerks.length} offers ready now</h3>
              <div className="data-list">
                {availablePerks.map((perk) => (
                  <div className="data-row" key={perk.id}>
                    <div>
                      <strong>{perk.venueName}</strong>
                      <p className="small">{perk.offer} · {perk.distance} · {perk.hours}</p>
                    </div>
                    <button className="btn" onClick={() => handlePrimary(searchEntities.find((entity) => entity.id === perk.id) as SearchEntity)} type="button">
                      Redeem
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="surface-card">
            <div className="stack">
              <div className="kicker">Used recently</div>
              <h3 className="feature-title">{usedPerks.length} redeemed</h3>
              <div className="data-list">
                {usedPerks.map((perk) => (
                  <div className="data-row" key={perk.id}>
                    <div>
                      <strong>{perk.venueName}</strong>
                      <p className="small">{perk.offer}</p>
                    </div>
                    <span className="meta-pill"><CheckCircle2 size={12} /> Redeemed</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </section>
      </>
    );
  }

  function renderCardPage() {
    return (
      <section className="grid-2">
        <article className="member-card">
          <div className="member-card-top">
            <div>
              <div className="kicker">Resident Card</div>
              <h3 className="feature-title">Downtown access</h3>
            </div>
            <div className="member-chip">{memberProfile.tier}</div>
          </div>
          <div className="member-id">{memberProfile.memberId}</div>
          <div className="member-meta">
            <span>{memberProfile.points.toLocaleString()} points</span>
            <span>{memberProfile.pointsToNext} to {memberProfile.nextTier}</span>
          </div>
          <div className="qr-grid" aria-hidden="true">
            {Array.from({ length: 36 }).map((_, index) => (
              <span className={index % 2 === 0 || index % 3 === 0 || index === 5 || index === 22 ? 'on' : ''} key={index} />
            ))}
          </div>
        </article>

        <div className="stack-lg">
          <TextLinkForm
            description="Send the resident app to a phone. With Twilio configured this is live SMS; without it the request still persists for handoff."
            source="resident-card"
            title="Text the resident app"
          />
          <article className="surface-card">
            <div className="stack">
              <div className="kicker">Recent activity</div>
              <h3 className="feature-title">What your card is doing</h3>
              <div className="data-list">
                {residentEvents.slice(0, 2).map((event) => (
                  <div className="data-row" key={event.id}>
                    <div>
                      <strong>{event.title}</strong>
                      <p className="small">{event.time}</p>
                    </div>
                    <span className="meta-pill">{rsvpIds.has(event.id) ? 'RSVP sent' : 'Suggested'}</span>
                  </div>
                ))}
                {residentPerks.slice(0, 2).map((perk) => (
                  <div className="data-row" key={perk.id}>
                    <div>
                      <strong>{perk.venueName}</strong>
                      <p className="small">{perk.offer}</p>
                    </div>
                    <span className="meta-pill">{redeemedIds.has(perk.id) ? 'Redeemed' : 'Available'}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>
    );
  }

  function renderEventsPage() {
    return (
      <section className="cards-2">
        {residentEvents.map((event) => (
          <article className="surface-card" key={event.id}>
            <div className="stack">
              <div className="list-card__title">
                <div>
                  <div className="kicker">Event</div>
                  <h3 className="feature-title">{event.title}</h3>
                </div>
                <span className="meta-pill">{event.attendance}</span>
              </div>
              <p className="meta-line">{event.time} · {event.venue} · {event.district}</p>
              <p className="section-copy">{event.description}</p>
              <div className="actions">
                <button className="btn" onClick={() => handlePrimary(searchEntities.find((entity) => entity.id === event.id) as SearchEntity)} type="button">
                  {rsvpIds.has(event.id) ? 'RSVP sent' : 'RSVP'}
                </button>
                <button className="btn-ghost" onClick={() => toggleSaved(event.id)} type="button">
                  {savedIds.has(event.id) ? 'Saved' : 'Save plan'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    );
  }

  function renderSavedPage() {
    return (
      <section className="stack-lg">
        <div className="pill-row">
          {savedSegments.map((segment) => (
            <button
              className={`pill-button ${savedSegment === segment ? 'active' : ''}`}
              key={segment}
              onClick={() => setSavedSegment(segment)}
              type="button"
            >
              {segment}
            </button>
          ))}
        </div>
        <article className="surface-card">
          <div className="stack">
            <div className="kicker">Saved plans</div>
            <h3 className="feature-title">{savedItems.length} items worth reopening</h3>
            {savedItems.length ? (
              <div className="data-list">
                {savedItems.map((item) => (
                  <div className="data-row" key={item.id}>
                    <div>
                      <strong>{item.title}</strong>
                      <p className="small">{item.detail}</p>
                    </div>
                    <button className="btn-ghost" onClick={() => toggleSaved(item.id)} type="button">Remove</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="section-copy">Saved places, events, moments, and buildings will show up here as residents build real downtown routes.</p>
            )}
          </div>
        </article>
      </section>
    );
  }

  function renderPropertiesPage() {
    return (
      <section className="cards-2">
        {residentProperties.map((property) => (
          <article className="surface-card" key={property.id}>
            <div className="stack">
              <div className="kicker">Building</div>
              <h3 className="feature-title">{property.name}</h3>
              <p className="meta-line">{property.address} · {property.priceBand}</p>
              <p className="section-copy">{property.summary}</p>
              <div className="result-meta">
                {property.signals.map((signal) => (
                  <span className="meta-pill" key={signal}>{signal}</span>
                ))}
              </div>
              <div className="surface-divider stack">
                <strong>Nearby anchors</strong>
                <p className="small">{property.nearby.join(' · ')}</p>
              </div>
              <div className="actions">
                <button className="btn-ghost" onClick={() => toggleSaved(property.id)} type="button">
                  {savedIds.has(property.id) ? 'Saved' : 'Save building'}
                </button>
                <Link className="btn" href="/resident-app">Open map</Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    );
  }

  function renderExplorePage() {
    return (
      <section className="stack-lg">
        <div className="resident-toolbar">
          <div className="toolbar-row">
            <input
              className="resident-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search perks, venues, moments, and event titles..."
              value={query}
            />
          </div>
          <div className="toolbar-row">
            {['Coffee', 'Food', 'Nightlife', 'Wellness', 'Arts'].map((label) => (
              <button
                className={`pill-button ${prefSet.has(label) ? 'active' : ''}`}
                key={label}
                onClick={() => togglePref(label)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="cards-2">
          {residentPerks
            .filter((perk) => !query.trim() || `${perk.venueName} ${perk.description}`.toLowerCase().includes(query.toLowerCase()))
            .map((perk) => (
              <article className="surface-card" key={perk.id}>
                <div className="stack">
                  <div className="list-card__title">
                    <div>
                      <div className="kicker">{perk.category}</div>
                      <h3 className="feature-title">{perk.venueName}</h3>
                    </div>
                    <span className="meta-pill"><Star size={12} /> {perk.rating}</span>
                  </div>
                  <p className="section-copy">{perk.description}</p>
                  <div className="result-meta">
                    <span className="meta-pill"><Footprints size={12} /> {perk.distance}</span>
                    <span className="meta-pill"><Clock3 size={12} /> {perk.hours}</span>
                  </div>
                  <div className="actions">
                    <button className="btn" onClick={() => handlePrimary(searchEntities.find((entity) => entity.id === perk.id) as SearchEntity)} type="button">Redeem</button>
                    <button className="btn-ghost" onClick={() => toggleSaved(perk.id)} type="button">
                      {savedIds.has(perk.id) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </section>
    );
  }

  function renderProfilePage() {
    return (
      <section className="stack-lg">
        <article className="surface-card">
          <div className="stack">
            <div className="list-card__title">
              <div>
                <div className="kicker">Account</div>
                <h3 className="feature-title">{memberProfile.name}</h3>
              </div>
              <span className="meta-pill">{memberProfile.tier}</span>
            </div>
            <p className="meta-line">{memberProfile.memberId} · {district}</p>
            <div className="cards-3">
              <div className="stat-card"><strong>{memberProfile.points.toLocaleString()}</strong><span className="small">Points</span></div>
              <div className="stat-card"><strong>{redeemedIds.size}</strong><span className="small">Redeemed</span></div>
              <div className="stat-card"><strong>{savedIds.size}</strong><span className="small">Saved</span></div>
            </div>
          </div>
        </article>

        <div className="cards-2">
          <article className="surface-card">
            <div className="stack">
              <div className="kicker">Home district</div>
              <h3 className="feature-title">{district}</h3>
              <select className="resident-select" onChange={(event) => setDistrict(event.target.value)} value={district}>
                {['Rainey Street', 'Congress Ave', 'Warehouse District', 'West Downtown', 'East Downtown'].map((label) => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
            </div>
          </article>

          <article className="surface-card">
            <div className="stack">
              <div className="kicker">Notifications</div>
              <h3 className="feature-title">{notificationsOn ? 'On' : 'Paused'}</h3>
              <p className="section-copy">Text-first nudges for events, perk windows, and live downtown moments.</p>
              <button className="btn-ghost" onClick={() => setNotificationsOn((current) => !current)} type="button">
                {notificationsOn ? 'Pause notifications' : 'Turn notifications back on'}
              </button>
            </div>
          </article>
        </div>

        <div className="cards-2">
          <article className="surface-card">
            <div className="stack">
              <div className="kicker">Preferences</div>
              <h3 className="feature-title">What should rise first?</h3>
              <div className="pill-row">
                {profilePrefs.map((label) => (
                  <button
                    className={`pill-button ${prefSet.has(label) ? 'active' : ''}`}
                    key={label}
                    onClick={() => togglePref(label)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </article>

          <article className="surface-card">
            <div className="stack">
              <div className="kicker">Privacy</div>
              <h3 className="feature-title">{privacy}</h3>
              <div className="data-list">
                {privacyModes.map((mode) => (
                  <button className={`pill-button ${privacy === mode ? 'active' : ''}`} key={mode} onClick={() => setPrivacy(mode)} type="button">
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>
    );
  }

  function renderStationPage() {
    return (
      <section className="grid-2">
        <article className="surface-card">
          {stationStep === 'question' ? (
            <div className="stack">
              <div className="kicker">Station {selectedStation.id}</div>
              <h3 className="feature-title">{selectedStation.name}</h3>
              <p className="section-copy">{selectedStation.location} · {selectedStation.question}</p>
              {selectedStation.responseType === 'choice' ? (
                <div className="data-list">
                  {selectedStation.choices?.map((choice) => (
                    <button
                      className={`pill-button ${selectedChoice === choice ? 'active' : ''}`}
                      key={choice}
                      onClick={() => setSelectedChoice(choice)}
                      type="button"
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  className="resident-textarea"
                  onChange={(event) => setTypedAnswer(event.target.value)}
                  placeholder="Type your answer..."
                  rows={4}
                  value={typedAnswer}
                />
              )}
              <button className="btn" disabled={!canSubmitStation} onClick={() => setStationStep('thanks')} type="button">
                Submit
              </button>
            </div>
          ) : (
            <div className="stack">
              <div className="kicker">Thanks</div>
              <h3 className="feature-title">{selectedStation.thankYou}</h3>
              <p className="section-copy">{selectedStation.cta}</p>
              <div className="actions">
                <Link className="btn" href={selectedStation.ctaHref}>{selectedStation.ctaButton}</Link>
                <button className="btn-ghost" onClick={resetStation} type="button">Restart station</button>
              </div>
            </div>
          )}
        </article>

        <article className="surface-card">
          <div className="stack">
            <div className="kicker">Why it exists</div>
            <h3 className="feature-title">The station is part of the product.</h3>
            <p className="section-copy">
              QR prompts are not a side gimmick. They create the feedback layer that tells partners what kind of moments, offers, and district behavior should be amplified next.
            </p>
            <div className="result-meta">
              <span className="meta-pill"><Sparkles size={12} /> Resident signal</span>
              <span className="meta-pill"><Heart size={12} /> Preference capture</span>
              <span className="meta-pill"><ArrowRight size={12} /> Feeds partner side</span>
            </div>
          </div>
        </article>
      </section>
    );
  }

  const headingMap: Record<ResidentPage, { eyebrow: string; title: string; body: string }> = {
    now: {
      eyebrow: 'Resident app',
      title: 'Now',
      body: 'Map-first discovery, live nearby logic, and immediate downtown decisions.',
    },
    perks: {
      eyebrow: 'Resident app',
      title: 'Perks Card',
      body: 'Membership identity, active offers, and a card staff can actually use.',
    },
    card: {
      eyebrow: 'Resident app',
      title: 'Card',
      body: 'The resident identity surface for access, points, and text-link entry.',
    },
    events: {
      eyebrow: 'Resident app',
      title: 'Events',
      body: 'Programming, attendance energy, and what is worth leaving the building for.',
    },
    saved: {
      eyebrow: 'Resident app',
      title: 'Saved',
      body: 'Plans, moments, places, and buildings worth reopening later.',
    },
    properties: {
      eyebrow: 'Resident app',
      title: 'Buildings',
      body: 'Property context and neighborhood value inside the same downtown layer.',
    },
    profile: {
      eyebrow: 'Resident app',
      title: 'Profile',
      body: 'District, preferences, privacy, and member state without unnecessary friction.',
    },
    explore: {
      eyebrow: 'Resident app',
      title: 'Explore',
      body: 'Search-first browsing for moments that are close enough to matter now.',
    },
    station: {
      eyebrow: 'Resident app',
      title: 'Station',
      body: 'QR prompts that connect the resident and partner sides of the ecosystem.',
    },
  };

  const header = headingMap[page];

  return (
    <main className="ecosystem-main">
      <div className="container stack-lg">
        <div className="resident-shell">
          <aside className="resident-sidebar sidebar-surface">
            <div className="stack">
              <div className="surface-eyebrow">Resident</div>
              <h2 className="feature-title">Downtown in one surface.</h2>
              <p className="small">Map, card, saved plans, building context, and stations all live here.</p>
            </div>
            <nav className="sidebar-nav" aria-label="Resident navigation">
              {desktopNav.map(({ href, icon: Icon, label }) => (
                <Link className={pathname === href ? 'nav-active' : ''} href={href} key={href}>
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="surface-divider stack">
              <div className="kicker">Member state</div>
              <p className="small">{memberProfile.points.toLocaleString()} points · {memberProfile.district}</p>
              <Link className="btn-ghost" href="/partner-dashboard">View partner side</Link>
            </div>
          </aside>

          <div className="resident-content">
            <section className="surface-card">
              <div className="stack">
                <div className="surface-eyebrow">{header.eyebrow}</div>
                <h1 className="surface-heading">{header.title}</h1>
                <p className="surface-subtitle">{header.body}</p>
              </div>
            </section>

            {page === 'now' && renderNowPage()}
            {page === 'perks' && renderPerksPage()}
            {page === 'card' && renderCardPage()}
            {page === 'events' && renderEventsPage()}
            {page === 'saved' && renderSavedPage()}
            {page === 'properties' && renderPropertiesPage()}
            {page === 'profile' && renderProfilePage()}
            {page === 'explore' && renderExplorePage()}
            {page === 'station' && renderStationPage()}
          </div>
        </div>

        <nav className="resident-mobile-nav" aria-label="Resident mobile navigation">
          {mobileNav.map(({ href, icon: Icon, label }) => (
            <Link className={pathname === href ? 'nav-active' : ''} href={href} key={href}>
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
