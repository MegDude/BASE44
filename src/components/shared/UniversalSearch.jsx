import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { SURFACES } from "@/lib/design-system";

/**
 * UniversalSearch — Canonical search bar used across homepage, map, and discovery surfaces
 * Features: minimal design, optional AI ask mode, consistent across all contexts
 */
export default function UniversalSearch({
  placeholder = "Search places, events, offers...",
  onSearch,
  onAsk,
  allowAsk = true,
  loading = false,
  variant = "light", // light | glass | dark
}) {
  const [query, setQuery] = useState("");
  const [showAsk, setShowAsk] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch?.(query);
    }
  };

  const handleAsk = () => {
    if (query.trim()) {
      onAsk?.(query);
      setShowAsk(false);
    }
  };

  const variants = {
    light: "bg-white border border-border/40",
    glass: SURFACES.glassLight,
    dark: SURFACES.glassDark,
  };

  const variantClass = variants[variant];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className={`${variantClass} rounded-full px-5 py-2.5 flex items-center gap-3 w-full`}>
        <Search className={`w-5 h-5 ${variant === "dark" ? "text-white/50" : "text-muted-foreground"}`} />
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={placeholder}
          className={`flex-1 bg-transparent text-[14px] outline-none ${
            variant === "dark" ? "text-white placeholder:text-white/40" : "placeholder:text-muted-foreground"
          }`}
        />

        {allowAsk && (
          <button
            onClick={handleAsk}
            disabled={loading || !query.trim()}
            className="px-3 py-1 text-[12px] font-medium text-primary/70 hover:text-primary transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ask"}
          </button>
        )}

        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </button>
      </div>
    </motion.div>
  );
}