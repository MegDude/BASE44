import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { DEFAULT_PARTNER_RETURN_PATH, consumeAuthReturnPath, getSafeReturnPath } from "@/lib/authReturnPath";

export default function AuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth, user } = useAuth();

  useEffect(() => {
    if (isLoadingAuth) return;
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ""));
    const callbackError = hashParams.get("error_description") || hashParams.get("error");
    const audience = new URLSearchParams(location.search).get("audience") === "partner" ? "partner" : "resident";
    const fallback = audience === "partner" ? DEFAULT_PARTNER_RETURN_PATH : undefined;
    const returnTo = getSafeReturnPath(location.search, fallback);
    const signInPath = audience === "partner" ? "/partners/sign-in" : "/sign-in";
    if (callbackError) return navigate(`${signInPath}?returnTo=${encodeURIComponent(returnTo)}&error=${encodeURIComponent(callbackError)}`, { replace: true });
    if (!isAuthenticated) return navigate(`${signInPath}?returnTo=${encodeURIComponent(returnTo)}&error=callback_failed`, { replace: true });
    const role = String(user?.role || user?.partner_type || "resident").toLowerCase();
    if (audience === "partner") { if (role === "resident") return navigate(`/partners/sign-in?returnTo=${encodeURIComponent(returnTo)}&error=partner_access_required`, { replace: true }); return navigate(returnTo, { replace: true }); }
    navigate(consumeAuthReturnPath(returnTo), { replace: true });
  }, [isAuthenticated, isLoadingAuth, location.hash, location.search, navigate, user]);

  return <main className="dp-auth-callback" aria-busy="true" aria-label="Signing in to Downtown Perks"><div><span aria-hidden="true" /><strong>Signing you in…</strong><p>We are loading your membership, building, saved places, and preferences.</p></div></main>;
}
