import { useEffect, useState } from "react";
import { ArrowRight, Bookmark, Building2, CalendarDays, ChevronRight, CreditCard, Landmark, LogIn, QrCode, Route, Search, UserRound } from "lucide-react";
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

const residentEvents = [
  { title: "Live music downtown", detail: "Tonight · Rainey and the Red River district", href: "/map?mode=resident&tab=events&filter=Events&query=live%20music&intent=events" },
  { title: "Waterloo events", detail: "Park programs, performances and community events", href: "/map?mode=resident&tab=events&filter=Events&collection=waterloo-greenway&query=Waterloo%20events" },
  { title: "Weekend downtown", detail: "Events, markets and plans worth walking to", href: "/map?mode=resident&tab=events&filter=Events&query=weekend%20events&intent=events" },
] as const;

const residentRoutes = [
  { title: "Warehouse Happy Hour Walk", detail: "Four walkable drinks and dining stops", meta: "18 min · 0.8 mi", href: "/map?mode=resident&tab=map&filter=Happy%20Hour&collection=warehouse-district-happy-hour&query=walking%20happy%20hour%20route&intent=happy_hour" },
  { title: "DAA Art & Parks Walk", detail: "Public art, parks, plazas and cultural landmarks", meta: "Self-guided", href: "/map?mode=resident&tab=map&filter=Civic&collection=daa-art-walk&query=DAA%20Art%20Walk&intent=DAA_art_walk" },
  { title: "Waterloo Greenway Walk", detail: "Parks, gardens, Waller Creek and events", meta: "Self-guided", href: "/map?mode=resident&tab=map&filter=Civic&collection=waterloo-greenway&query=Waterloo%20Greenway%20walk&intent=explore_downtown" },
  { title: "Downtown Stories Walk", detail: "Public spaces, history and neighborhood stories", meta: "25 min · 1.1 mi", href: "/map?mode=resident&tab=map&filter=Civic&collection=downtown-stories-walk&query=downtown%20stories%20walk&intent=explore_downtown" },
  { title: "Coffee Before Work", detail: "A short morning route through downtown", meta: "14 min · 0.6 mi", href: "/map?mode=resident&tab=map&filter=Coffee&collection=coffee-before-work&query=coffee%20before%20work&intent=coffee" },
  { title: "Hotel Guest Arrival Route", detail: "Hotel Van Zandt to food, music and the river", meta: "16 min · 0.7 mi", href: "/map?mode=resident&tab=map&filter=Hotels&collection=hotel-guest-arrival-route&query=hotel%20guest%20arrival%20route" },
] as const;

const experienceCollections = [
  { title: "Best sushi downtown", detail: "Sushi, sake and resident happy hours", href: "/map?mode=resident&tab=map&filter=Dining&query=Best%20sushi%20downtown&intent=dining" },
  { title: "Date night", detail: "Dinner, cocktails, music and waterfront stops", href: "/map?mode=resident&tab=map&filter=Dining&collection=date-night&query=Dinner%20for%20a%20date%20night&intent=dinner" },
  { title: "First date", detail: "Low-pressure coffee, drinks and easy walks", href: "/map?mode=resident&tab=map&filter=All&query=first%20date%20downtown&intent=dining" },
  { title: "Meet new friends", detail: "Social events, group activities and casual places", href: "/map?mode=resident&tab=events&filter=Events&query=events%20to%20meet%20new%20friends&intent=events" },
  { title: "Campaigns and pop-ups", detail: "Limited-time brand and partner experiences", href: "/map?mode=resident&tab=map&filter=Campaigns&query=campaigns%20pop-ups%20and%20brand%20activations" },
  { title: "Shared amenities", detail: "One participating building at a time", href: "/map?mode=resident&tab=map&filter=Properties&query=shared%20amenities%20resident%20access&intent=explore_downtown" },
] as const;

const dashboardTiles = [
  { title: "Today's plan", value: "Dinner → music", detail: "18 min walk", href: "/map?mode=resident&tab=map&filter=Dining&intent=dinner&query=dinner%20then%20live%20music" },
  { title: "Nearby", value: "5 offers", detail: "8 events tonight", href: "/map?mode=resident&tab=map&filter=All" },
  { title: "Saved", value: "Your list", detail: "Updates appear here", panel: "perks" },
  { title: "Events", value: "Tonight", detail: "3 nearby", href: "/map?mode=resident&tab=events&filter=Events" },
] as const;

const liveActivity = [
  { place: "Hotel Van Zandt", action: "Happy hour", status: "Started 5 mins ago", href: "/map?mode=resident&tab=perks&filter=Perks&entityId=partner-hotel-van-zandt" },
  { place: "Waterloo Greenway", action: "Concert", status: "Starts at 7 PM", href: "/map?mode=resident&tab=events&filter=Events&collection=waterloo-greenway" },
  { place: "Fairmont Austin", action: "Pool access", status: "Available today", href: "/map?mode=resident&tab=perks&filter=Perks&entityId=partner-fairmont-austin" },
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

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function weekdayForNow() {
  return new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(new Date());
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
  const firstName = resident?.fullName?.trim()?.split(/\s+/)[0] || "";
  const greeting = `${greetingForNow()}${firstName ? `, ${firstName}` : ""}.`;

  return (
    <main className="dp-resident-home" data-panel={panel}>
      <header className="dp-resident-home__header dp-resident-command-nav">
        <div className="dp-resident-command-brand">
          <strong>Downtown Perks</strong>
          <span>{panel === "home" ? "Austin" : panel === "perks" ? "Saved" : "Resident Card"}</span>
        </div>
        {panel === "home" ? (
          <div className="dp-resident-command-actions" aria-label="Resident shortcuts">
            <Link to="/map?mode=resident&tab=map&filter=All&console=expanded" aria-label="Search Downtown Perks"><Search aria-hidden="true" /></Link>
            <button type="button" onClick={() => openPanel("card")} aria-label="Open resident profile"><UserRound aria-hidden="true" /></button>
          </div>
        ) : (
          <button type="button" onClick={() => openPanel("home")} aria-label="Return to resident home">Done</button>
        )}
      </header>

      {panel === "home" ? (
        <div className="dp-resident-home__panel dp-resident-command-center" role="tabpanel" aria-label="Resident home">
          <section className="dp-resident-dynamic-greeting" aria-labelledby="resident-command-greeting">
            <div>
              <p>Downtown Austin</p>
              <h1 id="resident-command-greeting">{greeting}</h1>
            </div>
            <dl>
              <div><dt>Today</dt><dd>{weekdayForNow()}</dd></div>
              <div><dt>Nearby</dt><dd>3 new experiences</dd></div>
              <div><dt>Next</dt><dd>Happy hour starts soon</dd></div>
            </dl>
          </section>

          <section className="dp-resident-ai-concierge" aria-labelledby="resident-ai-concierge-title">
            <Link className="dp-resident-search-entry" to="/map?mode=resident&tab=map&filter=All&console=expanded">
              <Search aria-hidden="true" />
              <span id="resident-ai-concierge-title">Ask Downtown</span>
              <small>Where should we go?</small>
            </Link>
            <div className="dp-resident-concierge-prompts" aria-label="Suggested searches">
              {["Walkable dinner tonight", "Live music", "Quiet coffee", "Pool access", "Date night", "What's new?"].map((prompt) => (
                <Link key={prompt} to={`/map?mode=resident&tab=map&filter=All&query=${encodeURIComponent(prompt)}`}>{prompt}</Link>
              ))}
            </div>
          </section>

          <section className="dp-resident-home__section dp-resident-today-dashboard" aria-labelledby="today-dashboard-title">
            <div className="dp-resident-section-title"><h2 id="today-dashboard-title">Today’s dashboard</h2></div>
            <div className="dp-resident-dashboard-grid">
              {dashboardTiles.map((item) => {
                const content = <><span>{item.title}</span><strong>{item.value}</strong><small>{item.detail}</small></>;
                return "panel" in item ? (
                  <button key={item.title} type="button" onClick={() => openPanel(item.panel)}>{content}</button>
                ) : (
                  <Link key={item.title} to={item.href}>{content}</Link>
                );
              })}
            </div>
          </section>

          <section className="dp-resident-card-command" aria-labelledby="resident-card-command-title">
            <div>
              <p>Resident Card</p>
              <h2 id="resident-card-command-title">QR ready</h2>
              <span>Tap to show your QR code and use a nearby resident perk.</span>
            </div>
            <button type="button" onClick={() => openPanel("card")}><QrCode aria-hidden="true" />Show QR</button>
            <Link to="/map?mode=resident&tab=perks&filter=Perks">Benefits <ChevronRight aria-hidden="true" /></Link>
          </section>

          <section className="dp-resident-home__section dp-resident-live-activity" aria-labelledby="live-activity-title">
            <div className="dp-resident-section-title"><h2 id="live-activity-title">Live activity</h2></div>
            <div>
              {liveActivity.map((item) => (
                <Link key={item.place} to={item.href}>
                  <span><strong>{item.place}</strong><small>{item.action}</small></span>
                  <em>{item.status}</em>
                </Link>
              ))}
            </div>
          </section>

          <section className="dp-resident-home__section" aria-labelledby="recommended-today">
            <div className="dp-resident-section-title"><h2 id="recommended-today">Recommended nearby</h2><Link to="/map?mode=resident&tab=map&filter=Dining&intent=dinner">View map</Link></div>
            <Link className="dp-resident-hero-card" to="/map?mode=resident&tab=events&filter=Events&query=live%20music">
              <img src="/images/map-entities/perks/moody_theater_live_music_1779052684229.png" alt="Live music performance in downtown Austin" />
              <div><span>Based on today</span><h3>Dinner, then live music.</h3><p>One walkable evening with a nearby place to start.</p><strong>Explore plan <ArrowRight aria-hidden="true" /></strong></div>
            </Link>
          </section>

          <section className="dp-resident-home__section" aria-labelledby="nearby-categories">
            <div className="dp-resident-section-title"><h2 id="nearby-categories">Quick actions</h2></div>
            <div className="dp-resident-category-rail" aria-label="Nearby categories">
              {nearbyCategories.map(([label, filter]) => <Link key={label} to={`/map?mode=resident&tab=map&filter=${encodeURIComponent(filter)}`}>{label}</Link>)}
              <Link to="/map?mode=resident&tab=map&filter=Hotels">Hotels</Link>
            </div>
          </section>

          <section className="dp-resident-home__section dp-resident-home__saved-preview" aria-labelledby="home-saved-title">
            <div className="dp-resident-section-title">
              <h2 id="home-saved-title">Saved</h2>
              <button type="button" onClick={() => openPanel("perks")}>{savedPerks.length ? "View all" : "Start saving"}</button>
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
                <span><strong>Your favourite places live here.</strong><small>Save something from the map to begin.</small></span>
                <ChevronRight aria-hidden="true" />
              </button>
            )}
          </section>

          <section className="dp-resident-home__section dp-resident-home__compact-list" aria-labelledby="home-events-title">
            <div className="dp-resident-section-title"><h2 id="home-events-title">Upcoming</h2><Link to="/map?mode=resident&tab=events&filter=Events">Events</Link></div>
            <div>{residentEvents.slice(0, 1).map((item) => <Link key={item.title} to={item.href}><CalendarDays aria-hidden="true" /><span><strong>Tonight · 3 events nearby</strong><small>{item.detail}</small></span><ChevronRight aria-hidden="true" /></Link>)}</div>
          </section>

          <section className="dp-resident-directory-section" aria-labelledby="walking-routes-title">
            <div className="dp-resident-section-title"><h2 id="walking-routes-title">Walking routes</h2></div>
            <div className="dp-resident-route-list">{residentRoutes.map((item, index) => <Link key={item.title} to={item.href} className={index === 0 ? "is-featured" : ""}><Route aria-hidden="true" /><span><strong>{item.title}</strong><small>{item.detail}</small><em>{item.meta}</em></span><ChevronRight aria-hidden="true" /></Link>)}</div>
          </section>

          <section className="dp-resident-directory-section" aria-labelledby="collections-title">
            <div className="dp-resident-section-title"><h2 id="collections-title">Collections</h2></div>
            <div className="dp-resident-directory-list">{experienceCollections.map((item) => <Link key={item.title} to={item.href}><span><strong>{item.title}</strong><small>{item.detail}</small></span><ChevronRight aria-hidden="true" /></Link>)}</div>
          </section>

          <section className="dp-resident-directory-section dp-resident-shared-amenity" aria-labelledby="shared-amenity-title">
            <Building2 aria-hidden="true" />
            <div><small>Building benefit</small><h2 id="shared-amenity-title">The Modern · pool access</h2><p>A featured resident benefit available through participating buildings.</p><Link to="/map?mode=resident&tab=map&filter=Properties&query=shared%20amenities%20resident%20access">View benefit</Link></div>
          </section>
          <section className="dp-resident-directory-section dp-resident-dana-question" aria-labelledby="dana-question-title">
            <Landmark aria-hidden="true" />
            <div><small>Downtown update</small><h2 id="dana-question-title">Waterloo Greenway weekend festival</h2><p>See what is happening nearby and answer one short community question.</p><Link to="/map?mode=resident&tab=map&filter=Surveys&query=resident%20downtown%20priority%20survey">Read update</Link></div>
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
              <section className="dp-resident-card-qr-action" aria-label="Resident perk QR code">
                <img src="/images/card/perks-card-qr.png" alt="Downtown Perks QR code for resident perks" />
                <div>
                  <h3>Tap to show this QR code.</h3>
                  <p>Show it at a participating partner to get your resident perk.</p>
                </div>
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
