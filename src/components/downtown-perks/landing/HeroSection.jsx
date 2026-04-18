import { useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function HeroSection({ heroImage }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState([]);

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroImage} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-24 pt-40">

        <div className="max-w-4xl mx-auto rounded-[28px] bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl p-8">

          <h1 className="text-4xl font-semibold text-gray-900 mb-4">
            Where downtown meets you
          </h1>

          <p className="text-gray-600 mb-6">
            Everything nearby — in one map.
          </p>

          {/* SEARCH */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!query) return;

              setLoading(true);

              try {
                const res = await fetch("/api/ask-map", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ query })
                });

                const data = await res.json();
                setPlaces(data.places);

              } catch (err) {
                console.error(err);
              }

              setLoading(false);
            }}
            className="mx-auto mt-5 max-w-xl rounded-[22px] border border-white/70 bg-white shadow-lg"
          >
            <div className="p-2 flex gap-2">

              <div className="flex flex-1 items-center gap-3 border rounded-[16px] px-4 h-12">
                <MapPin className="h-4 w-4 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Where should I go right now?"
                  className="flex-1 outline-none text-sm"
                />
              </div>

              <button className="h-12 px-5 bg-gray-900 text-white rounded-[16px] flex items-center gap-2">
                {loading ? "Thinking..." : "Open map"}
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>
          </form>

          {/* RESULTS */}
          {places.length > 0 && (
            <div className="mt-6 bg-white rounded-xl p-4 shadow">
              <h3 className="font-semibold mb-2">Recommendations</h3>

              {places.map((p, i) => (
                <div key={i} className="text-sm py-1 border-b last:border-0">
                  {p.name}
                </div>
              ))}
            </div>
          )}

          {/* MAP */}
          {places.length > 0 && (
            <div className="mt-6 h-[350px] rounded-xl overflow-hidden">
              <MapContainer
                center={[30.2672, -97.7431]}
                zoom={14}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {places.map((p, i) => (
                  <Marker key={i} position={[p.lat, p.lng]}>
                    <Popup>{p.name}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
