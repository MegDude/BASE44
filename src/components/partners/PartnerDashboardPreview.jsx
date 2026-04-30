import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";
import { ROUTES } from "@/lib/routes";

export default function PartnerDashboardPreview({ copy, metrics, answer }) {
  return (
    <SectionShell id="partner-proof" eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-[20px] bg-[rgba(247,247,251,0.9)] p-4">
                <div className="text-[1.6rem] font-semibold tracking-[-0.04em] text-[var(--dp-navy,#111827)]">{metric.value}</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <Link
              to={ROUTES.partnerDashboard}
              className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-5 py-3 text-sm font-semibold text-white"
            >
              Open partner dashboard
            </Link>
          </div>
        </div>
        <div className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-[rgba(255,255,255,0.78)] p-6 backdrop-blur-[18px]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">Answer</div>
          <div className="mt-2 text-[12px] uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">12 answers</div>
          <h3 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">Live from the map</h3>
          <div className="mt-4 rounded-[22px] bg-[var(--dp-navy,#111827)] p-5 text-white">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">{answer.entityType}</div>
            <div className="mt-2 text-[1.2rem] font-semibold tracking-[-0.03em]">{answer.entityName}</div>
            <div className="mt-2 text-[13px] leading-6 text-white/74">
              {answer.district.toLowerCase()} · {answer.address}
            </div>
            <div className="mt-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
              +{answer.capturedActivity} captured activity
            </div>
            <div className="mt-1 text-[12px] uppercase tracking-[0.12em] text-white/66">
              {answer.redemptions} redemptions
            </div>
          </div>
          <h4 className="mt-5 text-[15px] font-semibold text-[var(--dp-navy,#111827)]">{answer.directAnswer}</h4>
          <p className="mt-3 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{answer.explanation}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {[
              { label: "Scans", value: String(answer.scans) },
              { label: "Visits", value: String(answer.visits) },
              { label: "Redemptions", value: String(answer.redemptions) },
              { label: "Peak", value: "captured activity" },
            ].map((metric) => (
              <div key={metric.label} className="rounded-[18px] bg-[rgba(247,247,251,0.9)] p-3">
                <div className="text-[14px] font-semibold text-[var(--dp-navy,#111827)]">{metric.value}</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
