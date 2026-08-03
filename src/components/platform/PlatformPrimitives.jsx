import { forwardRef } from "react";
import { Link } from "react-router-dom";

function join(...values) {
  return values.filter(Boolean).join(" ");
}

export function PageContainer({ children, className = "", as: Tag = "main", ...props }) {
  return <Tag className={join("dp-platform-page", className)} {...props}>{children}</Tag>;
}

export function SectionHeader({ eyebrow, title, supporting, action, className = "" }) {
  return (
    <header className={join("dp-platform-section", className)}>
      {eyebrow ? <p className="m-0 text-[11px] uppercase text-[var(--color-gold)] text-[11px] font-bold uppercase tracking-normal">{eyebrow}</p> : null}
      <h1 className="dp-platform-page-title">{title}</h1>
      {supporting ? <p className="dp-platform-supporting-copy">{supporting}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </header>
  );
}

export const Button = forwardRef(function Button({ children, className = "", variant = "primary", to, type = "button", ...props }, ref) {
  const classes = join("dp-platform-button", className);
  if (to) return <Link ref={ref} to={to} className={classes} data-variant={variant} {...props}>{children}</Link>;
  return <button ref={ref} type={type} className={classes} data-variant={variant} {...props}>{children}</button>;
});

export function Card({ children, className = "", ...props }) {
  return <section className={join("dp-platform-panel", className)} {...props}>{children}</section>;
}

export function StatusBadge({ children, tone = "default" }) {
  return <span className="inline-flex min-h-6 items-center border border-[var(--color-border)] px-2 text-[11px] font-semibold text-[var(--color-navy)]" data-tone={tone}>{children}</span>;
}

export function EmptyState({ title, children, action }) {
  return <section className="dp-platform-panel p-5 text-left">
    <h2 className="m-0 text-lg font-semibold text-[var(--color-navy)]">{title}</h2>
    {children ? <p className="mb-0 mt-2 text-sm leading-6 text-[rgba(11,31,51,.64)]">{children}</p> : null}
    {action ? <div className="mt-4">{action}</div> : null}
  </section>;
}
