import { useEffect, useState } from "react";
import { ArrowRight, Bookmark, ChevronRight, CreditCard, LogIn, MapPin, Search, UserRound } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { ResidentMobileTabBar } from "@/components/resident/ResidentMobileTabBar";

const SAVED_ITEMS_KEY = "downtown-perks-card-items";
const RESIDENT_ACCESS_KEY = "dp_resident_access:current";

const nearbyCategories = [
  ["Coffee", "Coffee"],
  ["Dinner", "Dining"],
  ["Cocktails", "Drinks"],
  ["Events", "Events"],
  ["Happy Hour", "Happy Hour"],
  ["Fitness", "Fitness"],
  ["Weekend", "This Week"],
] as const;

type HomePanel = "home" | "perks" | "card";
type ResidentRecord = {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  buildingName?: string;
  unitNumber?: string;
  verificationStatus?: string;
};

function readSavedIds() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const value = JSON.parse(window.localStorage.getItem(SAVED_ITEMS_KEY) || "[]");
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}

function readResidentRecord(): ResidentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(RESIDENT_ACCESS_KEY) || "null");
  } catch {
    return null;
  }
}

function readableSavedName(id: string) {
  return id
    .replace(/^(place|perk|venue|event|entity)-/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function residentCardCode(record: ResidentRecord | null) {
  const source = record?.id || record?.email || record?.fullName || "resident";
  const clean = String(source).replace(/[^a-z0-9]/gi, "").slice(-10).toUpperCase();
  return `DP-${clean || "RESIDENT"}`;
}

export default function ResidentHome() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPanel = searchParams.get("panel");
  const panel: HomePanel = requestedPanel === "perks" || requestedPanel === "card" ? requestedPanel : "home";
  const [savedIds, setSavedIds] = useState<string[]>(readSavedIds);
  const [resident, setResident] = useState<ResidentRecord | null>(readResidentRecord);

  useEffect(() => {
    function syncResidentState() {
      setSavedIds(readSavedIds());
      setResident(readResidentRecord());
    }
    window.addEventListener("storage", syncResidentState);
    window.addEventListener("focus", syncResidentState);
    return () => {
      window.removeEventListener("storage", syncResidentState);
      window.removeEventListener("focus", syncResidentState);
    };
  }, []);

  const savedPerks = savedIds.map((id) => ({ id, name: readableSavedName(id) }));

  function openPanel(nextPanel: HomePanel) {
    const next = new URLSearchParams(searchParams);
    if (nextPanel === "home") next.delete("panel");
    else next.set("panel", nextPanel);
    setSearchParams(next, { replace: true });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function handleTabChange(tabId: string) {
    if (tabId === "home" || tabId === "perks" || tabId === "card") openPanel(tabId);
  }

  const activeTab = panel === "perks" ? "perks" : panel === "card" ? "card" : "home";

  return (
    <main className="dp-resident-home" data-panel={panel}>
      <header className="dp-resident-home__header">
        <div>
          <p>{panel === "home" ? "Good afternoon" : "Downtown Perks"}</p>
          <h1>{panel === "home" ? "Downtown Austin" : panel === "perks" ? "Saved perks" : "Your card"}</h1>
        </div>
        {panel === "home" ? (
          <Link to="/map?mode=resident&tab=map&filter=All" aria-label="Search nearby"><Search aria-hidden="true" /></Link>
        ) : (
          <button type="button" onClick={() => openPanel("home")} aria-label="Return to resident home">Done</button>
        )}
      </header>

      {panel === "home" ? (
        <div className="dp-resident-home__panel" role="tabpanel" aria-label="Resident home">
          <Link className="dp-resident-search-entry" to="/map?mode=resident&tab=map&filter=All&console=expanded">
            <Search aria-hidden="true" /><span>Ask the Map</span><small>Walkable dinner tonight</small>
          </Link>

          <section className="dp-resident-home__section" aria-labelledby="recommended-today">
            <div className="dp-resident-section-title"><div><p>Recommended today</p><h2 id="recommended-today">One good plan nearby.</h2></div></div>
            <Link className="dp-resident-hero-card" to="/map?mode=resident&tab=events&filter=Events&query=live%20music">
              <img src="/images/map-entities/perks/moody_theater_live_music_1779052684229.png" alt="Live music performance in downtown Austin" />
              <div><span>Tonight</span><h3>Live music downtown</h3><p>Find a nearby show and the best walkable stops around it.</p><strong>Explore events <ArrowRight aria-hidden="true" /></strong></div>
            </Link>
          </section>

          <section className="dp-resident-home__section" aria-labelledby="nearby-categories">
            <div className="dp-resident-section-title"><h2 id="nearby-categories">What sounds good?</h2></div>
            <div className="dp-resident-category-rail" aria-label="Nearby categories">
              {nearbyCategories.map(([label, filter]) => <Link key={label} to={`/map?mode=resident&tab=map&filter=${encodeURIComponent(filter)}`}>{label}</Link>)}
            </div>
          </section>

          <section className="dp-resident-home__section dp-resident-home__saved-preview" aria-labelledby="home-saved-title">
            <div className="dp-resident-section-title">
              <h2 id="home-saved-title">Saved</h2>
              <button type="button" onClick={() => openPanel("perks")}>{savedPerks.length ? "View all" : "Browse"}</button>
            </div>
            {savedPerks.length ? (
              <div className="dp-resident-home__saved-rows">
                {savedPerks.slice(0, 3).map((item) => (
                  <button key={item.id} type="button" onClick={() => openPanel("perks")}>
                    <Bookmark aria-hidden="true" />
                    <span><strong>{item.name}</strong><small>Saved perk</small></span>
                    <ChevronRight aria-hidden="true" />
                  </button>
                ))}
              </div>
            ) : (
              <button className="dp-resident-home__saved-empty" type="button" onClick={() => openPanel("perks")}>
                <span><strong>Nothing saved yet</strong><small>Save a perk from the map and it will appear here.</small></span>
                <ChevronRight aria-hidden="true" />
              </button>
            )}
          </section>

          <section className="dp-resident-home__section dp-resident-home__continue" aria-labelledby="continue-exploring">
            <div className="dp-resident-section-title"><h2 id="continue-exploring">Continue exploring</h2></div>
            <div>
              <Link to="/map?mode=resident&tab=map&filter=All"><MapPin aria-hidden="true" /><span><strong>Nearby districts</strong><small>Rainey, Seaholm, Congress and Waterloo</small></span><ChevronRight aria-hidden="true" /></Link>
              <Link to="/map?mode=resident&tab=map&filter=Trending"><span><strong>Popular today</strong><small>Dining, events and walkable plans</small></span><ChevronRight aria-hidden="true" /></Link>
              <button type="button" onClick={() => openPanel("perks")}><Bookmark aria-hidden="true" /><span><strong>Saved perks</strong><small>{savedPerks.length ? `${savedPerks.length} saved for later` : "Keep useful offers close"}</small></span><ChevronRight aria-hidden="true" /></button>
              <button type="button" onClick={() => openPanel("card")}><CreditCard aria-hidden="true" /><span><strong>Card and profile</strong><small>{resident?.fullName || "View resident access"}</small></span><ChevronRight aria-hidden="true" /></button>
            </div>
          </section>
        </div>
      ) : null}

      {panel === "perks" ? (
        <section className="dp-resident-home__panel dp-resident-saved-panel" role="tabpanel" aria-labelledby="saved-perks-title">
          <header className="dp-resident-panel-intro">
            <p>Saved for later</p>
            <h2 id="saved-perks-title">Your perks in one place.</h2>
            <span>Open a saved perk on the map when you are ready to use it.</span>
          </header>
          {savedPerks.length ? (
            <div className="dp-resident-saved-list">
              {savedPerks.map((item) => (
                <article key={item.id}>
                  <div><small>Saved perk</small><h3>{item.name}</h3><p>Ready when you want directions, details, or redemption information.</p></div>
                  <Link to={`/map?mode=resident&tab=perks&filter=Saved&entityId=${encodeURIComponent(item.id)}`} aria-label={`Open ${item.name} on the map`}><ChevronRight aria-hidden="true" /></Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="dp-resident-empty-state">
              <Bookmark aria-hidden="true" />
              <h3>No saved perks yet.</h3>
              <p>Save an offer from the map and it will appear here automatically.</p>
              <Link to="/map?mode=resident&tab=perks&filter=Perks">Browse nearby perks</Link>
            </div>
          )}
        </section>
      ) : null}

      {panel === "card" ? (
        <section className="dp-resident-home__panel dp-resident-card-panel" role="tabpanel" aria-labelledby="resident-card-title">
          <header className="dp-resident-panel-intro">
            <p>Resident access</p>
            <h2 id="resident-card-title">{resident ? "Ready when you need it." : "Sign in to your card."}</h2>
            <span>{resident ? "Your card and account details stay together here." : "Access saved perks, your resident card, and building benefits."}</span>
          </header>

          {resident ? (
            <>
              <section className="dp-resident-home-card" aria-label="Downtown Perks resident card">
                <div><span>Downtown Perks</span><small>{resident.verificationStatus === "verified" ? "Verified resident" : "Resident member"}</small></div>
                <CreditCard aria-hidden="true" />
                <strong>{resident.fullName || "Resident"}</strong>
                <code>{residentCardCode(resident)}</code>
              </section>
              <section className="dp-resident-profile-section" aria-labelledby="resident-profile-title">
                <div className="dp-resident-section-title"><h2 id="resident-profile-title">Profile</h2></div>
                <dl>
                  <div><dt>Name</dt><dd>{resident.fullName || "Not added"}</dd></div>
                  <div><dt>Email</dt><dd>{resident.email || "Not added"}</dd></div>
                  <div><dt>Home property</dt><dd>{resident.buildingName || "Not connected"}</dd></div>
                  {resident.unitNumber ? <div><dt>Unit</dt><dd>{resident.unitNumber}</dd></div> : null}
                  {resident.phone ? <div><dt>Phone</dt><dd>{resident.phone}</dd></div> : null}
                </dl>
                <div className="dp-resident-profile-actions">
                  <Link to={`/map?mode=resident&tab=card&filter=Perks&residentId=${encodeURIComponent(resident.id || "")}`}>Show card on map</Link>
                  <Link to="/card">Manage access</Link>
                </div>
              </section>
            </>
          ) : (
            <div className="dp-resident-empty-state">
              <UserRound aria-hidden="true" />
              <h3>Your resident profile lives here.</h3>
              <p>Sign in if you already have access, or create a card to connect your home property.</p>
              <div><Link to="/sign-in?returnTo=/resident/home?panel=card"><LogIn aria-hidden="true" />Sign in</Link><Link to="/card">Get a card</Link></div>
            </div>
          )}
        </section>
      ) : null}

      <ResidentMobileTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </main>
  );
}
