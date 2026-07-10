export type DistrictOverlayState = {
  districtId: string;
  polygonPath: Array<{ lat: number; lng: number }>;
  active: boolean;
  campaignIds: string[];
};

export function createDistrictPolygon(
  maps: any,
  map: any,
  state: DistrictOverlayState,
): any | null {
  if (!state.polygonPath.length) return null;
  return new maps.Polygon({
    map,
    paths: state.polygonPath,
    strokeColor: state.active ? "#BFA46A" : "#0B1F33",
    strokeOpacity: state.active ? 0.86 : 0.35,
    strokeWeight: state.active ? 2 : 1,
    fillColor: state.campaignIds.length ? "#BFA46A" : "#0B1F33",
    fillOpacity: state.active ? 0.1 : 0.04,
    clickable: false,
  });
}
