import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, CalendarDays, MapPin, Search, Sparkles, Store, Users } from "lucide-react";

const prompts = [
  "What is active near Rainey right now?",
  "Where should I get coffee within a 5 minute walk?",
  "Which events are worth saving tonight?",
  "Where should a partner activate this week?",
];

const roles = [
  {
    icon: Users,
    title: "Residents",
    body: "Find nearby places, events, perks, and useful downtown context without opening five tabs.",
  },
  {
    icon: Building2,
    title: "Properties",
    body: "Understand which nearby anchors help residents use the neighborhood around the building.",
  },
  {
    icon: Store,
    title: "Local businesses",
    body: "See where attention is forming and how offers or events can meet people in motion.",
  },
  {
    icon: CalendarDays,
    title: "Organizations",
    body: "Surface public moments, district activity, and participation opportunities in map context.",
  },
];

export default function AskMapAgent() {
  const navigate = useNavigate();
  const [query, setQuery] = useState(prompts[0]);

  const encodedQuery = useMemo(() => encodeURIComponent(query.trim() || prompts[0]), [query]);

  function submit(event) {
    event.preventDefault();
    navigate(`/map?mode=resident&tab=map&prompt=${encodedQuery}`);
  }

  return (
    <main className="min-h-screen bg-[#F7F8FB] pt-[68px] text-[#0B1F33]">
      <section className="border-b border-[#0B1F33]/8 px-5 py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
          <div>
            <span className="dp-label mb-4 block">Ask the Map</span>
            <h1 className="font-heading text-[30px] font-medium leading-[1.04] md:text-[42px]">
              One command surface for downtown.
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-[1.7] text-[#0B1F33]/68">
              Ask what is nearby, active, useful, or worth saving. Downtown Perks turns local intent into a live map view, ranked places, and clearer next steps.
            </p>
          </div>

          <form onSubmit={submit} className="dp-glass p-3 shadow-[0_18px_48px_rgba(11,31,51,0.08),0_0_34px_rgba(179,143,79,0.08)]">
            <label className="flex h-10 items-center gap-3 border border-[#B38F4F]/18 bg-white/82 px-4 focus-within:border-[#B38F4F]/42">
              <Search className="h-4 w-4 text-[#B38F4F]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask the Map..."
                className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#0B1F33]/38"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setQuery(prompt)}
                  className="border border-[#B38F4F]/12 bg-white/72 px-3 py-2 text-left text-[12px] text-[#0B1F33]/68 transition-colors hover:border-[#B38F4F]/50 hover:text-[#0B1F33]"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <button className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 bg-[#0B1F33] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#081521]">
              Open these results on the map
              <ArrowRight className="h-4 w-4 text-[#B38F4F]" />
            </button>
          </form>
        </div>
      </section>

      <section className="px-5 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 max-w-2xl">
            <span className="dp-label mb-3 block">What it answers</span>
            <h2 className="font-heading text-3xl font-medium leading-tight">Map intelligence by role.</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <article key={role.title} className="dp-glass-card p-5">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center bg-[#0B1F33] text-[#B38F4F]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-body text-[14px] font-semibold">{role.title}</h3>
                  <p className="mt-2 text-[12px] leading-relaxed text-[#0B1F33]/62">{role.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-[#0B1F33]/8 px-5 py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row">
          <Link to="/map?mode=resident&tab=map" className="inline-flex h-10 items-center justify-center gap-2 bg-[#0B1F33] px-5 text-[13px] font-medium text-white">
            Open the Map <MapPin className="h-4 w-4 text-[#B38F4F]" />
          </Link>
          <Link to="/happy-hour-walking-map" className="inline-flex h-10 items-center justify-center gap-2 border border-[#0B1F33]/10 bg-white px-5 text-[13px] font-medium text-[#0B1F33]">
            Happy hour walking map <Sparkles className="h-4 w-4 text-[#B38F4F]" />
          </Link>
        </div>
      </section>
    </main>
  );
}
