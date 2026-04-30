import { useMemo, useState } from "react";
import PageShell from "@/components/layout/PageShell";
import BrandShowcase from "@/components/partners/BrandShowcase";
import OperatingModel from "@/components/partners/OperatingModel";
import PartnerDashboardPreview from "@/components/partners/PartnerDashboardPreview";
import PartnerEventsPreview from "@/components/partners/PartnerEventsPreview";
import PartnerExamplesGrid from "@/components/partners/PartnerExamplesGrid";
import PartnerFAQ from "@/components/partners/PartnerFAQ";
import PartnerInfrastructureModules from "@/components/partners/PartnerInfrastructureModules";
import PartnerPlatformTabs from "@/components/partners/PartnerPlatformTabs";
import PartnerProofMap from "@/components/partners/PartnerProofMap";
import PartnerRolePanel from "@/components/partners/PartnerRolePanel";
import PartnersHero from "@/components/partners/PartnersHero";
import ResidentialLayerPreview from "@/components/partners/ResidentialLayerPreview";
import SystemLogic from "@/components/partners/SystemLogic";
import { partnerDashboardCopy } from "@/content/partnerDashboardCopy";
import { partnersPageCopy } from "@/content/partnersPageCopy";
import {
  featuredProperties,
  infrastructureModules,
  operatingRules,
  partnerEvents,
  partnerExamples,
  partnerFaqs,
  partnerRoles,
  residentialPropertyDetails,
  showcaseExamples,
} from "@/data/partnersPageData";
import {
  partnerDashboardAnswer,
  partnerDashboardMetrics,
} from "@/data/partnerDashboardData";

export default function PartnersIndex() {
  const [activeRoleId, setActiveRoleId] = useState("properties");

  const activeRole = useMemo(
    () => partnerRoles.find((role) => role.id === activeRoleId) || partnerRoles[0],
    [activeRoleId]
  );

  return (
    <PageShell className="bg-[#F7F7FB] text-[#111827]">
      <PartnersHero copy={partnersPageCopy.hero} />
      <SystemLogic copy={partnersPageCopy.systemLogic} />
      <PartnerPlatformTabs
        copy={partnersPageCopy.partnerPlatform}
        roles={partnerRoles}
        activeRole={activeRole.id}
        onChange={setActiveRoleId}
      />
      <PartnerRolePanel role={activeRole} />
      <PartnerProofMap copy={partnersPageCopy.liveMap} activeRole={activeRole.id} />
      <OperatingModel copy={partnersPageCopy.operatingModel} rules={operatingRules} />
      <PartnerInfrastructureModules modules={infrastructureModules} />
      <PartnerEventsPreview copy={partnersPageCopy.events} events={partnerEvents} />
      <ResidentialLayerPreview
        copy={partnersPageCopy.residentialLayer}
        properties={featuredProperties}
        details={residentialPropertyDetails}
      />
      <PartnerDashboardPreview
        copy={partnersPageCopy.dashboardPreview}
        metrics={partnerDashboardMetrics}
        answer={partnerDashboardAnswer}
      />
      <PartnerExamplesGrid copy={partnersPageCopy.partnerExamples} examples={partnerExamples} />
      <PartnerFAQ copy={partnersPageCopy.faq} items={partnerFaqs} />
      <BrandShowcase copy={partnersPageCopy.brandShowcase} items={showcaseExamples} />
    </PageShell>
  );
}
