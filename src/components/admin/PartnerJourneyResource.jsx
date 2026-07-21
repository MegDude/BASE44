import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const JOURNEY_SECTIONS = [
  {
    title: "Partner journey",
    links: [
      { title: "Start partner registration", description: "Choose a partner type and begin the application.", href: "/partners/sign-up", audience: "Partner" },
      { title: "View pricing", description: "Compare plans and continue to the appropriate checkout path.", href: "/pricing", audience: "Partner" },
      { title: "Open partner workspace", description: "Manage current partner work from one workspace.", href: "/partner-workspace/overview", audience: "Partner" },
    ],
  },
  {
    title: "Resident journey",
    links: [
      { title: "Get a resident card", description: "Open the resident card access and sign-up path.", href: "/card", audience: "Resident" },
      { title: "Open the resident map", description: "See places, offers, and events on the public downtown map.", href: "/map?mode=resident&tab=map&filter=All", audience: "Resident" },
    ],
  },
  {
    title: "Admin and review",
    links: [
      { title: "Open admin home", description: "Return to the admin command center.", href: "/admin-studio/command-center", audience: "Admin" },
      { title: "Review partner pages", description: "Check source coverage, conflicts, media, and approval.", href: "/admin-studio/microsites", audience: "Admin" },
      { title: "Open public partner directory", description: "Confirm which reviewed partner pages are currently public.", href: "/network", audience: "Public" },
    ],
  },
];

export default function PartnerJourneyResource() {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const sections = useMemo(() => JOURNEY_SECTIONS.map((section) => ({
    ...section,
    links: section.links.filter((link) => !normalized || [link.title, link.description, link.href, link.audience].some((value) => value.toLowerCase().includes(normalized))),
  })).filter((section) => section.links.length), [normalized]);

  return (
    <main className="dp-admin-resource-page">
      <header>
        <Link to="/admin-studio/command-center">Admin home</Link>
        <p>Admin resource</p>
        <h1>Partner journey links.</h1>
        <p>Open and verify the key routes used for partner onboarding, resident access, admin review, and public pages.</p>
      </header>

      <aside>
        <strong>Use reviewed production routes when sharing externally.</strong>
        <p>Partner registration and resident card access are separate journeys. Draft partner pages remain internal until explicitly approved.</p>
      </aside>

      <label className="dp-admin-resource-search">
        <span>Find a route</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search links, journeys, or routes" />
      </label>

      <div className="dp-admin-resource-sections">
        {sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.links.map((link) => (
              <article key={link.href}>
                <div>
                  <strong>{link.title}</strong>
                  <p>{link.description}</p>
                  <span>{link.audience} · Internal registry</span>
                  <code>{link.href}</code>
                </div>
                <Link to={link.href}>Open</Link>
              </article>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
