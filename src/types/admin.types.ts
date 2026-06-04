export interface FarmerListItem {
  id: string; // ← was userId
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean; // ← NEW
  emailVerified: boolean; // ← NEW
  lastLoginAtUtc?: string | null; // ← NEW
  farmsCount: number;
  createdAtUtc: string; // ← was createdAt
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
