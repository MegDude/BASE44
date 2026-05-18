import { useMemo } from "react";
import { CircleMarker, Marker, Polyline } from "react-leaflet";
import L from "leaflet";

const STREET_LABELS = [
  { id: "congress", label: "Congress Ave", position: [30.2693, -97.7428], tone: "navy" },
  { id: "rainey", label: "Rainey St", position: [30.2598, -97.7396], tone: "gold" },
  { id: "second", label: "2nd St", position: [30.2661, -97.7462], tone: "navy" },
  { id: "red-river", label: "Red River", position: [30.2678, -97.7369], tone: "gold" },
  { id: "waterloo", label: "Waterloo", position: [30.2678, -97.7392], tone: "navy" },
];

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

function buildDistrictGroups(items = []) {
  const groups = new Map();

  items.forEach((item) => {
    const lat = item?.location?.latitude;
    const lng = item?.location?.longitude;
    const district = String(item?.district || "").trim();
    if (!district || !Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const existing = groups.get(district) || { district, count: 0, score: 0, latSum: 0, lngSum: 0 };
    const score =
      Number(item?.metadata?.popularity || 0) +
      (item?.isLive ? 18 : 0) +
      (item?.isOpenNow ? 8 : 0) +
      (item?.perk || item?.perk_value ? 10 : 0);

    existing.count += 1;
    existing.score += score;
    existing.latSum += lat;
    existing.lngSum += lng;
    groups.set(district, existing);
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      position: [group.latSum / group.count, group.lngSum / group.count],
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

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

function createLabelIcon(label, tone = "navy") {
  const bg = tone === "gold" ? "rgba(198,168,90,0.94)" : "rgba(11,31,51,0.92)";
  const color = tone === "gold" ? "#0B1F33" : "#F8FAFC";

  return L.divIcon({
    className: "",
    html: `<div style="padding:4px 8px;border-radius:999px;background:${bg};color:${color};font:700 10px/1 Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;box-shadow:0 8px 18px rgba(11,31,51,0.14);white-space:nowrap;">${label}</div>`,
    iconSize: null,
    iconAnchor: [0, 0],
  });
}

export default function MapContextOverlays({ items = [], selectedId = null }) {
  const districts = useMemo(() => buildDistrictGroups(items), [items]);
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

      {STREET_LABELS.map((street) => (
        <Marker
          key={street.id}
          position={street.position}
          icon={createLabelIcon(street.label, street.tone)}
          interactive={false}
          keyboard={false}
        />
      ))}

      {districts.map((district) => (
        <Marker
          key={district.district}
          position={district.position}
          icon={createLabelIcon(`${district.district} · ${district.count}`, district.count >= 3 ? "gold" : "navy")}
          interactive={false}
          keyboard={false}
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
