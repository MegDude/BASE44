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

type RoutePosition = { lat: number; lng: number };

const MAX_DIRECTIONS_POSITIONS = 27;

function finitePosition(latValue: unknown, lngValue: unknown): RoutePosition | null {
  const lat = Number(latValue);
  const lng = Number(lngValue);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function stopPosition(stop: RouteStop): RoutePosition | null {
  const direct = finitePosition(stop.lat, stop.lng);
  if (direct) return direct;
  const verbose = finitePosition(stop.latitude, stop.longitude);
  if (verbose) return verbose;
  return Array.isArray(stop.coords) && stop.coords.length >= 2
    ? finitePosition(stop.coords[0], stop.coords[1])
    : null;
}

function walkingRouteBatches(positions: RoutePosition[]): RoutePosition[][] {
  const batches: RoutePosition[][] = [];
  for (let start = 0; start < positions.length - 1; start += MAX_DIRECTIONS_POSITIONS - 1) {
    batches.push(positions.slice(start, start + MAX_DIRECTIONS_POSITIONS));
  }
  return batches;
}

function overviewPath(result: any): RoutePosition[] {
  return (result?.routes?.[0]?.overview_path || []).map((point: any) => ({
    lat: Number(typeof point.lat === "function" ? point.lat() : point.lat),
    lng: Number(typeof point.lng === "function" ? point.lng() : point.lng),
  })).filter((point: RoutePosition) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
}

export async function requestWalkingRoutePath(maps: any, stops: RouteStop[] = []): Promise<RoutePosition[]> {
  const positions = stops.map(stopPosition).filter(Boolean) as RoutePosition[];
  if (positions.length < 2 || !maps?.DirectionsService) return [];
  const service = new maps.DirectionsService();
  const resolved: RoutePosition[] = [];

  for (const batch of walkingRouteBatches(positions)) {
    const result = await service.route({
      origin: batch[0],
      destination: batch[batch.length - 1],
      waypoints: batch.slice(1, -1).map((location) => ({ location, stopover: true })),
      optimizeWaypoints: false,
      travelMode: maps.TravelMode?.WALKING || "WALKING",
    });
    const path = overviewPath(result);
    resolved.push(...(resolved.length > 0 ? path.slice(1) : path));
  }

  return resolved;
}

export function createBrandedRoutePolylines(
  maps: any,
  map: any,
  path: RoutePosition[],
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
