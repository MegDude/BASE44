import { MapPin, QrCode, Bell, Users, Zap, Star } from "lucide-react";

export function MapDemoPanel({ venueName, tag, nearbyItems = [] }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/40 h-56 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        {/* Simulated map dots */}
        <div className="relative w-full h-full p-6">
          {[
            { top: "30%", left: "45%", size: "lg", label: venueName },
            { top: "55%", left: "62%", size: "sm", label: nearbyItems[0] },
            { top: "42%", left: "28%", size: "sm", label: nearbyItems[1] },
            { top: "68%", left: "40%", size: "sm", label: nearbyItems[2] },
          ].map((dot, i) =>
            dot.label ? (
              <div
                key={i}
                className="absolute flex flex-col items-center"
                style={{ top: dot.top, left: dot.left, transform: "translate(-50%,-50%)" }}
              >
                <div className={`rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 ${dot.size === "lg" ? "w-8 h-8" : "w-5 h-5"}`}>
                  <MapPin className={`text-primary-foreground ${dot.size === "lg" ? "w-4 h-4" : "w-2.5 h-2.5"}`} />
                </div>
                {dot.size === "lg" && (
                  <span className="mt-1.5 px-2 py-0.5 rounded bg-background/90 text-xs font-medium whitespace-nowrap border border-border">
                    {dot.label}
                  </span>
                )}
              </div>
            ) : null
          )}
        </div>
      </div>
      <div className="p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="font-semibold text-foreground text-sm">{venueName}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{tag}</div>
        </div>
      </div>
    </div>
  );
}

export function QRDemoPanel({ headline, action, sub }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
        <QrCode className="w-12 h-12 text-primary" />
      </div>
      <div className="font-heading font-bold text-xl mb-2">{headline}</div>
      <div className="text-sm text-muted-foreground mb-6 leading-relaxed">{sub}</div>
      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
        <Zap className="w-3.5 h-3.5" /> {action}
      </div>
    </div>
  );
}

export function NotificationDemoPanel({ items }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Member Feed</span>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Star className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">{item.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{item.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}