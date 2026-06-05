import { waterlooParkCampaignPins } from "@/data/waterlooParkCampaignPins";

export default function WaterlooCampaignCard({ campaign = waterlooParkCampaignPins[0] }) {
  return (
    <article className="rounded-[8px] border border-[#0B1F33]/[0.08] bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">{campaign.category}</p>
      <h3 className="mt-2 text-[16px] font-semibold text-[#0B1F33]">{campaign.name}</h3>
      <p className="mt-3 whitespace-pre-line text-[13px] leading-6 text-[#0B1F33]/66">{campaign.campaignCardCopy}</p>
    </article>
  );
}
