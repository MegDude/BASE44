export function PerkIdentityHeader({
  venueName,
  offerName,
  qrCodeSrc,
  qrCodeAlt,
  qrCodeFallbackSrc,
  meta = [],
  titleId = "dp-perk-detail-title",
}) {
  const accessibleName = [venueName, offerName].filter(Boolean).join(" ");
  const visibleMeta = meta.filter(Boolean);

  return (
    <section className="dp-perk-identity-header" aria-labelledby={titleId}>
      <div className="dp-perk-identity-qr">
        <img
          src={qrCodeSrc}
          alt={qrCodeAlt || `QR code for ${accessibleName}`}
          width="76"
          height="76"
          loading="eager"
          decoding="async"
          onError={qrCodeFallbackSrc ? (event) => {
            if (!event.currentTarget.src.endsWith(qrCodeFallbackSrc)) {
              event.currentTarget.src = qrCodeFallbackSrc;
            }
          } : undefined}
        />
      </div>

      <div className="dp-perk-identity-copy">
        <p className="dp-perk-identity-venue">{venueName}</p>
        <h1 id={titleId} className="dp-perk-identity-title">{offerName}</h1>
        {visibleMeta.length ? (
          <div className="dp-perk-identity-meta">
            {visibleMeta.map((item, index) => (
              <span key={`${item}-${index}`}>
                {index > 0 ? <span aria-hidden="true"> · </span> : null}
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
