import { useState } from "react";
import { IconArrowRight, IconChevronDown, IconChevronUp } from "@/components/icons/DPIcons";
import { useResidentStore } from "@/store/resident-store";

export default function ResidentCardTab({ user, items = [] }) {
  const savedIds = useResidentStore((state) => state.history.saved);
  const [showCode, setShowCode] = useState(true);
  const nearbyPerks = items.filter((item) => item.type === "perk" || item.perk_value).slice(0, 3);
  const cardCode = "DP-USER-" + (user?.id || "123456").slice(0, 8).toUpperCase();
  const qrValue = JSON.stringify({
    type: "downtown_perks_member_card",
    memberId: cardCode,
    name: user?.full_name || "Downtown Resident",
    status: "active",
    source: "resident_app",
  });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(qrValue)}`;
  const points = 1240;

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 md:px-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--dp-gold-deep,#A97816)]">
        Your Access
      </div>
      <h2 className="mt-2 text-[34px] font-semibold tracking-[-0.05em] text-foreground">Perks Card</h2>

      <div className="mt-4 overflow-hidden rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-[var(--dp-navy,#0B1F33)] shadow-[0_20px_52px_rgba(11,31,51,0.14)]">
        <div className="flex items-start justify-between gap-4 px-5 py-5 text-white">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/52">
              Member
            </div>
            <div className="mt-2 text-[30px] font-semibold tracking-[-0.05em]">
              {user?.full_name || "Downtown Resident"}
            </div>
            <div className="mt-1 text-[12px] text-white/48">{cardCode}</div>
          </div>

          <button
            type="button"
            onClick={() => setShowCode((current) => !current)}
            className="inline-flex h-10 items-center justify-center rounded-full bg-[rgba(207,175,90,0.16)] px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]"
          >
            {showCode ? "View card" : "Show code"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-white/10 px-5 py-4 text-white">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">Tier</div>
            <div className="mt-2 text-[22px] font-semibold tracking-[-0.04em] text-[var(--dp-gold,#CFAF5A)]">
              Local
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">Points</div>
            <div className="mt-2 text-[22px] font-semibold tracking-[-0.04em]">{points.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">Saved</div>
            <div className="mt-2 text-[22px] font-semibold tracking-[-0.04em]">{savedIds.length}</div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-[rgba(255,255,255,0.05)]">
          <button
            type="button"
            onClick={() => setShowCode((current) => !current)}
            className="flex w-full items-center justify-center gap-2 px-5 py-4 text-[13px] font-medium text-[var(--dp-gold,#CFAF5A)]"
          >
            {showCode ? <IconChevronUp className="h-4 w-4" /> : <IconChevronDown className="h-4 w-4" />}
            {showCode ? "Hide code" : "Show code"}
          </button>

          {showCode ? (
            <div className="px-4 pb-5">
              <div className="rounded-[24px] bg-white px-4 py-5 text-center shadow-[0_16px_32px_rgba(6,14,26,0.18)]">
                <div className="mx-auto w-fit rounded-[18px] bg-white p-2">
                  <img src={qrUrl} alt="Downtown Perks resident QR code" className="h-56 w-56 rounded-[16px]" />
                </div>
                <div className="mt-4 text-[16px] font-semibold tracking-[-0.02em] text-foreground">
                  Show this at any partner venue
                </div>
                <div className="mt-2 text-[12px] leading-5 text-muted-foreground">
                  Staff scans it. Perk activates instantly. No codes to type.
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {nearbyPerks.length ? (
        <div className="mt-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
            Nearby unlocks
          </div>
          <div className="mt-3 grid gap-3">
            {nearbyPerks.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex items-start justify-between gap-3 rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-white px-4 py-4 text-left"
              >
                <div>
                  <div className="text-[14px] font-semibold text-foreground">{item.name}</div>
                  <div className="mt-1 text-[12px] text-[var(--dp-gold-deep,#A97816)]">
                    {item.perk_value || "Member perk"}
                  </div>
                  <div className="mt-2 text-[12px] leading-5 text-muted-foreground">{item.address}</div>
                </div>
                <IconArrowRight className="mt-1 h-4 w-4 shrink-0 text-foreground/36" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
