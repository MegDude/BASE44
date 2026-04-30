import BackButton from "@/components/layout/BackButton";

export default function AudienceHero({
  kicker,
  title,
  description,
  primaryLabel = "Open the map",
  primaryHref = "/map",
  secondaryLabel = "See dashboard",
  secondaryHref = "/partners/dashboard",
  showBack = true
}) {
  const hasActions = Boolean(primaryLabel || secondaryLabel);

  return (
    <section className="dp-section">
      <div className="dp-page-shell">
        {showBack && <BackButton fallback="/partners" />}
        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="dp-page-kicker">{kicker}</p>
            <h1 className="mt-3 dp-page-title text-[clamp(3rem,7vw,6.5rem)]">{title}</h1>
          </div>
          <div>
            <p className="dp-page-intro">{description}</p>
            {hasActions ? (
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {primaryLabel ? <a href={primaryHref} className="dp-cta-primary">{primaryLabel}</a> : null}
                {secondaryLabel ? <a href={secondaryHref} className="dp-cta-secondary">{secondaryLabel}</a> : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
