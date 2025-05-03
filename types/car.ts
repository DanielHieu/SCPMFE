import { ParkingSpaceStatus } from "./parking-space";

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
  entrance?: CarEntrance;
}

export interface CarEntrance {
  entranceDate: string;
  entranceTime: string;
  parkingSpaceName: string;
  floorName: string;
  areaName: string;
  parkingLotName: string;
  status: ParkingSpaceStatus;
}