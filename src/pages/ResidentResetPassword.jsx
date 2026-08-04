import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, KeyRound, MapPin } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";

function recoveryError(location) {
  const query = new URLSearchParams(location.search);
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  return query.get("error_description") || query.get("error") || hash.get("error_description") || hash.get("error") || "";
}

export default function ResidentResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [state, setState] = useState({ status: "checking", message: "Checking your secure reset link." });

  useEffect(() => {
    if (!supabaseClient) {
      setRecoveryReady(false);
      setState({ status: "error", message: "Password reset is not configured for this environment." });
      return undefined;
    }

    let mounted = true;
    const failure = recoveryError(location);
    if (failure) {
      setRecoveryReady(false);
      setState({ status: "error", message: "This password reset link is invalid or has expired. Request a new link and try again." });
      return undefined;
    }

    const establishRecovery = async () => {
      const code = new URLSearchParams(location.search).get("code");
      let currentSession = (await supabaseClient.auth.getSession()).data.session;
      if (code && !currentSession) {
        const { error } = await supabaseClient.auth.exchangeCodeForSession(code);
        if (error) {
          if (mounted) setRecoveryReady(false);
          if (mounted) setState({ status: "error", message: "This password reset link is invalid or has expired. Request a new link and try again." });
          return;
        }
        window.history.replaceState({}, document.title, "/residents/reset-password");
        currentSession = (await supabaseClient.auth.getSession()).data.session;
      }
      if (!mounted) return;
      if (!currentSession) {
        setRecoveryReady(false);
        setState({ status: "error", message: "Open the latest password reset email, or request a new link." });
        return;
      }
      setRecoveryReady(true);
      setState({ status: "ready", message: "Choose a new password for your resident account." });
    };

    void establishRecovery();
    const { data: listener } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (!mounted || !session) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setRecoveryReady(true);
        setState({ status: "ready", message: "Choose a new password for your resident account." });
      }
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [location.hash, location.search]);

  const submit = async (event) => {
    event.preventDefault();
    if (password.length < 8) {
      setState({ status: "error", message: "Use at least 8 characters for your new password." });
      return;
    }
    if (password !== confirmation) {
      setState({ status: "error", message: "The two password entries do not match." });
      return;
    }
    if (!supabaseClient) return;
    setState({ status: "saving", message: "Updating your password." });
    const { error } = await supabaseClient.auth.updateUser({ password });
    if (error) {
      setState({ status: "error", message: error.message || "We could not update your password. Request a new reset link and try again." });
      return;
    }
    await supabaseClient.auth.signOut();
    setState({ status: "complete", message: "Password updated. Sign in with your new password." });
    window.setTimeout(() => navigate("/residents/login?reset=complete", { replace: true }), 700);
  };

  const canSubmit = recoveryReady && state.status !== "saving" && state.status !== "complete";

  return (
    <main className="min-h-screen bg-white px-5 py-12 text-[#0B1F33]">
      <div className="mx-auto max-w-md space-y-8">

        {/* Header Navigation */}
        <header className="flex items-center justify-between border-b border-black/5 pb-4">
          <Link to="/" aria-label="Downtown Perks home" className="flex items-center gap-2 text-[14.5px] font-semibold text-[#0B1F33] hover:text-[#C8A96A] transition-colors">
            <MapPin size={16} className="text-[#C8A96A]" aria-hidden="true" />
            <span>Downtown Perks</span>
          </Link>
          <Link to="/residents/login" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0B1F33]/60 hover:text-[#0B1F33] transition-colors">
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Sign in</span>
          </Link>
        </header>

        {/* Content */}
        <section className="space-y-6" aria-labelledby="resident-reset-title">

          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#C8A96A]">Resident Access</p>
            <h1 id="resident-reset-title" className="text-3xl font-semibold tracking-tight text-[#0B1F33]">Set a new password.</h1>
            <p className="text-[14px] leading-relaxed text-[#0B1F33]/70">Use the secure link from your email to update your Downtown Perks password.</p>
          </div>

          {state.status === "complete" ? (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-[14px] text-emerald-700" role="status">
              <Check size={16} aria-hidden="true" />
              <span>{state.message}</span>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={submit}>
              <div className="space-y-1">
                <label htmlFor="resident-new-password" className="block text-[13px] font-semibold text-[#0B1F33]">New password</label>
                <input
                  id="resident-new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={!canSubmit}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-[#F2F2F7] px-4 py-3 rounded-xl text-[15px] text-[#0B1F33] outline-none transition-all focus:ring-2 focus:ring-[#C8A96A] placeholder:text-[#0B1F33]/30 disabled:opacity-50"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="resident-confirm-password" className="block text-[13px] font-semibold text-[#0B1F33]">Confirm new password</label>
                <input
                  id="resident-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={!canSubmit}
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="Enter it again"
                  className="w-full bg-[#F2F2F7] px-4 py-3 rounded-xl text-[15px] text-[#0B1F33] outline-none transition-all focus:ring-2 focus:ring-[#C8A96A] placeholder:text-[#0B1F33]/30 disabled:opacity-50"
                />
              </div>

              <p
                className={`text-[13px] rounded-xl px-4 py-2.5 ${state.status === "error" ? "bg-red-50 text-red-700" : "bg-[#F2F2F7] text-[#0B1F33]/60"}`}
                role={state.status === "error" ? "alert" : "status"}
              >
                {state.message}
              </p>

              <button
                type="submit"
                disabled={!canSubmit}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#0B1F33] px-5 text-[14px] font-semibold text-white shadow-sm transition-transform active:scale-95 hover:bg-[#0B1F33]/90 disabled:opacity-50 disabled:cursor-wait"
              >
                <KeyRound size={16} className="text-[#C8A96A]" aria-hidden="true" />
                <span>{state.status === "saving" ? "Updating…" : "Update password"}</span>
              </button>
            </form>
          )}

          {state.status === "error" ? (
            <Link
              className="block text-center text-[13px] font-semibold text-[#C8A96A] hover:underline"
              to="/residents/login"
            >
              Request a new reset link
            </Link>
          ) : null}

        </section>
      </div>
    </main>
  );
}
