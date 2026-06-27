import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';

const AuthContext = createContext();
const PARTNER_SESSION_KEY = "dp_partner_workspace:session";

function readPartnerSession() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(PARTNER_SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function writePartnerSession(session) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(PARTNER_SESSION_KEY);
    return;
  }
  window.localStorage.setItem(PARTNER_SESSION_KEY, JSON.stringify(session));
}

export const AuthProvider = ({ children }) => {
  const [partnerSession, setPartnerSession] = useState(() => readPartnerSession());
  const [user, setUser] = useState(() => partnerSession?.user || null);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(partnerSession));
  const [isLoadingAuth, setIsLoadingAuth] = useState(Boolean(appParams.token));
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    // Downtown Perks is public-first. Viewing the site must never depend on
    // Base44 auth or app settings. If a token already exists, hydrate the user
    // quietly for partner/workspace conveniences; otherwise render as a guest.
    if (appParams.token) {
      checkUserAuth();
    }
  }, []);

  const checkAppState = async () => {
    setIsLoadingPublicSettings(false);
    setAuthError(null);
    if (appParams.token) await checkUserAuth();
  };

  const checkUserAuth = async () => {
    try {
      // Now check if the user is authenticated
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    } catch (error) {
      setIsLoadingAuth(false);
      const localPartnerSession = readPartnerSession();
      setPartnerSession(localPartnerSession);
      setUser(localPartnerSession?.user || null);
      setIsAuthenticated(Boolean(localPartnerSession));
      
      // If user auth fails, it might be an expired token
      if (error.status === 401 || error.status === 403) {
        setAuthError(null);
      }
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    setPartnerSession(null);
    writePartnerSession(null);
    
    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      base44.auth.logout(window.location.href);
    } else {
      // Just remove the token without redirect
      base44.auth.logout();
    }
  };

  const navigateToLogin = () => {
    return null;
  };

  const signInPartner = (profile = {}) => {
    const organizationName = profile.organization_name || profile.company || "Downtown Perks Partner";
    const nextSession = {
      type: "partner",
      user: {
        id: profile.email || profile.signup_email || organizationName,
        email: profile.email || profile.signup_email || "",
        full_name: profile.full_name || profile.contact_name || organizationName,
        organization_name: organizationName,
        partner_type: profile.partner_type || "partner",
        role: "partner",
      },
      createdAt: new Date().toISOString(),
    };
    writePartnerSession(nextSession);
    setPartnerSession(nextSession);
    setUser(nextSession.user);
    setIsAuthenticated(true);
    return nextSession;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      partnerSession,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      signInPartner,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
