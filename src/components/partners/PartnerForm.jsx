import PartnerInterestForm from "@/components/forms/PartnerInterestForm";

export default function PartnerForm({ defaultType = "venue" }) {
  return (
    <section id="partner-form" className="px-4 py-8 md:px-6 md:py-10">
      <div className="dp-page-shell">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] xl:items-start">
          <div className="max-w-[420px]">
            <div className="dp-micro-label">Start the right path</div>
            <h2 className="dp-heading-modern mt-4 text-[2rem] md:text-[2.7rem]">
              Route the request to the right partner setup.
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-muted-foreground">
              Use the same system whether you are launching a property layer, a venue offer, a hospitality rollout, a brand campaign, or a civic program.
            </p>
            <div className="mt-6 space-y-3">
              <div className="rounded-[18px] bg-[rgba(11,31,51,0.04)] px-4 py-3 text-[13px] leading-6 text-[rgba(11,31,51,0.68)]">
                Map visibility comes first so the public experience stays useful before it becomes transactional.
              </div>
              <div className="rounded-[18px] bg-[rgba(11,31,51,0.04)] px-4 py-3 text-[13px] leading-6 text-[rgba(11,31,51,0.68)]">
                Signals like saves, visits, scans, and redemptions help prove what is actually working.
              </div>
            </div>
          </div>

          <PartnerInterestForm
            partnerType={defaultType}
            source="partners_overview_page"
            title="Apply to the live downtown system."
            description="Tell us your role and what you want this to help you do. We will route the request into the right rollout path."
            submitLabel="Apply to Be a Partner"
            successPrimaryHref="/partners/dashboard"
            successPrimaryLabel="View Dashboard"
            successSecondaryHref="/explore"
            successSecondaryLabel="Open the Map"
          />
        </div>
      </div>
    </section>
  );
}
