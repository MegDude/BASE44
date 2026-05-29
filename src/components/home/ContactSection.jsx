import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const forms = [
  {
    id: "buildings",
    label: "Buildings",
    headline: "90-day free pilot.",
    sub: "See what residents actually do.",
    fields: [
      { name: "property", label: "Building Name & Address", type: "text" },
      { name: "name", label: "Your Name & Role", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "units", label: "Number of Units", type: "number" },
      { name: "goals", label: "Any specific goals? (Optional)", type: "text" },
    ],
    cta: "Start Free Pilot",
  },
  {
    id: "hotels",
    label: "Hotels",
    headline: "Extend the stay",
    sub: "beyond your lobby.",
    fields: [
      { name: "property", label: "Hotel / Property Name", type: "text" },
      { name: "name", label: "Your Name & Role", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "rooms", label: "Number of Rooms", type: "number" },
    ],
    cta: "Use This for Guests",
  },
  {
    id: "venues",
    label: "Venues",
    headline: "Free for 12 months.",
    sub: "Zero sign-up fees.",
    fields: [
      { name: "business", label: "Business Name", type: "text" },
      { name: "name", label: "Your Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "address", label: "Street Address", type: "text" },
      { name: "perk", label: "What perk will you offer?", type: "text" },
    ],
    cta: "Discuss Activation",
  },
  {
    id: "brands",
    label: "Brands",
    headline: "Buy the moment,",
    sub: "not the impression.",
    fields: [
      { name: "brand", label: "Brand / Company Name", type: "text" },
      { name: "name", label: "Your Name & Role", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
    ],
    cta: "Start a Conversation",
  },
  {
    id: "civic",
    label: "Civic",
    headline: "Turn attendance",
    sub: "into participation.",
    fields: [
      { name: "org", label: "Organization Name", type: "text" },
      { name: "name", label: "Your Name & Role", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "focus", label: "Geographic Focus (Which blocks/corridors)", type: "text" },
    ],
    cta: "Talk to Us",
  },
  {
    id: "realestate",
    label: "Real Estate",
    headline: "Turn foot traffic",
    sub: "into qualified leads.",
    fields: [
      { name: "name", label: "Your Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "brokerage", label: "Brokerage", type: "text" },
      { name: "listings", label: "Active Listings in Downtown Austin", type: "number" },
    ],
    cta: "Discuss Lead Integration",
  },
  {
    id: "residents",
    label: "Residents",
    headline: "Check if your building",
    sub: "is part of Downtown Perks.",
    fields: [
      { name: "name", label: "Your Name", type: "text" },
      { name: "phone", label: "Phone (used for QR card login)", type: "tel" },
      { name: "email", label: "Email (optional)", type: "email" },
      { name: "building", label: "Building Address", type: "text" },
    ],
    cta: "Get My Perks Card",
  },
];

function ContactForm({ form }) {
  const [values, setValues] = useState({});
  return (
    <div className="space-y-3">
      {form.fields.map((f) => (
        <div key={f.name}>
          <label className="block text-[11px] font-medium text-foreground/50 uppercase tracking-[0.1em] mb-1.5">
            {f.label}
          </label>
          <input
            type={f.type}
            value={values[f.name] || ""}
            onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
            className="w-full bg-[#F7F8FB] border border-[#0B1F33]/8 rounded-lg px-4 py-2.5 text-[13px] text-foreground placeholder-foreground/30 focus:outline-none focus:border-[#0B1F33]/12 transition-colors"
          />
        </div>
      ))}
      <button className="mt-4 w-full px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all duration-300">
        {form.cta}
      </button>
    </div>
  );
}

export default function ContactSection() {
  const [activeForm, setActiveForm] = useState("buildings");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const current = forms.find((f) => f.id === activeForm);

  return (
    <section id="contact" ref={ref} className="py-20 px-5 border-t border-[#0B1F33]/8 bg-[#F7F8FB]">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[11px] font-medium text-primary/80 uppercase tracking-[0.16em] block mb-4">
              Get Started
            </span>
            <h2 className="font-heading text-3xl md:text-[38px] font-medium leading-[1.1] tracking-normal text-foreground">
              Ready when
              <br />
              <em className="text-primary">you are.</em>
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="text-foreground/60 text-[13px] leading-relaxed mb-4">
              People don't choose the best option. They choose the one they notice.
            </p>
            <div className="flex flex-col gap-1.5 text-[12px] text-foreground/50">
              <span className="font-medium text-foreground/70">For residents — Stop searching. Start doing.</span>
              <span className="font-medium text-foreground/70">For partners — Be the one they notice.</span>
            </div>
          </motion.div>
        </div>

        {/* Form panel */}
        <div className="border border-[#0B1F33]/8 rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(11,31,51,0.05)]">
          {/* Tabs */}
          <div className="flex border-b border-[#0B1F33]/8 overflow-x-auto bg-white">
            {forms.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveForm(f.id)}
                className={`px-5 py-4 text-[11px] font-medium whitespace-nowrap border-r border-[#0B1F33]/8 last:border-r-0 transition-all ${
                  activeForm === f.id
                    ? "text-[#0B1F33] bg-[#0B1F33]/[0.04]"
                    : "text-foreground/55 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Form */}
            <div className="p-8 md:border-r border-[#0B1F33]/8 bg-white">
              <motion.div
                key={activeForm}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-heading text-2xl font-medium leading-[1.08] mb-1.5 text-foreground">{current.headline}</h3>
                <p className="text-foreground/55 text-[13px] mb-6">{current.sub}</p>
                <ContactForm form={current} />
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="p-8 bg-[#F7F8FB] flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-medium text-foreground/50 uppercase tracking-[0.12em] mb-4">
                  Also Available
                </div>
                <div className="space-y-2">
                  {forms.filter(f => f.id !== activeForm).slice(0, 4).map(f => (
                    <button
                      key={f.id}
                      onClick={() => setActiveForm(f.id)}
                      className="flex items-center justify-between w-full p-3 rounded-lg border border-[#0B1F33]/8 bg-white hover:border-[#0B1F33]/10 text-left transition-all group"
                    >
                      <div>
                        <div className="text-[13px] font-medium text-foreground">{f.label}</div>
                        <div className="text-[11px] text-foreground/50 mt-0.5">{f.headline} {f.sub}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-foreground/25 group-hover:text-primary transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-[#0B1F33]/8 space-y-1">
                <p className="text-[12px] text-foreground/50 italic">
                  Prefer email?{" "}
                  <a href="mailto:hello@downtownperks.com" className="text-primary hover:underline underline-offset-4">
                    hello@downtownperks.com
                  </a>
                </p>
                <p className="text-[11px] text-foreground/35 mt-2">Downtown Perks · Powered by Boop · Austin, Texas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <Link to="/map?mode=resident&tab=map" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#0B1F33]/8 text-foreground/70 font-medium text-[13px] hover:text-foreground hover:border-[#0B1F33]/10 transition-all duration-300">
            Explore Downtown
          </Link>
          <Link to="/downtown-perks/for-buildings" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#0B1F33]/8 text-foreground/70 font-medium text-[13px] hover:text-foreground hover:border-[#0B1F33]/10 transition-all duration-300">
            Become a Partner
          </Link>
          <Link to="/map?mode=resident&tab=map" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#0B1F33]/8 text-foreground/50 font-medium text-[13px] hover:text-foreground transition-all duration-300">
            Check Availability
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
