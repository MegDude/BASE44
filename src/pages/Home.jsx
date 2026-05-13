import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Compass, Calendar } from 'lucide-react';
import CTAButton from '@/components/ui/CTAButton';

const FILTER_PILLS = ['Venues', 'Events', 'Perks', '5 min walk', 'Open Now'];
const NEARBY_ITEMS = [
  { id: 1, name: 'Launderette', type: 'Dining', distance: '4 min', open: true },
  { id: 2, name: "Jo's Coffee", type: 'Coffee', distance: '2 min', open: true },
  { id: 3, name: "Whisler's", type: 'Nightlife', distance: '6 min', open: false },
  { id: 4, name: 'Equinox', type: 'Wellness', distance: '3 min', open: true },
];

const HAPPENING = [
  { id: 1, name: 'Live Jazz at Rainey Street', venue: 'Container Bar', time: '8 PM Tonight', type: 'Music' },
  { id: 2, name: 'Tequila Tuesday Happy Hour', venue: 'El Naranjo', time: '5–9 PM', type: 'Happy Hour' },
  { id: 3, name: 'Gallery Opening', venue: 'Blanton Museum', time: '7 PM', type: 'Arts' },
];

export default function Home() {
  const [activeFilter, setActiveFilter] = useState(null);

  return (
    <div style={{ backgroundColor: 'var(--dp-bg)', color: 'var(--dp-ink)', fontFamily: 'var(--dp-font-body)' }}>
      {/* HERO */}
      <section className="relative min-h-[calc(100svh-3.5rem)] flex flex-col justify-center overflow-hidden pt-14">
        <div
          className="absolute inset-0 z-0"
          aria-hidden="true"
          style={{ background: 'linear-gradient(160deg, #1a2d4a 0%, #111F3D 40%, #0f2240 100%)' }}
        >
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 60% 40%, rgba(207,175,90,0.06) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(100,148,237,0.08) 0%, transparent 50%)' }} />
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {[...Array(18)].map((_, i) => (
              <circle key={i} cx={`${(i * 37 + 15) % 100}%`} cy={`${(i * 53 + 25) % 100}%`} r="2" fill="rgba(207,175,90,0.6)" />
            ))}
          </svg>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40 z-10" style={{ background: 'linear-gradient(to bottom, transparent, var(--dp-bg))' }} aria-hidden="true" />

        <div className="relative z-20 fluid-container py-16 md:py-24">
          <div className="max-w-[680px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] mb-5" style={{ color: 'var(--dp-gold)' }}>
              Downtown Austin
            </p>

            <h1 className="fluid-hero-title font-display mb-5 text-white" style={{ fontFamily: 'var(--dp-font-display)' }}>
              Where downtown meets you
            </h1>

            <p className="text-[17px] leading-relaxed mb-8 max-w-[480px]" style={{ color: 'rgba(246,247,251,0.72)' }}>
              Everything nearby — in one map.
            </p>

            <div
              className="flex items-center gap-3 mb-6 w-full max-w-[520px]"
              style={{
                height: '44px',
                borderRadius: '28px',
                background: 'rgba(255,255,255,0.78)',
                backdropFilter: 'blur(18px)',
                border: '1px solid rgba(255,255,255,0.40)',
                boxShadow: '0 18px 60px rgba(17,31,61,0.08)',
                padding: '0 16px',
              }}
            >
              <Compass className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--dp-slate)' }} aria-hidden="true" />
              <input
                type="search"
                placeholder="Where should I go right now?"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--dp-navy)' }}
                aria-label="Search downtown"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none" role="group" aria-label="Quick filters">
              {FILTER_PILLS.map(pill => (
                <button
                  key={pill}
                  onClick={() => setActiveFilter(activeFilter === pill ? null : pill)}
                  className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-gold)]"
                  style={{
                    backgroundColor: activeFilter === pill ? 'var(--dp-gold)' : 'rgba(255,255,255,0.15)',
                    color: activeFilter === pill ? 'var(--dp-navy)' : 'rgba(255,255,255,0.85)',
                    border: '1px solid',
                    borderColor: activeFilter === pill ? 'var(--dp-gold)' : 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(8px)',
                  }}
                  aria-pressed={activeFilter === pill}
                >
                  {pill}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <CTAButton ctaId="openMap" />
              <CTAButton ctaId="getCard" variant="inverted" />
            </div>
          </div>
        </div>
      </section>

      {/* NEARBY NOW */}
      <section className="fluid-container py-14" aria-labelledby="nearby-heading">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-1" style={{ color: 'var(--dp-slate)' }}>Right now</p>
            <h2 id="nearby-heading" className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--dp-navy)' }}>Nearby Now</h2>
          </div>
          <Link to="/map" className="text-xs font-medium flex items-center gap-1 hover:underline focus:outline-none focus-visible:underline" style={{ color: 'var(--dp-slate)' }} aria-label="See all nearby on map">
            See map <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="fluid-grid-2 sm:grid-cols-4">
          {NEARBY_ITEMS.map(item => (
            <Link key={item.id} to="/map" className="group p-4 rounded-xl border transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-gold)]" style={{ backgroundColor: 'var(--dp-card)', borderColor: 'var(--dp-border)' }} aria-label={`${item.name}, ${item.type}, ${item.distance}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--dp-bg)' }}>
                  <MapPin className="h-4 w-4" style={{ color: 'var(--dp-navy)' }} aria-hidden="true" />
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: item.open ? 'rgba(52,199,89,0.1)' : 'rgba(110,118,138,0.1)', color: item.open ? '#16a34a' : 'var(--dp-slate)' }}>
                  {item.open ? 'Open' : 'Closed'}
                </span>
              </div>
              <p className="text-sm font-semibold mb-0.5 group-hover:text-[var(--dp-navy)]" style={{ color: 'var(--dp-ink)' }}>{item.name}</p>
              <p className="text-xs" style={{ color: 'var(--dp-slate)' }}>{item.type} · {item.distance}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* HAPPENING TONIGHT */}
      <section className="py-14" style={{ backgroundColor: 'var(--dp-bg-soft)' }} aria-labelledby="tonight-heading">
        <div className="fluid-container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-1" style={{ color: 'var(--dp-slate)' }}>Tonight</p>
              <h2 id="tonight-heading" className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--dp-navy)' }}>Happening Tonight</h2>
            </div>
            <Link to="/events" className="text-xs font-medium flex items-center gap-1 hover:underline focus:outline-none focus-visible:underline" style={{ color: 'var(--dp-slate)' }} aria-label="View all events">
              All events <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {HAPPENING.map(event => (
              <Link key={event.id} to="/events" className="group flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-gold)]" style={{ backgroundColor: 'var(--dp-card)', borderColor: 'var(--dp-border)' }} aria-label={`${event.name} at ${event.venue}, ${event.time}`}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--dp-gold-soft)' }}>
                  <Calendar className="h-5 w-5" style={{ color: 'var(--dp-gold)' }} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--dp-navy)' }}>{event.name}</p>
                  <p className="text-xs" style={{ color: 'var(--dp-slate)' }}>{event.venue} · {event.time}</p>
                </div>
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--dp-bg)', color: 'var(--dp-slate)' }}>{event.type}</span>
                <ArrowRight className="h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--dp-slate)' }} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PERKS CARD SECTION */}
      <section className="fluid-container py-14" aria-labelledby="card-heading">
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--dp-navy)' }}>
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-3" style={{ color: 'var(--dp-gold)' }}>Resident Access</p>
              <h2 id="card-heading" className="text-2xl md:text-3xl font-semibold tracking-tight mb-3 text-white">Your downtown access layer.</h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(246,247,251,0.65)' }}>
                Show your card at participating places to unlock resident perks.
              </p>
              <div className="flex gap-3">
                <CTAButton ctaId="getCard" variant="gold" />
                <CTAButton ctaId="openMap" variant="ghost" className="!text-white/80 hover:!bg-white/10" />
              </div>
            </div>
            <div className="w-full md:w-64 h-40 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} aria-hidden="true">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: 'rgba(207,175,90,0.15)' }}>
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ color: 'var(--dp-gold)' }}><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>
                </div>
                <p className="text-xs font-medium text-white/60">Downtown Perks Card</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
