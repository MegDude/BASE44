export type BrandLayerState = {
  brandId: string;
  entityIds: string[];
  campaignIds: string[];
  logoUrl?: string;
  active: boolean;
};

export function resolveBrandLayerState(input: BrandLayerState): BrandLayerState {
  return {
    ...input,
    entityIds: [...new Set(input.entityIds.filter(Boolean))],
    campaignIds: [...new Set(input.campaignIds.filter(Boolean))],
    active: Boolean(input.active && (input.entityIds.length || input.campaignIds.length)),
  };
}
