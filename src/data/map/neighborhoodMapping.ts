import type { DowntownDistrict } from "./mapEntitySchema";

export function inferDowntownDistrict(input = ""): DowntownDistrict {
  const value = String(input || "").toLowerCase();
  if (/rainey/.test(value)) return "Rainey";
  if (/seaholm|west ave|power plant/.test(value)) return "Seaholm";
  if (/west 6th|w 6th/.test(value)) return "West 6th";
  if (/congress|capitol|n congress|s congress/.test(value)) return "Congress";
  if (/red river/.test(value)) return "Red River";
  if (/waterloo|waller creek|symphony square/.test(value)) return "Waterloo";
  if (/2nd street|second street|w 2nd|2nd st/.test(value)) return "2nd Street";
  if (/warehouse|4th street|w 4th/.test(value)) return "Warehouse";
  if (/east austin|78702|east 5th|east 6th|e 5th|e 6th/.test(value)) return "East Austin";
  if (/austin|78701|downtown/.test(value)) return "Downtown Core";
  if (/denver|houston|dallas|san antonio|new york|los angeles|chicago/.test(value)) return "Outside Austin / Review";
  return "Unknown";
}

export function isLikelyDowntownAustin(entity: { address?: string; lat?: number; lng?: number; neighborhood?: string }): boolean {
  if (entity.neighborhood === "Outside Austin / Review") return false;
  if (entity.address && /78701|downtown|austin/i.test(entity.address)) return true;
  if (typeof entity.lat === "number" && typeof entity.lng === "number") {
    return entity.lat >= 30.245 && entity.lat <= 30.295 && entity.lng >= -97.77 && entity.lng <= -97.715;
  }
  return entity.neighborhood !== "Unknown";
}
