import PartnerLayerPage from "@/components/partner/PartnerLayerPage";
import { PARTNER_TYPE_CONTENT } from "@/lib/partnerContent";

export default function HotelsPartner() {
  return <PartnerLayerPage content={PARTNER_TYPE_CONTENT.hospitality} />;
}
