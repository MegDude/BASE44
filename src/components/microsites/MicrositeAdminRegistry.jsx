import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PARTNER_MICROSITE_REGISTRY } from "@/content/microsites/partnerMicrositeRegistry";
import { PartnerMicrositeContent } from "./PartnerMicrositePage";

const FILTERS = ["all", "needs-review", "blocked", "missing-media", "conflicts"];

export default function MicrositeAdminRegistry() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const previewSlug = searchParams.get("preview");
  const preview = PARTNER_MICROSITE_REGISTRY.find((record) => record.slug === previewSlug);

  const records = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return PARTNER_MICROSITE_REGISTRY.filter((record) => {
      if (filter === "needs-review" && record.reviewState !== "needs-review") return false;
      if (filter === "blocked" && record.reviewState !== "blocked") return false;
      if (filter === "missing-media" && record.mediaState !== "missing") return false;
      if (filter === "conflicts" && record.conflictCount === 0) return false;
      return !normalized || [record.name, record.type, record.category, record.route].some((value) => value.toLowerCase().includes(normalized));
    });
  }, [filter, query]);

  if (preview) {
    return (
      <div className="dp-microsite-admin-preview">
        <button type="button" onClick={() => setSearchParams({})}>Close preview</button>
        <PartnerMicrositeContent record={preview} preview />
      </div>
    );
  }

  return (
    <main className="dp-microsite-registry-page">
      <header>
        <div>
          <p>Admin resource</p>
          <h1>Review partner pages before they publish.</h1>
          <p>Notion supplies source material. This registry separates drafts, conflicts, missing media, and explicit public approval.</p>
        </div>
        <Link to="/admin-studio/command-center">Admin home</Link>
      </header>

      <section className="dp-microsite-registry-summary" aria-label="Microsite review summary">
        <div><strong>{PARTNER_MICROSITE_REGISTRY.length}</strong><span>Targets found</span></div>
        <div><strong>{PARTNER_MICROSITE_REGISTRY.filter((r) => r.reviewState === "needs-review").length}</strong><span>Need review</span></div>
        <div><strong>{PARTNER_MICROSITE_REGISTRY.filter((r) => r.reviewState === "blocked").length}</strong><span>Blocked</span></div>
        <div><strong>{PARTNER_MICROSITE_REGISTRY.filter((r) => r.publicApproved).length}</strong><span>Public</span></div>
      </section>

      <section className="dp-microsite-registry-controls">
        <label>
          <span>Find a partner</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search partners, routes, or types" />
        </label>
        <div aria-label="Filter partner pages">
          {FILTERS.map((item) => (
            <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>
              {item.replace("-", " ")}
            </button>
          ))}
        </div>
      </section>

      <section className="dp-microsite-registry-table" aria-label="Partner microsite records">
        <div className="dp-microsite-registry-row dp-microsite-registry-row--header">
          <span>Partner</span><span>Type</span><span>Content</span><span>Media</span><span>Review</span><span>Route</span><span>Action</span>
        </div>
        {records.map((record) => (
          <article key={record.id} className="dp-microsite-registry-row">
            <strong>{record.name}</strong>
            <span>{record.type}</span>
            <span>{record.contentState}</span>
            <span>{record.mediaState}</span>
            <span>{record.reviewState}</span>
            <code>{record.route}</code>
            <button type="button" onClick={() => setSearchParams({ preview: record.slug })}>Preview</button>
          </article>
        ))}
      </section>
    </main>
  );
}
