import PartnerNarrativePage from "@/components/partners/PartnerNarrativePage";
import { getPartnerRoleConfig } from "@/content/partnerSystem";

export default function PropertiesPartner() {
  return <PartnerNarrativePage role={getPartnerRoleConfig("properties")} />;
}
