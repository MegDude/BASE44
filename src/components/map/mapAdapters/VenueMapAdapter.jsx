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
      className={`rounded-lg overflow-hidden border cursor-pointer transition-all duration-200 ${
        active
          ? "border-[#0B1F33] shadow-[0_16px_36px_rgba(17,17,17,.12)]"
          : "border-[#0B1F33]/8 shadow-[0_4px_14px_rgba(17,17,17,.03)] hover:-translate-y-px hover:shadow-[0_12px_28px_rgba(17,17,17,.08)]"
      }`}
    >
      <div className="relative flex aspect-[2/1] items-center justify-center overflow-hidden bg-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-md border border-[#BFA46A]/50 bg-[#0B1F33]">
          <MapPin className="h-7 w-7 text-[#BFA46A]" />
        </div>
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-[8px] bg-[#0B1F33]/88 text-white text-[11px] font-semibold capitalize">
          {venue.category}
        </div>
        {venue.perk_value && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-[8px] bg-white/95 text-[#0B1F33] text-[11px] font-bold">
            {venue.perk_value}
          </div>
        )}
      </div>
      <div className="p-4 bg-white">
        <h3 className="font-semibold text-[16px] text-[#0B1F33] leading-snug mb-1.5 tracking-normal">
          {venue.name}
        </h3>
        {venue.address && <p className="text-[13px] text-[#6f6b65] mb-3 truncate">{venue.address}</p>}
        <div className="flex flex-wrap gap-2">
          {venue.perk_description && (
            <span className="flex items-center gap-1.5 bg-white border border-[#0B1F33]/8 rounded-[8px] px-2.5 py-1.5 text-[12px] text-[#0B1F33]/70 font-medium max-w-full truncate">
              <Tag className="w-3 h-3 text-[#0B1F33]/58 shrink-0" /> {venue.perk_description}
            </span>
          )}
          {venue.hours && (
            <span className="flex items-center gap-1.5 bg-white border border-[#0B1F33]/8 rounded-[8px] px-2.5 py-1.5 text-[12px] text-[#0B1F33]/70 font-medium">
              <Clock className="w-3 h-3 text-[#0B1F33]/58" /> {venue.hours}
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
      className={`rounded-lg overflow-hidden border cursor-pointer transition-all duration-200 ${
        active
          ? "border-[#0B1F33] shadow-[0_16px_36px_rgba(17,17,17,.12)]"
          : "border-[#0B1F33]/8 shadow-[0_4px_14px_rgba(17,17,17,.03)] hover:-translate-y-px hover:shadow-[0_12px_28px_rgba(17,17,17,.08)]"
      }`}
    >
      <div className="relative flex aspect-[2/1] items-center justify-center overflow-hidden bg-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-md border border-[#BFA46A]/50 bg-[#0B1F33]">
          <Building2 className="h-8 w-8 text-[#BFA46A]" />
        </div>
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-[8px] bg-[#0B1F33]/88 text-white text-[11px] font-semibold">
          Building
        </div>
        {building.unit_count && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-[8px] bg-white/95 text-[#0B1F33] text-[11px] font-bold">
            {building.unit_count} units
          </div>
        )}
      </div>
      <div className="p-4 bg-white">
        <h3 className="font-semibold text-[16px] text-[#0B1F33] leading-snug mb-1.5 tracking-normal">
          {building.name}
        </h3>
        {building.address && (
          <p className="text-[13px] text-[#6f6b65] mb-3 truncate">{building.address}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {building.developer && (
            <span className="bg-white border border-[#0B1F33]/8 rounded-[8px] px-2.5 py-1.5 text-[12px] text-[#0B1F33]/70 font-medium">
              {building.developer}
            </span>
          )}
          <span
            className={`px-2.5 py-1.5 rounded-[8px] text-[11px] font-medium border ${
              building.status === "active"
                ? "bg-white/35 border-[#BFA46A]/30 text-[#0B1F33]"
                : building.status === "pilot"
                ? "bg-white border-[#0B1F33]/8 text-[#0B1F33]"
                : "bg-white border-[#0B1F33]/8 text-[#0B1F33]/58"
            } capitalize`}
          >
            {building.status || "active"}
          </span>
        </div>
      </div>
    </article>
  );
}
