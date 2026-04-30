import { Link } from "react-router-dom";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import MapShell from "@/components/map/MapShell";
import PartnerPageLayout from "@/components/partners/PartnerPageLayout";
import { ROUTES } from "@/lib/routes";

export default function PartnerNarrativePage({ role }) {
  return (
    <PartnerPageLayout title={role.title} subtitle={role.subtitle}>
      <Section className="border-t border-[rgba(26,29,43,0.08)] pt-12">
        <SectionHeader
          title="Context"
          subtitle="Different roles, same system. The map stays central and the story changes based on how this partner shows up."
        />
        <div className="max-w-3xl">
          <p className="text-[16px] leading-8 text-slate-600">{role.context}</p>
        </div>
      </Section>

      <Section className="border-t border-[rgba(26,29,43,0.08)] pt-12">
        <SectionHeader title="What this partner gets" />
        <div className="grid gap-6 md:grid-cols-3">
          {role.whatItGets.map((item) => (
            <div key={item} className="border-t border-[rgba(26,29,43,0.12)] pt-4">
              <p className="text-[15px] leading-7 text-slate-600">{item}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-t border-[rgba(26,29,43,0.08)] pt-12">
        <SectionHeader title="How it works" subtitle="Hero to context to action, without stacked repeated explainers." />
        <div className="grid gap-6 md:grid-cols-3">
          {role.howItWorks.map((item, index) => (
            <div key={item} className="space-y-3">
              <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#cfaf5a]">
                {`0${index + 1}`}
              </div>
              <p className="text-[15px] leading-7 text-slate-600">{item}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="border-t border-[rgba(26,29,43,0.08)]">
        <Section className="pb-8 pt-12">
          <SectionHeader
            title="Map"
            subtitle="The partner layer should feel like the same downtown system, just with a different point of view."
          />
        </Section>
        <MapShell mode={role.mapMode} compact />
      </section>

      <Section className="border-t border-[rgba(26,29,43,0.08)] pt-12">
        <SectionHeader title="Call to action" subtitle="Move into the right next step without leaving the partner system." />
        <div className="flex flex-wrap gap-3">
          <Link to={role.href} className="bg-[#1A1D2B] px-5 py-3 text-[13px] font-semibold text-white">
            {role.ctaLabel}
          </Link>
          <Link
            to={ROUTES.partnerDashboard}
            className="border border-[rgba(26,29,43,0.12)] bg-white/70 px-5 py-3 text-[13px] font-semibold text-[#1A1D2B]"
          >
            See the dashboard
          </Link>
          <Link
            to={ROUTES.partnerWorkspace}
            className="border border-[rgba(26,29,43,0.12)] bg-white/70 px-5 py-3 text-[13px] font-semibold text-[#1A1D2B]"
          >
            Manage workspace
          </Link>
        </div>
      </Section>
    </PartnerPageLayout>
  );
}
