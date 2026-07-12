import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Coffee,
  Dumbbell,
  Landmark,
  MapPin,
  MoonStar,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Utensils,
} from "lucide-react";
import { residentBuildingOptions } from "@/data/residentBuildingOptions";
import {
  buildResidentOnboardingMapHref,
  defaultResidentOnboardingState,
  isOnboardingStep,
  onboardingSteps,
  readResidentOnboardingState,
  updateResidentOnboardingState,
  writeResidentOnboardingState,
} from "./state/onboardingPersistence";

const welcomeImage = "/images/reports/four-seasons-lady-bird-lake.jpg";
const discoverImage = "/images/reports/hotel-van-zandt-rooftop-pool.jpg";
const roleImage = "/images/reports/trail-bridge.webp";

const screenCopy = {
  welcome: {
    eyebrow: "Downtown Perks",
    title: "Where downtown meets you.",
    body: "Local perks, experiences and places that make downtown Austin feel closer.",
  },
  discover: {
    title: "More to explore. Right around you.",
    body: "A few useful reasons to open the map when you are deciding where to go.",
  },
  role: {
    title: "What brings you here?",
    body: "Choose the experience that fits what you need today.",
  },
  preferences: {
    title: "Tell us what matters to you.",
    body: "We’ll use this to shape what appears first. You can change it anytime.",
  },
  complete: {
    title: "Found something for you.",
    body: "Opening your resident map with nearby places, perks and events shaped around your choices.",
  },
};

const discoveryRows = [
  {
    id: "perks",
    icon: Tag,
    title: "Exclusive perks",
    detail: "Just for residents",
    example: "Resident happy hour · 0.3 miles away",
    destination: "Perks tab",
  },
  {
    id: "events",
    icon: CalendarDays,
    title: "Local events",
    detail: "Happening tonight",
    example: "Live music nearby · starts at 7 PM",
    destination: "Events tab",
  },
  {
    id: "amenities",
    icon: Building2,
    title: "Building benefits",
    detail: "Access shared amenities",
    example: "Pool access request · partner building",
    destination: "Property drawer",
  },
  {
    id: "local",
    icon: Store,
    title: "Support local",
    detail: "Businesses you’ll love",
    example: "Coffee spot open now · 6 min walk",
    destination: "Map detail",
  },
];

const interests = [
  { id: "dining", label: "Dining", description: "Restaurants, patios and easy dinner plans", icon: Utensils },
  { id: "coffee", label: "Coffee", description: "Morning stops and places to work nearby", icon: Coffee },
  { id: "nightlife", label: "Nightlife", description: "Cocktails, music and late plans", icon: MoonStar },
  { id: "events", label: "Events", description: "Shows, markets and things happening soon", icon: CalendarDays },
  { id: "fitness", label: "Fitness", description: "Gyms, trails and active mornings", icon: Dumbbell },
  { id: "shopping", label: "Shopping", description: "Local retail and useful errands", icon: ShoppingBag },
  { id: "wellness", label: "Wellness", description: "Spas, calm spaces and reset stops", icon: Sparkles },
  { id: "art", label: "Art & culture", description: "Public art, galleries and neighborhood walks", icon: Landmark },
];

const districts = ["Rainey", "Seaholm", "West 6th", "Downtown Core", "Red River", "Waterloo"];

function trackOnboarding(eventName, payload = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("dp:analytics", {
      detail: {
        type: eventName,
        source: "resident_onboarding",
        timestamp: new Date().toISOString(),
        ...payload,
      },
    }),
  );
}

function getStepFromLocation(pathStep, search) {
  const queryStep = new URLSearchParams(search).get("step");
  if (isOnboardingStep(pathStep)) return pathStep;
  if (isOnboardingStep(queryStep)) return queryStep;
  return null;
}

function BeeRouteNarrative({ variant = "down", active = true }) {
  return (
    <svg className={`dp-onboarding-bee-route is-${variant}`} viewBox="0 0 220 180" aria-hidden="true" focusable="false" data-active={active}>
      <path className="dp-onboarding-bee-path" d="M28 22 C72 24 80 64 118 72 C162 82 162 122 194 146" />
      <path className="dp-onboarding-bee-wing" d="M184 137 C190 128 201 132 201 142 C192 144 187 143 184 137Z" />
      <path className="dp-onboarding-bee-wing" d="M177 136 C168 128 158 133 160 143 C169 144 174 142 177 136Z" />
      <path className="dp-onboarding-bee-mark" d="M174 146 L185 139 L197 147 L185 155 Z" />
    </svg>
  );
}

function OnboardingProgress({ step }) {
  const index = Math.max(0, onboardingSteps.indexOf(step));
  const percent = ((index + 1) / onboardingSteps.length) * 100;

  if (step === "complete") return null;

  return (
    <div className="dp-onboarding-progress" aria-label={`Onboarding progress ${Math.round(percent)} percent`}>
      <span style={{ inlineSize: `${percent}%` }} />
    </div>
  );
}

function OnboardingShell({ step, state, children, onBack, onSkip }) {
  return (
    <main className={`dp-onboarding-page is-${step}`}>
      <div className="dp-onboarding-safe">
        <header className="dp-onboarding-topbar" aria-label="Resident onboarding controls">
          <button type="button" className="dp-onboarding-back" onClick={onBack} disabled={step === "welcome"}>
            <ArrowLeft aria-hidden="true" />
            <span>Back</span>
          </button>
          <span className="dp-onboarding-brand">Downtown Perks</span>
          <button type="button" className="dp-onboarding-skip" onClick={onSkip}>
            Skip
          </button>
        </header>
        {children}
        <OnboardingProgress step={state.currentStep} />
      </div>
    </main>
  );
}

function ActionBar({ label = "Continue", onContinue, disabled = false, description }) {
  return (
    <div className="dp-onboarding-actionbar">
      {description ? <p role="status">{description}</p> : null}
      <button type="button" className="dp-onboarding-primary" onClick={onContinue} disabled={disabled}>
        {label}
        <ArrowRight aria-hidden="true" />
      </button>
    </div>
  );
}

function WelcomeScreen({ onContinue }) {
  return (
    <section className="dp-onboarding-screen dp-onboarding-welcome" aria-labelledby="onboarding-welcome-title">
      <div className="dp-onboarding-mark" aria-hidden="true">DP</div>
      <BeeRouteNarrative variant="welcome" />
      <div className="dp-onboarding-copy">
        <p>{screenCopy.welcome.eyebrow}</p>
        <h1 id="onboarding-welcome-title">{screenCopy.welcome.title}</h1>
        <span>Follow what catches your eye.</span>
      </div>
      <button type="button" className="dp-onboarding-tap-zone" onClick={onContinue} aria-label="Continue to Downtown Perks discovery">
        <img src={welcomeImage} alt="Downtown Austin skyline near Lady Bird Lake" />
        <span>{screenCopy.welcome.body}</span>
      </button>
    </section>
  );
}

function DiscoverScreen({ onContinue }) {
  const [openExample, setOpenExample] = useState("");

  return (
    <section className="dp-onboarding-screen dp-onboarding-discover" aria-labelledby="onboarding-discover-title">
      <div className="dp-onboarding-heading">
        <h1 id="onboarding-discover-title">{screenCopy.discover.title}</h1>
        <p>{screenCopy.discover.body}</p>
      </div>
      <BeeRouteNarrative variant="list" />
      <div className="dp-onboarding-feature-list">
        {discoveryRows.map((row) => {
          const Icon = row.icon;
          const isOpen = openExample === row.id;
          return (
            <button
              type="button"
              className="dp-onboarding-feature-row"
              key={row.id}
              aria-expanded={isOpen}
              onClick={() => {
                setOpenExample(isOpen ? "" : row.id);
                trackOnboarding("onboarding_step_viewed", { step: "discover", destination: row.destination });
              }}
            >
              <Icon aria-hidden="true" />
              <span>
                <strong>{row.title}</strong>
                <small>{isOpen ? row.example : row.detail}</small>
              </span>
              <ChevronRight aria-hidden="true" />
            </button>
          );
        })}
      </div>
      <figure className="dp-onboarding-edge-photo">
        <img src={discoverImage} alt="People enjoying a downtown Austin rooftop pool and lounge" />
      </figure>
      <ActionBar label="Choose your path" onContinue={onContinue} />
    </section>
  );
}

function RoleScreen({ onResident, onPartner }) {
  return (
    <section className="dp-onboarding-screen dp-onboarding-role" aria-labelledby="onboarding-role-title">
      <figure className="dp-onboarding-role-photo">
        <img src={roleImage} alt="Trail bridge and downtown Austin at golden hour" />
      </figure>
      <div className="dp-onboarding-heading">
        <h1 id="onboarding-role-title">{screenCopy.role.title}</h1>
        <p>{screenCopy.role.body}</p>
      </div>
      <div className="dp-onboarding-fork" aria-hidden="true">
        <BeeRouteNarrative variant="fork" />
      </div>
      <div className="dp-onboarding-selection-list">
        <button type="button" className="dp-onboarding-selection-row" onClick={onResident}>
          <MapPin aria-hidden="true" />
          <span>
            <strong>I’m a resident</strong>
            <small>Unlock local perks, discover events and use your resident card.</small>
          </span>
          <ChevronRight aria-hidden="true" />
        </button>
        <button type="button" className="dp-onboarding-selection-row" onClick={onPartner}>
          <Building2 aria-hidden="true" />
          <span>
            <strong>I’m a partner</strong>
            <small>Reach residents, publish experiences and manage your Downtown Perks presence.</small>
          </span>
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function SelectionRow({ item, selected, onClick }) {
  const Icon = item.icon;
  return (
    <button type="button" className="dp-onboarding-preference-row" data-selected={selected} aria-pressed={selected} onClick={onClick}>
      <Icon aria-hidden="true" />
      <span>
        <strong>{item.label}</strong>
        {item.description ? <small>{item.description}</small> : null}
      </span>
      <em>{selected ? <Check aria-hidden="true" /> : null}<span className="sr-only">{selected ? "selected" : "not selected"}</span></em>
    </button>
  );
}

function PreferencesScreen({ state, setState, onContinue }) {
  const [error, setError] = useState("");

  function toggleInterest(id) {
    setError("");
    const nextInterests = state.interests.includes(id)
      ? state.interests.filter((item) => item !== id)
      : [...state.interests, id];
    setState({ interests: nextInterests });
    trackOnboarding("onboarding_interest_selected", { interest: id, selectedInterestCount: nextInterests.length });
  }

  function toggleDistrict(district) {
    setError("");
    const nextDistricts = state.preferredDistricts.includes(district)
      ? state.preferredDistricts.filter((item) => item !== district)
      : [...state.preferredDistricts, district];
    setState({ preferredDistricts: nextDistricts });
    trackOnboarding("onboarding_district_selected", { district, selectedDistrictCount: nextDistricts.length });
  }

  function requestLocation() {
    setError("");
    trackOnboarding("onboarding_location_requested");
    if (!navigator.geolocation) {
      setState({ locationPermission: "restricted" });
      trackOnboarding("onboarding_location_result", { result: "restricted" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        setState({ locationPermission: "granted" });
        trackOnboarding("onboarding_location_result", { result: "granted" });
      },
      () => {
        setState({ locationPermission: "denied" });
        trackOnboarding("onboarding_location_result", { result: "denied" });
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 600000 },
    );
  }

  function submitPreferences() {
    if (!state.interests.length) {
      setError("Choose at least one interest so the map knows what to show first.");
      return;
    }
    if (!state.preferredDistricts.length && state.locationPermission !== "granted") {
      setError("Choose at least one district or use your current location.");
      return;
    }
    onContinue();
  }

  return (
    <section className="dp-onboarding-screen dp-onboarding-preferences" aria-labelledby="onboarding-preferences-title">
      <div className="dp-onboarding-heading">
        <h1 id="onboarding-preferences-title">{screenCopy.preferences.title}</h1>
        <p>{screenCopy.preferences.body}</p>
      </div>
      <BeeRouteNarrative variant="preference" active={state.interests.length || state.preferredDistricts.length} />

      <div className="dp-onboarding-form" aria-label="Resident map preferences">
        <section>
          <h2>Interests</h2>
          <div className="dp-onboarding-preference-list">
            {interests.map((item) => (
              <SelectionRow key={item.id} item={item} selected={state.interests.includes(item.id)} onClick={() => toggleInterest(item.id)} />
            ))}
          </div>
        </section>

        <section>
          <h2>Districts</h2>
          <div className="dp-onboarding-district-list">
            {districts.map((district) => {
              const selected = state.preferredDistricts.includes(district);
              return (
                <button type="button" key={district} data-selected={selected} aria-pressed={selected} onClick={() => toggleDistrict(district)}>
                  <span>{district}</span>
                  <em>{selected ? "Selected" : ""}</em>
                </button>
              );
            })}
          </div>
          <button type="button" className="dp-onboarding-location-row" data-selected={state.locationPermission === "granted"} onClick={requestLocation}>
            <MapPin aria-hidden="true" />
            <span>Use current location</span>
            <em>{state.locationPermission === "granted" ? "On" : "Optional"}</em>
          </button>
        </section>

        <section>
          <h2>I live at</h2>
          <label className="dp-onboarding-building-field">
            <span>Select your building <em>Optional</em></span>
            <select
              value={state.buildingId || ""}
              onChange={(event) => {
                setState({ buildingId: event.target.value || undefined });
                if (event.target.value) trackOnboarding("onboarding_building_selected", { hasBuilding: true });
              }}
            >
              <option value="">Choose building</option>
              {residentBuildingOptions.map((building) => (
                <option key={building.id} value={building.id}>{building.name}</option>
              ))}
            </select>
          </label>
        </section>
      </div>
      <ActionBar label="Open my map" onContinue={submitPreferences} description={error} />
    </section>
  );
}

function CompleteScreen({ state }) {
  const navigate = useNavigate();
  const mapHref = useMemo(() => buildResidentOnboardingMapHref(state), [state]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      navigate(mapHref, { replace: true });
    }, 900);
    return () => window.clearTimeout(timeoutId);
  }, [mapHref, navigate]);

  return (
    <main className="dp-onboarding-page is-complete">
      <section className="dp-onboarding-complete" aria-labelledby="onboarding-complete-title">
        <BeeRouteNarrative variant="complete" />
        <div>
          <p>Downtown Perks</p>
          <h1 id="onboarding-complete-title">{screenCopy.complete.title}</h1>
          <span>{screenCopy.complete.body}</span>
        </div>
        <Link className="dp-onboarding-open-map-link" to={mapHref}>Open map now</Link>
      </section>
    </main>
  );
}

export default function ResidentOnboardingFlow() {
  const { step: pathStep } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setStateValue] = useState(() => {
    const saved = readResidentOnboardingState();
    const requestedStep = getStepFromLocation(pathStep, location.search);
    return { ...saved, currentStep: requestedStep || saved.currentStep || "welcome" };
  });

  const currentStep = getStepFromLocation(pathStep, location.search) || state.currentStep || "welcome";

  useEffect(() => {
    if (!isOnboardingStep(currentStep)) return;
    setStateValue((current) => {
      const next = writeResidentOnboardingState({ ...current, currentStep });
      return next;
    });
    trackOnboarding("onboarding_step_viewed", { step: currentStep });
  }, [currentStep]);

  function setState(patch) {
    setStateValue((current) => {
      const next = writeResidentOnboardingState({ ...current, ...patch });
      return next;
    });
  }

  function goToStep(nextStep, extra = {}) {
    const next = updateResidentOnboardingState({ ...state, ...extra, currentStep: nextStep });
    setStateValue(next);
    trackOnboarding("onboarding_step_completed", { step: state.currentStep, nextStep });
    navigate(`/onboarding/${nextStep}`);
  }

  function skip() {
    const next = writeResidentOnboardingState({
      ...defaultResidentOnboardingState,
      currentStep: "complete",
      skipped: true,
    });
    setStateValue(next);
    trackOnboarding("onboarding_skipped", { step: currentStep });
    navigate("/map?mode=resident&tab=map&filter=All&source=onboarding-skip");
  }

  function back() {
    const index = onboardingSteps.indexOf(currentStep);
    if (index <= 0) {
      navigate(-1);
      return;
    }
    navigate(`/onboarding/${onboardingSteps[index - 1]}`);
  }

  if (currentStep === "complete") {
    return <CompleteScreen state={state} />;
  }

  return (
    <OnboardingShell step={currentStep} state={{ ...state, currentStep }} onBack={back} onSkip={skip}>
      {currentStep === "welcome" ? (
        <WelcomeScreen
          onContinue={() => {
            const startedAt = state.startedAt || new Date().toISOString();
            trackOnboarding("onboarding_started", { startedAt });
            goToStep("discover", { startedAt });
          }}
        />
      ) : null}
      {currentStep === "discover" ? (
        <DiscoverScreen onContinue={() => goToStep("role", { valueStoryViewed: true })} />
      ) : null}
      {currentStep === "role" ? (
        <RoleScreen
          onResident={() => {
            trackOnboarding("onboarding_role_selected", { role: "resident" });
            goToStep("preferences", { role: "resident" });
          }}
          onPartner={() => {
            const next = updateResidentOnboardingState({ ...state, role: "partner", currentStep: "role" });
            setStateValue(next);
            trackOnboarding("onboarding_role_selected", { role: "partner" });
            navigate("/partners/sign-up?source=resident-onboarding");
          }}
        />
      ) : null}
      {currentStep === "preferences" ? (
        <PreferencesScreen
          state={state}
          setState={setState}
          onContinue={() => {
            const completedAt = new Date().toISOString();
            const next = updateResidentOnboardingState({ ...state, currentStep: "complete", completedAt });
            setStateValue(next);
            trackOnboarding("onboarding_completed", {
              selectedInterestCount: next.interests.length,
              selectedDistrictCount: next.preferredDistricts.length,
              hasBuilding: Boolean(next.buildingId),
            });
            navigate("/onboarding/complete");
          }}
        />
      ) : null}
    </OnboardingShell>
  );
}
