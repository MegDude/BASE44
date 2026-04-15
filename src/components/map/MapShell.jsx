import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { normalizeCoordinates, filterValidMapItems, getValidLatLng, isValidLatLngArray } from "@/lib/mapCoordinates";
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

/**
 * MapFlyTo — Coordinate-safe map centering
 * Only flies to valid coordinates; silently ignores invalid ones
 */
function MapFlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (isValidLatLngArray(position)) {
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
 * @property {Function} renderDetailDrawer - Optional render function for detail drawer
 * @property {number[]} center - Map center [lat, lng]
 * @property {number} zoom - Initial zoom level
 * @property {string} className - Optional CSS class
 */

/**
 * @typedef {Object} CampaignPreviewProps
 * @property {string} mode - 'default' | 'campaign-preview'
 * @property {string} campaignId - Campaign identifier (optional)
 * @property {string[]} placementTypes - Filter types to render
 * @property {string} sourceContext - Source of campaign ('brand' | 'venue' | 'hotel' | 'building' | 'civic')
 * @property {boolean} interactive - Enable interactive behavior
 */

/**
 * @param {MapShellProps & CampaignPreviewProps} props
 */
export default function MapShell({
  mode = 'default',
  campaignId,
  placementTypes,
  sourceContext,
  interactive = true,
  items = [],
  selected,
  onSelect,
  markerIcon,
  renderDetailDrawer,
  center = AUSTIN_CENTER,
  zoom = 14,
  className = "w-full h-full",
}) {
  // CRITICAL: All items MUST pass through filterValidMapItems and normalizeCoordinates
  // This is the only path items take to the map
  const validItems = filterValidMapItems(items).map(normalizeCoordinates);
  
  // CRITICAL: Retrieve flyTarget through getValidLatLng only
  // Returns null if selected is missing or has invalid coordinates
  const flyTarget = getValidLatLng(selected);

  return (
    <div className={`${className} relative`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full absolute inset-0 z-0"
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; CARTO"
        />
        <MapFlyTo position={flyTarget} />

        {validItems.map(item => {
          // CRITICAL: Every marker gets re-validated through getValidLatLng
          // This prevents any coordinate from reaching Marker without validation
          const coords = getValidLatLng(item);
          if (!coords) return null; // Silent fail for invalid coordinates
          
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

      {/* Detail drawer — NOT rendered here on mobile (handled by bottom sheet) */}
    </div>
  );
}