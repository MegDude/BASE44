import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Coffee, MapPin, Navigation2, Search, Sparkles, Utensils, Waves } from "lucide-react";

const quickSearches = ["coffee near Seaholm", "dinner near Rainey", "live music tonight", "walkable perks"];

const mapPins = [
  { id: "stay-put", label: "Stay Put", type: "Live now", top: "34%", left: "57%", icon: Utensils, pulse: true },
  { id: "merit", label: "Merit", type: "Coffee", top: "22%", left: "31%", icon: Coffee },
  { id: "trail", label: "Trail", type: "Outdoor", top: "67%", left: "40%", icon: Waves },
  { id: "tonight", label: "Tonight", type: "Event", top: "48%", left: "74%", icon: CalendarDays },
];

const liveFeed = [
  "42 residents looking nearby",
  "7 offers active within a 10 min walk",
  "Stay Put trending after 5 PM",
];

function AnimatedMapPreview() {
  const [activePin, setActivePin] = useState(mapPins[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-[520px] overflow-hidden rounded-[32px] border border-[#10243f]/12 bg-[#f9f4e8] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_34px_100px_rgba(7,28,47,0.18)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(198,149,50,0.18),transparent_26%),radial-gradient(circle_at_75%_65%,rgba(40,95,72,0.12),transparent_30%),linear-gradient(135deg,#fffaf0,#eef0e8)]" />
      <motion.div
        className="absolute inset-8 rounded-[24px] border border-[#071c2f]/8 opacity-85"
        style={{ backgroundImage: "linear-gradient(rgba(7,28,47,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(7,28,47,0.07) 1px, transparent 1px)", backgroundSize: "48px 48px" }}
        animate={{ backgroundPosition: ["0px 0px", "48px 48px"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute left-[16%] top-[16%] h-[62%] w-[68%] rounded-full border border-[#c69532]/18 bg-[#c69532]/[0.04]" />
      <div className="absolute left-[28%] top-[31%] h-[36%] w-[42%] rounded-full border border-[#071c2f]/8 bg-white/20" />

      {mapPins.map((pin, index) => {
        const Icon = pin.icon;
        const active = activePin.id === pin.id;
        return (
          <motion.button
            key={pin.id}
            type="button"
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: active ? 1.08 : 1 }}
            transition={{ delay: 0.2 + index * 0.08, duration: 0.45 }}
            onClick={() => setActivePin(pin)}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ top: pin.top, left: pin.left }}
          >
            {pin.pulse ? <span className="absolute inset-0 rounded-full bg-[#c69532]/30 blur-xl animate-ping" /> : null}
            <span className={`relative flex h-14 w-14 items-center justify-center rounded-full border shadow-xl transition-all ${active ? "border-[#c69532] bg-[#071c2f] text-[#fff8e9]" : "border-[#071c2f]/10 bg-white/72 text-[#071c2f] backdrop-blur-md"}`}>
              <Icon className="h-5 w-5" />
            </span>
          </motion.button>
        );
      })}

      <motion.div
        layout
        className="absolute bottom-6 left-6 right-6 z-30 rounded-[24px] border border-[#071c2f]/10 bg-white/78 p-4 text-[#071c2f] shadow-[inset_0_1px_0_rgba(255,255,255,0.68),0_18px_45px_rgba(7,28,47,0.12)] backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a8751f]">Selected nearby</p>
            <h3 className="mt-1 text-3xl font-black leading-none tracking-[-0.06em]">{activePin.label}</h3>
            <p className="mt-2 text-sm text-[#071c2f]/62">{activePin.type} / 6 min walk / resident perk available</p>
          </div>
          <Navigation2 className="h-6 w-6 text-[#285f48]" />
        </div>
      </motion.div>

      <div className="absolute left-6 top-6 z-30 rounded-full border border-[#071c2f]/10 bg-white/68 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#071c2f] shadow-sm backdrop-blur-md">
        Live downtown layer
      </div>
      <div className="absolute right-6 top-6 z-30 hidden gap-2 sm:grid">
        {liveFeed.map((item, index) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.12 }}
            className="rounded-full border border-[#071c2f]/10 bg-white/64 px-3 py-2 text-xs font-bold text-[#071c2f]/72 shadow-sm backdrop-blur-md"
          >
            {item}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function HeroSection({ heroImage }) {
  const [query, setQuery] = useState("");
  const suggestedQuery = useMemo(() => query || quickSearches[0], [query]);

  function submitSearch(value = query) {
    const nextQuery = value.trim();
    window.location.href = nextQuery ? `/map?q=${encodeURIComponent(nextQuery)}` : "/map";
  }

  return (
    <section className="relative overflow-hidden bg-[#f7f1e4] px-5 pb-12 pt-[96px] md:px-8 md:pb-16 md:pt-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(198,149,50,0.18),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(7,28,47,0.10),transparent_28%)]" />
      <img src={heroImage} className="absolute inset-x-0 top-0 h-64 w-full object-cover opacity-[0.07] mix-blend-multiply" alt="Downtown Austin atmosphere" />

      <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#10243f]/12 bg-white/72 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#071c2f] shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#a8751f]" />
            Map-first resident layer
          </div>

          <h1 className="max-w-4xl text-6xl font-black leading-[0.82] tracking-[-0.085em] text-[#071c2f] md:text-8xl lg:text-[7.6rem]">
            Downtown, mapped around <em>you.</em>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-7 text-[#071c2f]/68">
            A live map for what is worth walking to right now: perks, events, venues, resident-only moments, and the signals partners need to keep the neighborhood moving.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
            className="mt-7 overflow-hidden rounded-full border border-[#10243f]/12 bg-white/78 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.64),0_16px_42px_rgba(7,28,47,0.10)] backdrop-blur-xl"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex min-h-14 flex-1 items-center gap-3 rounded-full bg-[#f7f1e4]/72 px-4">
                <Search className="h-4 w-4 text-[#a8751f]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Where should I go right now?"
                  className="w-full bg-transparent text-sm font-semibold text-[#071c2f] outline-none placeholder:text-[#071c2f]/52"
                />
              </label>
              <button className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#071c2f] px-5 text-sm font-black uppercase tracking-[0.12em] text-[#fff8e9] shadow-[0_14px_30px_rgba(7,28,47,0.18)] hover:-translate-y-0.5">
                Open map
                <ArrowRight className="h-4 w-4 text-[#c69532]" />
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickSearches.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => submitSearch(item)}
                className={`rounded-full border px-3 py-2 text-xs font-bold transition-all hover:-translate-y-0.5 ${suggestedQuery === item ? "border-[#c69532]/70 bg-[#c69532]/12 text-[#071c2f]" : "border-[#10243f]/10 bg-white/58 text-[#071c2f]/66"}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["3182", "map views"],
              ["712", "saves"],
              ["96", "redemptions"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-[20px] border border-[#10243f]/10 bg-white/60 p-4 backdrop-blur-md">
                <strong className="block text-2xl font-black tracking-[-0.05em] text-[#071c2f]">{value}</strong>
                <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.14em] text-[#071c2f]/48">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <AnimatedMapPreview />
      </div>
    </section>
  );
}
