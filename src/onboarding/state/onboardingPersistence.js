export const RESIDENT_ONBOARDING_VERSION = 1;
export const RESIDENT_ONBOARDING_KEY = "dp_resident_onboarding:v1";

export const onboardingSteps = ["welcome", "discover", "role", "preferences", "complete"];

export const defaultResidentOnboardingState = {
  version: RESIDENT_ONBOARDING_VERSION,
  currentStep: "welcome",
  role: undefined,
  interests: [],
  preferredDistricts: [],
  buildingId: undefined,
  locationPermission: "unknown",
  completedAt: undefined,
  skipped: false,
  startedAt: undefined,
  valueStoryViewed: false,
};

export function isOnboardingStep(value) {
  return onboardingSteps.includes(value);
}

export function readResidentOnboardingState() {
  if (typeof window === "undefined") return defaultResidentOnboardingState;

  try {
    const stored = JSON.parse(window.localStorage.getItem(RESIDENT_ONBOARDING_KEY) || "null");
    if (!stored || stored.version !== RESIDENT_ONBOARDING_VERSION) {
      return defaultResidentOnboardingState;
    }

    return {
      ...defaultResidentOnboardingState,
      ...stored,
      interests: Array.isArray(stored.interests) ? stored.interests : [],
      preferredDistricts: Array.isArray(stored.preferredDistricts) ? stored.preferredDistricts : [],
      currentStep: isOnboardingStep(stored.currentStep) ? stored.currentStep : "welcome",
    };
  } catch {
    return defaultResidentOnboardingState;
  }
}

export function writeResidentOnboardingState(nextState) {
  if (typeof window === "undefined") return nextState;

  const normalized = {
    ...defaultResidentOnboardingState,
    ...nextState,
    version: RESIDENT_ONBOARDING_VERSION,
  };

  window.localStorage.setItem(RESIDENT_ONBOARDING_KEY, JSON.stringify(normalized));
  return normalized;
}

export function updateResidentOnboardingState(patch) {
  return writeResidentOnboardingState({
    ...readResidentOnboardingState(),
    ...patch,
  });
}

const interestIntentMap = {
  dining: "eat_drink",
  coffee: "coffee",
  nightlife: "happy_hour",
  events: "events",
  fitness: "wellness",
  shopping: "shopping",
  wellness: "wellness",
  art: "DAA_art_walk",
};

export function buildResidentOnboardingMapHref(state) {
  const params = new URLSearchParams({
    mode: "resident",
    tab: "map",
    filter: "All",
  });

  const firstDistrict = state.preferredDistricts?.[0];
  const firstInterest = state.interests?.[0];

  if (firstDistrict) params.set("district", firstDistrict);
  if (firstInterest && interestIntentMap[firstInterest]) params.set("intent", interestIntentMap[firstInterest]);
  if (state.buildingId) params.set("buildingId", state.buildingId);
  params.set("source", "resident-onboarding");

  return `/map?${params.toString()}`;
}
