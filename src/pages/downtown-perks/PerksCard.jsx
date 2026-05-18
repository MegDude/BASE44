import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ScanLine,
  WalletCards,
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
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [localCard, setLocalCard] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    mobile: "",
    email: "",
    building: "",
  });

  const qrSource = searchParams.get("src") || searchParams.get("source") || "direct";

  useEffect(() => {
    function loadCardState() {
      try {
        const cachedCard = window.localStorage.getItem(LOCAL_CARD_KEY);
        if (cachedCard) {
          setLocalCard(JSON.parse(cachedCard));
        }
        getOrCreateSessionId();
      } catch (error) {
        console.error("Unable to load perks card state:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCardState();
  }, []);

  const qrValue = useMemo(
    () => buildQrValue({ localCard, source: qrSource }),
    [localCard, qrSource]
  );

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
    qrValue
  )}`;

  const memberName = localCard?.firstName || "DowntownPerks Member";
  const memberStatus = localCard?.activated ? "Active Member" : "Preview access";
  const memberId = localCard?.memberId || "Unlock to issue member ID";
  const processSteps = [
    {
      label: "Look around first",
      detail: "Open the map and see what is nearby before you give us anything.",
      icon: MapPin,
    },
    {
      label: "Use it when you want to",
      detail: "Add your number when you want to save something, RSVP, use a perk, or get your card.",
      icon: MessageSquare,
    },
    {
      label: "Keep track of what works",
      detail: "We can see which QR code people came from and what they actually used after that.",
      icon: ShieldCheck,
    },
  ];

  const handleSoftSignup = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    setSubmitting(true);

    try {
      const sessionId = getOrCreateSessionId();
      const response = await fetch("/api/card-capture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName,
          mobile: form.mobile,
          email: form.email,
          building: form.building,
          source: qrSource,
          sessionId,
          pagePath: window.location.pathname,
          currentUrl: window.location.href,
          referrer: document.referrer || "",
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Unable to save your card request right now.");
      }

      const nextCard = createPreviewCard(form, qrSource);
      window.localStorage.setItem(LOCAL_CARD_KEY, JSON.stringify(nextCard));
      setLocalCard(nextCard);
      setSubmitSuccess("Saved. Your access request was captured.");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save your card request right now.");
    } finally {
      setSubmitting(false);
    }
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_14%_0%,rgba(207,175,90,0.10),transparent_22%),linear-gradient(180deg,#F7F8FB_0%,#F3F6FA_100%)] px-4 pb-14 pt-24 text-[var(--dp-navy,#0B1F33)] md:px-5">
      <div className="mx-auto max-w-6xl space-y-5">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[30px] border border-[rgba(11,31,51,0.08)] bg-white shadow-[0_22px_60px_rgba(11,31,51,0.08)]"
        >
          <div className="grid gap-0 lg:grid-cols-[0.94fr_1.06fr]">
            <div className="p-5 md:p-7 lg:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--dp-gold-deep,#A97816)]">
                Your Membership
              </p>
              <h1 className="mt-3 font-heading text-[2.6rem] font-semibold leading-[0.94] tracking-[-0.05em] text-foreground md:text-[3.4rem]">
                Your downtown access layer.
              </h1>
              <p className="mt-3 max-w-xl text-[14px] leading-6 text-[rgba(11,31,51,0.66)] md:text-[15px]">
                Use the map first. Show the card when a perk, RSVP, or access point matters.
              </p>
              <p className="mt-2 max-w-xl text-[14px] leading-6 text-[rgba(11,31,51,0.56)]">
                No app download. No account setup. Your card appears when there is something to save, use, RSVP to, or redeem.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/downtown-perks/explore"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[var(--dp-navy,#0B1F33)] px-5 text-sm font-semibold text-white transition hover:bg-[rgba(11,31,51,0.9)]"
                >
                  Explore the Map
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                </Link>
                <Link
                  to="/resident-app"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[rgba(247,249,252,0.94)] px-5 text-sm font-semibold text-[var(--dp-navy,#0B1F33)] transition hover:bg-white"
                >
                  Open resident app
                </Link>
              </div>

              <div className="mt-6 grid gap-2 sm:grid-cols-3">
                {processSteps.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + index * 0.08 }}
                      className="rounded-[18px] border border-[rgba(11,31,51,0.06)] bg-[rgba(247,249,252,0.9)] px-3 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(11,31,51,0.08)] text-[var(--dp-navy,#0B1F33)]">
                          <Icon className="h-4 w-4" strokeWidth={1.7} />
                        </span>
                        <span className="text-[13px] font-semibold tracking-[-0.02em] text-foreground">{item.label}</span>
                      </div>
                      <p className="mt-2 text-[12px] leading-5 text-[rgba(11,31,51,0.6)]">{item.detail}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="relative min-h-[320px] overflow-hidden bg-[var(--dp-navy,#0B1F33)]">
              <img
                src="/media/austin-hero-correct.png"
                alt="Downtown Austin skyline"
                className="absolute inset-0 h-full w-full object-cover opacity-[0.42]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,31,51,0.28),rgba(11,31,51,0.78))]" />

              <div className="relative flex h-full min-h-[320px] items-end p-5 md:p-7">
                <div className="grid w-full gap-4 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-[24px] border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] p-4 text-white backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/58">
                          Downtown Perks
                        </div>
                        <div className="mt-1 text-[18px] font-semibold tracking-[-0.03em]">Member access</div>
                      </div>
                      <WalletCards className="h-5 w-5 text-[var(--dp-gold,#CFAF5A)]" strokeWidth={1.7} />
                    </div>
                    <div className="mt-6 rounded-[20px] border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] p-4">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/52">
                        {memberStatus}
                      </div>
                      <div className="mt-2 text-[22px] font-semibold tracking-[-0.04em]">{memberName}</div>
                      <div className="mt-2 text-[11px] uppercase tracking-[0.14em] text-white/48">
                        Austin, TX · Downtown Core
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyMemberId}
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] px-3 py-2 text-[11px] font-semibold text-white/88"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied" : memberId}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.16, duration: 0.45 }}
                    className="justify-self-start rounded-[26px] bg-white p-4 shadow-[0_24px_52px_rgba(6,14,26,0.28)]"
                  >
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                      className="rounded-[20px] bg-white"
                    >
                      <img src={qrUrl} alt="Downtown Perks membership QR code" className="h-44 w-44 rounded-[16px] md:h-52 md:w-52" />
                    </motion.div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.56)]">
                      <span>Scan or show</span>
                      <ScanLine className="h-4 w-4 text-[var(--dp-gold,#CFAF5A)]" strokeWidth={1.7} />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-5 lg:grid-cols-[0.98fr_1.02fr]">
          {!localCard?.activated ? (
            <motion.form
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              onSubmit={handleSoftSignup}
              className="rounded-[26px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_14px_36px_rgba(11,31,51,0.05)] md:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-[14px] bg-[rgba(11,31,51,0.06)]">
                  <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-[1.1rem] font-semibold tracking-[-0.03em]">Unlock your card when you need it</h3>
                  <p className="mt-1 text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">
                    Browse first. Add your phone only when you want saves, RSVP, resident-only perks, or redemption.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  value={form.firstName}
                  onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                  placeholder="First name"
                  className="h-11 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-4 text-sm outline-none placeholder:text-[rgba(11,31,51,0.38)] focus:bg-white"
                />
                <input
                  value={form.mobile}
                  onChange={(event) => setForm((current) => ({ ...current, mobile: event.target.value }))}
                  placeholder="Mobile number"
                  inputMode="tel"
                  className="h-11 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-4 text-sm outline-none placeholder:text-[rgba(11,31,51,0.38)] focus:bg-white"
                />
                <input
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Email optional"
                  type="email"
                  className="h-11 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-4 text-sm outline-none placeholder:text-[rgba(11,31,51,0.38)] focus:bg-white"
                />
                <input
                  value={form.building}
                  onChange={(event) => setForm((current) => ({ ...current, building: event.target.value }))}
                  placeholder="Building optional"
                  className="h-11 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-4 text-sm outline-none placeholder:text-[rgba(11,31,51,0.38)] focus:bg-white"
                />
              </div>

              {submitError ? (
                <div className="mt-4 rounded-[14px] border border-[rgba(185,28,28,0.16)] bg-[rgba(254,242,242,0.74)] px-4 py-3 text-[13px] leading-6 text-[rgba(153,27,27,0.9)]">
                  {submitError}
                </div>
              ) : null}

              {submitSuccess ? (
                <div className="mt-4 rounded-[14px] border border-[rgba(21,128,61,0.14)] bg-[rgba(240,253,244,0.74)] px-4 py-3 text-[13px] leading-6 text-[rgba(22,101,52,0.9)]">
                  {submitSuccess}
                </div>
              ) : null}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[14px] bg-[var(--dp-navy,#0B1F33)] px-5 text-sm font-semibold text-white transition hover:bg-[rgba(11,31,51,0.9)]"
                >
                  <Sparkles className="h-4 w-4 text-[var(--dp-gold,#CFAF5A)]" strokeWidth={1.75} />
                  {submitting ? "Saving..." : "Text me access"}
                </button>
                <Link
                  to="/downtown-perks/explore"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-5 text-sm font-semibold text-[var(--dp-navy,#0B1F33)] transition hover:bg-white"
                >
                  Keep browsing
                </Link>
              </div>
            </motion.form>
          ) : (
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-[26px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_14px_36px_rgba(11,31,51,0.05)] md:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-[14px] bg-[rgba(11,31,51,0.06)]">
                  <Check className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-[1.1rem] font-semibold tracking-[-0.03em]">Your card is ready</h3>
                  <p className="mt-1 text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">
                    Show the QR code when you need it, then keep using the map the same way you already do.
                  </p>
                </div>
              </div>
            </motion.section>
          )}

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-[26px] border border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,249,252,0.94))] p-5 shadow-[0_14px_36px_rgba(11,31,51,0.05)] md:p-6"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(11,31,51,0.48)]">
              How it works
            </div>
            <div className="mt-3 space-y-3">
              {processSteps.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.14 + index * 0.08 }}
                    className="flex items-start gap-3 rounded-[18px] border border-[rgba(11,31,51,0.06)] bg-white/88 px-4 py-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(11,31,51,0.08)] text-[var(--dp-navy,#0B1F33)]">
                      <Icon className="h-4 w-4" strokeWidth={1.7} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold tracking-[-0.02em] text-foreground">{item.label}</div>
                      <div className="mt-1 text-[12px] leading-5 text-[rgba(11,31,51,0.58)]">{item.detail}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
