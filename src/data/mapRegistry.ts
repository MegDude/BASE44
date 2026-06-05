import { happyHourInventory } from "./happyHourInventory";
import { productionMapInventory } from "./production";
import { waterlooParkInventory } from "./waterlooParkInventory";
import { waterlooParkCampaignPins } from "./waterlooParkCampaignPins";
import type { DowntownPerksMapInventorySource } from "@/types/mapTypes";

export const mapInventoryRegistry: DowntownPerksMapInventorySource[] = [
  { type: "production", records: productionMapInventory.records },
  { type: "happy-hour", records: happyHourInventory },
  { type: "waterloo", records: waterlooParkInventory },
  { type: "waterloo-campaign", records: waterlooParkCampaignPins },
];

export { happyHourInventory, productionMapInventory, waterlooParkInventory, waterlooParkCampaignPins };
