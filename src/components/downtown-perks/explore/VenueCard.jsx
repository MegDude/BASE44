import { X, MapPin, Clock, ExternalLink, Tag } from "lucide-react";

export default function VenueCard({ venue, onClose }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
          {venue.category}
        </span>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {venue.image_url && (
        <img
          src={venue.image_url}
          alt={venue.name}
          className="w-full h-48 object-cover rounded-xl mb-6"
        />
      )}

      <h2 className="font-heading text-2xl font-bold mb-2">{venue.name}</h2>

      {venue.address && (
        <div className="flex items-center gap-2 text-muted-foreground text-[13px] mb-4">
          <MapPin className="w-4 h-4" />
          {venue.address}
        </div>
      )}

      {venue.description && (
        <p className="text-secondary-foreground text-[13px] leading-relaxed mb-6">
          {venue.description}
        </p>
      )}

      {/* Perk highlight */}
      {venue.perk_description && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Member Perk
            </span>
          </div>
          <p className="text-foreground font-medium text-[13px]">
            {venue.perk_description}
          </p>
          {venue.perk_value && (
            <span className="inline-block mt-2 text-primary font-heading font-bold text-lg">
              {venue.perk_value}
            </span>
          )}
        </div>
      )}

      {venue.hours && (
        <div className="flex items-center gap-2 text-muted-foreground text-[13px] mb-4">
          <Clock className="w-4 h-4" />
          {venue.hours}
        </div>
      )}

      {venue.tags && venue.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {venue.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {venue.website && (
        <a
          href={venue.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary text-[13px] font-medium hover:underline"
        >
          Visit Website <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}