// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "CropShield";
// export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "1.0.0";

// export const ROLES = {
//   FARMER: "Farmer",
//   ADMIN: "Admin",
// } as const;

// export const TOKEN_KEYS = {
//   ACCESS: "accessToken",
//   REFRESH: "refreshToken",
// } as const;

// export const ROUTES = {
//   LOGIN: "/login",
//   REGISTER: "/register",
//   FARMER_DASHBOARD: "/dashboard",
//   FARMER_PROFILE: "/dashboard/profile",
//   FARMER_ADD_FARM: "/dashboard/add-farm",
//   FARMER_CHANGE_PASSWORD: "/dashboard/change-password",
//   ADMIN_DASHBOARD: "/admin",
//   ADMIN_FARMERS: "/admin/farmers",
//   ADMIN_CHANGE_PASSWORD: "/admin/change-password",
// } as const;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "CropShield";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "1.0.0";

export const ROLES = {
  FARMER: "Farmer",
  ADMIN: "Admin",
  INSURANCE_AGENT: "InsuranceAgent", // ← ADD THIS
} as const;

export const TOKEN_KEYS = {
  ACCESS: "accessToken",
  REFRESH: "refreshToken",
} as const;

export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",

  // Farmer
  FARMER_DASHBOARD: "/dashboard",
  FARMER_PROFILE: "/dashboard/profile",
  FARMER_ADD_FARM: "/dashboard/add-farm",
  FARMER_CHANGE_PASSWORD: "/dashboard/change-password",
  FARMER_CLAIMS: "/dashboard/farms/:id/crops",
  FARMER_NEW_CLAIM: "/dashboard/claims/new",
  FARMER_FARM_CROPS: "/dashboard/farms/:id/crops",

  // Admin
  ADMIN_DASHBOARD: "/admin",
  ADMIN_FARMERS: "/admin/farmers",
  ADMIN_CHANGE_PASSWORD: "/admin/change-password",
  ADMIN_AI_ANALYSIS: "/admin/ai",

  // Agent
  AGENT_DASHBOARD: "/agent",
  AGENT_PROFILE: "/agent/profile",
  AGENT_CLAIMS: "/agent/claims",
  AGENT_CLAIM_DETAIL: "/agent/claims/:id",
  AGENT_INSPECTIONS: "/agent/inspections",
  AGENT_FARMERS: "/agent/farmers",
  AGENT_CHANGE_PASSWORD: "/agent/change-password",
} as const;

export const DAMAGE_TYPES: Record<number, string> = {
  0: "Flood",
  1: "Drought",
  2: "Pest / Disease",
  3: "Fire",
  4: "Hail",
  5: "Storm / Cyclone",
  6: "Other",
};
