import { useLocation } from "react-router-dom";

const PUBLIC_PATHS = new Set(["/", "/pricing", "/about", "/contact", "/partner-gateway", "/partners"]);

function isAuthenticatedSurface(pathname) {
  if (PUBLIC_PATHS.has(pathname)) return false;
  return pathname.startsWith("/residents")
    || pathname.startsWith("/resident")
    || pathname.startsWith("/partner-workspace")
    || pathname.startsWith("/admin")
    || pathname.startsWith("/partners/sign-")
    || pathname.startsWith("/partners/apply")
    || pathname.startsWith("/partners/checkout")
    || pathname.startsWith("/partners/register")
    || pathname.startsWith("/map")
    || pathname.startsWith("/app")
    || pathname.startsWith("/auth");
}

export function PlatformShell({ children }) {
  const { pathname } = useLocation();
  const surface = isAuthenticatedSurface(pathname) ? "authenticated" : "public";
  return <div data-platform-surface={surface}>{children}</div>;
}
