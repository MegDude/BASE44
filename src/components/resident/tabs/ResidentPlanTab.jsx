import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";

export default function ResidentPlanTab({ user }) {
  const events = [
    {
      id: 1,
      title: "Live Music at The Paseo",
      date: "Tonight, 8:00 PM",
      location: "The Paseo",
      distance: "0.5 mi",
    },
    {
      id: 2,
      title: "Rainey Street Art Walk",
      date: "This weekend",
      location: "Rainey Street",
      distance: "0.2 mi",
    },
    {
      id: 3,
      title: "Yoga in the Park",
      date: "Thursday, 6:00 AM",
      location: "Zilker Park",
      distance: "1.2 mi",
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-medium mb-2">Plan Ahead</h2>
          <p className="text-sm text-muted-foreground">Events and things to do near you</p>
        </div>

        {/* Time filters */}
        <div className="flex gap-2">
          {["Tonight", "This Week", "This Month"].map((filter) => (
            <button
              key={filter}
              className="px-4 py-2 rounded-full border border-border/40 bg-white hover:border-primary/50 text-foreground text-sm font-medium transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Events list */}
        <div className="space-y-3">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-4 rounded-xl border border-border/40 bg-white hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-foreground">{event.title}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Calendar className="w-3 h-3" />
                {event.date}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {event.location} · {event.distance}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}