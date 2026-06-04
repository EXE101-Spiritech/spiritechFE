import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getCookie, setCookie, removeCookie } from "./cookies";

// ── Constants ──────────────────────────────────────────────────────────────
export const API_BASE = `https://${__API_DOMAIN__}`;
export const CHAT_BASE = `https://${__API_DOMAIN__}/chat`;

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const ROLE_KEY = "user_role";

// Access token TTL from server is 900s (15 min), set cookie to match
const ACCESS_MAX_AGE = 900;
// Refresh token can live longer (e.g., 7 days)
const REFRESH_MAX_AGE = 7 * 24 * 3600;

// ── Helpers ────────────────────────────────────────────────────────────────
export function getAccessToken(): string | null {
  return getCookie(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_KEY);
}

export function getUserRole(): string | null {
  return getCookie(ROLE_KEY);
}

export function setTokens(access: string, refresh: string): void {
  setCookie(ACCESS_KEY, access, ACCESS_MAX_AGE);
  setCookie(REFRESH_KEY, refresh, REFRESH_MAX_AGE);
}

export function setUserRole(role: string): void {
  setCookie(ROLE_KEY, role, REFRESH_MAX_AGE);
}

export function clearTokens(): void {
  removeCookie(ACCESS_KEY);
  removeCookie(REFRESH_KEY);
  removeCookie(ROLE_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// ── Axios instance ─────────────────────────────────────────────────────────
const axiosClient = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: inject JWT ────────────────────────────────────────
axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 with refresh ──────────────────────────
interface RefreshQueueItem {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}

let isRefreshing = false;
let refreshQueue: RefreshQueueItem[] = [];

function processQueue(token: string, err: unknown = null): void {
  refreshQueue.forEach((item) => {
    if (err) {
      item.reject(err);
    } else {
      item.resolve(token);
    }
  });
  refreshQueue = [];
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Not a 401 or already retried — reject immediately
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || "";

    // Login/register return 401 on wrong credentials — just reject, don't redirect
    if (url.includes("/v1/auth/login") || url.includes("/v1/auth/register")) {
      return Promise.reject(error);
    }

    // Refresh endpoint failing means session is truly dead
    if (url.includes("/v1/auth/refresh")) {
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Queue the request while refreshing
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      window.location.href = "/login";
      isRefreshing = false;
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(`${API_BASE}/v1/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token: newRefresh } = data;
      setTokens(access_token, newRefresh);

      // Retry queued requests
      processQueue(access_token);

      // Retry the original request
      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      processQueue("", refreshError);
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosClient;
