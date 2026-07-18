import { ArrowRight, Check, MapPin } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getMicrositeRecord } from "@/content/microsites/partnerMicrositeRegistry";

const EXPERIENCE_COPY = {
  property: ["A welcome guide shaped around the building", "Nearby places residents can save and revisit", "Useful events and services in one view"],
  operator: ["One pilot with a clear expansion path", "Consistent resident communication across properties", "Reporting that distinguishes attention from action"],
  hotel: ["Local dining and events for guests and neighbors", "A clearer route into public hotel experiences", "Useful local return visits beyond a room booking"],
  venue: ["Discovery by nearby residents", "Simple staff-ready offers and event visibility", "Directions, saves, and repeat-use signals"],
  brand: ["A useful local moment tied to place", "Participation through relevant venues and events", "Measured actions without inflated attribution"],
  civic: ["Trusted events and public information", "Routes into downtown culture and public space", "Resident participation with clear next steps"],
  media: ["Editorial recommendations people can act on", "Trackable routes into places and events", "A useful weekly neighborhood rhythm"],
  "real-estate": ["A clearer view of daily downtown life", "Local context for buyers and renters", "Property stories connected to real places"],
  individual: [],
};

export function PartnerMicrositeContent({ record, preview = false }) {
  const experiences = EXPERIENCE_COPY[record.type] || EXPERIENCE_COPY.operator;

  return (
    <main className="dp-microsite-page">
      {preview ? <div className="dp-microsite-review-banner">Internal preview · Not approved for public sharing</div> : null}
      <header className="dp-microsite-nav">
        <Link to="/network" className="dp-microsite-wordmark">Downtown Perks</Link>
        <Link to="/map?mode=resident&tab=map&filter=All">Open map</Link>
      </header>

      <section className="dp-microsite-hero">
        <p>{record.category}</p>
        <h1>{record.headline}</h1>
        <p>{record.summary}</p>
        <a href="/partners/sign-up" className="dp-microsite-primary-action">
          Discuss a pilot
          <ArrowRight aria-hidden="true" />
        </a>
      </section>

      <section className="dp-microsite-section" aria-labelledby="why-heading">
        <div>
          <p>Why this matters</p>
          <h2 id="why-heading">Make the next downtown decision easier.</h2>
        </div>
        <p>
          The page brings the relationship into a resident-first format: what people can find, why it is useful here,
          and what the partner can test before committing to a larger program.
        </p>
      </section>

      <section className="dp-microsite-section dp-microsite-experiences" aria-labelledby="experience-heading">
        <div>
          <p>Resident experience</p>
          <h2 id="experience-heading">What people could use.</h2>
        </div>
        <ul>
          {experiences.map((experience) => (
            <li key={experience}>
              <Check aria-hidden="true" />
              <span>{experience}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="dp-microsite-section" aria-labelledby="measure-heading">
        <div>
          <p>See what is working</p>
          <h2 id="measure-heading">Measure actions, not promises.</h2>
        </div>
        <p>
          A pilot can report profile opens, QR scans, saves, directions, event views, and repeat visits. Results are
          described as engagement signals unless stronger evidence is available.
        </p>
      </section>

      <section className="dp-microsite-next">
        <MapPin aria-hidden="true" />
        <div>
          <p>Next step</p>
          <h2>Choose one useful pilot.</h2>
          <p>Start with a defined audience, one resident moment, and a small set of measurable actions.</p>
        </div>
        <a href="/partners/sign-up">Discuss a pilot</a>
      </section>
    </main>
  );
}

export default function PartnerMicrositePage() {
  const { type, slug } = useParams();
  const record = getMicrositeRecord(type, slug);
  if (!record) return <Navigate to="/network" replace />;
  return <PartnerMicrositeContent record={record} />;
}
