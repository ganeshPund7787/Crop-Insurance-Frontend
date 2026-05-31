import api from "../lib/axios";
import type {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  ChangePasswordPayload,
} from "../types/auth.types";

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/api/auth/login", payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(
      "/api/auth/register",
      payload,
    );
    return data;
  },

  refreshToken: async (refreshToken: string) => {
    const { data } = await api.post("/api/auth/refresh-token", {
      refreshToken,
    });
    return data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await api.put("/api/auth/change-password", payload);
  },

  revokeToken: async (refreshToken: string): Promise<void> => {
    await api.post("/api/auth/revoke-token", { refreshToken });
  },
};
