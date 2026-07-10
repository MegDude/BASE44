export type MapLayerName =
  | "districts"
  | "routes"
  | "collections"
  | "campaigns"
  | "brands"
  | "pins"
  | "selected-pin"
  | "search-radius"
  | "resident-location";

export type MapControllerState = {
  activeLayers: MapLayerName[];
  selectedEntityId: string;
  activeIntentId: string;
};

export function createMapControllerState(overrides: Partial<MapControllerState> = {}): MapControllerState {
  return {
    activeLayers: [],
    selectedEntityId: "",
    activeIntentId: "",
    ...overrides,
  };
}

export function resetIntentOwnedLayers(state: MapControllerState): MapControllerState {
  return {
    ...state,
    activeLayers: state.activeLayers.filter((layer) => layer === "resident-location"),
    selectedEntityId: "",
  };
}
