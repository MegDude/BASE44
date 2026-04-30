"use client";

import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import type { MapLocation } from "@/app/data/mapData";
import { createMarker } from "@/components/MarkerFactory";

type MapCanvasProps = {
  locations: MapLocation[];
  selectedId: string | null;
  bestId: string | null;
  onSelect: (id: string) => void;
};

function MapController({ location }: { location?: MapLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!location) return;

    map.setView([location.lat, location.lng], 14, {
      animate: true,
    });
  }, [location, map]);

  return null;
}

export default function MapCanvas({
  locations,
  selectedId,
  bestId,
  onSelect,
}: MapCanvasProps) {
  const selectedLocation = locations.find((location) => location.id === selectedId);

  return (
    <MapContainer
      center={[30.2672, -97.7431]}
      zoom={13}
      scrollWheelZoom
      className="h-[420px] w-full rounded-[28px] md:h-[720px]"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController location={selectedLocation} />

      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[location.lat, location.lng]}
          icon={createMarker(location, bestId)}
          eventHandlers={{
            click: () => onSelect(location.id),
          }}
        >
          <Popup>
            <div className="space-y-1">
              <strong>{location.name}</strong>
              <p>{location.perk}</p>
              <p>{location.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

