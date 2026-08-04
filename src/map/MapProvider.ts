export type GoogleMapsApi = any;

export type DowntownMapOptions = Record<string, any> & {
  mapId?: string;
};

export function createDowntownGoogleMap(
  maps: GoogleMapsApi,
  container: HTMLElement,
  options: DowntownMapOptions,
): any {
  return new maps.Map(container, {
    disableDefaultUI: true,
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    clickableIcons: false,
    gestureHandling: "greedy",
    draggable: true,
    scrollwheel: true,
    keyboardShortcuts: false,
    isFractionalZoomEnabled: true,
    disableDoubleClickZoom: false,
    draggableCursor: "grab",
    draggingCursor: "grabbing",
    ...options,
  });
}

export function removeGoogleMapMarker(marker: any): void {
  if (!marker) return;
  if ("map" in marker) {
    marker.map = null;
    return;
  }
  marker.setMap?.(null);
}

export function clearGoogleMapArtifacts<T>(items: T[], clearItem: (item: T) => void): [] {
  items.forEach((item) => clearItem(item));
  return [];
}
