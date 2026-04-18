import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapPage() {
  const [params] = useSearchParams();
  const query = params.get("q");

  const [results, setResults] = useState([]);
  const [coordinates, setCoordinates] = useState({ lat: 30.2672, lng: -97.7431 }); // Default Austin, TX

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      try {
        const res = await fetch("/api/ask-map", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ query })
        });

        const data = await res.json();
        setResults(data.places);

      } catch (err) {
        console.error(err);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="h-screen flex">

      {/* Sidebar */}
      <div className="w-[320px] bg-white border-r p-4 overflow-y-auto">
        <h2 className="font-semibold mb-4">Results</h2>
        {results.map((place, index) => (
          <div key={index} className="text-sm py-2 border-b">
            {place.name}
          </div>
        ))}
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <MapContainer center={[coordinates.lat, coordinates.lng]} zoom={13} className="w-full h-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {results.map((place, index) => (
            <Marker key={index} position={[place.lat, place.lng]}>
              <Popup>{place.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
