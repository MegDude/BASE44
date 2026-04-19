import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ locations = [], onSelect }) {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={[30.2672, -97.7431]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {locations.map((loc) => {
          const lat = parseFloat(loc.lat ?? loc.latitude);
          const lng = parseFloat(loc.lng ?? loc.longitude);

          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            console.warn("Invalid coords:", loc);
            return null;
          }

          return (
            <Marker
              key={loc.id || `${lat}-${lng}`}
              position={[lat, lng]}
              eventHandlers={{
                click: () => onSelect?.(loc),
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}