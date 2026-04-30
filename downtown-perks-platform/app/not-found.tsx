import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="ecosystem-main">
      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <article className="surface-hero surface-hero--navy">
            <div className="surface-eyebrow">Not found</div>
            <h1 className="surface-heading">This surface is not part of the downtown layer.</h1>
            <p className="surface-subtitle">
              The route is missing, but the resident app, partner dashboard, search surface, and station flow are all intact.
            </p>
            <div className="actions">
              <Link className="btn" href="/">Go home</Link>
              <Link className="btn-ghost" href="/resident-app">Open resident app</Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
