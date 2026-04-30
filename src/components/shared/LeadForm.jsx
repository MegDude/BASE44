import { useState } from "react";

export default function LeadForm({ fields = [], submitLabel = "Submit", successMessage = "Thanks. We’ll follow up soon." }) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        {fields.map((field) => (
          <label key={field.name} className="grid gap-2 text-sm font-medium text-[var(--dp-navy,#111827)]">
            <span>{field.label}</span>
            <input
              name={field.name}
              type={field.type}
              className="min-h-[46px] rounded-[16px] border border-[rgba(15,23,42,0.10)] bg-white px-4 text-sm text-[var(--dp-navy,#111827)] outline-none placeholder:text-[rgba(71,85,105,0.62)]"
            />
          </label>
        ))}
      </div>
      <button
        type="submit"
        className="inline-flex min-h-[46px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-5 py-3 text-sm font-semibold text-white"
      >
        {submitLabel}
      </button>
      {submitted ? (
        <p className="text-sm text-[rgba(71,85,105,0.94)]">{successMessage}</p>
      ) : null}
    </form>
  );
}
