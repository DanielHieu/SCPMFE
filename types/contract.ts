export interface Contract {
  contractId: number;
  parkingSpaceId: number;
  parkingSpaceName: string;
  parkingLotName: string;
  parkingLotAddress: string;
  areaName: string;
  floorName: string;
  startDate: string;
  endDate: string;
  status: string;
  note?: string;
  car: {
    carId: number;
    licensePlate: string;
    brand: string | null;
    model: string;
    color: string;
    customerName: string;
    customerId: string;
  };
  createdDateString: string;
  updatedDate: string;
  startDateString: string;
  endDateString: string;
  needToProcess: boolean;
}

export enum ContractStatus {
  Active = "Active",
  Expired = "Expired",
  Inactive = "Inactive",
  PendingActivation = "PendingActivation"
}

export interface AddContractPayload {
  carId: number;
  parkingSpaceId: number;
  startDate: string;
  endDate: string;
  status: number;
  createdDate?: string;
  updatedDate?: string;
  note?: string;
}