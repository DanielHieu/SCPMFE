export interface ParkingLot {
  parkingLotId: number;
  ownerId?: 1;
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

export interface UpdateParkingLotPayload {
  parkingLotId: number;
  pricePerHour: number;
  pricePerDay: number;
  pricePerMonth: number;
  address?: string;
  long?: number;
  lat?: number;
}

export interface AddParkingLotPayload {
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
