/**
 * UnifiedMapShell — Core map component
 * Mobile-first, fully responsive, real-time interactions
 * Single source of truth for all map surfaces
 */

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { getValidMapCenter } from '@/lib/mapValidation';
import MapContextOverlays from '@/components/map/MapContextOverlays';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const AUSTIN_CENTER = [30.267, -97.743];
const DOWNTOWN_VIEW_BOUNDS = [
  [30.2582, -97.7535],
  [30.2795, -97.7382],
];

const MARKER_LABELS = {
  venue: 'Place',
  perk: 'Perk',
  event: 'Event',
  building: 'Building',
  property: 'Property',
  hotel: 'Hotel',
  civic: 'Civic',
  brand: 'Brand',
  moment: 'Neighbor moment',
};

function normalizeMarkerType(item) {
  const rawType = String(item?.type || item?.entity_type || item?.category || 'venue').toLowerCase();
  if (rawType === 'property') return 'building';
  if (rawType === 'offer') return 'perk';
  if (rawType === 'social') return 'moment';
  return rawType;
}

function wasCreatedRecently(item) {
  const raw = item?.created_at || item?.createdAt || item?.metadata?.created_at || item?.metadata?.createdAt;
  if (!raw) return false;
  const createdAt = new Date(raw).getTime();
  if (!Number.isFinite(createdAt)) return false;
  return Date.now() - createdAt < 1000 * 60 * 60;
}

function getSignalFlags(item, isSelected = false) {
  const type = normalizeMarkerType(item);
  const popularity = Number(item?.metadata?.popularity ?? item?.score ?? item?._score ?? 0);
  const activity = Number(item?.metadata?.activityScore ?? item?.metadata?.redemptions ?? item?.redemptions ?? 0);

  return {
    type,
    isSelected: Boolean(isSelected),
    isActive: Boolean(item?.isLive || item?.status === 'live' || popularity >= 86 || activity >= 3),
    isNew: Boolean(item?.isNew || wasCreatedRecently(item)),
    isSponsored: Boolean(
      item?.isSponsored ||
      item?.partnerTier === 'sponsor' ||
      item?.partnerTier === 'premium' ||
      item?.metadata?.partnerTier === 'sponsor' ||
      item?.metadata?.sponsored
    ),
    isLegends: Boolean(item?.isLegends || item?.metadata?.isLegends || item?.metadata?.residentResidential),
  };
}

function escapeHtml(value = '') {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function createSignalMarkerIcon(item, isSelected = false) {
  const flags = getSignalFlags(item, isSelected);
  const label = escapeHtml(item?.name || item?.title || MARKER_LABELS[flags.type] || 'Map item');
  const size = flags.isSelected ? 34 : 28;
  const anchor = Math.round(size / 2);

  const classNames = [
    'dp-signal-marker',
    `dp-signal-marker--${flags.type}`,
    flags.isActive ? 'is-active' : '',
    flags.isNew ? 'is-new' : '',
    flags.isSelected ? 'is-selected' : '',
    flags.isSponsored ? 'is-sponsored' : '',
    flags.isLegends ? 'is-legends' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return L.divIcon({
    className: 'dp-signal-marker-wrapper',
    html: `
      <div class="${classNames}" aria-label="${label}">
        <span class="dp-signal-marker__sponsor"></span>
        <span class="dp-signal-marker__new"></span>
        <span class="dp-signal-marker__pulse"></span>
        <span class="dp-signal-marker__core"></span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
  });
}

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function getOffsetCenter(map, position, zoom) {
  const latLng = L.latLng(position[0], position[1]);
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
  const offsetY = isDesktop ? 120 : 84;
  const projected = map.project(latLng, zoom).subtract([0, offsetY]);
  return map.unproject(projected, zoom);
}

function MapFlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    const safePosition = getValidMapCenter(position, AUSTIN_CENTER);
    const currentZoom = map?.getZoom?.();
    const nextZoom = Number.isFinite(currentZoom) ? Math.min(Math.max(currentZoom, 15), 17) : 15;

    if (!map?.getContainer?.() || !safePosition || !map._loaded) {
      return;
    }

    try {
      const offsetCenter = getOffsetCenter(map, safePosition, nextZoom);
      map.setView(offsetCenter, nextZoom, { animate: true, duration: 0.35 });
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
      paddingTopLeft: isDesktop ? [24, 176] : [16, 182],
      paddingBottomRight: isDesktop ? [340, 40] : [16, 180],
    });
  }, [items, map, selectedId]);

  useEffect(() => {
    if (!selectedId || !map?._loaded) return;
    const safePosition = getValidMapCenter(mapCenter, AUSTIN_CENTER);
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
    map.panInside(safePosition, {
      animate: true,
      paddingTopLeft: isDesktop ? [24, 176] : [16, 182],
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
  mapZoom = 15,
  onMapCenterChange,
  onMapZoomChange,
  selectedId,
  className = 'w-full h-full',
  children,
  enableClustering = false,
}) {
  const validItems = useMemo(
    () =>
      (Array.isArray(items) ? items : []).filter((item) => {
        const lat = item?.location?.latitude ?? item?.latitude ?? item?.lat;
        const lng = item?.location?.longitude ?? item?.longitude ?? item?.lng;
        return Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
      }),
    [items]
  );

  const clusteredItems = useMemo(() => validItems, [validItems]);

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
  const validZoom = Number.isFinite(mapZoom) ? mapZoom : 15;

  return (
    <MapContainer
      center={validCenter}
      zoom={validZoom}
      className={`${className} dp-map-canvas relative isolate overflow-hidden`}
      style={{ zIndex: 0 }}
      zoomControl={false}
      attributionControl={false}
      minZoom={13}
      maxZoom={19}
      scrollWheelZoom={true}
      dragging={true}
      doubleClickZoom={true}
      boxZoom={false}
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
      <MapViewportManager items={clusteredItems} selectedId={selectedId} mapCenter={mapCenter} />
      <MapContextOverlays items={clusteredItems} selectedId={selectedId} />

      {children}

      {clusteredItems.map((item) => {
        const lat = item?.location?.latitude ?? item?.latitude ?? item?.lat;
        const lng = item?.location?.longitude ?? item?.longitude ?? item?.lng;
        if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return null;

        const normalizedItem = {
          ...item,
          location: {
            ...(item.location || {}),
            latitude: Number(lat),
            longitude: Number(lng),
            valid: true,
          },
        };
        const position = [Number(lat), Number(lng)];
        const isSelected = selectedId === item.id;
        const icon = markerIcon
          ? markerIcon(normalizedItem, isSelected)
          : createSignalMarkerIcon(normalizedItem, isSelected);

        return (
          <Marker
            key={item.id}
            position={position}
            icon={icon}
            keyboard={true}
            title={item?.name || item?.title || MARKER_LABELS[normalizeMarkerType(item)] || 'Map item'}
            eventHandlers={{
              click: () => {
                onMarkerSelect?.(normalizedItem);
              },
              keypress: (event) => {
                if (event?.originalEvent?.key === 'Enter' || event?.originalEvent?.key === ' ') {
                  onMarkerSelect?.(normalizedItem);
                }
              },
            }}
          />
        );
      })}
    </MapContainer>
  );
}
