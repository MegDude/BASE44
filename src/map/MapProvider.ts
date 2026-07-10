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
    clickableIcons: false,
    gestureHandling: "greedy",
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
