import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin, Clock } from "lucide-react";
import L from "leaflet";

const AUSTIN_CENTER = [30.267, -97.743];

const VENUES = [
  { id: 1, name: "Café Noir", lat: 30.267, lng: -97.743, category: "coffee", distance: "0.2 mi" },
  { id: 2, name: "Rainey Rooftop", lat: 30.268, lng: -97.744, category: "bar", distance: "0.1 mi" },
];

const getMarkerIcon = (category) => {
  const colors = { coffee: "#8B4513", bar: "#C8973A", wellness: "#2D9D78", default: "#1E40AF" };
  return L.divIcon({
    html: `<div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style="background-color: ${colors[category] || colors.default}"></div>`,
    className: "",
    iconSize: [32, 32],
  });
};

export default function ResidentNowTab({ user }) {
  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Map Area */}
      <div className="flex-1 relative overflow-hidden">
        <MapContainer
          center={AUSTIN_CENTER}
          zoom={14}
          style={{ width: "100%", height: "100%" }}
          dragging={true}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />
          {VENUES.map((v) => (
            <Marker key={v.id} position={[v.lat, v.lng]} icon={getMarkerIcon(v.category)}>
              <Popup>{v.name}</Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating "Now Open" Feed */}
        <div className="absolute top-4 left-4 right-4 md:right-auto md:w-80 z-20 max-h-96 overflow-y-auto space-y-2">
          {VENUES.map((venue, i) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 rounded-lg bg-white/95 backdrop-blur-sm border border-white/40 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-foreground">{venue.name}</h4>
                  <p className="text-xs text-muted-foreground">{venue.distance} away</p>
                </div>
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Feed Panel */}
      <div className="h-48 md:hidden border-t border-border/20 bg-background overflow-y-auto">
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-foreground text-sm">Opening Soon</h3>
          {[
            { time: "5:00 PM", name: "Happy Hour @ Rainey" },
            { time: "7:00 PM", name: "Live Music at The Paseo" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 pb-3 border-b border-border/20">
              <Clock className="w-4 h-4 text-primary" />
              <div className="flex-1">
                <p className="text-xs text-primary font-medium">{item.time}</p>
                <p className="text-sm text-foreground">{item.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}