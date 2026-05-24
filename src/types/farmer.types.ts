export interface Farm {
  id: string;
  name: string;
  location: string;
  area: number;
  cropType: string;
  season?: string;
  soilType?: string;
  createdAt?: string;
}

export interface FarmerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  farms: Farm[];
  createdAt: string;
}

export interface AddFarmPayload {
  name: string;
  location: string;
  area: number;
  cropType: string;
  season?: string;
  soilType?: string;
}
