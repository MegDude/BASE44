import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, LogIn, UserPlus, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PARTNER_PROFILE_KEY = "dp_partner_workspace:profile:partner@downtownperks.local";

const PARTNER_TYPES = [
  { value: "venue", label: "Venue" },
  { value: "property", label: "Property / Building" },
  { value: "hotel", label: "Hotel" },
  { value: "brand", label: "Brand" },
  { value: "civic", label: "Civic / Community" },
];

function savePartnerProfile(profile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PARTNER_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // The workspace still renders even when browser storage is unavailable.
  }
}

function startBase44SignIn() {
  if (typeof window === "undefined") return;
  const returnTo = `${window.location.origin}/partner-workspace/overview`;

  if (typeof base44.auth.loginWithRedirect === "function") {
    base44.auth.loginWithRedirect(returnTo);
    return;
  }

  if (typeof base44.auth.login === "function") {
    base44.auth.login(returnTo);
  }
}

export default function PartnerAccess({ mode = "sign-in" }) {
  const isSignUp = mode === "sign-up";
  const navigate = useNavigate();
  const [form, setForm] = useState({
    organization_name: "",
    contact_name: "",
    email: "",
    partner_type: "venue",
    website: "",
    bio: "",
  });
  const [saved, setSaved] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    savePartnerProfile({
      organization_name: form.organization_name || form.contact_name || "Downtown Perks Partner",
      full_name: form.organization_name || form.contact_name || "Downtown Perks Partner",
      contact_name: form.contact_name,
      partner_type: form.partner_type,
      website: form.website,
      bio: form.bio,
      signup_email: form.email,
      access_status: "local",
      updated_date: new Date().toISOString(),
    });
    setSaved(true);
    window.setTimeout(() => navigate("/partner-workspace/overview"), 450);
  }

  return (
    <main className="dp-partner-page min-h-screen bg-white px-5 pb-14 pt-28 text-[#0B1F33]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/partners")}
            className="inline-flex h-9 items-center gap-2 rounded-[2px] border border-[#0B1F33]/10 bg-white px-3 text-[12px] font-semibold text-[#0B1F33]/68 transition hover:border-[#C8A96A]/45 hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Partners
          </button>
          <button
            type="button"
            onClick={() => navigate("/map?mode=partner&tab=map&filter=All")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[2px] border border-[#0B1F33]/10 bg-white text-[#0B1F33]/68 transition hover:border-[#C8A96A]/45 hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
            aria-label="Close partner access"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
              Partner Access
            </p>
            <h1 className="mt-4 max-w-xl font-heading text-4xl font-medium leading-[0.98] tracking-normal text-[#0B1F33] md:text-5xl">
              {isSignUp ? "Create a partner workspace." : "Sign in to your partner workspace."}
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-7 text-[#0B1F33]/66">
              {isSignUp
                ? "Start with a simple local workspace. Add perks, events, profile details, reports, and campaign planning without blocking public access."
                : "Use an account when you want Base44-backed saves. You can still view the platform and use local workspace tools without signing in."}
            </p>

            <div className="mt-8 grid gap-3 text-[13px] leading-6 text-[#0B1F33]/68">
              {[
                "Workspace: perks, events, profile, and civic intelligence.",
                "Dashboard: activity, inKind, civic, and partner reporting.",
                "Campaigns: campaign builder and placement planning.",
                "Map: partner inventory, panels, reports, and opportunities.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-[#C8A96A]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[10px] border border-[#0B1F33]/[0.08] bg-white/88 p-5 shadow-[0_8px_24px_rgba(11,31,51,.055)]">
            {isSignUp ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Sign up</p>
                  <h2 className="font-body mt-1 text-[18px] font-semibold leading-snug tracking-normal text-[#0B1F33]">
                    Set up your workspace
                  </h2>
                </div>

                <PartnerAccessField label="Organization name" value={form.organization_name} onChange={(value) => updateField("organization_name", value)} required />
                <PartnerAccessField label="Contact name" value={form.contact_name} onChange={(value) => updateField("contact_name", value)} />
                <PartnerAccessField label="Email" type="email" value={form.email} onChange={(value) => updateField("email", value)} required />

                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.1em] text-[#0B1F33]/55">Partner type</label>
                  <select
                    value={form.partner_type}
                    onChange={(event) => updateField("partner_type", event.target.value)}
                    className="w-full rounded-[6px] border border-[#0B1F33]/10 bg-[#F7F8FB] px-4 py-2.5 text-[13px] text-[#0B1F33] outline-none transition focus:border-[#C8A96A]/55"
                  >
                    {PARTNER_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <PartnerAccessField label="Website" type="url" value={form.website} onChange={(value) => updateField("website", value)} />

                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.1em] text-[#0B1F33]/55">What do you want to manage?</label>
                  <textarea
                    rows={4}
                    value={form.bio}
                    onChange={(event) => updateField("bio", event.target.value)}
                    className="w-full resize-none rounded-[6px] border border-[#0B1F33]/10 bg-[#F7F8FB] px-4 py-2.5 text-[13px] text-[#0B1F33] outline-none transition placeholder:text-[#0B1F33]/35 focus:border-[#C8A96A]/55"
                    placeholder="Perks, events, resident offers, campaigns, reports, civic programs..."
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[2px] bg-[#0B1F33] px-5 text-[13px] font-semibold text-white transition hover:bg-[#132238] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
                >
                  {saved ? <Check className="h-4 w-4 text-[#C8A96A]" /> : <UserPlus className="h-4 w-4 text-[#C8A96A]" />}
                  {saved ? "Workspace created" : "Create workspace"}
                </button>
              </form>
            ) : (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Sign in</p>
                <h2 className="font-body mt-1 text-[18px] font-semibold leading-snug tracking-normal text-[#0B1F33]">
                  Open your partner account
                </h2>
                <p className="mt-3 text-[13px] leading-6 text-[#0B1F33]/64">
                  Sign in when you want authenticated Base44-backed saves. The public partner workspace remains available for preview and local setup.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={startBase44SignIn}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-[2px] bg-[#0B1F33] px-5 text-[13px] font-semibold text-white transition hover:bg-[#132238] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
                  >
                    <LogIn className="h-4 w-4 text-[#C8A96A]" />
                    Sign in
                  </button>
                  <Link
                    to="/partners/sign-up"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-[2px] border border-[#0B1F33]/10 bg-white px-5 text-[13px] font-semibold text-[#0B1F33]/72 transition hover:border-[#C8A96A]/45 hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
                  >
                    Create workspace
                    <ArrowRight className="h-4 w-4 text-[#C8A96A]" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function PartnerAccessField({ label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.1em] text-[#0B1F33]/55">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded-[6px] border border-[#0B1F33]/10 bg-[#F7F8FB] px-4 py-2.5 text-[13px] text-[#0B1F33] outline-none transition placeholder:text-[#0B1F33]/35 focus:border-[#C8A96A]/55"
      />
    </div>
  );
}
