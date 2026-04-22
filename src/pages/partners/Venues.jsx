import PartnerLayerPage from "@/components/partner/PartnerLayerPage";
import { PARTNER_TYPE_CONTENT } from "@/lib/partnerContent";

export default function VenuesPartner() {
  return <PartnerLayerPage content={PARTNER_TYPE_CONTENT.venues} />;
}
