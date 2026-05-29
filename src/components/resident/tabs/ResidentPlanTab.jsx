import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useEventRsvpStore } from "@/store/event-rsvp-store";

export default function ResidentPlanTab({ user }) {
  const [activeFilter, setActiveFilter] = useState("Tonight");
  const rsvps = useEventRsvpStore((state) => state.rsvps);
  const removeRsvp = useEventRsvpStore((state) => state.removeRsvp);
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

  const filteredEvents = events.filter((event) => {
    if (activeFilter === "Tonight") return event.date.toLowerCase().includes("tonight");
    if (activeFilter === "This Week") return event.date.toLowerCase().includes("weekend") || event.date.toLowerCase().includes("thursday");
    return true;
  });

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-medium mb-2">Plan Ahead</h2>
          <p className="text-[13px] text-muted-foreground">Events and things to do near you</p>
        </div>

        <div className="rounded-lg border border-[#0B1F33]/8 bg-white p-4 shadow-[0_14px_34px_rgba(11,31,51,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-heading text-xl font-medium text-[#0B1F33]">Your RSVPs</h3>
              <p className="mt-1 text-[13px] leading-5 text-[#0B1F33]/58">
                Plans you’ve said yes to from the Downtown Perks calendar.
              </p>
            </div>
            <Link to="/events" className="shrink-0 rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/64 transition hover:border-[#B38F4F]/45 hover:text-[#0B1F33]">
              Add plans
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {rsvps.length ? (
              rsvps.slice(0, 4).map((event) => (
                <div key={event.id} className="rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-[#0B1F33]">{event.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#0B1F33]/58">
                        <span>{event.time}</span>
                        <span>{event.venue}</span>
                        <span>{event.category}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRsvp(event.id)}
                      className="shrink-0 rounded-md border border-[#0B1F33]/8 bg-white px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/58 transition hover:border-[#B38F4F]/45 hover:text-[#0B1F33]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] p-3 text-[13px] leading-6 text-[#0B1F33]/58">
                No RSVPs yet. Open Events, pick something nearby, and it will show up here.
              </div>
            )}
          </div>
        </div>

        {/* Time filters */}
        <div className="flex gap-2">
          {["Tonight", "This Week", "This Month"].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className="px-4 py-2 rounded-full border border-border/40 bg-white hover:border-primary/50 text-foreground text-[13px] font-medium transition-colors"
              aria-pressed={activeFilter === filter}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Events list */}
        <div className="space-y-3">
          {filteredEvents.map((event, i) => (
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
