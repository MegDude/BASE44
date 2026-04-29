import PartnerInterestForm from "@/components/forms/PartnerInterestForm";
import AudienceHero from "@/components/sections/AudienceHero";
import MapShell from "@/components/map/MapShell";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PARTNER_LANDING_SECTIONS, PARTNER_TYPE_CONTENT, PARTNER_TYPE_ORDER } from "@/lib/partnerContent";

export default function PartnersIndex() {
  return (
    <main>
      <AudienceHero
        kicker="Partner ecosystem"
        title="Show up where downtown decisions happen."
        description="Downtown Perks helps properties, venues, brands, hospitality groups, and civic partners connect with people nearby — then measure what happens next."
        primaryLabel={null}
        secondaryLabel={null}
        showBack={false}
      />

      <section id="partner-map">
        <MapShell mode="partners" compact initialQuery="properties venues brands civic downtown" />
      </section>

      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell">
          <div className="mb-8 max-w-3xl">
            <div className="dp-micro-label">Partner types</div>
            <h2 className="dp-heading-modern mt-4 text-[2rem] md:text-[2.8rem]">
              Start with the partner type, then move into map intelligence, rollout, and the right entry model.
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-muted-foreground">
              The point is not to force different partners into the same pitch. Each page should make it obvious what that role gets, how it fits into downtown, and what the first rollout looks like.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {PARTNER_TYPE_ORDER.map((key) => {
              const item = PARTNER_TYPE_CONTENT[key];
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_16px_36px_rgba(11,31,51,0.05)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="dp-micro-label">{item.eyebrow}</div>
                      <h3 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.03em] text-foreground">
                        {item.label}
                      </h3>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[rgba(11,31,51,0.05)] text-[var(--dp-navy)]">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  <p className="mt-4 text-[14px] leading-7 text-muted-foreground">
                    {item.description}
                  </p>

                  <div className="mt-4 space-y-3">
                    {item.outcomes.slice(0, 2).map((outcome, index) => (
                      <div key={outcome} className="flex items-start gap-3 rounded-[18px] bg-[rgba(11,31,51,0.03)] px-4 py-3">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-[var(--dp-navy)] shadow-[0_6px_14px_rgba(11,31,51,0.05)]">
                          {index + 1}
                        </span>
                        <span className="text-[13px] leading-6 text-[rgba(11,31,51,0.72)]">{outcome}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.metrics.slice(0, 2).map((metric) => (
                      <span
                        key={metric.label}
                        className="inline-flex items-center gap-2 rounded-full border border-[rgba(11,31,51,0.08)] bg-[rgba(11,31,51,0.03)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(11,31,51,0.6)]"
                      >
                        <span className="text-[var(--dp-navy)]">{metric.value}</span>
                        {metric.label}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link to={item.route} className="dp-cta-primary">
                      Open page
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link to="/partners/apply" className="dp-cta-secondary">
                      Apply to Be a Partner
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell">
          <div className="grid gap-4 md:grid-cols-3">
            {PARTNER_LANDING_SECTIONS.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.9)] p-5 shadow-[0_16px_30px_rgba(11,31,51,0.04)]">
                  <div className="inline-flex items-center gap-3 text-[var(--dp-navy)]">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(11,31,51,0.05)]">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[1.25rem] font-semibold tracking-[-0.03em] text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="partner-form" className="dp-section">
        <div className="dp-page-shell">
          <PartnerInterestForm
            partnerType="venue"
            source="partners_overview_page"
            title="Find the right partner path."
            description="Choose your role and the system will route the request without showing internal source fields."
            submitLabel="Apply to Be a Partner"
            successPrimaryHref="/partners/dashboard"
            successPrimaryLabel="View Dashboard"
            successSecondaryHref="/explore"
            successSecondaryLabel="Open the Map"
          />
        </div>
      </section>
    </main>
  );
}
