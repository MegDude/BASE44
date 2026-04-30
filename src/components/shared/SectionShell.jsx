export default function SectionShell({
  id,
  eyebrow,
  title,
  body,
  children,
  variant = "default",
  className = "",
}) {
  const variants = {
    default: "bg-transparent",
    navy: "bg-[var(--dp-navy,#111827)] text-white",
    glass: "bg-[rgba(255,255,255,0.72)] backdrop-blur-[18px]",
    map: "bg-transparent",
    proof: "bg-transparent",
  };

  return (
    <section id={id} className={`px-4 py-16 md:px-6 md:py-24 ${variants[variant] || variants.default} ${className}`}>
      <div className="mx-auto w-full max-w-[1180px]">
        {(eyebrow || title || body) && (
          <div className="mb-8 max-w-3xl md:mb-10">
            {eyebrow ? (
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold,#CFAF5A)]">
                {eyebrow}
              </div>
            ) : null}
            {title ? (
              <h2 className="mt-3 font-heading text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-current md:text-[3rem]">
                {title}
              </h2>
            ) : null}
            {body ? (
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[rgba(71,85,105,0.94)]">
                {body}
              </p>
            ) : null}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
