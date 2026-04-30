import { Link } from "react-router-dom";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { ROUTES } from "@/lib/routes";

export default function PartnerPageLayout({ title, subtitle, children }) {
  return (
    <PageShell>
      <Section className="pb-12 pt-[120px]">
        <div className="max-w-3xl">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#cfaf5a]">
            Partner system
          </div>
          <h1 className="font-heading text-[40px] font-semibold leading-[0.96] tracking-[-0.045em] text-[#1A1D2B] md:text-[58px]">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-500">{subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={ROUTES.partners} className="bg-[#1A1D2B] px-5 py-3 text-[13px] font-semibold text-white">
              Partner overview
            </Link>
            <Link
              to={ROUTES.partnerDashboard}
              className="border border-[rgba(26,29,43,0.12)] bg-white/70 px-5 py-3 text-[13px] font-semibold text-[#1A1D2B]"
            >
              Open dashboard
            </Link>
          </div>
        </div>
      </Section>

      {children}
    </PageShell>
  );
}
