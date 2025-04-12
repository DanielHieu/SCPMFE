import { DashboardData } from "@/types/dashboard";

// TODO: Replace with actual API call
export async function fetchDashboardData(): Promise<DashboardData> {
  // Mock data - replace with actual API call
  return {
    stats: {
      totalEmployees: 12,
      totalCustomers: 150,
      totalContracts: 45,
      totalParkingLots: 8,
      totalRevenue: 25000000,
      activeContracts: 35,
      availableSpots: 120,
      averageOccupancy: 75
    }
  };
} 