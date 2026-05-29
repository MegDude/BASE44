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
    <section className="py-16 md:py-24 border-b border-[#0B1F33]/8">
      <div className="max-w-2xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-[32px] md:text-[40px] font-bold text-[#0B1F33] leading-tight tracking-normal mb-4">
            Ready to launch?
          </h3>
          <p className="text-[15px] text-[#6f6b65] mb-8">
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
                className="h-10 px-4 rounded-xl border border-[#0B1F33]/8 bg-white text-[14px] placeholder:text-[#0B1F33]/38 focus:border-[#0B1F33] focus:outline-none transition-colors"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="h-10 px-4 rounded-xl border border-[#0B1F33]/8 bg-white text-[14px] placeholder:text-[#0B1F33]/38 focus:border-[#0B1F33] focus:outline-none transition-colors"
              />
            </div>

            <input
              type="text"
              name="organization"
              placeholder="Organization / Property name"
              value={formData.organization}
              onChange={handleChange}
              className="w-full h-10 px-4 rounded-xl border border-[#0B1F33]/8 bg-white text-[14px] placeholder:text-[#0B1F33]/38 focus:border-[#0B1F33] focus:outline-none transition-colors"
            />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full h-10 px-4 rounded-xl border border-[#0B1F33]/8 bg-white text-[14px] text-[#0B1F33]/70 focus:border-[#0B1F33] focus:outline-none transition-colors"
            >
              <option value="">Select your role</option>
              <option value="owner">Owner / Principal</option>
              <option value="manager">Manager</option>
              <option value="marketing">Marketing / Operations</option>
              <option value="other">Other</option>
            </select>

            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-[#0B1F33] text-white font-semibold text-[14px] hover:bg-[#081521] transition-colors flex items-center justify-center gap-2"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[12px] text-[#0B1F33]/50 text-center mt-6">
            We'll be in touch within 24 hours to discuss your next steps.
          </p>
        </motion.div>
      </div>
    </section>
  );
}