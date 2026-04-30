import PageShell from "@/components/layout/PageShell";
import PartnerDashboardHero from "@/components/dashboard/PartnerDashboardHero";
import PartnerDashboardNav from "@/components/dashboard/PartnerDashboardNav";
import PartnerDashboardOverview from "@/components/dashboard/PartnerDashboardOverview";
import { partnerDashboardCopy } from "@/content/partnerDashboardCopy";
import {
  partnerDashboardAnswer,
  partnerDashboardControls,
  partnerDashboardMetrics,
  partnerSignalFeed,
} from "@/data/partnerDashboardData";

export default function PartnerDashboardUnified() {
  return (
    <PageShell className="bg-[#F7F7FB] text-[#111827]">
      <PartnerDashboardHero copy={partnerDashboardCopy.hero} />
      <PartnerDashboardNav items={partnerDashboardCopy.nav} />
      <PartnerDashboardOverview
        copy={partnerDashboardCopy.overview}
        metrics={partnerDashboardMetrics}
        controls={partnerDashboardControls}
        answer={partnerDashboardAnswer}
        signalFeed={partnerSignalFeed}
      />
    </PageShell>
  );
}
