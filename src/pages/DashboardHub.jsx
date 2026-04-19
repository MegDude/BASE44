import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Map, Sparkles, UserRound } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ENTRY_OPTIONS = [
  {
    id: "resident",
    eyebrow: "Resident mode",
    title: "Open the live map, saved places, and your perks card.",
    body: "Use the resident surface when you want the day-to-day downtown product: search, explore, save, and move.",
    to: "/resident-app",
    icon: UserRound,
  },
  {
    id: "partner",
    eyebrow: "Partner mode",
    title: "Manage building, venue, or hospitality performance.",
    body: "Use the partner surface to track activity, keep offers current, and understand what residents are opening and using.",
    to: "/dashboard/partner",
    icon: Building2,
  },
];

export default function DashboardHub() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    base44.auth
      .me()
      .then((user) => setUserName(user?.full_name || ""))
      .catch(() => setUserName(""));
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(42,24%,96%)] pt-[68px] text-[hsl(218,42%,14%)]">
      <section className="border-b border-[rgba(19,36,67,0.12)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(40,62%,46%)]">
            Dashboard
          </p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.05em] md:text-6xl">
                Choose the surface that matches how you use downtown.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[rgba(19,36,67,0.7)]">
                {userName
                  ? `Signed in as ${userName}. Continue into the resident experience or the partner management flow.`
                  : "Enter as a resident or partner. Both routes are now linked to the same live product system."}
              </p>
            </div>

            <Link
              to="/downtown-perks/explore"
              className="inline-flex h-12 items-center gap-2 border border-[rgba(19,36,67,0.14)] bg-white px-5 text-sm font-semibold uppercase tracking-[0.14em] transition-all hover:border-[rgba(200,151,58,0.7)]"
            >
              Open live map
              <Map className="h-4 w-4 text-[hsl(40,62%,46%)]" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-8 md:py-12">
        <div className="mx-auto max-w-6xl border-y border-[rgba(19,36,67,0.12)]">
          {ENTRY_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <div key={option.id} className="grid gap-5 border-b border-[rgba(19,36,67,0.12)] py-7 md:grid-cols-[120px_1fr_auto] md:items-start">
                <div className="flex h-11 w-11 items-center justify-center border border-[rgba(19,36,67,0.14)] bg-white text-[hsl(218,42%,14%)]">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(19,36,67,0.46)]">
                    {option.eyebrow}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{option.title}</h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-[rgba(19,36,67,0.7)]">{option.body}</p>
                </div>

                <div>
                  <Link
                    to={option.to}
                    className="inline-flex h-11 items-center gap-2 bg-[hsl(218,42%,14%)] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(42,24%,96%)] transition-all hover:bg-[hsl(218,42%,12%)]"
                  >
                    Enter
                    <ArrowRight className="h-4 w-4 text-[hsl(40,62%,46%)]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl border-t border-[rgba(19,36,67,0.12)] pt-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(40,62%,46%)]">
                Shared system
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
                One map, one data layer, two clean ways in.
              </h2>
            </div>

            <div className="space-y-4">
              {[
                "Resident search and Ask the map both feed the live explore route.",
                "Partner teams can manage activity, offers, and performance without leaving the product system.",
                "Pricing, dashboard, and map now link to each other instead of splitting the experience.",
              ].map((line) => (
                <div key={line} className="flex items-start gap-3 border-b border-[rgba(19,36,67,0.08)] pb-4">
                  <Sparkles className="mt-1 h-4 w-4 text-[hsl(40,62%,46%)]" />
                  <p className="text-base leading-7 text-[rgba(19,36,67,0.74)]">{line}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
