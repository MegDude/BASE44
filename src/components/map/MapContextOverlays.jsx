import { useMemo } from "react";
import { CircleMarker, Polyline } from "react-leaflet";

const CORRIDORS = [
  {
    id: "congress-spine",
    positions: [
      [30.2788, -97.7427],
      [30.2715, -97.7428],
      [30.2641, -97.7429],
      [30.2589, -97.743],
    ],
  },
  {
    id: "rainey-corridor",
    positions: [
      [30.2635, -97.7414],
      [30.2614, -97.7401],
      [30.2595, -97.7393],
    ],
  },
];

function buildPulseItems(items = [], selectedId) {
  return [...items]
    .filter((item) => item?.id !== selectedId)
    .filter((item) => Number.isFinite(item?.location?.latitude) && Number.isFinite(item?.location?.longitude))
    .map((item) => ({
      item,
      weight:
        Number(item?.metadata?.popularity || 0) +
        (item?.isLive ? 20 : 0) +
        (item?.metadata?.isTrending ? 14 : 0) +
        (item?.isOpenNow ? 8 : 0),
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10);
}

export default function MapContextOverlays({ items = [], selectedId = null }) {
  const pulses = useMemo(() => buildPulseItems(items, selectedId), [items, selectedId]);

  return (
    <>
      {CORRIDORS.map((corridor) => (
        <Polyline
          key={corridor.id}
          positions={corridor.positions}
          pathOptions={{
            color: "rgba(11,31,51,0.16)",
            weight: 3,
            opacity: 0.45,
            dashArray: "4 10",
          }}
        />
      ))}

      {pulses.map(({ item, weight }) => {
        const center = [item.location.latitude, item.location.longitude];
        const radius = Math.max(14, Math.min(34, 10 + weight / 12));
        return (
          <CircleMarker
            key={`context-${item.id}`}
            center={center}
            radius={radius}
            interactive={false}
            pathOptions={{
              color: "rgba(198,168,90,0.30)",
              weight: 1,
              fillColor: "rgba(198,168,90,0.12)",
              fillOpacity: 0.92,
            }}
          />
        );
      })}
    </>
  );
}
