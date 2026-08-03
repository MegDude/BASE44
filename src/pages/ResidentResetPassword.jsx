import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, KeyRound } from "lucide-react";
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

  // A validation/API error should remain editable when the recovery session is
  // still valid. Only a missing/expired recovery session locks the form.
  const canSubmit = recoveryReady && state.status !== "saving" && state.status !== "complete";
  return (
    <main className="dp-resident-signin-page dp-resident-password-reset">
      <div className="dp-resident-signin-shell">
        <header className="dp-resident-signin-header">
          <Link to="/" aria-label="Downtown Perks home"><span aria-hidden="true" />Downtown Perks</Link>
          <Link to="/residents/login"><ArrowLeft aria-hidden="true" />Sign in</Link>
        </header>
        <section className="dp-resident-signin-content" aria-labelledby="resident-reset-title">
          <p className="dp-resident-signin-eyebrow">Resident access</p>
          <h1 id="resident-reset-title">Set a new password.</h1>
          <p>Use the secure link from your email to update your Downtown Perks password.</p>
          {state.status === "complete" ? <p className="dp-resident-signin-status is-success" role="status"><Check aria-hidden="true" />{state.message}</p> : (
            <form onSubmit={submit}>
              <label htmlFor="resident-new-password">New password</label>
              <input id="resident-new-password" type="password" autoComplete="new-password" minLength={8} required disabled={!canSubmit} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" />
              <label htmlFor="resident-confirm-password">Confirm new password</label>
              <input id="resident-confirm-password" type="password" autoComplete="new-password" minLength={8} required disabled={!canSubmit} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Enter it again" />
              <p className={`dp-resident-signin-status is-${state.status === "error" ? "error" : "info"}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>
              <button type="submit" disabled={!canSubmit}><KeyRound aria-hidden="true" />{state.status === "saving" ? "Updating…" : "Update password"}</button>
            </form>
          )}
          {state.status === "error" ? <Link className="dp-resident-resend-confirmation" to="/residents/login">Request a new reset link</Link> : null}
        </section>
      </div>
    </main>
  );
}
