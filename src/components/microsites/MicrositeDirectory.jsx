import { Link } from "react-router-dom";
import { PUBLIC_PARTNER_MICROSITES } from "@/content/microsites/partnerMicrositeRegistry";

export default function MicrositeDirectory() {
  return (
    <main className="dp-microsite-directory">
      <header>
        <Link to="/map?mode=resident&tab=map&filter=All">Downtown Perks</Link>
        <p>Partner directory</p>
        <h1>Places and partners connected to downtown life.</h1>
        <p>Only reviewed partner pages appear here. Draft outreach records and private relationship notes are never published.</p>
      </header>

      {PUBLIC_PARTNER_MICROSITES.length ? (
        <section aria-label="Approved partners">
          {PUBLIC_PARTNER_MICROSITES.map((record) => (
            <Link key={record.id} to={record.route}>
              <span>{record.category}</span>
              <strong>{record.name}</strong>
              <p>{record.summary}</p>
            </Link>
          ))}
        </section>
      ) : (
        <section className="dp-microsite-empty">
          <h2>Partner pages are being reviewed.</h2>
          <p>The source inventory is complete, but no draft has received explicit public approval yet.</p>
          <Link to="/map?mode=resident&tab=map&filter=All">Open the downtown map</Link>
        </section>
      )}
    </main>
  );
}
