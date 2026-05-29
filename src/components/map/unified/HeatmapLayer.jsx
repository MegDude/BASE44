/**
 * HeatmapLayer — Real-time activity density visualization
 * Updates without map reload, respects time filters
 */

import { useMemo } from 'react';
import { Circle, useMap } from 'react-leaflet';
import { useUnifiedMapStore } from '@/store/unified-map-store';
import L from 'leaflet';

export default function HeatmapLayer() {
  const map = useMap();
  const { heatmapVisible, getHeatmapData } = useUnifiedMapStore();

  const heatmapData = useMemo(() => {
    const data = getHeatmapData();
    if (!data.length) return [];

    // Cluster by location (rough grid)
    const clusters = {};
    const cellSize = 0.005; // ~500m

    data.forEach((action) => {
      if (!action.latitude || !action.longitude) return;

      const cellKey = `${Math.floor(action.latitude / cellSize)}-${Math.floor(
        action.longitude / cellSize
      )}`;

      if (!clusters[cellKey]) {
        clusters[cellKey] = {
          lat:
            action.latitude +
            (Math.random() - 0.5) * cellSize * 0.5,
          lng:
            action.longitude +
            (Math.random() - 0.5) * cellSize * 0.5,
          count: 0,
          actions: [],
        };
      }

      clusters[cellKey].count++;
      clusters[cellKey].actions.push(action.action_type);
    });

    // Normalize intensity (0–1)
    const maxCount = Math.max(...Object.values(clusters).map((c) => c.count));
    return Object.values(clusters)
      .map((cluster) => ({
        ...cluster,
        intensity: cluster.count / maxCount,
      }))
      .sort((a, b) => b.intensity - a.intensity);
  }, [getHeatmapData]);

  if (!heatmapVisible || !heatmapData.length) return null;

  return (
    <>
      {heatmapData.map((cluster, idx) => {
        const intensity = cluster.intensity;
        const color = intensity > 0.7 ? '#B38F4F' : intensity > 0.4 ? '#0B1F33' : '#0B1F33';
        const radius = 50 + intensity * 150;
        const opacity = 0.3 + intensity * 0.4;

        return (
          <Circle
            key={idx}
            center={[cluster.lat, cluster.lng]}
            radius={radius}
            pathOptions={{
              color,
              weight: 0,
              fillOpacity: opacity,
              fillColor: color,
            }}
            eventHandlers={{
              click: () => {
                const popupContent = `
                  <div style="font-size:12px;padding:4px;">
                    <strong>${cluster.count} action${cluster.count !== 1 ? 's' : ''}</strong><br/>
                    ${cluster.actions.join(', ')}
                  </div>
                `;
                L.popup()
                  .setLatLng([cluster.lat, cluster.lng])
                  .setContent(popupContent)
                  .openOn(map);
              },
            }}
          />
        );
      })}
    </>
  );
}
