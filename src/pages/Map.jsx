// @ts-nocheck
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = {
  lat: 30.2672,
  lng: -97.7431,
};

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function RecenterMap({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.setView([lat, lng], Math.max(map.getZoom(), 13), {
        animate: true,
      });
    }
  }, [lat, lng, map]);

  return null;
}

export default function MapPage() {
  const [params] = useSearchParams();
  const query = params.get("q")?.trim() || "";

  const [results, setResults] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [coordinates, setCoordinates] = useState(DEFAULT_CENTER);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError("");

      try {
        const endpoint = query ? "/api/ask-map" : "/api/map-data";
        const res = await fetch(endpoint, query
          ? {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ query }),
            }
          : {
              method: "GET",
            });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Search failed");
        }

        const places = Array.isArray(query ? data?.places : data?.venues)
          ? (query ? data.places : data.venues)
          : [];

        setResults(places);
        setRecentActivity(Array.isArray(data?.activity) ? data.activity : []);

        const firstValidPlace = places.find((place) => {
          const lat = parseFloat(place.lat ?? place.latitude);
          const lng = parseFloat(place.lng ?? place.longitude);
          return Number.isFinite(lat) && Number.isFinite(lng);
        });

        if (firstValidPlace) {
          setCoordinates({
            lat: parseFloat(firstValidPlace.lat ?? firstValidPlace.latitude),
            lng: parseFloat(firstValidPlace.lng ?? firstValidPlace.longitude),
          });
        } else {
          setCoordinates(DEFAULT_CENTER);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setResults([]);
        setRecentActivity([]);
        setCoordinates(DEFAULT_CENTER);
        setError(err?.message || "Unable to load map results.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="flex h-screen">
      <div className="w-[320px] overflow-y-auto border-r bg-white p-4">
        <h2 className="mb-2 font-semibold">{query ? "Results" : "Venues"}</h2>
        <p className="mb-4 text-xs text-gray-500">
          {query ? `Showing places for "${query}"` : "Showing live venue data from Supabase."}
        </p>

        {isLoading && <div className="text-sm text-gray-500">Loading map data...</div>}

        {!isLoading && error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {!isLoading && !error && results.length === 0 && (
          <div className="text-sm text-gray-500">
            {query ? "No results found." : "No venues are available yet."}
          </div>
        )}

        {results.map((place, index) => (
          <div key={`${place.name || place.title || "place"}-${index}`} className="border-b py-3 text-sm">
            <div className="font-medium text-slate-800">{place.name || place.title || "Unnamed"}</div>
            {place.reason && <div className="mt-1 text-gray-600">{place.reason}</div>}
            {place.description && <div className="mt-1 text-gray-600">{place.description}</div>}
            {place.address && <div className="mt-1 text-xs text-gray-500">{place.address}</div>}
          </div>
        ))}

        {!query && recentActivity.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Recent activity</h3>
            <div className="space-y-2">
              {recentActivity.slice(0, 5).map((item, index) => (
                <div key={`${item.id || "activity"}-${index}`} className="rounded-md bg-slate-50 p-2 text-xs text-slate-600">
                  {item.title || item.name || item.event_type || "Activity update"}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative flex-1">
        <MapContainer
          center={[coordinates.lat, coordinates.lng]}
          zoom={13}
          scrollWheelZoom
          className="h-full w-full"
        >
          <RecenterMap lat={coordinates.lat} lng={coordinates.lng} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {results.map((place, index) => {
            const lat = parseFloat(place.lat ?? place.latitude);
            const lng = parseFloat(place.lng ?? place.longitude);

            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
              return null;
            }

            return (
              <Marker key={`${place.name || "marker"}-${index}`} position={[lat, lng]}>
                <Popup>
                  <div className="space-y-1">
                    <div className="font-medium">{place.name || "Unnamed location"}</div>
                    {place.reason && <div className="text-sm text-slate-600">{place.reason}</div>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}