export type LatLngLiteral = { lat: number; lng: number };

export type CameraInsets = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export function buildCameraPadding(insets: CameraInsets = {}): Record<string, number> {
  return {
    top: Math.max(0, Math.round(insets.top || 0)),
    right: Math.max(0, Math.round(insets.right || 0)),
    bottom: Math.max(0, Math.round(insets.bottom || 0)),
    left: Math.max(0, Math.round(insets.left || 0)),
  };
}

export function focusSelectedWithDrawerOffset(
  map: any,
  target: LatLngLiteral,
  options: { minZoom?: number; drawerOffsetPx?: number } = {},
): void {
  map.panTo(target);
  const currentZoom = map.getZoom?.() || 0;
  if (options.minZoom && currentZoom < options.minZoom) map.setZoom(options.minZoom);
  const offset = Math.round(options.drawerOffsetPx || 0);
  if (offset) {
    window.setTimeout(() => map.panBy(0, offset), 80);
  }
}

export function fitMapToCoordinates(
  maps: any,
  map: any,
  coords: LatLngLiteral[],
  options: { padding?: number | Record<string, number>; minZoom?: number; maxZoom?: number } = {},
): void {
  if (!coords.length) return;
  if (coords.length === 1) {
    map.panTo(coords[0]);
    if (options.minZoom) map.setZoom(Math.max(map.getZoom?.() || 0, options.minZoom));
    return;
  }
  const bounds = new maps.LatLngBounds();
  coords.forEach((coord) => bounds.extend(coord));
  map.fitBounds(bounds, options.padding || 64);
  if (options.minZoom || options.maxZoom) {
    maps.event.addListenerOnce(map, "bounds_changed", () => {
      const zoom = map.getZoom?.() || 0;
      if (options.minZoom && zoom < options.minZoom) map.setZoom(options.minZoom);
      if (options.maxZoom && zoom > options.maxZoom) map.setZoom(options.maxZoom);
    });
  }
}
