// NOTE: --------- Floor --------------------
export interface Floor {
  floorId: number;
  areaId: number;
  floorName?: string;
  totalParkingSpaces?: number;
  status: number;
  area?: string | null;
  parkingSpaces?: number[];
}

export interface AddFloorPayload {
  areaId: number;
  floorName?: string | null;
}

export interface UpdateFloorPayload {
  floorId: number;
  floorName?: string | null;
}
