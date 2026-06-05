export interface FarmerListItem {
  id: string; // ← was userId
  fullName: string;
  email: string;
  phoneNumber?: string;
  district: string;
  userId: string;
  state: string;
  role: string;
  isActive: boolean; // ← NEW
  emailVerified: boolean; // ← NEW
  lastLoginAtUtc?: string | null; // ← NEW
  farmsCount: number;
  createdAtUtc: string; // ← was createdAt
  createdAt: string;
  // Note: state, district, farmsCount not returned by this API
}

export interface FarmersListResponse {
  success: boolean;
  message: string;
  data: FarmerListItem[];
  errors: string[];
}
export interface AdminStats {
  totalFarmers: number;
  totalFarms: number;
  activePolicies: number;
  totalClaimsPaid: number;
}

export interface AgentListItem {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  agentCode?: string;
  licenseNumber?: string;
  assignedDistrict?: string;
  isVerified: boolean;
  isActive?: boolean;
  totalClaimsHandled: number;
  createdAtUtc?: string;
  lastLoginAtUtc?: string | null;
}

export interface AgentsListResponse {
  success: boolean;
  message: string;
  data: AgentListItem[];
  errors: string[];
}
