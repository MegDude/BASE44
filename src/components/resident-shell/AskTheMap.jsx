import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Ask-the-Map Component
 * Natural language spatial search for Downtown Perks
 * Converts user queries into map filters and entity searches
 */

export default function AskTheMap({ onSearch, isLoading = false }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Quick suggestion categories
  const quickSuggestions = [
    "happy hour now",
    "best dining nearby",
    "live music tonight",
    "fitness classes",
    "rooftop bars",
    "walking distance",
  ];

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setShowSuggestions(false);
    onSearch(q);
    setQuery("");
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) {
      // Filter suggestions based on input
      const filtered = quickSuggestions.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="relative">
        <motion.div
          className="flex items-center gap-3 px-5 py-3 bg-white/82 backdrop-blur-xl rounded-full border border-white/40 shadow-[0_20px_60px_rgba(17,31,61,0.12)]"
          whileFocus={{ scale: 1.02 }}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-[#111f3d] animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-[#111f3d]" />
          )}
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(query.length > 0)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Ask the map what to do..."
            className="flex-1 bg-transparent text-[#111f3d] placeholder-[#111f3d]/50 outline-none font-inter text-[14px]"
          />
        </motion.div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-white/88 backdrop-blur-md rounded-[16px] border border-white/40 shadow-[0_20px_60px_rgba(17,31,61,0.08)] p-2 z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {suggestions.map((suggestion) => (
              <motion.button
                key={suggestion}
                onClick={() => handleSearch(suggestion)}
                className="w-full text-left px-4 py-3 text-[13px] font-inter text-[#111f3d] hover:bg-[#111f3d]/8 rounded-[12px] transition-colors"
                whileHover={{ x: 4 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Quick suggestions fallback */}
      {!showSuggestions && !query && (
        <motion.div
          className="mt-4 flex flex-wrap gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {quickSuggestions.slice(0, 3).map((suggestion) => (
            <motion.button
              key={suggestion}
              onClick={() => handleSearch(suggestion)}
              className="rounded-full px-3 py-2 bg-white/72 backdrop-blur-md border border-white/40 hover:bg-white/85 transition-all text-[11px] font-inter font-medium uppercase tracking-[0.12em] text-[#111f3d]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {suggestion}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
