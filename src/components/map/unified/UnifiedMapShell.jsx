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

function toTitleCase(value = "") {
  return String(value || "")
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getClusterFamily(item) {
  const type = String(item?.type || item?.entity_type || "").toLowerCase();
  if (["building", "property", "hotel"].includes(type)) return "property";
  if (["perk", "brand"].includes(type)) return "partner";
  if (type === "event") return "event";
  if (type === "civic") return "civic";
  return "venue";
}

function getClusterThreshold(zoom = 14) {
  if (zoom >= 17) return 0;
  if (zoom >= 16) return 0.00035;
  if (zoom >= 15) return 0.00055;
  if (zoom >= 14) return 0.00085;
  if (zoom >= 13) return 0.00115;
  return 0.0015;
}

function buildClusterEntity(itemsInCluster = []) {
  const valid = itemsInCluster.filter(
    (item) =>
      Number.isFinite(item?.location?.latitude) &&
      Number.isFinite(item?.location?.longitude)
  );
  if (valid.length === 0) return null;

  const latitude =
    valid.reduce((sum, item) => sum + item.location.latitude, 0) / valid.length;
  const longitude =
    valid.reduce((sum, item) => sum + item.location.longitude, 0) / valid.length;
  const district =
    valid[0]?.district ||
    valid.find((item) => item?.district)?.district ||
    "Downtown";
  const sortedItems = [...valid].sort((a, b) => {
    const aScore = Number(a?.metadata?.popularity ?? 0);
    const bScore = Number(b?.metadata?.popularity ?? 0);
    return bScore - aScore;
  });
  const topNames = sortedItems.slice(0, 3).map((item) => item.name).filter(Boolean);

  return {
    id: `cluster-${district}-${Math.round(latitude * 10000)}-${Math.round(longitude * 10000)}-${valid.length}`,
    entity_id: `cluster-${district}-${valid.length}`,
    type: "cluster",
    entity_type: "cluster",
    name: `${toTitleCase(district)} Area`,
    title: `${toTitleCase(district)} Area`,
    description: `${valid.length} Nearby Places Around ${toTitleCase(district)}.`,
    district: toTitleCase(district),
    category: getClusterFamily(valid[0]),
    location: {
      latitude,
      longitude,
      valid: true,
    },
    latitude,
    longitude,
    isPlotted: true,
    isVisibleInResults: true,
    markerType: "cluster",
    metadata: {
      clusterCount: valid.length,
      clusterItems: sortedItems,
      topNames,
      popularity: Math.max(...sortedItems.map((item) => Number(item?.metadata?.popularity ?? 0)), 0),
    },
  };
}

function clusterItems(items = [], zoom = 14) {
  const threshold = getClusterThreshold(zoom);
  if (threshold <= 0) return items;

  const source = Array.isArray(items) ? items.filter(Boolean) : [];
  const buckets = new Map();

  for (const item of source) {
    const lat = item?.location?.latitude;
    const lng = item?.location?.longitude;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const district = String(item?.district || "downtown").toLowerCase();
    const family = getClusterFamily(item);
    const latBucket = Math.round(lat / threshold);
    const lngBucket = Math.round(lng / threshold);
    const key = `${district}:${family}:${latBucket}:${lngBucket}`;
    const existing = buckets.get(key) || [];
    existing.push(item);
    buckets.set(key, existing);
  }

  const clustered = [];
  for (const group of buckets.values()) {
    if (group.length <= 1) {
      clustered.push(group[0]);
      continue;
    }
    clustered.push(buildClusterEntity(group));
  }

  return clustered.filter(Boolean);
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
  const offsetY = isDesktop ? 120 : 96;
  const projected = map.project(latLng, zoom).subtract([0, offsetY]);
  return map.unproject(projected, zoom);
}

function MapFlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    const safePosition = getValidMapCenter(position, AUSTIN_CENTER);
    const currentZoom = map?.getZoom?.();
    const nextZoom = Number.isFinite(currentZoom) ? Math.min(Math.max(currentZoom, 13), 14) : 13;

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
  mapZoom = 14,
  onMapCenterChange,
  onMapZoomChange,
  selectedId,
  className = 'w-full h-full',
  children,
  enableClustering = true,
}) {
  const clusteredItems = useMemo(
    () => (enableClustering ? clusterItems(items, mapZoom) : items),
    [enableClustering, items, mapZoom]
  );

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
      className={`${className} dp-map-canvas relative isolate overflow-hidden`}
      style={{ zIndex: 0 }}
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
      <MapViewportManager items={clusteredItems} selectedId={selectedId} mapCenter={mapCenter} />
      <MapContextOverlays items={clusteredItems} selectedId={selectedId} />

      {/* Heatmap and other layers */}
      {children}

      {/* Markers */}
      {clusteredItems.map((item) => {
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
