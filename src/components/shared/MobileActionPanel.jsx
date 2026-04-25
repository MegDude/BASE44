import { MapPin, X } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";

export default function MobileActionPanel({
  eyebrow,
  title,
  meta,
  onClose,
  closeLabel = "Close details",
  children,
  actions,
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (isDesktop) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-[500] rounded-[24px] border border-white/60 bg-white/84 p-4 shadow-[0_18px_44px_rgba(11,31,51,0.18)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow ? (
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
              {eyebrow}
            </div>
          ) : null}
          <div className="mt-1 text-[1rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy)]">
            {title}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(11,31,51,0.06)] text-[var(--dp-navy)]"
          aria-label={closeLabel}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {meta ? (
        <div className="mt-3 flex items-center gap-2 text-[13px] text-[rgba(11,31,51,0.66)]">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--dp-gold-muted)]" />
          <span className="min-w-0 truncate">{meta}</span>
        </div>
      ) : null}

      {children ? <div className="mt-3">{children}</div> : null}

      {actions ? <div className="mt-4 flex gap-3">{actions}</div> : null}
    </div>
  );
}
