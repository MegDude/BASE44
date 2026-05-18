import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { useMapStateStore } from "@/store/mapStateStore";

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
  const markerGroupRef = useRef(null);
  const isUserInteractingRef = useRef(false);
  const [markersLoaded, setMarkersLoaded] = useState(false);

  // Connect to map state store
  const { mapCenter, mapZoom, setMapCenter, setMapZoom, selectedEntity, selectEntity } = useMapStateStore();

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map centered on Austin downtown
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(mapCenter, mapZoom);

    // Add tile layer with softer styling
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
      opacity: 0.95,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Track user interaction to prevent feedback loops
    map.on("movestart", () => {
      isUserInteractingRef.current = true;
    });

    // Handle map interactions - sync to store only on user action
    const handleMapMove = () => {
      isUserInteractingRef.current = false;
      const center = map.getCenter();
      setMapCenter([center.lat, center.lng]);
      setMapZoom(map.getZoom());
    };

    // Debounce map move to prevent infinite loops
    let moveTimeout;
    map.on("moveend", () => {
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(handleMapMove, 150);
    });

    // Sample marker data - replace with real Supabase data
    const sampleMarkers = [
      {
        id: "1",
        lat: 30.2672,
        lng: -97.7431,
        type: "place",
        title: "The Stay Put",
        category: "Dining",
      },
      {
        id: "2",
        lat: 30.2650,
        lng: -97.7450,
        type: "event",
        title: "Banger's Patio Night",
        category: "Event",
      },
      {
        id: "3",
        lat: 30.2700,
        lng: -97.7400,
        type: "property",
        title: "The Waterline",
        category: "Residential",
      },
      {
        id: "4",
        lat: 30.2685,
        lng: -97.7420,
        type: "place",
        title: "Rainey Street",
        category: "Dining",
      },
      {
        id: "5",
        lat: 30.2660,
        lng: -97.7460,
        type: "event",
        title: "Live Music Night",
        category: "Event",
      },
    ];

    // Create marker cluster group
    const markerGroup = L.markerClusterGroup({
      maxClusterRadius: 60,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        const size = count < 5 ? 32 : count < 15 ? 40 : 48;
        return L.divIcon({
          html: `<div class="flex items-center justify-center w-full h-full bg-white/88 backdrop-blur-sm rounded-full border border-white/60 shadow-[0_4px_12px_rgba(17,31,61,0.1)] font-semibold text-xs text-[#111f3d]">${count}</div>`,
          className: "marker-cluster",
          iconSize: new L.Point(size, size),
          iconAnchor: [size / 2, size / 2],
        });
      },
    });

    // Add markers with pearl/navy/white/gold hierarchy
    sampleMarkers.forEach((markerData) => {
      const marker = L.marker([markerData.lat, markerData.lng], {
        icon: L.divIcon({
          html: createMarkerIcon(markerData.type),
          className: "marker-icon",
          iconSize: [32, 40],
          iconAnchor: [16, 40],
        }),
      });

      marker.on("click", () => {
        selectEntity(markerData, { openDrawer: true, panToEntity: true });
      });

      marker.bindPopup(`
        <div class="p-3 bg-white rounded-lg">
          <h3 class="font-canela font-semibold text-[#111f3d]">${markerData.title}</h3>
          <p class="text-xs text-[#111f3d]/60 mt-1">${markerData.category}</p>
        </div>
      `);

      markerGroup.addLayer(marker);
    });

    map.addLayer(markerGroup);
    markerGroupRef.current = markerGroup;
    setMarkersLoaded(true);

    return () => {
      map.remove();
    };
  }, []);

  // Update map center and zoom when store changes (only if from external source)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    // Check if position has actually changed from what the map currently shows
    const currentCenter = mapInstanceRef.current.getCenter();
    const currentZoom = mapInstanceRef.current.getZoom();
    
    const hasChanged = 
      Math.abs(currentCenter.lat - mapCenter[0]) > 0.0001 || 
      Math.abs(currentCenter.lng - mapCenter[1]) > 0.0001 || 
      currentZoom !== mapZoom;
    
    if (hasChanged) {
      mapInstanceRef.current.setView(mapCenter, mapZoom, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [mapCenter, mapZoom]);

  return (
    <div
      ref={mapRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1 }}
    />
  );
}

function createMarkerIcon(type) {
  // Pearl/Navy/White/Gold hierarchy
  const iconConfigs = {
    place: {
      bg: "bg-white",
      border: "border-2 border-[#111f3d]",
      dot: "bg-[#111f3d]",
    },
    event: {
      bg: "bg-[#c6a55c]/20",
      border: "border-2 border-[#c6a55c]",
      dot: "bg-[#c6a55c]",
    },
    property: {
      bg: "bg-[#f7f6f2]",
      border: "border-2 border-[#111f3d]",
      dot: "bg-[#111f3d]",
    },
  };

  const config = iconConfigs[type] || iconConfigs.place;

  return `
    <div class="flex items-center justify-center w-8 h-10 ${config.bg} ${config.border} rounded-full shadow-[0_2px_8px_rgba(17,31,61,0.12)]">
      <div class="w-2 h-2 ${config.dot} rounded-full"></div>
    </div>
  `;
}
