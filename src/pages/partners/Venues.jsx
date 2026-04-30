import PartnerNarrativePage from "@/components/partners/PartnerNarrativePage";
import { getPartnerRoleConfig } from "@/content/partnerSystem";

export default function VenuesPartner() {
  return <PartnerNarrativePage role={getPartnerRoleConfig("venues")} />;
}
