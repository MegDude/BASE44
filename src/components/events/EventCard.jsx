import { Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  const { name, venue, time, type, distance, id } = event ?? {};

  return (
    <Link
      to="/events"
      state={{ eventId: id }}
      className="group flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-gold)]"
      style={{ backgroundColor: 'var(--dp-card)', borderColor: 'var(--dp-border)' }}
      aria-label={`${name} at ${venue}, ${time}`}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--dp-gold-soft)' }}>
        <Calendar className="h-5 w-5" style={{ color: 'var(--dp-gold)' }} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate mb-0.5" style={{ color: 'var(--dp-navy)' }}>{name}</p>
        <p className="text-xs" style={{ color: 'var(--dp-slate)' }}>
          {venue && <span>{venue} · </span>}
          {time && <span>{time}</span>}
          {distance && <span> · {distance}</span>}
        </p>
        {type && <span className="inline-block mt-1.5 text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--dp-bg)', color: 'var(--dp-slate)' }}>{type}</span>}
      </div>
      <ArrowRight className="h-4 w-4 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--dp-slate)' }} aria-hidden="true" />
    </Link>
  );
}
