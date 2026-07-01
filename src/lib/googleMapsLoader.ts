const GOOGLE_MAPS_SCRIPT_ID = "downtown-perks-google-maps-js";

let googleMapsPromise: Promise<any> | null = null;
let googleMapsLoadAttempts = 0;

function readGoogleMapsApiKey() {
  const env = import.meta.env || {};
  return (
    env.VITE_GOOGLE_MAPS_API_KEY ||
    env.GOOGLE_MAPS_API_KEY ||
    env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    env.REACT_APP_GOOGLE_MAPS_API_KEY ||
    ""
  );
}

function normalizeLibraries(libraries: string[] = ["maps", "marker"]) {
  return Array.from(new Set(libraries.filter(Boolean))).sort();
}

export function getGoogleMapsConfigError() {
  return readGoogleMapsApiKey() ? "" : "missing-api-key";
}

export function resetGoogleMapsLoaderForRetry() {
  googleMapsPromise = null;
  const existingScript = typeof document !== "undefined" ? document.getElementById(GOOGLE_MAPS_SCRIPT_ID) : null;
  existingScript?.remove();
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

  const requestedLibraries = normalizeLibraries(options.libraries || ["maps", "marker"]);

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.google?.maps) {
        resolve(window.google.maps);
        return;
      }
      existingScript.addEventListener("load", () => resolve(window.google.maps), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("loader-failure")), { once: true });
      return;
    }

    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: apiKey,
      v: "weekly",
      libraries: requestedLibraries.join(","),
      loading: "async",
    });

    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.onload = () => {
      googleMapsLoadAttempts = 0;
      if (window.google?.maps) resolve(window.google.maps);
      else reject(new Error("loader-failure"));
    };
    script.onerror = () => {
      const shouldRetry = options.retry !== false && googleMapsLoadAttempts < 1;
      googleMapsLoadAttempts += 1;
      googleMapsPromise = null;
      script.remove();
      if (shouldRetry) {
        window.setTimeout(() => {
          loadGoogleMaps({ ...options, retry: false }).then(resolve).catch(reject);
        }, 550);
        return;
      }
      reject(new Error("loader-failure"));
    };
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
