import { PartnerDashboardShell } from '@/components/PartnerDashboardShell';
import type { PartnerTypeKey } from '@/lib/ecosystem-data';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const type = (params?.type as PartnerTypeKey) || 'venues';
  return <PartnerDashboardShell page="explorer" partnerType={type} />;
}
