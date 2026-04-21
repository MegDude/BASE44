import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

const LOCAL_CARD_KEY = "downtown-perks-card-preview";
const LOCAL_SESSION_KEY = "downtown-perks-anonymous-session";

function getOrCreateSessionId() {
  const existing = window.localStorage.getItem(LOCAL_SESSION_KEY);
  if (existing) return existing;
  const next = `anon-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(LOCAL_SESSION_KEY, next);
  return next;
}

function buildQrValue({ user, localCard, source }) {
  return JSON.stringify({
    type: "downtown_perks_member_card",
    version: "1.0",
    memberId: user?.id || localCard?.memberId || "preview",
    name: user?.full_name || localCard?.firstName || "DowntownPerks Member",
    status: user || localCard?.activated ? "active" : "preview",
    district: "Austin, TX · Downtown Core",
    source: source || "direct",
    issuedAt: localCard?.issuedAt || new Date().toISOString(),
  });
}

function createPreviewCard(form, source) {
  return {
    memberId: `DP-${(crypto.randomUUID?.() || Math.random().toString(36).slice(2))
      .replace(/-/g, "")
      .slice(0, 10)
      .toUpperCase()}`,
    firstName: form.firstName.trim() || "DowntownPerks Member",
    mobile: form.mobile.trim(),
    email: form.email.trim(),
    building: form.building.trim(),
    source,
    activated: true,
    issuedAt: new Date().toISOString(),
  };
}

export default function PerksCard() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [localCard, setLocalCard] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    mobile: "",
    email: "",
    building: "",
  });

  const qrSource = searchParams.get("src") || searchParams.get("source") || "direct";

  useEffect(() => {
    async function loadUser() {
      try {
        const cachedCard = window.localStorage.getItem(LOCAL_CARD_KEY);
        if (cachedCard) {
          setLocalCard(JSON.parse(cachedCard));
        }

        getOrCreateSessionId();
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const me = await base44.auth.me();
          setUser(me);
        }
      } catch (error) {
        console.error("Unable to load perks card state:", error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const qrValue = useMemo(
    () => buildQrValue({ user, localCard, source: qrSource }),
    [localCard, qrSource, user]
  );

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
    qrValue
  )}`;

  const memberName = user?.full_name || localCard?.firstName || "DowntownPerks Member";
  const memberStatus = user || localCard?.activated ? "Active Member" : "Preview access";
  const memberId = user?.id || localCard?.memberId || "Unlock to issue member ID";

  const handleSoftSignup = (event) => {
    event.preventDefault();
    const nextCard = createPreviewCard(form, qrSource);
    window.localStorage.setItem(LOCAL_CARD_KEY, JSON.stringify(nextCard));
    setLocalCard(nextCard);
  };

  const handleCopyMemberId = async () => {
    await navigator.clipboard.writeText(String(memberId));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[rgba(11,31,51,0.16)] border-t-[var(--dp-navy,#0B1F33)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(207,175,90,0.10),transparent_28%),linear-gradient(180deg,#F8F7F3_0%,#F1F0EA_100%)] px-5 pb-20 pt-28 text-[var(--dp-navy,#0B1F33)]">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:sticky lg:top-28"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--dp-gold-deep,#A97816)]">
            Your Membership
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-[0.92] tracking-[-0.065em] md:text-6xl">
            Perks Card
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-[rgba(11,31,51,0.66)]">
            Scan or show this code at partner venues to redeem perks and verify membership.
            You can still explore the map without creating an account.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/downtown-perks/explore"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[var(--dp-navy,#0B1F33)] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[rgba(11,31,51,0.9)]"
            >
              Explore the Map
              <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </Link>
            <Link
              to="/resident-app"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-white/42 px-5 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy,#0B1F33)] transition hover:bg-white/68"
            >
              Open resident app
            </Link>
          </div>
        </motion.section>

        <div className="space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="rounded-[32px] bg-[rgba(255,255,255,0.38)] p-5 shadow-[0_24px_70px_rgba(11,31,51,0.08)] backdrop-blur-xl md:p-8"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[rgba(11,31,51,0.07)]">
                  <MapPin className="h-5 w-5 text-[var(--dp-navy,#0B1F33)]" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(11,31,51,0.48)]">
                    Downtown Perks
                  </p>
                  <p className="font-heading text-xl font-semibold tracking-[-0.04em]">
                    Member access
                  </p>
                </div>
              </div>
              <ShieldCheck className="h-5 w-5 text-[var(--dp-gold,#CFAF5A)]" strokeWidth={1.75} />
            </div>

            <div className="mt-8 flex justify-center">
              <div className="rounded-[26px] bg-white p-4 shadow-[0_18px_42px_rgba(11,31,51,0.10)]">
                <img src={qrUrl} alt="Downtown Perks membership QR code" className="h-64 w-64 rounded-[18px]" />
              </div>
            </div>

            <div className="mt-7 text-center">
              <h2 className="text-2xl font-semibold tracking-[-0.04em]">{memberName}</h2>
              <p className="mt-1 text-sm font-medium text-[rgba(11,31,51,0.58)]">{memberStatus}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.42)]">
                Austin, TX · Downtown Core
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyMemberId}
              className="mx-auto mt-6 flex items-center gap-2 rounded-full bg-[rgba(11,31,51,0.05)] px-4 py-2 text-xs font-semibold text-[rgba(11,31,51,0.62)] transition hover:bg-[rgba(11,31,51,0.08)]"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : memberId}
            </button>
          </motion.section>

          {!user && !localCard?.activated && (
            <motion.form
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              onSubmit={handleSoftSignup}
              className="rounded-[28px] bg-[rgba(255,255,255,0.32)] p-5 backdrop-blur-xl md:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-[12px] bg-[rgba(11,31,51,0.06)]">
                  <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-[-0.035em]">Unlock your card when you need it.</h3>
                  <p className="mt-1 text-sm leading-6 text-[rgba(11,31,51,0.62)]">
                    Browse first. Add your phone only when you want saves, RSVP, resident-only perks, or redemption.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <input
                  value={form.firstName}
                  onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                  placeholder="First name"
                  className="h-12 rounded-[12px] bg-white/54 px-4 text-sm outline-none placeholder:text-[rgba(11,31,51,0.38)] focus:bg-white/78"
                />
                <input
                  value={form.mobile}
                  onChange={(event) => setForm((current) => ({ ...current, mobile: event.target.value }))}
                  placeholder="Mobile number"
                  inputMode="tel"
                  className="h-12 rounded-[12px] bg-white/54 px-4 text-sm outline-none placeholder:text-[rgba(11,31,51,0.38)] focus:bg-white/78"
                />
                <input
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Email optional"
                  type="email"
                  className="h-12 rounded-[12px] bg-white/54 px-4 text-sm outline-none placeholder:text-[rgba(11,31,51,0.38)] focus:bg-white/78"
                />
                <input
                  value={form.building}
                  onChange={(event) => setForm((current) => ({ ...current, building: event.target.value }))}
                  placeholder="Building optional"
                  className="h-12 rounded-[12px] bg-white/54 px-4 text-sm outline-none placeholder:text-[rgba(11,31,51,0.38)] focus:bg-white/78"
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[12px] bg-[var(--dp-navy,#0B1F33)] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[rgba(11,31,51,0.9)]"
                >
                  <Sparkles className="h-4 w-4 text-[var(--dp-gold,#CFAF5A)]" strokeWidth={1.75} />
                  Text me access
                </button>
                <button
                  type="button"
                  onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                  className="inline-flex h-12 flex-1 items-center justify-center rounded-[12px] bg-white/42 px-5 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy,#0B1F33)] transition hover:bg-white/68"
                >
                  Existing account
                </button>
              </div>
            </motion.form>
          )}

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="grid gap-3 sm:grid-cols-3"
          >
            {[
              { label: "Browse first", detail: "No login wall before the map." },
              { label: "Unlock on intent", detail: "Save, RSVP, redeem, or issue your card." },
              { label: "Track value", detail: "QR source, scans, saves, and redemptions feed the hub." },
            ].map((item) => (
              <div key={item.label} className="rounded-[20px] bg-white/28 p-4 backdrop-blur-md">
                <h4 className="text-sm font-semibold tracking-[-0.02em]">{item.label}</h4>
                <p className="mt-2 text-xs leading-5 text-[rgba(11,31,51,0.58)]">{item.detail}</p>
              </div>
            ))}
          </motion.section>
        </div>
      </div>
    </div>
  );
}
