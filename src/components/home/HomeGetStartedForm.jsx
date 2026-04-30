import { useState } from "react";
import SectionShell from "@/components/shared/SectionShell";

function buildMailto(fields, values) {
  const body = fields
    .map((field) => `${field.label}: ${values[field.name] || ""}`)
    .join("\n");

  return `mailto:hello@downtownperks.com?subject=${encodeURIComponent("Downtown Perks inquiry")}&body=${encodeURIComponent(body)}`;
}

export default function HomeGetStartedForm({ copy, fields }) {
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (typeof window !== "undefined") {
      window.location.href = buildMailto(fields, values);
    }
  };

  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-0 overflow-hidden rounded-[30px] border border-[rgba(15,23,42,0.08)] bg-white/88 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="bg-[var(--dp-navy,#111827)] px-6 py-8 text-white md:px-8 md:py-10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold,#CFAF5A)]">
            Start here
          </div>
          <h3 className="mt-4 text-[1.8rem] font-semibold tracking-[-0.04em]">Tell us what kind of partner you are.</h3>
          <p className="mt-4 text-[15px] leading-8 text-white/76">
            We will route you into the right pilot, property flow, venue setup, or partner conversation without making the homepage do the whole job.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 px-6 py-8 md:grid-cols-2 md:px-8 md:py-10">
          {fields.map((field) => (
            <label
              key={field.name}
              className={`grid gap-2 text-sm font-medium text-[var(--dp-navy,#111827)] ${
                field.name === "goals" || field.name === "businessName" ? "md:col-span-2" : ""
              }`}
            >
              <span>{field.label}</span>
              <input
                name={field.name}
                type={field.type}
                value={values[field.name] || ""}
                onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                className="min-h-[48px] rounded-[14px] border border-[rgba(15,23,42,0.10)] bg-white px-4 text-sm text-[var(--dp-navy,#111827)] outline-none focus:ring-2 focus:ring-[rgba(7,27,47,0.14)]"
              />
            </label>
          ))}
          <div className="md:col-span-2 flex flex-col gap-3">
            <button
              type="submit"
              className="inline-flex min-h-[52px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-6 py-3 text-sm font-semibold text-white"
            >
              Send request
            </button>
            {submitted ? (
              <p className="text-sm text-[rgba(71,85,105,0.94)]">
                Your message is ready to send. If your email app did not open, email hello@downtownperks.com.
              </p>
            ) : null}
          </div>
        </form>
      </div>
    </SectionShell>
  );
}
