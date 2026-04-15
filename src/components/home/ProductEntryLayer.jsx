import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PROMPT_CHIPS = [
  "coffee right now",
  "dinner tonight on Rainey",
  "happy hour nearby",
  "quiet place to work",
];

export default function ProductEntryLayer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handlePromptClick = (prompt) => {
    navigate(`/downtown-perks/explore?q=${encodeURIComponent(prompt)}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/downtown-perks/explore?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
  };

  return (
    <section className="relative pt-[68px] pb-12 bg-background overflow-hidden">
      {/* Background gradient accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 space-y-12">
        {/* Headline + Search */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          <div className="space-y-4">
            <h1 className="font-heading text-5xl md:text-6xl font-medium leading-[1.05] tracking-tight text-foreground">
              The operating system for downtown life.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Open one map. See what's happening. Go.
            </p>
          </div>

          {/* Ask the Map Search */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center"
          >
            <div
              className={`relative w-full max-w-2xl transition-all duration-300 ${
                isFocused ? "scale-105" : ""
              }`}
            >
              <div
                className={`flex items-center gap-3 px-6 py-4 rounded-full border-2 transition-all ${
                  isFocused
                    ? "border-primary bg-white shadow-lg shadow-primary/20"
                    : "border-border/40 bg-white/50 backdrop-blur-sm hover:border-border/60"
                }`}
              >
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Ask the map..."
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60 text-base"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          </motion.form>

          {/* Prompt Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 pt-4"
          >
            {PROMPT_CHIPS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handlePromptClick(prompt)}
                className="px-4 py-2 rounded-full border border-border/40 bg-white hover:border-primary/50 hover:bg-primary/5 text-foreground text-sm font-medium transition-all duration-200"
              >
                {prompt}
              </button>
            ))}
          </motion.div>
        </motion.div>



        {/* Selected Nearby Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Selected Nearby</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: "Café Noir",
                distance: "0.2 mi away",
                line: "Espresso bar with cold brew focus",
                perk: "15% off on card",
              },
              {
                name: "Rainey Rooftop",
                distance: "0.1 mi away",
                line: "Live music venue & cocktail lounge",
                perk: "Free appetizer with 2 drinks",
              },
              {
                name: "Yoga Haven",
                distance: "0.3 mi away",
                line: "Yoga studio with drop-in classes",
                perk: "First class free",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-border/40 bg-white hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{card.name}</h4>
                    <p className="text-xs text-muted-foreground">{card.distance}</p>
                  </div>
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground mb-3">{card.line}</p>
                {card.perk && (
                  <div className="inline-block text-[10px] font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {card.perk}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Proof Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-3 gap-6 py-8 border-t border-b border-border/20"
        >
          {[
            { label: "Saves this week", value: "180k+" },
            { label: "Perks redeemed", value: "42k+" },
            { label: "Avg walk distance", value: "0.3 mi" },
          ].map((metric, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                {metric.value}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">{metric.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Primary CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap gap-3 justify-center pt-4"
        >
          <button onClick={() => navigate("/downtown-perks/card")} className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm">
            Get Your Card
          </button>
          <button onClick={() => navigate("/downtown-perks/explore")} className="px-8 py-3 rounded-full border border-border/70 text-foreground font-medium text-sm hover:border-border hover:bg-muted/50 transition-colors">
            Explore the Map
          </button>
        </motion.div>
      </div>
    </section>
  );
}