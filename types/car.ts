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
  thumbnail: string;
  brand: string;
}

export interface AddVehiclePayload {
  customerId: number;
  brand: string;
  thumbnail: string;
  model: string;
  color: string;
  licensePlate: string;
}

export interface UpdateVehiclePayload {
  carId: number;
  brand: string;
  thumbnail: string;
  model: string;
  color: string;
  licensePlate: string;
}