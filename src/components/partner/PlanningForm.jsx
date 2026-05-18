import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * PlanningForm — Integrated intake form for all partner types
 */
export default function PlanningForm({ partnerType, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    organization: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <section className="border-b border-[rgba(11,31,51,0.08)] py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-6 text-left">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-[32px] md:text-[40px] font-bold text-[#111] leading-tight tracking-tight mb-4">
            Ready to launch?
          </h3>
          <p className="mb-8 text-[15px] text-muted-foreground">
            Tell us about your {partnerType?.toLowerCase() || 'partnership'} and we'll help you get up and running.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
                className="h-12 rounded-xl border border-[rgba(11,31,51,0.08)] bg-white px-4 text-[14px] placeholder:text-foreground/38 focus:border-[#111] focus:outline-none transition-colors"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="h-12 rounded-xl border border-[rgba(11,31,51,0.08)] bg-white px-4 text-[14px] placeholder:text-foreground/38 focus:border-[#111] focus:outline-none transition-colors"
              />
            </div>

            <input
              type="text"
              name="organization"
              placeholder="Organization / Property name"
              value={formData.organization}
              onChange={handleChange}
              className="h-12 w-full rounded-xl border border-[rgba(11,31,51,0.08)] bg-white px-4 text-[14px] placeholder:text-foreground/38 focus:border-[#111] focus:outline-none transition-colors"
            />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="h-12 w-full rounded-xl border border-[rgba(11,31,51,0.08)] bg-white px-4 text-[14px] text-foreground/78 focus:border-[#111] focus:outline-none transition-colors"
            >
              <option value="">Select your role</option>
              <option value="owner">Owner / Principal</option>
              <option value="manager">Manager</option>
              <option value="marketing">Marketing / Operations</option>
              <option value="other">Other</option>
            </select>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#111] text-white font-semibold text-[14px] hover:bg-[#2a2a2a] transition-colors flex items-center justify-center gap-2"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-left text-[12px] text-muted-foreground">
            We'll be in touch within 24 hours to discuss your next steps.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
