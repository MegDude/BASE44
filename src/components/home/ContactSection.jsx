import { motion, useInView } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building,
  Building2,
  Mail,
  Hotel,
  Landmark,
  Megaphone,
  Users,
  Utensils,
} from "lucide-react";
import { useCTAFlow } from "@/components/cta/CTAFlowProvider";
import { ROUTES } from "@/lib/routes";

const forms = [
  {
    id: "buildings",
    label: "Buildings",
    icon: Building2,
    headline: "90-day free pilot.",
    sub: "See what residents actually do.",
    summary:
      "Launch a building-linked downtown layer with QR entry, resident card access, and measurable neighborhood use.",
    fields: [
      { name: "property", label: "Building Name & Address", type: "text", span: 2 },
      { name: "name", label: "Your Name & Role", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "units", label: "Number of Units", type: "number" },
      { name: "goals", label: "Any specific goals? (Optional)", type: "text", span: 2 },
    ],
    bullets: ["Resident amenity layer", "Lobby QR + card access", "Building-level activation"],
    cta: "Start the Pilot",
    route: ROUTES.partnerProperties,
  },
  {
    id: "hotels",
    label: "Hospitality",
    icon: Hotel,
    headline: "Extend the stay beyond your lobby.",
    sub: "Give guests one working downtown layer.",
    summary:
      "Use the same live map to connect guests to dining, events, wellness, nightlife, and nearby local context.",
    fields: [
      { name: "property", label: "Hotel / Property Name", type: "text", span: 2 },
      { name: "name", label: "Your Name & Role", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "rooms", label: "Number of Rooms", type: "number" },
      { name: "goals", label: "Guest or activation goals", type: "text", span: 2 },
    ],
    bullets: ["Guest map handoff", "Event-linked stays", "Attributed local visits"],
    cta: "Open Hospitality Flow",
    route: ROUTES.partnerHospitality,
  },
  {
    id: "venues",
    label: "Venues",
    icon: Utensils,
    headline: "Free 90-day pilot.",
    sub: "No payment setup now.",
    summary:
      "Show up when nearby intent is real, then turn map visibility into visits, RSVPs, and redemptions.",
    fields: [
      { name: "business", label: "Business Name", type: "text", span: 2 },
      { name: "name", label: "Your Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "address", label: "Street Address", type: "text" },
      { name: "perk", label: "What perk or offer will you run?", type: "text", span: 2 },
      { name: "hours", label: "Operating Hours", type: "text" },
      { name: "qrPlacement", label: "QR Placement Plan", type: "text" },
    ],
    bullets: ["Live map visibility", "Offer and event routing", "Repeat local use"],
    cta: "Discuss Activation",
    route: ROUTES.partnerVenues,
  },
  {
    id: "brands",
    label: "Brands",
    icon: Megaphone,
    headline: "Buy the moment, not the impression.",
    sub: "Show up in real downtown behavior.",
    summary:
      "Run district-aware brand visibility and card-ready campaigns through the same map people already use.",
    fields: [
      { name: "brand", label: "Brand / Company Name", type: "text", span: 2 },
      { name: "name", label: "Your Name & Role", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "goals", label: "Campaign focus", type: "text", span: 2 },
    ],
    bullets: ["District activations", "Sponsor-ready placement", "Measured post-action proof"],
    cta: "Start a Conversation",
    route: ROUTES.partnerBrands,
  },
  {
    id: "civic",
    label: "Civic",
    icon: Landmark,
    headline: "Turn attendance into participation.",
    sub: "Make downtown easier to navigate and measure.",
    summary:
      "Support public-facing navigation, event visibility, and local business discovery without turning it into a generic dashboard pitch, then confirm pricing after the pilot scope is approved.",
    fields: [
      { name: "org", label: "Organization Name", type: "text", span: 2 },
      { name: "name", label: "Your Name & Role", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "focus", label: "Geographic Focus", type: "text", span: 2 },
    ],
    bullets: ["District context", "Event participation", "Privacy-safe civic reporting"],
    cta: "Talk to Us",
    route: ROUTES.partnerCivic,
  },
  {
    id: "realestate",
    label: "Real Estate",
    icon: Building,
    headline: "Turn foot traffic into qualified leads.",
    sub: "Use live neighborhood context as the pitch.",
    summary:
      "Pair listings and building context with the same downtown decision layer residents are already using.",
    fields: [
      { name: "brokerage", label: "Brokerage", type: "text", span: 2 },
      { name: "name", label: "Your Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "listings", label: "Active Downtown Listings", type: "number" },
      { name: "goals", label: "Any specific goals? (Optional)", type: "text", span: 2 },
    ],
    bullets: ["Listing context", "Walkable neighborhood proof", "Lead-ready discovery"],
    cta: "Discuss Lead Integration",
    route: ROUTES.partnerProperties,
  },
  {
    id: "residents",
    label: "Residents",
    icon: Users,
    headline: "$25 per year until your building joins.",
    sub: "If your building signs up later, that resident fee is refunded.",
    summary:
      "Residents can browse first, then add the card when saves, RSVP, or redemption actually matter.",
    fields: [
      { name: "name", label: "Your Name", type: "text" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "email", label: "Email", type: "email" },
      { name: "building", label: "Building Address", type: "text", span: 2 },
    ],
    bullets: ["Browse first", "$25 annual direct access", "Refunded if your building joins"],
    cta: "Request Resident Access",
    route: ROUTES.residentAppCard,
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
        goal: values.goals || "",
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
        perkTitle: values.perk || "",
        perkValue: values.perk || "",
        perkDetails: values.perk || "",
        hours: values.hours || "",
        qrPlacement: values.qrPlacement || "",
        pilotWindow: "Free 90-day pilot",
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
        goal: values.goals || "",
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
    if (form.id === "realestate") {
      return {
        organization: values.brokerage || "",
        name: values.name || "",
        email: values.email || "",
        phone: values.phone || "",
        listings: values.listings || "",
        goal: values.goals || "",
        partnerType: "properties",
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
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        openFlow({
          type: flowTypeByForm[form.id] || "start_here",
          source: `contact_section_${form.id}`,
          sourceComponent: "ContactSection",
          partnerType: form.id === "buildings" ? "properties" : form.id,
          initialValues: mapInitialValues(),
          successRoute: form.route,
        });
      }}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {form.fields.map((field) => (
          <div key={field.name} className={field.span === 2 ? "md:col-span-2" : undefined}>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.1em] text-foreground/52">
              {field.label}
            </label>
            <input
              type={field.type}
              value={values[field.name] || ""}
              onChange={(event) =>
                setValues((current) => ({ ...current, [field.name]: event.target.value }))
              }
              className="dp-input"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-[rgba(11,31,51,0.03)] p-4">
        <p className="text-[12px] leading-5 text-muted-foreground">
          No payment is taken here. We review the request first, then send next steps after follow-up.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="dp-cta-primary w-full sm:w-auto">
            {form.cta}
          </button>
          <a
            href="mailto:partners@downtownperks.com"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgba(11,31,51,0.1)] px-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/72 transition-colors hover:text-foreground"
          >
            <Mail className="h-3.5 w-3.5" />
            partners@downtownperks.com
          </a>
        </div>
      </div>
    </form>
  );
}

export default function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeForm, setActiveForm] = useState("buildings");
  const current = useMemo(() => forms.find((item) => item.id === activeForm) ?? forms[0], [activeForm]);
  const ActiveIcon = current.icon;

  return (
    <section ref={ref} className="bg-[var(--dp-surface-base)] px-4 py-7 md:px-6 md:py-8">
      <div className="dp-page-shell">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="mb-5"
        >
          <span className="dp-micro-label mb-3 block">Get started</span>
          <h2 className="dp-display-section max-w-3xl text-[2.1rem] text-foreground md:text-[3rem]">
            Ready when you are.
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-6 text-muted-foreground">
            Choose the path that fits and launch from there.
          </p>
        </motion.div>

        <div className="border-t border-[rgba(11,31,51,0.08)] pt-4">
          <div className="px-0 py-0">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
                  Buildings / Properties
                </div>
                <div className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-foreground">
                  Start a 90-day free pilot.
                </div>
                <div className="mt-1 max-w-2xl text-[13px] leading-6 text-muted-foreground">
                  See what residents actually use nearby. The other partner paths stay here too, but buildings are the clearest place to start.
                </div>
              </div>
              <div className="text-[12px] font-medium text-[rgba(11,31,51,0.56)]">
                Also available: Hotels, Venues, Brands, Civic, Real Estate, Residents
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto border-b border-[rgba(11,31,51,0.08)] pb-4">
            {forms.map((form) => {
              const Icon = form.icon;
              const isActive = form.id === activeForm;
              return (
                <button
                  key={form.id}
                  type="button"
                  onClick={() => setActiveForm(form.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all ${
                    isActive
                      ? "border-primary/18 bg-[rgba(207,175,90,0.12)] text-foreground"
                      : "border-[rgba(11,31,51,0.08)] bg-white/80 text-foreground/58 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {form.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[0.84fr_1.16fr]">
            <motion.div
              key={`${activeForm}-summary`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="border-b border-[rgba(11,31,51,0.08)] py-5 pr-0 md:border-b-0 md:border-r md:py-6 md:pr-8"
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[rgba(11,31,51,0.05)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/58">
                <ActiveIcon className="h-3.5 w-3.5" />
                {current.label}
              </div>
              <h3 className="font-heading text-[2rem] font-medium leading-[1.02] tracking-[-0.04em] text-foreground">
                {current.headline}
              </h3>
              <p className="mt-2 text-[14px] leading-7 text-muted-foreground">{current.sub}</p>
              <p className="mt-5 text-[13px] leading-6 text-foreground/76">{current.summary}</p>
              <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
                {current.id === "residents"
                  ? "Resident direct access starts at $25 per year. If your building joins later, that fee is refunded."
                  : "Start with the pilot first. If the fit is right, pricing is confirmed after follow-up."}
              </p>

              <div className="mt-5 space-y-3">
                {current.bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3 text-[13px] leading-6 text-foreground/76">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[var(--dp-gold,#CFAF5A)]" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              key={`${activeForm}-form`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="py-5 pl-0 md:py-6 md:pl-8"
            >
              <ContactForm form={current} />
            </motion.div>
          </div>
        </div>

        <div className="mt-6 border-t border-[rgba(11,31,51,0.08)] pt-5 text-left">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="dp-micro-label">Ready when you are</div>
              <h3 className="mt-3 text-[1.9rem] font-semibold leading-[1] tracking-[-0.04em] text-foreground md:text-[2.6rem]">
                People do not choose the best option. They choose the one they notice.
              </h3>
              <p className="mt-4 max-w-2xl text-[14px] leading-7 text-muted-foreground">
                Downtown Perks helps residents find what fits and helps partners show up when the decision is still open.
              </p>
              <a
                href="mailto:partners@downtownperks.com"
                className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-foreground/84 transition-colors hover:text-foreground"
              >
                <Mail className="h-4 w-4 text-[var(--dp-gold,#CFAF5A)]" />
                partners@downtownperks.com
              </a>
            </div>

            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link to={ROUTES.explore} className="dp-cta-primary">
                Explore Downtown
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={current.id === "residents" ? ROUTES.partners : current.route}
                className="dp-cta-secondary"
              >
                {current.id === "residents" ? "Become a Partner" : `Open ${current.label}`}
              </Link>
              <a
                href="mailto:partners@downtownperks.com"
                className="dp-cta-secondary"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
