import { ResidentAppShell } from '@/components/ResidentAppShell';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ station?: string }>;
}) {
  const params = await searchParams;
  const stationId = Number(params?.station || '1');
  return <ResidentAppShell page="station" stationId={Number.isFinite(stationId) && stationId > 0 ? stationId : 1} />;
}
