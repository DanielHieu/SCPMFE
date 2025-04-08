// NOTE: --------- Floor --------------------
export interface Floor {
  floorId: number;
  areaId: number;
  floorName?: string;
  numberEmptyParkingSpace?: number;
  numberUsedParkingSpace?: number;
  totalParkingSpace?: number;
  status: number;
  area?: string | null;
  parkingSpaces?: number[];
}

export interface AddFloorPayload {
  areaId: number;
  floorName?: string | null;
  status: number;
}

export interface UpdateFloorPayload {
  floorId: number;
  floorName?: string | null;
  status: number;
}
