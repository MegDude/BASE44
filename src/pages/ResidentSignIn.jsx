import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getSafeReturnPath, storeAuthReturnPath } from "@/lib/authReturnPath";

export default function ResidentSignIn() {
  const location = useLocation();
  const { signInPartner } = useAuth();
  const returnTo = useMemo(() => getSafeReturnPath(location.search), [location.search]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });

  async function submit(event) {
    event.preventDefault();
    setStatus({ type: "loading", message: "" });
    storeAuthReturnPath(returnTo);
    const result = await signInPartner({
      email,
      partner_type: "resident",
      organization_name: "Downtown Perks Resident",
      redirectPath: `/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
    });
    setStatus({
      type: result?.type === "error" ? "error" : "success",
      message: result?.message || (result?.type === "error" ? "Sign-in could not be started." : "Check your email for your secure sign-in link."),
    });
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
          <h1 id="resident-signin-title">Sign in to your downtown.</h1>
          <p>Access your resident card, saved places, active perks, RSVPs, and building benefits.</p>
          <form onSubmit={submit}>
            <label htmlFor="resident-email">Email address</label>
            <input id="resident-email" name="email" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            {status.message ? <p className={`dp-resident-signin-status is-${status.type}`} role={status.type === "error" ? "alert" : "status"}>{status.message}</p> : null}
            <button type="submit" disabled={status.type === "loading"}><Mail aria-hidden="true" />{status.type === "loading" ? "Sending sign-in link…" : "Email me a sign-in link"}</button>
          </form>
          <p className="dp-resident-signin-note">Your secure link returns you to the same map, filter, offer, property, or route you opened.</p>
        </section>
      </div>
    </main>
  );
}
