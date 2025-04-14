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

export interface ParkingLotRevenue{
  parkingLotName: string;
  totalRevenue: number;
}

export interface WailkinDateRevenue{
  revenueDate: string;
  totalRevenue: number;
  walkinDailyRevenueDetails: Array<ParkingLotRevenue>
}

export interface MonthlyRevenues{
  month: number;
  parkingLotRevenues: Array<ParkingLotRevenue>;
}

export interface QuarterlyRevenues{
  quarter: number;
  parkingLotRevenues: Array<ParkingLotRevenue>;
}

export interface YearlyRevenues{
  year: number;
  parkingLotRevenues: Array<ParkingLotRevenue>;
}

export interface ParkingLotMonthlyRevenue{
  month: number;
  revenue: number;
  parkingLotName: string;
}



