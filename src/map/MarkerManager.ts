export type MarkerAdapterInput = {
  maps: any;
  map: any;
  position: { lat: number; lng: number };
  content?: HTMLElement;
  title: string;
  icon?: any;
  preferAdvanced?: boolean;
  zIndex?: number;
};

export function createDowntownMarker({
  maps,
  map,
  position,
  content,
  title,
  icon,
  preferAdvanced = true,
  zIndex = 1,
}: MarkerAdapterInput): any {
  const canUseAdvancedMarkers = Boolean(preferAdvanced && maps.marker?.AdvancedMarkerElement && content);
  if (canUseAdvancedMarkers) {
    const collisionBehavior = maps.CollisionBehavior?.OPTIONAL_AND_HIDES_LOWER_PRIORITY;
    return new maps.marker.AdvancedMarkerElement({
      map,
      position,
      content,
      title,
      anchorLeft: "-50%",
      anchorTop: "-50%",
      gmpDraggable: false,
      zIndex,
      ...(collisionBehavior ? { collisionBehavior } : {}),
    });
  }
  return new maps.Marker({
    map,
    position,
    title,
    icon,
    optimized: true,
    draggable: false,
    clickable: true,
    crossOnDrag: false,
    zIndex,
  });
}
