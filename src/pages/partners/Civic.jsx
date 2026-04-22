import PartnerTypeTemplate from "@/components/partner/PartnerTypeTemplate";
import { PARTNER_TYPE_CONTENT } from "@/lib/partnerContent";

export default function CivicPartner() {
  return <PartnerTypeTemplate content={PARTNER_TYPE_CONTENT.civic} />;
}
