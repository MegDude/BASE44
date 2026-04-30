import { Link, useLocation } from "react-router-dom";

export default function PartnerDashboardNav({ items }) {
  const { pathname } = useLocation();

  return (
    <section className="border-t border-[rgba(15,23,42,0.08)] px-4 py-5 md:px-6">
      <div className="mx-auto max-w-[1180px]">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href.endsWith("/overview") && pathname === "/partners/dashboard");
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`inline-flex min-h-[44px] items-center rounded-full border px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-[rgba(207,175,90,0.28)] bg-[rgba(207,175,90,0.12)] text-[var(--dp-navy,#111827)]"
                    : "border-[rgba(15,23,42,0.10)] bg-white text-[rgba(71,85,105,0.94)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
