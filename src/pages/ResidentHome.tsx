import { useEffect, useState } from "react";
import { ArrowLeft, Bookmark, CalendarDays, ChevronRight, CreditCard, Landmark, Map, QrCode, Search, UserRound, X } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ResidentMobileTabBar } from "@/components/resident/ResidentMobileTabBar";
import { useSavedEntitiesRealtime, useSavedStore } from "@/features/resident/saved/savedStore";
import { useAuth } from "@/lib/AuthContext";
import { getResidentMembership } from "@/lib/residentMembership/residentMembershipClient";
import {
  getResidentLiveActivity,
  type ResidentLiveActivityItem,
} from "@/lib/resident/liveActivity";
import { QuickCivicQuestion } from "@/features/resident/civic/QuickCivicQuestion";
import { ResidentPassModal } from "@/features/resident/resident-pass/ResidentPassModal";
import { getResidentGovernance, subscribeToResidentCivicInbox, type ResidentGovernanceResponse } from "@/lib/governance/governanceClient";

const RESIDENT_ACCESS_KEY = "dp_resident_access:current";

const EMPTY_CIVIC: ResidentGovernanceResponse = {
  initiatives: [], meetings: [], consultations: [], questions: [], yourQuestions: [], yourReports: [], followedInitiativeIds: [],
  neutrality: "Downtown Perks shares verified civic information and does not endorse political candidates.",
};

type HomePanel = "home" | "perks" | "card" | "profile";
type ResidentRecord = {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  buildingName?: string;
  buildingDistrict?: string;
  unitNumber?: string;
  verificationStatus?: string;
  membershipSource?: string;
  membershipType?: string;
  renewalDate?: string;
  expiresAt?: string;
  moveInDate?: string;
  profileCompletion?: number;
  interests?: string[];
  notifications?: Record<string, unknown>;
  joinedAt?: string;
  personalizedMap?: boolean;
  savedCount?: number;
};

type ResidentMembershipContext = {
  profile?: Record<string, unknown>;
  membership?: Record<string, unknown> | null;
  saved?: unknown[];
  preferences?: Record<string, unknown> | null;
  mapContext?: { path?: string; personalized?: boolean };
};

function stringValue(...values: unknown[]) {
  const value = values.find((item) => typeof item === "string" && item.trim());
  return typeof value === "string" ? value.trim() : "";
}

function stringList(...values: unknown[]) {
  const value = values.find(Array.isArray);
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function readResidentRecord(): ResidentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(RESIDENT_ACCESS_KEY) || "null");
  } catch {
    return null;
  }
}

function residentRecordFromMembership(context: ResidentMembershipContext, fallback: ResidentRecord | null): ResidentRecord | null {
  const profile = context.profile || {};
  const membership = context.membership || {};
  const preferences = context.preferences || {};
  const firstName = profile.first_name || profile.firstName || "";
  const lastName = profile.last_name || profile.lastName || "";
  const fullName = profile.full_name || profile.fullName || [firstName, lastName].filter(Boolean).join(" ");
  const hasAccountRecord = Boolean(profile.id || profile.resident_id || fullName || profile.email || fallback);
  if (!hasAccountRecord) return null;
  return {
    ...fallback,
    id: String(profile.id || profile.resident_id || fallback?.id || ""),
    fullName: String(fullName || fallback?.fullName || ""),
    email: String(profile.email || fallback?.email || ""),
    phone: String(profile.phone || fallback?.phone || ""),
    buildingName: String(profile.building_name || membership.building_name || fallback?.buildingName || ""),
    buildingDistrict: stringValue(profile.building_district, profile.district, membership.building_district, membership.district, fallback?.buildingDistrict),
    unitNumber: String(profile.apartment || profile.unit_number || fallback?.unitNumber || ""),
    verificationStatus: String(membership.status || profile.verification_status || fallback?.verificationStatus || "active"),
    membershipSource: stringValue(membership.source, profile.membership_source, fallback?.membershipSource),
    membershipType: stringValue(membership.membership_type, profile.membership_type, fallback?.membershipType),
    renewalDate: stringValue(membership.renewal_date, membership.current_period_end, fallback?.renewalDate),
    expiresAt: stringValue(membership.expires_at, fallback?.expiresAt),
    moveInDate: stringValue(profile.move_in_date, profile.moveInDate, fallback?.moveInDate),
    profileCompletion: Number(profile.profile_completion ?? fallback?.profileCompletion ?? 0),
    interests: stringList(profile.interests, preferences.interests, preferences.categories, fallback?.interests),
    notifications: (profile.notification_preferences || preferences.notifications || preferences.notification_preferences || fallback?.notifications || {}) as Record<string, unknown>,
    joinedAt: stringValue(membership.created_at, profile.created_at, fallback?.joinedAt),
    personalizedMap: Boolean(context.mapContext?.personalized ?? fallback?.personalizedMap),
    savedCount: Array.isArray(context.saved) ? context.saved.length : fallback?.savedCount,
  };
}

function readableSavedName(id: string) {
  const preferredWords: Record<string, string> = {
    atx: "ATX",
    daa: "DAA",
    fc: "FC",
    jos: "Jo's",
    qr: "QR",
    usa: "USA",
  };

  return id
    .replace(/^(?:(?:place|perk|venue|event|entity|partner|featured)-)+/i, "")
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => preferredWords[word.toLowerCase()] || `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");
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

function readableDate(value?: string) {
  if (!value) return "Not added";
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const parsed = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(parsed);
}

function readableMembershipSource(value?: string) {
  if (!value) return "Resident membership";
  if (value === "free_building") return "Included by your building";
  if (value === "paid") return "Annual resident membership";
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readableNotifications(value?: Record<string, unknown>) {
  if (!value || !Object.keys(value).length) return "Not chosen";
  const enabled = Object.entries(value).filter(([, setting]) => setting === true).map(([channel]) => channel.toUpperCase());
  return enabled.length ? enabled.join(" · ") : "Off";
}

function readableInterests(values?: string[]) {
  if (!values?.length) return "Not chosen";
  return values.map((value) => value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())).join(", ");
}

export default function ResidentHome() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const requestedPanel = searchParams.get("panel");
  const panel: HomePanel = ["perks", "card", "profile"].includes(requestedPanel || "") ? requestedPanel as HomePanel : "home";
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const savedIds = useSavedStore((state) => state.savedIds);
  const [resident, setResident] = useState<ResidentRecord | null>(readResidentRecord);
  const [liveActivity, setLiveActivity] = useState<ResidentLiveActivityItem[]>([]);
  const [liveActivityStatus, setLiveActivityStatus] = useState<"loading" | "ready" | "empty" | "unavailable">("loading");
  const [civic, setCivic] = useState<ResidentGovernanceResponse>(EMPTY_CIVIC);
  const [passOpen, setPassOpen] = useState(false);
  useSavedEntitiesRealtime();

  async function refreshCivic() {
    try { setCivic(await getResidentGovernance()); } catch { /* Preserve the last verified Home state while civic data reconnects. */ }
  }

  useEffect(() => {
    void refreshCivic();
    return subscribeToResidentCivicInbox(() => { void refreshCivic(); });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getResidentLiveActivity(controller.signal)
      .then((response) => {
        setLiveActivity(response.items);
        setLiveActivityStatus(response.status);
      })
      .catch((error) => {
        if (error?.name !== "AbortError") setLiveActivityStatus("unavailable");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    function syncResidentState() {
      setResident(readResidentRecord());
    }
    window.addEventListener("storage", syncResidentState);
    window.addEventListener("focus", syncResidentState);
    return () => {
      window.removeEventListener("storage", syncResidentState);
      window.removeEventListener("focus", syncResidentState);
    };
  }, []);

  useEffect(() => {
    if (isLoadingAuth || !isAuthenticated) return;
    let active = true;
    getResidentMembership()
      .then((context) => {
        if (!active) return;
        setResident((current) => residentRecordFromMembership(context, current));
      })
      .catch(() => {
        // The locally cached profile keeps the resident surface usable if the
        // membership service is briefly unavailable.
      });
    return () => { active = false; };
  }, [isAuthenticated, isLoadingAuth]);

  const savedPerks = savedIds.map((id) => ({ id, name: readableSavedName(id) }));

  function openPanel(nextPanel: HomePanel) {
    const next = new URLSearchParams(searchParams);
    if (nextPanel === "home") next.delete("panel");
    else next.set("panel", nextPanel);
    setSearchParams(next, { replace: true });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function handleTabChange(tabId: string) {
    if (["home", "perks", "card", "profile"].includes(tabId)) openPanel(tabId as HomePanel);
  }

  function closeResidentHome() {
    if (location.key !== "default") {
      navigate(-1);
      return;
    }
    navigate("/map?mode=resident&tab=map&filter=All");
  }

  const activeTab = panel === "perks" ? "perks" : panel === "card" ? "card" : "home";
  const firstName = resident?.fullName?.trim()?.split(/\s+/)[0] || "";
  const greeting = `${greetingForNow()}${firstName ? `, ${firstName}` : ""}.`;
  const profileGroups = resident ? [
    {
      title: "Contact",
      rows: [
        ["Name", resident.fullName || "Not added"],
        ["Email", resident.email || "Not added"],
        ["Phone", resident.phone || "Not added"],
      ],
    },
    {
      title: "Home",
      rows: [
        ["Property", resident.buildingName || "Not connected"],
        ["District", resident.buildingDistrict || "Not added"],
        ["Unit", resident.unitNumber || "Not added"],
        ["Move-in date", readableDate(resident.moveInDate)],
      ],
    },
    {
      title: "Membership",
      rows: [
        ["Plan", readableMembershipSource(resident.membershipSource || resident.membershipType)],
        ["Status", resident.verificationStatus === "verified" ? "Verified resident" : "Active resident"],
        ["Renewal", resident.renewalDate ? readableDate(resident.renewalDate) : resident.expiresAt ? readableDate(resident.expiresAt) : "No renewal date"],
        ["Member since", readableDate(resident.joinedAt)],
        ["Profile complete", resident.profileCompletion ? `${resident.profileCompletion}%` : "Not calculated"],
      ],
    },
    {
      title: "Preferences",
      rows: [
        ["Interests", readableInterests(resident.interests)],
        ["Updates", readableNotifications(resident.notifications)],
        ["Saved places", String(resident.savedCount ?? savedIds.length)],
        ["Personal map", resident.personalizedMap ? "Ready for you" : "Uses your current choices"],
      ],
    },
  ] : [];

  function renderProfileDetails(idPrefix: string) {
    return profileGroups.map((group) => (
      <section className="dp-resident-profile-group" key={group.title} aria-labelledby={`${idPrefix}-${group.title.toLowerCase()}`}>
        <h3 id={`${idPrefix}-${group.title.toLowerCase()}`}>{group.title}</h3>
        <dl>
          {group.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
      </section>
    ));
  }

  return (
    <main className="dp-resident-home" data-panel={panel}>
      <header className="dp-resident-home__header dp-resident-command-nav">
        <div className="dp-resident-command-brand">
          <strong>Downtown Perks</strong>
          <span>{panel === "home" ? "Austin" : panel === "perks" ? "Saved" : panel === "profile" ? "Profile" : "Resident Card"}</span>
        </div>
        {panel === "home" ? (
          <div className="dp-resident-command-actions" aria-label="Resident shortcuts">
            <Link to="/map?mode=resident&tab=map&filter=All&console=expanded" aria-label="Search Downtown Perks"><Search aria-hidden="true" /></Link>
            <button type="button" onClick={() => openPanel("profile")} aria-label="Open resident profile"><UserRound aria-hidden="true" /></button>
            <button type="button" className="dp-resident-home-close" onClick={closeResidentHome} aria-label="Close resident home"><X aria-hidden="true" /></button>
          </div>
        ) : (
          <button
            type="button"
            className="dp-resident-header-back"
            data-page-back="true"
            onClick={() => openPanel("home")}
            aria-label="Back to resident home"
          >
            <ArrowLeft aria-hidden="true" />
            <span>Back</span>
          </button>
        )}
      </header>

      {panel === "home" ? (
        <div className="dp-resident-home__panel dp-resident-command-center" role="tabpanel" aria-label="Resident home">
          <section className="dp-resident-dynamic-greeting dp-resident-home-hero" aria-labelledby="resident-command-greeting">
            <div><p>{greeting}</p><h1 id="resident-command-greeting">Downtown today</h1><span>{weekdayForNow()} · Nearby plans, resident benefits, and community updates.</span></div>
            <div className="dp-resident-home-primary-actions" aria-label="Primary resident actions">
              <Link to="/map?mode=resident&tab=map&filter=All"><Map aria-hidden="true" /><span>Open map</span></Link>
              <button type="button" onClick={() => setPassOpen(true)}><QrCode aria-hidden="true" /><span>Show resident pass</span></button>
              <Link to="/resident/civic"><Landmark aria-hidden="true" /><span>Civic inbox</span></Link>
            </div>
          </section>

          <section className="dp-resident-home__section dp-resident-now-briefing" aria-labelledby="resident-briefing-title">
            <div className="dp-resident-section-title"><h2 id="resident-briefing-title">What matters today</h2></div>
            <div>
              <Link to="/map?mode=resident&tab=map&filter=Events"><CalendarDays aria-hidden="true" /><span><strong>Events start downtown this evening</strong><small>See verified times and locations on the map.</small></span><ChevronRight aria-hidden="true" /></Link>
              <Link to="/map?mode=resident&tab=perks&filter=Perks"><CreditCard aria-hidden="true" /><span><strong>Your resident benefits are ready</strong><small>Open a perk before you arrive.</small></span><ChevronRight aria-hidden="true" /></Link>
              <Link to="/resident/civic"><Landmark aria-hidden="true" /><span><strong>{civic.consultations.length || 1} community question open</strong><small>Share a response and follow what happens next.</small></span><ChevronRight aria-hidden="true" /></Link>
            </div>
          </section>

          <section className="dp-resident-home__section dp-resident-home__recommendation" aria-labelledby="happening-now-title">
            <div className="dp-resident-section-title"><h2 id="happening-now-title">Happening now</h2><Link to="/map?mode=resident&tab=map&filter=All">Open map</Link></div>
            <Link className="dp-resident-hero-card" to="/map?mode=resident&tab=map&filter=Civic&routeId=waterloo-greenway" aria-label="Open Waterloo Greenway on the map">
              <img src="/images/map-entities/refresh/civic/waterloo-golden-hour.png" alt="Waterloo Greenway in downtown Austin at golden hour" loading="eager" decoding="async" />
              <div><span>Waterloo Greenway</span><h3>Evening along Waller Creek</h3><p>See current park access, programming, and the route to Moody Amphitheater.</p><strong>Open map</strong></div>
            </Link>
          </section>

          <section className="dp-resident-home__section dp-resident-live-activity" aria-labelledby="live-activity-title">
            <div className="dp-resident-section-title"><h2 id="live-activity-title">Live activity</h2><Link to="/map?mode=resident&tab=events&filter=All">Open map</Link></div>
            {liveActivityStatus === "loading" ? <p className="dp-resident-live-activity__state" role="status">Checking what is happening downtown.</p> : null}
            {liveActivityStatus === "empty" ? <p className="dp-resident-live-activity__state">Nothing new has been published right now. Check the map for places and plans nearby.</p> : null}
            {liveActivityStatus === "unavailable" ? <p className="dp-resident-live-activity__state" role="status">Live updates are taking a moment. The map is still ready to explore.</p> : null}
            {liveActivity.length ? <div>{liveActivity.map((item) => (
              <Link key={item.id} to={item.href}>
                <span><strong>{item.place}</strong><small>{item.action}</small></span>
                <em>{item.status}</em>
              </Link>
            ))}</div> : null}
          </section>

          <section className="dp-resident-home__section dp-resident-benefits-summary" aria-labelledby="resident-benefits-title">
            <div className="dp-resident-section-title"><h2 id="resident-benefits-title">Resident benefits</h2><Link to="/map?mode=resident&tab=perks&filter=Perks">See benefits</Link></div>
            <p>Use your short-lived Resident Pass when a participating place asks to verify your access.</p>
          </section>

          <section className="dp-resident-home__section dp-resident-civic-home" aria-labelledby="resident-civic-title">
            <div className="dp-resident-section-title"><h2 id="resident-civic-title">Your civic inbox</h2><Link to="/resident/civic">View all</Link></div>
            {civic.consultations[0] ? <QuickCivicQuestion action={civic.consultations[0]} onSubmitted={refreshCivic} /> : (
              <article className="dp-civic-home-empty"><small>Downtown update</small><h3>Tell DANA what should improve first</h3><p>Sign in to answer the current resident question and follow the published result.</p><Link to="/resident/civic">Open civic inbox</Link></article>
            )}
          </section>

          <section className="dp-resident-home__section dp-resident-home__saved-preview" aria-labelledby="home-saved-title">
            <div className="dp-resident-section-title">
              <h2 id="home-saved-title">Saved</h2>
              <button className="dp-resident-text-action" type="button" onClick={() => openPanel("perks")}>{savedPerks.length ? "View all" : "Start saving"}</button>
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

          <section className="dp-resident-home__section dp-resident-home__compact-list" aria-labelledby="home-upcoming-title">
            <div className="dp-resident-section-title"><h2 id="home-upcoming-title">Saved and upcoming</h2><Link to="/map?mode=resident&tab=events&filter=Events">See events</Link></div>
            <div><Link to="/map?mode=resident&tab=events&filter=Events"><CalendarDays aria-hidden="true" /><span><strong>See your next downtown plan</strong><small>Saved places and event responses stay together.</small></span><ChevronRight aria-hidden="true" /></Link></div>
          </section>

          <section className="dp-resident-home__section dp-resident-recent-activity" aria-labelledby="recent-activity-title">
            <div className="dp-resident-section-title"><h2 id="recent-activity-title">Recent activity</h2><Link to="/resident/activity">View activity</Link></div>
            <p>{savedIds.length ? `${savedIds.length} saved ${savedIds.length === 1 ? "place" : "places"} connected to your account.` : "Saved places, civic responses, and pass activity will appear here."}</p>
          </section>

        </div>
      ) : null}

      {panel === "perks" ? (
        <section className="dp-resident-home__panel dp-resident-saved-panel" role="tabpanel" aria-labelledby="saved-perks-title">
          <header className="dp-resident-panel-intro">
            <p>Saved perks</p>
            <h2 id="saved-perks-title">Ready when you are.</h2>
            <span>Open any perk for details, directions, and your QR.</span>
          </header>
          {savedPerks.length ? (
            <div className="dp-resident-saved-list">
              {savedPerks.map((item) => (
                <article key={item.id}>
                  <Link className="dp-resident-saved-row" to={`/map?mode=resident&tab=perks&filter=Saved&entityId=${encodeURIComponent(item.id)}`} aria-label={`Open ${item.name} on the map`}>
                    <span><small>Saved perk</small><h3>{item.name}</h3></span>
                    <strong className="dp-resident-text-action" aria-hidden="true">Open <ChevronRight /></strong>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="dp-resident-empty-state">
              <Bookmark aria-hidden="true" />
              <h3>No saved perks yet.</h3>
              <p>Save an offer from the map and it will appear here automatically.</p>
              <Link className="dp-resident-text-action" to="/map?mode=resident&tab=perks&filter=Perks">Browse nearby perks</Link>
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
                <button type="button" onClick={() => setPassOpen(true)}><QrCode aria-hidden="true" /><span>Show secure resident pass</span></button>
                <div>
                  <h3>Create a one-time QR code.</h3>
                  <p>Your pass expires automatically after it is shown.</p>
                </div>
              </section>
              <section className="dp-resident-profile-section" aria-labelledby="resident-profile-title">
                <div className="dp-resident-section-title">
                  <div><p>Resident profile</p><h2 id="resident-profile-title">Everything connected to your card.</h2></div>
                </div>
                <p className="dp-resident-profile-summary">Review your contact details, home, membership, preferences, and personal map in one place.</p>
                {renderProfileDetails("resident-card-profile")}
                <div className="dp-resident-profile-actions">
                  <Link to={`/map?mode=resident&tab=card&filter=Perks&residentId=${encodeURIComponent(resident.id || "")}`}>Open on map</Link>
                  <Link to="/residents/welcome">Update details</Link>
                  <Link to="/card">Manage access</Link>
                </div>
              </section>
            </>
          ) : (
            <div className="dp-resident-empty-state">
              <UserRound aria-hidden="true" />
              <h3>Your resident profile lives here.</h3>
              <p>Create a card to connect your home property, or keep exploring downtown without an account.</p>
              <div><Link className="dp-resident-text-action" to="/map?mode=resident&tab=map&filter=All"><Search aria-hidden="true" />Open the map</Link><Link className="dp-resident-text-action" to="/card">Get a card</Link></div>
            </div>
          )}
        </section>
      ) : null}

      {panel === "profile" ? (
        <section className="dp-resident-home__panel dp-resident-card-panel" role="tabpanel" aria-labelledby="resident-profile-page-title">
          <header className="dp-resident-panel-intro">
            <p>Resident profile</p>
            <h2 id="resident-profile-page-title">Your downtown, connected.</h2>
            <span>Your membership, building, contact details, preferences, and saved places stay together here.</span>
          </header>
          {resident ? (
            <section className="dp-resident-profile-section" aria-label="Resident account details">
              {renderProfileDetails("resident-profile")}
              <div className="dp-resident-profile-actions">
                <Link to="/residents/welcome">Update profile</Link>
                <button type="button" onClick={() => openPanel("card")}>View card</button>
                <Link to="/residents/membership">View membership</Link>
              </div>
            </section>
          ) : (
            <div className="dp-resident-empty-state">
              <UserRound aria-hidden="true" />
              <h3>Connect your resident account.</h3>
              <p>Sign in to load your building, membership, preferences, saved places, and resident card.</p>
              <div><Link className="dp-resident-text-action" to="/residents/login">Sign in</Link><Link className="dp-resident-text-action" to="/residents/membership">Create account</Link></div>
            </div>
          )}
        </section>
      ) : null}

      <ResidentMobileTabBar activeTab={activeTab} onTabChange={handleTabChange} />
      <ResidentPassModal open={passOpen} residentName={resident?.fullName || "Downtown Perks resident"} buildingName={resident?.buildingName} onClose={() => setPassOpen(false)} />
    </main>
  );
}
