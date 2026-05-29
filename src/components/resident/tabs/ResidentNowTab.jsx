import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin, Clock } from "lucide-react";
import L from "leaflet";
import { useEventRsvpStore } from "@/store/event-rsvp-store";

const AUSTIN_CENTER = [30.267, -97.743];

const VENUES = [
  { id: 1, name: "Café Noir", lat: 30.267, lng: -97.743, category: "coffee", distance: "0.2 mi" },
  { id: 2, name: "Rainey Rooftop", lat: 30.268, lng: -97.744, category: "bar", distance: "0.1 mi" },
];

const getMarkerIcon = (category) => {
  const colors = { coffee: "#B38F4F", bar: "#B38F4F", wellness: "#0B1F33", default: "#0B1F33" };
  return L.divIcon({
    html: `<div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style="background-color: ${colors[category] || colors.default}"></div>`,
    className: "",
    iconSize: [32, 32],
  });
};

export default function ResidentNowTab({ user }) {
  const rsvps = useEventRsvpStore((state) => state.rsvps);

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
          {rsvps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-lg border border-[#B38F4F]/35 bg-white/95 p-3 shadow-sm backdrop-blur-sm"
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/50">Your RSVPs</div>
              <div className="mt-1 text-[13px] font-semibold text-[#0B1F33]">{rsvps[0].title}</div>
              <div className="mt-1 text-xs text-[#0B1F33]/58">{rsvps[0].time} · {rsvps[0].venue}</div>
            </motion.div>
          )}
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
                  <h4 className="font-semibold text-[13px] text-foreground">{venue.name}</h4>
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
          <h3 className="font-semibold text-foreground text-[13px]">Opening Soon</h3>
          {[
            { time: "5:00 PM", name: "Happy Hour @ Rainey" },
            { time: "7:00 PM", name: "Live Music at The Paseo" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 pb-3 border-b border-border/20">
              <Clock className="w-4 h-4 text-primary" />
              <div className="flex-1">
                <p className="text-xs text-primary font-medium">{item.time}</p>
                <p className="text-[13px] text-foreground">{item.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
