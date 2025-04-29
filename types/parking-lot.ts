export interface ParkingLot {
  parkingLotId: number;
  parkingLotName: string;
  pricePerHour: number;
  pricePerDay: number;
  pricePerMonth: number;
  address: string;
  long: number;
  lat: number;
  createdDate: string;
  updatedDate: string;
  areas: [];
  owner: null;
  parkingLotPriceHistories: [];
}

export interface ParkingLotSummaries {
  totalAreas: number;
  totalParkingSpaces: number;
  totalAvailableParkingSpaces: number;
  totalRevenue: number;
}

export interface UpdateParkingLotPayload {
  parkingLotId: number;
  parkingLotName: string;
  pricePerHour: number;
  pricePerDay: number;
  pricePerMonth: number;
  address?: string;
  long?: number;
  lat?: number;
}

export interface AddParkingLotPayload {
  parkingLotName: string;
  ownerId: number;
  pricePerHour: number;
  pricePerDay: number;
  pricePerMonth: number;
  address?: string;
  long?: number;
  lat?: number;
}

// POST /api/ParkingLot/Search
export interface SearchParkingLotPayload {
  keyword?: string | null;
}
