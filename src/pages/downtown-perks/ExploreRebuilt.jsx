/**
 * Explore (Rebuilt) — Unified map system
 * Mobile-first, fully responsive, real-time search + filters + AI
 * Single source of truth for all map interactions
 */

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useUnifiedMapStore } from '@/store/unified-map-store';
import { filterValidMapItems, normalizeCoordinates } from '@/lib/mapCoordinates';
import { motion } from 'framer-motion';

import UnifiedMapShell from '@/components/map/unified/UnifiedMapShell';
import UnifiedSearchBar from '@/components/map/unified/UnifiedSearchBar';
import UnifiedFilterChips from '@/components/map/unified/UnifiedFilterChips';
import UnifiedDrawer from '@/components/map/unified/UnifiedDrawer';
import UnifiedResultsPanel from '@/components/map/unified/UnifiedResultsPanel';

import { CATEGORY_COLORS } from '@/lib/mapSystemConstants';
import L from 'leaflet';

// Marker icon factory
function createMarkerIcon(category, isSelected = false) {
  const color = CATEGORY_COLORS[category] || '#C8973A';

  if (isSelected) {
    return L.divIcon({
      className: '',
      html: `<div style="width:28px;height:28px;border-radius:6px;background:${color};border:2.5px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;"><div style="width:4px;height:4px;border-radius:50%;background:white"></div></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }

  return L.divIcon({
    className: '',
    html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px ${color}80"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

export default function ExploreRebuilt() {
  const [venues, setVenues] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    query,
    activeFilters,
    selectedId,
    drawerState,
    setResults,
    selectEntity,
  } = useUnifiedMapStore();

  // Load venue and building data
  useEffect(() => {
    Promise.all([
      base44.entities.Venue.list(),
      base44.entities.Building.list(),
    ])
      .then(([v, b]) => {
        const venues = filterValidMapItems(v || []).map(normalizeCoordinates);
        const buildings = filterValidMapItems(b || []).map(
          normalizeCoordinates
        );
        setVenues(venues);
        setBuildings(buildings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter and search logic
  const allItems = [
    ...venues.map((v) => ({ ...v, _type: 'venue' })),
    ...buildings.map((b) => ({ ...b, _type: 'building' })),
  ];

  const filtered = allItems.filter((item) => {
    // Category filter
    const hasCategory =
      (activeFilters.places && item._type === 'venue') ||
      (activeFilters.buildings && item._type === 'building') ||
      (!activeFilters.places && !activeFilters.buildings);

    if (!hasCategory) return false;

    // Search query
    if (query.trim()) {
      const searchText = `${item.name} ${item.category || ''} ${item.address || ''}`.toLowerCase();
      if (!searchText.includes(query.toLowerCase())) return false;
    }

    return true;
  });

  // Sync results to store
  useEffect(() => {
    setResults(filtered);
  }, [filtered, setResults]);

  const selected = filtered.find((item) => item.id === selectedId);

  const handleMarkerSelect = (item) => {
    selectEntity(item.id, item._type);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-[68px] fixed inset-0 flex flex-col md:flex-row overflow-hidden bg-cream">
      {/* ── MOBILE LAYOUT ────────────────────────────────── */}
      <div className="md:hidden w-full h-[calc(100vh-68px)] flex flex-col">
        {/* Map (full height) */}
        <div className="flex-1 relative">
          <UnifiedMapShell
            items={filtered}
            markerIcon={(item, active) =>
              createMarkerIcon(item.category, active)
            }
            onMarkerSelect={handleMarkerSelect}
            className="w-full h-full"
          />

          {/* Floating search + filters (overlay) */}
          <motion.div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-background/80 via-background/40 to-transparent p-4 space-y-3 pointer-events-none">
            <div className="pointer-events-auto">
              <UnifiedSearchBar />
            </div>
            <div className="pointer-events-auto">
              <UnifiedFilterChips />
            </div>
          </motion.div>
        </div>

        {/* Bottom sheet drawer */}
        <UnifiedDrawer
          selected={selected}
          onMarkerSelect={handleMarkerSelect}
        />
      </div>

      {/* ── DESKTOP LAYOUT ───────────────────────────────── */}
      <div className="hidden md:flex w-full h-[calc(100vh-68px)] gap-0">
        {/* Map (left 65%) */}
        <div className="w-2/3 relative">
          <UnifiedMapShell
            items={filtered}
            markerIcon={(item, active) =>
              createMarkerIcon(item.category, active)
            }
            onMarkerSelect={handleMarkerSelect}
            className="w-full h-full"
          />

          {/* Floating controls (top overlay) */}
          <motion.div className="absolute top-6 left-6 right-6 z-20 space-y-3 pointer-events-none">
            <div className="pointer-events-auto">
              <UnifiedSearchBar />
            </div>
            <div className="pointer-events-auto">
              <UnifiedFilterChips />
            </div>
          </motion.div>
        </div>

        {/* Results panel (right 35%) */}
        <div className="w-1/3 bg-white border-l border-border overflow-hidden flex flex-col">
          <UnifiedResultsPanel items={filtered} />
        </div>
      </div>
    </div>
  );
}