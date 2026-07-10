export type CollectionLayerState = {
  collectionId: string;
  entityIds: string[];
  routeId?: string;
  active: boolean;
};

export function resolveCollectionLayerState(input: CollectionLayerState): CollectionLayerState {
  return {
    ...input,
    entityIds: [...new Set(input.entityIds.filter(Boolean))],
    active: Boolean(input.active && input.entityIds.length),
  };
}
