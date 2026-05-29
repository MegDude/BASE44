import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, CreditCard, MapPin, QrCode, ScanLine, Shield, Smartphone, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const LIVE_CARD_URL = "https://downtown-perks-live.base44.app/card";
const DEMO_CARD_CODE = "DP-DEMO-78701";
const PUBLIC_CARD_USER = {
  email: "resident@downtownperks.local",
  full_name: "Downtown Resident",
};

function getCardCode(user) {
  const id = user?.id || user?.email || "RESIDENT-ACCESS";
  return `DP-${String(id).replace(/[^a-z0-9]/gi, "").slice(0, 10).toUpperCase() || "RESIDENT"}`;
}

function getQrUrl(cardCode) {
  const cardUrl = `${LIVE_CARD_URL}?code=${encodeURIComponent(cardCode)}&source=resident-card`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(cardUrl)}`;
}

export default function PerksCard() {
  const [user, setUser] = useState(PUBLIC_CARD_USER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const me = await base44.auth.me();
          setUser(me || PUBLIC_CARD_USER);
        }
      } catch (error) {
        console.warn("Perks Card auth check skipped", error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const cardCode = getCardCode(user);
  const qrUrl = getQrUrl(cardCode);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FB] px-5 pb-20 pt-24 text-[#0B1F33]">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-[#B38F4F] text-[13px] font-medium uppercase tracking-widest">
            Resident Access
          </span>
          <h1 className="font-heading text-4xl md:text-4xl font-bold mt-2 mb-4 text-[#0B1F33]">
            Perks Card
          </h1>
          <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-[#0B1F33]/68">
            Connect your address and unlock downtown. The card gives partner staff a real scan surface for resident-only offers, events, and local access.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="relative overflow-hidden border border-[#0B1F33]/12 bg-white p-7 shadow-[0_24px_70px_rgba(6,27,51,0.12)]">
              <div className="absolute left-0 right-0 top-0 h-1 bg-[#B38F4F]" />

              <div className="flex items-center justify-between mb-7">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center border border-[#0B1F33]/12 bg-[#0B1F33]">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-heading font-bold text-[13px] text-[#0B1F33]">
                    Downtown<span className="text-[#B38F4F]"> Perks</span>
                  </span>
                </div>
                <Shield className="w-5 h-5 text-[#0B1F33]/48" />
              </div>

              <div className="mb-7 flex justify-center">
                <div className="border border-[#0B1F33]/12 bg-[#F7F8FB] p-4">
                  <img
                    src={qrUrl}
                    alt={`Downtown Perks QR code for ${cardCode}`}
                    className="h-48 w-48"
                    width="192"
                    height="192"
                  />
                </div>
              </div>

              <div className="text-center mb-4">
                <h3 className="font-heading text-xl font-bold text-[#0B1F33]">
                  {user ? user.full_name || "Downtown Resident" : "Resident Access"}
                </h3>
                <p className="text-[#0B1F33]/58 text-[13px] mt-1">
                  {user ? "Active member" : "Scan to activate or request access"}
                </p>
              </div>

              <div className="border-t border-[#0B1F33]/10 pt-4 text-center">
                <span className="block text-[10px] uppercase tracking-[0.18em] text-[#0B1F33]/45">Card code</span>
                <code className="mt-1 block font-mono text-[13px] font-bold text-[#0B1F33]">{cardCode}</code>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0B1F33]/70" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="group border border-[#0B1F33]/10 bg-white p-6 shadow-[0_18px_50px_rgba(11,31,51,0.08)] md:p-7"
          >
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#B38F4F]">Ready when you are</span>
            <h2 className="mt-3 font-heading text-3xl font-medium leading-tight text-[#0B1F33]">Claim your Perks Card.</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[#0B1F33]/66">
              Scan the QR code to open the live card flow, connect your building, and keep your resident access ready for partner venues.
            </p>

            <div className="relative mt-5 h-44 w-full overflow-hidden rounded-[14px] border border-[#0B1F33]/8 shadow-[0_8px_24px_rgba(11,31,51,.06)]">
              <img
                src="/images/venues/downtown-dining-patio.png"
                alt="Residents using Downtown Perks at a partner venue"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F33]/14 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 rounded-md border border-white/45 bg-white/90 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/86 shadow-[0_10px_26px_rgba(11,31,51,0.08)] backdrop-blur-[10px]">
                Scan at partner venues
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <Link
                to="/map?mode=resident&tab=pass"
                className="inline-flex h-10 items-center justify-center gap-2 bg-[#0B1F33] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#081521]"
              >
                <Sparkles className="w-4 h-4" />
                Activate Your Card
              </Link>
              <Link
                to="/map?mode=resident&tab=map"
                className="inline-flex h-10 items-center justify-center gap-2 border border-[#0B1F33]/12 bg-[#F7F8FB] px-5 text-[13px] font-semibold text-[#0B1F33] transition-colors hover:bg-white"
              >
                Explore the Map
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-7 grid gap-3 border-t border-[#0B1F33]/10 pt-5 sm:grid-cols-2">
              <div className="rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB]/78 p-4">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/52">
                  <QrCode className="h-3.5 w-3.5 text-[#B38F4F]" />
                  Resident demo code
                </div>
                <div className="mt-3 rounded-md border border-[#0B1F33]/10 bg-white p-3 text-center">
                  <img
                    src={getQrUrl(DEMO_CARD_CODE)}
                    alt={`Demo Downtown Perks QR code ${DEMO_CARD_CODE}`}
                    className="mx-auto h-32 w-32"
                    width="128"
                    height="128"
                  />
                  <code className="mt-2 block font-mono text-[11px] font-bold tracking-[0.12em] text-[#0B1F33]">{DEMO_CARD_CODE}</code>
                </div>
                <p className="mt-3 text-[12px] leading-5 text-[#0B1F33]/62">
                  Residents show this style of QR when they redeem a perk, check in for an event, or confirm building access.
                </p>
              </div>

              <div className="rounded-md border border-[#0B1F33]/8 bg-[#0B1F33] p-4 text-white">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/58">
                  <ScanLine className="h-3.5 w-3.5 text-[#B38F4F]" />
                  Partner scanner
                </div>
                <div className="mt-3 rounded-md border border-white/14 bg-white/8 p-3">
                  <div className="flex h-24 items-center justify-center rounded-md border border-white/18">
                    <ScanLine className="h-10 w-10 text-[#B38F4F]" />
                  </div>
                  <div className="mt-3 grid gap-2 text-[12px] leading-5 text-white/72">
                    {["Scan resident code", "Confirm active card", "Apply perk and record visit"].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#B38F4F]" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7 border-t border-[#0B1F33]/10 pt-5">
              <div className="mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/48">
                  How it works
                </span>
                <p className="mt-1 text-[12px] leading-5 text-[#0B1F33]/58">
                  Keep the card open, show it when needed, and use it to unlock nearby resident perks.
                </p>
              </div>
              <div className="grid gap-2.5">
              {[
                {
                  icon: Smartphone,
                  label: "Open it on your phone",
                  detail: "No download or extra app. Your card lives in the browser and is ready when you are downtown.",
                },
                {
                  icon: QrCode,
                  label: "Scan or show the card",
                  detail: "Use the QR code at participating places so staff can confirm your resident access.",
                },
                {
                  icon: CreditCard,
                  label: "Unlock resident perks",
                  detail: "See offers, events, and local access tied to Downtown Perks partners near you.",
                },
              ].map((f) => (
                <div
                  key={f.label}
                  className="grid grid-cols-[34px_1fr] gap-3 rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB]/78 p-3 shadow-[0_12px_32px_rgba(11,31,51,0.04)]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#B38F4F]/30 bg-white text-[#B38F4F]">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-body text-[12px] font-semibold leading-5 text-[#0B1F33]">{f.label}</h4>
                    <p className="mt-0.5 text-[11px] leading-5 text-[#0B1F33]/60">{f.detail}</p>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </motion.div>
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-[12px] leading-relaxed text-[#0B1F33]/50">
          Do not see your building yet? You can still request access. Participating buildings include Downtown Perks as a resident amenity.
        </p>
      </div>
    </div>
  );
}
