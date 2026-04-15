import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { normalizeCoordinates, filterValidMapItems, getValidLatLng } from "@/lib/mapCoordinates";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const AUSTIN_CENTER = [30.267, -97.743];

/**
 * MapShell — Canonical shared map component
 * Replaces all page-specific map implementations
 * Guarantees coordinate safety through lib/mapCoordinates validation
 */

function MapFlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && Array.isArray(position) && position.length === 2 && position.every(v => typeof v === 'number' && isFinite(v))) {
      map.flyTo(position, Math.max(map.getZoom(), 14), { duration: 0.55 });
    }
  }, [position, map]);
  return null;
}

/**
 * @typedef {Object} MapShellProps
 * @property {any[]} items - Array of map items to display
 * @property {any} selected - Currently selected item
 * @property {Function} onSelect - Callback when item is selected
 * @property {Function} markerIcon - Optional function to create custom marker icons
 * @property {Function} renderItemCard - Render function for item cards
 * @property {Function} renderDetailDrawer - Optional render function for detail drawer
 * @property {number[]} center - Map center [lat, lng]
 * @property {number} zoom - Initial zoom level
 * @property {string} className - Optional CSS class
 */

/**
 * @param {MapShellProps} props
 */
export default function MapShell({
  items = [],
  selected,
  onSelect,
  markerIcon,
  renderItemCard,
  renderDetailDrawer,
  center = AUSTIN_CENTER,
  zoom = 14,
  className = "w-full h-full",
}) {
  // Normalize and filter all items through shared coordinate validation
  const validItems = filterValidMapItems(items).map(normalizeCoordinates);
  
  const flyTarget = getValidLatLng(selected);

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; CARTO"
        />
        <MapFlyTo position={flyTarget} />

        {validItems.map(item => {
          const coords = getValidLatLng(item);
          if (!coords) return null;
          
          const icon = markerIcon ? markerIcon(item, selected?.id === item.id) : undefined;
          
          return (
            <Marker
              key={item.id}
              position={coords}
              icon={icon}
              eventHandlers={{ click: () => onSelect(item) }}
            />
          );
        })}
      </MapContainer>

      {/* Item list cards — render via callback */}
      <div className="absolute top-5 left-5 bottom-5 w-80 z-50 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {validItems.map(item => renderItemCard(item, selected?.id === item.id, () => onSelect(item)))}
        </div>
      </div>

      {/* Detail drawer — render via callback if provided */}
      {selected && renderDetailDrawer && (
        <div className="absolute right-5 bottom-5 z-60 w-96 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-xl">
          {renderDetailDrawer(selected, () => onSelect(null))}
        </div>
      )}
    </div>
  );
}