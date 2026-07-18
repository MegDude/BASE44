import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Building2,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Send,
  Sparkles,
  Store,
  Users,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocations } from "@/lib/useLocations";
import { queryAgent } from "@/services/agent/agentClient";

const prompts = [
  "What is active near Rainey right now?",
  "Where should I get coffee within a 5 minute walk?",
  "Which events are worth saving tonight?",
  "Where should a partner activate this week?",
];

const modes = [
  { id: "resident", label: "Resident", icon: Users },
  { id: "partner", label: "Partner", icon: Store },
];

const filters = ["All", "Perks", "Happy Hours", "Events", "Properties", "Venues", "Brands"];
const districts = ["Downtown Austin", "Rainey", "Seaholm", "2nd Street", "Congress", "Red River", "West 6th"];

const roles = [
  {
    icon: Users,
    title: "For residents",
    body: "Ask what is close, worthwhile, walkable, or worth saving, then open the answer directly on the map.",
  },
  {
    icon: Building2,
    title: "For buildings",
    body: "Help residents and prospects understand what daily life feels like around the property.",
  },
  {
    icon: Store,
    title: "For partners",
    body: "See where nearby demand is forming and what kind of offer, event, or placement makes sense next.",
  },
  {
    icon: CalendarDays,
    title: "For local moments",
    body: "Connect events, civic activity, and neighborhood plans to the people already moving nearby.",
  },
];

function placeText(place) {
  return [
    place.name,
    place.category,
    place.category_key,
    place.type,
    place.partnerType,
    place.brand,
    place.district,
    place.address,
    place.summary,
    place.description,
    place.raw?.summary,
    place.raw?.deals_offers,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function rankContext(places, query, district, filter) {
  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 2);
  const activeDistrict = district === "Downtown Austin" ? "" : district.toLowerCase();
  const activeFilter = filter === "All" ? "" : filter.toLowerCase();

  return places
    .map((place) => {
      const text = placeText(place);
      let score = 0;
      if (activeDistrict && String(place.district || "").toLowerCase() === activeDistrict) score += 18;
      if (activeFilter && text.includes(activeFilter.replace(/\s+/g, " "))) score += 14;
      if (text.includes("perk") || text.includes("offer")) score += 4;
      if (text.includes("event") || text.includes("happy hour")) score += 4;
      terms.forEach((term) => {
        if (text.includes(term)) score += 6;
      });
      return { place, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ place }) => place);
}

function contextPayload(place) {
  return {
    id: String(place.id || place.name || ""),
    name: place.name,
    category: place.category || place.type || "Downtown place",
    district: place.district || "Downtown Austin",
    type: place.type || place.partnerType || "",
    address: place.address || "",
    summary: place.summary || place.description || place.raw?.summary || "",
    hasPerk: Boolean(place.raw?.deals_offers || place.deals_offers || place.perk || place.offer),
  };
}

export default function AskMapAgent() {
  const navigate = useNavigate();
  const places = useLocations();
  const [query, setQuery] = useState(prompts[0]);
  const [mode, setMode] = useState("resident");
  const [filter, setFilter] = useState("All");
  const [district, setDistrict] = useState("Downtown Austin");
  const [answer, setAnswer] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const context = useMemo(() => rankContext(places, query, district, filter), [places, query, district, filter]);
  const previewContext = context.slice(0, 4);
  const encodedQuery = useMemo(() => encodeURIComponent(query.trim() || prompts[0]), [query]);
  const sourceLabel = answer?.source === "base44-agent"
    ? "Downtown Perks agent conversation"
    : answer?.source === "openai-ask-map"
      ? "OpenAI map agent"
      : answer?.source === "local-agent"
        ? "Current Downtown Perks map context"
        : "Downtown Perks map intelligence";

  async function submit(event) {
    event?.preventDefault();
    const currentQuery = query.trim() || prompts[0];

    setStatus("loading");
    setError("");

    try {
      const payload = await queryAgent({
        message: currentQuery,
        query: currentQuery,
        mode,
        intent: "ask_map",
        district,
        filter,
        location: {
          label: district,
        },
        mapContext: context.slice(0, 10).map(contextPayload),
      });

      setAnswer(payload);
      setStatus("ready");
    } catch (requestError) {
      setError(requestError.message || "The map agent could not answer right now.");
      setStatus("error");
    }
  }

  function openMap() {
    navigate(`/map?mode=${mode}&tab=map&filter=${encodeURIComponent(filter)}&district=${encodeURIComponent(district)}&prompt=${encodedQuery}`);
  }

  return (
    <main className="min-h-screen bg-[var(--dp-bg)] pt-[68px] text-[#0B1F33]">
      <section className="border-b border-[#0B1F33]/8 px-5 py-10 md:py-14">
        <div className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <span className="dp-label mb-4 block">Ask the Map</span>
            <h1 className="font-heading text-[34px] font-medium leading-[1.02] md:text-[56px]">
              Find the best nearby move.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-[1.75] text-[#0B1F33]/68">
              Ask in plain English and Downtown Perks turns the question into a short answer, ranked places, and a map-ready next step for residents, buildings, and local partners.
            </p>
          </motion.div>

          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.05 }}
            className="dp-agent-console p-3 md:p-4"
          >
            <div className="flex flex-wrap gap-2">
              {modes.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    aria-pressed={mode === item.id}
                    className={`dp-agent-switch ${mode === item.id ? "is-active" : ""}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <label className="dp-agent-input mt-3">
              <Search className="h-4 w-4 text-[#BFA46A]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask the Map..."
                className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#0B1F33]/38"
              />
              <button type="submit" className="dp-agent-send" aria-label="Ask the map agent" disabled={status === "loading"}>
                {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </label>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="dp-agent-select">
                <span>District</span>
                <select value={district} onChange={(event) => setDistrict(event.target.value)}>
                  {districts.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="dp-agent-select">
                <span>Layer</span>
                <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                  {filters.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {prompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => setQuery(prompt)} className="dp-agent-prompt">
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {previewContext.map((place) => (
                <div key={place.id} className="dp-agent-context">
                  <span>{place.category || place.type || "Place"}</span>
                  <strong>{place.name}</strong>
                  <small>{place.district || "Downtown Austin"}</small>
                </div>
              ))}
            </div>
          </motion.form>
        </div>
      </section>

      <section className="px-5 py-8 md:py-10">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="dp-agent-answer min-h-[320px]">
            <CardContent className="p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <span className="dp-label block">Agent output</span>
                  <h2 className="mt-2 font-heading text-2xl font-medium text-[#0B1F33] md:text-3xl">
                    {answer?.title || "Ready for a live map answer."}
                  </h2>
                </div>
                <div className="dp-agent-orb" aria-hidden="true">
                  {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Brain className="h-5 w-5" />}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {status === "loading" ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    {[0, 1, 2].map((item) => <div key={item} className="dp-agent-skeleton" />)}
                  </motion.div>
                ) : answer ? (
                  <motion.div key="answer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.24 }}>
                    <p className="max-w-3xl text-[14px] leading-7 text-[#0B1F33]/72">{answer.answer}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(answer.actions || []).map((action) => (
                        <span key={action} className="dp-agent-action-chip"><CheckCircle2 className="h-3.5 w-3.5" />{action}</span>
                      ))}
                    </div>
                    <div className="mt-5 grid gap-2">
                      {(answer.places || []).map((place) => (
                        <button key={`${place.id}-${place.name}`} type="button" onClick={openMap} className="dp-agent-place">
                          <span>
                            <strong>{place.name}</strong>
                            <small>{place.reason}</small>
                          </span>
                          <ArrowRight className="h-4 w-4 text-[#BFA46A]" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="max-w-2xl text-[14px] leading-7 text-[#0B1F33]/68">
                      Choose who you are asking for, narrow the district or layer if helpful, then ask what is nearby, useful, active, or worth doing next.
                    </p>
                    {error && <p className="mt-3 text-[13px] text-red-700">{error}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button type="button" onClick={submit} disabled={status === "loading"} className="gap-2">
                  <WandSparkles className="h-4 w-4 text-[#BFA46A]" />
                  Run agent
                </Button>
                <Button type="button" variant="outline" onClick={openMap} className="gap-2">
                  Open on map
                  <Navigation className="h-4 w-4 text-[#BFA46A]" />
                </Button>
              </div>

              <div className="mt-4 text-[11px] font-semibold tracking-[0.08em] text-[#0B1F33]/42">
                Source: {sourceLabel}{answer?.model ? ` · ${answer.model}` : ""}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <article key={role.title} className="dp-glass-card p-5">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center bg-[#0B1F33] text-[#BFA46A] shadow-[0_0_24px_rgba(191,164,106,0.12)]">
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

      <section className="border-t border-[#0B1F33]/8 px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link to="/map?mode=resident&tab=map">
              Open the Map <MapPin className="h-4 w-4 text-[#BFA46A]" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/happy-hour-walking-map">
              Happy hour walking map <Sparkles className="h-4 w-4 text-[#BFA46A]" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
