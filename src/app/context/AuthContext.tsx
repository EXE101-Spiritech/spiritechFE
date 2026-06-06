import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { authApi } from "@/features/auth/api";
import {
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isAuthenticated,
  setUserRole,
} from "@/shared/api/axiosClient";
import type { UserInfo } from "@/shared/types";

interface UserProfile {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface AuthContextType {
  user: UserInfo | null;
  profile: UserProfile | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
}
const PROFILE_KEY = "spiritech_user_profile";
const USER_KEY = "spiritech_user";

function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function loadUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(user: UserInfo): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(loadUser);
  const [profile, setProfile] = useState<UserProfile | null>(loadProfile);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const token = getAccessToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const exp = payload.exp as number;
        if (Date.now() >= exp * 1000) {
          const refreshToken = getRefreshToken();
          if (refreshToken) {
            authApi
              .refresh(refreshToken)
              .then((data) => {
                setTokens(data.access_token, data.refresh_token);
              })
              .catch(() => {
                clearTokens();
                clearUser();
                setUser(null);
              })
              .finally(() => setLoading(false));
          } else {
            clearTokens();
            clearUser();
            setUser(null);
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    } else {
      // No access token — try using the refresh token if it exists
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        authApi
          .refresh(refreshToken)
          .then((data) => {
            setTokens(data.access_token, data.refresh_token);
          })
          .catch(() => {
            clearTokens();
            clearUser();
            setUser(null);
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const data = await authApi.login({ phone, password });
    setTokens(data.access_token, data.refresh_token);
    if (data.user) {
      setUser(data.user);
      saveUser(data.user);
      setUserRole(data.user.role);
    }
  }, []);

  const register = useCallback(
    async (name: string, phone: string, password: string) => {
      const data = await authApi.register({ name, phone, password });
      setTokens(data.access_token, data.refresh_token);

      const newProfile: UserProfile = {
        name,
        phone,
        email: "",
        address: "",
      };
      setProfile(newProfile);
      saveProfile(newProfile);

      if (data.user) {
        setUser(data.user);
        saveUser(data.user);
        setUserRole(data.user.role);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Silently ignore
    } finally {
      clearTokens();
      setUser(null);
      clearUser();
      setProfile(null);
      localStorage.removeItem(PROFILE_KEY);
    }
  }, []);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setProfile((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      saveProfile(updated);
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoggedIn: !!user && isAuthenticated(),
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
