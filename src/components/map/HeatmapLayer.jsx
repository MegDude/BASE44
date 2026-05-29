import { useEffect, useState } from 'react';
import { Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * HeatmapLayer — Real-time visitor density visualization
 * Shows anonymized activity zones and peak traffic areas
 * Updates every 30 seconds with fresh analytics data
 */
export default function HeatmapLayer({ visible = true, data = [], timeFilter = 'now' }) {
  const map = useMap();
  const [heatZones, setHeatZones] = useState([]);

  // Aggregate analytics signals into spatial density clusters
  useEffect(() => {
    if (!visible || !data.length) {
      setHeatZones([]);
      return;
    }

    // Group by district/area (using grid cells for anonymization)
    const clusters = {};
    const gridSize = 0.003; // ~300m cells for privacy

    data.forEach((signal) => {
      if (!signal.latitude || !signal.longitude) return;

      // Grid-round coordinates for anonymization
      const gridLat = Math.round(signal.latitude / gridSize) * gridSize;
      const gridLng = Math.round(signal.longitude / gridSize) * gridSize;
      const key = `${gridLat},${gridLng}`;

      if (!clusters[key]) {
        clusters[key] = {
          lat: gridLat,
          lng: gridLng,
          count: 0,
          actions: {},
        };
      }

      clusters[key].count += signal.value || 1;
      clusters[key].actions[signal.action_type] = (clusters[key].actions[signal.action_type] || 0) + 1;
    });

    // Convert to zones with intensity
    const maxDensity = Math.max(...Object.values(clusters).map((c) => c.count), 1);
    const zones = Object.values(clusters).map((cluster) => ({
      lat: cluster.lat,
      lng: cluster.lng,
      count: cluster.count,
      intensity: cluster.count / maxDensity, // 0-1
      actions: cluster.actions,
    }));

    setHeatZones(zones);
  }, [visible, data, timeFilter]);

  // Navy/copper intensity function. Keep the heatmap restrained and on-brand.
  const getHeatColor = (intensity) => {
    if (intensity > 0.75) return '#B38F4F';
    if (intensity > 0.5) return '#0B1F33';
    if (intensity > 0.25) return '#081521';
    return '#0B1F33';
  };

  if (!visible || !heatZones.length) return null;

  return (
    <>
      {heatZones.map((zone, idx) => {
        const radius = 100 + zone.intensity * 300; // Scale radius by intensity
        const color = getHeatColor(zone.intensity);

        return (
          <Circle
            key={idx}
            center={[zone.lat, zone.lng]}
            radius={radius}
            pathOptions={{
              fillColor: color,
              color: color,
              weight: 1,
              opacity: 0.2,
              fillOpacity: 0.3 + zone.intensity * 0.4,
            }}
          >
            <L.Popup>
              <div className="text-[12px]">
                <div className="font-bold text-[#0B1F33] mb-1">Activity zone</div>
                <div className="text-[#0B1F33]/58">
                  {zone.count} action{zone.count !== 1 ? 's' : ''}
                </div>
                <div className="text-[11px] text-[#0B1F33]/50 mt-2 space-y-0.5">
                  {Object.entries(zone.actions).map(([action, count]) => (
                    <div key={action}>
                      {action.replace('_', ' ')}: {count}
                    </div>
                  ))}
                </div>
              </div>
            </L.Popup>
          </Circle>
        );
      })}
    </>
  );
}
