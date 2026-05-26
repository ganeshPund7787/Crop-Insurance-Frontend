export interface User {
  userId: string;
  fullName: string;
  email: string;
  role: string; // "Farmer" | "Admin" — string not number
  accessTokenExpiresAtUtc?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  success: boolean;
  message: string;
  data: {
    userId: string;
    fullName: string;
    email: string;
    role: string;
    accessTokenExpiresAtUtc: string;
  };
  errors: string[];
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
  };
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
