import { mapRepository } from "@/lib/repositories/mapRepository";
import { residentMutationsRepository } from "@/lib/repositories/residentMutationsRepository";

async function resolveItem(itemOrId) {
  if (!itemOrId) return null;
  if (typeof itemOrId === "string") {
    return mapRepository.getMapItemById(itemOrId);
  }
  return itemOrId;
}

export async function savePlace(itemOrId) {
  const item = await resolveItem(itemOrId);
  if (!item) return { success: false, error: "Place not found" };
  return residentMutationsRepository.toggleSavedItem({ item });
}

export async function redeemPerk(itemOrId) {
  const item = await resolveItem(itemOrId);
  if (!item) return { success: false, error: "Perk not found" };
  return residentMutationsRepository.createRedemption({ item });
}
