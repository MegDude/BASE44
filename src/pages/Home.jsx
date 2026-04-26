/**
 * Home — Map-first pinned experience
 * The map IS the product. Everything revolves around it.
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Star, ChevronDown, ChevronUp, X, ArrowRight, Sparkles, Clock, Building2, Utensils, Music, Heart, Users } from 'lucide-react';
import UnifiedMapShell from '@/components/map/unified/UnifiedMapShell';
import UnifiedDrawer from '@/components/map/unified/UnifiedDrawer';
import { rankMapEntities } from '@/lib/map/rankMapEntities';

const CATEGORY_CHIPS = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'coffee', label: 'Coffee', icon: Utensils },
  { id: 'dining', label: 'Dining', icon: Utensils },
  { id: 'nightlife', label: 'Nightlife', icon: Music },
  { id: 'wellness', label: 'Wellness', icon: Heart },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'properties', label: 'Properties', icon: Building2 },
];

const SAMPLE_PLACES = [
  { id: '1', name: 'Merit Coffee', category: 'Coffee', perk: '15% off espresso', distance: '0.2 mi', walkTime: '4 min', location: { latitude: 30.2672, longitude: -97.7431 }, isOpen: true, hasPerk: true },
  { id: '2', name: 'Easy Tiger', category: 'Dining', perk: 'Free pretzel with drink', distance: '0.1 mi', walkTime: '2 min', location: { latitude: 30.2654, longitude: -97.7420 }, isOpen: true, hasPerk: true },
  { id: '3', name: 'The LINE Hotel', category: 'Hotel', perk: '20% off spa', distance: '0.3 mi', walkTime: '6 min', location: { latitude: 30.2648, longitude: -97.7452 }, isOpen: true, hasPerk: true },
  { id: '4', name: 'Fareground', category: 'Dining', perk: '10% off any vendor', distance: '0.2 mi', walkTime: '4 min', location: { latitude: 30.2668, longitude: -97.7445 }, isOpen: true, hasPerk: true },
  { id: '5', name: 'Wanderlust Yoga', category: 'Wellness', perk: 'First class free', distance: '0.5 mi', walkTime: '10 min', location: { latitude: 30.2690, longitude: -97.7480 }, isOpen: true, hasPerk: true },
  { id: '6', name: "Jo's Coffee", category: 'Coffee', perk: '10% off', distance: '0.4 mi', walkTime: '8 min', location: { latitude: 30.2625, longitude: -97.7500 }, isOpen: true, hasPerk: true },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [mapCenter, setMapCenter] = useState([30.267, -97.743]);
  const [mapZoom, setMapZoom] = useState(15);
  const searchRef = useRef(null);

  // Rank and filter results
  const displayResults = useMemo(() => {
    let filtered = SAMPLE_PLACES;
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase().includes(activeCategory));
    }
    return rankMapEntities(filtered, { intent: searchQuery, maxResults: 30 });
  }, [searchQuery, activeCategory]);

  // Handle search submit
  const handleSearch = useCallback((e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(true);
    }
  }, [searchQuery]);

  // Close drawer
  const closeDrawer = useCallback(() => {
    setSelectedEntity(null);
  }, []);

  // Close results
  const closeResults = useCallback(() => {
    setShowResults(false);
  }, []);

  return (
    <div className="fixed inset-0 bg-surface">
      {/* Map - Pinned full screen */}
      <div className="absolute inset-0">
        <UnifiedMapShell
          items={displayResults}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          selectedId={selectedEntity?.id}
          onMarkerSelect={setSelectedEntity}
          onMapCenterChange={setMapCenter}
          onMapZoomChange={setMapZoom}
          className="w-full h-full"
        />
      </div>

      {/* Top Controls - Glass overlay */}
      <div className="absolute top-0 left-0 right-0 z-30 safe-top">
        {/* Search Bar */}
        <div className="px-4 pt-4 pb-2">
          <form onSubmit={handleSearch} className="relative">
            <div className={`dp-glass dp-shadow-lg rounded-2xl transition-all duration-300 ${searchFocused ? 'ring-2 ring-[var(--dp-gold)]' : ''}`}>
              <div className="flex items-center gap-3 px-4 py-3">
                <Sparkles className="w-5 h-5 text-[var(--dp-gold)] shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Where do you want to go? What do you want to do?"
                  className="flex-1 bg-transparent text-[var(--dp-navy)] placeholder:text-[var(--dp-navy-muted)] placeholder:opacity-70 text-base outline-none"
                  style={{ fontSize: '16px' }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="dp-close w-7 h-7"
                  >
                    <X className="w-4 h-4 text-[var(--dp-navy-muted)]" />
                  </button>
                )}
                <button
                  type="submit"
                  className="dp-btn-gold px-3 py-2 text-sm"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Category Chips */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto dp-scroll-hidden py-1">
            {CATEGORY_CHIPS.map((chip) => {
              const Icon = chip.icon;
              const isActive = activeCategory === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setActiveCategory(chip.id)}
                  className={`dp-touch flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-[var(--dp-navy)] text-white'
                      : 'dp-glass text-[var(--dp-navy)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Panel - Collapsible from bottom */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-40 dp-glass rounded-t-3xl dp-shadow-lg max-h-[60vh] safe-bottom"
          >
            {/* Handle + Close */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-[var(--dp-navy-muted)] opacity-30 mx-auto" />
              <button onClick={closeResults} className="absolute right-4 top-3 dp-close">
                <X className="w-4 h-4 text-[var(--dp-navy-muted)]" />
              </button>
            </div>

            {/* Results Header */}
            <div className="px-4 pb-2">
              <p className="text-sm text-[var(--dp-navy-muted)]">
                {displayResults.length} result{displayResults.length !== 1 ? 's' : ''} nearby
              </p>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto max-h-[calc(60vh-80px)] dp-scrollbar pb-safe">
              {displayResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedEntity(item);
                    setShowResults(false);
                  }}
                  className="dp-result-row w-full text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--dp-surface-subtle)] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[var(--dp-navy)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--dp-navy)] line-clamp-1">{item.name}</span>
                      {item.hasPerk && (
                        <span className="dp-badge text-xs">Perk</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--dp-navy-muted)]">
                      <span>{item.category}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {item.walkTime}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[var(--dp-navy-muted)] -rotate-90" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Entity Drawer */}
      <AnimatePresence>
        {selectedEntity && (
          <UnifiedDrawer
            entity={selectedEntity}
            onClose={closeDrawer}
          />
        )}
      </AnimatePresence>

      {/* Bottom Quick Actions - Only when nothing selected */}
      {!selectedEntity && !showResults && (
        <div className="absolute bottom-6 left-4 right-4 z-30 safe-bottom">
          <div className="flex gap-3">
            <button
              onClick={() => setShowResults(true)}
              className="flex-1 dp-btn-primary dp-shadow-lg py-4 rounded-xl"
            >
              <MapPin className="w-5 h-5" />
              <span>See Results</span>
              <span className="dp-badge ml-1">{displayResults.length}</span>
            </button>
            <Link
              to="/card"
              className="dp-btn-gold dp-shadow-lg py-4 px-5 rounded-xl"
            >
              <Star className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}

      {/* Floating "Ask the Map" prompt - Show when search is empty */}
      {!searchQuery && !selectedEntity && !showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-32 left-4 right-4 z-20"
        >
          <button
            onClick={() => searchRef.current?.focus()}
            className="w-full dp-glass dp-shadow rounded-2xl p-4 text-left group dp-interactive"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--dp-gold-soft)] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[var(--dp-gold)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--dp-navy)] mb-0.5">Ask the Map</p>
                <p className="text-sm text-[var(--dp-navy-muted)]">
                  Coffee nearby? Dinner tonight? What&apos;s happening now?
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-[var(--dp-gold)] shrink-0 mt-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </motion.div>
      )}
    </div>
  );
}
