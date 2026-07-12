import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getSafeReturnPath, storeAuthReturnPath } from "@/lib/authReturnPath";

export default function ResidentSignIn() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signInResidentWithPassword, registerResidentWithPassword, resendResidentConfirmation, signInWithGoogle } = useAuth();
  const returnTo = useMemo(() => getSafeReturnPath(location.search), [location.search]);
  const [mode, setMode] = useState(() => new URLSearchParams(location.search).get("mode") === "register" ? "register" : "sign-in");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(() => {
    const error = new URLSearchParams(location.search).get("error");
    return error ? { type: "error", message: error === "callback_failed" ? "We could not complete sign-in. Request a new secure link and try again." : error } : { type: "idle", message: "" };
  });

  async function submit(event) {
    event.preventDefault();
    if (mode === "register" && password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }
    setStatus({ type: "loading", message: "" });
    storeAuthReturnPath(returnTo);
    const redirectPath = `/auth/callback?returnTo=${encodeURIComponent(returnTo)}`;
    const result = mode === "register"
      ? await registerResidentWithPassword({ email, password, fullName, redirectPath })
      : await signInResidentWithPassword({ email, password });
    if (result?.type === "authenticated") {
      navigate(returnTo, { replace: true });
      return;
    }
    setStatus({
      type: result?.confirmationRequired || result?.type === "confirmation_required" ? "confirmation" : result?.type === "error" ? "error" : "success",
      message: result?.message || (result?.type === "error" ? "Account access could not be completed." : "Check your email to continue."),
    });
  }

  async function resendConfirmation() {
    setStatus({ type: "loading", message: "" });
    const result = await resendResidentConfirmation({
      email,
      redirectPath: `/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
    });
    setStatus({ type: result?.type === "error" ? "error" : "confirmation", message: result?.message || "Check your email to continue." });
  }

  async function submitGoogle() {
    setStatus({ type: "loading", message: "" });
    storeAuthReturnPath(returnTo);
    const result = await signInWithGoogle({
      redirectPath: `/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
    });
    if (result?.type === "error") setStatus({ type: "error", message: result.message });
  }

  return (
    <main className="dp-resident-signin-page">
      <div className="dp-resident-signin-shell">
        <header className="dp-resident-signin-header">
          <Link to="/" aria-label="Downtown Perks home"><span aria-hidden="true" />Downtown Perks</Link>
          <Link to={returnTo}><ArrowLeft aria-hidden="true" />Back to map</Link>
        </header>
        <section className="dp-resident-signin-content" aria-labelledby="resident-signin-title">
          <p className="dp-resident-signin-eyebrow">Resident access</p>
          <h1 id="resident-signin-title">{mode === "register" ? "Create your resident account." : "Sign in to your downtown."}</h1>
          <p>{mode === "register" ? "Register with your email and a secure password. Confirm your email before signing in for the first time." : "Use your email and password to access your resident card, saved places, perks, RSVPs, and building benefits."}</p>
          <div className="dp-resident-signin-mode" role="tablist" aria-label="Resident account access">
            <button type="button" role="tab" aria-selected={mode === "sign-in"} className={mode === "sign-in" ? "is-active" : ""} onClick={() => { setMode("sign-in"); setStatus({ type: "idle", message: "" }); }}>Sign in</button>
            <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "is-active" : ""} onClick={() => { setMode("register"); setStatus({ type: "idle", message: "" }); }}>Create account</button>
          </div>
          <form onSubmit={submit}>
            {mode === "register" ? (
              <>
                <label htmlFor="resident-name">Full name</label>
                <input id="resident-name" name="name" type="text" autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" />
              </>
            ) : null}
            <label htmlFor="resident-email">Email address</label>
            <input id="resident-email" name="email" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            <label htmlFor="resident-password">Password</label>
            <input id="resident-password" name="password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" />
            {mode === "register" ? (
              <>
                <label htmlFor="resident-confirm-password">Confirm password</label>
                <input id="resident-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter your password" />
              </>
            ) : null}
            {status.message ? <p className={`dp-resident-signin-status is-${status.type}`} role={status.type === "error" ? "alert" : "status"}>{status.message}</p> : null}
            {status.type === "confirmation" ? <button type="button" className="dp-resident-resend-confirmation" onClick={resendConfirmation}>Resend confirmation email</button> : null}
            <button type="submit" disabled={status.type === "loading"}>{mode === "register" ? <UserPlus aria-hidden="true" /> : <LogIn aria-hidden="true" />}{status.type === "loading" ? "Please wait…" : mode === "register" ? "Create resident account" : "Sign in"}</button>
          </form>
          <div className="dp-resident-signin-divider" aria-hidden="true"><span />Or<span /></div>
          <button type="button" className="dp-resident-signin-google" onClick={submitGoogle} disabled={status.type === "loading"}>Continue with Google</button>
          <p className="dp-resident-signin-note">After signing in, you return to the same map, filter, offer, property, or route you opened.</p>
        </section>
      </div>
    </main>
  );
}
