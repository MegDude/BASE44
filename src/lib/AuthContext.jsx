import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { supabaseClient } from "@/lib/supabase/client";
import {
  canUseProductionAccountAccess,
  isProductionLike,
  PRODUCTION_ACCOUNT_ACCESS_MESSAGE,
} from "@/lib/productionGuards";

const AuthContext = createContext();
const PARTNER_SESSION_KEY = "dp_partner_workspace:session";

function readPartnerSession() {
  if (typeof window === "undefined") return null;
  if (!canUseProductionAccountAccess()) return null;
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
  if (!canUseProductionAccountAccess()) return;
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
    if (isProductionLike() && canUseProductionAccountAccess() && supabaseClient) {
      let subscription;
      hydrateSupabaseSession();
      const authState = supabaseClient.auth.onAuthStateChange((_event, session) => {
        applySupabaseSession(session);
      });
      subscription = authState.data?.subscription;
      return () => subscription?.unsubscribe?.();
    }
    if (appParams.token) {
      checkUserAuth();
    }
  }, []);

  const applySupabaseSession = (session) => {
    const currentUser = session?.user;
    if (!currentUser) {
      setIsLoadingAuth(false);
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    const profile = {
      id: currentUser.id,
      email: currentUser.email || "",
      full_name: currentUser.user_metadata?.full_name || currentUser.email || "Downtown Perks Partner",
      organization_name: currentUser.user_metadata?.organization_name || "Downtown Perks Partner",
      partner_type: currentUser.user_metadata?.partner_type || "partner",
      role: "partner",
      authProvider: "supabase",
    };
    setUser(profile);
    setIsAuthenticated(true);
    setIsLoadingAuth(false);
    setAuthError(null);
  };

  const hydrateSupabaseSession = async () => {
    try {
      setIsLoadingAuth(true);
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) throw error;
      applySupabaseSession(data?.session);
    } catch (error) {
      setIsLoadingAuth(false);
      setAuthError(error.message || "Supabase session could not be loaded.");
    }
  };

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

  const logout = async (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    setPartnerSession(null);
    writePartnerSession(null);

    if (isProductionLike() && supabaseClient) {
      await supabaseClient.auth.signOut().catch(() => {});
      if (shouldRedirect) window.location.href = "/partners/sign-in";
      return;
    }
    
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

  const signInPartner = async (profile = {}) => {
    if (!canUseProductionAccountAccess()) {
      setAuthError(PRODUCTION_ACCOUNT_ACCESS_MESSAGE);
      setUser(null);
      setIsAuthenticated(false);
      setPartnerSession(null);
      writePartnerSession(null);
      return { type: "error", message: PRODUCTION_ACCOUNT_ACCESS_MESSAGE };
    }

    const organizationName = profile.organization_name || profile.company || "Downtown Perks Partner";
    const email = profile.email || profile.signup_email || "";

    if (isProductionLike()) {
      if (!supabaseClient) {
        setAuthError(PRODUCTION_ACCOUNT_ACCESS_MESSAGE);
        return { type: "error", message: PRODUCTION_ACCOUNT_ACCESS_MESSAGE };
      }
      if (!email) {
        const message = "Enter the email for your partner account before requesting sign-in access.";
        setAuthError(message);
        return { type: "error", message };
      }
      const { error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/partner-workspace/overview`,
        },
      });
      if (error) {
        const message = error.message || "Supabase sign-in could not be started.";
        setAuthError(message);
        return { type: "error", message };
      }
      const message = "Check your email for the secure partner sign-in link.";
      setAuthError(message);
      return { type: "supabase_otp", email, message };
    }

    const nextSession = {
      type: "partner",
      user: {
        id: email || organizationName,
        email,
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
