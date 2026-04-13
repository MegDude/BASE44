import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, MapPin, Users, Clock, Filter } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";
import EventCard from "../../components/downtown-perks/events/EventCard";

const eventCategories = [
  "all", "fitness", "wellness", "social", "dining", "nightlife", "arts", "networking", "class", "run_club", "yoga"
];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await base44.entities.Event.list("-date");
      setEvents(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = events.filter(
    (e) => activeCategory === "all" || e.category === activeCategory
  );

  const upcoming = filtered.filter(
    (e) => e.status === "upcoming" || e.status === "live"
  );

  return (
    <div className="pt-24 pb-20 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-widest">
            What's Happening
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mt-2 mb-4">
            Events & Experiences
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Curated experiences for Downtown Perks members. Run clubs, rooftop
            socials, wellness sessions, and more — all within walking distance.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {eventCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all capitalize ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat === "all" ? "All Events" : cat.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : upcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-xl font-bold mb-2">No Events Yet</h3>
            <p className="text-muted-foreground text-sm">
              Events are being curated for downtown members. Check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}