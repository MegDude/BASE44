import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn } from "lucide-react";
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
    const result = await signInWithGoogle({
      redirectPath: `/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
    });
    if (result?.type === "error") setStatus({ type: "error", message: result.message });
  }

  async function submitApple() {
    setStatus({ type: "loading", message: "" }); storeAuthReturnPath(returnTo);
    const result = await signInWithApple({ redirectPath: `/auth/callback?returnTo=${encodeURIComponent(returnTo)}` });
    if (result?.type === "error") setStatus({ type: "error", message: result.message });
  }

  async function submitMagicLink() {
    setStatus({ type: "loading", message: "" }); storeAuthReturnPath(returnTo);
    const result = await signInResidentWithMagicLink({ email, redirectPath: `/auth/callback?returnTo=${encodeURIComponent(returnTo)}` });
    setStatus({ type: result?.type === "error" ? "error" : "confirmation", message: result?.message || "Check your email to continue." });
  }

  async function submitPasswordReset() {
    setStatus({ type: "loading", message: "" });
    const result = await sendResidentPasswordReset({ email, redirectPath: "/residents/reset-password" });
    setStatus({ type: result?.type === "error" ? "error" : "confirmation", message: result?.message || "Check your email to continue." });
  }

  return (
    <main className="dp-resident-signin-page">
      <div className="dp-resident-signin-shell">
        <header className="dp-resident-signin-header">
          <Link to="/" aria-label="Downtown Perks home"><span aria-hidden="true" />Downtown Perks</Link>
          <Link to="/map?mode=resident&tab=map&filter=Featured&collection=downtown-perks-featured"><ArrowLeft aria-hidden="true" />Back to map</Link>
        </header>
        <section className="dp-resident-signin-content" aria-labelledby="resident-signin-title">
          <p className="dp-resident-signin-eyebrow text-[11px] uppercase text-[11px] uppercase tracking-[0.15em] text-[11px] uppercase tracking-[0.15em] text-[11px] uppercase tracking-[0.15em] dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">Resident access</p>
          <h1 id="resident-signin-title">Sign in to your downtown.</h1>
          <p>Use your email and password to open your resident map, perks, saved places, events, and card.</p>
          <form onSubmit={submit}>
            <label htmlFor="resident-email">Email address</label>
            <input id="resident-email" name="email" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            <label htmlFor="resident-password">Password</label>
            <input id="resident-password" name="password" type="password" autoComplete="current-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" />
            {status.message ? <p className={`dp-resident-signin-status is-${status.type}`} role={status.type === "error" ? "alert" : "status"}>{status.message}</p> : null}
            <button type="submit" disabled={status.type === "loading"}><LogIn aria-hidden="true" />{status.type === "loading" ? "Please wait…" : "Sign in"}</button>
          </form>
          <div className="dp-resident-signin-divider" aria-hidden="true"><span />Or<span /></div>
          <button type="button" className="dp-resident-signin-google" onClick={submitGoogle} disabled={status.type === "loading"}>Continue with Google</button>
          <button type="button" className="dp-resident-signin-google" onClick={submitApple} disabled={status.type === "loading"}>Continue with Apple</button>
          <button type="button" className="dp-resident-signin-google" onClick={submitMagicLink} disabled={status.type === "loading"}>Email me a magic link</button>
          <button type="button" className="dp-resident-resend-confirmation" onClick={submitPasswordReset}>Forgot password?</button>
          <p className="dp-resident-signin-note">After sign-in, Downtown Perks opens directly to your resident map.</p>
        </section>
      </div>
    </main>
  );
}
