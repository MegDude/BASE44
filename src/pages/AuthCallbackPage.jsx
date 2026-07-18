import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { consumeAuthReturnPath, getSafeReturnPath } from "@/lib/authReturnPath";

export default function AuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth, user } = useAuth();

  useEffect(() => {
    if (isLoadingAuth) return;
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ""));
    const callbackError = hashParams.get("error_description") || hashParams.get("error");
    const returnTo = getSafeReturnPath(location.search);
    if (callbackError) {
      navigate(`/sign-in?returnTo=${encodeURIComponent(returnTo)}&error=${encodeURIComponent(callbackError)}`, { replace: true });
      return;
    }
    if (!isAuthenticated) {
      navigate(`/sign-in?returnTo=${encodeURIComponent(returnTo)}&error=callback_failed`, { replace: true });
      return;
    }
    const role = String(user?.role || user?.partner_type || "resident").toLowerCase();
    if (["admin", "platform_admin", "super_admin"].includes(role)) {
      return navigate("/admin-studio/command-center", { replace: true });
    }
    if (role !== "resident") return navigate("/partner-workspace/overview", { replace: true });
    navigate(consumeAuthReturnPath(returnTo), { replace: true });
  }, [isAuthenticated, isLoadingAuth, location.hash, location.search, navigate, user]);

  return <main className="dp-auth-callback" aria-busy="true" aria-label="Signing in to Downtown Perks"><div><span aria-hidden="true" /><strong>Signing you in…</strong><p>You will return to your map in a moment.</p></div></main>;
}
