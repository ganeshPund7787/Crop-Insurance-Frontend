import api from "../lib/axios";
import { ROLE_MAP } from "../config/constants";
import type {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  RefreshTokenResponse,
  ChangePasswordPayload,
  ApiResponse,
  ApiAuthData,
} from "../types/auth.types";

// ── Normalize raw API response → AuthResponse ──────────────
function normalizeAuthResponse(raw: ApiResponse<ApiAuthData>): AuthResponse {
  const data = raw.data;

  return {
    accessToken: data.accessToken ?? "",
    refreshToken: data.refreshToken ?? "",
    user: {
      id: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: ROLE_MAP[data.role] ?? 1, // "Farmer" → 1
    },
  };
}

export const authService = {
  // ── Login ───────────────────────────────────────────────
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<ApiAuthData>>(
      "/api/auth/login",
      payload,
    );
    return normalizeAuthResponse(data);
  },

  // ── Register ────────────────────────────────────────────
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<ApiAuthData>>(
      "/api/auth/register",
      payload,
    );
    return normalizeAuthResponse(data);
  },

  // ── Refresh token ───────────────────────────────────────
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const { data } = await api.post<ApiResponse<{ accessToken: string }>>(
      "/api/auth/refresh-token",
      { refreshToken },
    );
    return { accessToken: data.data.accessToken };
  },

  // ── Change password ─────────────────────────────────────
  changePassword: async (
    payload: Omit<ChangePasswordPayload, "confirmPassword">,
  ): Promise<void> => {
    await api.put("/api/auth/change-password", payload);
  },

  // ── Revoke token (logout) ───────────────────────────────
  revokeToken: async (refreshToken: string): Promise<void> => {
    await api.post("/api/auth/revoke-token", { refreshToken });
  },
};
