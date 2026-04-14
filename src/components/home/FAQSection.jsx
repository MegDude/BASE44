import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "Do I need to download an app?", a: "No. It's a mobile web experience. Scan a QR code, and you're in. No download. No login. No extra platform." },
  { q: "Does it cost anything for residents?", a: "No. Your building covers it. Downtown Perks is included as a building amenity — map access, event RSVPs, and your perks card at no cost." },
  { q: "Do venues pay to join?", a: "Not at first. Venues get 12 months free to prove the value. After that, it's $49–$99/year. No risk. No long-term commitment." },
  { q: "What do buildings pay?", a: "90-day free pilot. After that, choose: stay free forever (basic reporting), $39/year (full analytics), or $99/year (premium). Most start free and upgrade when they see engagement." },
  { q: "How fast can a partner launch?", a: "7–10 days. We handle setup, map placement, QR generation, and coordination. You bring your business details, perks, and events." },
  { q: "What gets tracked?", a: "Scans (QR entry points). Saves (bookmarked places/events). RSVPs (event signups). Redemptions (perks card usage). You get reporting snapshots at 30, 60, and 90 days." },
  { q: "What kind of perks?", a: "Discounts on food and drinks. Priority access to events. Welcome offers for first-time visits. Members-only specials. Each business sets its own perks. They show up on the map when you're nearby." },
  { q: "Is my info shared with partners?", a: "No. We track actions for reporting — not personal contact information. Your details aren't shared unless you explicitly opt in. Privacy is the default." },
  { q: "Can partners update listings?", a: "Yes. Partners get a simple dashboard to update hours, add perks, post events, and adjust map presence. Changes go live immediately." },
  { q: "Where is this available?", a: "Downtown Austin. We're starting with one district, proving the model, then expanding to other downtown corridors based on partner and resident demand." },
  { q: "Who can join?", a: "Downtown residents in participating buildings. It's exclusive by design — built for people who actually live here." },
  { q: "How do resident connections work?", a: "See an event or activity you want to join. Use the \"Connect Nearby\" feature to signal interest and reach out to others who are going. It's opt-in, lightweight, and designed to make it easier to show up together. No separate social platform required." },
];

function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/40 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
      >
        <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{q}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="pb-5 text-[13px] text-muted-foreground leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-20 px-6 border-t border-border/40">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">
              FAQ
            </span>
            <h2 className="font-heading text-3xl font-medium leading-[1.15] tracking-tight">
              Common
              <br />
              questions.
            </h2>
          </motion.div>

          <div className="md:col-span-2">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}