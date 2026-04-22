import { Link } from "react-router-dom";

function FeatureCard({ title, body }) {
  return (
    <div className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white/70 p-5 shadow-[0_10px_24px_rgba(11,31,51,0.04)]">
      <div className="text-lg font-semibold tracking-[-0.03em] text-[var(--dp-navy,#0B1F33)]">
        {title}
      </div>
      <div className="mt-2 text-sm leading-6 text-[rgba(11,31,51,0.62)]">{body}</div>
    </div>
  );
}

export default function ResidentsPage() {
  return (
    <div className="min-h-screen bg-[#f6f2ea] pt-[68px] text-[var(--dp-navy,#0B1F33)]">
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(40,62%,42%)]">
              Resident Layer
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-[-0.055em] md:text-6xl">
              Everything nearby, in one map.
            </h1>
            <p className="mt-5 max-w-3xl text-[15px] leading-7 text-[rgba(11,31,51,0.66)]">
              Discover nearby places, events, and perks, save what matters, build a plan,
              and access your card without leaving the downtown layer.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/resident-dashboard"
                className="inline-flex h-12 items-center justify-center rounded-[12px] bg-[var(--dp-navy,#0B1F33)] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[rgba(11,31,51,0.9)]"
              >
                Open resident dashboard
              </Link>
              <Link
                to="/resident-dashboard/card"
                className="inline-flex h-12 items-center justify-center rounded-[12px] border border-[rgba(11,31,51,0.08)] bg-white/72 px-5 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy,#0B1F33)] transition hover:bg-white"
              >
                Get your card
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              title="Live map"
              body="See what is nearby right now with walkable context, events, and live offers."
            />
            <FeatureCard
              title="Saved and plan"
              body="Keep track of what matters, then turn it into a simple shortlist you can revisit."
            />
            <FeatureCard
              title="Card access"
              body="Unlock resident perks and identity-linked value when intent is real."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
