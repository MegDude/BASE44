import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  Coffee,
  CreditCard,
  Heart,
  Home,
  MapPin,
  Navigation,
  Search,
  Settings,
  Sparkles,
  Star,
  Ticket,
  User,
  X,
} from "lucide-react";

const PLACES = [
  {
    id: "stay-put",
    type: "place",
    title: "The Stay Put",
    category: "Drinks",
    description: "Easy Rainey drinks, casual food, and a resident-friendly patio loop.",
    address: "73 Rainey St",
    walkTime: "4 min",
    hasPerk: true,
    perkLabel: "Resident round",
    eventTime: "Open now",
    x: 68,
    y: 42,
  },
  {
    id: "bangers",
    type: "event",
    title: "Banger's Patio Night",
    category: "Event",
    description: "Live music, beer garden energy, and an easy RSVP from the map.",
    address: "79 Rainey St",
    walkTime: "5 min",
    hasPerk: true,
    perkLabel: "RSVP access",
    eventTime: "Tonight · 7:30 PM",
    x: 76,
    y: 34,
  },
  {
    id: "ma%C3%B1ana",
    type: "place",
    title: "Mañana Coffee",
    category: "Coffee",
    description: "A bright morning stop for coffee, meetings, and a quick lake-walk reset.",
    address: "1603 S Congress Ave",
    walkTime: "8 min",
    hasPerk: false,
    eventTime: "Open now",
    x: 32,
    y: 58,
  },
  {
    id: "waterline",
    type: "property",
    title: "The Waterline",
    category: "Building",
    description: "A downtown residential anchor with waterfront proximity and premium services.",
    address: "98 Red River St",
    walkTime: "3 min",
    hasPerk: false,
    eventTime: "Resident layer",
    x: 53,
    y: 27,
  },
  {
    id: "trail-mixer",
    type: "event",
    title: "Trail to Tacos Loop",
    category: "Social",
    description: "A casual neighbor meet-up that starts near the lake and ends with dinner.",
    address: "Lady Bird Lake Trail",
    walkTime: "6 min",
    hasPerk: true,
    perkLabel: "Card unlock",
    eventTime: "Tomorrow · 6:00 PM",
    x: 44,
    y: 72,
  },
];

const FILTERS = ["All", "Coffee", "Dining", "Events", "Perks", "5 min walk"];

const TAB_META = {
  map: { label: "Map", icon: MapPin, path: "/resident-app/map" },
  events: { label: "Events", icon: CalendarDays, path: "/resident-app/events" },
  card: { label: "Card", icon: CreditCard, path: "/resident-app/card" },
  saved: { label: "Saved", icon: Bookmark, path: "/resident-app/saved" },
  profile: { label: "Profile", icon: User, path: "/resident-app/profile" },
};

const TABS = Object.keys(TAB_META);

function getTabFromPath(pathname) {
  if (pathname.includes("/card")) return "card";
  if (pathname.includes("/events")) return "events";
  if (pathname.includes("/saved")) return "saved";
  if (pathname.includes("/profile") || pathname.includes("/you")) return "profile";
  return "map";
}

function useResidentState() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState("stay-put");
  const [savedIds, setSavedIds] = useState(new Set(["bangers"]));
  const [rsvpIds, setRsvpIds] = useState(new Set(["trail-mixer"]));

  const filteredItems = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return PLACES.filter((item) => {
      const matchesQuery = !lower || [item.title, item.category, item.description, item.address].join(" ").toLowerCase().includes(lower);
      const matchesFilter =
        filter === "All" ||
        (filter === "Perks" && item.hasPerk) ||
        (filter === "Events" && item.type === "event") ||
        (filter === "5 min walk" && Number.parseInt(item.walkTime, 10) <= 5) ||
        item.category === filter;
      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  return {
    query,
    setQuery,
    filter,
    setFilter,
    selectedId,
    setSelectedId,
    savedIds,
    rsvpIds,
    filteredItems,
    toggleSave(id) {
      setSavedIds((current) => {
        const next = new Set(current);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    },
    toggleRsvp(id) {
      setRsvpIds((current) => {
        const next = new Set(current);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    },
  };
}

function AppFrame({ children, activeTab }) {
  return (
    <main className="resident-v2-shell">
      <style>{styles}</style>
      <div className="resident-v2-phone">
        <header className="resident-v2-topbar">
          <Link to="/" className="resident-v2-back" aria-label="Back to Downtown Perks home">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p>Downtown Perks</p>
            <h1>{TAB_META[activeTab].label}</h1>
          </div>
          <Link to="/resident-app/card" className="resident-v2-card-mini" aria-label="Open resident perks card">
            <CreditCard size={17} />
          </Link>
        </header>
        <section className="resident-v2-content">{children}</section>
        <BottomNav activeTab={activeTab} />
      </div>
    </main>
  );
}

function BottomNav({ activeTab }) {
  return (
    <nav className="resident-v2-bottom-nav" aria-label="Resident app navigation">
      {TABS.map((tab) => {
        const meta = TAB_META[tab];
        const Icon = meta.icon;
        const isActive = activeTab === tab;
        return (
          <Link key={tab} to={meta.path} className={isActive ? "is-active" : ""} aria-current={isActive ? "page" : undefined}>
            <Icon size={18} />
            <span>{meta.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function MapView({ state }) {
  const selected = PLACES.find((item) => item.id === state.selectedId) || state.filteredItems[0] || PLACES[0];

  return (
    <>
      <section className="resident-v2-hero resident-v2-map-hero">
        <div>
          <p className="resident-v2-kicker">Live downtown layer</p>
          <h2>Find what is worth doing nearby.</h2>
          <p>Search places, events, perks, and resident essentials from one light, fast map.</p>
        </div>
      </section>

      <div className="resident-v2-search">
        <Search size={17} />
        <input
          value={state.query}
          onChange={(event) => state.setQuery(event.target.value)}
          placeholder="Search coffee, dinner, events, perks..."
        />
      </div>

      <div className="resident-v2-chips" aria-label="Resident map filters">
        {FILTERS.map((chip) => (
          <button key={chip} type="button" onClick={() => state.setFilter(chip)} className={state.filter === chip ? "is-active" : ""}>
            {chip}
          </button>
        ))}
      </div>

      <section className="resident-v2-map-card" aria-label="Downtown map preview">
        <div className="resident-v2-map-grid" />
        <div className="resident-v2-map-label"><Navigation size={14} /> 5 min walk</div>
        {PLACES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`resident-v2-pin resident-v2-pin-${item.type} ${state.selectedId === item.id ? "is-selected" : ""}`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            onClick={() => state.setSelectedId(item.id)}
            aria-label={`Open ${item.title}`}
          >
            {item.hasPerk ? <Star size={13} fill="currentColor" /> : <MapPin size={13} fill="currentColor" />}
          </button>
        ))}
      </section>

      <section className="resident-v2-panel resident-v2-results">
        <div className="resident-v2-section-head">
          <div>
            <p className="resident-v2-kicker">Nearby now</p>
            <h3>{state.filteredItems.length} useful options</h3>
          </div>
          <span>{state.filter}</span>
        </div>
        {state.filteredItems.length ? (
          state.filteredItems.map((item) => (
            <ResultRow key={item.id} item={item} state={state} />
          ))
        ) : (
          <EmptyState text="Nothing matched that search nearby. Try a broader category or open the full map." />
        )}
      </section>

      <DetailSheet item={selected} state={state} />
    </>
  );
}

function ResultRow({ item, state }) {
  const isSaved = state.savedIds.has(item.id);
  return (
    <button type="button" className="resident-v2-row" onClick={() => state.setSelectedId(item.id)}>
      <div className="resident-v2-row-icon">{item.type === "event" ? <CalendarDays size={17} /> : item.hasPerk ? <Ticket size={17} /> : <Coffee size={17} />}</div>
      <div>
        <strong>{item.title}</strong>
        <p>{item.category} · {item.walkTime} · {item.eventTime}</p>
      </div>
      {isSaved ? <Check className="resident-v2-row-check" size={18} /> : <ChevronRight size={18} />}
    </button>
  );
}

function DetailSheet({ item, state }) {
  const isSaved = state.savedIds.has(item.id);
  const isRsvped = state.rsvpIds.has(item.id);
  return (
    <aside className="resident-v2-detail-sheet" aria-label={`${item.title} details`}>
      <div className="resident-v2-grabber" />
      <div className="resident-v2-detail-top">
        <div>
          <p className="resident-v2-kicker">{item.category} · {item.walkTime}</p>
          <h3>{item.title}</h3>
        </div>
        <button type="button" aria-label="Close details"><X size={17} /></button>
      </div>
      <p>{item.description}</p>
      <div className="resident-v2-detail-meta">
        <span><MapPin size={14} /> {item.address}</span>
        {item.hasPerk && <span><Star size={14} /> {item.perkLabel}</span>}
      </div>
      <div className="resident-v2-actions">
        <button type="button" className="primary"><Navigation size={16} /> Get directions</button>
        <button type="button" onClick={() => state.toggleSave(item.id)}>{isSaved ? <Check size={16} /> : <Bookmark size={16} />} {isSaved ? "Saved" : "Save"}</button>
        {item.type === "event" ? (
          <button type="button" onClick={() => state.toggleRsvp(item.id)}>{isRsvped ? <Check size={16} /> : <CalendarDays size={16} />} {isRsvped ? "RSVP'd" : "RSVP"}</button>
        ) : item.hasPerk ? (
          <Link to="/resident-app/card"><CreditCard size={16} /> Redeem</Link>
        ) : null}
      </div>
    </aside>
  );
}

function CardView({ state }) {
  const activePerks = PLACES.filter((item) => item.hasPerk);
  return (
    <>
      <section className="resident-v2-pass">
        <div className="resident-v2-pass-top">
          <div>
            <p>Resident access</p>
            <h2>Your Downtown Perks Card</h2>
          </div>
          <Sparkles size={22} />
        </div>
        <p>Show this card at participating places to unlock resident offers, event access, and local perks.</p>
        <div className="resident-v2-qr" aria-label="Demo resident QR code">
          <div className="resident-v2-qr-grid" />
        </div>
        <div className="resident-v2-pass-foot">
          <span>Meg Dude</span>
          <span>Active resident</span>
        </div>
      </section>

      <section className="resident-v2-panel">
        <div className="resident-v2-section-head"><div><p className="resident-v2-kicker">How it works</p><h3>Three steps, no app-store drama.</h3></div></div>
        {["Open your card", "Show it at check-in or checkout", "Scan to activate the perk"].map((step, index) => (
          <div className="resident-v2-step" key={step}><span>{index + 1}</span><p>{step}</p></div>
        ))}
      </section>

      <section className="resident-v2-panel">
        <div className="resident-v2-section-head"><div><p className="resident-v2-kicker">Active perks</p><h3>Ready nearby</h3></div></div>
        {activePerks.map((item) => <ResultRow key={item.id} item={item} state={state} />)}
      </section>
    </>
  );
}

function EventsView({ state }) {
  const events = PLACES.filter((item) => item.type === "event");
  return (
    <>
      <section className="resident-v2-hero">
        <p className="resident-v2-kicker">Tonight and this week</p>
        <h2>Events you can actually use.</h2>
        <p>Browse what is nearby, save the good stuff, and RSVP without leaving the resident flow.</p>
      </section>
      {events.map((item, index) => (
        <article className="resident-v2-event" key={item.id}>
          <span>{index === 0 ? "Featured" : "This week"}</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <div>{item.address} · {item.walkTime} · {item.eventTime}</div>
          <div className="resident-v2-actions compact">
            <button type="button" className="primary" onClick={() => state.toggleRsvp(item.id)}>{state.rsvpIds.has(item.id) ? "RSVP'd" : "RSVP"}</button>
            <button type="button" onClick={() => state.toggleSave(item.id)}>{state.savedIds.has(item.id) ? "Saved" : "Save"}</button>
          </div>
        </article>
      ))}
    </>
  );
}

function SavedView({ state }) {
  const saved = PLACES.filter((item) => state.savedIds.has(item.id));
  return (
    <section className="resident-v2-panel resident-v2-full-panel">
      <div className="resident-v2-section-head"><div><p className="resident-v2-kicker">Saved</p><h3>Ready when you are downtown</h3></div></div>
      <div className="resident-v2-segments"><button className="is-active">All</button><button>Places</button><button>Events</button><button>Perks</button></div>
      {saved.length ? saved.map((item) => <ResultRow key={item.id} item={item} state={state} />) : <EmptyState text="Save places, perks, and events from the map so they are ready when you are downtown." />}
    </section>
  );
}

function ProfileView() {
  return (
    <>
      <section className="resident-v2-profile-card">
        <div className="resident-v2-avatar">MD</div>
        <h2>Meg Dude</h2>
        <p>The Shore · Rainey / Waterfront</p>
      </section>
      <section className="resident-v2-panel resident-v2-settings">
        {[
          [Heart, "Resident status", "Active downtown resident"],
          [Navigation, "Preferred radius", "5 minute walk"],
          [Settings, "Notifications", "Perks, RSVPs, and saved events"],
          [Home, "Help", "Contact Downtown Perks"],
        ].map(([Icon, title, detail]) => (
          <button key={title} type="button" className="resident-v2-row">
            <div className="resident-v2-row-icon"><Icon size={17} /></div>
            <div><strong>{title}</strong><p>{detail}</p></div>
            <ChevronRight size={18} />
          </button>
        ))}
      </section>
    </>
  );
}

function EmptyState({ text }) {
  return <div className="resident-v2-empty"><Sparkles size={18} /><p>{text}</p></div>;
}

export default function ResidentAppV2() {
  const location = useLocation();
  const activeTab = getTabFromPath(location.pathname);
  const state = useResidentState();

  return (
    <AppFrame activeTab={activeTab}>
      {activeTab === "map" && <MapView state={state} />}
      {activeTab === "card" && <CardView state={state} />}
      {activeTab === "events" && <EventsView state={state} />}
      {activeTab === "saved" && <SavedView state={state} />}
      {activeTab === "profile" && <ProfileView />}
    </AppFrame>
  );
}

const styles = `
.resident-v2-shell{min-height:100vh;background:radial-gradient(circle at top left,rgba(207,175,90,.15),transparent 30%),linear-gradient(135deg,#f7f8fb,#fbfcff);color:#071b2f;padding:20px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.resident-v2-phone{position:relative;min-height:calc(100vh - 40px);max-width:430px;margin:0 auto;overflow:hidden;border:1px solid rgba(7,27,47,.1);border-radius:32px;background:rgba(255,255,255,.9);box-shadow:0 24px 80px rgba(7,27,47,.14)}.resident-v2-topbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;background:rgba(251,252,255,.86);backdrop-filter:blur(18px);border-bottom:1px solid rgba(7,27,47,.08)}.resident-v2-topbar p,.resident-v2-kicker{margin:0;color:#64748b;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.13em}.resident-v2-topbar h1{margin:2px 0 0;font-size:18px;letter-spacing:-.04em}.resident-v2-back,.resident-v2-card-mini{display:grid;place-items:center;width:38px;height:38px;border-radius:14px;background:#fff;border:1px solid rgba(7,27,47,.1);color:#071b2f;text-decoration:none}.resident-v2-content{height:calc(100vh - 146px);min-height:640px;overflow:auto;padding:14px 14px 110px}.resident-v2-bottom-nav{position:absolute;left:12px;right:12px;bottom:12px;z-index:30;display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding:8px;border:1px solid rgba(7,27,47,.1);border-radius:24px;background:rgba(255,255,255,.92);backdrop-filter:blur(18px);box-shadow:0 18px 48px rgba(7,27,47,.12)}.resident-v2-bottom-nav a{display:flex;min-height:48px;align-items:center;justify-content:center;gap:4px;flex-direction:column;border-radius:16px;color:#64748b;text-decoration:none;font-size:10px;font-weight:750}.resident-v2-bottom-nav a.is-active{background:#071b2f;color:#fff}.resident-v2-bottom-nav a.is-active svg{color:#cfaf5a}.resident-v2-hero,.resident-v2-panel,.resident-v2-event,.resident-v2-profile-card{border:1px solid rgba(7,27,47,.09);border-radius:24px;background:#fff;box-shadow:0 10px 30px rgba(7,27,47,.06);padding:18px}.resident-v2-map-hero{background:linear-gradient(145deg,#fff,#f7f8fb)}.resident-v2-hero h2,.resident-v2-pass h2,.resident-v2-profile-card h2{margin:6px 0 8px;font-size:28px;line-height:.96;letter-spacing:-.065em}.resident-v2-hero p:not(.resident-v2-kicker),.resident-v2-pass p,.resident-v2-event p,.resident-v2-detail-sheet p{margin:0;color:#64748b;font-size:14px;line-height:1.45}.resident-v2-search{display:flex;align-items:center;gap:10px;margin:12px 0;padding:0 14px;height:48px;border-radius:16px;border:1px solid rgba(7,27,47,.1);background:#fff;box-shadow:0 8px 24px rgba(7,27,47,.05)}.resident-v2-search input{width:100%;border:0;outline:0;background:transparent;color:#142033;font-size:14px}.resident-v2-chips,.resident-v2-segments{display:flex;gap:8px;overflow:auto;padding:0 0 10px}.resident-v2-chips button,.resident-v2-segments button{white-space:nowrap;border:1px solid rgba(7,27,47,.1);border-radius:999px;background:#fff;color:#64748b;padding:10px 13px;font-weight:750;font-size:12px}.resident-v2-chips button.is-active,.resident-v2-segments button.is-active{background:#071b2f;color:#fff;border-color:#071b2f}.resident-v2-map-card{position:relative;height:280px;overflow:hidden;border-radius:28px;border:1px solid rgba(7,27,47,.1);background:linear-gradient(145deg,#e8eef5,#f8fafc);box-shadow:0 18px 48px rgba(7,27,47,.1)}.resident-v2-map-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(7,27,47,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(7,27,47,.07) 1px,transparent 1px);background-size:42px 42px}.resident-v2-map-card:before{content:"";position:absolute;left:-10%;top:48%;width:120%;height:46px;border-radius:999px;background:rgba(207,175,90,.24);transform:rotate(-18deg)}.resident-v2-map-card:after{content:"";position:absolute;left:18%;top:-10%;width:42px;height:120%;border-radius:999px;background:rgba(7,27,47,.1);transform:rotate(25deg)}.resident-v2-map-label{position:absolute;left:14px;top:14px;display:flex;gap:6px;align-items:center;border-radius:999px;background:rgba(255,255,255,.88);padding:8px 10px;font-size:11px;font-weight:800;color:#071b2f;box-shadow:0 10px 24px rgba(7,27,47,.08)}.resident-v2-pin{position:absolute;z-index:3;display:grid;place-items:center;width:34px;height:34px;margin:-17px;border:3px solid #fff;border-radius:999px;background:#071b2f;color:#fff;box-shadow:0 10px 24px rgba(7,27,47,.22);transition:.18s transform ease,.18s box-shadow ease}.resident-v2-pin-event,.resident-v2-pin-place:has(svg[fill="currentColor"]){background:#cfaf5a;color:#071b2f}.resident-v2-pin.is-selected{transform:scale(1.18);box-shadow:0 0 0 8px rgba(207,175,90,.2),0 14px 30px rgba(7,27,47,.24)}.resident-v2-results{margin-top:12px}.resident-v2-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}.resident-v2-section-head h3{margin:4px 0 0;font-size:18px;letter-spacing:-.04em}.resident-v2-section-head>span{border-radius:999px;background:rgba(207,175,90,.15);color:#9f7d2f;padding:7px 10px;font-size:11px;font-weight:850}.resident-v2-row{display:grid;width:100%;grid-template-columns:42px 1fr auto;gap:10px;align-items:center;text-align:left;border:0;border-top:1px solid rgba(7,27,47,.08);background:transparent;color:#071b2f;padding:12px 0;text-decoration:none}.resident-v2-row-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:14px;background:#f7f8fb;color:#071b2f}.resident-v2-row strong{display:block;font-size:14px}.resident-v2-row p{margin:3px 0 0;color:#64748b;font-size:12px}.resident-v2-row-check{color:#9f7d2f}.resident-v2-detail-sheet{position:sticky;bottom:0;z-index:10;margin:12px -2px 0;padding:10px 16px 16px;border:1px solid rgba(7,27,47,.1);border-radius:28px 28px 22px 22px;background:rgba(255,255,255,.96);box-shadow:0 -18px 50px rgba(7,27,47,.12);backdrop-filter:blur(18px)}.resident-v2-grabber{width:42px;height:4px;margin:0 auto 12px;border-radius:999px;background:rgba(7,27,47,.16)}.resident-v2-detail-top{display:flex;justify-content:space-between;gap:12px}.resident-v2-detail-top h3{margin:3px 0 6px;font-size:21px;letter-spacing:-.05em}.resident-v2-detail-top button{width:34px;height:34px;border:1px solid rgba(7,27,47,.1);border-radius:12px;background:#fff}.resident-v2-detail-meta{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.resident-v2-detail-meta span{display:flex;align-items:center;gap:5px;border-radius:999px;background:#f7f8fb;padding:7px 9px;color:#64748b;font-size:11px;font-weight:750}.resident-v2-actions{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:8px}.resident-v2-actions.compact{grid-template-columns:1fr 1fr;margin-top:14px}.resident-v2-actions button,.resident-v2-actions a{display:flex;align-items:center;justify-content:center;gap:6px;min-height:42px;border:1px solid rgba(7,27,47,.1);border-radius:14px;background:#fff;color:#071b2f;text-decoration:none;font-size:12px;font-weight:850}.resident-v2-actions .primary{border-color:#071b2f;background:#071b2f;color:#fff}.resident-v2-pass{padding:20px;border-radius:28px;background:#071b2f;color:#fff;box-shadow:0 20px 70px rgba(7,27,47,.2)}.resident-v2-pass-top{display:flex;justify-content:space-between}.resident-v2-pass-top p{color:rgba(255,255,255,.62);font-size:11px;text-transform:uppercase;letter-spacing:.14em}.resident-v2-pass>p{color:rgba(255,255,255,.72)}.resident-v2-qr{display:grid;place-items:center;margin:18px 0;padding:18px;border-radius:22px;background:#fff}.resident-v2-qr-grid{width:150px;height:150px;background:repeating-linear-gradient(45deg,#071b2f 0 8px,#fff 8px 16px);border:12px solid #fff;box-shadow:inset 0 0 0 10px #071b2f}.resident-v2-pass-foot{display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,.16);padding-top:14px;color:rgba(255,255,255,.82);font-size:12px;font-weight:800}.resident-v2-panel,.resident-v2-event,.resident-v2-profile-card{margin-top:12px}.resident-v2-step{display:flex;align-items:center;gap:10px;border-top:1px solid rgba(7,27,47,.08);padding:12px 0}.resident-v2-step span{display:grid;place-items:center;width:30px;height:30px;border-radius:999px;background:rgba(207,175,90,.16);color:#9f7d2f;font-weight:900}.resident-v2-step p{margin:0;font-size:14px;font-weight:750}.resident-v2-event span{display:inline-flex;border-radius:999px;background:rgba(207,175,90,.16);padding:7px 9px;color:#9f7d2f;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.13em}.resident-v2-event h3{margin:10px 0 6px;font-size:21px;letter-spacing:-.05em}.resident-v2-event div:not(.resident-v2-actions){margin-top:10px;color:#64748b;font-size:12px;font-weight:700}.resident-v2-full-panel{min-height:520px}.resident-v2-empty{display:flex;gap:10px;align-items:flex-start;border:1px dashed rgba(7,27,47,.16);border-radius:18px;background:#f7f8fb;padding:14px;color:#64748b}.resident-v2-empty p{margin:0;font-size:13px;line-height:1.45}.resident-v2-profile-card{text-align:center;background:linear-gradient(145deg,#fff,#f7f8fb)}.resident-v2-avatar{display:grid;place-items:center;width:74px;height:74px;margin:0 auto 12px;border-radius:26px;background:#071b2f;color:#cfaf5a;font-weight:950;letter-spacing:-.04em}.resident-v2-profile-card p{margin:0;color:#64748b}.resident-v2-settings{padding-top:8px}@media(max-width:520px){.resident-v2-shell{padding:0}.resident-v2-phone{min-height:100vh;border:0;border-radius:0}.resident-v2-content{height:calc(100vh - 74px);min-height:0}.resident-v2-hero h2,.resident-v2-pass h2{font-size:25px}.resident-v2-map-card{height:250px}.resident-v2-actions{grid-template-columns:1fr}.resident-v2-bottom-nav{position:fixed}}
`;
