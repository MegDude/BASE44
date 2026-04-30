export default function SectionHeader({
  eyebrow,
  title,
  description,
}) {
  return (
    <header className="max-w-[720px]">
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-heading text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--dp-navy,#0B1F33)] md:text-[2.6rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-[720px] text-[15px] font-medium leading-7 text-[rgba(11,31,51,0.68)]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
