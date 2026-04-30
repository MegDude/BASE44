
'use client';

import type { SearchEntity } from '@/lib/types';
import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import Supercluster from 'supercluster';

function FitToSelection({ entity }: { entity?: SearchEntity }) {
  const map = useMap();
  useEffect(() => {
    if (entity) map.flyTo([entity.lat, entity.lng], 15, { duration: 0.45 });
  }, [entity, map]);
  return null;
}

export function MapClient({
  entities,
  selected,
  onSelect,
}: {
  entities: SearchEntity[];
  selected?: SearchEntity;
  onSelect: (entity: SearchEntity) => void;
}) {
  const clusters = useMemo(() => {
    const index = new Supercluster({ radius: 48, maxZoom: 17 });
    index.load(
      entities.map((entity) => ({
        type: 'Feature' as const,
        properties: { entity },
        geometry: { type: 'Point' as const, coordinates: [entity.lng, entity.lat] },
      }))
    );
    return index.getClusters([-98.1, 30.1, -97.5, 30.45], 13);
  }, [entities]);

  function colorFor(entity: SearchEntity) {
    if (entity.type === 'property' || entity.type === 'building') return '#122033';
    if (entity.type === 'event') return '#8c6837';
    if (entity.type === 'moment') return '#cfac72';
    if (entity.category === 'wellness') return '#5a7060';
    if (entity.category === 'nightlife') return '#1e3248';
    return '#8c6837';
  }

  return (
    <MapContainer center={[30.2669, -97.7437]} zoom={14} scrollWheelZoom={false} className="leaflet-map">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToSelection entity={selected} />
      {clusters.map((feature: any) => {
        const [lng, lat] = feature.geometry.coordinates;
        if (feature.properties.cluster) {
          return (
            <CircleMarker key={`cluster-${feature.id}`} center={[lat, lng]} radius={18} pathOptions={{ color: '#fff', fillColor: '#0b1f33', fillOpacity: 0.92, weight: 2 }}>
              <Popup>{feature.properties.point_count} places</Popup>
            </CircleMarker>
          );
        }

        const entity: SearchEntity = feature.properties.entity;
        const active = selected?.id === entity.id;
        const fillColor = colorFor(entity);
        return (
          <CircleMarker
            key={entity.id}
            center={[entity.lat, entity.lng]}
            radius={active ? 11 : 8}
            pathOptions={{
              color: '#fff',
              fillColor,
              fillOpacity: 0.95,
              weight: 2,
            }}
            eventHandlers={{ click: () => onSelect(entity) }}
          >
            <Popup>
              <div className="map-popup">
                <strong>{entity.title}</strong>
                <p>{entity.summary}</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
