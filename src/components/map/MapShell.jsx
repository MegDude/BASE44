import { MapContainer, TileLayer, Marker } from "react-leaflet";
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
  
  // Selection is a panel concern. It must never change the map camera or
  // recreate markers. Prefer the stable marker ID when an adapter provides it.
  const selectedMarkerId = selected?.markerId || selected?.id || "";

  return (
    <div className={`${className} relative`}>
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={12}
        maxZoom={20}
        className="h-full w-full absolute inset-0 z-0"
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={true}
        zoomSnap={0.5}
        zoomDelta={0.5}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; CARTO"
          maxZoom={20}
          maxNativeZoom={20}
          keepBuffer={8}
          updateWhenIdle={false}
          updateWhenZooming
          detectRetina
          crossOrigin
        />
        {validItems.map(item => {
          // CRITICAL: Every marker gets re-validated through getValidLatLng
          // This prevents any coordinate from reaching Marker without validation
          const coords = getValidLatLng(item);
          if (!coords) return null; // Silent fail for invalid coordinates
          
          const markerId = item.markerId || item.id;
          const isSelected = Boolean(selectedMarkerId && markerId === selectedMarkerId);
          const icon = markerIcon ? markerIcon(item, isSelected) : undefined;
          
          return (
            <Marker
              key={markerId}
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