import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, MapPin, MessageSquareText, Navigation, QrCode, Save, Search, Smartphone } from "lucide-react";
import {
  DAA_ART_PARKS_URL,
  DAA_STORYMAP_URL,
  DAA_TOUR_PRESENTED_BY,
  DAA_TOUR_STOP_COUNT,
  DAA_TOUR_TITLE,
  daaDashboardContent,
  daaExplorerQuestions,
  daaSaveBehaviorKeys,
  daaTourDistricts,
  daaTourProgress,
  daaTourStops,
  getDaaTourStopById,
} from "@/data/daaArtParksTour";

function CanvasSurface({ children, className = "" }) {
  return <section className={`dp-canvas-surface ${className}`.trim()}>{children}</section>;
}

function GlobalPageHeader() {
  return (
    <header className="dp-canvas-header">
      <Link to="/map?mode=resident&tab=map&filter=Civic" className="dp-canvas-back">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>
      <div className="min-w-0">
        <p>Downtown Perks Civic</p>
        <h1>Art & Parks Tour</h1>
      </div>
      <a href={DAA_STORYMAP_URL} target="_blank" rel="noreferrer" className="dp-canvas-action">
        Full Tour
      </a>
    </header>
  );
}

function ProgressCanvas() {
  const progress = Math.round((daaTourProgress.visited / daaTourProgress.total) * 100);
  return (
    <div className="dp-tour-progress">
      <div>
        <span>{daaTourProgress.total} Stops</span>
        <strong>{daaTourProgress.visited} Visited</strong>
      </div>
      <div className="dp-tour-progress-track" aria-label={`${progress}% complete`}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <dl>
        <div>
          <dt>Visited</dt>
          <dd>{daaTourProgress.visited}</dd>
        </div>
        <div>
          <dt>Saved</dt>
          <dd>{daaTourProgress.saved}</dd>
        </div>
        <div>
          <dt>Nearby</dt>
          <dd>{daaTourProgress.nearby}</dd>
        </div>
      </dl>
    </div>
  );
}

function VerificationMethods() {
  const methods = [
    [MapPin, "GPS"],
    [QrCode, "QR"],
    [Smartphone, "SMS"],
    [Check, "Manual"],
  ];

  return (
    <div className="dp-verification-strip" aria-label="Verification methods">
      <span>Verification Methods</span>
      <div>
        {methods.map(([Icon, label]) => (
          <button key={label} type="button">
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ActiveStop({ stop, onCheckIn }) {
  return (
    <CanvasSurface className="dp-active-stop">
      <div className="dp-canvas-label">Selected Stop</div>
      <div className="dp-active-stop-grid">
        <div>
          <h2>{stop.name}</h2>
          <p>{stop.daaIntro}</p>
          <dl className="dp-stop-facts">
            <div>
              <dt>Stop</dt>
              <dd>{String(stop.stopNumber).padStart(2, "0")} / {DAA_TOUR_STOP_COUNT}</dd>
            </div>
            <div>
              <dt>Area</dt>
              <dd>{stop.district}</dd>
            </div>
            <div>
              <dt>Radius</dt>
              <dd>{stop.checkInRadiusMeters}m</dd>
            </div>
          </dl>
        </div>
        <div className="dp-active-stop-actions">
          <Link to={`/map?mode=resident&tab=map&filter=Civic&entityId=${encodeURIComponent(stop.id)}`}>
            Open Stop
          </Link>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.address)}`} target="_blank" rel="noreferrer">
            Directions
          </a>
          <button type="button" onClick={onCheckIn}>
            Check In
          </button>
          <a href={DAA_ART_PARKS_URL} target="_blank" rel="noreferrer">
            DAA Tour
          </a>
        </div>
      </div>
    </CanvasSurface>
  );
}

function FeedbackCanvas() {
  return (
    <CanvasSurface className="dp-feedback-canvas">
      <div className="dp-canvas-label">Feedback</div>
      <h2>Tell DAA what you think.</h2>
      <p>
        Share one quick thought. Your feedback helps the Downtown Austin Alliance understand what people enjoy, what they want more of, and how downtown can continue to improve.
      </p>
      <div className="dp-feedback-grid">
        {daaExplorerQuestions.map((item) => (
          <label key={item.id}>
            <span>{item.question}</span>
            <select>
              <option>{item.optional ? "Optional" : "Select one"}</option>
              {item.options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <button type="button" className="dp-canvas-primary-action">
        <MessageSquareText className="h-4 w-4" />
        Check In & Share
      </button>
    </CanvasSurface>
  );
}

function StopsGrid({ stops, activeStopId, setActiveStopId }) {
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("All");
  const districts = ["All", ...daaTourDistricts];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredStops = stops.filter((stop) => {
    const matchesQuery = !normalizedQuery || `${stop.name} ${stop.district} ${stop.address}`.toLowerCase().includes(normalizedQuery);
    const matchesDistrict = district === "All" || stop.district === district;
    return matchesQuery && matchesDistrict;
  });

  return (
    <CanvasSurface className="dp-stops-canvas">
      <div className="dp-canvas-section-heading">
        <div>
          <div className="dp-canvas-label">Explore Stops</div>
          <h2>48 public art and cultural stops.</h2>
        </div>
        <span>{daaSaveBehaviorKeys.join(" · ")}</span>
      </div>

      <div className="dp-stop-tools">
        <label>
          <Search className="h-4 w-4" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stops" />
        </label>
        <select value={district} onChange={(event) => setDistrict(event.target.value)}>
          {districts.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="dp-stops-grid">
        {filteredStops.map((stop) => {
          const isActive = activeStopId === stop.id;
          return (
            <button
              key={stop.id}
              type="button"
              onClick={() => setActiveStopId(stop.id)}
              className={isActive ? "is-active" : ""}
            >
              <span>Stop {String(stop.stopNumber).padStart(2, "0")}</span>
              <strong>{stop.name}</strong>
              <em>{stop.district}</em>
              <small>
                <Save className="h-3.5 w-3.5" />
                <Navigation className="h-3.5 w-3.5" />
                <Check className="h-3.5 w-3.5" />
              </small>
            </button>
          );
        })}
      </div>
    </CanvasSurface>
  );
}

function InsightList({ title, items }) {
  return (
    <section className="dp-insight-section">
      <h3>{title}</h3>
      <div>
        {items.map((item) => {
          const label = Array.isArray(item) ? item[0] : item;
          const value = Array.isArray(item) ? item[1] : "";
          return (
            <p key={`${label}-${value}`}>
              <span>{label}</span>
              {value && <strong>{value}</strong>}
            </p>
          );
        })}
      </div>
    </section>
  );
}

function AnalyticsCanvas() {
  return (
    <CanvasSurface className="dp-analytics-canvas">
      <div className="dp-canvas-label">Insights</div>
      <h2>{daaDashboardContent.title}</h2>
      <InsightList title="Overview" items={daaDashboardContent.overview} />
      <InsightList title="What People Are Telling Us" items={daaDashboardContent.whatPeopleAreTellingUs} />
      <InsightList title="Popular Places" items={daaDashboardContent.placesPeopleUseMost} />
      <InsightList title="Popular Districts" items={daaDashboardContent.areasOfDowntown} />
      <InsightList title={daaDashboardContent.timeAnalysis.title} items={daaDashboardContent.timeAnalysis.buckets} />
    </CanvasSurface>
  );
}

export default function DaaExplorer() {
  const [searchParams] = useSearchParams();
  const initialStop = getDaaTourStopById(searchParams.get("stop")) || daaTourStops[0];
  const [activeStopId, setActiveStopId] = useState(initialStop.id);
  const [checkedIn, setCheckedIn] = useState(false);
  const activeStop = useMemo(() => getDaaTourStopById(activeStopId) || daaTourStops[0], [activeStopId]);

  return (
    <main className="dp-civic-canvas-page">
      <div className="dp-civic-canvas">
        <GlobalPageHeader />

        <CanvasSurface className="dp-civic-hero">
          <div>
            <div className="dp-canvas-label">Dedicated Civic Layer</div>
            <h1>{DAA_TOUR_TITLE}</h1>
            <p>{DAA_TOUR_PRESENTED_BY}. Explore 48 public art, park, mural, and landmark stops across downtown Austin.</p>
          </div>
          <ProgressCanvas />
        </CanvasSurface>

        <VerificationMethods />
        {checkedIn && <div className="dp-civic-toast">Check-in saved for {activeStop.name}.</div>}
        <ActiveStop stop={activeStop} onCheckIn={() => setCheckedIn(true)} />
        <FeedbackCanvas />
        <StopsGrid stops={daaTourStops} activeStopId={activeStopId} setActiveStopId={setActiveStopId} />
        <AnalyticsCanvas />
      </div>
    </main>
  );
}
