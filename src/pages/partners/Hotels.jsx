import PartnerTypeTemplate from "@/components/partner/PartnerTypeTemplate";
import { PARTNER_TYPE_CONTENT } from "@/lib/partnerContent";

export default function HotelsPartner() {
  return <PartnerTypeTemplate content={PARTNER_TYPE_CONTENT.hospitality} />;
}
