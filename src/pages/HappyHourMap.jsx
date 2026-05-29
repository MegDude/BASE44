import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Clock, Search, Sparkles, Store } from "lucide-react";

const spots = [
  { name: "Half Step", district: "Rainey", type: "Cocktails", signal: "Strong after-work movement", offer: "Happy hour active" },
  { name: "Banger's", district: "Rainey", type: "Dinner + drinks", signal: "Group-friendly and walkable", offer: "Resident card eligible" },
  { name: "Merit Coffee", district: "Seaholm", type: "Coffee", signal: "Morning and remote-work traffic", offer: "Coffee perk available" },
  { name: "Aba", district: "Rainey", type: "Dinner", signal: "High save intent near evening", offer: "Dinner nearby" },
  { name: "The Stay Put", district: "Downtown Core", type: "Drinks", signal: "Good late-day activity", offer: "Featured venue" },
  { name: "Fareground", district: "Congress", type: "Food hall", signal: "Multi-option resident stop", offer: "Event-adjacent" },
];

const filters = ["All downtown", "Rainey", "Seaholm", "Congress", "Downtown Core"];

export default function HappyHourMap() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("All downtown");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return spots.filter((spot) => {
      const districtMatch = district === "All downtown" || spot.district === district;
      const queryMatch = !q || `${spot.name} ${spot.district} ${spot.type} ${spot.signal} ${spot.offer}`.toLowerCase().includes(q);
      return districtMatch && queryMatch;
    });
  }, [district, query]);

  function openMap() {
    const prompt = query || `Happy hour near ${district === "All downtown" ? "downtown" : district}`;
    navigate(`/map?mode=resident&tab=map&filter=Dining&prompt=${encodeURIComponent(prompt)}`);
  }

  return (
    <main className="min-h-screen bg-[#F7F8FB] pt-[68px] text-[#0B1F33]">
      <section className="border-b border-[#0B1F33]/8 px-5 py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <span className="dp-label mb-4 block">Walking Map</span>
            <h1 className="font-heading text-[30px] font-medium leading-[1.04] md:text-[42px]">
              Happy hour, mapped around movement.
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-[1.7] text-[#0B1F33]/68">
              A focused resident view for after-work decisions: nearby drinks, dinner, walkable routes, and active offers without leaving the Downtown Perks system.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button onClick={openMap} className="inline-flex h-10 items-center justify-center gap-2 bg-[#0B1F33] px-5 text-[13px] font-medium text-white">
                Open in the live map <ArrowRight className="h-4 w-4 text-[#B38F4F]" />
              </button>
              <Link to="/ask-map" className="inline-flex h-10 items-center justify-center gap-2 border border-[#0B1F33]/10 bg-white px-5 text-[13px] font-medium text-[#0B1F33]">
                Ask the Map
              </Link>
            </div>
          </div>

          <div className="dp-glass p-3">
            <label className="flex h-10 items-center gap-3 border border-[#0B1F33]/10 bg-white/78 px-4">
              <Search className="h-4 w-4 text-[#0B1F33]/48" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search happy hour..."
                className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#0B1F33]/38"
              />
            </label>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {filters.map((item) => (
                <button
                  key={item}
                  onClick={() => setDistrict(item)}
                  className={district === item
                    ? "shrink-0 border border-white/20 bg-[#0B1F33] px-3 py-2 text-[12px] font-medium text-white"
                    : "shrink-0 border border-[#0B1F33]/8 bg-white/72 px-3 py-2 text-[12px] font-medium text-[#0B1F33]/66"}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_360px]">
          <div className="min-h-[430px] border border-[#0B1F33]/8 bg-white/72 p-4 shadow-[0_18px_48px_rgba(11,31,51,0.08)]">
            <div className="relative h-full min-h-[400px] overflow-hidden bg-[#F7F8FB]">
              <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(11,31,51,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(11,31,51,0.08)_1px,transparent_1px)] [background-size:54px_54px]" />
              <div className="absolute left-[18%] top-[30%] h-px w-[58%] rotate-[14deg] bg-[#0B1F33]/14" />
              <div className="absolute left-[20%] top-[64%] h-px w-[64%] -rotate-[9deg] bg-[#0B1F33]/14" />
              {filtered.slice(0, 6).map((spot, index) => (
                <div
                  key={spot.name}
                  className="absolute flex h-10 w-10 items-center justify-center border border-white/80 bg-white shadow-[0_10px_28px_rgba(11,31,51,0.12)]"
                  style={{ left: `${16 + (index % 3) * 27}%`, top: `${24 + Math.floor(index / 3) * 34}%` }}
                >
                  <span className="flex h-7 w-7 items-center justify-center bg-[#0B1F33] text-[11px] font-semibold text-[#B38F4F]">
                    {spot.name[0]}
                  </span>
                </div>
              ))}
              <div className="absolute bottom-4 left-4 right-4 border border-white/60 bg-white/78 p-4 backdrop-blur-[20px]">
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#B38F4F]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Live decision layer
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-[#0B1F33]/68">
                  Showing walkable options by district, category, signal, and resident utility.
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-3">
            {filtered.map((spot) => (
              <article key={spot.name} className="dp-glass-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-body text-[14px] font-semibold">{spot.name}</h2>
                    <p className="mt-1 text-[12px] text-[#0B1F33]/58">{spot.district} · {spot.type}</p>
                  </div>
                  <Store className="h-4 w-4 text-[#B38F4F]" />
                </div>
                <p className="mt-3 text-[12px] leading-relaxed text-[#0B1F33]/64">{spot.signal}</p>
                <div className="mt-3 flex items-center gap-2 border-t border-white/50 pt-3 text-[11px] font-medium text-[#0B1F33]/62">
                  <Clock className="h-3.5 w-3.5 text-[#B38F4F]" />
                  {spot.offer}
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <div className="border border-[#0B1F33]/8 bg-white p-5 text-[13px] text-[#0B1F33]/62">
                No matches yet. Try another district or search.
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
