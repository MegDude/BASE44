import { MapPin, Users, Clock } from "lucide-react";
import moment from "moment";

export default function EventCard({ event }) {
  const date = event.date ? moment(event.date) : null;

  return (
    <div className="group rounded-lg border border-border bg-card overflow-hidden hover:border-primary/30 transition-all duration-300">
      {event.image_url && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          {event.is_members_only && (
            <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold">
              Members Only
            </span>
          )}
          {date && (
            <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
              <div className="text-primary font-heading font-bold text-lg leading-none">
                {date.format("DD")}
              </div>
              <div className="text-muted-foreground text-xs uppercase">
                {date.format("MMM")}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        <span className="text-primary text-xs font-medium uppercase tracking-wider capitalize">
          {event.category?.replace("_", " ")}
        </span>
        <h3 className="font-heading text-lg font-bold mt-1 mb-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-muted-foreground text-[13px] leading-relaxed mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="space-y-2">
          {event.venue_name && (
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <MapPin className="w-3.5 h-3.5" />
              {event.venue_name}
            </div>
          )}
          {date && (
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Clock className="w-3.5 h-3.5" />
              {date.format("ddd, MMM D · h:mm A")}
            </div>
          )}
          {event.rsvp_count > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Users className="w-3.5 h-3.5" />
              {event.rsvp_count} going
            </div>
          )}
        </div>
      </div>
    </div>
  );
}