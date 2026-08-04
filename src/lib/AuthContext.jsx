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
const PLATFORM_ROLES = new Set(["resident", "partner", "admin", "platform_admin", "super_admin"]);

function buildSupabaseProfile(currentUser, accessContext = null) {
  if (!currentUser) return null;
  const userMetadata = currentUser.user_metadata || {};
  const declaredRole = String(accessContext?.platform_role || "").toLowerCase();
  const role = PLATFORM_ROLES.has(declaredRole) ? declaredRole : "resident";
  const isPlatformAdmin = role === "platform_admin" || role === "super_admin";

  return {
    id: currentUser.id,
    email: currentUser.email || "",
    full_name: userMetadata.full_name || (role === "super_admin" ? "Meg Dude" : currentUser.email) || "Downtown Perks Account",
    organization_name: userMetadata.organization_name || (isPlatformAdmin ? "Downtown Perks" : "Downtown Perks Account"),
    partner_type: isPlatformAdmin
      ? "platform"
      : userMetadata.partner_type || userMetadata.account_type || "resident",
    role,
    platform_role: role,
    is_super_admin: role === "super_admin",
    has_global_scope: isPlatformAdmin,
    partner_id: accessContext?.partner_id || null,
    is_impersonating: accessContext?.is_impersonating === true,
    impersonation_expires_at: accessContext?.impersonation_expires_at || null,
    authProvider: "supabase",
  };
}

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
  const [isLoadingAuth, setIsLoadingAuth] = useState(Boolean(
    appParams.token || (isProductionLike() && canUseProductionAccountAccess() && supabaseClient)
  ));
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
      const authState = supabaseClient.auth.onAuthStateChange((event, session) => {
        if (!session?.user) {
          applySupabaseUser(null);
          return;
        }
        // Re-read the Auth user and live access context after sign-in, refresh,
        // or account updates so authorization never comes from stale browser state.
        if (["SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) {
          window.setTimeout(() => hydrateSupabaseSession(), 0);
          return;
        }
        applySupabaseUser(session.user);
      });
      subscription = authState.data?.subscription;
      return () => subscription?.unsubscribe?.();
    }
    if (appParams.token) {
      checkUserAuth();
    }
  }, []);

  const applySupabaseUser = (currentUser, accessContext = null) => {
    if (!currentUser) {
      setIsLoadingAuth(false);
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    const profile = buildSupabaseProfile(currentUser, accessContext);
    setUser(profile);
    setIsAuthenticated(true);
    setIsLoadingAuth(false);
    setAuthError(null);
  };

  const loadAccessContext = async () => {
    const { data, error } = await supabaseClient.rpc("current_access_context");
    if (error) throw error;
    const context = Array.isArray(data) ? (data[0] || null) : data;
    if (!context?.platform_role) throw new Error("This account does not have an active access profile.");
    return context;
  };

  const applySupabaseSession = (session) => {
    applySupabaseUser(session?.user || null);
  };

  const hydrateSupabaseSession = async () => {
    try {
      setIsLoadingAuth(true);
      const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData?.session) {
        applySupabaseUser(null);
        return;
      }

      // getUser performs a server round trip and returns the latest trusted
      // app_metadata. getSession alone reads browser storage and must not be
      // authoritative for platform authorization.
      const { data: userData, error: userError } = await supabaseClient.auth.getUser();
      if (userError) throw userError;
      const accessContext = await loadAccessContext();
      applySupabaseUser(userData?.user || null, accessContext);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthError(error.message || "Supabase session could not be verified.");
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

  const logout = async (shouldRedirect = true, redirectPath = "") => {
    const isResidentAccount = String(user?.role || user?.partner_type || "").toLowerCase() === "resident";
    const nextPath = redirectPath || (isResidentAccount ? "/residents/login" : "/partners/sign-in");
    setUser(null);
    setIsAuthenticated(false);
    setPartnerSession(null);
    writePartnerSession(null);

    if (isProductionLike() && supabaseClient) {
      await supabaseClient.auth.signOut().catch(() => {});
      if (shouldRedirect) window.location.href = nextPath;
      return;
    }
    
    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      base44.auth.logout(`${window.location.origin}${nextPath}`);
    } else {
      // Just remove the token without redirect
      base44.auth.logout();
    }
  };

  const navigateToLogin = () => {
    return null;
  };

  const refreshAccessContext = async () => {
    if (!supabaseClient || !isAuthenticated) return null;
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError) throw userError;
    const accessContext = await loadAccessContext();
    applySupabaseUser(userData?.user || null, accessContext);
    return accessContext;
  };

  const startPartnerImpersonation = async (partnerId, reason = "Workspace support") => {
    const { error } = await supabaseClient.rpc("start_partner_impersonation", { target_partner_id: partnerId, session_reason: reason });
    if (error) throw error;
    return refreshAccessContext();
  };

  const stopPartnerImpersonation = async () => {
    const { error } = await supabaseClient.rpc("stop_partner_impersonation");
    if (error) throw error;
    return refreshAccessContext();
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

    const partnerType = profile.partner_type || profile.account_type || "partner";
    const accessRole = partnerType === "resident" ? "resident" : "partner";
    const redirectPath = profile.redirectPath || (partnerType === "resident" ? "/auth/callback" : "/auth/callback?audience=partner&returnTo=%2Fpartner-workspace%2Foverview");
    const organizationName = profile.organization_name || profile.company || "Downtown Perks Account";
    const email = profile.email || profile.signup_email || "";

    if (isProductionLike()) {
      if (!supabaseClient) {
        setAuthError(PRODUCTION_ACCOUNT_ACCESS_MESSAGE);
        return { type: "error", message: PRODUCTION_ACCOUNT_ACCESS_MESSAGE };
      }
      if (!email || !profile.password) {
        const message = "Enter your workspace email and password.";
        setAuthError(message);
        return { type: "error", message };
      }
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: profile.password });
      if (error) {
        const message = error.message || "We could not sign you in with that email and password.";
        setAuthError(message);
        return { type: "error", message };
      }
      const { data: verifiedUserData, error: userError } = await supabaseClient.auth.getUser();
      if (userError) return { type: "error", message: userError.message };
      const accessContext = await loadAccessContext();
      const verifiedUser = verifiedUserData?.user || data?.user;
      const verifiedProfile = buildSupabaseProfile(verifiedUser, accessContext);
      if (!["partner", "platform_admin", "super_admin"].includes(verifiedProfile?.role)) {
        await supabaseClient.auth.signOut();
        const message = "This account does not have partner workspace access.";
        setAuthError(message);
        return { type: "error", message };
      }
      applySupabaseUser(verifiedUser, accessContext);
      return { type: "authenticated", user: verifiedProfile, redirectPath };
    }

    const nextSession = {
      type: "partner",
      user: {
        id: email || organizationName,
        email,
        full_name: profile.full_name || profile.contact_name || organizationName,
        organization_name: organizationName,
        partner_type: partnerType,
        role: accessRole,
      },
      createdAt: new Date().toISOString(),
    };
    writePartnerSession(nextSession);
    setPartnerSession(nextSession);
    setUser(nextSession.user);
    setIsAuthenticated(true);
    return nextSession;
  };

  const signInResidentWithPassword = async ({ email = "", password = "" } = {}) => {
    if (!canUseProductionAccountAccess()) {
      return { type: "error", message: PRODUCTION_ACCOUNT_ACCESS_MESSAGE };
    }

    if (!email || !password) {
      return { type: "error", message: "Enter your email address and password." };
    }

    if (isProductionLike()) {
      if (!supabaseClient) return { type: "error", message: PRODUCTION_ACCOUNT_ACCESS_MESSAGE };
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        const confirmationRequired = error.code === "email_not_confirmed" || /email.*not.*confirm/i.test(error.message || "");
        const message = confirmationRequired
          ? "Your email is not confirmed yet. Open the confirmation email we sent, or request a new one below."
          : (error.message || "We could not sign you in with that email and password.");
        setAuthError(message);
        return { type: "error", code: error.code || "sign_in_failed", confirmationRequired, message };
      }
      const { data: verifiedUserData, error: userError } = await supabaseClient.auth.getUser();
      if (userError) return { type: "error", message: userError.message };
      try {
        const accessContext = await loadAccessContext();
        const verifiedUser = verifiedUserData?.user || data?.user || null;
        const verifiedProfile = buildSupabaseProfile(verifiedUser, accessContext);
        applySupabaseUser(verifiedUser, accessContext);
        return { type: "authenticated", session: data?.session, user: verifiedProfile };
      } catch (accessError) {
        await supabaseClient.auth.signOut();
        const message = accessError.message || "This account does not have an active access profile.";
        setAuthError(message);
        return { type: "error", message };
      }
    }

    return signInPartner({ email, partner_type: "resident", organization_name: "Downtown Perks Resident" });
  };

  const registerResidentWithPassword = async ({ email = "", password = "", fullName = "", redirectPath = "/auth/callback" } = {}) => {
    if (!canUseProductionAccountAccess()) {
      return { type: "error", message: PRODUCTION_ACCOUNT_ACCESS_MESSAGE };
    }

    if (!email || !password || !fullName) {
      return { type: "error", message: "Enter your name, email address, and password to create an account." };
    }

    if (isProductionLike()) {
      if (!supabaseClient) return { type: "error", message: PRODUCTION_ACCOUNT_ACCESS_MESSAGE };
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${redirectPath}`,
          shouldCreateUser: false,
          data: {
            full_name: fullName,
            organization_name: "Downtown Perks Resident",
            partner_type: "resident",
            account_type: "resident",
          },
        },
      });
      if (error) {
        const message = error.message || "We could not create your resident account.";
        setAuthError(message);
        return { type: "error", code: error.code || "registration_failed", message };
      }
      if (data?.session) {
        applySupabaseSession(data.session);
        return { type: "authenticated", session: data.session, user: data.user };
      }
      return {
        type: "confirmation_required",
        email,
        message: "Account created. Check your email and confirm your address before signing in.",
      };
    }

    return signInPartner({ email, full_name: fullName, partner_type: "resident", organization_name: "Downtown Perks Resident" });
  };

  const resendResidentConfirmation = async ({ email = "", redirectPath = "/auth/callback" } = {}) => {
    if (!email) return { type: "error", message: "Enter the email address for your resident account." };
    if (!canUseProductionAccountAccess() || !isProductionLike() || !supabaseClient) {
      return { type: "error", message: PRODUCTION_ACCOUNT_ACCESS_MESSAGE };
    }
    const { error } = await supabaseClient.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}${redirectPath}` },
    });
    if (error) return { type: "error", code: error.code || "resend_failed", message: error.message || "We could not resend the confirmation email." };
    return { type: "confirmation_sent", email, message: "Confirmation email sent. Check your inbox and spam folder." };
  };

  const signInWithGoogle = async (profile = {}) => {
    if (!canUseProductionAccountAccess() || !isProductionLike() || !supabaseClient) {
      const message = "Google sign-in is available when production account access is configured.";
      setAuthError(message);
      return { type: "error", message };
    }

    const redirectPath = profile.redirectPath || "/auth/callback";
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${redirectPath}`,
        skipBrowserRedirect: true,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) {
      const message = error.message || "Google sign-in could not be started.";
      setAuthError(message);
      return { type: "error", message };
    }
    if (data?.url) {
      try {
        window.top?.location.assign(data.url);
      } catch {
        window.location.assign(data.url);
      }
    }
    return { type: "supabase_oauth", url: data?.url || "" };
  };

  const signInWithApple = async (profile = {}) => {
    if (!canUseProductionAccountAccess() || !isProductionLike() || !supabaseClient) {
      return { type: "error", message: "Apple sign-in is available when production account access is configured." };
    }
    const redirectPath = profile.redirectPath || "/auth/callback";
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}${redirectPath}`, skipBrowserRedirect: true },
    });
    if (error) return { type: "error", message: error.message || "Apple sign-in could not be started." };
    if (data?.url) window.location.assign(data.url);
    return { type: "supabase_oauth", url: data?.url || "" };
  };

  const signInResidentWithMagicLink = async ({ email = "", redirectPath = "/auth/callback" } = {}) => {
    if (!email) return { type: "error", message: "Enter your email address first." };
    if (!canUseProductionAccountAccess() || !isProductionLike() || !supabaseClient) return { type: "error", message: PRODUCTION_ACCOUNT_ACCESS_MESSAGE };
    const { error } = await supabaseClient.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}${redirectPath}`, shouldCreateUser: false } });
    if (error) return { type: "error", message: error.message || "A secure sign-in link could not be sent." };
    return { type: "link_sent", message: "Check your email for a secure sign-in link." };
  };

  const sendResidentPasswordReset = async ({ email = "", redirectPath = "/residents/reset-password" } = {}) => {
    if (!email) return { type: "error", message: "Enter your email address first." };
    if (!canUseProductionAccountAccess() || !isProductionLike() || !supabaseClient) return { type: "error", message: PRODUCTION_ACCOUNT_ACCESS_MESSAGE };
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}${redirectPath}` });
    if (error) return { type: "error", message: error.message || "Password reset could not be sent." };
    return { type: "confirmation_sent", message: "Check your email for the password reset link." };
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
      refreshAccessContext,
      startPartnerImpersonation,
      stopPartnerImpersonation,
      signInPartner,
      signInResidentWithPassword,
      registerResidentWithPassword,
      resendResidentConfirmation,
      signInWithGoogle,
      signInWithApple,
      signInResidentWithMagicLink,
      sendResidentPasswordReset,
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
