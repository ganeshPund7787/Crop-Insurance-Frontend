export interface FarmerListItem {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  state?: string;
  district?: string;
  role: string;
  farmsCount?: number;
  createdAt?: string;
  status?: "Active" | "Inactive";
}

export interface AdminStats {
  totalFarmers: number;
  totalFarms: number;
  activePolicies: number;
  totalClaimsPaid: number;
}

export interface FarmersListResponse {
  success: boolean;
  message: string;
  data: FarmerListItem[];
  errors: string[];
}
