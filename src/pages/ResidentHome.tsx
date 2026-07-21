import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Building2, CalendarDays, ChevronDown, ChevronRight, CreditCard, Landmark, QrCode, Route, Search, UserRound, X } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { RESIDENT_SEARCH_GUIDE_GROUPS } from "@/components/map/searchIntentRailConfig";
import { ResidentMobileTabBar } from "@/components/resident/ResidentMobileTabBar";
import { useSavedEntitiesRealtime, useSavedStore } from "@/features/resident/saved/savedStore";
import { useAuth } from "@/lib/AuthContext";
import { getResidentMembership } from "@/lib/residentMembership/residentMembershipClient";

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
  { title: "Warehouse Happy Hour Walk", detail: "Four walkable drinks and dining stops", meta: "18 min · 0.8 mi", href: "/map?mode=resident&tab=map&filter=Happy%20Hour&routeId=warehouse-district-happy-hour&query=walking%20happy%20hour%20route&intent=happy_hour" },
  { title: "DAA Art & Parks Walk", detail: "Public art, parks, plazas and cultural landmarks", meta: "Self-guided", href: "/map?mode=resident&tab=map&filter=Civic&routeId=daa-art-walk&query=DAA%20Art%20Walk&intent=DAA_art_walk" },
  { title: "Waterloo Greenway Walk", detail: "Parks, gardens, Waller Creek and Moody Amphitheater", meta: "6 stops · Self-guided", href: "/map?mode=resident&tab=map&filter=Civic&routeId=waterloo-greenway&query=Waterloo%20Greenway%20walk&intent=explore_downtown" },
  { title: "Downtown Stories Walk", detail: "Public spaces, history and neighborhood stories", meta: "25 min · 1.1 mi", href: "/map?mode=resident&tab=map&filter=Civic&routeId=downtown-stories-walk&query=downtown%20stories%20walk&intent=explore_downtown" },
  { title: "Downtown Coffee Loop", detail: "A short morning route through downtown", meta: "14 min · 0.6 mi", href: "/map?mode=resident&tab=map&filter=Coffee&routeId=coffee-before-work&query=coffee%20before%20work&intent=coffee" },
  { title: "Hotel Guest Arrival Route", detail: "Hotel Van Zandt to food, music and the river", meta: "16 min · 0.7 mi", href: "/map?mode=resident&tab=map&filter=Hotels&routeId=hotel-guest-arrival-route&query=hotel%20guest%20arrival%20route" },
] as const;

const experienceCollections = [
  { title: "Best sushi downtown", detail: "Sushi, sake and resident happy hours", href: "/map?mode=resident&tab=map&filter=Dining&query=Best%20sushi%20downtown&intent=dining" },
  { title: "Date night", detail: "Dinner, cocktails, music and waterfront stops", href: "/map?mode=resident&tab=map&filter=Dining&collection=date-night&query=Dinner%20for%20a%20date%20night&intent=dinner" },
  { title: "First date", detail: "Low-pressure coffee, drinks and easy walks", href: "/map?mode=resident&tab=map&filter=All&query=first%20date%20downtown&intent=dining" },
  { title: "Meet new friends", detail: "Social events, group activities and casual places", href: "/map?mode=resident&tab=events&filter=Events&query=events%20to%20meet%20new%20friends&intent=events" },
  { title: "Campaigns and pop-ups", detail: "Limited-time brand and partner experiences", href: "/map?mode=resident&tab=map&filter=Campaigns&query=campaigns%20pop-ups%20and%20brand%20activations" },
  { title: "Shared amenities", detail: "One participating building at a time", href: "/map?mode=resident&tab=map&filter=Properties&query=shared%20amenities%20resident%20access&intent=explore_downtown" },
] as const;

const liveActivity = [
  { place: "Hotel Van Zandt", action: "Happy hour", status: "Started 5 mins ago", href: "/map?mode=resident&tab=perks&filter=Perks&entityId=partner-hotel-van-zandt" },
  { place: "Waterloo Greenway", action: "Concert", status: "Starts at 7 PM", href: "/map?mode=resident&tab=events&filter=Events&collection=waterloo-greenway" },
  { place: "Fairmont Austin", action: "Pool access", status: "Available today", href: "/map?mode=resident&tab=perks&filter=Perks&entityId=partner-fairmont-austin" },
] as const;

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

function searchGuideHref(item: (typeof RESIDENT_SEARCH_GUIDE_GROUPS)[number]["items"][number]) {
  const params = new URLSearchParams({
    mode: "resident",
    tab: "map",
    filter: item.filter || "All",
    query: item.prompt || item.fullLabel,
    intent: item.id,
  });
  if (item.collection) {
    params.set("collection", item.collection);
    params.set("routeId", item.collection);
  }
  return `/map?${params.toString()}`;
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
  useSavedEntitiesRealtime();

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
          <section className="dp-resident-dynamic-greeting" aria-labelledby="resident-command-greeting">
            <div>
              <p>{greeting}</p>
              <h1 id="resident-command-greeting">What feels right downtown?</h1>
              <span>Downtown Austin · {weekdayForNow()}</span>
            </div>
          </section>

          <section className="dp-resident-home__section dp-resident-home__recommendation" aria-labelledby="recommended-today">
            <div className="dp-resident-section-title"><h2 id="recommended-today">Recommended nearby</h2><Link className="dp-resident-text-action" to="/map?mode=resident&tab=map&filter=Civic&routeId=waterloo-greenway">View map</Link></div>
            <Link className="dp-resident-hero-card" to="/map?mode=resident&tab=map&filter=Civic&routeId=waterloo-greenway&query=Waterloo%20Greenway%20walk&intent=explore_downtown" aria-label="Open the Waterloo Greenway walk on the map">
              <img
                src="/images/map-entities/refresh/civic/waterloo-golden-hour.png"
                alt="Waterloo Greenway in downtown Austin at golden hour"
                loading="eager"
                decoding="async"
              />
              <div><span>For this evening</span><h3>Walk Waterloo at golden hour.</h3><p>Follow Waller Creek through Waterloo Park to Moody Amphitheater.</p><strong>Open the walk <ArrowRight aria-hidden="true" /></strong></div>
            </Link>
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

          <section className="dp-resident-search-guide" aria-labelledby="resident-search-guide-title">
            <header>
              <p>Ask the Map</p>
              <h2 id="resident-search-guide-title">What can I look for?</h2>
              <span>Choose a place, plan, walk, or everyday need. Tap any option to open it on the map.</span>
            </header>
            <div className="dp-resident-search-guide__groups">
              {RESIDENT_SEARCH_GUIDE_GROUPS.map((group, index) => (
                <details key={group.title} open={index === 0}>
                  <summary>
                    <span><strong>{group.title}</strong><small>{group.description}</small></span>
                    <ChevronDown aria-hidden="true" />
                  </summary>
                  <div>
                    {group.items.map((item) => (
                      <Link key={item.id} to={searchGuideHref(item)}>
                        <span><strong>{item.shortLabel}</strong><small>{item.description}</small></span>
                        <ChevronRight aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className="dp-resident-card-command" aria-labelledby="resident-card-command-title">
            <div>
              <p>Resident Card</p>
              <h2 id="resident-card-command-title">QR ready</h2>
              <span>Tap to show your QR code and use a nearby resident perk.</span>
            </div>
            <button className="dp-resident-text-action" type="button" onClick={() => openPanel("card")}><QrCode aria-hidden="true" />Show QR</button>
            <Link className="dp-resident-text-action" to="/map?mode=resident&tab=perks&filter=Perks">Benefits <ChevronRight aria-hidden="true" /></Link>
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

          <section className="dp-resident-home__section dp-resident-home__compact-list" aria-labelledby="home-events-title">
            <div className="dp-resident-section-title"><h2 id="home-events-title">Upcoming</h2><Link className="dp-resident-text-action" to="/map?mode=resident&tab=events&filter=Events">Events</Link></div>
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
            <div><small>Building benefit</small><h2 id="shared-amenity-title">The Modern · pool access</h2><p>A featured resident benefit available through participating buildings.</p><Link className="dp-resident-text-action" to="/map?mode=resident&tab=map&filter=Properties&query=shared%20amenities%20resident%20access">View benefit</Link></div>
          </section>
          <section className="dp-resident-directory-section dp-resident-dana-question" aria-labelledby="dana-question-title">
            <Landmark aria-hidden="true" />
            <div><small>Downtown update</small><h2 id="dana-question-title">Waterloo Greenway weekend festival</h2><p>See what is happening nearby and answer one short community question.</p><Link className="dp-resident-text-action" to="/residents/governance">See community updates</Link></div>
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
                <img src="/images/card/perks-card-qr.png" alt="Downtown Perks QR code for resident perks" />
                <div>
                  <h3>Tap to show this QR code.</h3>
                  <p>Show it at a participating partner to get your resident perk.</p>
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
    </main>
  );
}
