import { useMemo } from 'react';
import { CircleMarker } from 'react-leaflet';
import { useMapStateStore } from '@/store/mapStateStore';

export default function HeatmapLayer({ items = [] }) {
  const heatmapVisible = useMapStateStore((state) => state.heatmapVisible);

  const hotspots = useMemo(
    () =>
      items
        .filter((item) => item.location?.valid && (item.isLive || item.metadata?.isTrending))
        .slice(0, 12),
    [items]
  );

  if (!heatmapVisible || hotspots.length === 0) {
    return null;
  }

  return (
    <>
      {hotspots.map((item) => (
        <CircleMarker
          key={`heat-${item.id}`}
          center={[item.location.latitude, item.location.longitude]}
          radius={18}
          pathOptions={{
            color: 'rgba(182,146,71,0.45)',
            weight: 1,
            fillColor: 'rgba(182,146,71,0.22)',
            fillOpacity: 0.85,
          }}
        />
      ))}
    </>
  );
}