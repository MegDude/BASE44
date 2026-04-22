/**
 * UnifiedMapShell - Core map component
 * Mobile-first, fully responsive, real-time interactions
 * Single source of truth for all map surfaces
 */

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { getValidMapCenter } from '@/lib/mapValidation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const AUSTIN_CENTER = [30.267, -97.743];

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapFlyTo({ position, selectedId }) {
  const map = useMap();

  useEffect(() => {
    const safePosition = getValidMapCenter(position, AUSTIN_CENTER);
    const currentZoom = map?.getZoom?.();
    const nextZoom = Number.isFinite(currentZoom) ? Math.max(currentZoom, selectedId ? 15 : 14) : 14;

    if (!map?.getContainer?.() || !safePosition || !map._loaded) {
      return;
    }

    try {
      map.flyTo(safePosition, nextZoom, {
        animate: true,
        duration: selectedId ? 0.72 : 0.46,
        easeLinearity: 0.22,
      });
    } catch (error) {
      console.warn('Map flyTo error:', error);
    }
  }, [position, selectedId, map]);

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

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      onMapCenterChange?.([lat, lng]);
    }
  };

  const handleZoom = (map) => {
    onMapZoomChange?.(map.getZoom());
  };

  const validCenter = getValidMapCenter(mapCenter, AUSTIN_CENTER);
  const validZoom = Number.isFinite(mapZoom) ? mapZoom : 14;

  return (
    <MapContainer
      center={validCenter}
      zoom={validZoom}
      className={`${className} dp-map-canvas relative overflow-hidden`}
      zoomControl={false}
      attributionControl={false}
      minZoom={12}
      maxZoom={19}
      scrollWheelZoom={true}
      zoomAnimation={true}
      fadeAnimation={true}
      markerZoomAnimation={true}
      onMoveend={(event) => handleDragEnd(event.target)}
      onZoomend={(event) => handleZoom(event.target)}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; CARTO"
        updateWhenIdle={false}
        updateWhenZooming={false}
        keepBuffer={4}
      />

      <MapFlyTo position={mapCenter} selectedId={selectedId} />

      {children}

      {items.map((item) => {
        const lat = item?.location?.latitude;
        const lng = item?.location?.longitude;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

        const position = [lat, lng];
        const icon = markerIcon
          ? markerIcon(item, selectedId === item.id)
          : L.divIcon({
              className: '',
              html: `<div style="width:12px;height:12px;border-radius:999px;background:#0b1f33;border:2px solid #fff;box-shadow:0 0 0 4px rgba(11,31,51,0.10),0 6px 18px rgba(11,31,51,0.18);transition:transform 160ms ease;"></div>`,
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
