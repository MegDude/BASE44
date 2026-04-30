import PartnerInterestForm from "@/components/forms/PartnerInterestForm";

export default function PartnerApply() {
  return (
    <main className="min-h-screen bg-[var(--dp-surface-base)] pb-12 pt-[84px]">
      <section className="dp-page-shell">
        <div className="dp-band p-6 md:p-8 lg:p-10">
          <div className="max-w-3xl">
            <div className="dp-micro-label">Partner application</div>
            <h1 className="dp-display-section mt-4 text-[2.5rem] text-foreground md:text-[4rem]">
              Apply to be a Downtown Perks partner.
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">
              Tell us what you want to activate downtown. We will match the right partner path.
            </p>
          </div>
        </div>
      </section>

      <section className="dp-page-shell mt-4">
        <PartnerInterestForm
          partnerType="property"
          source="partner_apply_page"
          eventName="partner_apply_submitted"
          submitLabel="Apply now"
          title="Partner intake"
          description="Start with the role that fits. We will route the request without sending you through a separate system."
          successTitle="Thanks — your partner request has been saved for review."
          successDescription="You can keep exploring the map or open the partner dashboard preview while we review the request."
          successPrimaryHref="/explore"
          successPrimaryLabel="Open the Map"
          successSecondaryHref="/partners/dashboard"
          successSecondaryLabel="View Dashboard"
          includeWebsite
          nameLabel="Contact name"
          messageLabel="What do you want to activate downtown?"
          messagePlaceholder="Tell us what you want to activate downtown."
        />
      </section>
    </main>
  );
}
