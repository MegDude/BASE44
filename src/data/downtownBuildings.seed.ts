import { DOWNTOWN_BUILDINGS_SEED_RUNTIME, seedBuildingToMapEntity } from "./downtownBuildings.seed.runtime.js";

export type DowntownBuildingSeedRecord = {
  id: string;
  name: string;
  type: "residential" | "mixed_use" | "hotel_residence" | "condo" | "apartment";
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  unitCount: number | null;
  unitCountSource: string | null;
  status: "verified" | "needs_verification" | "estimated";
  priority: 1 | 2 | 3;
  websiteUrl?: string | null;
  managementCompany?: string | null;
  ownershipGroup?: string | null;
  notes?: string | null;
  sourceUrls?: string[];
};

export const DOWNTOWN_BUILDINGS_SEED = DOWNTOWN_BUILDINGS_SEED_RUNTIME as DowntownBuildingSeedRecord[];

export { seedBuildingToMapEntity };

export default DOWNTOWN_BUILDINGS_SEED;

