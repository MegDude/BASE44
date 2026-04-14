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
    ],
    cta: "Start Free Pilot",
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
    id: "residents",
    label: "Residents",
    headline: "Check if your building is in.",
    sub: "Get your perks card.",
    fields: [
      { name: "name", label: "Your Name", type: "text" },
      { name: "phone", label: "Phone (used for QR card login)", type: "tel" },
      { name: "email", label: "Email (optional)", type: "email" },
      { name: "building", label: "Building Address", type: "text" },
    ],
    cta: "Get My Perks Card",
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
];

function ContactForm({ form }) {
  const [values, setValues] = useState({});
  return (
    <div className="space-y-3">
      {form.fields.map((f) => (
        <div key={f.name}>
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">
            {f.label}
          </label>
          <input
            type={f.type}
            value={values[f.name] || ""}
            onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
            className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
      ))}
      <button className="mt-4 w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all duration-300">
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
    <section ref={ref} className="py-20 px-6 border-t border-border/40">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">
              Get Started
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-medium leading-[1.15] tracking-tight">
              Ready when
              <br />
              <em className="text-primary">you are.</em>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-muted-foreground text-[13px] leading-relaxed"
          >
            People don't choose the best option. They choose the one they notice. Be the one they notice.
          </motion.p>
        </div>

        {/* Form tabs + form */}
        <div className="border border-border/50 rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border/40 overflow-x-auto">
            {forms.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveForm(f.id)}
                className={`px-6 py-4 text-[12px] font-medium whitespace-nowrap border-r border-border/40 last:border-r-0 transition-all ${
                  activeForm === f.id
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:border-r border-border/40">
              <motion.div
                key={activeForm}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-heading text-2xl font-medium mb-1">{current.headline}</h3>
                <p className="text-muted-foreground text-[13px] mb-6">{current.sub}</p>
                <ContactForm form={current} />
              </motion.div>
            </div>
            <div className="p-8 bg-muted/20 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-5">
                  Also Available
                </div>
                <div className="space-y-3">
                  {forms.filter(f => f.id !== activeForm).map(f => (
                    <button
                      key={f.id}
                      onClick={() => setActiveForm(f.id)}
                      className="flex items-center justify-between w-full p-3.5 rounded-lg border border-border/40 hover:border-primary/20 text-left transition-all group"
                    >
                      <div>
                        <div className="text-sm font-medium text-foreground">{f.label}</div>
                        <div className="text-[12px] text-muted-foreground mt-0.5">{f.headline} {f.sub}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-border/40">
                <p className="text-[12px] text-muted-foreground/60 italic">
                  Prefer email?{" "}
                  <a href="mailto:hello@downtownperks.com" className="text-primary hover:underline underline-offset-4">
                    hello@downtownperks.com
                  </a>
                </p>
                <p className="text-[11px] text-muted-foreground/40 mt-2">Downtown Perks · Powered by Boop · Austin, Texas</p>
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
          <Link to="/downtown-perks/explore" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground transition-all duration-300">
            Explore Downtown
          </Link>
          <Link to="/downtown-perks/for-buildings" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground transition-all duration-300">
            Become a Partner
          </Link>
          <a href="mailto:hello@downtownperks.com" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/40 text-muted-foreground font-medium text-sm hover:text-foreground transition-all duration-300">
            Contact Us
          </a>
        </motion.div>
      </div>
    </section>
  );
}