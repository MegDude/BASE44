/**
 * UnifiedMapShell — Core map component
 * Mobile-first, fully responsive, real-time interactions
 * Single source of truth for all map surfaces
 */

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { getValidMapCenter } from '@/lib/mapValidation';
import { resolveEntityPin } from '@/lib/map/entityPinResolver';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const AUSTIN_CENTER = [30.267, -97.743];

function getFallbackPinIcon(item, selected) {
  const pin = resolveEntityPin(item || {});
  return L.divIcon({
    className: 'dp-leaflet-pin',
    html: `<div class="dp-map-pin${selected ? ' dp-map-pin--selected' : ''}" aria-hidden="true"><div class="dp-map-pin__core">${pin.glyph}</div></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

function MapFlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (
      position &&
      Array.isArray(position) &&
      position.length === 2 &&
      Number.isFinite(position[0]) &&
      Number.isFinite(position[1]) &&
      map.getContainer() // Only fly if map is ready
    ) {
      try {
        map.flyTo(position, Math.max(map.getZoom(), 14), { duration: 0.55 });
      } catch (error) {
        console.warn('Map flyTo error:', error);
      }
    }
  }, [position, map]);
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

  // Ensure mapCenter is always valid for MapContainer
  const validCenter = getValidMapCenter(mapCenter, AUSTIN_CENTER);

  return (
    <MapContainer
      center={validCenter}
      zoom={mapZoom}
      className={`${className} relative`}
      zoomControl={false}
      scrollWheelZoom={true}
      onMoveend={(e) => handleDragEnd(e.target)}
      onZoomend={(e) => handleZoom(e.target)}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; CARTO"
      />

      <MapFlyTo position={mapCenter} />

      {/* Heatmap and other layers */}
      {children}

      {/* Markers */}
      {items.map((item) => {
        // Use validated location from centralized data
        if (!item.location || !item.location.valid) return null;

        const position = [item.location.latitude, item.location.longitude];
        const icon = markerIcon
          ? markerIcon(item, selectedId === item.id)
          : getFallbackPinIcon(item, selectedId === item.id);

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
