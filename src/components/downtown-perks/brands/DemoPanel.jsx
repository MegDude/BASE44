import { MapPin, QrCode, Bell, Zap, Star } from "lucide-react";

export function MapDemoPanel({ venueName, tag, nearbyItems = [] }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden">
      {/* Map area */}
      <div className="bg-muted/30 h-48 relative">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(11,31,51,0.18) 1px, transparent 1px)",
            backgroundSize: "28px 28px"
          }}
        />
        {[
          { top: "35%", left: "48%", size: "lg", label: venueName },
          { top: "58%", left: "65%", size: "sm" },
          { top: "45%", left: "28%", size: "sm" },
          { top: "70%", left: "42%", size: "sm" },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute flex flex-col items-center"
            style={{ top: dot.top, left: dot.left, transform: "translate(-50%,-50%)" }}
          >
            <div className={`rounded-full bg-primary flex items-center justify-center ${dot.size === "lg" ? "w-7 h-7 shadow-lg shadow-primary/30" : "w-3.5 h-3.5 opacity-50"}`}>
              <MapPin className={`text-primary-foreground ${dot.size === "lg" ? "w-3.5 h-3.5" : "w-2 h-2"}`} />
            </div>
            {dot.size === "lg" && dot.label && (
              <span className="mt-1.5 px-2 py-0.5 rounded bg-background/90 text-[11px] font-medium whitespace-nowrap border border-border/60">
                {dot.label}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center shrink-0">
          <MapPin className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <div className="font-medium text-foreground text-[13px]">{venueName}</div>
          <div className="text-[12px] text-muted-foreground mt-0.5">{tag}</div>
        </div>
      </div>
    </div>
  );
}

export function QRDemoPanel({ headline, action, sub }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-8 flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-xl border border-border/60 bg-muted/40 flex items-center justify-center mb-5">
        <QrCode className="w-10 h-10 text-primary/60" />
      </div>
      <div className="font-heading font-medium text-lg mb-2">{headline}</div>
      <div className="text-[13px] text-muted-foreground mb-6 leading-relaxed max-w-xs">{sub}</div>
      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-medium">
        <Zap className="w-3.5 h-3.5" /> {action}
      </div>
    </div>
  );
}

export function NotificationDemoPanel({ items }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-5 space-y-2.5">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/40">
        <Bell className="w-3.5 h-3.5 text-primary/60" />
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em]">
          Live Member Feed
        </span>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
          <div className="w-7 h-7 rounded-full border border-border/60 flex items-center justify-center shrink-0">
            <Star className="w-3 h-3 text-primary/60" />
          </div>
          <div>
            <div className="text-[13px] font-medium text-foreground">{item.title}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{item.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
