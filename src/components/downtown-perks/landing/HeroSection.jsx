import { useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";

export default function HeroSection({ heroImage }) {
  const [query, setQuery] = useState("");

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroImage} className="w-full h-full object-cover" alt="Hero background" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 pb-24 pt-40">
        <div className="max-w-4xl mx-auto rounded-[28px] bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl p-8">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">
            Where downtown meets you
          </h1>
          <p className="text-gray-600 mb-6">
            Everything nearby — in one map.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!query) return;

              // Redirect to the Map page with the query
              window.location.href = `/map?q=${encodeURIComponent(query)}`;
            }}
            className="mx-auto mt-5 max-w-xl rounded-[22px] border border-white/70 bg-white shadow-lg"
          >
            <div className="p-2 flex gap-2">
              <div className="flex flex-1 items-center gap-3 border rounded-[16px] px-4 h-10">
                <MapPin className="h-4 w-4 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Where should I go right now?"
                  className="flex-1 outline-none text-[13px]"
                />
              </div>

              <button className="h-10 px-5 bg-gray-900 text-white rounded-[16px] flex items-center gap-2">
                Open the Map
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
