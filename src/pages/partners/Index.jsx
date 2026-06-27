import {
  DynamicIntakeWorkflow,
  PartnerFAQ,
  PartnerHero,
  RotatingPartnerSystem,
  SharedOperatingLayer,
} from "@/components/partners/PartnerHomepageSections";

export default function PartnersIndex() {
  return (
    <div className="dp-partner-home min-h-screen bg-white text-[#0B1F33]">
      <PartnerHero />
      <SharedOperatingLayer />
      <RotatingPartnerSystem />
      <PartnerFAQ />
      <DynamicIntakeWorkflow />
    </div>
  );
}
