export type MarkerAdapterInput = {
  maps: any;
  map: any;
  position: { lat: number; lng: number };
  content?: HTMLElement;
  title: string;
  icon?: any;
  preferAdvanced?: boolean;
  zIndex?: number;
  onClick?: () => void;
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
  onClick,
}: MarkerAdapterInput): any {
  const canUseAdvancedMarkers = Boolean(preferAdvanced && maps.marker?.AdvancedMarkerElement && content);
  if (canUseAdvancedMarkers) {
    const collisionBehavior = maps.CollisionBehavior?.OPTIONAL_AND_HIDES_LOWER_PRIORITY;
    const marker = new maps.marker.AdvancedMarkerElement({
      map,
      position,
      content,
      title,
      anchorLeft: "-50%",
      anchorTop: "-50%",
      gmpClickable: true,
      gmpDraggable: false,
      zIndex,
      ...(collisionBehavior ? { collisionBehavior } : {}),
    });
    marker.addEventListener("gmp-click", () => {
      if (onClick) {
        onClick();
        return;
      }
      content.querySelector<HTMLElement>(".dp-map-pin")?.click();
    });
    return marker;
  }
  const marker = new maps.Marker({
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
  if (onClick) marker.addListener("click", onClick);
  return marker;
}
