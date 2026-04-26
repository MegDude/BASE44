import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { getValidMapCenter } from '@/lib/mapValidation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const AUSTIN_CENTER = [30.267, -97.743];

try {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
} catch (_) {}

function getLatLng(item) {
  const lat = Number(item?.location?.latitude ?? item?.latitude ?? item?.lat ?? item?.normalizedLat);
  const lng = Number(item?.location?.longitude ?? item?.longitude ?? item?.lng ?? item?.normalizedLng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return [lat, lng];
}

function MapSync({ selected, center }) {
  const map = useMap();
  useEffect(() => {
    if (!map?._loaded) return;
    const target = selected ? getLatLng(selected) : getValidMapCenter(center, AUSTIN_CENTER);
    if (!target) return;
    map.setView(target, selected ? Math.max(map.getZoom(), 15) : map.getZoom(), { animate: false });
  }, [map, selected, center]);
  return null;
}

function createDefaultIcon(isSelected) {
  const size = isSelected ? 18 : 12;
  const color = isSelected ? '#cfaf5a' : '#0b1f33';
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:999px;background:${color};border:2px solid rgba(255,255,255,.95);box-shadow:0 8px 22px rgba(11,31,51,.18)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
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
}) {
  const validCenter = getValidMapCenter(mapCenter, AUSTIN_CENTER);
  const validZoom = Number.isFinite(mapZoom) ? mapZoom : 14;

  const plottedItems = useMemo(() => {
    return (Array.isArray(items) ? items : [])
      .map((item) => ({ item, position: getLatLng(item) }))
      .filter((entry) => entry.position)
      .slice(0, 30);
  }, [items]);

  const selected = plottedItems.find(({ item }) => item.id === selectedId)?.item || null;

  return (
    <MapContainer
      center={validCenter}
      zoom={validZoom}
      className={`${className} relative overflow-hidden bg-[#f7f7fb]`}
      zoomControl={false}
      attributionControl={false}
      minZoom={12}
      maxZoom={18}
      scrollWheelZoom
      preferCanvas
      onMoveend={(event) => {
        const center = event.target.getCenter();
        if (Number.isFinite(center?.lat) && Number.isFinite(center?.lng)) {
          onMapCenterChange?.([center.lat, center.lng]);
        }
      }}
      onZoomend={(event) => onMapZoomChange?.(event.target.getZoom())}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; CARTO"
      />

      <MapSync selected={selected} center={validCenter} />

      {plottedItems.map(({ item, position }) => {
        const icon = markerIcon ? markerIcon(item, selectedId === item.id) : createDefaultIcon(selectedId === item.id);
        return (
          <Marker
            key={item.id}
            position={position}
            icon={icon}
            eventHandlers={{ click: () => onMarkerSelect?.(item) }}
          />
        );
      })}
    </MapContainer>
  );
}
