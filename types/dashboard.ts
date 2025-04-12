export interface DashboardStats {
  totalEmployees: number;
  totalCustomers: number;
  totalContracts: number;
  totalParkingLots: number;
  totalRevenue: number;
  activeContracts: number;
  availableSpots: number;
  averageOccupancy: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities?: any[]; // TODO: Define activity type
  upcomingEvents?: any[]; // TODO: Define event type
} 