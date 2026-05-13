import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import EventCard from './EventCard';

const DEFAULT_EVENTS = [
  { id: 1, name: 'Live Jazz at Rainey Street', venue: 'Container Bar', time: '8 PM Tonight', type: 'Music', distance: '5 min' },
  { id: 2, name: 'Tequila Tuesday Happy Hour', venue: 'El Naranjo', time: '5–9 PM', type: 'Happy Hour', distance: '3 min' },
  { id: 3, name: 'Gallery Opening', venue: 'Blanton Museum', time: '7 PM', type: 'Arts', distance: '8 min' },
  { id: 4, name: 'Rooftop Yoga', venue: 'Seaholm District', time: '7 AM Tomorrow', type: 'Wellness', distance: '6 min' },
];

export default function EventRail({ events = DEFAULT_EVENTS, title = 'Happening Tonight', showAll = true }) {
  return (
    <section aria-labelledby="event-rail-heading">
      <div className="flex items-center justify-between mb-4">
        <h2 id="event-rail-heading" className="text-xl font-semibold tracking-tight" style={{ color: 'var(--dp-navy)' }}>{title}</h2>
        {showAll && (
          <Link to="/events" className="text-xs font-medium flex items-center gap-1 hover:underline focus:outline-none focus-visible:underline" style={{ color: 'var(--dp-slate)' }} aria-label="View all events">
            All events <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className="flex flex-col gap-3" role="list" aria-label={title}>
        {events.map(event => (
          <div key={event.id} role="listitem">
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </section>
  );
}
