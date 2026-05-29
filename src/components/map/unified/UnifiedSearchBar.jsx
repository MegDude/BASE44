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
  const [promptIndex, setPromptIndex] = useState(0);
  const inputRef = useRef(null);
  const activePrompt = SEARCH_PROMPTS[promptIndex % SEARCH_PROMPTS.length];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPromptIndex((index) => (index + 1) % SEARCH_PROMPTS.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

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
      className="relative z-[1300] w-full max-w-4xl mx-auto px-4 md:px-5"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Search container */}
      <div className="relative">
        <div className="dp-glass flex items-center gap-2 px-3 py-2.5 transition-all focus-within:border-[#B38F4F]/60 focus-within:bg-white/64 md:px-4 md:py-2.5">
          <Search className="w-4 h-4 text-[#0B1F33]/50 shrink-0" />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => setTimeout(() => setIsExpanded(false), 200)}
            placeholder={activePrompt.q}
            className="flex-1 bg-transparent outline-none text-[13px] md:text-[14px] text-[#0B1F33] placeholder:text-[#0B1F33]/42"
          />

          <AnimatePresence mode="wait" initial={false}>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="text-[#0B1F33]/58 hover:text-[#0B1F33] transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* AI trigger button */}
          <button
            onClick={handleAISearch}
            disabled={!isAI || aiLoading}
            className={`p-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] ${
              isAI && !aiLoading
                ? 'bg-white/82 text-[#B38F4F] shadow-[0_0_0_1px_rgba(179,143,79,0.18),0_10px_24px_rgba(11,31,51,0.06)] hover:text-[#B38F4F] hover:shadow-[0_0_0_1px_rgba(179,143,79,0.28),0_12px_30px_rgba(11,31,51,0.08)]'
                : 'bg-white/58 text-[#B38F4F] opacity-80 shadow-[0_0_0_1px_rgba(179,143,79,0.10)]'
            }`}
            title="Ask the Map AI"
          >
            {aiLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-[#B38F4F] animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Intent prompts dropdown */}
        <AnimatePresence mode="wait" initial={false}>
          {isExpanded && !query && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="dp-glass-card absolute left-0 right-0 top-full z-[1400] mt-2 max-h-[min(420px,calc(100vh-150px))] overflow-y-auto bg-white/94 shadow-[0_24px_70px_rgba(11,31,51,0.16),0_0_0_1px_rgba(179,143,79,0.10)]"
            >
              {SEARCH_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handlePromptClick(prompt.fill)}
                  className="w-full text-left px-4 py-2.5 hover:bg-white/50 transition-colors border-b border-white/44 last:border-0"
                >
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-[#B38F4F] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#0B1F33] mb-0.5">
                        {prompt.q}
                      </div>
                      <div className="text-xs text-[#0B1F33]/58 leading-relaxed">
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
