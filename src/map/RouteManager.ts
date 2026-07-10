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
