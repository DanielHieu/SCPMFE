export interface Car {
  carId: number;
  customerId: number;
  model: string;
  color: string;
  licensePlate: string;
  registeredDate: string;
  status: boolean;
  contracts?: string[];
  customer?: string;
}

export interface AddVehiclePayload {
  customerId: number;
  model?: string;
  color?: string;
  licensePlate?: string;
  registedDate: string;
  status: boolean;
}

export interface UpdateVehiclePayload {
  carId: number;
  customerId: number;
  model?: string;
  color?: string;
  licensePlate?: string;
  registedDate: string;
  status: boolean;
}
