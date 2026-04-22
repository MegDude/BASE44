/**
 * UnifiedMapShell — Core map component
 * Mobile-first, fully responsive, real-time interactions
 * Single source of truth for all map surfaces
 */

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { getValidMapCenter } from '@/lib/mapValidation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const AUSTIN_CENTER = [30.267, -97.743];
const DOWNTOWN_VIEW_BOUNDS = [
  [30.2582, -97.7535],
  [30.2795, -97.7382],
];

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapFlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    const safePosition = getValidMapCenter(position, AUSTIN_CENTER);
    const currentZoom = map?.getZoom?.();
    const nextZoom = Number.isFinite(currentZoom) ? Math.max(currentZoom, 14) : 14;

    if (!map?.getContainer?.() || !safePosition || !map._loaded) {
      return;
    }

    try {
      map.setView(safePosition, nextZoom, { animate: false });
    } catch (error) {
      console.warn('Map flyTo error:', error);
    }
  }, [position, map]);
  return null;
}

function MapViewportManager({ items = [], selectedId, mapCenter }) {
  const map = useMap();

  useEffect(() => {
    if (!map?._loaded) return;

    const downtownBounds = L.latLngBounds(DOWNTOWN_VIEW_BOUNDS);
    map.setMaxBounds(downtownBounds);

    if (selectedId) return;
    if (!Array.isArray(items) || items.length === 0) {
      map.fitBounds(downtownBounds, { maxZoom: 15, animate: false });
      return;
    }

    const coords = items
      .map((item) => {
        const lat = item?.location?.latitude;
        const lng = item?.location?.longitude;
        return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
      })
      .filter(Boolean);

    if (coords.length === 0) {
      map.fitBounds(downtownBounds, { maxZoom: 15, animate: false });
      return;
    }

    const itemBounds = L.latLngBounds(coords);
    const boundedItemBounds = itemBounds.isValid() && itemBounds.intersects(downtownBounds)
      ? itemBounds.pad(0.08)
      : downtownBounds;

    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
    map.fitBounds(boundedItemBounds, {
      maxZoom: 15,
      animate: false,
      paddingTopLeft: isDesktop ? [24, 120] : [16, 140],
      paddingBottomRight: isDesktop ? [340, 40] : [16, 180],
    });
  }, [items, map, selectedId]);

  useEffect(() => {
    if (!selectedId || !map?._loaded) return;
    const safePosition = getValidMapCenter(mapCenter, AUSTIN_CENTER);
    map.panInside(safePosition, {
      animate: false,
      paddingTopLeft: [24, 120],
      paddingBottomRight: [24, 220],
    });
  }, [map, mapCenter, selectedId]);

  return null;
}

export default function UnifiedMapShell({
  items = [],
  markerIcon,
  onMarkerSelect,
  mapCenter = AUSTIN_CENTER,
  mapZoom = 14,
  onMapCenterChange,
  onMapZoomChange,
  selectedId,
  className = 'w-full h-full',
  children,
}) {
  const handleDragEnd = (map) => {
    const center = map.getCenter();
    const lat = center?.lat;
    const lng = center?.lng;
    
    // Only update if both are valid finite numbers
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      onMapCenterChange?.([lat, lng]);
    }
  };

  const handleZoom = (map) => {
    onMapZoomChange?.(map.getZoom());
  };

  // Ensure mapCenter and zoom are always valid for MapContainer
  const validCenter = getValidMapCenter(mapCenter, AUSTIN_CENTER);
  const validZoom = Number.isFinite(mapZoom) ? mapZoom : 14;

  return (
    <MapContainer
      center={validCenter}
      zoom={validZoom}
      className={`${className} relative overflow-hidden`}
      zoomControl={false}
      attributionControl={false}
      minZoom={12}
      maxZoom={19}
      scrollWheelZoom={true}
      preferCanvas={true}
      tap={true}
      tapTolerance={20}
      onMoveend={(e) => handleDragEnd(e.target)}
      onZoomend={(e) => handleZoom(e.target)}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; CARTO"
      />

      {selectedId ? <MapFlyTo position={mapCenter} /> : null}
      <MapViewportManager items={items} selectedId={selectedId} mapCenter={mapCenter} />

      {/* Heatmap and other layers */}
      {children}

      {/* Markers */}
      {items.map((item) => {
        const lat = item?.location?.latitude;
        const lng = item?.location?.longitude;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

        const position = [lat, lng];
        const icon = markerIcon
          ? markerIcon(item, selectedId === item.id)
          : L.divIcon({
              className: '',
              html: `<div style="width:12px;height:12px;border-radius:999px;background:#0b1f33;border:2px solid #fff;box-shadow:0 4px 12px rgba(11,31,51,0.18)"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            });

        return (
          <Marker
            key={item.id}
            position={position}
            icon={icon}
            eventHandlers={{
              click: () => {
                onMarkerSelect?.(item);
              },
            }}
          />
        );
      })}
    </MapContainer>
  );
}
