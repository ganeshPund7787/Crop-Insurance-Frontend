// ── Claims ─────────────────────────────────────────────────
export type FarmerClaimStatus =
  | "Submitted"
  | "UnderReview"
  | "Assigned"
  | "UnderInspection"
  | "Approved"
  | "Rejected"
  | "Closed";

export interface FarmerClaim {
  id: string;
  claimNumber: string;
  status: FarmerClaimStatus;
  statusDescription: string;
  estimatedLossAmount: number;
  approvedAmount?: number | null;
  rejectionReason?: string | null;
  reviewedAtUtc?: string | null;
  hasInspection: boolean;
  nextStep: string;
}

export interface FarmerClaimsListResponse {
  success: boolean;
  message: string;
  data: FarmerClaim[];
  errors: string[];
}

export interface FarmerClaimDetailResponse {
  success: boolean;
  message: string;
  data: FarmerClaim;
  errors: string[];
}

export interface SubmitClaimPayload {
  cropId: string;
  damageType: number;
  damageDescription: string;
  estimatedLossAmount: number;
  incidentDate: string;
}

export interface Farm {
  farmId: string;
  id: string;
  farmName: string;
  location: string;
  areaInAcres: number;
  cropType: string;
  season?: string;
  soilType?: string;
  state?: string;
  district?: string;
  createdAt?: string;
}

export interface FarmerProfile {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  aadhaarNumber?: string;
  state?: string;
  district?: string;
  role: string;
  createdAt?: string;
  farms?: Farm[];
}

export interface AddFarmPayload {
  farmName: string;
  location: string;
  areaInAcres: number;
  cropType: string;
  season?: string;
  soilType?: string;
  state?: string;
  district?: string;
}

export interface FarmerProfileResponse {
  success: boolean;
  message: string;
  data: FarmerProfile;
  errors: string[];
}

// Crops
export interface CropType {
  id: string;
  expectedHarvestDate: Date;
  cropName: string;
  season: string;
  status: string;
  expectedYieldTons: number;
  sowingDate: Date;
}

export interface AddCropPayload {
  cropName: string;
  season: string;
  expectedYieldTons: number;
  sowingDate: string; // ✅ was Date, caused serialization issues
  expectedHarvestDate: string; // ✅ was Date
}

export interface CropsListResponse {
  success: boolean;
  message: string;
  data: CropType[];
  errors: string[];
}
