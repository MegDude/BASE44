import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { partnerLenses, rentalBuildingSignals, stationAnalytics } from '@/lib/ecosystem-data';

export default function Page() {
  return (
    <main className="ecosystem-main">
      <section className="section">
        <div className="container stack-lg">
          <article className="surface-hero">
            <div className="surface-eyebrow">About the platform</div>
            <h1 className="surface-heading">Downtown Perks turns neighborhood behavior into a usable product.</h1>
            <p className="surface-subtitle">
              Residents get a calm, map-first downtown app. Partners get a proof layer that shows what visibility turned into. Stations and text links connect the two without turning the product into a maze.
            </p>
          </article>

          <div className="cards-2">
            <article className="surface-card">
              <div className="stack">
                <div className="kicker">Partner types</div>
                <h3 className="feature-title">Different lenses. Same ecosystem.</h3>
                <div className="data-list">
                  {Object.values(partnerLenses).map((lens) => (
                    <div className="data-row" key={lens.label}>
                      <div>
                        <strong>{lens.label}</strong>
                        <p className="small">{lens.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="surface-card">
              <div className="stack">
                <div className="kicker">Tracked buildings</div>
                <h3 className="feature-title">Property anchors already in the layer.</h3>
                <div className="data-list">
                  {rentalBuildingSignals.slice(0, 4).map((building) => (
                    <div className="data-row" key={building.name}>
                      <div>
                        <strong>{building.name}</strong>
                        <p className="small">{building.district} · ${building.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </div>

          <article className="surface-card">
            <div className="stack">
              <div className="kicker">Station layer</div>
              <h3 className="feature-title">QR prompts that feed real product decisions.</h3>
              <div className="cards-2">
                {stationAnalytics.map((station) => (
                  <article className="surface-card" key={station.id}>
                    <div className="stack">
                      <div className="kicker">Station {station.id}</div>
                      <h3 className="feature-title">{station.name}</h3>
                      <p className="section-copy">{station.insight}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="actions">
                <Link className="btn" href="/partner-dashboard/explorer">Open integrations</Link>
                <Link className="btn-ghost" href="/station?station=1">Preview station</Link>
              </div>
            </div>
          </article>
        </div>
      </section>
      <Footer />
    </main>
  );
}
