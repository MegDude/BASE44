import PartnerLayerPage from "@/components/partner/PartnerLayerPage";
import { PARTNER_TYPE_CONTENT } from "@/lib/partnerContent";

export default function PropertiesPartner() {
  return <PartnerLayerPage content={PARTNER_TYPE_CONTENT.properties} />;
}
