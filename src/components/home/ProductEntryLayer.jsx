import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PROMPT_CHIPS = [
  "coffee right now",
  "dinner tonight on Rainey",
  "happy hour nearby",
  "quiet place to work",
];

const NEARBY_CARDS = [
  {
    name: "Café Noir",
    distance: "0.2 mi away",
    line: "Espresso bar with cold brew focus",
    perk: "15% off on card",
  },
  {
    name: "Rainey Rooftop",
    distance: "0.1 mi away",
    line: "Live music venue and cocktail lounge",
    perk: "Free appetizer with 2 drinks",
  },
  {
    name: "Yoga Haven",
    distance: "0.3 mi away",
    line: "Yoga studio with drop-in classes",
    perk: "First class free",
  },
];

const PROOF_METRICS = [
  { label: "Saves this week", value: "180k+" },
  { label: "Perks redeemed", value: "42k+" },
  { label: "Avg walk distance", value: "0.3 mi" },
];

export default function ProductEntryLayer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handlePromptClick = (prompt) => {
    navigate(`/map?mode=resident&tab=map&q=${encodeURIComponent(prompt)}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/map?mode=resident&tab=map&q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
  };

  return (
    <section className="relative overflow-hidden bg-[#F7F8FB] pt-[68px] pb-12">
      <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-[#0B1F33]/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-[#0B1F33]/[0.035] blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="text-center"
        >
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#425466]">
              Live downtown context
            </p>

            <h2 className="font-heading text-4xl font-medium leading-[1.02] tracking-normal text-[#0B1F33] md:text-[56px]">
              The operating system for downtown life.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-[#425466]">
              Open one map. See what is nearby. Decide faster and go.
            </p>
          </div>

          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-8 flex justify-center"
          >
            <div
              className={`relative w-full max-w-2xl transition-all duration-200 ${
                isFocused ? "translate-y-[-1px]" : ""
              }`}
            >
              <div
                className={`flex items-center gap-3 rounded-[20px] border px-5 py-4 transition-all ${
                  isFocused
                    ? "border-[#0B1F33]/10 bg-white shadow-[0_18px_40px_rgba(11,31,51,0.06)]"
                    : "border-[#0B1F33]/8 bg-white/88 shadow-[0_10px_24px_rgba(11,31,51,0.04)]"
                }`}
              >
                <Search className="h-5 w-5 text-[#425466]/72" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Ask the map..."
                  className="flex-1 bg-transparent text-[15px] text-[#0B1F33] outline-none placeholder:text-[#425466]/58"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="rounded-full p-1 transition-colors hover:bg-[#F7F8FB]"
                  >
                    <X className="h-4 w-4 text-[#425466]/72" />
                  </button>
                )}
              </div>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.14 }}
            className="flex flex-wrap justify-center gap-2.5 pt-5"
          >
            {PROMPT_CHIPS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handlePromptClick(prompt)}
                className="rounded-full border border-[#0B1F33]/8 bg-white px-4 py-2 text-[13px] font-medium text-[#0B1F33] transition-all duration-200 hover:border-[#0B1F33]/10 hover:bg-[#0B1F33]/[0.04]"
              >
                {prompt}
              </button>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-[13px] font-medium text-[#425466]">Selected nearby</h3>
            <button
              onClick={() => navigate("/map?mode=resident&tab=map")}
              className="inline-flex items-center gap-1 text-[13px] font-medium text-[#0B1F33] transition-opacity hover:opacity-70"
            >
              Open the Map
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {NEARBY_CARDS.map((card) => (
              <button
                key={card.name}
                onClick={() => navigate("/map?mode=resident&tab=map")}
                className="rounded-[16px] border border-[#0B1F33]/8 bg-white p-4 text-left shadow-[0_12px_40px_rgba(11,31,51,0.04)] transition-all duration-200 hover:-translate-y-[1px] hover:border-[#0B1F33]/10 hover:shadow-[0_16px_42px_rgba(11,31,51,0.06)]"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-[13px] font-semibold text-[#0B1F33]">{card.name}</h4>
                    <p className="text-xs text-[#425466]/72">{card.distance}</p>
                  </div>
                  <MapPin className="h-4 w-4 shrink-0 text-[#B38F4F]" />
                </div>

                <p className="mb-3 text-xs leading-5 text-[#425466]">{card.line}</p>

                {card.perk && (
                  <div className="inline-flex rounded-full bg-[#0B1F33]/[0.08] px-2.5 py-1 text-[10px] font-medium text-[#0B1F33]">
                    {card.perk}
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="mt-10 grid grid-cols-3 gap-4 border-y border-[#0B1F33]/8 py-7"
        >
          {PROOF_METRICS.map((metric) => (
            <div key={metric.label} className="text-center">
              <div className="text-2xl font-bold text-[#0B1F33] md:text-3xl">{metric.value}</div>
              <div className="mt-1 text-xs text-[#425466]/72 md:text-[13px]">{metric.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.32 }}
          className="flex flex-wrap justify-center gap-3 pt-8"
        >
          <button
            onClick={() => navigate("/downtown-perks/card")}
            className="rounded-[12px] bg-[#0B1F33] px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_12px_30px_rgba(11,31,51,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#081521] hover:shadow-[0_16px_34px_rgba(11,31,51,0.12)]"
          >
            Get Your Card
          </button>

          <button
            onClick={() => navigate("/map?mode=resident&tab=map")}
            className="rounded-[12px] border border-[#0B1F33]/8 bg-white px-5 py-2.5 text-[13px] font-medium text-[#0B1F33] transition-all duration-200 hover:bg-[#F7F8FB]"
          >
            Explore the Map
          </button>
        </motion.div>
      </div>
    </section>
  );
}
