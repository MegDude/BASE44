import PartnerNarrativePage from "@/components/partners/PartnerNarrativePage";
import { getPartnerRoleConfig } from "@/content/partnerSystem";

export default function CivicPartner() {
  return <PartnerNarrativePage role={getPartnerRoleConfig("civic")} />;
}
