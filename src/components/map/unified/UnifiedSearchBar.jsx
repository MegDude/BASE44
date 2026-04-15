/**
 * UnifiedSearchBar — Smart search with Ask the Map AI
 * Mobile-first responsive, always visible, controls entire map
 */

import { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUnifiedMapStore } from '@/store/unified-map-store';
import { SEARCH_PROMPTS } from '@/lib/mapSystemConstants';
import { base44 } from '@/api/base44Client';

export default function UnifiedSearchBar() {
  const { query, setQuery, setFilters, setResults } = useUnifiedMapStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAI, setIsAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const inputRef = useRef(null);

  // Detect if query looks like an AI intent
  useEffect(() => {
    const hasNaturalLanguage =
      query.length > 3 &&
      !query.match(/^[a-z\s,]+$/) &&
      (query.includes(' ') || query.includes('?'));
    setIsAI(hasNaturalLanguage);
  }, [query]);

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && query.trim()) {
      if (isAI) {
        await handleAISearch();
      }
    }
  };

  const handleAISearch = async () => {
    setAiLoading(true);
    try {
      const intentResponse = await base44.functions.invoke('searchMapIntent', {
        query,
        context: { time: new Date(), location: 'downtown' },
      });

      if (intentResponse.data?.categories) {
        const newFilters = {};
        intentResponse.data.categories.forEach((cat) => {
          const catKey = cat.toLowerCase().replace(' ', '-');
          newFilters[catKey] = true;
        });
        setFilters(newFilters);
      }
    } catch (error) {
      console.error('AI search failed:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handlePromptClick = (fill) => {
    setQuery(fill);
    setIsExpanded(false);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto px-4 md:px-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Search container */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-xl border border-black/8 rounded-xl md:rounded-2xl shadow-sm px-3 md:px-4 py-2.5 md:py-3 focus-within:ring-1 focus-within:ring-primary/30 transition-all">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => setTimeout(() => setIsExpanded(false), 200)}
            placeholder="Search, ask, or explore..."
            className="flex-1 bg-transparent outline-none text-sm md:text-base text-foreground placeholder:text-muted-foreground"
          />

          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* AI trigger button */}
          <button
            onClick={handleAISearch}
            disabled={!isAI || aiLoading}
            className={`p-2 rounded-lg transition-all ${
              isAI && !aiLoading
                ? 'bg-primary/10 hover:bg-primary/20 text-primary'
                : 'text-muted-foreground opacity-50'
            }`}
            title="Ask the Map AI"
          >
            {aiLoading ? (
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Intent prompts dropdown */}
        <AnimatePresence>
          {isExpanded && !query && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-black/8 rounded-xl shadow-lg overflow-hidden"
            >
              {SEARCH_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handlePromptClick(prompt.fill)}
                  className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
                >
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-primary mb-0.5">
                        {prompt.q}
                      </div>
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        {prompt.a}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}