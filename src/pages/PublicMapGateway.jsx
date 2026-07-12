import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { buildResidentMapPath } from "@/lib/authReturnPath";

export default function PublicMapGateway() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const guestPath = useMemo(() => buildResidentMapPath(location.search, "/app"), [location.search]);
  const authenticatedPath = useMemo(() => buildResidentMapPath(location.search, "/app/map"), [location.search]);

  useEffect(() => {
    document.title = "Downtown Perks Map";
  }, []);

  const signIn = () => navigate(`/sign-in?returnTo=${encodeURIComponent(authenticatedPath)}`);
  const openAuthenticatedMap = () => {
    const role = String(user?.role || "resident").toLowerCase();
    navigate(role === "partner" ? "/partner-workspace/overview" : authenticatedPath, { replace: true });
  };

  return (
    <main className="dp-public-map-gateway">
      <div className="dp-public-map-gateway-shell">
        <header>
          <a href="/" aria-label="Downtown Perks home"><span aria-hidden="true" />Downtown Perks</a>
          <button type="button" onClick={isAuthenticated ? openAuthenticatedMap : signIn}>{isAuthenticated ? "Open map" : "Sign in"}</button>
        </header>
        <section aria-labelledby="public-map-title">
          <p className="dp-public-map-gateway-eyebrow">Downtown Austin</p>
          <h1 id="public-map-title">Your downtown map.</h1>
          <p>Find nearby perks, events, hotels, buildings, restaurants, walking routes, and places worth knowing.</p>
          <div className="dp-public-map-gateway-actions">
            <button type="button" className="is-primary" onClick={() => navigate(guestPath, { replace: true })}>Explore as guest</button>
            {isAuthenticated ? (
              <button type="button" onClick={openAuthenticatedMap}>Open my resident map</button>
            ) : (
              <button type="button" onClick={signIn}>Sign in to use your card</button>
            )}
          </div>
          <small>Signing in unlocks saved places, resident perks, event RSVPs, building benefits, and your Downtown Perks card.</small>
        </section>
      </div>
    </main>
  );
}
