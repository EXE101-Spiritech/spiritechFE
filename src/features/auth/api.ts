import axiosClient, { CHAT_BASE } from "@/shared/api/axiosClient";
import type {
  LoginReq,
  RegisterReq,
  TokenPair,
  SessionItem,
} from "@/shared/types";

export const authApi = {
  /** Register new user — returns token pair with user info */
  register: (data: RegisterReq) =>
    axiosClient.post<TokenPair>("/v1/auth/register", data).then((r) => r.data),

  /** Login — returns token pair with user info */
  login: (data: LoginReq) =>
    axiosClient.post<TokenPair>("/v1/auth/login", data).then((r) => r.data),

  /** Refresh token — both tokens rotate (one-time use) */
  refresh: (refreshToken: string) =>
    axiosClient
      .post<TokenPair>("/v1/auth/refresh", { refresh_token: refreshToken })
      .then((r) => r.data),

  /** Logout — revoke session */
  logout: (refreshToken: string) =>
    axiosClient.post<void>("/v1/logout", {
      refresh_token: refreshToken,
    }),

  /** List active sessions */
  listSessions: () =>
    axiosClient.get<SessionItem[]>("/v1/sessions").then((r) => r.data),
};

/** Create a chat session */
export const chatSessionApi = {
  create: () =>
    axiosClient
      .post<{ session_id: string }>(`${CHAT_BASE}/v1/chat/sessions`, {})
      .then((r) => r.data),

  get: (id: string) =>
    axiosClient
      .get<
        import("@/shared/types").ChatSession
      >(`${CHAT_BASE}/v1/chat/sessions/${id}`)
      .then((r) => r.data),
};
