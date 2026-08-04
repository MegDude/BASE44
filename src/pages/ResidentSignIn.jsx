import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn, MapPin } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { DEFAULT_RESIDENT_MAP_PATH, getAuthenticatedDestination, getSafeReturnPath, storeAuthReturnPath } from "@/lib/authReturnPath";

export default function ResidentSignIn() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth, user, signInResidentWithPassword, signInWithGoogle, signInWithApple, signInResidentWithMagicLink, sendResidentPasswordReset } = useAuth();
  const returnTo = useMemo(() => getSafeReturnPath(location.search, DEFAULT_RESIDENT_MAP_PATH), [location.search]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(() => {
    const error = new URLSearchParams(location.search).get("error");
    return error ? { type: "error", message: error === "callback_failed" ? "We could not complete sign-in. Request a new secure link and try again." : error } : { type: "idle", message: "" };
  });

  useEffect(() => {
    if (isLoadingAuth || !isAuthenticated) return;
    navigate(getAuthenticatedDestination(user), { replace: true });
  }, [isAuthenticated, isLoadingAuth, navigate, user]);

  async function submit(event) {
    event.preventDefault();
    setStatus({ type: "loading", message: "" });
    storeAuthReturnPath(returnTo);
    const result = await signInResidentWithPassword({ email, password });
    if (result?.type === "authenticated") {
      navigate(getAuthenticatedDestination(result.user, returnTo), { replace: true });
      return;
    }
    setStatus({
      type: result?.confirmationRequired || result?.type === "confirmation_required" ? "confirmation" : result?.type === "error" ? "error" : "success",
      message: result?.message || (result?.type === "error" ? "Account access could not be completed." : "Check your email to continue."),
    });
  }

  async function submitGoogle() {
    setStatus({ type: "loading", message: "" });
    storeAuthReturnPath(returnTo);
    const result = await signInWithGoogle({ redirectPath: `/auth/callback?returnTo=${encodeURIComponent(returnTo)}` });
    if (result?.type === "error") setStatus({ type: "error", message: result.message });
  }

  async function submitApple() {
    setStatus({ type: "loading", message: "" });
    storeAuthReturnPath(returnTo);
    const result = await signInWithApple({ redirectPath: `/auth/callback?returnTo=${encodeURIComponent(returnTo)}` });
    if (result?.type === "error") setStatus({ type: "error", message: result.message });
  }

  async function submitMagicLink() {
    setStatus({ type: "loading", message: "" });
    storeAuthReturnPath(returnTo);
    const result = await signInResidentWithMagicLink({ email, redirectPath: `/auth/callback?returnTo=${encodeURIComponent(returnTo)}` });
    setStatus({ type: result?.type === "error" ? "error" : "confirmation", message: result?.message || "Check your email to continue." });
  }

  async function submitPasswordReset() {
    setStatus({ type: "loading", message: "" });
    const result = await sendResidentPasswordReset({ email, redirectPath: "/residents/reset-password" });
    setStatus({ type: result?.type === "error" ? "error" : "confirmation", message: result?.message || "Check your email to continue." });
  }

  const isLoading = status.type === "loading";

  return (
    <main className="min-h-screen bg-white px-5 py-12 text-[#0B1F33]">
      <div className="mx-auto max-w-md space-y-8">

        {/* Header Navigation */}
        <header className="flex items-center justify-between border-b border-black/5 pb-4">
          <Link to="/" aria-label="Downtown Perks home" className="flex items-center gap-2 text-[14.5px] font-semibold text-[#0B1F33] hover:text-[#C8A96A] transition-colors">
            <MapPin size={16} className="text-[#C8A96A]" aria-hidden="true" />
            <span>Downtown Perks</span>
          </Link>
          <Link
            to="/map?mode=resident&tab=map&filter=Featured&collection=downtown-perks-featured"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0B1F33]/60 hover:text-[#0B1F33] transition-colors"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Back to map</span>
          </Link>
        </header>

        {/* Content & Form */}
        <section className="space-y-6" aria-labelledby="resident-signin-title">

          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#C8A96A]">Resident Access</p>
            <h1 id="resident-signin-title" className="text-3xl font-semibold tracking-tight text-[#0B1F33]">Sign in to your downtown.</h1>
            <p className="text-[14px] leading-relaxed text-[#0B1F33]/70">Open your resident map, active perks, saved places, and card.</p>
          </div>

          {/* Sign-In Form */}
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-1">
              <label htmlFor="resident-email" className="block text-[13px] font-semibold text-[#0B1F33]">Email address</label>
              <input
                id="resident-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F2F2F7] px-4 py-3 rounded-xl text-[15px] text-[#0B1F33] outline-none transition-all focus:ring-2 focus:ring-[#C8A96A] placeholder:text-[#0B1F33]/30"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="resident-password" className="block text-[13px] font-semibold text-[#0B1F33]">Password</label>
              <input
                id="resident-password"
                name="password"
                type="password"
                autoComplete="current-password"
                minLength={8}
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F2F2F7] px-4 py-3 rounded-xl text-[15px] text-[#0B1F33] outline-none transition-all focus:ring-2 focus:ring-[#C8A96A] placeholder:text-[#0B1F33]/30"
              />
            </div>

            {status.message ? (
              <p
                className={`text-[13px] rounded-xl px-4 py-2.5 ${status.type === "error" ? "bg-red-50 text-red-700" : status.type === "confirmation" || status.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-[#F2F2F7] text-[#0B1F33]/70"}`}
                role={status.type === "error" ? "alert" : "status"}
              >
                {status.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#0B1F33] px-5 text-[14px] font-semibold text-white shadow-sm transition-transform active:scale-95 hover:bg-[#0B1F33]/90 disabled:opacity-50 disabled:cursor-wait"
            >
              <LogIn size={16} className="text-[#C8A96A]" aria-hidden="true" />
              <span>{isLoading ? "Please wait…" : "Sign in"}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-2" aria-hidden="true">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/10" /></div>
            <span className="relative bg-white px-3 text-[12px] font-medium text-[#0B1F33]/40 uppercase tracking-widest">or</span>
          </div>

          {/* OAuth / Quick Actions */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={submitGoogle}
              disabled={isLoading}
              className="flex min-h-[46px] w-full items-center justify-center gap-3 rounded-xl border border-black/10 bg-white px-4 text-[14px] font-semibold text-[#0B1F33] transition-all hover:border-[#C8A96A] hover:bg-[#F8F9FA] disabled:opacity-50"
            >
              <span>Continue with Google</span>
            </button>
            <button
              type="button"
              onClick={submitApple}
              disabled={isLoading}
              className="flex min-h-[46px] w-full items-center justify-center gap-3 rounded-xl border border-black/10 bg-white px-4 text-[14px] font-semibold text-[#0B1F33] transition-all hover:border-[#C8A96A] hover:bg-[#F8F9FA] disabled:opacity-50"
            >
              <span>Continue with Apple</span>
            </button>
            <button
              type="button"
              onClick={submitMagicLink}
              disabled={isLoading}
              className="flex min-h-[46px] w-full items-center justify-center gap-3 rounded-xl border border-black/10 bg-white px-4 text-[14px] font-semibold text-[#0B1F33] transition-all hover:border-[#C8A96A] hover:bg-[#F8F9FA] disabled:opacity-50"
            >
              <span>Email me a magic link</span>
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={submitPasswordReset}
              className="text-[13px] font-semibold text-[#C8A96A] hover:underline"
            >
              Forgot password?
            </button>
            <p className="text-[12px] text-[#0B1F33]/50">Opens directly to your resident map.</p>
          </div>

        </section>
      </div>
    </main>
  );
}
