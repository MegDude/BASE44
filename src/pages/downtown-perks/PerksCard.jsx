import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  CreditCard,
  MapPin,
  QrCode,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import { FAQ_RESIDENT } from "@/lib/faq-data";
import { ROUTES } from "@/lib/routes";

const LOCAL_CARD_KEY = "downtown-perks-card-preview";
const LOCAL_SESSION_KEY = "downtown-perks-anonymous-session";

const ONBOARDING_STEPS = [
  {
    id: "01",
    title: "Open the map",
    body: "Start with the live downtown map and see what is nearby before anything else.",
    icon: MapPin,
  },
  {
    id: "02",
    title: "Save or RSVP",
    body: "Use the map first, then move into the card flow when a perk, RSVP, or member action matters.",
    icon: Sparkles,
  },
  {
    id: "03",
    title: "Show your card",
    body: "Keep one card ready for perks, RSVP check-in, and member access points across downtown.",
    icon: QrCode,
  },
  {
    id: "04",
    title: "Redeem or check in",
    body: "Use the card when the action matters, while the map stays the main way people browse and decide.",
    icon: CreditCard,
  },
];

const VALUE_POINTS = [
  "Live downtown map access",
  "Nearby places, events, and perks",
  "Card-ready access when a perk or RSVP matters",
  "Resident fee refunded if your building joins later",
];

const ELIGIBILITY_POINTS = [
  "Residents whose building already participates",
  "Residents joining directly for $25 per year",
  "People who want map-first access with card-ready perks when needed",
];

const NEXT_STEP_ITEMS = [
  {
    title: "Eligibility check",
    body: "We verify whether your building already covers resident access before asking you to do anything else.",
  },
  {
    title: "Payment only if needed",
    body: "If your building is not covered, we follow up with the direct $25/year resident access step.",
  },
  {
    title: "Card goes live",
    body: "Once access is confirmed, your QR card is ready for perks, RSVP flows, and member checkpoints.",
  },
];

function getOrCreateSessionId() {
  const existing = window.localStorage.getItem(LOCAL_SESSION_KEY);
  if (existing) return existing;
  const next = `anon-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(LOCAL_SESSION_KEY, next);
  return next;
}

function buildQrValue({ localCard, source }) {
  return JSON.stringify({
    type: "downtown_perks_member_card",
    version: "1.0",
    memberId: localCard?.memberId || "preview",
    name: localCard?.firstName || "Downtown Perks Member",
    status: localCard?.activated ? "active" : "preview",
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
    firstName: form.firstName.trim() || "Downtown Perks Member",
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
    try {
      const cachedCard = window.localStorage.getItem(LOCAL_CARD_KEY);
      if (cachedCard) {
        const parsed = JSON.parse(cachedCard);
        setLocalCard(parsed);
        setForm((current) => ({
          ...current,
          firstName: parsed.firstName || "",
          mobile: parsed.mobile || "",
          email: parsed.email || "",
          building: parsed.building || "",
        }));
      }
      getOrCreateSessionId();
    } catch (error) {
      console.error("Unable to load perks card state:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const qrValue = useMemo(() => buildQrValue({ localCard, source: qrSource }), [localCard, qrSource]);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(qrValue)}`;
  const memberName = localCard?.firstName || "Downtown Perks Member";
  const memberStatus = localCard?.activated ? "Active member" : "Preview access";
  const memberId = localCard?.memberId || "Issued after signup";
  const paymentStatus = localCard?.activated ? "Access request received" : "Pending eligibility check";
  const signupStateLabel = localCard?.activated ? "Card preview ready" : "Signup not started";

  async function handleSoftSignup(event) {
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
      setSubmitSuccess("Request saved. We’ll confirm whether your building already covers access or send the $25/year next step.");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save your card request right now.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopyMemberId() {
    if (!navigator?.clipboard) return;
    await navigator.clipboard.writeText(String(memberId));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[rgba(11,31,51,0.16)] border-t-[var(--dp-navy,#0B1F33)]" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(207,175,90,0.10),transparent_22%),linear-gradient(180deg,#F7F8FB_0%,#F2F5F9_100%)] px-4 pb-14 pt-24 text-[var(--dp-navy,#0B1F33)] md:px-5">
      <div className="mx-auto max-w-6xl space-y-5">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white shadow-[0_20px_52px_rgba(11,31,51,0.08)]"
        >
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-5 md:p-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(11,31,51,0.05)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.62)]">
                <WalletCards className="h-3.5 w-3.5 text-[var(--dp-gold,#CFAF5A)]" />
                Perks Card
              </div>

              <h1 className="mt-4 font-heading text-[2.35rem] font-semibold leading-[0.94] tracking-[-0.05em] text-foreground md:text-[3.3rem]">
                Your downtown access layer.
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[rgba(11,31,51,0.68)]">
                Use the map first. Show the card when a perk, RSVP, or access point matters.
              </p>
              <p className="mt-2 max-w-2xl text-[15px] leading-7 text-[rgba(11,31,51,0.68)]">
                No app download. No account setup required to browse. Direct resident access is <span className="font-semibold text-foreground">$25 per year</span> if your building is not already live.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-[rgba(247,249,252,0.88)] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.46)]">
                    Resident pricing
                  </div>
                  <div className="mt-2 text-[1.8rem] font-semibold tracking-[-0.04em] text-foreground">$25<span className="text-[1rem] text-[rgba(11,31,51,0.52)]">/year</span></div>
                  <p className="mt-2 text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">
                    If your building joins after you pay, your resident fee is refunded.
                  </p>
                </div>

                <div className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-[rgba(247,249,252,0.88)] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.46)]">
                    What you get
                  </div>
                  <div className="mt-3 space-y-2">
                    {VALUE_POINTS.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-[13px] leading-6 text-[rgba(11,31,51,0.68)]">
                        <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-[var(--dp-gold-deep,#A97816)]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#resident-signup"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[var(--dp-navy,#0B1F33)] px-5 text-sm font-semibold text-white"
                >
                  Get Your Card
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  to={ROUTES.explore}
                  className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[rgba(247,249,252,0.94)] px-5 text-sm font-semibold text-[var(--dp-navy,#0B1F33)]"
                >
                  Open the map first
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden bg-[var(--dp-navy,#0B1F33)] p-5 md:p-7">
              <img
                src="/media/austin-hero-correct.png"
                alt="Downtown Austin skyline"
                className="absolute inset-0 h-full w-full object-cover opacity-[0.26]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,31,51,0.26),rgba(11,31,51,0.86))]" />

              <div className="relative grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="rounded-[24px] border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] p-4 text-white backdrop-blur-xl">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/58">
                    {memberStatus}
                  </div>
                  <div className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em]">{memberName}</div>
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

                <div className="justify-self-start rounded-[24px] bg-white p-4 shadow-[0_24px_52px_rgba(6,14,26,0.28)]">
                  <img src={qrUrl} alt="Downtown Perks membership QR code" className="h-40 w-40 rounded-[16px] sm:h-44 sm:w-44" />
                  <div className="mt-3 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.56)]">
                    <span>Scan or show</span>
                    <QrCode className="h-4 w-4 text-[var(--dp-gold,#CFAF5A)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[26px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_14px_36px_rgba(11,31,51,0.05)] md:p-6"
          >
            <div className="dp-micro-label">Eligibility and status</div>
            <h2 className="mt-3 text-[1.5rem] font-semibold tracking-[-0.04em] text-foreground">
              One page for card access, eligibility, status, and next steps.
            </h2>

            <div className="mt-5 grid gap-3">
              <div className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-[rgba(247,249,252,0.88)] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.46)]">
                  Who this is for
                </div>
                <div className="mt-3 space-y-2">
                  {ELIGIBILITY_POINTS.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-[13px] leading-6 text-[rgba(11,31,51,0.66)]">
                      <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-[var(--dp-gold-deep,#A97816)]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.46)]">
                    Signup status
                  </div>
                  <div className="mt-2 text-[1.1rem] font-semibold text-foreground">{signupStateLabel}</div>
                  <p className="mt-2 text-[13px] leading-6 text-[rgba(11,31,51,0.66)]">
                    {localCard
                      ? "Your preview card is already staged on this device while we hold the rest of the access flow in one place."
                      : "Start below and this page becomes your resident access checkpoint instead of sending you into a second flow."}
                  </p>
                </div>

                <div className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.46)]">
                    Payment status
                  </div>
                  <div className="mt-2 text-[1.1rem] font-semibold text-foreground">{paymentStatus}</div>
                  <p className="mt-2 text-[13px] leading-6 text-[rgba(11,31,51,0.66)]">
                    We only push the direct <span className="font-semibold text-foreground">$25/year</span> payment step if your building does not already cover access.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.46)]">
                Full onboarding flow
              </div>
              <div className="mt-4 space-y-4">
                {ONBOARDING_STEPS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="grid gap-3 border-t border-[rgba(11,31,51,0.08)] pt-4 md:grid-cols-[48px_minmax(0,1fr)]">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[rgba(11,31,51,0.06)] text-[var(--dp-navy,#0B1F33)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.46)]">
                          Step {step.id}
                        </div>
                        <div className="mt-1 text-[15px] font-semibold text-foreground">{step.title}</div>
                        <p className="mt-1 text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">{step.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          <motion.section
            id="resident-signup"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="rounded-[26px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_14px_36px_rgba(11,31,51,0.05)] md:p-6"
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-[14px] bg-[rgba(11,31,51,0.06)]">
                <Sparkles className="h-4 w-4 text-[var(--dp-gold,#CFAF5A)]" />
              </span>
              <div>
                <div className="dp-micro-label">Sign up</div>
                <h2 className="mt-2 text-[1.5rem] font-semibold tracking-[-0.04em] text-foreground">
                  Start resident access
                </h2>
                <p className="mt-2 text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">
                  Submit your details here. We’ll confirm whether your building already covers access or follow up with the
                  direct <span className="font-semibold text-foreground">$25/year</span> step.
                </p>
              </div>
            </div>

            <form onSubmit={handleSoftSignup} className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-[12px] font-medium text-foreground">
                  <span>First name</span>
                  <input
                    value={form.firstName}
                    onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                    placeholder="Your first name"
                    required
                    className="h-11 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-4 text-sm outline-none placeholder:text-[rgba(11,31,51,0.38)] focus:bg-white"
                  />
                </label>
                <label className="grid gap-2 text-[12px] font-medium text-foreground">
                  <span>Mobile number</span>
                  <input
                    value={form.mobile}
                    onChange={(event) => setForm((current) => ({ ...current, mobile: event.target.value }))}
                    placeholder="(555) 555-5555"
                    inputMode="tel"
                    required
                    className="h-11 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-4 text-sm outline-none placeholder:text-[rgba(11,31,51,0.38)] focus:bg-white"
                  />
                </label>
                <label className="grid gap-2 text-[12px] font-medium text-foreground">
                  <span>Email</span>
                  <input
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="Email address"
                    type="email"
                    className="h-11 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-4 text-sm outline-none placeholder:text-[rgba(11,31,51,0.38)] focus:bg-white"
                  />
                </label>
                <label className="grid gap-2 text-[12px] font-medium text-foreground">
                  <span>Building</span>
                  <input
                    value={form.building}
                    onChange={(event) => setForm((current) => ({ ...current, building: event.target.value }))}
                    placeholder="Your building or address"
                    required
                    className="h-11 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-4 text-sm outline-none placeholder:text-[rgba(11,31,51,0.38)] focus:bg-white"
                  />
                </label>
              </div>

              <div className="rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-[rgba(247,249,252,0.88)] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.46)]">
                  What happens next
                </div>
                <div className="mt-2 space-y-2 text-[13px] leading-6 text-[rgba(11,31,51,0.66)]">
                  <p>1. We check whether your building already has live resident access.</p>
                  <p>2. If yes, we route you into covered card access.</p>
                  <p>3. If not, we follow up with the direct resident access step at $25/year.</p>
                </div>
              </div>

              {submitError ? (
                <div className="rounded-[14px] border border-[rgba(185,28,28,0.16)] bg-[rgba(254,242,242,0.74)] px-4 py-3 text-[13px] leading-6 text-[rgba(153,27,27,0.9)]">
                  {submitError}
                </div>
              ) : null}

              {submitSuccess ? (
                <div className="rounded-[14px] border border-[rgba(21,128,61,0.14)] bg-[rgba(240,253,244,0.74)] px-4 py-3 text-[13px] leading-6 text-[rgba(22,101,52,0.9)]">
                  {submitSuccess}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[14px] bg-[var(--dp-navy,#0B1F33)] px-5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4 text-[var(--dp-gold,#CFAF5A)]" />
                  {submitting ? "Submitting..." : "Start resident signup"}
                </button>
                <Link
                  to={ROUTES.explore}
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-5 text-sm font-semibold text-[var(--dp-navy,#0B1F33)]"
                >
                  Keep browsing
                </Link>
              </div>
            </form>
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-[26px] border border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,249,252,0.96))] p-5 shadow-[0_14px_36px_rgba(11,31,51,0.05)] md:p-6"
        >
          <div className="dp-micro-label">What happens after signup</div>
          <h2 className="mt-3 text-[1.5rem] font-semibold tracking-[-0.04em] text-foreground">
            Clear next steps, without leaving this page.
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {NEXT_STEP_ITEMS.map((item) => (
              <div key={item.title} className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.46)]">
                  {item.title}
                </div>
                <p className="mt-2 text-[13px] leading-6 text-[rgba(11,31,51,0.66)]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        <FAQAccordionBlock
          sectionEyebrow="Resident card"
          sectionTitle="Questions people ask before signing up"
          sectionIntro="The card flow should be clear before someone gives us their number."
          items={FAQ_RESIDENT}
          styleVariant="default"
          defaultOpenIndex={0}
          allowMultipleOpen={false}
          pageType="resident-card"
          ctaLabel="Open the map"
          ctaHref={ROUTES.explore}
        />
      </div>
    </main>
  );
}
