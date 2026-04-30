import PartnerNarrativePage from "@/components/partners/PartnerNarrativePage";
import { getPartnerRoleConfig } from "@/content/partnerSystem";

export default function HotelsPartner() {
  return <PartnerNarrativePage role={getPartnerRoleConfig("hospitality")} />;
}
