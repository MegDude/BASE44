export type BrandedRouteStyle = {
  ambientColor: string;
  ambientOpacity: number;
  ambientStrokeWeight: number;
  overlapColor: string;
  overlapOpacity: number;
  overlapStrokeWeight: number;
  mainColor: string;
  mainOpacity: number;
  strokeWeight: number;
  dotColor: string;
  dotScale: number;
  repeat: string;
};

type RouteStop = {
  lat?: number | string;
  lng?: number | string;
  latitude?: number | string;
  longitude?: number | string;
  coords?: [number | string, number | string];
};

function finitePosition(latValue: unknown, lngValue: unknown): { lat: number; lng: number } | null {
  const lat = Number(latValue);
  const lng = Number(lngValue);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function stopPosition(stop: RouteStop): { lat: number; lng: number } | null {
  const direct = finitePosition(stop.lat, stop.lng);
  if (direct) return direct;
  const verbose = finitePosition(stop.latitude, stop.longitude);
  if (verbose) return verbose;
  return Array.isArray(stop.coords) && stop.coords.length >= 2
    ? finitePosition(stop.coords[0], stop.coords[1])
    : null;
}

export async function requestWalkingRoutePath(maps: any, stops: RouteStop[] = []): Promise<Array<{ lat: number; lng: number }>> {
  const positions = stops.map(stopPosition).filter(Boolean) as Array<{ lat: number; lng: number }>;
  if (positions.length < 2 || !maps?.DirectionsService) return [];
  const service = new maps.DirectionsService();
  const result = await service.route({
    origin: positions[0],
    destination: positions[positions.length - 1],
    waypoints: positions.slice(1, -1).map((location) => ({ location, stopover: true })),
    optimizeWaypoints: false,
    travelMode: maps.TravelMode?.WALKING || "WALKING",
  });
  return (result?.routes?.[0]?.overview_path || []).map((point: any) => ({
    lat: Number(typeof point.lat === "function" ? point.lat() : point.lat),
    lng: Number(typeof point.lng === "function" ? point.lng() : point.lng),
  })).filter((point: { lat: number; lng: number }) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
}

export function createBrandedRoutePolylines(
  maps: any,
  map: any,
  path: Array<{ lat: number; lng: number }>,
  style: BrandedRouteStyle,
): any[] {
  if (path.length < 2) return [];
  return [
    new maps.Polyline({
      map,
      path,
      strokeColor: style.ambientColor,
      strokeOpacity: style.ambientOpacity,
      strokeWeight: style.ambientStrokeWeight,
      clickable: false,
      zIndex: 18,
    }),
    new maps.Polyline({
      map,
      path,
      strokeColor: style.overlapColor,
      strokeOpacity: style.overlapOpacity,
      strokeWeight: style.overlapStrokeWeight,
      clickable: false,
      zIndex: 19,
    }),
    new maps.Polyline({
      map,
      path,
      strokeColor: style.mainColor,
      strokeOpacity: style.mainOpacity,
      strokeWeight: style.strokeWeight,
      clickable: true,
      zIndex: 21,
      icons: [{
        icon: {
          path: maps.SymbolPath.CIRCLE,
          fillColor: style.dotColor,
          fillOpacity: 0.92,
          strokeColor: style.overlapColor,
          strokeOpacity: 0.86,
          strokeWeight: 1.4,
          scale: style.dotScale,
        },
        offset: "14px",
        repeat: style.repeat,
      }],
    }),
  ];
}
