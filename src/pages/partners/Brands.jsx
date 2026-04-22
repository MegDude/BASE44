import PartnerLayerPage from "@/components/partner/PartnerLayerPage";
import PartnerBrandShowcase from "@/components/partner/PartnerBrandShowcase";
import { BRAND_SHOWCASE_GROUPS, PARTNER_TYPE_CONTENT } from "@/lib/partnerContent";

export default function BrandsPartner() {
  return (
    <PartnerLayerPage
      content={PARTNER_TYPE_CONTENT.brands}
      extraSection={<PartnerBrandShowcase groups={BRAND_SHOWCASE_GROUPS} />}
    />
  );
}
