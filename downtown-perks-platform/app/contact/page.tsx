import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { TextLinkForm } from '@/components/TextLinkForm';

export default function Page() {
  return (
    <main className="ecosystem-main">
      <section className="section">
        <div className="container grid-2">
          <article className="surface-hero">
            <div className="surface-eyebrow">Contact</div>
            <h1 className="surface-heading">Launch a resident, venue, hotel, or property pilot.</h1>
            <p className="surface-subtitle">
              The project is already wired for text links, checkout, admin gating, Stripe, and Twilio. The next step is choosing the partner lens and deployment environment, not reinventing the product.
            </p>
            <div className="actions">
              <Link className="btn" href="/partner-dashboard/about?type=properties">Property pilot</Link>
              <Link className="btn-ghost" href="/partner-dashboard/about?type=venues">Venue pilot</Link>
            </div>
          </article>

          <div className="stack-lg">
            <TextLinkForm
              description="Text the resident surface during demos, tours, hotel check-in, or venue onboarding. Live SMS works when Twilio is configured."
              source="contact"
              title="Text a pilot link"
            />
            <article className="surface-card">
              <div className="stack">
                <div className="kicker">Operational links</div>
                <h3 className="feature-title">Deployment-ready support routes</h3>
                <div className="actions">
                  <Link className="btn-ghost" href="/sign-in">Sign in</Link>
                  <Link className="btn-ghost" href="/admin">Admin</Link>
                  <Link className="btn-ghost" href="/search">Search surface</Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
