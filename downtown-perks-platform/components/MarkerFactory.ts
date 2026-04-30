// Only imported from client components — L.divIcon is browser-only
import L from "leaflet";

export interface ScoredItem {
  id: string;
  score?: number;
}

/**
 * Returns a tiered DivIcon based on the item's ranking score:
 *   Tier 1 (best): 26 px, gold glow ring, ⭐
 *   Tier 2 (score > 7): 20 px, full opacity
 *   Tier 3 (default): 14 px, 90% opacity
 *   Tier 4 (score < 3): 10 px, 50% opacity
 */
export function createMarker(
  item: ScoredItem,
  bestId: string | null,
): L.DivIcon {
  let tier: 1 | 2 | 3 | 4 = 3;
  if (item.id === bestId) tier = 1;
  else if ((item.score ?? 0) > 7) tier = 2;
  else if ((item.score ?? 0) < 3) tier = 4;

  const size = ({ 1: 26, 2: 20, 3: 14, 4: 10 } as const)[tier];
  const opacity = ({ 1: 1, 2: 1, 3: 0.9, 4: 0.5 } as const)[tier];
  const shadow =
    tier === 1
      ? "0 0 0 8px rgba(198,168,91,0.25), 0 4px 16px rgba(0,0,0,0.35)"
      : "0 2px 8px rgba(0,0,0,0.25)";

  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:999px;background:#C6A85B;
      border:2.5px solid white;opacity:${opacity};
      box-shadow:${shadow};
      display:flex;align-items:center;justify-content:center;
      font-size:10px;cursor:pointer;
    ">${tier === 1 ? "⭐" : ""}</div>`,
  });
}
