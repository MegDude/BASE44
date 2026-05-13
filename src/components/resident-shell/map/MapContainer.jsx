import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function MapContainer() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map centered on Austin downtown
    const map = L.map(mapRef.current).setView([30.2672, -97.7431], 15);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Sample marker data - replace with real data from API
    const sampleMarkers = [
      {
        id: 1,
        lat: 30.2672,
        lng: -97.7431,
        type: "place", // place, event, property
        title: "The Stay Put",
        category: "Dining",
      },
      {
        id: 2,
        lat: 30.2650,
        lng: -97.7450,
        type: "event",
        title: "Banger's Patio Night",
        category: "Event",
      },
      {
        id: 3,
        lat: 30.2700,
        lng: -97.7400,
        type: "property",
        title: "The Waterline",
        category: "Residential",
      },
    ];

    // Add markers with pearl/navy/white/gold hierarchy
    const markerGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div class="flex items-center justify-center w-8 h-8 bg-white/88 backdrop-blur-sm rounded-full border border-white/64 shadow-sm font-semibold text-xs text-slate-900">${count}</div>`,
          className: "marker-cluster",
          iconSize: new L.Point(32, 32),
        });
      },
    });

    sampleMarkers.forEach((markerData) => {
      const marker = L.marker([markerData.lat, markerData.lng], {
        icon: L.divIcon({
          html: createMarkerIcon(markerData.type),
          className: "marker-icon",
          iconSize: [32, 40],
          iconAnchor: [16, 40],
        }),
      });

      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold text-slate-900">${markerData.title}</h3>
          <p class="text-xs text-slate-600">${markerData.category}</p>
        </div>
      `);

      markerGroup.addLayer(marker);
      markersRef.current.push(marker);
    });

    map.addLayer(markerGroup);

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1 }}
    />
  );
}

function createMarkerIcon(type) {
  const colors = {
    place: "bg-white border-2 border-slate-900", // navy
    event: "bg-yellow-100 border-2 border-yellow-600", // gold
    property: "bg-slate-50 border-2 border-slate-900", // pearl with navy
  };

  return `
    <div class="flex items-center justify-center w-8 h-10 ${colors[type]} rounded-full shadow-md">
      <div class="w-2 h-2 bg-slate-900 rounded-full"></div>
    </div>
  `;
}
