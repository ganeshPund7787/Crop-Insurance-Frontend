export interface Farm {
  farmId: string;
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
