export type CampaignLayerState = {
  campaignId: string;
  status: string;
  entityIds: string[];
  brandIds: string[];
  startsAt?: string;
  endsAt?: string;
};

export function isCampaignLayerActive(campaign: CampaignLayerState, now = new Date()): boolean {
  const status = campaign.status.toLowerCase();
  if (!["active", "live", "ready"].includes(status)) return false;
  const startsAt = campaign.startsAt ? new Date(campaign.startsAt) : null;
  const endsAt = campaign.endsAt ? new Date(campaign.endsAt) : null;
  if (startsAt && now < startsAt) return false;
  if (endsAt && now > endsAt) return false;
  return true;
}
