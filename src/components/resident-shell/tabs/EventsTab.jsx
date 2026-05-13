import { motion } from "framer-motion";
import { Clock, Users, MapPin } from "lucide-react";

export default function EventsTab() {
  const events = [
    {
      id: 1,
      title: "Rooftop Social Night",
      time: "Today at 7:00 PM",
      location: "Rainey Street",
      attendees: 24,
      type: "social",
      image: "🎉",
    },
    {
      id: 2,
      title: "Live Jazz at The Continental",
      time: "Tonight at 9:00 PM",
      location: "6th Street",
      attendees: 38,
      type: "music",
      image: "🎵",
    },
    {
      id: 3,
      title: "Morning Run Club",
      time: "Tomorrow 6:30 AM",
      location: "Zilker Park",
      attendees: 12,
      type: "fitness",
      image: "🏃",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="mb-4">
        <h3 className="text-[12px] font-inter uppercase tracking-[0.12em] text-[#111f3d]/60 mb-3">
          Happening around you
        </h3>
      </div>

      {events.map((event, idx) => (
        <motion.div
          key={event.id}
          className="rounded-lg bg-white/72 backdrop-blur-sm p-4 hover:bg-white/78 transition-all cursor-pointer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ y: -2 }}
        >
          <div className="flex gap-3 items-start mb-3">
            <div className="text-2xl">{event.image}</div>
            <div className="flex-1">
              <h4 className="text-[14px] font-canela font-semibold text-[#111f3d]">
                {event.title}
              </h4>
            </div>
          </div>

          <div className="space-y-2 text-[11px] text-[#111f3d]/60">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {event.time}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              {event.location}
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3" />
              {event.attendees} interested
            </div>
          </div>

          <motion.button
            className="w-full mt-4 px-4 py-2 rounded-full bg-[#111f3d] text-white text-[11px] font-inter font-medium uppercase tracking-[0.08em] hover:bg-[#111f3d]/90 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Learn More
          </motion.button>
        </motion.div>
      ))}
    </div>
  );
}
