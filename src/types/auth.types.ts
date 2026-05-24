export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: number; // we convert string → number internally
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ── Raw API response shape from ASP.NET ───────────────────
export interface ApiAuthData {
  userId: string;
  fullName: string;
  email: string;
  role: string; // "Farmer" | "Admin" | "InsuranceAgent"
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAtUtc?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  errors: string[];
  data: T;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  aadhaarNumber: string;
  state: string;
  district: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
