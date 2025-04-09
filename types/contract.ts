import { PaymentContract } from "./payment";

export interface Contract {
  contractId: number;
  parkingSpaceId: number;
  parkingSpaceName: string;
  parkingLotName: string;
  parkingLotAddress: string;
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
  paymentContract: PaymentContract;
  createdDate: string;
  updatedDate: string;
  startDateString: string;
  endDateString: string;
}

export enum ContractStatus {
  Active = "Active",
  Expired = "Expired",
  Inactive = "Inactive"
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