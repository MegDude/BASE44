import {
  DynamicIntakeWorkflow,
  IntelligenceLayer,
  PartnerFAQ,
  PartnerFinalCTA,
  PartnerHero,
  PartnerWorkspaceBridge,
  RotatingPartnerSystem,
  SharedOperatingLayer,
} from "@/components/partners/PartnerHomepageSections";

export default function PartnersIndex() {
  return (
    <div className="dp-partner-home min-h-screen bg-[#F7F8FB] text-[#0B1F33]">
      <PartnerHero />
      <SharedOperatingLayer />
      <RotatingPartnerSystem />
      <IntelligenceLayer />
      <PartnerFAQ />
      <DynamicIntakeWorkflow />
      <PartnerWorkspaceBridge />
      <PartnerFinalCTA />
    </div>
  );
}
