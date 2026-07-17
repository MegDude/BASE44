const GOOGLE_MAPS_SCRIPT_ID = "downtown-perks-google-maps-js";
const GOOGLE_MAPS_CALLBACK_NAME = "__downtownPerksGoogleMapsReady";

declare global {
  interface Window {
    google?: {
      maps?: any;
    };
  }
}

let googleMapsPromise: Promise<any> | null = null;
let googleMapsLoadAttempts = 0;

function readGoogleMapsApiKey() {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};
  const rawKey = env.VITE_GOOGLE_MAPS_API_KEY || "";
  return String(rawKey).trim().replace(/^['"]|['"]$/g, "");
}

function isPlausibleGoogleMapsApiKey(apiKey: string) {
  return /^AIza[0-9A-Za-z_-]{30,}$/.test(apiKey);
}

function normalizeLibraries(libraries: string[] = ["geometry", "marker", "places"]) {
  return Array.from(new Set(libraries.filter(Boolean))).sort();
}

function waitForGoogleMapsReady(resolve: (maps: any) => void, reject: (error: Error) => void) {
  let attempts = 0;
  const check = () => {
    const maps = window.google?.maps;
    if (maps?.Map) {
      resolve(maps);
      return;
    }
    attempts += 1;
    if (attempts > 80) {
      reject(new Error("loader-failure"));
      return;
    }
    window.setTimeout(check, 100);
  };
  check();
}

export function getGoogleMapsConfigError() {
  const apiKey = readGoogleMapsApiKey();
  if (!apiKey) return "missing-api-key";
  return isPlausibleGoogleMapsApiKey(apiKey) ? "" : "invalid-api-key";
}

export function resetGoogleMapsLoaderForRetry() {
  googleMapsPromise = null;
  const existingScript = typeof document !== "undefined" ? document.getElementById(GOOGLE_MAPS_SCRIPT_ID) : null;
  existingScript?.remove();
  if (typeof window !== "undefined") {
    delete (window as any)[GOOGLE_MAPS_CALLBACK_NAME];
  }
}

export function loadGoogleMaps(options: { libraries?: string[]; retry?: boolean } = {}) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) return googleMapsPromise;

  const apiKey = readGoogleMapsApiKey();
  if (!apiKey) {
    googleMapsPromise = Promise.reject(new Error("missing-api-key"));
    return googleMapsPromise;
  }
  if (!isPlausibleGoogleMapsApiKey(apiKey)) {
    googleMapsPromise = Promise.reject(new Error("invalid-api-key"));
    return googleMapsPromise;
  }

  const requestedLibraries = normalizeLibraries(options.libraries || ["geometry", "marker", "places"]);

  googleMapsPromise = new Promise((resolve, reject) => {
    let settled = false;
    const resolveReady = () => {
      if (settled) return;
      waitForGoogleMapsReady(
        (maps) => {
          if (settled) return;
          settled = true;
          googleMapsLoadAttempts = 0;
          resolve(maps);
        },
        (error) => {
          if (settled) return;
          settled = true;
          reject(error);
        },
      );
    };
    const rejectOnce = (error: Error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    const previousAuthFailure = (window as any).gm_authFailure;

    (window as any).gm_authFailure = () => {
      previousAuthFailure?.();
      googleMapsPromise = null;
      rejectOnce(new Error("authorization-failure"));
    };

    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.google?.maps) {
        resolveReady();
        return;
      }
      (window as any)[GOOGLE_MAPS_CALLBACK_NAME] = resolveReady;
      existingScript.addEventListener("load", resolveReady, { once: true });
      existingScript.addEventListener("error", () => rejectOnce(new Error("loader-failure")), { once: true });
      return;
    }

    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: apiKey,
      v: "weekly",
      libraries: requestedLibraries.join(","),
      loading: "async",
      callback: GOOGLE_MAPS_CALLBACK_NAME,
    });

    (window as any)[GOOGLE_MAPS_CALLBACK_NAME] = resolveReady;
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.onload = resolveReady;
    script.onerror = () => {
      const shouldRetry = options.retry !== false && googleMapsLoadAttempts < 1;
      googleMapsLoadAttempts += 1;
      googleMapsPromise = null;
      script.remove();
      delete (window as any)[GOOGLE_MAPS_CALLBACK_NAME];
      if (shouldRetry) {
        window.setTimeout(() => {
          loadGoogleMaps({ ...options, retry: false }).then(resolve).catch(rejectOnce);
        }, 550);
        return;
      }
      rejectOnce(new Error("loader-failure"));
    };
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
