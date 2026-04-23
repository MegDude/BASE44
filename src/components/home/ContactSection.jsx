import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import SwipeRail from "@/components/home/SwipeRail";
import { useCTAFlow } from "@/components/cta/CTAFlowProvider";
import { IconArrowRight, IconInfo, IconMap } from "@/components/icons/DPIcons";

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
      { name: "phone", label: "Phone (used for card delivery)", type: "tel" },
      { name: "email", label: "Email (optional)", type: "email" },
      { name: "building", label: "Building Address", type: "text" },
    ],
    cta: "Get My Perks Card",
  },
];

function ContactForm({ form }) {
  const [values, setValues] = useState({});
  const { openFlow } = useCTAFlow();

  const flowTypeByForm = {
    buildings: "pilot_request",
    hotels: "hospitality_onboarding",
    venues: "venue_onboarding",
    brands: "brand_campaign",
    civic: "civic_onboarding",
    realestate: "availability_check",
    residents: "resident_card",
  };

  function mapInitialValues() {
    if (form.id === "buildings") {
      return {
        propertyName: values.property || "",
        organization: values.property || "",
        name: values.name || "",
        email: values.email || "",
        phone: values.phone || "",
        units: values.units || "",
        goal: values.goals || "",
        partnerType: "properties",
      };
    }
    if (form.id === "hotels") {
      return {
        hotelName: values.property || "",
        organization: values.property || "",
        name: values.name || "",
        email: values.email || "",
        phone: values.phone || "",
        rooms: values.rooms || "",
        partnerType: "hospitality",
      };
    }
    if (form.id === "venues") {
      return {
        venueName: values.business || "",
        organization: values.business || "",
        name: values.name || "",
        email: values.email || "",
        phone: values.phone || "",
        address: values.address || "",
        goal: values.perk || "",
        intent: "Both",
        partnerType: "venues",
      };
    }
    if (form.id === "brands") {
      return {
        brandName: values.brand || "",
        organization: values.brand || "",
        name: values.name || "",
        email: values.email || "",
        phone: values.phone || "",
        partnerType: "brands",
      };
    }
    if (form.id === "civic") {
      return {
        organization: values.org || "",
        initiative: values.focus || "",
        name: values.name || "",
        email: values.email || "",
        phone: values.phone || "",
        goal: values.focus || "",
        partnerType: "civic",
      };
    }
    if (form.id === "residents") {
      return {
        name: values.name || "",
        phone: values.phone || "",
        email: values.email || "",
        building: values.building || "",
      };
    }
    return values;
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        openFlow({
          type: flowTypeByForm[form.id] || "start_here",
          source: `contact_section_${form.id}`,
          sourceComponent: "ContactSection",
          partnerType: form.id === "buildings" ? "properties" : form.id,
          initialValues: mapInitialValues(),
          successRoute:
            form.id === "residents"
              ? "/resident-app/card"
              : form.id === "brands"
                ? "/partners/brands"
                : form.id === "civic"
                  ? "/partners/civic"
                  : form.id === "venues"
                    ? "/partners/venues"
                    : form.id === "hotels"
                      ? "/partners/hotels"
                      : "/partners",
        });
      }}
    >
      {form.fields.map((f) => (
        <div key={f.name}>
          <label className="block text-[11px] font-medium text-foreground/50 uppercase tracking-[0.1em] mb-1.5">
            {f.label}
          </label>
          <input
            type={f.type}
            value={values[f.name] || ""}
            onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
            className="dp-input"
          />
        </div>
      ))}
      <button
        type="submit"
        className="dp-cta-primary mt-4 w-full"
      >
        {form.cta}
      </button>
    </form>
  );
}

export default function ContactSection() {
  const [activeForm, setActiveForm] = useState("buildings");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { openFlow } = useCTAFlow();

  const current = forms.find((f) => f.id === activeForm);

  return (
    <section ref={ref} className="bg-[var(--dp-surface-base)] px-4 py-10 md:px-6 md:py-12">
      <div className="dp-page-shell">

        {/* Header */}
        <div className="dp-band mb-6 grid grid-cols-1 items-end gap-8 p-6 md:grid-cols-[1.05fr_0.95fr] md:p-8 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="dp-micro-label mb-4 block">
              Get Started
            </span>
            <h2 className="dp-display-section max-w-3xl text-[2.1rem] text-foreground md:text-[3rem]">
              Ready when
              <br />
              <em className="text-primary">you are.</em>
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-[26px] bg-[linear-gradient(180deg,rgba(11,26,43,0.98),rgba(18,36,60,0.95))] px-5 py-5 shadow-[0_20px_48px_rgba(11,26,43,0.16)]"
          >
            <p className="mb-4 text-[13px] leading-relaxed text-white/72">
              People don't choose the best option. They choose the one they notice.
            </p>
            <div className="flex flex-col gap-1.5 text-[12px] text-white/60">
              <span className="font-medium text-white/82">For residents — Stop searching. Start doing.</span>
              <span className="font-medium text-white/82">For partners — Be the one they notice.</span>
            </div>
          </motion.div>
        </div>

        {/* Form panel */}
        <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,245,238,0.9))] shadow-[0_18px_42px_rgba(11,26,43,0.08)]">
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-[rgba(11,31,51,0.06)] bg-white/76 backdrop-blur-xl">
            {forms.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveForm(f.id)}
                className={`border-r border-[rgba(11,31,51,0.06)] px-5 py-4 text-[11px] font-medium whitespace-nowrap last:border-r-0 transition-all ${
                  activeForm === f.id
                    ? "text-primary bg-white"
                    : "text-foreground/55 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_340px]">
            {/* Form */}
            <div className="bg-transparent p-6 md:border-r md:border-[rgba(11,31,51,0.06)] md:p-8">
              <motion.div
                key={activeForm}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-heading mb-1.5 text-2xl font-medium leading-[1.08] text-foreground">{current.headline}</h3>
                <p className="mb-6 text-[13px] text-foreground/55">{current.sub}</p>
                <ContactForm form={current} />
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col justify-between bg-[rgba(255,255,255,0.28)] p-6 md:p-8">
              <div>
                <div className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/50">
                  Also Available
                </div>
                <SwipeRail
                  items={forms.filter((f) => f.id !== activeForm).slice(0, 4)}
                  getKey={(item) => item.id}
                  cardClassName="w-[88%] sm:w-[72%] md:w-[88%]"
                  showDots={false}
                  renderItem={(form) => (
                    <button
                      key={form.id}
                      onClick={() => setActiveForm(form.id)}
                      className="flex h-full w-full items-center justify-between rounded-[18px] border border-[hsl(218,20%,90%)] bg-white p-4 text-left transition-all group hover:border-primary/30"
                    >
                        <div>
                          <div className="text-[13px] font-medium text-foreground">{form.label}</div>
                          <div className="mt-1 text-[11px] leading-5 text-foreground/50">{form.headline} {form.sub}</div>
                        </div>
                      <IconArrowRight className="h-3.5 w-3.5 shrink-0 text-foreground/25 transition-colors group-hover:text-primary" />
                    </button>
                  )}
                />
              </div>
              <div className="mt-8 space-y-3 border-t border-[rgba(11,31,51,0.08)] pt-6">
                <button
                  type="button"
                  onClick={() =>
                    openFlow({
                      type: "support_request",
                      source: "contact_section_support",
                      sourceComponent: "ContactSection",
                      successRoute: "/partners",
                    })
                  }
                  className="inline-flex items-center gap-2 text-[12px] font-medium text-primary hover:underline underline-offset-4"
                >
                  <IconInfo className="h-3.5 w-3.5" />
                  Need help choosing the right path?
                </button>
                <p className="text-[11px] text-foreground/35">Downtown Perks · Powered by Boop · Austin, Texas</p>
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
          <Link to="/downtown-perks/explore" className="inline-flex items-center gap-2 rounded-full border border-[rgba(11,31,51,0.10)] px-6 py-3 text-sm font-medium text-foreground/70 transition-all duration-300 hover:border-foreground/30 hover:text-foreground">
            <IconMap className="h-3.5 w-3.5" />
            See the map
          </Link>
          <Link to="/partners" className="inline-flex items-center gap-2 rounded-full border border-[rgba(11,31,51,0.10)] px-6 py-3 text-sm font-medium text-foreground/70 transition-all duration-300 hover:border-foreground/30 hover:text-foreground">
            <IconArrowRight className="h-3.5 w-3.5" />
            Explore partner types
          </Link>
          <button
            type="button"
            onClick={() =>
              openFlow({
                type: "availability_check",
                source: "contact_section_check_availability",
                sourceComponent: "ContactSection",
                successRoute: "/partners",
              })
            }
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(11,31,51,0.10)] px-6 py-3 text-sm font-medium text-foreground/50 transition-all duration-300 hover:text-foreground"
          >
            Check Availability
          </button>
        </motion.div>
      </div>
    </section>
  );
}
