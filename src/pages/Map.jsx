<<<<<<< ours
export { default } from "./downtown-perks/ExploreRebuilt";
=======
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_COORDINATES = { lat: 30.2672, lng: -97.7431 };

function RecenterMap({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

export default function MapPage() {
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query) {
      setResults([]);
      setError("");
      return;
    }

    const controller = new AbortController();

    const fetchResults = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/places?query=${encodeURIComponent(query)}`, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        let data = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }

        if (!res.ok) {
          throw new Error(data?.error || "Places request failed");
        }

        setResults(Array.isArray(data.results) ? data.results : []);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
        setError("Unable to fetch places right now.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();

    return () => controller.abort();
  }, [query]);

  const mapCenter = useMemo(() => {
    if (results.length > 0) {
      return { lat: results[0].lat, lng: results[0].lng };
    }

    return DEFAULT_COORDINATES;
  }, [results]);

  return (
    <div className="h-screen flex">
      <div className="w-[320px] bg-white border-r p-4 overflow-y-auto">
        <h2 className="font-semibold mb-2">Results</h2>
        {query ? <p className="text-xs text-slate-500 mb-3">Query: {query}</p> : null}

        {loading ? <p className="text-sm text-slate-500">Loading places…</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {!loading && !error && results.length === 0 ? (
          <p className="text-sm text-slate-500">No places found yet.</p>
        ) : null}

        {results.map((place, index) => (
          <div key={`${place.name}-${place.lat}-${place.lng}-${index}`} className="text-sm py-3 border-b">
            <div className="font-medium">{place.name}</div>
            <div className="text-xs text-slate-500">{place.address}</div>
            {place.rating ? <div className="text-xs mt-1">⭐ {place.rating}</div> : null}
          </div>
        ))}
      </div>

      <div className="flex-1 relative">
        <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={13} className="w-full h-full">
          <RecenterMap center={mapCenter} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {results.map((place, index) => (
            <Marker key={`${place.name}-${place.lat}-${place.lng}-${index}`} position={[place.lat, place.lng]}>
              <Popup>
                <div className="text-sm">
                  <div className="font-medium">{place.name}</div>
                  <div>{place.address}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
>>>>>>> theirs
