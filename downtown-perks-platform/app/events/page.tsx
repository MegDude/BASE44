import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { residentEvents } from '@/lib/ecosystem-data';

export default function Page() {
  return (
    <main className="ecosystem-main">
      <section className="section">
        <div className="container stack-lg">
          <article className="surface-hero">
            <div className="surface-eyebrow">Events</div>
            <h1 className="surface-heading">What is worth leaving the building for.</h1>
            <p className="surface-subtitle">
              Events belong to the map logic. They change where residents go next, which venues convert, and what the partner dashboard can actually prove.
            </p>
          </article>
          <div className="cards-2">
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
                    <Link className="btn" href="/resident-app/events">Open resident events</Link>
                    <Link className="btn-ghost" href="/partner-dashboard">See event proof</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
