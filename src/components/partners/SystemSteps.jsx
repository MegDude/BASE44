export default function SystemSteps({ steps = [] }) {
  return (
    <section className="px-4 py-8 md:px-6 md:py-10">
      <div className="dp-page-shell">
        <div className="max-w-3xl">
          <div className="dp-micro-label">How the partner system works</div>
          <h2 className="dp-heading-modern mt-4 text-[2rem] md:text-[2.7rem]">
            Browse first. Show up at decision. See what worked.
          </h2>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="border-t border-[rgba(11,31,51,0.08)] pt-4">
              <div className="flex items-baseline gap-3">
                <span className="text-[0.95rem] font-semibold text-[var(--dp-gold-deep,#A97816)]">
                  0{index + 1}
                </span>
                <h3 className="text-[1.05rem] font-semibold text-[var(--dp-navy,#0B1F33)]">{step.title}</h3>
              </div>
              <p className="mt-3 max-w-[360px] text-[14px] leading-7 text-[rgba(11,31,51,0.68)]">
                {step.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
