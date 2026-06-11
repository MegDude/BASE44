import { Link } from "react-router-dom";
import { ArrowRight, Mail, MapPin, MessageSquareText } from "lucide-react";

const contactPaths = [
  {
    title: "Residents",
    copy: "Open the map, check nearby perks, or show your resident card when a partner asks for access.",
    href: "/map?mode=resident&tab=map&filter=All",
    cta: "Open Resident Map",
  },
  {
    title: "Partners",
    copy: "See how Downtown Perks helps local places, buildings, hotels, brands, and civic teams stay easy to find.",
    href: "/partners",
    cta: "View Partner Options",
  },
  {
    title: "Pricing",
    copy: "Compare Starter, Growth, and Pro options before choosing the right fit.",
    href: "/pricing",
    cta: "Review Pricing",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#F7F8FB] px-5 pb-20 pt-28 text-[#0B1F33]">
      <section className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-start">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C8A96A]">Contact Downtown Perks</p>
          <h1 className="mt-3 font-heading text-[42px] font-medium leading-[0.98] tracking-normal md:text-[58px]">
            Let’s make downtown easier to use.
          </h1>
          <p className="mt-5 max-w-[34rem] text-[15px] leading-7 text-[#0B1F33]/68">
            Tell us what you are trying to do: find resident access, bring a place onto the map, or build a better downtown workflow for your team.
          </p>
          <div className="mt-7 grid gap-3 text-[13px] text-[#0B1F33]/68">
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#C8A96A]" />
              hello@downtownperks.local
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#C8A96A]" />
              Downtown Austin
            </span>
          </div>
        </div>

        <div className="border border-[#0B1F33]/8 bg-white p-5 md:p-6">
          <div className="flex items-center gap-2 border-b border-[#0B1F33]/8 pb-4">
            <MessageSquareText className="h-4 w-4 text-[#C8A96A]" />
            <h2 className="font-body text-[15px] font-semibold text-[#0B1F33]">Choose the right next step</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {contactPaths.map((path) => (
              <Link
                key={path.title}
                to={path.href}
                className="group grid gap-2 border border-[#0B1F33]/8 bg-white p-4 text-left transition hover:border-[#C8A96A]/50"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#C8A96A]">{path.title}</span>
                <span className="text-[13px] leading-6 text-[#0B1F33]/66">{path.copy}</span>
                <span className="mt-1 inline-flex items-center gap-2 text-[12px] font-semibold text-[#0B1F33]">
                  {path.cta}
                  <ArrowRight className="h-3.5 w-3.5 text-[#C8A96A] transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
