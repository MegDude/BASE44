import React from "react";

export function PageShell({ children }) {
  return (
    <main className="min-h-screen bg-[var(--dp-bg-primary)] text-[var(--dp-text-primary)]">
      {children}
    </main>
  );
}

export function Section({ children, className = "" }) {
  return (
    <section className={`mx-auto max-w-7xl px-6 py-20 ${className}`}>
      {children}
    </section>
  );
}

export function SplitLayout({ left, right, className = "" }) {
  return (
    <div className={`grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-center ${className}`}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

export function FlowList({ items = [] }) {
  return (
    <div className="divide-y divide-[rgba(11,31,51,0.08)]">
      {items.map((item, i) => (
        <div key={i} className="py-6">
          {item}
        </div>
      ))}
    </div>
  );
}

export function SectionHeader({ eyebrow, title, body }) {
  return (
    <div className="max-w-xl">
      {eyebrow && (
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
          {eyebrow}
        </div>
      )}
      <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-[var(--dp-navy)]">
        {title}
      </h2>
      {body && (
        <p className="mt-3 text-[14px] leading-6 text-[rgba(11,31,51,0.64)]">
          {body}
        </p>
      )}
    </div>
  );
}

export function InlineStat({ value, label }) {
  return (
    <div>
      <div className="text-[22px] font-semibold tracking-[-0.04em] text-[var(--dp-navy)]">
        {value}
      </div>
      <div className="text-[11px] text-[rgba(11,31,51,0.5)]">{label}</div>
    </div>
  );
}
