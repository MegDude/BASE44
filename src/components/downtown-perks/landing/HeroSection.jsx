import { useState } from "react";
import { MapPin, ArrowRight } from "lucide-react";

export default function HeroSection() {
  
  // ✅ MUST be inside component
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!query) return;

          setLoading(true);

          try {
            const res = await fetch("/api/ask-map", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                query,
                location: "Downtown Austin"
              })
            });

            const data = await res.json();
            setResults(data.places || []);

          } catch (err) {
            console.error(err);
          }

          setLoading(false);
        }}
        className="mx-auto mt-5 max-w-xl rounded-[22px] border border-white/70 bg-white shadow-[0_12px_30px_rgba(14,28,54,0.10)]"
      >
        <div className="p-2">
          
          <div className="flex gap-2">
            
            <div className="flex h-12 flex-1 items-center gap-3 rounded-[16px] border border-gray-300 px-4">
              <MapPin className="h-4 w-4 text-gray-400" />
              
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Where should I go right now?"
                className="flex-1 outline-none text-sm"
              />
            </div>

            <button className="h-12 px-5 bg-gray-900 text-white rounded-[16px] flex items-center gap-2">
              {loading ? "Searching..." : "Open map"}
              <ArrowRight className="h-4 w-4" />
            </button>

          </div>

          {/* FILTERS */}
          <div className="mt-3 flex gap-2 flex-wrap">
            <button type="button" onClick={() => setQuery("restaurants nearby")}>Venues</button>
            <button type="button" onClick={() => setQuery("events tonight")}>Events</button>
            <button type="button" onClick={() => setQuery("local deals")}>Perks</button>
            <button type="button" onClick={() => setQuery("5 minute walk")}>5 min walk</button>
          </div>

        </div>
      </form>

      {/* RESULTS */}
      {results.length > 0 && (
        <div className="mt-6 bg-white/80 backdrop-blur rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-2">Places</h3>

          {results.map((place, i) => (
            <div key={i} className="text-sm mb-2">
              <strong>{place.name}</strong> — {place.reason}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
