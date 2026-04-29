import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileCode2,
  Info,
  Layers3,
  ListChecks,
  TriangleAlert,
} from "lucide-react";
import { BUILD_PACK_RESOURCES, BUILD_PACK_SECTIONS } from "@/content/buildPack";

function CalloutIcon({ tone }) {
  if (tone === "warning") return <TriangleAlert className="h-4 w-4" />;
  return <Info className="h-4 w-4" />;
}

function SectionBlock({ block }) {
  if (block.type === "callout") {
    const toneClass =
      block.tone === "warning"
        ? "border-[rgba(194,143,84,0.24)] bg-[rgba(194,143,84,0.10)] text-[var(--dp-navy)]"
        : "border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.72)] text-[var(--dp-navy)]";

    return (
      <div className={`rounded-[22px] border p-5 ${toneClass}`}>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
          <CalloutIcon tone={block.tone} />
          {block.title}
        </div>
        <p className="mt-3 text-[14px] leading-7 text-[rgba(11,31,51,0.76)]">{block.body}</p>
      </div>
    );
  }

  if (block.type === "pill-list") {
    return (
      <div className="flex flex-wrap gap-2">
        {block.items.map((item) => (
          <span key={item} className="dp-chip">
            {item}
          </span>
        ))}
      </div>
    );
  }

  if (block.type === "list") {
    return (
      <div className="rounded-[24px] bg-white/76 p-5">
        {block.title ? (
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
            {block.title}
          </div>
        ) : null}
        <ul className="space-y-3">
          {block.items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[14px] leading-7 text-[rgba(11,31,51,0.78)]">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--dp-gold)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (block.type === "checklist") {
    return (
      <div className="rounded-[24px] bg-white/76 p-5">
        <ul className="space-y-3">
          {block.items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[14px] leading-7 text-[rgba(11,31,51,0.78)]">
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--dp-gold)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (block.type === "grid") {
    return (
      <div className="rounded-[24px] bg-white/76 p-5">
        {block.title ? (
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
            {block.title}
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {block.items.map((item) => (
            <div key={`${item.label}-${item.value}`} className="rounded-[18px] border border-[rgba(11,31,51,0.06)] bg-white/82 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.44)]">
                {item.label}
              </div>
              <div className="mt-2 text-[14px] font-medium leading-6 text-[var(--dp-navy)]">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "table") {
    return (
      <div className="overflow-hidden rounded-[24px] border border-[rgba(11,31,51,0.06)] bg-white/82">
        <div className="grid border-b border-[rgba(11,31,51,0.06)] bg-[rgba(11,31,51,0.03)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.52)] md:grid-cols-3">
          {block.columns.map((column) => (
            <div key={column} className="px-4 py-3">
              {column}
            </div>
          ))}
        </div>
        <div>
          {block.rows.map((row, index) => (
            <div key={`${row[0]}-${index}`} className="grid border-b border-[rgba(11,31,51,0.06)] last:border-b-0 md:grid-cols-3">
              {row.map((cell, cellIndex) => (
                <div key={`${cellIndex}-${cell}`} className="px-4 py-4 text-[14px] leading-7 text-[rgba(11,31,51,0.78)]">
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "steps") {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {block.items.map((item) => (
          <div key={`${item.step}-${item.title}`} className="rounded-[22px] border border-[rgba(11,31,51,0.06)] bg-white/82 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--dp-gold)]">
              {item.step}
            </div>
            <h3 className="mt-3 text-[1.3rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy)]">
              {item.title}
            </h3>
            <p className="mt-3 text-[14px] leading-7 text-[rgba(11,31,51,0.74)]">{item.body}</p>
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "code") {
    return (
      <div className="overflow-hidden rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-[var(--dp-navy)] text-white">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/68">
          <FileCode2 className="h-4 w-4" />
          {block.title}
        </div>
        <pre className="overflow-x-auto px-4 py-4 text-[12px] leading-6 text-white/82">
          <code>{block.code}</code>
        </pre>
      </div>
    );
  }

  return null;
}

export default function BuildPack() {
  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)] pb-16 pt-[84px]">
      <div className="dp-page-shell space-y-4">
        <section className="dp-band p-6 md:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="dp-micro-label mb-4">Implementation / Spec Page</div>
              <h1 className="dp-display-hero max-w-5xl text-[2.8rem] text-foreground md:text-[4.8rem]">
                Downtown Perks production build pack.
              </h1>
              <p className="mt-5 max-w-3xl text-[15px] leading-7 text-muted-foreground md:text-[16px]">
                This is the live engineering pack for the rebuild: system rules, route logic, UI
                kit decisions, interaction patterns, file maps, data structure, and implementation
                order. It is written against the repo that actually runs today.
              </p>
            </div>

            <div className="rounded-[24px] border border-[rgba(11,31,51,0.06)] bg-white/82 p-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.46)]">
                <Layers3 className="h-4 w-4 text-[var(--dp-gold)]" />
                Live execution summary
              </div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[18px] bg-[rgba(11,31,51,0.03)] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.44)]">
                    Product rule
                  </div>
                  <div className="mt-2 text-[14px] font-medium text-[var(--dp-navy)]">
                    The map is the product. The card is access. Analytics are proof.
                  </div>
                </div>
                <div className="rounded-[18px] bg-[rgba(11,31,51,0.03)] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.44)]">
                    Runtime rule
                  </div>
                  <div className="mt-2 text-[14px] font-medium text-[var(--dp-navy)]">
                    One shared map interaction model across home, explore, resident, and partner surfaces.
                  </div>
                </div>
                <div className="rounded-[18px] bg-[rgba(11,31,51,0.03)] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.44)]">
                    Engineering rule
                  </div>
                  <div className="mt-2 text-[14px] font-medium text-[var(--dp-navy)]">
                    Specs must reflect the current Vite app while preserving the clean-system target.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          <aside className="lg:sticky lg:top-[92px]">
            <div className="dp-band p-4 md:p-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.46)]">
                <ListChecks className="h-4 w-4 text-[var(--dp-gold)]" />
                Build pack index
              </div>
              <nav className="mt-4 space-y-1">
                {BUILD_PACK_SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block rounded-[14px] px-3 py-2 text-[13px] font-medium text-[rgba(11,31,51,0.7)] transition hover:bg-white/70 hover:text-[var(--dp-navy)]"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>

              <div className="mt-5 border-t border-[rgba(11,31,51,0.06)] pt-4">
                <Link to="/explore" className="dp-cta-primary w-full justify-center">
                  Open live map
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            {BUILD_PACK_SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="dp-band p-6 md:p-8">
                <div className="dp-micro-label">{section.eyebrow}</div>
                <h2 className="dp-display-section mt-4 text-[2rem] text-foreground md:text-[2.8rem]">
                  {section.title}
                </h2>
                <p className="mt-4 max-w-3xl text-[14px] leading-7 text-muted-foreground md:text-[15px]">
                  {section.intro}
                </p>

                <div className="mt-6 space-y-4">
                  {section.blocks.map((block, index) => (
                    <SectionBlock key={`${section.id}-${block.type}-${index}`} block={block} />
                  ))}
                </div>
              </section>
            ))}

            <section className="dp-band dp-band-dark p-6 md:p-8">
              <div className="dp-micro-label text-[var(--dp-gold-muted)]">Source links</div>
              <h2 className="dp-display-section mt-4 max-w-3xl text-[2rem] text-white md:text-[2.8rem]">
                Reference material feeding the build pack.
              </h2>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {BUILD_PACK_RESOURCES.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-[18px] border border-white/10 bg-white/6 px-4 py-4 text-left text-[14px] font-medium text-white/88 transition hover:bg-white/10"
                  >
                    <span>{item.label}</span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-[var(--dp-gold)]" />
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
