import { PARTNER_MICROSITE_REGISTRY } from "./partnerMicrositeRegistry";

export type MicrositeRelationship = {
  fromId: string;
  toId: string;
  kind: "portfolio" | "property" | "nearby" | "campaign" | "event" | "operator";
  verified: boolean;
};

export const MICROSITE_RELATIONSHIPS: MicrositeRelationship[] = [];

export function getRelatedMicrosites(id: string) {
  const relatedIds = MICROSITE_RELATIONSHIPS
    .filter((relationship) => relationship.verified && (relationship.fromId === id || relationship.toId === id))
    .map((relationship) => relationship.fromId === id ? relationship.toId : relationship.fromId);
  return PARTNER_MICROSITE_REGISTRY.filter((record) => relatedIds.includes(record.id) && record.publicApproved);
}
