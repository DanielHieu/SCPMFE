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
  revenue: number;
}

export interface WailkinDateRevenue{
  revenueDate: string;
  totalRevenue: number;
  walkinDailyRevenueDetails: Array<ParkingLotRevenue>
}

export interface MonthlyRevenues{
  month: number;
  name?: string; // Tên tháng để hiển thị trên biểu đồ
  parkingLotRevenues: Array<ParkingLotRevenue>;
}

export interface QuarterlyRevenues{
  quarter: number;
  name?: string; // Tên quý để hiển thị trên biểu đồ
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

export interface DashboardSummary {
  totalLots: number;
  totalRevenueYTD: number;
  overallOccupancyPercent: number;
  fullLotsCount: number;
  lastUpdated: string; // ISO 8601 format preferably
}

export type ParkingLotStatus = "Open" | "Full" | "Closed";

export interface ParkingLotSummary {
  id: number | string; // Unique identifier for linking
  name: string;
  location: string;
  totalSlots: number;
  occupiedSlots: number;
  revenueYTD: number;
  status: ParkingLotStatus;
  lastUpdated: string; // Optional: per-lot update time
  // occupancyTrend?: number[]; // Optional for sparkline
}

// Add to existing WailkinDateRevenue if necessary, or keep separate
export interface TotalMonthlyRevenue {
  month: number;
  totalRevenue: number;
  name?: string; // Added by frontend for charting
}

// Ensure ParkingLotRevenue used by charts has needed fields
export interface ParkingLotRevenue {
  parkingLotName: string;
  revenue: number;
  totalRevenue: number; // Ensure this exists if used
}

// Ensure MonthlyRevenues/QuarterlyRevenues use the correct ParkingLotRevenue
export interface MonthlyRevenues {
  month: number;
  name?: string; // Tên tháng để hiển thị trên biểu đồ
  parkingLotRevenues: Array<ParkingLotRevenue>;
}

export interface QuarterlyRevenues {
  quarter: number;
  name?: string; // Tên quý để hiển thị trên biểu đồ
  parkingLotRevenues: Array<ParkingLotRevenue>;
}

// Add new type for monthly revenue breakdown
export interface MonthlyRevenueByType {
  month: number;
  contractRevenue: number;
  walkinRevenue: number;
}

export interface SummaryReportResponse {
  totalCustomers: number;
  totalStaffs: number;
  totalContracts: number;
  totalWalkins: number;
  totalAvailableCustomers: number;
  totalActiveContracts: number;

  totalRevenueInYear: number;
  totalRevenueInMonth: number;
  totalRevenueInWeek: number;
  totalRevenueInDay: number;
}

export interface SummaryRevenueReportResponse {
  totalRevenueInYear: number;
  contractRevenueInYear: number;
  walkinRevenueInYear: number;

  totalRevenueInMonth: number;
  contractRevenueInMonth: number;
  walkinRevenueInMonth: number;

  totalRevenueInWeek: number;
  contractRevenueInWeek: number;
  walkinRevenueInWeek: number;

  totalRevenueInDay: number;
  contractRevenueInDay: number;
  walkinRevenueInDay: number;
}
