import { useMemo } from "react";
import { useMapPanelStore } from "@/store/useMapPanelStore";

type ResultKind = "venue" | "event" | "perk" | "building" | "venues" | "events" | "perks";

type ResultItem = {
  id: string;
  name: string;
  type: ResultKind;
  category?: string;
  description?: string;
  isOpen?: boolean;
  isOpenNow?: boolean;
  hasDeal?: boolean;
  distanceMinutes?: number;
  liveScore?: number;
  crowdScore?: number;
  metadata?: {
    walkMinutes?: number;
    popularity?: number;
    crowdLevel?: number;
  };
};

function normalizeType(type: ResultKind) {
  if (type === "venue") return "venues";
  if (type === "event") return "events";
  if (type === "perk") return "perks";
  return type;
}

export function useRankedResults<T extends ResultItem>(data: T[]) {
  const { query, decision, type, categories, filters } = useMapPanelStore();

  return useMemo(() => {
    return [...data]
      .filter((item) => {
        if (type !== "all" && normalizeType(item.type) !== type) return false;
        if (categories.length && item.category && !categories.includes(String(item.category).toLowerCase())) {
          return false;
        }
        if (filters.deals && !(item.hasDeal || normalizeType(item.type) === "perks")) return false;
        if (filters.fiveMin && ((item.distanceMinutes ?? item.metadata?.walkMinutes ?? 999) > 5)) return false;
        return true;
      })
      .sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        if (query) {
          const q = query.toLowerCase();
          const haystackA = `${a.name} ${a.category ?? ""} ${a.description ?? ""}`.toLowerCase();
          const haystackB = `${b.name} ${b.category ?? ""} ${b.description ?? ""}`.toLowerCase();

          if (haystackA.includes(q)) scoreA += 20;
          if (haystackB.includes(q)) scoreB += 20;
        }

        if (decision === "now") {
          scoreA += a.liveScore ?? a.metadata?.popularity ?? 0;
          scoreB += b.liveScore ?? b.metadata?.popularity ?? 0;
        }

        if (decision === "open") {
          if (a.isOpen || a.isOpenNow) scoreA += 15;
          if (b.isOpen || b.isOpenNow) scoreB += 15;
        }

        if (decision === "near") {
          scoreA -= a.distanceMinutes ?? a.metadata?.walkMinutes ?? 999;
          scoreB -= b.distanceMinutes ?? b.metadata?.walkMinutes ?? 999;
        }

        if (filters.crowd) {
          scoreA += a.crowdScore ?? a.metadata?.crowdLevel ?? 0;
          scoreB += b.crowdScore ?? b.metadata?.crowdLevel ?? 0;
        }

        return scoreB - scoreA;
      });
  }, [data, query, decision, type, categories, filters]);
}
