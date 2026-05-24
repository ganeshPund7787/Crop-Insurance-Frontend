export interface FarmerListItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  farmsCount: number;
  createdAt: string;
  status?: "active" | "inactive";
}
