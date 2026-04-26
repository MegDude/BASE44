/**
 * Resident App — Full resident experience
 * Tab-based navigation with map, perks, saved, and card
 * Mobile-first, premium polish
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Star, Bookmark, CreditCard, Calendar, Search, MapPin, Clock, ChevronRight, X, Check, QrCode } from 'lucide-react';
import UnifiedMapShell from '@/components/map/unified/UnifiedMapShell';
import UnifiedDrawer from '@/components/map/unified/UnifiedDrawer';
import { rankMapEntities } from '@/lib/map/rankMapEntities';

const TABS = [
  { id: 'map', label: 'Map', icon: Map },
  { id: 'perks', label: 'Perks', icon: Star },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'card', label: 'Card', icon: CreditCard },
];

const SAMPLE_PERKS = [
  { id: '1', name: 'Merit Coffee', category: 'Coffee', perk: '15% off espresso', distance: '0.2 mi', walkTime: '4 min', location: { latitude: 30.2672, longitude: -97.7431 }, isOpen: true, hasPerk: true },
  { id: '2', name: 'Easy Tiger', category: 'Dining', perk: 'Free pretzel with drink', distance: '0.1 mi', walkTime: '2 min', location: { latitude: 30.2654, longitude: -97.7420 }, isOpen: true, hasPerk: true },
  { id: '3', name: 'The LINE Hotel', category: 'Hotel', perk: '20% off spa', distance: '0.3 mi', walkTime: '6 min', location: { latitude: 30.2648, longitude: -97.7452 }, isOpen: true, hasPerk: true },
  { id: '4', name: 'Fareground', category: 'Dining', perk: '10% off any vendor', distance: '0.2 mi', walkTime: '4 min', location: { latitude: 30.2668, longitude: -97.7445 }, isOpen: true, hasPerk: true },
  { id: '5', name: 'Wanderlust Yoga', category: 'Wellness', perk: 'First class free', distance: '0.5 mi', walkTime: '10 min', location: { latitude: 30.2690, longitude: -97.7480 }, isOpen: true, hasPerk: true },
];

const SAMPLE_SAVED = [
  { id: '1', name: 'Merit Coffee', category: 'Coffee', savedAt: 'Today' },
  { id: '4', name: 'Fareground', category: 'Dining', savedAt: 'Yesterday' },
];

export default function ResidentApp() {
  const [activeTab, setActiveTab] = useState('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [mapCenter, setMapCenter] = useState([30.267, -97.743]);
  const [mapZoom, setMapZoom] = useState(15);
  const [showQR, setShowQR] = useState(false);

  // Ranked perks
  const displayResults = useMemo(() => {
    return rankMapEntities(SAMPLE_PERKS, { intent: searchQuery, maxResults: 30 });
  }, [searchQuery]);

  // Close drawer
  const closeDrawer = useCallback(() => {
    setSelectedEntity(null);
  }, []);

  return (
    <div className="fixed inset-0 bg-surface flex flex-col">
      {/* Content area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Map Tab */}
          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {/* Map */}
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

              {/* Search overlay */}
              <div className="absolute top-0 left-0 right-0 z-20 p-4 safe-top">
                <div className="dp-glass dp-shadow-lg rounded-2xl">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Search className="w-5 h-5 text-[var(--dp-navy-muted)]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search places, perks, events..."
                      className="flex-1 bg-transparent text-[var(--dp-navy)] placeholder:text-[var(--dp-navy-muted)] text-base outline-none"
                      style={{ fontSize: '16px' }}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="dp-close w-7 h-7">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Drawer */}
              <AnimatePresence>
                {selectedEntity && (
                  <UnifiedDrawer entity={selectedEntity} onClose={closeDrawer} />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Perks Tab */}
          {activeTab === 'perks' && (
            <motion.div
              key="perks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto dp-scrollbar"
            >
              <div className="p-4 pt-6 safe-top">
                <h1 className="dp-h2 text-navy mb-1">Your Perks</h1>
                <p className="dp-body mb-6">Show your card. Get the deal.</p>

                <div className="space-y-2">
                  {displayResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedEntity(item);
                        setActiveTab('map');
                      }}
                      className="w-full dp-result-row bg-white rounded-xl dp-shadow text-left"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gold-soft flex items-center justify-center shrink-0">
                        <Star className="w-5 h-5 text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-navy line-clamp-1">{item.name}</p>
                        <p className="text-sm text-gold font-medium">{item.perk}</p>
                        <div className="flex items-center gap-2 text-xs text-navy-muted mt-0.5">
                          <span>{item.category}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.walkTime}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-navy-muted shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Saved Tab */}
          {activeTab === 'saved' && (
            <motion.div
              key="saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto dp-scrollbar"
            >
              <div className="p-4 pt-6 safe-top">
                <h1 className="dp-h2 text-navy mb-1">Saved</h1>
                <p className="dp-body mb-6">Places and events you&apos;ve bookmarked.</p>

                {SAMPLE_SAVED.length > 0 ? (
                  <div className="space-y-2">
                    {SAMPLE_SAVED.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          const fullItem = SAMPLE_PERKS.find(p => p.id === item.id);
                          if (fullItem) {
                            setSelectedEntity(fullItem);
                            setActiveTab('map');
                          }
                        }}
                        className="w-full dp-result-row bg-white rounded-xl dp-shadow text-left"
                      >
                        <div className="w-12 h-12 rounded-xl bg-surface-subtle flex items-center justify-center shrink-0">
                          <Bookmark className="w-5 h-5 text-navy" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-navy">{item.name}</p>
                          <p className="text-sm text-navy-muted">{item.category}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-navy-muted">{item.savedAt}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bookmark className="w-12 h-12 text-navy-muted mx-auto mb-3" />
                    <p className="text-navy-muted">Nothing saved yet.</p>
                    <p className="text-sm text-navy-muted">Tap the save icon on any place to add it here.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Card Tab */}
          {activeTab === 'card' && (
            <motion.div
              key="card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto dp-scrollbar"
            >
              <div className="p-4 pt-6 safe-top">
                <h1 className="dp-h2 text-navy mb-1">Your Perks Card</h1>
                <p className="dp-body mb-6">Show this at participating venues.</p>

                {/* Card */}
                <div className="bg-navy rounded-3xl p-6 dp-shadow-lg mb-6">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <p className="text-gold text-sm font-medium mb-1">Downtown Perks</p>
                      <p className="text-on-dark text-lg font-semibold">Resident Card</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gold-soft flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-gold" />
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-on-dark-muted text-xs mb-0.5">Member since</p>
                      <p className="text-on-dark font-medium">April 2026</p>
                    </div>
                    <button
                      onClick={() => setShowQR(true)}
                      className="dp-btn-gold text-sm"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Show QR</span>
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-white rounded-xl p-4 dp-shadow text-center">
                    <p className="text-2xl font-bold text-navy">12</p>
                    <p className="text-xs text-navy-muted">Perks used</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 dp-shadow text-center">
                    <p className="text-2xl font-bold text-gold">$48</p>
                    <p className="text-xs text-navy-muted">Saved</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 dp-shadow text-center">
                    <p className="text-2xl font-bold text-navy">5</p>
                    <p className="text-xs text-navy-muted">Places</p>
                  </div>
                </div>

                {/* How to use */}
                <div className="bg-surface-subtle rounded-2xl p-4">
                  <h3 className="font-semibold text-navy mb-3">How to redeem</h3>
                  <div className="space-y-3">
                    {[
                      { step: '1', text: 'Find a perk on the map' },
                      { step: '2', text: 'Walk in and mention Downtown Perks' },
                      { step: '3', text: 'Show your QR code when asked' },
                      { step: '4', text: 'Enjoy your perk' },
                    ].map((item) => (
                      <div key={item.step} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gold-soft text-gold text-xs font-semibold flex items-center justify-center">
                          {item.step}
                        </div>
                        <span className="text-sm text-navy-muted">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom tabs */}
      <div className="shrink-0 dp-glass border-t border-[var(--dp-divider)] safe-bottom">
        <div className="flex">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 dp-touch flex flex-col items-center gap-1 py-3 transition-colors ${
                  isActive ? 'text-gold' : 'text-navy-muted'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl p-8 text-center max-w-xs w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 dp-close"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-48 h-48 bg-surface-subtle rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <QrCode className="w-24 h-24 text-navy" />
              </div>
              
              <p className="font-semibold text-navy mb-1">Your Perks Card</p>
              <p className="text-sm text-navy-muted">Show this code at participating venues</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
