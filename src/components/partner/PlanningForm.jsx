import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * PlanningForm — Integrated intake form for all partner types
 */
export default function PlanningForm({ partnerType, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    role: '',
    organization: '',
    phone: '',
    propertyType: '',
    goals: [],
    goal: '',
    notes: '',
  });
  const [submitState, setSubmitState] = useState("idle");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
      return;
    }

    setSubmitState("submitting");

    try {
      const response = await fetch("/api/partner-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partner_type: config.partnerTypeKey || "property",
          organization_name: formData.organization || formData.name,
          contact_name: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          property_type: formData.propertyType,
          goals: formData.goals,
          message: formData.notes || formData.goal,
          source_page: typeof window !== "undefined" ? window.location.pathname : "/partners",
        }),
      });

      if (!response.ok) {
        setSubmitState("error");
        return;
      }

      setSubmitState("success");
      setFormData({
        name: '',
        contactName: '',
        email: '',
        role: '',
        organization: '',
        phone: '',
        propertyType: '',
        goals: [],
        goal: '',
        notes: '',
      });
    } catch {
      setSubmitState("error");
    }
  };

  const config = partnerType || {};
  const title = config.title || "Ready to launch?";
  const intro =
    config.intro ||
    `Tell us about your ${config.label?.toLowerCase() || 'partnership'} and we'll help you get up and running.`;
  const variant = config.variant || "section";
  const roleOptions = config.roleOptions || [
    'Property',
    'Hotel',
    'Venue',
    'Brand',
    'Civic',
  ];
  const submitLabel = config.submitLabel || "Get started";
  const notes = config.notes || "We'll be in touch within 24 hours to discuss your next steps.";
  const footer = config.footer || null;
  const prompts = config.prompts || [];
  const recommendation = config.recommendation || null;
  const propertyTypeOptions = config.propertyTypeOptions || [];
  const notesPlaceholder = config.notesPlaceholder || "Tell us what you want to set up.";
  const submitExpectation = config.submitExpectation || null;

  const applyPrompt = (prompt) => {
    const nextGoals = Array.from(new Set([...(formData.goals || []), prompt]));
    setFormData((current) => ({
      ...current,
      goals: nextGoals,
      goal: nextGoals.join(" | "),
      notes: current.notes || prompt,
    }));
  };

  const toggleGoal = (goal) => {
    setFormData((current) => {
      const currentGoals = current.goals || [];
      const nextGoals = currentGoals.includes(goal)
        ? currentGoals.filter((item) => item !== goal)
        : [...currentGoals, goal];

      return {
        ...current,
        goals: nextGoals,
        goal: nextGoals.join(" | "),
      };
    });
  };

  const formFields = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="organization"
          placeholder={config.organizationLabel || "Hotel name"}
          value={formData.organization}
          onChange={handleChange}
          className="w-full h-12 px-4 rounded-xl border border-[#e8e5df] bg-white text-[14px] placeholder:text-[#9d9890] focus:border-[#111] focus:outline-none transition-colors"
        />
        <input
          type="text"
          name="contactName"
          placeholder={config.contactLabel || "Contact name"}
          value={formData.contactName}
          onChange={handleChange}
          className="w-full h-12 px-4 rounded-xl border border-[#e8e5df] bg-white text-[14px] placeholder:text-[#9d9890] focus:border-[#111] focus:outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="role"
          placeholder={config.roleLabel || "Role"}
          value={formData.role}
          onChange={handleChange}
          className="w-full h-12 px-4 rounded-xl border border-[#e8e5df] bg-white text-[14px] placeholder:text-[#9d9890] focus:border-[#111] focus:outline-none transition-colors"
        />
        <input
          type="email"
          name="email"
          placeholder={config.emailLabel || "Work email"}
          value={formData.email}
          onChange={handleChange}
          className="h-12 px-4 rounded-xl border border-[#e8e5df] bg-white text-[14px] placeholder:text-[#9d9890] focus:border-[#111] focus:outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full h-12 px-4 rounded-xl border border-[#e8e5df] bg-white text-[14px] placeholder:text-[#9d9890] focus:border-[#111] focus:outline-none transition-colors"
        />
        {propertyTypeOptions.length ? (
          <select
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            className="w-full h-12 px-4 rounded-xl border border-[#e8e5df] bg-white text-[14px] text-[#4a463f] focus:border-[#111] focus:outline-none transition-colors"
          >
            <option value="">Property type</option>
            {propertyTypeOptions.map((option) => (
              <option key={option} value={option.toLowerCase()}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full h-12 px-4 rounded-xl border border-[#e8e5df] bg-white text-[14px] text-[#4a463f] focus:border-[#111] focus:outline-none transition-colors"
          >
            <option value="">Select your role</option>
            {roleOptions.map((option) => (
              <option key={option} value={option.toLowerCase()}>
                {option}
              </option>
            ))}
          </select>
        )}
      </div>

      {prompts.length ? (
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8d887f]">
            What do you want to launch?
          </div>
          <div className="flex flex-wrap gap-2">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => toggleGoal(prompt)}
                className={`rounded-full border px-3 py-2 text-left text-[12px] transition ${
                  (formData.goals || []).includes(prompt)
                    ? "border-[#111] bg-[#f5f3ef] text-[#111]"
                    : "border-[#e8e5df] bg-[#faf8f4] text-[#4a463f] hover:border-[#111]"
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <textarea
        name="notes"
        placeholder={notesPlaceholder}
        value={formData.notes}
        onChange={handleChange}
        rows={variant === "embedded" ? 4 : 5}
        className="w-full rounded-xl border border-[#e8e5df] bg-white px-4 py-3 text-[14px] placeholder:text-[#9d9890] focus:border-[#111] focus:outline-none transition-colors"
      />

      <button
        type="submit"
        disabled={submitState === "submitting"}
        className="w-full h-12 rounded-xl bg-[#111] text-white font-semibold text-[14px] hover:bg-[#2a2a2a] transition-colors flex items-center justify-center gap-2"
      >
        {submitState === "submitting" ? "Submitting..." : submitLabel}
        <ArrowRight className="w-4 h-4" />
      </button>
      {submitState === "success" ? (
        <p className="text-[12px] text-[#6f6b65]">Thanks. We received your details.</p>
      ) : null}
      {submitState === "error" ? (
        <p className="text-[12px] text-[#9b3a2f]">Submission failed. Please try again.</p>
      ) : null}
    </>
  );

  if (variant === "embedded") {
    return (
      <div className="rounded-[24px] border border-[#e8e5df] bg-white p-5 shadow-[0_10px_24px_rgba(11,31,51,0.04)]">
        <h3 className="text-[26px] font-bold text-[#111] leading-tight tracking-tight mb-3">
          {title}
        </h3>
        <p className="text-[14px] text-[#6f6b65] mb-5">{intro}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formFields}
        </form>
        {submitExpectation ? (
          <p className="mt-4 text-[12px] text-[#6f6b65]">{submitExpectation}</p>
        ) : null}
        {notes ? <p className="text-[12px] text-[#8d887f] mt-3">{notes}</p> : null}
        {footer ? <p className="text-[12px] text-[#6f6b65] mt-2">{footer}</p> : null}
      </div>
    );
  }

  return (
    <section className="py-16 md:py-24 border-b border-[#e8e5df]">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h3 className="text-[32px] md:text-[40px] font-bold text-[#111] leading-tight tracking-tight mb-4">
                {title}
              </h3>
              <p className="text-[15px] text-[#6f6b65] mb-8">
                {intro}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {formFields}
              </form>

              <p className="text-[12px] text-[#8d887f] mt-6">
                {notes}
              </p>
              {submitExpectation ? (
                <p className="text-[12px] text-[#6f6b65] mt-3">
                  {submitExpectation}
                </p>
              ) : null}
              {footer ? (
                <p className="text-[12px] text-[#6f6b65] mt-3">
                  {footer}
                </p>
              ) : null}
            </div>

            <div className="space-y-6">
              {prompts.length ? (
                <div className="rounded-[24px] border border-[#e8e5df] bg-white p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8d887f] mb-4">
                    Prompts
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {prompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => applyPrompt(prompt)}
                        className="rounded-full border border-[#e8e5df] bg-[#faf8f4] px-3 py-2 text-left text-[12px] text-[#4a463f] transition hover:border-[#111]"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {recommendation ? (
                <div className="rounded-[24px] bg-[#111827] p-5 text-white">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55 mb-4">
                    {recommendation.title}
                  </div>
                  <div className="space-y-3 text-[13px] leading-6">
                    <div><strong>Recommended format</strong><br />{recommendation.format}</div>
                    <div><strong>Likely placements</strong><br />{recommendation.placements}</div>
                    <div><strong>Tracked metrics</strong><br />{recommendation.metrics}</div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
