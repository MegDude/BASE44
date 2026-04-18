import { useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";

export default function HeroSection({ heroImage }) {
  const [query, setQuery] = useState("");

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Downtown Austin"
          className="w-full h-full object-cover"
        />
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

              try {
                console.log("Search:", query);

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
                alert(data.answer);

              } catch (err) {
                console.error(err);
                alert("AI request failed");
              }
            }}
            className="mx-auto mt-5 max-w-xl rounded-[22px] border border-white/70 bg-white shadow-[0_12px_30px_rgba(14,28,54,0.10)]"
          >
            <div className="p-2">

              <div className="flex gap-2">

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
                  Open map
                  <ArrowRight className="h-4 w-4" />
                </button>

              </div>

              {/* CHIPS */}
              <div className="mt-3 flex gap-2 flex-wrap">

                <button onClick={() => setQuery("restaurants nearby")} type="button">
                  Venues
                </button>

                <button onClick={() => setQuery("events tonight")} type="button">
                  Events
                </button>

                <button onClick={() => setQuery("local perks")} type="button">
                  Perks
                </button>

                <button onClick={() => setQuery("5 minute walk")} type="button">
                  5 min walk
                </button>

              </div>

            </div>
          </form>

        </div>
      </div>
    </section>
  );
}
