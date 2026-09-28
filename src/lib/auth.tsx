"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  api,
  ApiError,
  decodeJwt,
  isExpired,
  registerUnauthorizedHandler,
  tokenStore,
} from "./api";
import type { JwtClaims, Role, TokenPair, UserRead } from "./types";

const PROFILE_KEY = "rcp.superadmin.profile";

export interface SuperAdminProfile {
  id?: string;
  email: string;
  full_name?: string;
  phone?: string | null;
  user_type?: string;
  roles?: Role[];
}

export interface AuthState {
  claims: JwtClaims | null;
  profile: SuperAdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function loadProfile(): SuperAdminProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as SuperAdminProfile) : null;
  } catch {
    return null;
  }
}

function saveProfile(profile: SuperAdminProfile | null) {
  if (typeof window === "undefined") return;
  if (!profile) {
    window.localStorage.removeItem(PROFILE_KEY);
    return;
  }
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [claims, setClaims] = useState<JwtClaims | null>(null);
  const [profile, setProfile] = useState<SuperAdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const forceLogout = useCallback(() => {
    tokenStore.clear();
    saveProfile(null);
    setClaims(null);
    setProfile(null);
    router.replace("/login");
  }, [router]);

  const logout = useCallback(() => {
    forceLogout();
  }, [forceLogout]);

  useEffect(() => {
    registerUnauthorizedHandler(forceLogout);
  }, [forceLogout]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = tokenStore.access;
      const decoded = token ? decodeJwt(token) : null;
      const stored = loadProfile();

      if (decoded && (decoded.user_type === "SUPER_ADMIN" || decoded.roles.includes("super_admin"))) {
        setClaims(decoded);
        setProfile(stored);
        try {
          const user = await api.get<UserRead>("/api/auth/me");
          if (cancelled) return;
          const merged: SuperAdminProfile = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            user_type: user.user_type,
            roles: user.roles,
          };
          setProfile(merged);
          saveProfile(merged);
        } catch {
          // keep cached
        }
      } else if (token) {
        // Clear invalid or non-super-admin token
        tokenStore.clear();
        saveProfile(null);
      }

      if (!cancelled) setIsLoading(false);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      // Platform super admin login does not pass tenant_slug
      const pair = await api.post<TokenPair>(
        "/api/auth/login",
        { email, password },
        { auth: false },
      );

      const decoded = decodeJwt(pair.access_token);
      if (!decoded) {
        throw new ApiError(500, "Malformed authorization token received.");
      }

      // Enforce Super Admin role verification
      const isSuperAdmin =
        decoded.user_type === "SUPER_ADMIN" ||
        decoded.roles?.includes("super_admin");

      if (!isSuperAdmin) {
        throw new ApiError(
          403,
          "Access Denied: This portal is exclusively for Platform Super Administrators.",
        );
      }

      tokenStore.set(pair);
      setClaims(decoded);

      // Fetch user profile
      try {
        const user = await api.get<UserRead>("/api/auth/me");
        const prof: SuperAdminProfile = {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          user_type: user.user_type,
          roles: user.roles,
        };
        saveProfile(prof);
        setProfile(prof);
      } catch {
        const fallbackProf: SuperAdminProfile = {
          email: email,
          user_type: "SUPER_ADMIN",
          roles: ["super_admin"],
        };
        saveProfile(fallbackProf);
        setProfile(fallbackProf);
      }
    },
    [],
  );

  const value = useMemo<AuthState>(
    () => ({
      claims,
      profile,
      isAuthenticated: !!claims,
      isLoading,
      login,
      logout,
    }),
    [claims, profile, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
