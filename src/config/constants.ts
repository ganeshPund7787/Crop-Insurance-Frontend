export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "CropShield";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "1.0.0";

export const ROLES = {
  ADMIN: 0,
  FARMER: 1,
  INSURANCE_AGENT: 2,
} as const;

// Maps ASP.NET string role → number
export const ROLE_MAP: Record<string, number> = {
  Admin: ROLES.ADMIN,
  Farmer: ROLES.FARMER,
  InsuranceAgent: ROLES.INSURANCE_AGENT,
};

export const TOKEN_KEYS = {
  ACCESS: "accessToken",
  REFRESH: "refreshToken",
} as const;

export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FARMER_DASHBOARD: "/dashboard",
  FARMER_PROFILE: "/dashboard/profile",
  FARMER_ADD_FARM: "/dashboard/add-farm",
  FARMER_CHANGE_PASSWORD: "/dashboard/change-password",
  ADMIN_DASHBOARD: "/admin",
  ADMIN_FARMERS: "/admin/farmers",
  ADMIN_CHANGE_PASSWORD: "/admin/change-password",
} as const;
