/**
 * UnifiedMapShell — Core map component
 * Mobile-first, fully responsive, real-time interactions
 * Single source of truth for all map surfaces
 */

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useUnifiedMapStore } from '@/store/unified-map-store';
import { AUSTIN_CENTER } from '@/lib/mapSystemConstants';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  className = 'w-full h-full',
  children,
}) {
  const { mapCenter, mapZoom, selectedId, setMapCenter, setMapZoom } =
    useUnifiedMapStore();

  const handleDragEnd = (map) => {
    const center = map.getCenter();
    setMapCenter([center.lat, center.lng]);
  };

  const handleZoom = (map) => {
    setMapZoom(map.getZoom());
  };

  return (
    <MapContainer
      center={mapCenter}
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
        if (!item.latitude || !item.longitude) return null;

        const icon = markerIcon
          ? markerIcon(item, selectedId === item.id)
          : L.divIcon({
              className: '',
              html: `<div style="width:10px;height:10px;border-radius:50%;background:#C8973A;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2)"></div>`,
              iconSize: [10, 10],
              iconAnchor: [5, 5],
            });

        return (
          <Marker
            key={item.id}
            position={[item.latitude, item.longitude]}
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