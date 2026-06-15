import { Link, useParams } from "react-router-dom";
import { partnerRoleConfig } from "@/data/partnerRoleConfig";

export default function PartnerRolePage() {
  const { role = "venue" } = useParams();
  const config = partnerRoleConfig[role] || partnerRoleConfig.venue;
  return (
    <main className="min-h-screen bg-[#F7F8FB] px-5 py-16 text-[#071B2F] md:px-10">
      <section className="mx-auto grid max-w-5xl gap-8 rounded-[18px] border border-[rgba(7,27,47,0.08)] bg-white p-6 md:grid-cols-[1.2fr_.8fr] md:p-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">{config.label}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] md:text-6xl">{config.hook}</h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-7 text-[rgba(7,27,47,0.68)]">{config.audience}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/partners/campaigns#launch-campaign" className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[#071B2F] px-5 text-[12px] font-bold uppercase tracking-[0.1em] text-white">{config.cta}</Link>
            <Link to="/map?mode=partner&tab=campaigns" className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[rgba(7,27,47,0.18)] bg-white px-5 text-[12px] font-bold uppercase tracking-[0.1em] text-[#071B2F]">Open map</Link>
          </div>
        </div>
        <aside className="grid gap-4">
          <div className="rounded-[14px] border border-[rgba(7,27,47,0.08)] p-5">
            <strong>{config.pricing}</strong>
            <p className="mt-2 text-sm leading-6 text-[rgba(7,27,47,0.62)]">{config.campaignModule}</p>
          </div>
          {config.faqs.map((faq) => <div key={faq} className="border-t border-[rgba(7,27,47,0.08)] pt-4 text-sm font-semibold">{faq}</div>)}
        </aside>
      </section>
    </main>
  );
}

