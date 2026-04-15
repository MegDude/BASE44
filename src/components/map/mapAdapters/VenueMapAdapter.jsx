import { venueIcon, buildingIcon } from "../mapUtils/markerIcons";
import { filterVenues, filterBuildings } from "../mapUtils/filterLogic";
import { MapPin, Clock, Tag, Building2 } from "lucide-react";

/**
 * VenueMapAdapter — Wraps Explore page data/filter logic for MapShell
 * Handles venue + building mixed plotting
 */
export function useVenueMapAdapter(venues, buildings, { category, query, smartFilters }) {
  const filteredVenues = filterVenues(venues, { category, query, smartFilters });
  const showBuildings = category === "all" || category === "building";
  const filteredBuildings = showBuildings ? filterBuildings(buildings, { query, smartFilters }) : [];

  const allItems = [
    ...filteredVenues.map((v) => ({ ...v, _type: "venue" })),
    ...filteredBuildings.map((b) => ({ ...b, _type: "building" })),
  ];

  function getMarkerIcon(item, active) {
    if (item._type === "building") return buildingIcon(active);
    return venueIcon(item.category, active);
  }

  return {
    items: allItems,
    getMarkerIcon,
    filteredVenues,
    filteredBuildings,
  };
}

/**
 * Render venue side card
 */
export function VenueSideCard({ venue, active, onClick }) {
  return (
    <article
      onClick={onClick}
      className={`rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 ${
        active
          ? "border-[#111] shadow-[0_16px_36px_rgba(17,17,17,.12)]"
          : "border-[#efede8] shadow-[0_4px_14px_rgba(17,17,17,.03)] hover:-translate-y-px hover:shadow-[0_12px_28px_rgba(17,17,17,.08)]"
      }`}
    >
      <div className="relative aspect-[2/1] bg-gradient-to-br from-[#333] to-[#555] overflow-hidden">
        {venue.image_url ? (
          <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 text-white text-[11px] font-semibold backdrop-blur-md capitalize">
          {venue.category}
        </div>
        {venue.perk_value && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/92 text-[#111] text-[11px] font-bold backdrop-blur-md">
            {venue.perk_value}
          </div>
        )}
      </div>
      <div className="p-4 bg-white">
        <h3 className="font-semibold text-[16px] text-[#111] leading-snug mb-1.5 tracking-tight">
          {venue.name}
        </h3>
        {venue.address && <p className="text-[13px] text-[#6f6b65] mb-3 truncate">{venue.address}</p>}
        <div className="flex flex-wrap gap-2">
          {venue.perk_description && (
            <span className="flex items-center gap-1.5 bg-[#f5f3ef] border border-[#e8e5df] rounded-full px-2.5 py-1.5 text-[12px] text-[#3d3934] font-medium max-w-full truncate">
              <Tag className="w-3 h-3 text-[#7a746b] shrink-0" /> {venue.perk_description}
            </span>
          )}
          {venue.hours && (
            <span className="flex items-center gap-1.5 bg-[#f5f3ef] border border-[#e8e5df] rounded-full px-2.5 py-1.5 text-[12px] text-[#3d3934] font-medium">
              <Clock className="w-3 h-3 text-[#7a746b]" /> {venue.hours}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * Render building side card
 */
export function BuildingSideCard({ building, active, onClick }) {

  return (
    <article
      onClick={onClick}
      className={`rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 ${
        active
          ? "border-[#111] shadow-[0_16px_36px_rgba(17,17,17,.12)]"
          : "border-[#efede8] shadow-[0_4px_14px_rgba(17,17,17,.03)] hover:-translate-y-px hover:shadow-[0_12px_28px_rgba(17,17,17,.08)]"
      }`}
    >
      <div className="relative aspect-[2/1] bg-gradient-to-br from-[#C8973A]/40 to-[#8a6622]/60 overflow-hidden">
        {building.image_url ? (
          <img src={building.image_url} alt={building.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-10 h-10 text-white/30" />
          </div>
        )}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 text-white text-[11px] font-semibold backdrop-blur-md">
          Building
        </div>
        {building.unit_count && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/92 text-[#111] text-[11px] font-bold backdrop-blur-md">
            {building.unit_count} units
          </div>
        )}
      </div>
      <div className="p-4 bg-white">
        <h3 className="font-semibold text-[16px] text-[#111] leading-snug mb-1.5 tracking-tight">
          {building.name}
        </h3>
        {building.address && (
          <p className="text-[13px] text-[#6f6b65] mb-3 truncate">{building.address}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {building.developer && (
            <span className="bg-[#f5f3ef] border border-[#e8e5df] rounded-full px-2.5 py-1.5 text-[12px] text-[#3d3934] font-medium">
              {building.developer}
            </span>
          )}
          <span
            className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium border ${
              building.status === "active"
                ? "bg-green-50 border-green-200 text-green-700"
                : building.status === "pilot"
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-[#f5f3ef] border-[#e8e5df] text-[#7a746b]"
            } capitalize`}
          >
            {building.status || "active"}
          </span>
        </div>
      </div>
    </article>
  );
}