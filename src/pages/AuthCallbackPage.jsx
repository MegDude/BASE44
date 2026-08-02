import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { DEFAULT_PARTNER_RETURN_PATH, consumeAuthReturnPath, getAuthenticatedAccountRole, getAuthenticatedDestination, getSafeReturnPath } from "@/lib/authReturnPath";
import { PageContainer, SectionHeader } from "@/components/platform/PlatformPrimitives";

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
    const role = getAuthenticatedAccountRole(user);
    if (audience === "partner") {
      if (role === "resident") return navigate(`/partners/sign-in?returnTo=${encodeURIComponent(returnTo)}&error=partner_access_required`, { replace: true });
      return navigate(returnTo, { replace: true });
    }
    const residentReturnPath = consumeAuthReturnPath(returnTo);
    navigate(getAuthenticatedDestination(user, residentReturnPath), { replace: true });
  }, [isAuthenticated, isLoadingAuth, location.hash, location.search, navigate, user]);

  return <PageContainer className="dp-auth-callback min-h-screen pt-28" aria-busy="true" aria-label="Signing in to Downtown Perks"><SectionHeader eyebrow="Downtown Perks" title="Opening Downtown Perks…" supporting="Taking you to the right place for your account." /></PageContainer>;
}
