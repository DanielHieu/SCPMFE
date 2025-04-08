export interface Area {
  areaId: number;
  parkingLotId: number;
  areaName?: string;
  totalFloor: number;
  status: number;
  rentalType: RentalType;
  floors?: string[];
  parkingLot?: null;
}

export interface UpdateAreaPayload {
  areaId: number;
  areaName: string | null;
}

export interface AddAreaPayload {
  parkingLotId: number;
  areaName: string | null;
  rentalType?: RentalType; // Needs mapping if used
}

export enum RentalType {
  Walkin = "Walkin",
  Contract = 'Contract',
}