import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";
import { getSharedCta } from "@/components/shared/CTARegistry";

export default function HomeStartSummary({ copy }) {
  const workspace = getSharedCta("startPilot");
  const contact = getSharedCta("contact");

  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {copy.roles.map((role) => (
          <article key={role.label} className="rounded-[24px] border border-[rgba(15,23,42,0.10)] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
              {role.label}
            </div>
            <p className="mt-3 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{role.body}</p>
            <div className="mt-4">
              <Link
                to={role.href}
                className="inline-flex min-h-[40px] items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.10)] bg-[rgba(247,247,251,0.9)] px-4 py-2 text-sm font-semibold text-[var(--dp-navy,#111827)]"
              >
                {role.cta}
              </Link>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={copy.workspaceHref || workspace.href} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-5 py-3 text-sm font-semibold text-white">
          {copy.workspaceCta || workspace.label}
        </Link>
        <a href={contact.href} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.10)] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]">
          {contact.label}
        </a>
      </div>
    </SectionShell>
  );
}
